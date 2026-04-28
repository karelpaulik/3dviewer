// documentsUtils.js
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';

// ── State ─────────────────────────────────────────────────────────────────────

let documentsStore = [];   // [{ id, title, content, createdAt }]
let _guiRef = null;        // lil-gui folder reference (set by initDocumentsGui)
let _editor = null;        // TipTap editor instance
let _overlayEl = null;     // editor overlay DOM element
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
    const editor = new Editor({
        element: el,
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Image.configure({ inline: false, allowBase64: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
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
    });
    editor.on('selectionUpdate', () => {
        _updateToolbarState();
    });

    return editor;
}

function _saveCurrentDocument() {
    if (!_editor || !_currentDocId) return;
    const doc = documentsStore.find(d => d.id === _currentDocId);
    if (!doc) return;

    const titleInput = _overlayEl.querySelector('.doc-title-input');
    doc.title = titleInput.value.trim() || 'Untitled';
    doc.content = _editor.getHTML();

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

    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: A4; margin: 2cm; }
  body {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 15px;
    line-height: 1.7;
    color: #111;
    margin: 0;
    padding: 0;
  }
  h1 { font-size: 2em; margin: 0.6em 0 0.3em; }
  h2 { font-size: 1.5em; margin: 0.6em 0 0.3em; }
  h3 { font-size: 1.2em; margin: 0.6em 0 0.3em; }
  p  { margin: 0 0 0.8em; }
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
