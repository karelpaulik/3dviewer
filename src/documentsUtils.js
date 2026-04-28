// documentsUtils.js
import { Editor, Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';

// ── TextIndent extension (per-paragraph first-line indent) ────────────────────
const TextIndent = Extension.create({
    name: 'textIndent',
    addGlobalAttributes() {
        return [{
            types: ['paragraph'],
            attributes: {
                textIndent: {
                    default: null,
                    parseHTML: el => el.style.textIndent || null,
                    renderHTML: attrs => {
                        if (!attrs.textIndent) return {};
                        return { style: `text-indent: ${attrs.textIndent}` };
                    },
                },
            },
        }];
    },
    addCommands() {
        return {
            setTextIndent: (value) => ({ commands }) => {
                return commands.updateAttributes('paragraph', { textIndent: value || null });
            },
        };
    },
});

// ── Font options ──────────────────────────────────────────────────────────────

const _FONT_OPTIONS = [
    { label: 'Arial',           value: 'Arial, sans-serif' },
    { label: 'Verdana',         value: 'Verdana, Geneva, sans-serif' },
    { label: 'Trebuchet MS',    value: '"Trebuchet MS", sans-serif' },
    { label: 'Georgia',         value: 'Georgia, serif' },
    { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
    { label: 'Courier New',     value: '"Courier New", Courier, monospace' },
];
const _DEFAULT_FONT = 'Arial, sans-serif';
const _LINE_HEIGHT_OPTIONS = ['1.2', '1.4', '1.6', '1.8', '2.0', '2.4'];
const _DEFAULT_LINE_HEIGHT = '1.4';
const _PARA_SPACING_OPTIONS = [
    { label: '0',    value: '0' },
    { label: '4px',  value: '4px' },
    { label: '8px',  value: '8px' },
    { label: '12px', value: '12px' },
    { label: '16px', value: '16px' },
    { label: '24px', value: '24px' },
];
const _DEFAULT_PARA_SPACING = '8px';

// ── State ─────────────────────────────────────────────────────────────────────

let documentsStore = [];   // [{ id, title, content, createdAt, font }]
let _guiRef = null;        // lil-gui folder reference (set by initDocumentsGui)
let _editor = null;        // TipTap editor instance
let _overlayEl = null;     // editor overlay DOM element
let _bubbleMenuEl = null;  // bubble menu DOM element
let _currentDocId = null;  // id of document currently open in editor
let _isEditMode = false;   // true = editor mode, false = read-only mode
let _bgOpacity = 1.0;      // editor content background opacity (0 = transparent, 1 = opaque)
let _nav3d = false;        // true = pointer-events off on overlay → 3D navigation active

// ── Public API ────────────────────────────────────────────────────────────────

export function getDocumentsStore() {
    return documentsStore;
}

/** Returns true when the doc overlay is visible but 3D navigation is NOT active.
 *  In that state hover-highlight and selection should be suppressed. */
export function isDocOverlayBlockingInput() {
    return _overlayEl !== null && _overlayEl.style.display !== 'none' && !_nav3d;
}

// Call before export to flush any unsaved editor content
export function flushDocumentEdits() {
    if (_editor && _currentDocId && _isEditMode) {
        _saveCurrentDocument();
    }
}

export function importDocumentsFromGltfScene(gltfScene) {
    // GLTFLoader wraps the exported group as a child of gltf.scene,
    // so documents may be on gltfScene itself or on a child node.
    // Traverse to find the first node that carries userData.documents.
    let docs = null;
    gltfScene.traverse(node => {
        if (!docs && Array.isArray(node.userData.documents) && node.userData.documents.length > 0) {
            docs = node.userData.documents;
        }
    });
    if (!docs) return;
    docs.forEach(doc => {
        if (!documentsStore.find(d => d.id === doc.id)) {
            documentsStore.push(doc);
        }
    });
    refreshDocumentsGui();
}

export function initDocumentsGui(gui) {
    _guiRef = gui;
    _buildEditorOverlay();
    refreshDocumentsGui();
}

export function refreshDocumentsGui() {
    if (!_guiRef) return;

    // Remove all existing controllers except the "New" button (first)
    const controllers = [..._guiRef.controllers];
    controllers.forEach(c => c.destroy());

    // Destroy and re-add children folders (per-document) — none in this design
    const folders = [..._guiRef.folders];
    folders.forEach(f => f.destroy());

    // "New document" button
    _guiRef.add({ fn: _newDocument }, 'fn').name('+ New document');

    // One button per document
    documentsStore.forEach(doc => {
        _guiRef.add({ fn: () => openDocumentViewer(doc.id) }, 'fn').name(doc.title || '(no title)');
    });
}

export function openDocumentViewer(id) {
    const doc = documentsStore.find(d => d.id === id);
    if (!doc) return;
    _currentDocId = id;
    _isEditMode = false;
    _showOverlay(doc, false);
}

export function openDocumentEditor(id) {
    const doc = documentsStore.find(d => d.id === id);
    if (!doc) return;
    _currentDocId = id;
    _isEditMode = true;
    _showOverlay(doc, true);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function _newDocument() {
    const doc = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: 'New document',
        content: '<p></p>',
        createdAt: new Date().toISOString(),
        font: _DEFAULT_FONT,
        lineHeight: _DEFAULT_LINE_HEIGHT,
        paraSpacing: _DEFAULT_PARA_SPACING,
    };
    documentsStore.push(doc);
    refreshDocumentsGui();
    openDocumentEditor(doc.id);
}

function _showOverlay(doc, editMode) {
    if (!_overlayEl) _buildEditorOverlay();

    // Update title input
    const titleInput = _overlayEl.querySelector('.doc-title-input');
    titleInput.value = doc.title;
    titleInput.readOnly = !editMode;

    // Apply font
    const fontSelect = _overlayEl.querySelector('.doc-font-select');
    const fontValue = doc.font || _DEFAULT_FONT;
    fontSelect.value = fontValue;
    const editorContentEl = _overlayEl.querySelector('.doc-editor-content');
    editorContentEl.style.fontFamily = fontValue;

    // Apply line height
    const lineHeightSelect = _overlayEl.querySelector('.doc-line-height-select');
    const lineHeightValue = doc.lineHeight || _DEFAULT_LINE_HEIGHT;
    lineHeightSelect.value = lineHeightValue;
    editorContentEl.style.lineHeight = lineHeightValue;

    // Apply paragraph spacing
    const paraSpacingSelect = _overlayEl.querySelector('.doc-para-spacing-select');
    const paraSpacingValue = doc.paraSpacing || _DEFAULT_PARA_SPACING;
    paraSpacingSelect.value = paraSpacingValue;
    editorContentEl.style.setProperty('--doc-para-spacing', paraSpacingValue);

    // Update header buttons
    const editBtn = _overlayEl.querySelector('.doc-btn-edit');
    const saveBtn = _overlayEl.querySelector('.doc-btn-save');
    const toolbar = _overlayEl.querySelector('.doc-editor-toolbar');

    if (editMode) {
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        toolbar.style.display = 'flex';
    } else {
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
        toolbar.style.display = 'none';
    }

    // Init or update TipTap editor
    const editorEl = _overlayEl.querySelector('.doc-editor-content');
    if (_editor) {
        _editor.destroy();
        _editor = null;
    }
    // Defer creation by one frame so the destroyed editor's async ops can settle
    const docContent = doc.content;
    const readOnly = !editMode;
    requestAnimationFrame(() => {
        if (_overlayEl && _overlayEl.style.display !== 'none') {
            _editor = _createEditor(editorEl, docContent, readOnly);
        }
    });

    _overlayEl.style.display = 'flex';
}

function _createEditor(el, content, readOnly) {
    if (!_bubbleMenuEl) _buildBubbleMenu();

    const editor = new Editor({
        element: el,
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Image.configure({ inline: false, allowBase64: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextIndent,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content,
        editable: !readOnly,
    });

    editor.on('update', () => {
        _updateToolbarState();
        _updateBubbleMenuState();
    });
    editor.on('selectionUpdate', () => {
        _updateToolbarState();
        _updateBubbleMenuPosition();
    });
    editor.on('blur', () => {
        // Small delay — allow mousedown on bubble menu to fire first.
        // Do not hide if focus moved to an element inside the bubble menu (e.g. indent select).
        setTimeout(() => {
            if (_bubbleMenuEl && !_bubbleMenuEl.contains(document.activeElement)) {
                _bubbleMenuEl.style.display = 'none';
            }
        }, 150);
    });

    return editor;
}

function _buildBubbleMenu() {
    const menu = document.createElement('div');
    menu.className = 'doc-bubble-menu';

    const bubbleDefs = [
        { action: 'bold',      label: 'B',  title: 'Bold' },
        { action: 'italic',    label: 'I',  title: 'Italic' },
        { action: 'underline', label: 'U',  title: 'Underline' },
        { action: 'strike',    label: 'S̶', title: 'Strikethrough' },
        { sep: true },
        { action: 'h1',        label: 'H1', title: 'Heading 1' },
        { action: 'h2',        label: 'H2', title: 'Heading 2' },
        { sep: true },
        { action: 'alignLeft',   label: '⬛▭▭', title: 'Align left' },
        { action: 'alignCenter', label: '▭⬛▭', title: 'Align center' },
        { action: 'alignRight',  label: '▭▭⬛', title: 'Align right' },
        { sep: true },
        { type: 'indent-select' },
    ];

    bubbleDefs.forEach(def => {
        if (def.sep) {
            const sep = document.createElement('span');
            sep.className = 'doc-bubble-sep';
            menu.appendChild(sep);
            return;
        }
        if (def.type === 'indent-select') {
            const label = document.createElement('span');
            label.className = 'doc-bubble-indent-label';
            label.textContent = '↵';
            label.title = 'First line indent';
            const sel = document.createElement('select');
            sel.className = 'doc-bubble-select doc-bubble-indent-select';
            sel.title = 'First line indent';
            [{ label: '0', value: '0' }, { label: '1em', value: '1em' }, { label: '2em', value: '2em' }, { label: '3em', value: '3em' }]
                .forEach(opt => {
                    const o = document.createElement('option');
                    o.value = opt.value;
                    o.textContent = opt.label;
                    sel.appendChild(o);
                });
            sel.addEventListener('mousedown', e => e.stopPropagation());
            sel.addEventListener('change', () => {
                if (_editor) {
                    const val = sel.value === '0' ? null : sel.value;
                    _editor.commands.setTextIndent(val);
                    _editor.view.focus();
                }
            });
            menu.appendChild(label);
            menu.appendChild(sel);
            return;
        }
        const btn = document.createElement('button');
        btn.className = 'doc-bubble-btn';
        btn.dataset.action = def.action;
        btn.textContent = def.label;
        btn.title = def.title;
        btn.type = 'button';
        btn.addEventListener('mousedown', e => {
            e.preventDefault();
            _handleToolbarClick(def.action);
        });
        menu.appendChild(btn);
    });

    document.body.appendChild(menu);
    _bubbleMenuEl = menu;
}

function _updateBubbleMenuPosition() {
    if (!_editor || !_bubbleMenuEl) return;
    if (!_editor.isEditable) { _bubbleMenuEl.style.display = 'none'; return; }

    const { from, to, empty } = _editor.state.selection;
    if (empty) { _bubbleMenuEl.style.display = 'none'; return; }

    const view = _editor.view;
    const startCoords = view.coordsAtPos(from);
    const endCoords   = view.coordsAtPos(to);

    _bubbleMenuEl.style.display = 'flex';
    // Measure after making visible
    const menuRect = _bubbleMenuEl.getBoundingClientRect();

    const midX = (startCoords.left + endCoords.left) / 2;
    const topY = Math.min(startCoords.top, endCoords.top);

    let left = midX - menuRect.width / 2;
    let top  = topY - menuRect.height - 8;

    // Clamp inside viewport
    const vw = window.innerWidth;
    if (left < 4) left = 4;
    if (left + menuRect.width > vw - 4) left = vw - menuRect.width - 4;
    if (top < 4) top = Math.min(startCoords.top, endCoords.top) + 28;

    _bubbleMenuEl.style.left = left + 'px';
    _bubbleMenuEl.style.top  = top  + 'px';

    _updateBubbleMenuState();
}

function _updateBubbleMenuState() {
    if (!_editor || !_bubbleMenuEl) return;
    _bubbleMenuEl.querySelectorAll('[data-action]').forEach(btn => {
        const action = btn.dataset.action;
        let active = false;
        if (action === 'bold')        active = _editor.isActive('bold');
        else if (action === 'italic') active = _editor.isActive('italic');
        else if (action === 'underline') active = _editor.isActive('underline');
        else if (action === 'strike')  active = _editor.isActive('strike');
        else if (action === 'h1')      active = _editor.isActive('heading', { level: 1 });
        else if (action === 'h2')      active = _editor.isActive('heading', { level: 2 });
        else if (action === 'alignLeft')   active = _editor.isActive({ textAlign: 'left' });
        else if (action === 'alignCenter') active = _editor.isActive({ textAlign: 'center' });
        else if (action === 'alignRight')  active = _editor.isActive({ textAlign: 'right' });
        btn.classList.toggle('active', active);
    });
    // Sync indent select
    const indentSel = _bubbleMenuEl.querySelector('.doc-bubble-indent-select');
    if (indentSel) {
        const attrs = _editor.getAttributes('paragraph');
        indentSel.value = attrs.textIndent || '0';
    }
}

function _saveCurrentDocument() {
    if (!_editor || !_currentDocId) return;
    const doc = documentsStore.find(d => d.id === _currentDocId);
    if (!doc) return;

    const titleInput = _overlayEl.querySelector('.doc-title-input');
    doc.title = titleInput.value.trim() || 'Untitled';
    doc.content = _editor.getHTML();
    doc.font = (_overlayEl.querySelector('.doc-font-select') || {}).value || _DEFAULT_FONT;
    doc.lineHeight = (_overlayEl.querySelector('.doc-line-height-select') || {}).value || _DEFAULT_LINE_HEIGHT;
    doc.paraSpacing = (_overlayEl.querySelector('.doc-para-spacing-select') || {}).value || _DEFAULT_PARA_SPACING;

    refreshDocumentsGui();
}

function _closeOverlay() {
    // Auto-save if closing while in edit mode
    if (_isEditMode && _editor && _currentDocId) {
        _saveCurrentDocument();
    }
    if (_overlayEl) _overlayEl.style.display = 'none';
    if (_editor) {
        _editor.destroy();
        _editor = null;
    }
    _currentDocId = null;
    _isEditMode = false;
}

function _printDocument() {
    if (!_editor) return;
    const doc = _currentDocId ? documentsStore.find(d => d.id === _currentDocId) : null;
    const title = doc ? doc.title : 'Document';
    const content = _editor.getHTML();
    const fontFamily = (doc && doc.font) ? doc.font : _DEFAULT_FONT;
    const lineHeight = (doc && doc.lineHeight) ? doc.lineHeight : _DEFAULT_LINE_HEIGHT;
    const paraSpacing = (doc && doc.paraSpacing) ? doc.paraSpacing : _DEFAULT_PARA_SPACING;

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: A4; margin: 2cm; }
  body {
    font-family: ${fontFamily};
    font-size: 15px;
    line-height: ${lineHeight};
    color: #111;
    margin: 0;
    padding: 0;
  }
  h1 { font-size: 2em; margin: 0.6em 0 0.3em; }
  h2 { font-size: 1.5em; margin: 0.6em 0 0.3em; }
  h3 { font-size: 1.2em; margin: 0.6em 0 0.3em; }
  p  { margin: 0 0 ${paraSpacing}; }
  ul, ol { padding-left: 2em; margin: 0 0 0.8em; }
  blockquote {
    border-left: 4px solid #ccc;
    margin: 0.8em 0;
    padding: 0.2em 1em;
    color: #555;
  }
  img { max-width: 100%; height: auto; display: block; margin: 0.8em 0; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; table-layout: fixed; }
  td, th { border: 1px solid #ccc; padding: 6px 10px; vertical-align: top; box-sizing: border-box; }
  th { background: #f0f0f0; font-weight: 600; text-align: left; }
</style>
</head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
}

function _deleteCurrentDocument() {
    if (!_currentDocId) return;
    const doc = documentsStore.find(d => d.id === _currentDocId);
    const title = doc ? doc.title : 'this document';
    if (!confirm(`Delete "${title}"?`)) return;
    documentsStore = documentsStore.filter(d => d.id !== _currentDocId);
    _closeOverlay();
    refreshDocumentsGui();
}

// ── Toolbar state ─────────────────────────────────────────────────────────────

function _updateToolbarState() {
    if (!_editor || !_overlayEl) return;
    const toolbar = _overlayEl.querySelector('.doc-editor-toolbar');
    toolbar.querySelectorAll('[data-action]').forEach(btn => {
        const action = btn.dataset.action;
        let active = false;
        if (action === 'bold') active = _editor.isActive('bold');
        else if (action === 'italic') active = _editor.isActive('italic');
        else if (action === 'underline') active = _editor.isActive('underline');
        else if (action === 'strike') active = _editor.isActive('strike');
        else if (action === 'h1') active = _editor.isActive('heading', { level: 1 });
        else if (action === 'h2') active = _editor.isActive('heading', { level: 2 });
        else if (action === 'h3') active = _editor.isActive('heading', { level: 3 });
        else if (action === 'bulletList') active = _editor.isActive('bulletList');
        else if (action === 'orderedList') active = _editor.isActive('orderedList');
        else if (action === 'blockquote') active = _editor.isActive('blockquote');
        else if (action === 'alignLeft') active = _editor.isActive({ textAlign: 'left' });
        else if (action === 'alignCenter') active = _editor.isActive({ textAlign: 'center' });
        else if (action === 'alignRight') active = _editor.isActive({ textAlign: 'right' });
        btn.classList.toggle('active', active);
    });
}

// ── Toolbar click handler ─────────────────────────────────────────────────────

function _handleToolbarClick(action) {
    if (!_editor) return;
    switch (action) {
        case 'bold':        _editor.chain().focus().toggleBold().run(); break;
        case 'italic':      _editor.chain().focus().toggleItalic().run(); break;
        case 'underline':   _editor.chain().focus().toggleUnderline().run(); break;
        case 'strike':      _editor.chain().focus().toggleStrike().run(); break;
        case 'h1':          _editor.chain().focus().toggleHeading({ level: 1 }).run(); break;
        case 'h2':          _editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
        case 'h3':          _editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
        case 'bulletList':  _editor.chain().focus().toggleBulletList().run(); break;
        case 'orderedList': _editor.chain().focus().toggleOrderedList().run(); break;
        case 'blockquote':  _editor.chain().focus().toggleBlockquote().run(); break;
        case 'alignLeft':   _editor.chain().focus().setTextAlign('left').run(); break;
        case 'alignCenter': _editor.chain().focus().setTextAlign('center').run(); break;
        case 'alignRight':  _editor.chain().focus().setTextAlign('right').run(); break;
        case 'undo':        _editor.chain().focus().undo().run(); break;
        case 'redo':        _editor.chain().focus().redo().run(); break;
        case 'image':           _insertImageFromFile(); break;
        case 'tableInsert':     _insertTableDialog(); break;
        case 'tableAddRowAfter':  _editor.chain().focus().addRowAfter().run(); break;
        case 'tableAddColAfter':  _editor.chain().focus().addColumnAfter().run(); break;
        case 'tableDelRow':       _editor.chain().focus().deleteRow().run(); break;
        case 'tableDelCol':       _editor.chain().focus().deleteColumn().run(); break;
        case 'tableDelTable':     _editor.chain().focus().deleteTable().run(); break;
        case 'tableMergeCells':   _editor.chain().focus().mergeCells().run(); break;
        case 'tableSplitCell':    _editor.chain().focus().splitCell().run(); break;
    }
    _updateToolbarState();
}

function _insertTableDialog() {
    const input = window.prompt('Tabulka (řádky x sloupce):', '3x3');
    if (!input) return;
    const parts = input.toLowerCase().split(/[x×,; ]+/);
    const rows = Math.max(1, Math.min(20, parseInt(parts[0]) || 3));
    const cols = Math.max(1, Math.min(20, parseInt(parts[1]) || 3));
    _editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
}

function _insertImageFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            _editor.chain().focus().setImage({ src: e.target.result }).run();
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// ── Build overlay DOM ─────────────────────────────────────────────────────────

function _buildEditorOverlay() {
    if (_overlayEl) return;

    const overlay = document.createElement('div');
    overlay.className = 'doc-overlay';
    overlay.style.display = 'none';

    // Header
    const header = document.createElement('div');
    header.className = 'doc-header';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'doc-title-input';
    titleInput.placeholder = 'Document title';

    const btnEdit = document.createElement('button');
    btnEdit.className = 'doc-btn doc-btn-edit';
    btnEdit.textContent = '✎ Edit';
    btnEdit.addEventListener('click', () => {
        if (!_currentDocId) return;
        const titleInput = overlay.querySelector('.doc-title-input');
        titleInput.readOnly = false;
        btnEdit.style.display = 'none';
        btnSave.style.display = 'inline-block';
        overlay.querySelector('.doc-editor-toolbar').style.display = 'flex';
        if (_editor) _editor.setEditable(true);
        _isEditMode = true;
    });

    const btnSave = document.createElement('button');
    btnSave.className = 'doc-btn doc-btn-save';
    btnSave.textContent = '💾 Save';
    btnSave.addEventListener('click', () => {
        _saveCurrentDocument();
        // Switch to view mode
        const titleInput = overlay.querySelector('.doc-title-input');
        titleInput.readOnly = true;
        btnSave.style.display = 'none';
        btnEdit.style.display = 'inline-block';
        overlay.querySelector('.doc-editor-toolbar').style.display = 'none';
        if (_editor) _editor.setEditable(false);
        _isEditMode = false;
    });

    const btnPrint = document.createElement('button');
    btnPrint.className = 'doc-btn doc-btn-print';
    btnPrint.textContent = '🖨 Print';
    btnPrint.title = 'Print document';
    btnPrint.addEventListener('click', _printDocument);

    const btnDelete = document.createElement('button');
    btnDelete.className = 'doc-btn doc-btn-delete';
    btnDelete.textContent = '🗑 Delete';
    btnDelete.addEventListener('click', _deleteCurrentDocument);

    const btnClose = document.createElement('button');
    btnClose.className = 'doc-btn doc-btn-close';
    btnClose.textContent = '✕ Close';
    btnClose.addEventListener('click', _closeOverlay);

    const bgWrap = document.createElement('span');
    bgWrap.className = 'doc-bg-wrap';
    const bgLabel = document.createElement('span');
    bgLabel.className = 'doc-bg-label';
    bgLabel.textContent = 'BG';
    const bgSlider = document.createElement('input');
    bgSlider.type = 'range';
    bgSlider.min = '0';
    bgSlider.max = '1';
    bgSlider.step = '0.05';
    bgSlider.value = String(_bgOpacity);
    bgSlider.className = 'doc-bg-slider';
    bgSlider.title = 'Background opacity';
    bgSlider.addEventListener('input', () => {
        _bgOpacity = parseFloat(bgSlider.value);
        overlay.style.setProperty('--doc-bg-opacity', _bgOpacity);
    });
    bgWrap.appendChild(bgLabel);
    bgWrap.appendChild(bgSlider);

    const btnNav3d = document.createElement('button');
    btnNav3d.className = 'doc-btn doc-btn-nav3d' + (_nav3d ? ' active' : '');
    btnNav3d.textContent = '🖱 3D';
    btnNav3d.title = 'Toggle 3D navigation (disables editor interaction)';
    btnNav3d.addEventListener('click', () => {
        _nav3d = !_nav3d;
        overlay.style.pointerEvents = _nav3d ? 'none' : '';
        btnNav3d.classList.toggle('active', _nav3d);
        // Restore pointer events on the header itself so the button stays clickable
        header.style.pointerEvents = _nav3d ? 'auto' : '';
        btnNav3d.style.pointerEvents = 'auto';
    });

    header.appendChild(titleInput);
    header.appendChild(bgWrap);
    header.appendChild(btnNav3d);
    // Font selector
    const fontWrap = document.createElement('span');
    fontWrap.className = 'doc-font-wrap';
    const fontLabel = document.createElement('span');
    fontLabel.className = 'doc-font-label';
    fontLabel.textContent = 'Font';
    const fontSelect = document.createElement('select');
    fontSelect.className = 'doc-font-select';
    _FONT_OPTIONS.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        fontSelect.appendChild(option);
    });
    fontSelect.addEventListener('change', () => {
        const editorEl = overlay.querySelector('.doc-editor-content');
        editorEl.style.fontFamily = fontSelect.value;
        if (_currentDocId) {
            const d = documentsStore.find(x => x.id === _currentDocId);
            if (d) d.font = fontSelect.value;
        }
    });
    fontWrap.appendChild(fontLabel);
    fontWrap.appendChild(fontSelect);
    header.appendChild(fontWrap);

    // Line height selector
    const lineHeightWrap = document.createElement('span');
    lineHeightWrap.className = 'doc-font-wrap';
    const lineHeightLabel = document.createElement('span');
    lineHeightLabel.className = 'doc-font-label';
    lineHeightLabel.textContent = 'LH';
    const lineHeightSelect = document.createElement('select');
    lineHeightSelect.className = 'doc-font-select doc-line-height-select';
    lineHeightSelect.title = 'Line height';
    _LINE_HEIGHT_OPTIONS.forEach(val => {
        const option = document.createElement('option');
        option.value = val;
        option.textContent = val;
        lineHeightSelect.appendChild(option);
    });
    lineHeightSelect.addEventListener('change', () => {
        const editorEl = overlay.querySelector('.doc-editor-content');
        editorEl.style.lineHeight = lineHeightSelect.value;
        if (_currentDocId) {
            const d = documentsStore.find(x => x.id === _currentDocId);
            if (d) d.lineHeight = lineHeightSelect.value;
        }
    });
    lineHeightWrap.appendChild(lineHeightLabel);
    lineHeightWrap.appendChild(lineHeightSelect);
    header.appendChild(lineHeightWrap);

    // Paragraph spacing selector
    const paraSpacingWrap = document.createElement('span');
    paraSpacingWrap.className = 'doc-font-wrap';
    const paraSpacingLabel = document.createElement('span');
    paraSpacingLabel.className = 'doc-font-label';
    paraSpacingLabel.textContent = 'PS';
    const paraSpacingSelect = document.createElement('select');
    paraSpacingSelect.className = 'doc-font-select doc-para-spacing-select';
    paraSpacingSelect.title = 'Paragraph spacing';
    _PARA_SPACING_OPTIONS.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        paraSpacingSelect.appendChild(option);
    });
    paraSpacingSelect.addEventListener('change', () => {
        const editorEl = overlay.querySelector('.doc-editor-content');
        editorEl.style.setProperty('--doc-para-spacing', paraSpacingSelect.value);
        if (_currentDocId) {
            const d = documentsStore.find(x => x.id === _currentDocId);
            if (d) d.paraSpacing = paraSpacingSelect.value;
        }
    });
    paraSpacingWrap.appendChild(paraSpacingLabel);
    paraSpacingWrap.appendChild(paraSpacingSelect);
    header.appendChild(paraSpacingWrap);

    header.appendChild(btnEdit);
    header.appendChild(btnSave);
    header.appendChild(btnPrint);
    header.appendChild(btnDelete);
    header.appendChild(btnClose);

    // Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'doc-editor-toolbar';

    const toolbarDefs = [
        { action: 'undo',         label: '↩',  title: 'Undo' },
        { action: 'redo',         label: '↪',  title: 'Redo' },
        { sep: true },
        { action: 'bold',         label: 'B',  title: 'Bold' },
        { action: 'italic',       label: 'I',  title: 'Italic' },
        { action: 'underline',    label: 'U',  title: 'Underline' },
        { action: 'strike',       label: 'S̶',  title: 'Strikethrough' },
        { sep: true },
        { action: 'h1',           label: 'H1', title: 'Heading 1' },
        { action: 'h2',           label: 'H2', title: 'Heading 2' },
        { action: 'h3',           label: 'H3', title: 'Heading 3' },
        { sep: true },
        { action: 'bulletList',   label: '•—', title: 'Bullet list' },
        { action: 'orderedList',  label: '1—', title: 'Ordered list' },
        { action: 'blockquote',   label: '❝',  title: 'Blockquote' },
        { sep: true },
        { action: 'alignLeft',    label: '⬛▭▭', title: 'Align left' },
        { action: 'alignCenter',  label: '▭⬛▭', title: 'Align center' },
        { action: 'alignRight',   label: '▭▭⬛', title: 'Align right' },
        { sep: true },
        { action: 'image',          label: '🖼',  title: 'Insert image' },
        { sep: true },
        { action: 'tableInsert',      label: '⊞',   title: 'Insert table (e.g. 3x4)' },
        { action: 'tableAddRowAfter', label: '+row', title: 'Add row below' },
        { action: 'tableAddColAfter', label: '+col', title: 'Add column right' },
        { action: 'tableDelRow',      label: '-row', title: 'Delete row' },
        { action: 'tableDelCol',      label: '-col', title: 'Delete column' },
        { action: 'tableMergeCells',  label: '⊟',   title: 'Merge cells' },
        { action: 'tableSplitCell',   label: '⊞⊞',  title: 'Split cell' },
        { action: 'tableDelTable',    label: '✕⊞',  title: 'Delete table' },
    ];

    toolbarDefs.forEach(def => {
        if (def.sep) {
            const sep = document.createElement('span');
            sep.className = 'doc-toolbar-sep';
            toolbar.appendChild(sep);
            return;
        }
        const btn = document.createElement('button');
        btn.className = 'doc-toolbar-btn';
        btn.dataset.action = def.action;
        btn.textContent = def.label;
        btn.title = def.title;
        btn.type = 'button';
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            _handleToolbarClick(def.action);
        });
        toolbar.appendChild(btn);
    });

    // Editor content area
    const editorContent = document.createElement('div');
    editorContent.className = 'doc-editor-content';

    overlay.appendChild(header);
    overlay.appendChild(toolbar);
    overlay.appendChild(editorContent);

    overlay.style.setProperty('--doc-bg-opacity', _bgOpacity);
    document.body.appendChild(overlay);
    _overlayEl = overlay;
}
