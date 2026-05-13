// documentsUtils.js
import { Editor, Extension, Mark } from '@tiptap/core';
import imageCompression from 'browser-image-compression';
import StarterKit from '@tiptap/starter-kit';
import ImageResize from 'tiptap-extension-resize-image';
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

// ── FontSize extension (inline font-size via TextStyle) ───────────────────────
const FontSize = Mark.create({
    name: 'fontSize',
    addOptions() { return { types: ['textStyle'] }; },
    addGlobalAttributes() {
        return [{
            types: this.options.types,
            attributes: {
                fontSize: {
                    default: null,
                    parseHTML: el => el.style.fontSize || null,
                    renderHTML: attrs => {
                        if (!attrs.fontSize) return {};
                        return { style: `font-size: ${attrs.fontSize}` };
                    },
                },
            },
        }];
    },
    addCommands() {
        return {
            setFontSize: (size) => ({ chain }) =>
                chain().setMark('textStyle', { fontSize: size }).run(),
            unsetFontSize: () => ({ chain }) =>
                chain().setMark('textStyle', { fontSize: null })
                       .removeEmptyTextStyle().run(),
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
const _DOC_WIDTH_OPTIONS = [
    { label: 'Full',      value: '100%' },
    { label: '90%',       value: '90%' },
    { label: '80%',       value: '80%' },
    { label: '1200px',    value: '1200px' },
    { label: '960px',     value: '960px' },
    { label: 'A4 794px', value: '794px' },
    { label: '800px',     value: '800px' },
    { label: '680px',     value: '680px' },
    { label: '600px',     value: '600px' },
    { label: '400px',     value: '400px' },
];
const _DEFAULT_DOC_WIDTH = '794px';
const _TABLE_BORDER_OPTIONS = [
    { label: 'None',   value: 'none' },
    { label: '1px',    value: '1px solid #ccc' },
    { label: '2px',    value: '2px solid #aaa' },
    { label: '3px',    value: '3px solid #888' },
    { label: '4px',    value: '4px solid #666' },
];
const _DEFAULT_TABLE_BORDER = '1px solid #ccc';

// ── State ─────────────────────────────────────────────────────────────────────

let documentsStore = [];   // [{ id, title, content, createdAt, font }]
let _guiRef = null;        // lil-gui folder reference (set by initDocumentsGui)
let _editor = null;        // TipTap editor instance
let _overlayEl = null;     // editor overlay DOM element
let _currentDocId = null;  // id of document currently open in editor
let _isEditMode = false;   // true = editor mode, false = read-only mode
let _bgOpacity = 1.0;      // editor content background opacity (0 = transparent, 1 = opaque)
let _nav3d = false;        // true = pointer-events off on overlay → 3D navigation active
let _tocScrollHandler = null; // scroll spy handler for TOC
let _showLastEditDate = true;  // show (le. ...) in document button label
let _showImportDate = false;    // show (imp. ...) in document button label

// ── Public API ────────────────────────────────────────────────────────────────

export function setDocLabelOptions({ showLastEditDate, showImportDate }) {
    if (showLastEditDate !== undefined) _showLastEditDate = showLastEditDate;
    if (showImportDate !== undefined) _showImportDate = showImportDate;
    refreshDocumentsGui();
}

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
    // Traverse to find ALL nodes that carry userData.documents and collect them.
    let docs = null;
    gltfScene.traverse(node => {
        if (Array.isArray(node.userData.documents) && node.userData.documents.length > 0) {
            if (!docs) docs = node.userData.documents;
            // Remove from the node so it is not re-exported with stale image data
            delete node.userData.documents;
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
    _guiRef.add({ fn: _importDocJson }, 'fn').name('⬆ Import JSON');

    // One button per document
    documentsStore.forEach(doc => {
        let docLabel = doc.title || '(no title)';
        if (_showLastEditDate && doc.lastEditAt) {
            const le = new Date(doc.lastEditAt);
            const lts = `${le.getDate().toString().padStart(2, '0')}.${(le.getMonth() + 1).toString().padStart(2, '0')}. ${le.getHours().toString().padStart(2, '0')}:${le.getMinutes().toString().padStart(2, '0')}`;
            docLabel += ` (le. ${lts})`;
        }
        if (_showImportDate && doc.importedAt) {
            const d = new Date(doc.importedAt);
            const ts = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}. ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            docLabel += ` (imp. ${ts})`;
        }
        _guiRef.add({ fn: () => openDocumentViewer(doc.id) }, 'fn').name(docLabel);
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
        docWidth: _DEFAULT_DOC_WIDTH,
        tableBorder: _DEFAULT_TABLE_BORDER,
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

    // Apply document width
    const docWidthSelect = _overlayEl.querySelector('.doc-width-select');
    const docWidthValue = doc.docWidth || _DEFAULT_DOC_WIDTH;
    docWidthSelect.value = docWidthValue;
    editorContentEl.style.setProperty('--doc-width', docWidthValue);

    // Apply table border
    const tableBorderSelect = _overlayEl.querySelector('.doc-table-border-select');
    const tableBorderValue = doc.tableBorder || _DEFAULT_TABLE_BORDER;
    tableBorderSelect.value = tableBorderValue;
    editorContentEl.style.setProperty('--doc-table-border', tableBorderValue);

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
            _buildToc(docContent);
        }
    });

    _overlayEl.style.display = 'flex';
}

// In read-only mode the ImageResize nodeview returns the bare container div (no wrapper),
// so images that were never interacted with in edit mode have style="" and no float.
// Pre-process the HTML to add containerstyle with float:left to such images so that
// TipTap's parseHTML picks it up and the read-only layout matches the edit-mode layout.
function _prepareReadOnlyContent(html) {
    if (!html) return html;
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('img').forEach(img => {
        const cs = img.getAttribute('containerstyle') || '';
        if (!cs.includes('float')) {
            const width = img.getAttribute('width');
            const widthPart = width ? `width: ${width}px; height: auto; cursor: pointer; ` : '';
            img.setAttribute('containerstyle', `${widthPart}display: inline-block; float: left; padding-right: 8px;`);
        }
    });
    return div.innerHTML;
}

function _createEditor(el, content, readOnly) {
    const editor = new Editor({
        element: el,
        extensions: [
            StarterKit.configure({ link: { openOnClick: false } }),
            TextStyle,
            Color,
            FontSize,
            ImageResize.configure({ inline: true, allowBase64: true }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextIndent,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: readOnly ? _prepareReadOnlyContent(content) : content,
        editable: !readOnly,
        editorProps: {
            handleClick(view, pos, event) {
                if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
                    const { schema, doc } = view.state;
                    const linkMark = schema.marks.link;
                    const resolved = doc.resolve(pos);
                    const marks = resolved.marks();
                    const mark = marks.find(m => m.type === linkMark);
                    if (mark) {
                        window.open(mark.attrs.href, '_blank', 'noopener,noreferrer');
                        return true;
                    }
                }
                return false;
            },
            handlePaste(view, event) {
                const items = Array.from(event.clipboardData?.items || []);
                const imageItem = items.find(item => item.type.startsWith('image/'));
                if (!imageItem) return false;
                const file = imageItem.getAsFile();
                if (!file) return false;
                event.preventDefault();
                _showImageInsertDialog(file);
                return true;
            },
        },
    });

    editor.on('update', () => {
        _updateToolbarState();
    });
    editor.on('selectionUpdate', () => {
        _updateToolbarState();
    });

    return editor;
}

function _saveCurrentDocument(updateLastEdit = false) {
    if (!_editor || !_currentDocId) return;
    const doc = documentsStore.find(d => d.id === _currentDocId);
    if (!doc) return;

    const titleInput = _overlayEl.querySelector('.doc-title-input');
    doc.title = titleInput.value.trim() || 'Untitled';
    doc.content = _editor.getHTML();
    doc.font = (_overlayEl.querySelector('.doc-font-select') || {}).value || _DEFAULT_FONT;
    doc.lineHeight = (_overlayEl.querySelector('.doc-line-height-select') || {}).value || _DEFAULT_LINE_HEIGHT;
    doc.paraSpacing = (_overlayEl.querySelector('.doc-para-spacing-select') || {}).value || _DEFAULT_PARA_SPACING;
    doc.docWidth = (_overlayEl.querySelector('.doc-width-select') || {}).value || _DEFAULT_DOC_WIDTH;
    doc.tableBorder = (_overlayEl.querySelector('.doc-table-border-select') || {}).value || _DEFAULT_TABLE_BORDER;
    if (updateLastEdit) doc.lastEditAt = new Date().toISOString();

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
    if (_tocScrollHandler && _overlayEl) {
        const contentEl = _overlayEl.querySelector('.doc-editor-content');
        if (contentEl) contentEl.removeEventListener('scroll', _tocScrollHandler);
        _tocScrollHandler = null;
    }
    _currentDocId = null;
    _isEditMode = false;
}

function _buildToc(htmlContent) {
    if (!_overlayEl) return;
    const tocEl = _overlayEl.querySelector('.doc-toc');
    const contentEl = _overlayEl.querySelector('.doc-editor-content');
    if (!tocEl || !contentEl) return;

    // Remove previous scroll spy
    if (_tocScrollHandler) {
        contentEl.removeEventListener('scroll', _tocScrollHandler);
        _tocScrollHandler = null;
    }

    // Parse headings from HTML string
    const tmp = document.createElement('div');
    tmp.innerHTML = htmlContent || '';
    const headings = Array.from(tmp.querySelectorAll('h1, h2, h3, h4'));

    const tocBtn = _overlayEl.querySelector('.doc-btn-toc');
    tocEl.innerHTML = '';

    if (headings.length < 2) {
        tocEl.style.display = 'none';
        if (tocBtn) tocBtn.style.display = 'none';
        return;
    }

    tocEl.style.display = '';
    if (tocBtn) tocBtn.style.display = '';
    const ul = document.createElement('ul');
    const tocItems = []; // { a, idx }

    headings.forEach((h, idx) => {
        const level = parseInt(h.tagName[1]);
        const text = h.textContent.trim();
        const li = document.createElement('li');
        li.className = 'toc-level-' + level;
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = text || '—';
        a.addEventListener('click', e => {
            e.preventDefault();
            const domHeadings = contentEl.querySelectorAll('h1, h2, h3, h4');
            if (domHeadings[idx]) domHeadings[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (window.innerWidth <= 768 && _overlayEl) {
                const toc = _overlayEl.querySelector('.doc-toc');
                const backdrop = _overlayEl.querySelector('.doc-toc-backdrop');
                if (toc) toc.classList.remove('toc-open');
                if (backdrop) backdrop.classList.remove('visible');
            }
        });
        tocItems.push({ a, idx });
        li.appendChild(a);
        ul.appendChild(li);
    });
    tocEl.appendChild(ul);

    if (tocItems.length > 0) tocItems[0].a.classList.add('active');

    _tocScrollHandler = () => {
        const domHeadings = Array.from(contentEl.querySelectorAll('h1, h2, h3, h4'));
        if (domHeadings.length === 0) return;
        const threshold = contentEl.getBoundingClientRect().top + 100;
        let activeIdx = 0;
        domHeadings.forEach((h, i) => {
            if (h.getBoundingClientRect().top <= threshold) activeIdx = i;
        });
        tocItems.forEach(({ a, idx }) => a.classList.toggle('active', idx === activeIdx));
    };
    contentEl.addEventListener('scroll', _tocScrollHandler, { passive: true });
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
  img { max-width: 100%; height: auto; display: inline-block; vertical-align: top; margin: 0.4em 4px; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; table-layout: fixed; }
  td, th { border: 1px solid #ccc; padding: 6px 10px; vertical-align: top; box-sizing: border-box; }
  th { background: #f0f0f0; font-weight: 600; text-align: left; }
</style>
</head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    const imgs = Array.from(win.document.images);
    if (imgs.length === 0) {
        win.print();
        win.close();
    } else {
        Promise.all(imgs.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
            });
        })).then(() => {
            win.print();
            win.close();
        });
    }
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

// ── JSON export / import ──────────────────────────────────────────────────────

function _exportCurrentDocJson() {
    if (!_currentDocId) return;
    if (_isEditMode && _editor) _saveCurrentDocument();
    const doc = documentsStore.find(d => d.id === _currentDocId);
    if (!doc) return;
    const json = JSON.stringify(doc, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (doc.title || 'document').replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
    a.href = url;
    a.download = safeName + '.docs.json';
    a.click();
    URL.revokeObjectURL(url);
}

function _exportCurrentDocHtml() {
    if (!_currentDocId) return;
    if (_isEditMode && _editor) _saveCurrentDocument();
    const doc = documentsStore.find(d => d.id === _currentDocId);
    if (!doc) return;

    const title = doc.title || 'Document';
    const fontFamily = doc.font || _DEFAULT_FONT;
    const lineHeight = doc.lineHeight || _DEFAULT_LINE_HEIGHT;
    const paraSpacing = doc.paraSpacing || _DEFAULT_PARA_SPACING;
    const docWidth = doc.docWidth || _DEFAULT_DOC_WIDTH;
    const tableBorder = doc.tableBorder || _DEFAULT_TABLE_BORDER;

    // Inject heading IDs and build TOC data
    const tmp = document.createElement('div');
    tmp.innerHTML = doc.content || '';
    const toc = [];
    Array.from(tmp.querySelectorAll('h1, h2, h3, h4')).forEach((h, i) => {
        const id = 'h-' + i;
        h.id = id;
        toc.push({ level: parseInt(h.tagName[1]), text: h.textContent.trim(), id });
    });
    const contentHtml = tmp.innerHTML;

    const showToc = toc.length >= 2;
    const tocHtml = showToc ? `
    <nav id="docToc">
      <ul>
        ${toc.map(item =>
            `<li class="toc-level-${item.level}"><a href="#${item.id}" data-id="${item.id}">${item.text.replace(/</g, '&lt;')}</a></li>`
        ).join('\n        ')}
      </ul>
    </nav>` : '';

    const safeName = title.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();

    const html = `<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title.replace(/</g, '&lt;')}</title>
<style>
*, *::before, *::after { box-sizing: border-box; }
html, body { height: 100%; margin: 0; padding: 0; font-family: ${fontFamily}; font-size: 15px; background: #1a1a1a; color: #ddd; overflow: hidden; }
#docHeader { height: 44px; background: #2a2a2a; border-bottom: 1px solid #444; display: flex; align-items: center; padding: 0 20px; flex-shrink: 0; }
#docHeaderTitle { font-size: 15px; font-weight: 600; color: #fff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
#docBody { display: flex; height: calc(100vh - 44px); overflow: hidden; }
#docToc { width: 240px; flex-shrink: 0; overflow-y: auto; background: #222; border-right: 1px solid #444; padding: 10px 0; }
#docToc ul { list-style: none; margin: 0; padding: 0; }
#docToc li { margin: 0; }
#docToc a { display: block; padding: 4px 14px; color: #bbb; text-decoration: none; font-size: 12px; border-left: 3px solid transparent; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.5; transition: background 0.1s, color 0.1s; }
#docToc a:hover { background: rgba(255,255,255,0.07); color: #fff; }
#docToc a.active { border-left-color: #5af; color: #5af; background: rgba(85,170,255,0.08); }
#docToc .toc-level-1 > a { font-weight: 600; padding-left: 8px; color: #ddd; }
#docToc .toc-level-2 > a { padding-left: 22px; }
#docToc .toc-level-3 > a { padding-left: 36px; font-size: 11px; color: #999; }
#docToc .toc-level-4 > a { padding-left: 50px; font-size: 11px; color: #888; }
#docContentWrap { flex: 1; overflow-y: auto; background: #c8c8c8; }
#docContentInner { padding: 40px 48px; max-width: ${docWidth}; margin: 0 auto; background: #fff; min-height: 100%; color: #111; line-height: ${lineHeight}; }
#docContentInner h1 { font-size: 2em; margin: 0.6em 0 0.4em; }
#docContentInner h2 { font-size: 1.5em; margin: 1em 0 0.3em; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
#docContentInner h3 { font-size: 1.2em; margin: 0.8em 0 0.3em; }
#docContentInner h4 { font-size: 1em; margin: 0.6em 0 0.3em; font-weight: 600; }
#docContentInner p { margin: 0 0 ${paraSpacing}; }
#docContentInner ul, #docContentInner ol { padding-left: 2em; margin: 0 0 0.8em; }
#docContentInner blockquote { border-left: 4px solid #ccc; margin: 0.8em 0; padding: 0.2em 1em; color: #555; }
#docContentInner img { max-width: 100%; height: auto; display: inline-block; vertical-align: top; margin: 0.4em 4px; }
#docContentInner a { color: #1a6fc4; text-decoration: underline; }
#docContentInner a:hover { color: #1254a0; }
#docContentInner strong { font-weight: 700; }
#docContentInner em { font-style: italic; }
#docContentInner table { border-collapse: collapse; width: 100%; margin: 1em 0; table-layout: fixed; }
#docContentInner td, #docContentInner th { border: ${tableBorder}; padding: 6px 10px; vertical-align: top; box-sizing: border-box; }
#docContentInner th { background: #f0f0f0; font-weight: 600; text-align: left; }
#docContentInner hr { border: none; border-top: 1px solid #ddd; margin: 1.5em 0; }
#docContentWrap::-webkit-scrollbar { width: 8px; }
#docContentWrap::-webkit-scrollbar-track { background: #b0b0b0; }
#docContentWrap::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
#docToc::-webkit-scrollbar { width: 6px; }
#docToc::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }
</style>
</head>
<body>
<div id="docHeader"><span id="docHeaderTitle">${title.replace(/</g, '&lt;')}</span></div>
<div id="docBody">
  ${tocHtml}
  <div id="docContentWrap">
    <div id="docContentInner">${contentHtml}</div>
  </div>
</div>
<script>
(function(){
  var tocLinks = Array.from(document.querySelectorAll('#docToc a'));
  var contentWrap = document.getElementById('docContentWrap');
  if (!contentWrap || tocLinks.length === 0) return;
  var headings = Array.from(document.querySelectorAll('#docContentInner h1,#docContentInner h2,#docContentInner h3,#docContentInner h4'));
  tocLinks.forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var target = document.getElementById(a.dataset.id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  function setActive(id){
    tocLinks.forEach(function(a){ a.classList.toggle('active', a.dataset.id === id); });
  }
  if (headings.length > 0) setActive(headings[0].id);
  contentWrap.addEventListener('scroll', function(){
    var top = contentWrap.getBoundingClientRect().top + 100;
    var activeId = headings[0] ? headings[0].id : null;
    headings.forEach(function(h){ if (h.getBoundingClientRect().top <= top) activeId = h.id; });
    if (activeId) setActive(activeId);
  }, { passive: true });
})();
<\/script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeName + '.html';
    a.click();
    URL.revokeObjectURL(url);
}

function _importDocJson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const doc = JSON.parse(e.target.result);
                if (!doc || typeof doc !== 'object' || !doc.content) {
                    alert('Neplatný soubor dokumentu.');
                    return;
                }
                const importedDoc = {
                    ...doc,
                    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                    originalId: doc.id,
                    importedAt: new Date().toISOString(),
                };
                documentsStore.push(importedDoc);
                refreshDocumentsGui();
            } catch (err) {
                alert('Chyba při načítání souboru: ' + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
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
        else if (action === 'code') active = _editor.isActive('code');
        else if (action === 'alignLeft') active = _editor.isActive({ textAlign: 'left' });
        else if (action === 'alignCenter') active = _editor.isActive({ textAlign: 'center' });
        else if (action === 'alignRight') active = _editor.isActive({ textAlign: 'right' });
        else if (action === 'link') active = _editor.isActive('link');
        btn.classList.toggle('active', active);
    });

    // Sync font-size select
    const fsSelect = toolbar.querySelector('.doc-fontsize-select');
    if (fsSelect) {
        const attrs = _editor.getAttributes('textStyle');
        const currentSize = attrs.fontSize || '16px';
        fsSelect.value = currentSize;
        if (!fsSelect.value) fsSelect.value = '16px';
    }

    // Sync toolbar indent select
    const indentSelect = toolbar.querySelector('.doc-toolbar-indent-select');
    if (indentSelect) {
        const attrs = _editor.getAttributes('paragraph');
        indentSelect.value = attrs.textIndent || '0';
    }
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
        case 'code':        _editor.chain().focus().toggleCode().run(); break;
        case 'hr':          _editor.chain().focus().setHorizontalRule().run(); break;
        case 'alignLeft':   _editor.chain().focus().setTextAlign('left').run(); break;
        case 'alignCenter': _editor.chain().focus().setTextAlign('center').run(); break;
        case 'alignRight':  _editor.chain().focus().setTextAlign('right').run(); break;
        case 'undo':        _editor.chain().focus().undo().run(); break;
        case 'redo':        _editor.chain().focus().redo().run(); break;
        case 'image':           _insertImageFromFile(); break;
        case 'link':            _insertLinkDialog(); break;
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

function _insertLinkDialog() {
    if (!_editor) return;
    const isLink = _editor.isActive('link');
    if (isLink) _editor.chain().focus().extendMarkRange('link').run();
    const currentHref = _editor.getAttributes('link').href || '';
    const href = window.prompt('URL odkazu (prázdné = odebrat):', currentHref);
    if (href === null) return;
    if (!href.trim()) { _editor.chain().focus().unsetLink().run(); return; }
    const { from, to } = _editor.state.selection;
    // Po vložení odkazu odstraníme mark ze stored marks, aby nový text link nezdědil
    const escapeLink = ({ tr, state, dispatch }) => {
        if (dispatch) tr.removeStoredMark(state.schema.marks.link);
        return true;
    };
    if (from === to) {
        // Žádný výběr – vloží URL jako text odkazu
        const mark = _editor.schema.marks.link.create({ href: href.trim() });
        _editor.chain().focus().command(({ tr, dispatch }) => {
            if (dispatch) tr.replaceWith(from, to, _editor.schema.text(href.trim(), [mark]));
            return true;
        }).command(escapeLink).run();
    } else if (isLink) {
        // Editace existujícího odkazu – pouze URL, text zachováme
        const mark = _editor.schema.marks.link.create({ href: href.trim() });
        _editor.chain().focus().command(({ tr, dispatch }) => {
            if (dispatch) tr.replaceWith(from, to, _editor.schema.text(_editor.state.doc.textBetween(from, to), [mark]));
            return true;
        }).command(escapeLink).run();
    } else {
        // Výběr textu – aplikuje odkaz na stávající text
        _editor.chain().focus().setLink({ href: href.trim() }).command(escapeLink).run();
    }
}

function _insertTableDialog() {
    const input = window.prompt('Tabulka (řádky x sloupce):', '3x3');
    if (!input) return;
    const parts = input.toLowerCase().split(/[x×,; ]+/);
    const rows = Math.max(1, Math.min(20, parseInt(parts[0]) || 3));
    const cols = Math.max(1, Math.min(20, parseInt(parts[1]) || 3));
    _editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
}

async function _compressImageLib(file, maxPx, quality) {
    const compressed = await imageCompression(file, {
        maxWidthOrHeight: maxPx,
        initialQuality: quality,
        useWebWorker: true,
    });
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(compressed);
    });
}

function _fmtBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' kB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function _dataUrlBytes(dataUrl) {
    // base64 encodes 3 bytes as 4 chars; subtract data: prefix
    const base64 = dataUrl.split(',')[1] || '';
    return Math.round(base64.length * 0.75);
}

function _insertImageFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        _showImageInsertDialog(file);
    };
    input.click();
}

function _showImageInsertDialog(file) {
    // Defaults
    let maxPx = 1600;
    let quality = 0.85;
    let _debounceTimer = null;
    let _previewDataUrl = null;

    const origObjectUrl = URL.createObjectURL(file);
    const origBytes = file.size;

    // ── Dialog backdrop ──
    const backdrop = document.createElement('div');
    backdrop.className = 'img-dialog-backdrop';

    const dialog = document.createElement('div');
    dialog.className = 'img-dialog';

    // Title
    const title = document.createElement('div');
    title.className = 'img-dialog-title';
    title.textContent = 'Insert image';
    dialog.appendChild(title);

    // Info row
    const infoRow = document.createElement('div');
    infoRow.className = 'img-dialog-info';
    const origInfo = document.createElement('span');
    origInfo.textContent = `Original: ${_fmtBytes(origBytes)}`;
    const previewInfo = document.createElement('span');
    previewInfo.className = 'img-dialog-preview-info';
    infoRow.appendChild(origInfo);
    infoRow.appendChild(previewInfo);
    dialog.appendChild(infoRow);

    // Previews
    const previews = document.createElement('div');
    previews.className = 'img-dialog-previews';

    const origThumb = document.createElement('img');
    origThumb.className = 'img-dialog-thumb';
    origThumb.src = origObjectUrl;
    origThumb.onload = () => {
        origInfo.textContent = `Original: ${origThumb.naturalWidth}×${origThumb.naturalHeight} · ${_fmtBytes(origBytes)}`;
    };
    const origLabel = document.createElement('div');
    origLabel.className = 'img-dialog-thumb-label';
    origLabel.textContent = 'Originál';
    const origWrap = document.createElement('div');
    origWrap.className = 'img-dialog-thumb-wrap';
    origWrap.appendChild(origThumb);
    origWrap.appendChild(origLabel);

    const prevThumb = document.createElement('img');
    prevThumb.className = 'img-dialog-thumb';
    const prevLabel = document.createElement('div');
    prevLabel.className = 'img-dialog-thumb-label';
    prevLabel.textContent = 'Náhled';
    const prevWrap = document.createElement('div');
    prevWrap.className = 'img-dialog-thumb-wrap';
    prevWrap.appendChild(prevThumb);
    prevWrap.appendChild(prevLabel);

    previews.appendChild(origWrap);
    previews.appendChild(prevWrap);
    dialog.appendChild(previews);

    // Controls
    const controls = document.createElement('div');
    controls.className = 'img-dialog-controls';

    function makeSliderRow(labelText, min, max, step, value, unit, onChange) {
        const row = document.createElement('div');
        row.className = 'img-dialog-row';
        const lbl = document.createElement('label');
        lbl.className = 'img-dialog-label';
        lbl.textContent = labelText;
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min; slider.max = max; slider.step = step;
        slider.value = value;
        slider.className = 'img-dialog-slider';
        const valSpan = document.createElement('span');
        valSpan.className = 'img-dialog-val';
        valSpan.textContent = value + unit;
        slider.addEventListener('input', () => {
            valSpan.textContent = slider.value + unit;
            onChange(parseFloat(slider.value));
        });
        row.appendChild(lbl);
        row.appendChild(slider);
        row.appendChild(valSpan);
        return row;
    }

    controls.appendChild(makeSliderRow('Max rozměr', 200, 4000, 50, maxPx, ' px', v => { maxPx = v; schedulePreview(); }));
    controls.appendChild(makeSliderRow('Kvalita', 0.1, 1.0, 0.05, quality, '', v => { quality = v; schedulePreview(); }));

    dialog.appendChild(controls);

    // Buttons
    const btnRow = document.createElement('div');
    btnRow.className = 'img-dialog-btns';

    const btnInsert = document.createElement('button');
    btnInsert.className = 'img-dialog-btn img-dialog-btn-primary';
    btnInsert.textContent = 'Vložit';
    btnInsert.disabled = true;
    btnInsert.addEventListener('click', () => {
        if (_previewDataUrl) {
            _editor.chain().focus().setImage({ src: _previewDataUrl }).run();
            URL.revokeObjectURL(origObjectUrl);
            backdrop.remove();
        }
    });

    const btnOrig = document.createElement('button');
    btnOrig.className = 'img-dialog-btn';
    btnOrig.textContent = 'Vložit originál';
    btnOrig.addEventListener('click', async () => {
        const dataUrl = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
        _editor.chain().focus().setImage({ src: dataUrl }).run();
        URL.revokeObjectURL(origObjectUrl);
        backdrop.remove();
    });

    const btnCancel = document.createElement('button');
    btnCancel.className = 'img-dialog-btn';
    btnCancel.textContent = 'Zrušit';
    btnCancel.addEventListener('click', () => { URL.revokeObjectURL(origObjectUrl); backdrop.remove(); });

    btnRow.appendChild(btnInsert);
    btnRow.appendChild(btnOrig);
    btnRow.appendChild(btnCancel);
    dialog.appendChild(btnRow);

    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    // ── Preview generation ──
    async function generatePreview() {
        btnInsert.disabled = true;
        prevLabel.textContent = 'Generuji…';
        try {
            const dataUrl = await _compressImageLib(file, maxPx, quality);
            _previewDataUrl = dataUrl;
            prevThumb.src = dataUrl;
            const prevBytes = _dataUrlBytes(dataUrl);
            const prevImg = new Image();
            prevImg.onload = () => {
                prevLabel.textContent = `${prevImg.naturalWidth}×${prevImg.naturalHeight} · ${_fmtBytes(prevBytes)}`;
                previewInfo.textContent = `Úspora: ${_fmtBytes(origBytes - prevBytes)} (${Math.round((1 - prevBytes / origBytes) * 100)} %)`;
            };
            prevImg.src = dataUrl;
            btnInsert.textContent = `Vložit (${_fmtBytes(prevBytes)})`;
            btnInsert.disabled = false;
        } catch (err) {
            prevLabel.textContent = 'Chyba komprese';
            console.error(err);
        }
    }

    function schedulePreview() {
        clearTimeout(_debounceTimer);
        _debounceTimer = setTimeout(generatePreview, 400);
    }

    // Initial preview
    generatePreview();
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
        // Recreate editor in editable mode so that columnResizing plugin is registered
        // (Tiptap v3 only registers columnResizing when editor.isEditable is true at init time)
        if (_editor) {
            const content = _editor.getHTML();
            _editor.destroy();
            _editor = null;
            const editorEl = overlay.querySelector('.doc-editor-content');
            requestAnimationFrame(() => {
                _editor = _createEditor(editorEl, content, false);
            });
        }
        _isEditMode = true;
    });

    const btnSave = document.createElement('button');
    btnSave.className = 'doc-btn doc-btn-save';
    btnSave.textContent = '💾 Save';
    btnSave.addEventListener('click', () => {
        _saveCurrentDocument(true);
        if (_editor) _buildToc(_editor.getHTML());
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

    const btnExportJson = document.createElement('button');
    btnExportJson.className = 'doc-btn doc-btn-export-json';
    btnExportJson.textContent = '⬇ JSON';
    btnExportJson.title = 'Export document as JSON';
    btnExportJson.addEventListener('click', _exportCurrentDocJson);

    const btnExportHtml = document.createElement('button');
    btnExportHtml.className = 'doc-btn doc-btn-export-html';
    btnExportHtml.textContent = '⬇ HTML';
    btnExportHtml.title = 'Export document as self-contained HTML';
    btnExportHtml.addEventListener('click', _exportCurrentDocHtml);

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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && _nav3d && _overlayEl && _overlayEl.style.display !== 'none') {
            _nav3d = false;
            overlay.style.pointerEvents = '';
            btnNav3d.classList.remove('active');
            header.style.pointerEvents = '';
            btnNav3d.style.pointerEvents = 'auto';
        }
    });

    const btnToc = document.createElement('button');
    btnToc.className = 'doc-btn doc-btn-toc';
    btnToc.title = 'Toggle table of contents';
    btnToc.innerHTML = '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><rect y="0" width="16" height="2" rx="1"/><rect y="5" width="16" height="2" rx="1"/><rect y="10" width="16" height="2" rx="1"/></svg>';
    btnToc.style.display = 'none';

    header.appendChild(btnToc);
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

    // Document width selector
    const docWidthWrap = document.createElement('span');
    docWidthWrap.className = 'doc-font-wrap';
    const docWidthLabel = document.createElement('span');
    docWidthLabel.className = 'doc-font-label';
    docWidthLabel.textContent = 'W';
    const docWidthSelect = document.createElement('select');
    docWidthSelect.className = 'doc-font-select doc-width-select';
    docWidthSelect.title = 'Document width';
    _DOC_WIDTH_OPTIONS.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        docWidthSelect.appendChild(option);
    });
    docWidthSelect.addEventListener('change', () => {
        const editorContentEl = overlay.querySelector('.doc-editor-content');
        editorContentEl.style.setProperty('--doc-width', docWidthSelect.value);
        if (_currentDocId) {
            const d = documentsStore.find(x => x.id === _currentDocId);
            if (d) d.docWidth = docWidthSelect.value;
        }
    });
    docWidthWrap.appendChild(docWidthLabel);
    docWidthWrap.appendChild(docWidthSelect);
    header.appendChild(docWidthWrap);

    // Table border selector
    const tableBorderWrap = document.createElement('span');
    tableBorderWrap.className = 'doc-font-wrap';
    const tableBorderLabel = document.createElement('span');
    tableBorderLabel.className = 'doc-font-label';
    tableBorderLabel.textContent = '┼';
    tableBorderLabel.title = 'Table border width';
    const tableBorderSelect = document.createElement('select');
    tableBorderSelect.className = 'doc-font-select doc-table-border-select';
    tableBorderSelect.title = 'Table border width';
    _TABLE_BORDER_OPTIONS.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        tableBorderSelect.appendChild(option);
    });
    tableBorderSelect.addEventListener('change', () => {
        const editorContentEl = overlay.querySelector('.doc-editor-content');
        editorContentEl.style.setProperty('--doc-table-border', tableBorderSelect.value);
        if (_currentDocId) {
            const d = documentsStore.find(x => x.id === _currentDocId);
            if (d) d.tableBorder = tableBorderSelect.value;
        }
    });
    tableBorderWrap.appendChild(tableBorderLabel);
    tableBorderWrap.appendChild(tableBorderSelect);
    header.appendChild(tableBorderWrap);

    header.appendChild(btnEdit);
    header.appendChild(btnSave);
    header.appendChild(btnPrint);
    header.appendChild(btnExportJson);
    header.appendChild(btnExportHtml);
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
        { action: 'code',         label: '<>',  title: 'Inline code' },
        { action: 'hr',           label: '—',   title: 'Horizontal rule' },
        { sep: true },
        { action: 'alignLeft',    label: '⬛▭▭', title: 'Align left' },
        { action: 'alignCenter',  label: '▭⬛▭', title: 'Align center' },
        { action: 'alignRight',   label: '▭▭⬛', title: 'Align right' },
        { sep: true },
        { action: 'image',          label: '🖼️',  title: 'Insert image' },
        { action: 'link',           label: '🔗',  title: 'Insert / edit link' },
        { sep: true },
        { action: 'tableInsert',      label: '⊞',   title: 'Insert table (e.g. 3x4)' },
        { action: 'tableAddRowAfter', label: '+row', title: 'Add row below' },
        { action: 'tableDelRow',      label: '-row', title: 'Delete row' },
        { action: 'tableAddColAfter', label: '+col', title: 'Add column right' },
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

    // Font size select
    const fsSep = document.createElement('span');
    fsSep.className = 'doc-toolbar-sep';
    toolbar.appendChild(fsSep);

    const fsLabel = document.createElement('span');
    fsLabel.className = 'doc-font-label';
    fsLabel.textContent = 'px';
    fsLabel.style.marginLeft = '2px';
    toolbar.appendChild(fsLabel);

    const fsSelect = document.createElement('select');
    fsSelect.className = 'doc-font-select doc-fontsize-select';
    fsSelect.title = 'Font size';
    [
        { label: '— reset', value: '' },
        { label: '8',    value: '8px' },
        { label: '9',    value: '9px' },
        { label: '10',   value: '10px' },
        { label: '11',   value: '11px' },
        { label: '12',   value: '12px' },
        { label: '13',   value: '13px' },
        { label: '14',   value: '14px' },
        { label: '15',   value: '15px' },
        { label: '16 ✦', value: '16px' },
        { label: '18',   value: '18px' },
        { label: '20',   value: '20px' },
        { label: '22',   value: '22px' },
        { label: '24',   value: '24px' },
        { label: '28',   value: '28px' },
        { label: '32',   value: '32px' },
        { label: '36',   value: '36px' },
        { label: '48',   value: '48px' },
        { label: '64',   value: '64px' },
    ].forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        fsSelect.appendChild(o);
    });
    fsSelect.addEventListener('change', () => {
        if (!_editor) return;
        if (fsSelect.value) {
            _editor.chain().focus().setFontSize(fsSelect.value).run();
        } else {
            _editor.chain().focus().unsetFontSize().run();
        }
    });
    toolbar.appendChild(fsSelect);

    // Indent select
    const indentSep = document.createElement('span');
    indentSep.className = 'doc-toolbar-sep';
    toolbar.appendChild(indentSep);

    const indentLabel = document.createElement('span');
    indentLabel.className = 'doc-font-label';
    indentLabel.textContent = '↵';
    indentLabel.title = 'First line indent';
    indentLabel.style.marginLeft = '2px';
    toolbar.appendChild(indentLabel);

    const indentSelect = document.createElement('select');
    indentSelect.className = 'doc-font-select doc-toolbar-indent-select';
    indentSelect.title = 'First line indent';
    [{ label: '0', value: '0' }, { label: '1em', value: '1em' }, { label: '2em', value: '2em' }, { label: '3em', value: '3em' }]
        .forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            indentSelect.appendChild(o);
        });
    indentSelect.addEventListener('change', () => {
        if (!_editor) return;
        const val = indentSelect.value === '0' ? null : indentSelect.value;
        _editor.commands.setTextIndent(val);
        _editor.view.focus();
    });
    toolbar.appendChild(indentSelect);

    // TOC panel
    const tocEl = document.createElement('nav');
    tocEl.className = 'doc-toc';
    tocEl.style.display = 'none';

    // Backdrop for mobile TOC drawer
    const tocBackdrop = document.createElement('div');
    tocBackdrop.className = 'doc-toc-backdrop';

    // Editor content area
    const editorContent = document.createElement('div');
    editorContent.className = 'doc-editor-content';

    // Body row (TOC + editor side by side)
    const docBody = document.createElement('div');
    docBody.className = 'doc-body';
    docBody.appendChild(tocEl);
    docBody.appendChild(tocBackdrop);
    docBody.appendChild(editorContent);

    // ── TOC toggle ────────────────────────────────────────────────────────────
    const _docIsMobile = () => window.innerWidth <= 768;
    const _applyDocTocState = () => {
        if (!_docIsMobile()) {
            tocEl.classList.remove('toc-open');
            tocBackdrop.classList.remove('visible');
            if (localStorage.getItem('docTocHidden') === '1') {
                tocEl.classList.add('toc-hidden');
            } else {
                tocEl.classList.remove('toc-hidden');
            }
        } else {
            tocEl.classList.remove('toc-hidden');
            tocEl.classList.remove('toc-open');
            tocBackdrop.classList.remove('visible');
        }
    };
    _applyDocTocState();

    btnToc.addEventListener('click', () => {
        if (_docIsMobile()) {
            const opening = !tocEl.classList.contains('toc-open');
            tocEl.classList.toggle('toc-open', opening);
            tocBackdrop.classList.toggle('visible', opening);
        } else {
            const hiding = !tocEl.classList.contains('toc-hidden');
            tocEl.classList.toggle('toc-hidden', hiding);
            localStorage.setItem('docTocHidden', hiding ? '1' : '0');
        }
    });
    tocBackdrop.addEventListener('click', () => {
        tocEl.classList.remove('toc-open');
        tocBackdrop.classList.remove('visible');
    });
    window.addEventListener('resize', _applyDocTocState);

    overlay.appendChild(header);
    overlay.appendChild(toolbar);
    overlay.appendChild(docBody);

    overlay.style.setProperty('--doc-bg-opacity', _bgOpacity);
    document.body.appendChild(overlay);
    _overlayEl = overlay;
}
