// documentsUtils.js
import { Editor, Extension, Mark } from '@tiptap/core';
import { pickImageFromDisk, pickImageFromFiles, showImageInsertDialog } from './imageInsertUtils.js';
import { addPdfAttachmentFromBytes } from './attachmentsUtils.js';
import { PDFDocument } from 'pdf-lib';
import html2canvas from 'html2canvas';
import StarterKit from '@tiptap/starter-kit';
import ImageResize from 'tiptap-extension-resize-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';

// ── ImageResize with persistent alignment ─────────────────────────────────────
// Adds an `imageAlign` attribute ('left'|'center'|'right') that survives
// save/reload. In read-only mode the nodeview wraps the container in a flex
// div so justify-content handles centering (same mechanism as edit mode's
// display:flex wrapper), which is more reliable than margin:auto on a block.
const ImageResizeWithAlign = ImageResize.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            imageAlign: {
                default: 'left',
                parseHTML: (element) => {
                    // Prefer the explicit attribute saved by renderHTML
                    const da = element.getAttribute('data-image-align');
                    if (da) return da;
                    // Backward-compat: detect from containerstyle margin
                    const cs = element.getAttribute('containerstyle') || '';
                    if (cs.includes('margin: 0 auto')) return 'center';
                    if (cs.includes('margin-left: auto')) return 'right';
                    return 'left';
                },
                renderHTML: (attrs) => {
                    if (!attrs.imageAlign || attrs.imageAlign === 'left') return {};
                    return { 'data-image-align': attrs.imageAlign };
                },
            },
        };
    },
    addNodeView() {
        const parentFactory = this.parent?.();
        return (props) => {
            const nv = parentFactory(props);
            // In read-only mode there is no flex wrapper from the library,
            // so we add our own to center/right-align the container via
            // justify-content (the same flex trick the library uses in edit mode).
            if (!props.editor.options.editable) {
                const align = props.node.attrs.imageAlign;
                if (align === 'center' || align === 'right') {
                    const alignWrapper = document.createElement('div');
                    alignWrapper.style.display = 'flex';
                    alignWrapper.style.justifyContent = align === 'center' ? 'center' : 'flex-end';
                    alignWrapper.appendChild(nv.dom);
                    return { dom: alignWrapper };
                }
            }
            return nv;
        };
    },
});

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
const _PDF_A4_W_PT = 595.28;
const _PDF_A4_H_PT = 841.89;
const _PDF_MARGIN_MM = 20;
const _PDF_MARGIN_PT = (_PDF_MARGIN_MM / 25.4) * 72;
const _PDF_CONTENT_W_PT = _PDF_A4_W_PT - 2 * _PDF_MARGIN_PT;
const _PDF_CONTENT_H_PT = _PDF_A4_H_PT - 2 * _PDF_MARGIN_PT;
const _PDF_RENDER_SCALE = 2;
const DOC_OPEN_MODE_KEY = 'docOpenMode';
const DOC_PANEL_WIDTH_KEY = 'docPanelWidthPct';
const _DOC_OPEN_MODE_OPTS = { 'Side-by-side': 'side', 'Fullscreen': 'full' };
const _DOC_MOBILE_BREAKPOINT = 768;
const _DOC_PANEL_WIDTH_DEFAULT = 45;
const _DOC_PANEL_WIDTH_MIN_PX = 280;
const _DOC_PANEL_WIDTH_MAX_VW = 0.9;

// ── State ─────────────────────────────────────────────────────────────────────

const _docOpenPrefs = {
    mode: (() => {
        const stored = localStorage.getItem(DOC_OPEN_MODE_KEY);
        return stored === 'full' ? 'full' : 'side';
    })(),
};

let _sidePanelWidthPct = (() => {
    const stored = parseFloat(localStorage.getItem(DOC_PANEL_WIDTH_KEY));
    return Number.isFinite(stored) && stored > 0 ? stored : _DOC_PANEL_WIDTH_DEFAULT;
})();

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
let _pdfExporting = false;
let _btnExportPdf = null;
let _resizeLayoutTimer = null;

// ── Public API ────────────────────────────────────────────────────────────────

export function setDocLabelOptions({ showLastEditDate, showImportDate }) {
    if (showLastEditDate !== undefined) _showLastEditDate = showLastEditDate;
    if (showImportDate !== undefined) _showImportDate = showImportDate;
    refreshDocumentsGui();
}

export function getDocumentsStore() {
    return documentsStore;
}

export function clearDocumentsStore() {
    documentsStore.length = 0;
    refreshDocumentsGui();
}

/** Returns true when the doc overlay is open and 3D model interaction should be suppressed.
 *  Side-by-side never blocks; fullscreen blocks while editing or in view unless 3D nav is on. */
export function isDocOverlayBlockingInput() {
    if (!_overlayEl || _overlayEl.style.display === 'none') return false;
    if (_getEffectiveOpenMode() === 'side') return false;
    return _isEditMode || !_nav3d;
}

/** True when a document is open in edit mode (TipTap active). */
export function isDocumentEditorOpen() {
    return _overlayEl !== null && _overlayEl.style.display !== 'none' && _isEditMode && _editor !== null;
}

/** Insert plain text into the active document editor. Returns false if no editor is open. */
export function insertTextIntoActiveDocument(text) {
    if (!_editor || !_isEditMode) return false;
    const trimmed = String(text || '').trim();
    if (!trimmed) return false;
    const escaped = trimmed
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    const html = escaped
        .split(/\n{2,}/)
        .map(block => `<p>${block.replace(/\n/g, '<br>')}</p>`)
        .join('');
    _editor.chain().focus().insertContent(html).run();
    return true;
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
    window.addEventListener('resize', _onDocLayoutResize);
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

    _guiRef.add(_docOpenPrefs, 'mode', _DOC_OPEN_MODE_OPTS)
        .name('Open as')
        .onChange(mode => {
            localStorage.setItem(DOC_OPEN_MODE_KEY, mode);
            _applyDocLayoutMode();
        });

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
        description: '',
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

    // Update description input (short summary used for SEO / link previews)
    const descriptionInput = _overlayEl.querySelector('.doc-description-input');
    descriptionInput.value = doc.description || '';
    descriptionInput.readOnly = !editMode;

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
    _applyDocLayoutMode();
}

function _clampSidePanelWidthPx(widthPx) {
    const minW = _DOC_PANEL_WIDTH_MIN_PX;
    const maxW = window.innerWidth * _DOC_PANEL_WIDTH_MAX_VW;
    return Math.max(minW, Math.min(maxW, widthPx));
}

function _applySidePanelWidth() {
    if (!_overlayEl) return;
    const widthPx = _clampSidePanelWidthPx((window.innerWidth * _sidePanelWidthPct) / 100);
    _overlayEl.style.width = `${widthPx}px`;
}

function _getEffectiveOpenMode() {
    if (window.innerWidth <= _DOC_MOBILE_BREAKPOINT) return 'full';
    return _docOpenPrefs.mode === 'full' ? 'full' : 'side';
}

function _applyDocLayoutMode() {
    if (!_overlayEl || _overlayEl.style.display === 'none') return;

    const mode = _getEffectiveOpenMode();
    _overlayEl.classList.remove('layout-side', 'layout-full');
    _overlayEl.classList.add(mode === 'side' ? 'layout-side' : 'layout-full');

    const bgWrap = _overlayEl.querySelector('.doc-bg-wrap');
    const btnNav3d = _overlayEl.querySelector('.doc-btn-nav3d');
    const headerWrap = _overlayEl.querySelector('.doc-header-wrap');

    if (mode === 'side') {
        if (bgWrap) bgWrap.style.display = 'none';
        if (btnNav3d) btnNav3d.style.display = 'none';
        _overlayEl.style.pointerEvents = '';
        if (headerWrap) headerWrap.style.pointerEvents = '';
        _applySidePanelWidth();
    } else {
        if (bgWrap) bgWrap.style.display = '';
        if (btnNav3d) btnNav3d.style.display = '';
        _overlayEl.style.width = '';
        _overlayEl.style.pointerEvents = _nav3d ? 'none' : '';
        if (headerWrap) headerWrap.style.pointerEvents = _nav3d ? 'auto' : '';
        if (btnNav3d) btnNav3d.style.pointerEvents = 'auto';
    }
}

function _onSideSplitterPointerDown(e) {
    if (_getEffectiveOpenMode() !== 'side' || !_overlayEl) return;
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();

    const splitter = _overlayEl.querySelector('.doc-side-splitter');
    if (splitter) splitter.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMove = (ev) => {
        if (ev.cancelable) ev.preventDefault();
        const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
        const widthPx = _clampSidePanelWidthPx(window.innerWidth - clientX);
        _sidePanelWidthPct = (widthPx / window.innerWidth) * 100;
        _overlayEl.style.width = `${widthPx}px`;
    };

    const onUp = () => {
        if (splitter) splitter.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        localStorage.setItem(DOC_PANEL_WIDTH_KEY, String(_sidePanelWidthPct));
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
        document.removeEventListener('touchcancel', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
    document.addEventListener('touchcancel', onUp);
}

function _onDocLayoutResize() {
    if (_resizeLayoutTimer) clearTimeout(_resizeLayoutTimer);
    _resizeLayoutTimer = setTimeout(() => {
        _resizeLayoutTimer = null;
        _applyDocLayoutMode();
    }, 150);
}

// In read-only mode the ImageResize nodeview returns the bare container div (no wrapper).
// Strip legacy float layout; alignment is stored as margin in containerstyle.
function _prepareReadOnlyContent(html) {
    if (!html) return html;
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('img').forEach(img => {
        let cs = img.getAttribute('containerstyle') || '';
        // Strip legacy float-based layout
        cs = cs.replace(/float\s*:[^;]+;?\s*/g, '')
               .replace(/padding-right\s*:[^;]+;?\s*/g, '')
               .replace(/display\s*:\s*inline-block\s*;?/g, 'display: block;')
               .trim();
        if (!cs) {
            const width = img.getAttribute('width');
            const widthPart = width ? `width: ${width}px; height: auto; cursor: pointer; ` : '';
            cs = `${widthPart}display: block;`;
        } else if (!cs.includes('display')) {
            cs += ' display: block;';
        }
        img.setAttribute('containerstyle', cs.replace(/\s+/g, ' ').trim());
    });
    return div.innerHTML;
}

function _getSelectedImageSrc(state) {
    const { selection } = state;
    if (!selection.node) return null;
    const name = selection.node.type.name;
    if (name !== 'imageResize' && name !== 'image') return null;
    return selection.node.attrs.src || null;
}

function _dataUrlToBlob(dataUrl) {
    const [header, b64] = dataUrl.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
}

function _writeImageSrcToSystemClipboard(src) {
    if (!navigator.clipboard?.write) return;
    const writeBlob = (blob) => {
        const type = blob.type?.startsWith('image/') ? blob.type : 'image/png';
        navigator.clipboard.write([new ClipboardItem({ [type]: blob })]).catch(() => {});
    };
    if (src.startsWith('data:')) {
        writeBlob(_dataUrlToBlob(src));
        return;
    }
    fetch(src).then(r => r.blob()).then(writeBlob).catch(() => {});
}

function _copySelectedImageToClipboard(event) {
    if (!isDocumentEditorOpen()) return false;
    const src = _getSelectedImageSrc(_editor.state);
    if (!src) return false;
    if (event) event.preventDefault();
    _writeImageSrcToSystemClipboard(src);
    return true;
}

function _cutSelectedImageToClipboard(event) {
    if (!isDocumentEditorOpen()) return false;
    const src = _getSelectedImageSrc(_editor.state);
    if (!src) return false;
    if (event) event.preventDefault();
    _writeImageSrcToSystemClipboard(src);
    _editor.chain().focus().deleteSelection().run();
    return true;
}

function _onDocumentCopy(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    _copySelectedImageToClipboard(e);
}

function _onDocumentCut(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    _cutSelectedImageToClipboard(e);
}

function _onDocumentCopyKeydown(e) {
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'c' || e.shiftKey) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    _copySelectedImageToClipboard(e);
}

function _onDocumentCutKeydown(e) {
    if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'x') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    _cutSelectedImageToClipboard(e);
}

function _pasteImageFromClipboardEvent(event) {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    if (!imageItem) return false;
    const file = imageItem.getAsFile();
    if (!file) return false;
    event.preventDefault();
    showImageInsertDialog(file, (dataUrl, alt) => {
        _editor.chain().focus().setImage({ src: dataUrl, alt }).run();
    });
    return true;
}

function _onDocumentPaste(e) {
    if (!isDocumentEditorOpen()) return;
    if (_editor.isFocused) return;
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    _pasteImageFromClipboardEvent(e);
}

function _createEditor(el, content, readOnly) {
    const editor = new Editor({
        element: el,
        extensions: [
            StarterKit.configure({ link: { openOnClick: false } }),
            TextStyle,
            Color,
            FontSize,
            ImageResizeWithAlign.configure({ inline: false, allowBase64: true }),
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
                return _pasteImageFromClipboardEvent(event);
            },
            handleDOMEvents: {
                copy: (view, event) => _copySelectedImageToClipboard(event),
                cut: (view, event) => _cutSelectedImageToClipboard(event),
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
    const descriptionInput = _overlayEl.querySelector('.doc-description-input');
    doc.description = descriptionInput.value.trim();
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

function _parseDocWidthPx(doc) {
    const raw = (doc && doc.docWidth) || _DEFAULT_DOC_WIDTH;
    if (typeof raw === 'string' && raw.endsWith('px')) {
        const n = parseInt(raw, 10);
        if (Number.isFinite(n) && n > 0) return n;
    }
    return 794;
}

function _getDocumentPrintMeta(doc) {
    return {
        title: doc ? (doc.title || 'Document') : 'Document',
        fontFamily: (doc && doc.font) ? doc.font : _DEFAULT_FONT,
        lineHeight: (doc && doc.lineHeight) ? doc.lineHeight : _DEFAULT_LINE_HEIGHT,
        paraSpacing: (doc && doc.paraSpacing) ? doc.paraSpacing : _DEFAULT_PARA_SPACING,
        tableBorder: (doc && doc.tableBorder) ? doc.tableBorder : _DEFAULT_TABLE_BORDER,
        docWidthPx: _parseDocWidthPx(doc),
    };
}

function _buildDocumentPrintStyles(meta) {
    return `
  @page { size: A4; margin: 2cm; }
  body {
    font-family: ${meta.fontFamily};
    font-size: 15px;
    line-height: ${meta.lineHeight};
    color: #111;
    margin: 0;
    padding: 0;
    background: #fff;
    width: ${meta.docWidthPx}px;
    box-sizing: border-box;
  }
  h1 { font-size: 2em; margin: 0.6em 0 0.3em; }
  h2 { font-size: 1.5em; margin: 0.6em 0 0.3em; }
  h3 { font-size: 1.2em; margin: 0.6em 0 0.3em; }
  p  { margin: 0 0 ${meta.paraSpacing}; }
  ul, ol { padding-left: 2em; margin: 0 0 0.8em; }
  blockquote {
    border-left: 4px solid #ccc;
    margin: 0.8em 0;
    padding: 0.2em 1em;
    color: #555;
  }
  img { max-width: 100%; height: auto; display: inline-block; vertical-align: top; margin: 0.4em 4px; }
  img[data-image-align="center"] { display: block !important; margin: 0 auto; }
  img[data-image-align="right"]  { display: block !important; margin-left: auto; margin-right: 0; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; table-layout: fixed; }
  td, th { border: ${meta.tableBorder}; padding: 6px 10px; vertical-align: top; box-sizing: border-box; }
  th { background: #f0f0f0; font-weight: 600; text-align: left; }`;
}

function _buildDocumentPrintHtml(doc, contentHtml) {
    const meta = _getDocumentPrintMeta(doc);
    const styles = _buildDocumentPrintStyles(meta);
    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${meta.title}</title>
<style>${styles}
</style>
</head><body>${contentHtml}</body></html>`;
}

function _waitForImages(root) {
    const imgs = Array.from(root.querySelectorAll('img'));
    if (imgs.length === 0) return Promise.resolve();
    return Promise.all(imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    }));
}

function _canvasToPngBytes(canvas) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(blob => {
            if (!blob) {
                reject(new Error('Canvas toBlob failed'));
                return;
            }
            blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf))).catch(reject);
        }, 'image/png');
    });
}

async function _htmlBodyToPdfBytes(body, contentWidthPx) {
    const canvas = await html2canvas(body, {
        scale: _PDF_RENDER_SCALE,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: contentWidthPx,
        windowWidth: contentWidthPx,
    });

    const pdfDoc = await PDFDocument.create();
    const pageSliceHeightPx = Math.max(
        1,
        Math.floor(canvas.width * (_PDF_CONTENT_H_PT / _PDF_CONTENT_W_PT))
    );

    let yOffset = 0;
    while (yOffset < canvas.height) {
        const sliceHeight = Math.min(pageSliceHeightPx, canvas.height - yOffset);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeight;
        const ctx = sliceCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

        const pngBytes = await _canvasToPngBytes(sliceCanvas);
        const image = await pdfDoc.embedPng(pngBytes);
        const drawHeightPt = _PDF_CONTENT_W_PT * (sliceHeight / canvas.width);

        const page = pdfDoc.addPage([_PDF_A4_W_PT, _PDF_A4_H_PT]);
        page.drawImage(image, {
            x: _PDF_MARGIN_PT,
            y: _PDF_A4_H_PT - _PDF_MARGIN_PT - drawHeightPt,
            width: _PDF_CONTENT_W_PT,
            height: drawHeightPt,
        });

        yOffset += sliceHeight;
    }

    if (pdfDoc.getPageCount() === 0) {
        pdfDoc.addPage([_PDF_A4_W_PT, _PDF_A4_H_PT]);
    }

    return pdfDoc.save();
}

async function _createPrintIframe(doc, contentHtml) {
    const windowWidth = _parseDocWidthPx(doc);
    const html = _buildDocumentPrintHtml(doc, contentHtml);

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = [
        'position:fixed',
        'left:-10000px',
        'top:0',
        `width:${windowWidth}px`,
        'height:800px',
        'border:none',
        'visibility:hidden',
        'pointer-events:none',
    ].join(';');
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    const body = iframeDoc.body;
    body.style.width = `${windowWidth}px`;
    body.style.boxSizing = 'border-box';

    await _waitForImages(body);
    const contentHeight = Math.max(body.scrollHeight, body.offsetHeight, 1);
    iframe.style.height = `${contentHeight}px`;
    void body.offsetWidth;

    return {
        iframe,
        body,
        windowWidth,
        cleanup() {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        },
    };
}

function _setPdfExportBusy(busy) {
    _pdfExporting = busy;
    if (!_btnExportPdf) return;
    _btnExportPdf.disabled = busy;
    _btnExportPdf.textContent = busy ? '… PDF' : '📕 PDF';
}

function _printDocument() {
    if (!_editor) return;
    const doc = _currentDocId ? documentsStore.find(d => d.id === _currentDocId) : null;
    const content = _editor.getHTML();
    const html = _buildDocumentPrintHtml(doc, content);

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    const imgs = Array.from(win.document.images);
    if (imgs.length === 0) {
        win.print();
        win.close();
    } else {
        _waitForImages(win.document.body).then(() => {
            win.print();
            win.close();
        });
    }
}

async function _exportCurrentDocPdf() {
    if (!_currentDocId || !_editor || _pdfExporting) return;
    if (_isEditMode && _editor) _saveCurrentDocument();
    const doc = documentsStore.find(d => d.id === _currentDocId);
    if (!doc) return;

    const content = _editor.getHTML();
    let printFrame = null;

    _setPdfExportBusy(true);
    try {
        printFrame = await _createPrintIframe(doc, content);
        const bytes = await _htmlBodyToPdfBytes(printFrame.body, printFrame.windowWidth);
        const safeName = (doc.title || 'document').replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
        const name = addPdfAttachmentFromBytes(bytes, `${safeName}.pdf`);
        alert(`Added "${name}" to Files.`);
    } catch (err) {
        console.error(err);
        alert('Failed to export PDF: ' + (err.message || err));
    } finally {
        if (printFrame) printFrame.cleanup();
        _setPdfExportBusy(false);
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
        else if (action === 'alignLeft') {
            if (_editor.isActive('imageResize')) {
                const align = _editor.getAttributes('imageResize').imageAlign || 'left';
                active = align === 'left';
            } else active = _editor.isActive({ textAlign: 'left' });
        } else if (action === 'alignCenter') {
            if (_editor.isActive('imageResize'))
                active = (_editor.getAttributes('imageResize').imageAlign || 'left') === 'center';
            else active = _editor.isActive({ textAlign: 'center' });
        } else if (action === 'alignRight') {
            if (_editor.isActive('imageResize'))
                active = (_editor.getAttributes('imageResize').imageAlign || 'left') === 'right';
            else active = _editor.isActive({ textAlign: 'right' });
        }
        else if (action === 'link') active = _editor.isActive('link');
        else if (action === 'imageAlt') active = _editor.isActive('imageResize') && !!(_editor.getAttributes('imageResize').alt || '').trim();
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

// ── Image alignment helper ────────────────────────────────────────────────────
// Stores alignment as margin in containerStyle (the attribute the nodeview actually applies).
function _setImageAlign(align) {
    if (!_editor || !_editor.isActive('imageResize')) return false;
    const attrs = _editor.getAttributes('imageResize');
    // Strip existing display/margin from containerStyle, then re-add
    let cs = (attrs.containerStyle || '')
        .replace(/display\s*:[^;]*;\s*/g, '')
        .replace(/margin[^;]*;\s*/g, '')
        .trim();
    let extra = 'display: block;';
    if (align === 'center') extra += ' margin: 0 auto;';
    else if (align === 'right') extra += ' margin-left: auto;';
    const newCs = (cs ? cs + ' ' : '') + extra;
    _editor.chain().focus().updateAttributes('imageResize', { containerStyle: newCs, imageAlign: align }).run();
    return true;
}

// Edit (or add) the alt text of the currently selected image - used both for
// newly inserted images (where the insert dialog already collects alt text)
// and to backfill/correct alt text on images that already exist in the document.
function _editImageAlt() {
    if (!_editor || !_editor.isActive('imageResize')) {
        window.alert('Select an image first to edit its alt text.');
        return;
    }
    const currentAlt = _editor.getAttributes('imageResize').alt || '';
    const alt = window.prompt('Alt text (describes the image for accessibility & SEO):', currentAlt);
    if (alt === null) return;
    _editor.chain().focus().updateAttributes('imageResize', { alt: alt.trim() }).run();
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
        case 'alignLeft':   if (!_setImageAlign('left'))   _editor.chain().focus().setTextAlign('left').run(); break;
        case 'alignCenter': if (!_setImageAlign('center')) _editor.chain().focus().setTextAlign('center').run(); break;
        case 'alignRight':  if (!_setImageAlign('right'))  _editor.chain().focus().setTextAlign('right').run(); break;
        case 'undo':        _editor.chain().focus().undo().run(); break;
        case 'redo':        _editor.chain().focus().redo().run(); break;
        case 'image':           _insertImageFromFile(); break;
        case 'imageFromFiles':  _insertImageFromFiles(); break;
        case 'imageAlt':        _editImageAlt(); break;
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

function _insertImageFromFile() {
    pickImageFromDisk((dataUrl, alt) => {
        _editor.chain().focus().setImage({ src: dataUrl, alt }).run();
    });
}

function _insertImageFromFiles() {
    pickImageFromFiles((dataUrl, alt) => {
        _editor.chain().focus().setImage({ src: dataUrl, alt }).run();
    });
}

// ── Build overlay DOM ─────────────────────────────────────────────────────────

function _buildEditorOverlay() {
    if (_overlayEl) return;

    const overlay = document.createElement('div');
    overlay.className = 'doc-overlay';
    overlay.style.display = 'none';

    // Header (two rows: actions, then title + layout)
    const headerWrap = document.createElement('div');
    headerWrap.className = 'doc-header-wrap';

    const headerActions = document.createElement('div');
    headerActions.className = 'doc-header-actions';

    const headerMeta = document.createElement('div');
    headerMeta.className = 'doc-header-meta';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'doc-title-input';
    titleInput.placeholder = 'Document title';

    const descriptionInput = document.createElement('input');
    descriptionInput.type = 'text';
    descriptionInput.className = 'doc-description-input';
    descriptionInput.placeholder = 'Short description (SEO / previews, ~155 chars)';
    descriptionInput.maxLength = 160;

    const btnEdit = document.createElement('button');
    btnEdit.className = 'doc-btn doc-btn-edit';
    btnEdit.textContent = '✎ Edit';
    btnEdit.addEventListener('click', () => {
        if (!_currentDocId) return;
        const titleInput = overlay.querySelector('.doc-title-input');
        titleInput.readOnly = false;
        overlay.querySelector('.doc-description-input').readOnly = false;
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
        _applyDocLayoutMode();
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
        overlay.querySelector('.doc-description-input').readOnly = true;
        btnSave.style.display = 'none';
        btnEdit.style.display = 'inline-block';
        overlay.querySelector('.doc-editor-toolbar').style.display = 'none';
        if (_editor) _editor.setEditable(false);
        _isEditMode = false;
        _applyDocLayoutMode();
    });

    const btnPrint = document.createElement('button');
    btnPrint.className = 'doc-btn doc-btn-print';
    btnPrint.textContent = '🖨 Print';
    btnPrint.title = 'Print document';
    btnPrint.addEventListener('click', _printDocument);

    const btnExportPdf = document.createElement('button');
    btnExportPdf.className = 'doc-btn doc-btn-export-pdf';
    btnExportPdf.textContent = '📕 PDF';
    btnExportPdf.title = 'Export document to PDF (saved to Files panel)';
    btnExportPdf.addEventListener('click', () => { _exportCurrentDocPdf(); });
    _btnExportPdf = btnExportPdf;

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
        headerWrap.style.pointerEvents = _nav3d ? 'auto' : '';
        btnNav3d.style.pointerEvents = 'auto';
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && _nav3d && _overlayEl && _overlayEl.style.display !== 'none') {
            _nav3d = false;
            overlay.style.pointerEvents = '';
            btnNav3d.classList.remove('active');
            headerWrap.style.pointerEvents = '';
            btnNav3d.style.pointerEvents = 'auto';
        }
    });

    document.addEventListener('paste', _onDocumentPaste);
    document.addEventListener('copy', _onDocumentCopy);
    document.addEventListener('cut', _onDocumentCut);
    document.addEventListener('keydown', _onDocumentCopyKeydown);
    document.addEventListener('keydown', _onDocumentCutKeydown);

    const btnToc = document.createElement('button');
    btnToc.className = 'doc-btn doc-btn-toc';
    btnToc.title = 'Toggle table of contents';
    btnToc.innerHTML = '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><rect y="0" width="16" height="2" rx="1"/><rect y="5" width="16" height="2" rx="1"/><rect y="10" width="16" height="2" rx="1"/></svg>';
    btnToc.style.display = 'none';

    headerActions.appendChild(btnToc);
    headerActions.appendChild(btnEdit);
    headerActions.appendChild(btnSave);
    headerActions.appendChild(btnPrint);
    headerActions.appendChild(btnExportPdf);
    headerActions.appendChild(btnExportJson);
    headerActions.appendChild(btnExportHtml);
    headerActions.appendChild(btnDelete);
    headerActions.appendChild(btnClose);

    headerMeta.appendChild(titleInput);
    headerMeta.appendChild(descriptionInput);
    headerMeta.appendChild(bgWrap);
    headerMeta.appendChild(btnNav3d);

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
    headerMeta.appendChild(fontWrap);

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
    headerMeta.appendChild(lineHeightWrap);

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
    headerMeta.appendChild(paraSpacingWrap);

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
    headerMeta.appendChild(docWidthWrap);

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
    headerMeta.appendChild(tableBorderWrap);

    headerWrap.appendChild(headerActions);
    headerWrap.appendChild(headerMeta);

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
        { action: 'image',          label: '🖼️',  title: 'Insert image from disk' },
        { action: 'imageFromFiles',  label: '📎🖼', title: 'Insert image from Files' },
        { action: 'imageAlt',       label: '🏷',  title: 'Edit alt text of the selected image' },
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

    const splitter = document.createElement('div');
    splitter.className = 'doc-side-splitter';
    splitter.title = 'Resize document panel';
    splitter.setAttribute('role', 'separator');
    splitter.setAttribute('aria-orientation', 'vertical');
    splitter.addEventListener('mousedown', _onSideSplitterPointerDown);
    splitter.addEventListener('touchstart', _onSideSplitterPointerDown, { passive: false });

    overlay.appendChild(splitter);
    overlay.appendChild(headerWrap);
    overlay.appendChild(toolbar);
    overlay.appendChild(docBody);

    overlay.style.setProperty('--doc-bg-opacity', _bgOpacity);
    document.body.appendChild(overlay);
    _overlayEl = overlay;
}
