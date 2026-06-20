// imageEditorUtils.js
// Canvas-based image editor: Crop, Rotate, Flip, Pen, Text, Undo/Redo, Resize, Zoom+Pan
// Multi-instance (floating windows) with a single shared toolbar.

import {
    imageDataToFile,
    pickImageFromDisk,
    pickImageFromFiles,
    readImageFileFromClipboard,
    showImageInsertDialog,
} from './imageInsertUtils.js';
import {
    canvasRegionToCanvas,
    runOcr,
    runOcrWithProgress,
    showOcrResultDialog,
} from './ocrUtils.js';

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Open the image editor for the given attachment.
 * @param {object} att  – attachment object { id, name, mimeType, data (base64) }
 * @param {Function} onSaveOverwrite  – cb(newBase64, newSize) → overwrite original
 * @param {Function} onSaveNew       – cb(newBase64, newSize, suggestedName) → save as new attachment
 * @param {Function} [onClose]       – cb() when this editor window is closed
 */
export function openImageEditor(att, onSaveOverwrite, onSaveNew, onClose) {
    _launch(att, onSaveOverwrite, onSaveNew, onClose);
}

// ── Shared toolbar state (global) ─────────────────────────────────────────────

let _activeTool = 'pan';     // 'pan'|'crop'|'pen'|'text'|...
let _penColor   = '#ff0000';
let _penSize    = 3;
let _textColor  = '#ff0000';
let _bgColor    = '#ffffff';  // null = transparent, hex = solid fill
let _fontSize   = 18;
let _fontFamily = 'sans-serif';
let _eraserShape = 'circle';  // 'circle' | 'square'
let _shapeFill   = false;
let _crosshairColor     = '#00ff00';
let _crosshairCursorCss = null;
let _textCursorCss      = null;

// Clipboard (shared across all instances + system clipboard)
let _clipboardData = null;    // ImageData | null

const MAX_UNDO = 30;
const TOOLS = ['pan', 'crop', 'select', 'pen', 'text', 'rect', 'ellipse', 'line', 'arrow', 'highlight', 'eraser', 'callout', 'blur'];

// ── Instance registry ─────────────────────────────────────────────────────────

let _instances    = [];       // all open editor instances
let _activeInst   = null;     // currently focused instance
let _toolbarEl    = null;     // shared toolbar DOM element
let _nextZIndex   = 100001;   // z-index counter for window stacking
let _nextWinPos   = 0;        // cascade offset for new windows
let _guiOnTop     = false;    // when true, GUI floats above editor windows
let _showWinChrome = true;    // when false, titlebar & statusbar of all windows are hidden

// ── Instance factory ──────────────────────────────────────────────────────────

function _createInstance(att, onSaveOverwrite, onSaveNew, onClose) {
    return {
        att,
        onSaveOverwrite,
        onSaveNew,
        onClose: onClose || null,
        // per-instance DOM
        winEl:    null,
        canvas:   null,
        ctx:      null,
        // per-instance undo/redo
        undoStack: [],
        redoStack: [],
        // per-instance zoom/pan
        zoom:  1,
        panX:  0,
        panY:  0,
        // per-instance interaction state
        isPanning:   false,
        panStart:    { x: 0, y: 0 },
        isDrawing:   false,
        lastDrawPt:  null,
        hlPath:      [],
        isCropping:  false,
        cropStart:   null,
        cropRect:    null,
        calloutCount: 1,
        blurPreviewRect: null,
        isShaping:   false,
        shapeStart:  null,
        shapeSnapshot: null,
        selRect:      null,
        isSelectingRect: false,
        selStart:     null,
        isMovingSel:  false,
        selMoveOff:   null,
        isResizingSel:  false,
        selResizeHandle: null,
        selResizeStart:  null,
        selImageData: null,
        selHoleSnapshot: null,
        pendingInsertSnapshot: null,
        pendingInsertUndoIndex: null,
        // text tool
        textDialogEl:   null,
        textSnapshot:   null,
        textPos:        null,
        textBBox:       null,
        isDraggingText: false,
        textDragOff:    null,
        textDragJustEnded: false,
        textPreviewFn:  null,
        // dialogs
        resizeDialogEl:    null,
        canvasSizeDialogEl: null,
        // window state
        savedBounds:  null,
        isMaximized:  false,
    };
}

// ── Launch ────────────────────────────────────────────────────────────────────

function _launch(att, onSaveOverwrite, onSaveNew, onClose) {
    // If the same attachment is already open, just focus it
    const existing = _instances.find(i => i.att === att || (att.id && i.att.id === att.id));
    if (existing) { _focusInstance(existing); return; }

    const inst = _createInstance(att, onSaveOverwrite, onSaveNew, onClose);
    _instances.push(inst);

    _ensureToolbar();
    _buildInstanceUI(inst);
    _focusInstance(inst);
    // Defer maximize one frame so the toolbar is fully rendered and getBoundingClientRect returns correct height
    requestAnimationFrame(() => _toggleMaximize(inst));

    const img = new Image();
    img.onload = () => {
        inst.canvas.width  = img.naturalWidth;
        inst.canvas.height = img.naturalHeight;
        inst.ctx.drawImage(img, 0, 0);
        _fitToView(inst);
        _pushUndo(inst);
        _updateCursor(inst);
    };
    img.src = `data:${att.mimeType};base64,${att.data}`;
}

// ── Shared toolbar ────────────────────────────────────────────────────────────

function _ensureToolbar() {
    if (_toolbarEl && document.body.contains(_toolbarEl)) return;

    _toolbarEl = document.createElement('div');
    _toolbarEl.id = 'img-editor-toolbar';
    _toolbarEl.innerHTML = `
        <div class="img-ed-row img-ed-row-tools">
            <span class="img-ed-group-label">View</span>
            <button class="img-ed-tool-btn" id="img-ed-tool-pan"    title="Pan">✋</button>
            <button class="img-ed-tool-btn" id="img-ed-tool-crop"   title="Crop">⛶</button>
            <button class="img-ed-tool-btn" id="img-ed-tool-select" title="Select — drag rectangle">⬚</button>
            <div class="img-ed-sep"></div>
            <span class="img-ed-group-label">Insert</span>
            <button class="img-ed-tool-btn" id="img-ed-insert-disk" title="Insert image from disk">🖼</button>
            <button class="img-ed-tool-btn" id="img-ed-insert-files" title="Insert image from Files">📎🖼</button>
            <button class="img-ed-tool-btn" id="img-ed-insert-clip" title="Insert image from clipboard">📋</button>
            <div class="img-ed-sep"></div>
            <span class="img-ed-group-label">Draw</span>
            <button class="img-ed-tool-btn" id="img-ed-tool-pen"       title="Freehand pen">✎</button>
            <button class="img-ed-tool-btn" id="img-ed-tool-highlight" title="Highlighter (semi-transparent)">🖌</button>
            <button class="img-ed-tool-btn" id="img-ed-tool-eraser"    title="Eraser — erase drawing">🩹</button>
            <button class="img-ed-btn" id="img-ed-eraser-shape" title="Toggle eraser shape: circle / square">○</button>
            <button class="img-ed-tool-btn" id="img-ed-tool-text"      title="Text (click on image)">T</button>
            <button class="img-ed-btn" id="img-ed-ocr" title="Recognize text (OCR) — selection or whole image">🔤</button>
            <div class="img-ed-sep"></div>
            <span class="img-ed-group-label">Shapes</span>
            <button class="img-ed-tool-btn" id="img-ed-tool-rect"    title="Rectangle">▭</button>
            <button class="img-ed-tool-btn" id="img-ed-tool-ellipse" title="Ellipse">⬭</button>
            <button class="img-ed-tool-btn" id="img-ed-tool-line"    title="Straight line">╱</button>
            <button class="img-ed-tool-btn" id="img-ed-tool-arrow"   title="Arrow with head">→</button>
            <button class="img-ed-tool-btn" id="img-ed-tool-callout" title="Numbered callout">①</button>
            <button class="img-ed-btn" id="img-ed-callout-reset" title="Reset callout numbering to 1">↺①</button>
            <button class="img-ed-tool-btn" id="img-ed-tool-blur"    title="Pixelate / Blur selection">⊞</button>
            <button class="img-ed-btn" id="img-ed-fill-toggle"   title="Toggle Fill / Outline (Rect, Ellipse)">◻</button>
            <div class="img-ed-sep"></div>
            <span class="img-ed-group-label">Options</span>
            <label class="img-ed-label" title="Drawing color">
                Color <input type="color" id="img-ed-color" value="#ff0000">
            </label>
            <label class="img-ed-label" title="Background color (Erase, Callout fill) — transparent if unchecked">
                <input type="checkbox" id="img-ed-bg-enable" title="Enable background color" checked>
                BG <input type="color" id="img-ed-bgcolor" value="#ffffff">
            </label>
            <label class="img-ed-label" title="Crosshair cursor color">
                Cursor <input type="color" id="img-ed-cursor-color" value="#00ff00">
            </label>
            <label class="img-ed-label" title="Brush / stroke size">
                Size <input type="number" id="img-ed-pensize" min="1" max="100" value="3" style="width:44px">
            </label>
            <label class="img-ed-label" title="Font size (px)">
                Font <input type="number" id="img-ed-fontsize" min="6" max="200" value="18" style="width:44px">
            </label>
            <div class="img-ed-sep"></div>
            <button class="img-ed-btn" id="img-ed-arrange"   title="Arrange all windows into a grid">⊞ Tile</button>
            <button class="img-ed-btn" id="img-ed-save-all"   title="Save all open images (overwrite)">💾 all</button>
            <button class="img-ed-btn" id="img-ed-resize-all" title="Resize all open images to the same dimensions">⊡ Resize all</button>
            <button class="img-ed-btn" id="img-ed-fit-all"    title="Fit all images to their window">⛶ Fit all</button>
            <button class="img-ed-btn img-ed-btn-close" id="img-ed-close-all" title="Close all editor windows">✕ all</button>
            <div style="flex:1 1 0"></div>
            <button class="img-ed-btn" id="img-ed-chrome-toggle" title="Toggle titlebar &amp; statusbar on all windows">⊟ Bars</button>
            <button class="img-ed-btn" id="img-ed-guitop" title="Toggle: Editor on top / GUI on top">💼 GUI</button>
        </div>`;

    document.body.appendChild(_toolbarEl);

    TOOLS.forEach(tool => {
        const btn = _toolbarEl.querySelector(`#img-ed-tool-${tool}`);
        if (btn) btn.addEventListener('click', () => { if (_activeInst) _setTool(_activeInst, tool); });
    });

    _toolbarEl.querySelector('#img-ed-eraser-shape').addEventListener('click', () => {
        _eraserShape = _eraserShape === 'circle' ? 'square' : 'circle';
        const btn = _toolbarEl.querySelector('#img-ed-eraser-shape');
        btn.textContent = _eraserShape === 'circle' ? '○' : '□';
        btn.classList.toggle('active', _eraserShape === 'square');
        if (_activeInst) _updateCursor(_activeInst);
    });

    _toolbarEl.querySelector('#img-ed-fill-toggle').addEventListener('click', () => {
        _shapeFill = !_shapeFill;
        const btn = _toolbarEl.querySelector('#img-ed-fill-toggle');
        btn.textContent = _shapeFill ? '■' : '◻';
        btn.classList.toggle('active', _shapeFill);
    });

    _toolbarEl.querySelector('#img-ed-callout-reset').addEventListener('click', () => {
        if (_activeInst) _activeInst.calloutCount = 1;
    });

    _toolbarEl.querySelector('#img-ed-color').addEventListener('input', e => {
        _penColor  = e.target.value;
        _textColor = e.target.value;
    });

    const bgEnableCb = _toolbarEl.querySelector('#img-ed-bg-enable');
    const bgColorInp = _toolbarEl.querySelector('#img-ed-bgcolor');
    const _syncBg = () => {
        _bgColor = bgEnableCb.checked ? bgColorInp.value : null;
        bgColorInp.style.opacity = bgEnableCb.checked ? '1' : '0.4';
    };
    bgEnableCb.addEventListener('change', _syncBg);
    bgColorInp.addEventListener('input',  _syncBg);
    _syncBg();

    _toolbarEl.querySelector('#img-ed-cursor-color').addEventListener('input', e => {
        _crosshairColor = e.target.value;
        _crosshairCursorCss = null;
        _textCursorCss = null;
        _instances.forEach(inst => _updateCursor(inst));
    });

    _toolbarEl.querySelector('#img-ed-pensize').addEventListener('input', e => {
        _penSize = +e.target.value;
        if (_activeInst) _updateCursor(_activeInst);
    });
    _toolbarEl.querySelector('#img-ed-fontsize').addEventListener('input', e => { _fontSize = +e.target.value; });

    _toolbarEl.querySelector('#img-ed-arrange').addEventListener('click',   () => _autoArrange());
    _toolbarEl.querySelector('#img-ed-insert-disk').addEventListener('click', () => {
        if (_activeInst) _insertImageFromDisk(_activeInst);
    });
    _toolbarEl.querySelector('#img-ed-insert-files').addEventListener('click', () => {
        if (_activeInst) _insertImageFromFiles(_activeInst);
    });
    _toolbarEl.querySelector('#img-ed-insert-clip').addEventListener('click', () => {
        if (_activeInst) _insertImageFromClipboard(_activeInst);
    });
    _toolbarEl.querySelector('#img-ed-ocr').addEventListener('click', () => {
        if (_activeInst) _runOcrOnImage(_activeInst);
    });
    _toolbarEl.querySelector('#img-ed-save-all').addEventListener('click',    () => [..._instances].forEach(inst => _saveOverwrite(inst)));
    _toolbarEl.querySelector('#img-ed-resize-all').addEventListener('click',   () => _resizeAll());
    _toolbarEl.querySelector('#img-ed-fit-all').addEventListener('click',       () => _instances.forEach(inst => _fitToView(inst)));
    _toolbarEl.querySelector('#img-ed-close-all').addEventListener('click',    () => { while (_instances.length) _close(_instances[0]); });
    _toolbarEl.querySelector('#img-ed-guitop').addEventListener('click',       () => _toggleGuiOnTop());
    _toolbarEl.querySelector('#img-ed-chrome-toggle').addEventListener('click', () => _toggleWinChrome());
    const chromeBtn = _toolbarEl.querySelector('#img-ed-chrome-toggle');
    if (chromeBtn) chromeBtn.classList.toggle('active', !_showWinChrome);

    _syncToolbarActiveState();
}

function _syncToolbarActiveState() {
    if (!_toolbarEl) return;
    TOOLS.forEach(t => {
        const btn = _toolbarEl.querySelector(`#img-ed-tool-${t}`);
        if (btn) btn.classList.toggle('active', t === _activeTool);
    });
}

// ── Instance UI (floating window) ─────────────────────────────────────────────

function _buildInstanceUI(inst) {
    const offset = (_nextWinPos % 8) * 28;
    _nextWinPos++;

    const win = document.createElement('div');
    win.className = 'img-editor-window';
    win.style.left = (60 + offset) + 'px';
    win.style.top  = (60 + offset) + 'px';
    win.style.zIndex = _guiOnTop ? String(_Z_EDITOR_BEHIND) : String(_nextZIndex++);
    win.innerHTML = `
        <div class="img-editor-titlebar">
            <div class="img-ed-titlebar-title">
                <span class="img-editor-titlebar-icon">🖼</span>
                <input class="img-ed-title img-editor-titlebar-name" title="Click to rename" spellcheck="false" value="">
            </div>
            <div class="img-ed-titlebar-btns">
                <button class="img-ed-btn" id="img-ed-undo"       title="Undo (Ctrl+Z)">↩</button>
                <button class="img-ed-btn" id="img-ed-redo"       title="Redo (Ctrl+Y)">↪</button>
                <button class="img-ed-btn" id="img-ed-goto-begin" title="Show original image (undo/redo stack preserved)">⏮</button>
                <div class="img-ed-sep"></div>
                <button class="img-ed-btn img-ed-win-insert-disk"  title="Insert image from disk">🖼</button>
                <button class="img-ed-btn img-ed-win-insert-files" title="Insert image from Files">📎</button>
                <button class="img-ed-btn img-ed-win-insert-clip"  title="Insert image from clipboard">📋</button>
                <div class="img-ed-sep"></div>
                <button class="img-ed-btn" id="img-ed-rotate-cw"  title="Rotate 90° CW">↻</button>
                <button class="img-ed-btn" id="img-ed-rotate-ccw" title="Rotate 90° CCW">↺</button>
                <button class="img-ed-btn" id="img-ed-flip-h"     title="Flip Horizontal">⇄</button>
                <button class="img-ed-btn" id="img-ed-flip-v"     title="Flip Vertical">⇅</button>
                <button class="img-ed-btn img-ed-btn-text" id="img-ed-resize"      title="Resize (scales image)">⊡ Resize</button>
                <button class="img-ed-btn img-ed-btn-text" id="img-ed-canvas-size" title="Canvas Size — without scaling the image">▦ Canvas resize</button>
                <div class="img-ed-sep"></div>
                <button class="img-ed-btn img-ed-btn-primary" id="img-ed-apply-crop"  style="display:none">✔</button>
                <button class="img-ed-btn"                    id="img-ed-cancel-crop" style="display:none">✕</button>
                <div class="img-ed-sep" id="img-ed-crop-sep"  style="display:none"></div>
                <button class="img-ed-btn" id="img-ed-save-overwrite" title="Save (overwrite current attachment)">💾</button>
                <button class="img-ed-btn" id="img-ed-save-new"       title="Save as new attachment in Files">💾✎</button>
                <button class="img-ed-btn" id="img-ed-download"       title="Download to disk">⬇</button>
                <div class="img-ed-sep"></div>
                <button class="img-ed-btn" id="img-ed-maximize" title="Maximize window">⤢</button>
                <button class="img-ed-btn img-ed-btn-close" id="img-ed-close" title="Close">✕</button>
            </div>
        </div>
        <div class="img-editor-viewport">
            <canvas class="img-editor-canvas"></canvas>
            <canvas class="img-editor-overlay-canvas"></canvas>
        </div>
        <div class="img-editor-statusbar">
            <label class="img-ed-zoom-wrap" title="Zoom % — click for 100%">
                <input type="number" class="img-ed-zoom-label" min="1" max="2000" value="100" step="10">
                <span class="img-ed-zoom-pct">%</span>
            </label>
            <span class="img-ed-size-label"></span>
            <span class="img-ed-hint"></span>
        </div>`;

    document.body.appendChild(win);
    inst.winEl = win;
    _applyWinChrome(inst);

    inst.canvas = win.querySelector('.img-editor-canvas');
    inst.ctx    = inst.canvas.getContext('2d', { willReadFrequently: true });

    const ovCanvas = win.querySelector('.img-editor-overlay-canvas');
    const ovCtx    = ovCanvas.getContext('2d');

    const nameInp = win.querySelector('.img-editor-titlebar-name');
    nameInp.value = inst.att.name;
    nameInp.addEventListener('change', e => {
        const v = e.target.value.trim();
        if (v) inst.att.name = v;
        else e.target.value = inst.att.name;
    });

    win.addEventListener('mousedown', () => _focusInstance(inst), true);

    const titlebar = win.querySelector('.img-editor-titlebar');
    _makeDraggable(win, titlebar);
    titlebar.addEventListener('dblclick', ev => {
        if (ev.target.closest('button, input')) return;
        _toggleMaximize(inst);
    });

    win.querySelector('#img-ed-undo').addEventListener('click',       () => _undo(inst));
    win.querySelector('#img-ed-redo').addEventListener('click',       () => _redo(inst));
    win.querySelector('#img-ed-goto-begin').addEventListener('click', () => _gotoBegin(inst));
    win.querySelector('.img-ed-win-insert-disk').addEventListener('click',  () => _insertImageFromDisk(inst));
    win.querySelector('.img-ed-win-insert-files').addEventListener('click', () => _insertImageFromFiles(inst));
    win.querySelector('.img-ed-win-insert-clip').addEventListener('click',  () => _insertImageFromClipboard(inst));
    win.querySelector('#img-ed-rotate-cw').addEventListener('click',  () => _rotate(inst, 90));
    win.querySelector('#img-ed-rotate-ccw').addEventListener('click', () => _rotate(inst, -90));
    win.querySelector('#img-ed-flip-h').addEventListener('click',     () => _flip(inst, 'h'));
    win.querySelector('#img-ed-flip-v').addEventListener('click',     () => _flip(inst, 'v'));
    win.querySelector('#img-ed-resize').addEventListener('click',     () => _showResizeDialog(inst));
    win.querySelector('#img-ed-canvas-size').addEventListener('click',() => _showCanvasSizeDialog(inst));
    win.querySelector('#img-ed-apply-crop').addEventListener('click', () => _applyCrop(inst));
    win.querySelector('#img-ed-cancel-crop').addEventListener('click',() => _cancelCrop(inst));
    win.querySelector('#img-ed-save-overwrite').addEventListener('click', () => _saveOverwrite(inst));
    win.querySelector('#img-ed-save-new').addEventListener('click',       () => _saveNew(inst));
    win.querySelector('#img-ed-download').addEventListener('click',       () => _download(inst));
    win.querySelector('#img-ed-maximize').addEventListener('click',        () => _toggleMaximize(inst));
    win.querySelector('#img-ed-close').addEventListener('click',           () => _close(inst));

    const zoomInp = win.querySelector('.img-ed-zoom-label');
    const _applyZoomInput = () => {
        const v = Math.min(2000, Math.max(1, Math.round(+zoomInp.value || 100)));
        zoomInp.value = v;
        const vp = win.querySelector('.img-editor-viewport');
        const vpW = vp.clientWidth  || 800;
        const vpH = vp.clientHeight || 600;
        const cx = vpW / 2, cy = vpH / 2;
        const newZoom = v / 100;
        inst.panX = cx - (cx - inst.panX) * (newZoom / inst.zoom);
        inst.panY = cy - (cy - inst.panY) * (newZoom / inst.zoom);
        inst.zoom = newZoom;
        _applyTransform(inst);
    };
    zoomInp.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') { ev.preventDefault(); _applyZoomInput(); zoomInp.blur(); }
        if (ev.key === 'Escape') { zoomInp.value = Math.round(inst.zoom * 100); zoomInp.blur(); }
    });
    zoomInp.addEventListener('blur', _applyZoomInput);
    zoomInp.addEventListener('click', ev => { ev.stopPropagation(); zoomInp.select(); });

    const vp = win.querySelector('.img-editor-viewport');
    vp.addEventListener('wheel', e => _onWheel(inst, e, ovCanvas, ovCtx), { passive: false });
    vp.addEventListener('mousedown', e => _onMouseDown(inst, e));
    vp.addEventListener('mousemove', e => _onMouseMove(inst, e, ovCanvas, ovCtx));
    vp.addEventListener('mouseup',   e => _onMouseUp(inst, e, ovCanvas, ovCtx));
    vp.addEventListener('mouseleave', () => _onMouseLeave(inst, ovCanvas, ovCtx));
    vp.addEventListener('click', e => {
        if (_activeTool === 'text') {
            if (inst.textDragJustEnded) { inst.textDragJustEnded = false; return; }
            _placeText(inst, e);
        }
    });
    vp.addEventListener('dblclick', e => { if (_activeTool === 'text') e.stopPropagation(); });

    let _pinchDist0 = null;
    const _touchToMouse = touch => ({
        button: 0, buttons: 1,
        clientX: touch.clientX, clientY: touch.clientY,
        ctrlKey: false, metaKey: false,
        preventDefault: () => {}, stopPropagation: () => {},
    });
    vp.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            _pinchDist0 = Math.sqrt(dx * dx + dy * dy);
            e.preventDefault(); return;
        }
        _pinchDist0 = null;
        if (e.touches.length !== 1) return;
        e.preventDefault();
        _onMouseDown(inst, _touchToMouse(e.touches[0]));
    }, { passive: false });
    vp.addEventListener('touchmove', e => {
        if (e.touches.length === 2 && _pinchDist0 !== null) {
            e.preventDefault();
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const rect = vp.getBoundingClientRect();
            const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
            const my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
            const delta = dist / _pinchDist0;
            _pinchDist0 = dist;
            const newZoom = Math.min(Math.max(inst.zoom * delta, 0.05), 20);
            inst.panX = mx - (mx - inst.panX) * (newZoom / inst.zoom);
            inst.panY = my - (my - inst.panY) * (newZoom / inst.zoom);
            inst.zoom = newZoom;
            _applyTransform(inst);
            _updateCursor(inst);
            _redrawOverlay(inst, ovCanvas, ovCtx);
            return;
        }
        if (e.touches.length !== 1) return;
        e.preventDefault();
        _onMouseMove(inst, _touchToMouse(e.touches[0]), ovCanvas, ovCtx);
    }, { passive: false });
    vp.addEventListener('touchend', e => {
        _pinchDist0 = null;
        const touch = e.changedTouches[0];
        e.preventDefault();
        _onMouseUp(inst, _touchToMouse(touch), ovCanvas, ovCtx);
        if (_activeTool === 'text' && e.changedTouches.length === 1) {
            if (inst.textDragJustEnded) { inst.textDragJustEnded = false; return; }
            _placeText(inst, _touchToMouse(touch));
        }
    }, { passive: false });
    vp.addEventListener('touchcancel', () => {
        _pinchDist0 = null;
        _onMouseLeave(inst, ovCanvas, ovCtx);
    });

    const keyHandler = e => _onKeyDown(inst, e);
    document.addEventListener('keydown', keyHandler);
    win._keyHandler = keyHandler;

    const pasteHandler = e => _onPaste(inst, e);
    document.addEventListener('paste', pasteHandler);
    win._pasteHandler = pasteHandler;

    const ro = new ResizeObserver(() => {
        ovCanvas.width  = vp.clientWidth;
        ovCanvas.height = vp.clientHeight;
        _redrawOverlay(inst, ovCanvas, ovCtx);
    });
    ro.observe(vp);
    win._ro = ro;

    _setTool(inst, 'pan');
}

// ── Window dragging ───────────────────────────────────────────────────────────

function _makeDraggable(win, handle) {
    handle.addEventListener('mousedown', ev => {
        if (ev.button !== 0) return;
        if (ev.target.closest('button, input')) return;
        if (win.classList.contains('img-editor-window--maximized')) return;
        ev.preventDefault();
        const r = win.getBoundingClientRect();
        const dragOff = { x: ev.clientX - r.left, y: ev.clientY - r.top };
        const onMove = mv => {
            win.style.left = (mv.clientX - dragOff.x) + 'px';
            win.style.top  = (mv.clientY - dragOff.y) + 'px';
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup',   onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup',   onUp);
    });

    handle.addEventListener('touchstart', ev => {
        if (ev.touches.length !== 1) return;
        if (ev.target.closest('button, input')) return;
        if (win.classList.contains('img-editor-window--maximized')) return;
        ev.preventDefault();
        const touch = ev.touches[0];
        const r = win.getBoundingClientRect();
        const dragOff = { x: touch.clientX - r.left, y: touch.clientY - r.top };
        const onMove = mv => {
            if (mv.touches.length !== 1) return;
            const t = mv.touches[0];
            win.style.left = (t.clientX - dragOff.x) + 'px';
            win.style.top  = (t.clientY - dragOff.y) + 'px';
        };
        const onEnd = () => {
            document.removeEventListener('touchmove',  onMove);
            document.removeEventListener('touchend',   onEnd);
            document.removeEventListener('touchcancel', onEnd);
        };
        document.addEventListener('touchmove',   onMove,  { passive: false });
        document.addEventListener('touchend',    onEnd);
        document.addEventListener('touchcancel', onEnd);
    }, { passive: false });
}

// ── Focus management ──────────────────────────────────────────────────────────

function _focusInstance(inst) {
    const z = _guiOnTop ? _Z_EDITOR_BEHIND : _nextZIndex++;
    if (_activeInst === inst) {
        inst.winEl.style.zIndex = String(z);
        return;
    }
    _activeInst = inst;
    inst.winEl.style.zIndex = String(z);
    _instances.forEach(i => i.winEl.classList.toggle('img-editor-window--active', i === inst));
    _syncToolbarActiveState();
    _syncCropButtons(inst);
    _updateCursor(inst);
    _updateHint(inst);
}

function _syncCropButtons(inst) {
    if (!inst || !inst.winEl) return;
    const showCrop = _activeTool === 'crop';
    inst.winEl.querySelector('#img-ed-apply-crop').style.display  = showCrop ? '' : 'none';
    inst.winEl.querySelector('#img-ed-cancel-crop').style.display = showCrop ? '' : 'none';
    inst.winEl.querySelector('#img-ed-crop-sep').style.display    = showCrop ? '' : 'none';
}

// ── Tool helpers ──────────────────────────────────────────────────────────────

function _setTool(inst, tool) {
    _cancelTextDialog(inst);
    if (_activeTool === 'select' && tool !== 'select') _clearSelection(inst);
    _activeTool = tool;
    _syncToolbarActiveState();
    _instances.forEach(i => _syncCropButtons(i));
    if (tool !== 'crop') { inst.cropRect = null; inst.cropStart = null; }
    if (tool !== 'blur') {
        inst.blurPreviewRect = null;
        const ov = inst.winEl && inst.winEl.querySelector('.img-editor-overlay-canvas');
        if (ov) _redrawOverlay(inst, ov, ov.getContext('2d'));
    }
    _updateHint(inst);
    _updateCursor(inst);
}

function _updateHint(inst) {
    const hints = {
        pan:       'Fit: F',
        crop:      'Drag to select crop region | Apply / Cancel',
        pen:       'Drag to draw freehand | Size = stroke width',
        text:      'Click on image to place text',
        rect:      'Drag to draw rectangle | Fill/Outline: toolbar toggle',
        ellipse:   'Drag to draw ellipse | Fill/Outline: toolbar toggle',
        line:      'Drag to draw straight line',
        arrow:     'Drag to draw arrow (start → tip)',
        highlight: 'Drag to highlight | semi-transparent | Size = brush width',
        eraser:    'Drag to erase to transparent | Size controls width',
        callout:   'Click to place numbered callout | ↺① resets counter',
        blur:      'Drag to select area to pixelate | Size = block size',
        select:    'Drag to select | drag inside to move | drag handles to resize | Shift = keep aspect | Delete to erase',
    };
    const el = inst.winEl && inst.winEl.querySelector('.img-ed-hint');
    if (el) el.textContent = hints[_activeTool] || '';
}

function _getCrosshairCursorCss() {
    if (_crosshairCursorCss) return _crosshairCursorCss;
    const size = 32;
    const hot = size / 2;
    const arm = 12;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const cx = c.getContext('2d');
    const drawCross = (strokeStyle, lineWidth) => {
        cx.strokeStyle = strokeStyle;
        cx.lineWidth = lineWidth;
        cx.beginPath();
        cx.moveTo(hot - arm, hot); cx.lineTo(hot + arm, hot);
        cx.moveTo(hot, hot - arm); cx.lineTo(hot, hot + arm);
        cx.stroke();
    };
    drawCross('rgba(0,0,0,0.7)', 2);
    drawCross(_crosshairColor, 1);
    _crosshairCursorCss = `url(${c.toDataURL()}) ${hot} ${hot}, crosshair`;
    return _crosshairCursorCss;
}

function _getTextCursorCss() {
    if (_textCursorCss) return _textCursorCss;
    const size = 32;
    const hotX = 16;
    const hotY = 22;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const cx = c.getContext('2d');
    const drawIBeam = (strokeStyle, lineWidth) => {
        cx.strokeStyle = strokeStyle;
        cx.lineWidth = lineWidth;
        cx.beginPath();
        cx.moveTo(12, 6); cx.lineTo(20, 6);
        cx.moveTo(hotX, 6); cx.lineTo(hotX, hotY);
        cx.moveTo(12, hotY); cx.lineTo(20, hotY);
        cx.stroke();
    };
    drawIBeam('rgba(0,0,0,0.7)', 2);
    drawIBeam(_crosshairColor, 1);
    _textCursorCss = `url(${c.toDataURL()}) ${hotX} ${hotY}, text`;
    return _textCursorCss;
}

function _updateCursor(inst) {
    const vp = inst.winEl && inst.winEl.querySelector('.img-editor-viewport');
    if (!vp) return;

    if (_activeTool === 'highlight' || _activeTool === 'eraser') {
        const r = Math.max(2, Math.round(
            (_activeTool === 'highlight' ? _penSize * 8 : _penSize * 4) * inst.zoom * 0.5
        ));
        const size = r * 2 + 4;
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const cx = c.getContext('2d');
        if (_activeTool === 'eraser' && _eraserShape === 'square') {
            const s = r * 2;
            cx.strokeStyle = 'rgba(255,80,80,0.85)'; cx.lineWidth = 1.5;
            cx.strokeRect((size - s) / 2, (size - s) / 2, s, s);
        } else {
            cx.beginPath(); cx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
            if (_activeTool === 'highlight') {
                cx.strokeStyle = 'rgba(0,0,0,0.7)'; cx.lineWidth = 1.5; cx.stroke();
                cx.strokeStyle = 'rgba(255,255,255,0.6)'; cx.lineWidth = 0.8; cx.stroke();
            } else {
                cx.strokeStyle = 'rgba(255,80,80,0.85)'; cx.lineWidth = 1.5; cx.stroke();
            }
        }
        const hot = Math.min(Math.max(0, Math.round(size / 2)), 128);
        vp.style.cursor = `url(${c.toDataURL()}) ${hot} ${hot}, crosshair`;
        return;
    }

    const cross = _getCrosshairCursorCss();
    const text = _getTextCursorCss();
    const cursors = {
        pan: 'grab', crop: cross, pen: cross, text,
        rect: cross, ellipse: cross, line: cross, arrow: cross,
        callout: cross, blur: cross, select: cross,
    };
    vp.style.cursor = cursors[_activeTool] || 'default';
}

// ── Coordinate helpers ────────────────────────────────────────────────────────

function _vpToImg(inst, vpX, vpY) {
    const vp = inst.winEl.querySelector('.img-editor-viewport');
    const rect = vp.getBoundingClientRect();
    return {
        x: (vpX - rect.left  - inst.panX) / inst.zoom,
        y: (vpY - rect.top   - inst.panY) / inst.zoom,
    };
}

function _canvasToVp(inst, ix, iy) {
    return { x: ix * inst.zoom + inst.panX, y: iy * inst.zoom + inst.panY };
}

// ── Undo / Redo ───────────────────────────────────────────────────────────────

function _pushUndo(inst) {
    if (inst.canvas.width === 0 || inst.canvas.height === 0) return;
    inst.undoStack.push(inst.ctx.getImageData(0, 0, inst.canvas.width, inst.canvas.height));
    if (inst.undoStack.length > MAX_UNDO) inst.undoStack.shift();
    inst.redoStack = [];
    _updateSizeLabel(inst);
}

function _undo(inst) {
    if (inst.undoStack.length <= 1) return;
    inst.redoStack.push(inst.undoStack.pop());
    const state = inst.undoStack[inst.undoStack.length - 1];
    inst.canvas.width  = state.width;
    inst.canvas.height = state.height;
    inst.ctx.putImageData(state, 0, 0);
    _updateSizeLabel(inst);
}

function _redo(inst) {
    if (!inst.redoStack.length) return;
    const state = inst.redoStack.pop();
    inst.undoStack.push(state);
    inst.canvas.width  = state.width;
    inst.canvas.height = state.height;
    inst.ctx.putImageData(state, 0, 0);
    _updateSizeLabel(inst);
}

function _gotoBegin(inst) {
    if (inst.undoStack.length < 1) return;
    const original = inst.undoStack[0];
    inst.canvas.width  = original.width;
    inst.canvas.height = original.height;
    inst.ctx.putImageData(original, 0, 0);
    _fitToView(inst);
    _updateSizeLabel(inst);
}

// ── Zoom & Pan ────────────────────────────────────────────────────────────────

function _fitToView(inst) {
    const vp = inst.winEl.querySelector('.img-editor-viewport');
    const vpW = vp.clientWidth  || 800;
    const vpH = vp.clientHeight || 600;
    const scaleX = vpW / inst.canvas.width;
    const scaleY = vpH / inst.canvas.height;
    inst.zoom = Math.min(scaleX, scaleY, 1) * 0.95;
    inst.panX = (vpW - inst.canvas.width  * inst.zoom) / 2;
    inst.panY = (vpH - inst.canvas.height * inst.zoom) / 2;
    _applyTransform(inst);
}

function _applyTransform(inst) {
    if (!inst.canvas) return;
    inst.canvas.style.transform       = `translate(${inst.panX}px, ${inst.panY}px) scale(${inst.zoom})`;
    inst.canvas.style.transformOrigin = '0 0';
    const zl = inst.winEl && inst.winEl.querySelector('.img-ed-zoom-label');
    if (zl && document.activeElement !== zl) zl.value = Math.round(inst.zoom * 100);
}

function _onWheel(inst, e, ovCanvas, ovCtx) {
    e.preventDefault();
    const vp = inst.winEl.querySelector('.img-editor-viewport');
    const rect = vp.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const newZoom = Math.min(Math.max(inst.zoom * delta, 0.05), 20);
    inst.panX = mx - (mx - inst.panX) * (newZoom / inst.zoom);
    inst.panY = my - (my - inst.panY) * (newZoom / inst.zoom);
    inst.zoom = newZoom;
    _applyTransform(inst);
    _updateCursor(inst);
    _redrawOverlay(inst, ovCanvas, ovCtx);
}

// ── Mouse events ──────────────────────────────────────────────────────────────

function _onMouseDown(inst, e) {
    if (e.button !== 0) return;

    if (inst.textDialogEl && inst.textBBox) {
        const imgPt = _vpToImg(inst, e.clientX, e.clientY);
        if (imgPt.x >= inst.textBBox.x && imgPt.x <= inst.textBBox.x + inst.textBBox.w &&
            imgPt.y >= inst.textBBox.y && imgPt.y <= inst.textBBox.y + inst.textBBox.h) {
            inst.isDraggingText = true;
            inst.textDragOff = { dx: imgPt.x - inst.textPos.x, dy: imgPt.y - inst.textPos.y };
            return;
        }
    }

    if (_activeTool === 'select' && !e.ctrlKey) {
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        if (inst.selRect) {
            const handle = _hitTestSelHandle(inst, pt);
            if (handle) {
                if (!inst.selImageData) _liftSelection(inst);
                if (inst.selImageData) {
                    inst.isResizingSel   = true;
                    inst.selResizeHandle = handle;
                    inst.selResizeStart  = { ...inst.selRect };
                    return;
                }
            }
            if (_ptInRect(pt, inst.selRect)) {
                if (!inst.selImageData) _liftSelection(inst);
                inst.isMovingSel = true;
                inst.selMoveOff  = { dx: pt.x - inst.selRect.x, dy: pt.y - inst.selRect.y };
                return;
            }
        }
        _clearSelection(inst);
        inst.isSelectingRect = true;
        inst.selStart = pt;
        inst.selRect  = null;
        return;
    }

    if (_activeTool === 'pan' || e.ctrlKey) {
        inst.isPanning = true;
        inst.panStart  = { x: e.clientX - inst.panX, y: e.clientY - inst.panY };
        const vp = inst.winEl.querySelector('.img-editor-viewport');
        vp.style.cursor = 'grabbing';
        return;
    }

    if (_activeTool === 'crop') {
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        inst.isCropping = true;
        inst.cropStart  = pt;
        inst.cropRect   = null;
        return;
    }

    if (_activeTool === 'pen') {
        inst.isDrawing = true;
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        inst.lastDrawPt = pt;
        inst.ctx.beginPath();
        inst.ctx.arc(pt.x, pt.y, _penSize / 2, 0, Math.PI * 2);
        inst.ctx.fillStyle = _penColor;
        inst.ctx.fill();
        return;
    }

    if (_activeTool === 'highlight') {
        inst.isDrawing = true;
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        inst.lastDrawPt = pt;
        inst.hlPath = [pt];
        inst.shapeSnapshot = inst.ctx.getImageData(0, 0, inst.canvas.width, inst.canvas.height);
        return;
    }

    if (_activeTool === 'eraser') {
        inst.isDrawing = true;
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        inst.lastDrawPt = pt;
        inst.ctx.save();
        if (_bgColor) { inst.ctx.fillStyle = _bgColor; }
        else { inst.ctx.globalCompositeOperation = 'destination-out'; inst.ctx.fillStyle = 'rgba(0,0,0,1)'; }
        if (_eraserShape === 'square') {
            const s = _penSize * 4;
            inst.ctx.fillRect(pt.x - s / 2, pt.y - s / 2, s, s);
        } else {
            inst.ctx.beginPath(); inst.ctx.arc(pt.x, pt.y, _penSize * 2, 0, Math.PI * 2); inst.ctx.fill();
        }
        inst.ctx.restore();
        return;
    }

    if (['rect', 'ellipse', 'line', 'arrow', 'callout', 'blur'].includes(_activeTool)) {
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        inst.isShaping     = true;
        inst.shapeStart    = pt;
        inst.shapeSnapshot = inst.ctx.getImageData(0, 0, inst.canvas.width, inst.canvas.height);
        return;
    }
}

function _onMouseMove(inst, e, ovCanvas, ovCtx) {
    if (inst.isDraggingText && inst.textPos) {
        const imgPt = _vpToImg(inst, e.clientX, e.clientY);
        inst.textPos.x = imgPt.x - inst.textDragOff.dx;
        inst.textPos.y = imgPt.y - inst.textDragOff.dy;
        if (inst.textPreviewFn) inst.textPreviewFn();
        return;
    }

    if (inst.textDialogEl && inst.textBBox && !inst.isDraggingText) {
        const imgPt = _vpToImg(inst, e.clientX, e.clientY);
        const inBox = imgPt.x >= inst.textBBox.x && imgPt.x <= inst.textBBox.x + inst.textBBox.w &&
                      imgPt.y >= inst.textBBox.y && imgPt.y <= inst.textBBox.y + inst.textBBox.h;
        const vp = inst.winEl && inst.winEl.querySelector('.img-editor-viewport');
        if (vp) vp.style.cursor = inBox ? 'move' : _getTextCursorCss();
    }

    if (_activeTool === 'select' && inst.selRect && !inst.isSelectingRect && !inst.isMovingSel && !inst.isResizingSel) {
        const selPt = _vpToImg(inst, e.clientX, e.clientY);
        const vpEl  = inst.winEl && inst.winEl.querySelector('.img-editor-viewport');
        if (vpEl) {
            const handle = _hitTestSelHandle(inst, selPt);
            if (handle) vpEl.style.cursor = _cursorForSelHandle(handle);
            else if (_ptInRect(selPt, inst.selRect)) vpEl.style.cursor = 'move';
            else vpEl.style.cursor = _getCrosshairCursorCss();
        }
    }

    if (inst.isPanning) {
        inst.panX = e.clientX - inst.panStart.x;
        inst.panY = e.clientY - inst.panStart.y;
        _applyTransform(inst);
        _redrawOverlay(inst, ovCanvas, ovCtx);
        return;
    }

    if (inst.isCropping && inst.cropStart) {
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        inst.cropRect = _normRect(inst.cropStart, pt);
        _redrawOverlay(inst, ovCanvas, ovCtx);
        return;
    }

    if (inst.isSelectingRect && inst.selStart) {
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        inst.selRect = _normRect(inst.selStart, pt);
        _redrawOverlay(inst, ovCanvas, ovCtx);
        return;
    }

    if (inst.isMovingSel && inst.selImageData) {
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        const newX = pt.x - inst.selMoveOff.dx;
        const newY = pt.y - inst.selMoveOff.dy;
        inst.selRect = { x: newX, y: newY, w: inst.selRect.w, h: inst.selRect.h };
        inst.ctx.putImageData(inst.selHoleSnapshot, 0, 0);
        _drawFloatedAt(inst, newX, newY);
        _redrawOverlay(inst, ovCanvas, ovCtx);
        return;
    }

    if (inst.isResizingSel && inst.selImageData && inst.selResizeStart) {
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        inst.selRect = _computeResizeRect(inst.selResizeStart, inst.selResizeHandle, pt, e.shiftKey);
        inst.ctx.putImageData(inst.selHoleSnapshot, 0, 0);
        _drawFloatedAt(inst, inst.selRect.x, inst.selRect.y);
        _redrawOverlay(inst, ovCanvas, ovCtx);
        return;
    }

    if (inst.isDrawing && inst.lastDrawPt) {
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        if (_activeTool === 'pen') {
            inst.ctx.beginPath();
            inst.ctx.moveTo(inst.lastDrawPt.x, inst.lastDrawPt.y);
            inst.ctx.lineTo(pt.x, pt.y);
            inst.ctx.strokeStyle = _penColor;
            inst.ctx.lineWidth   = _penSize;
            inst.ctx.lineCap     = 'round';
            inst.ctx.lineJoin    = 'round';
            inst.ctx.stroke();
        } else if (_activeTool === 'highlight') {
            inst.hlPath.push(pt);
            inst.ctx.putImageData(inst.shapeSnapshot, 0, 0);
            const off = document.createElement('canvas');
            off.width = inst.canvas.width; off.height = inst.canvas.height;
            const oc = off.getContext('2d');
            oc.strokeStyle = _penColor; oc.lineWidth = _penSize * 8;
            oc.lineCap = 'round'; oc.lineJoin = 'round';
            oc.beginPath();
            oc.moveTo(inst.hlPath[0].x, inst.hlPath[0].y);
            for (let i = 1; i < inst.hlPath.length; i++) oc.lineTo(inst.hlPath[i].x, inst.hlPath[i].y);
            oc.stroke();
            inst.ctx.save(); inst.ctx.globalAlpha = 0.25; inst.ctx.drawImage(off, 0, 0); inst.ctx.restore();
        } else if (_activeTool === 'eraser') {
            inst.ctx.save();
            if (_bgColor) { inst.ctx.fillStyle = _bgColor; inst.ctx.strokeStyle = _bgColor; }
            else { inst.ctx.globalCompositeOperation = 'destination-out'; inst.ctx.strokeStyle = 'rgba(0,0,0,1)'; }
            if (_eraserShape === 'square') {
                const s = _penSize * 4;
                const dx = pt.x - inst.lastDrawPt.x, dy = pt.y - inst.lastDrawPt.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const steps = Math.max(1, Math.ceil(dist / (s * 0.5)));
                for (let i = 0; i <= steps; i++) {
                    const tx = inst.lastDrawPt.x + (dx * i) / steps;
                    const ty = inst.lastDrawPt.y + (dy * i) / steps;
                    inst.ctx.fillRect(tx - s / 2, ty - s / 2, s, s);
                }
            } else {
                inst.ctx.beginPath();
                inst.ctx.moveTo(inst.lastDrawPt.x, inst.lastDrawPt.y);
                inst.ctx.lineTo(pt.x, pt.y);
                inst.ctx.lineWidth = _penSize * 4; inst.ctx.lineCap = 'round'; inst.ctx.lineJoin = 'round';
                inst.ctx.stroke();
            }
            inst.ctx.restore();
        }
        inst.lastDrawPt = pt;
        return;
    }

    if (inst.isShaping && inst.shapeStart) {
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        if (_activeTool === 'blur') {
            inst.blurPreviewRect = _normRect(inst.shapeStart, pt);
            _redrawOverlay(inst, ovCanvas, ovCtx);
        } else {
            inst.ctx.putImageData(inst.shapeSnapshot, 0, 0);
            _applyShapeToCtx(inst, inst.shapeStart, pt);
        }
        return;
    }
}

function _onMouseUp(inst, e, ovCanvas, ovCtx) {
    if (inst.isDraggingText) {
        inst.isDraggingText    = false;
        inst.textDragOff       = null;
        inst.textDragJustEnded = true;
        return;
    }

    if (inst.isSelectingRect) {
        inst.isSelectingRect = false;
        if (!inst.selRect || inst.selRect.w < 2 || inst.selRect.h < 2) {
            inst.selRect = null;
            _redrawOverlay(inst, ovCanvas, ovCtx);
        }
        _updateCursor(inst);
        return;
    }

    if (inst.isMovingSel) {
        inst.isMovingSel = false;
        inst.selMoveOff  = null;
        if (inst.selImageData) {
            inst.selImageData    = null;
            inst.selHoleSnapshot = null;
            _pushUndo(inst);
        }
        _updateCursor(inst);
        return;
    }

    if (inst.isResizingSel) {
        inst.isResizingSel   = false;
        inst.selResizeHandle = null;
        inst.selResizeStart  = null;
        if (inst.selImageData) {
            inst.selImageData    = null;
            inst.selHoleSnapshot = null;
            _pushUndo(inst);
        }
        _updateCursor(inst);
        return;
    }

    if (inst.isPanning) { inst.isPanning = false; _updateCursor(inst); return; }
    if (inst.isCropping) { inst.isCropping = false; return; }

    if (inst.isDrawing) {
        inst.isDrawing  = false;
        inst.lastDrawPt = null;
        inst.hlPath     = [];
        inst.shapeSnapshot = null;
        _pushUndo(inst);
        return;
    }

    if (inst.isShaping) {
        inst.isShaping = false;
        const pt = _vpToImg(inst, e.clientX, e.clientY);
        if (_activeTool === 'blur') {
            const rect = _normRect(inst.shapeStart, pt);
            if (rect.w > 2 && rect.h > 2) _applyBlur(inst, rect);
            inst.blurPreviewRect = null;
            _redrawOverlay(inst, ovCanvas, ovCtx);
        } else {
            inst.ctx.putImageData(inst.shapeSnapshot, 0, 0);
            _commitShape(inst, inst.shapeStart, pt);
            if (_activeTool === 'callout') inst.calloutCount++;
        }
        inst.shapeSnapshot = null;
        inst.shapeStart    = null;
        _pushUndo(inst);
        return;
    }
}

function _onMouseLeave(inst, ovCanvas, ovCtx) {
    if (inst.isDrawing) {
        inst.isDrawing  = false;
        inst.lastDrawPt = null;
        inst.hlPath     = [];
        if (inst.shapeSnapshot && _activeTool === 'highlight') inst.shapeSnapshot = null;
        _pushUndo(inst);
    }
    if (inst.isShaping) {
        if (inst.shapeSnapshot) { inst.ctx.putImageData(inst.shapeSnapshot, 0, 0); inst.shapeSnapshot = null; }
        inst.isShaping = false; inst.shapeStart = null; inst.blurPreviewRect = null;
        _redrawOverlay(inst, ovCanvas, ovCtx);
    }
    if (inst.isPanning) { inst.isPanning = false; _updateCursor(inst); }
    if (inst.isSelectingRect) {
        inst.isSelectingRect = false;
        if (!inst.selRect || inst.selRect.w < 2 || inst.selRect.h < 2) inst.selRect = null;
    }
    if (inst.isMovingSel) {
        inst.isMovingSel = false; inst.selMoveOff = null;
        if (inst.selImageData) {
            inst.selImageData = null; inst.selHoleSnapshot = null; _pushUndo(inst);
        }
        _updateCursor(inst);
    }
    if (inst.isResizingSel) {
        inst.isResizingSel = false; inst.selResizeHandle = null; inst.selResizeStart = null;
        if (inst.selImageData) {
            inst.selImageData = null; inst.selHoleSnapshot = null; _pushUndo(inst);
        }
        _updateCursor(inst);
    }
}

function _onKeyDown(inst, e) {
    if (inst !== _activeInst) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); _undo(inst); return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); _redo(inst); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (_activeTool === 'select' && inst.selRect) { e.preventDefault(); _copySelection(inst); }
        return;
    }
    if (e.key === 'f' || e.key === 'F') { _fitToView(inst); return; }
    if (e.key === 'Escape') {
        _cancelCrop(inst);
        if (inst.pendingInsertSnapshot) {
            _cancelPendingInsert(inst);
            _setTool(inst, 'pan');
            return;
        }
        if (_activeTool === 'select') _clearSelection(inst);
        _setTool(inst, 'pan');
        return;
    }
    if ((e.key === 'Delete' || e.key === 'Backspace') && _activeTool === 'select' && inst.selRect) {
        e.preventDefault(); _deleteSelection(inst); return;
    }
}

function _onPaste(inst, e) {
    if (inst !== _activeInst) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    if (imageItem) {
        e.preventDefault();
        const file = imageItem.getAsFile();
        if (!file) return;
        showImageInsertDialog(file, dataUrl => _insertImageFromDataUrl(inst, dataUrl));
        return;
    }

    if (_clipboardData) {
        e.preventDefault();
        imageDataToFile(_clipboardData, 'paste.png').then(file => {
            showImageInsertDialog(file, dataUrl => _insertImageFromDataUrl(inst, dataUrl));
        });
    }
}

// ── Overlay canvas ────────────────────────────────────────────────────────────

function _redrawOverlay(inst, ov, ovCtx) {
    ovCtx.clearRect(0, 0, ov.width, ov.height);

    if (inst.textBBox) {
        const tl = _canvasToVp(inst, inst.textBBox.x, inst.textBBox.y);
        const br = _canvasToVp(inst, inst.textBBox.x + inst.textBBox.w, inst.textBBox.y + inst.textBBox.h);
        const rx = tl.x, ry = tl.y, rw = br.x - tl.x, rh = br.y - tl.y;
        ovCtx.strokeStyle = 'rgba(80,160,255,0.9)'; ovCtx.lineWidth = 1.5;
        ovCtx.setLineDash([4, 3]); ovCtx.strokeRect(rx, ry, rw, rh); ovCtx.setLineDash([]);
        ovCtx.fillStyle = 'rgba(80,160,255,0.85)'; ovCtx.fillRect(rx - 1, ry - 16, 20, 16);
        ovCtx.fillStyle = '#fff'; ovCtx.font = '11px sans-serif'; ovCtx.textBaseline = 'middle';
        ovCtx.fillText('\u2725', rx + 2, ry - 8);
    }

    if (_activeTool === 'select' && inst.selRect) {
        const { x, y, w, h } = inst.selRect;
        const tl = _canvasToVp(inst, x, y);
        const br = _canvasToVp(inst, x + w, y + h);
        const rx = tl.x, ry = tl.y, rw = br.x - tl.x, rh = br.y - tl.y;
        ovCtx.strokeStyle = '#0078d7'; ovCtx.lineWidth = 1.5;
        ovCtx.setLineDash([5, 3]); ovCtx.strokeRect(rx, ry, rw, rh); ovCtx.setLineDash([]);
        const hs = 6;
        [[rx, ry], [rx + rw / 2, ry], [rx + rw, ry],
         [rx, ry + rh / 2],            [rx + rw, ry + rh / 2],
         [rx, ry + rh], [rx + rw / 2, ry + rh], [rx + rw, ry + rh]].forEach(([hx, hy]) => {
            ovCtx.fillStyle = '#fff'; ovCtx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
            ovCtx.strokeStyle = '#0078d7'; ovCtx.lineWidth = 1; ovCtx.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
        });
        const lbl = `${Math.round(w)} \u00d7 ${Math.round(h)}`;
        const lblW = lbl.length * 6 + 10;
        ovCtx.fillStyle = 'rgba(0,120,215,0.85)'; ovCtx.fillRect(rx, ry - 18, lblW, 16);
        ovCtx.fillStyle = '#fff'; ovCtx.font = '10px sans-serif'; ovCtx.textBaseline = 'middle';
        ovCtx.fillText(lbl, rx + 4, ry - 10);
    }

    if (_activeTool === 'blur' && inst.blurPreviewRect) {
        const { x, y, w, h } = inst.blurPreviewRect;
        const tl = _canvasToVp(inst, x, y);
        const br = _canvasToVp(inst, x + w, y + h);
        ovCtx.strokeStyle = '#fff'; ovCtx.lineWidth = 1.5;
        ovCtx.setLineDash([5, 3]); ovCtx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y); ovCtx.setLineDash([]);
        ovCtx.fillStyle = 'rgba(0,0,0,0.6)'; ovCtx.fillRect(tl.x, tl.y - 18, 64, 16);
        ovCtx.fillStyle = '#fff'; ovCtx.font = '10px sans-serif'; ovCtx.textBaseline = 'top';
        ovCtx.fillText('Pixelate', tl.x + 4, tl.y - 17);
        return;
    }

    if (_activeTool !== 'crop' || !inst.cropRect) return;

    const { x, y, w, h } = inst.cropRect;
    const tl = _canvasToVp(inst, x, y);
    const br = _canvasToVp(inst, x + w, y + h);
    const rx = tl.x, ry = tl.y, rw = br.x - tl.x, rh = br.y - tl.y;

    ovCtx.fillStyle = 'rgba(0,0,0,0.5)'; ovCtx.fillRect(0, 0, ov.width, ov.height);
    ovCtx.clearRect(rx, ry, rw, rh);
    ovCtx.strokeStyle = '#fff'; ovCtx.lineWidth = 1;
    ovCtx.setLineDash([4, 4]); ovCtx.strokeRect(rx, ry, rw, rh); ovCtx.setLineDash([]);
    ovCtx.strokeStyle = 'rgba(255,255,255,0.35)'; ovCtx.lineWidth = 0.5;
    for (let i = 1; i < 3; i++) {
        ovCtx.beginPath(); ovCtx.moveTo(rx + rw * i / 3, ry); ovCtx.lineTo(rx + rw * i / 3, ry + rh); ovCtx.stroke();
        ovCtx.beginPath(); ovCtx.moveTo(rx, ry + rh * i / 3); ovCtx.lineTo(rx + rw, ry + rh * i / 3); ovCtx.stroke();
    }
}

// ── Image operations ──────────────────────────────────────────────────────────

function _rotate(inst, deg) {
    const w = inst.canvas.width, h = inst.canvas.height;
    const tmp = document.createElement('canvas');
    const tc  = tmp.getContext('2d');
    if (deg === 90 || deg === -270) { tmp.width = h; tmp.height = w; tc.translate(h, 0); tc.rotate(Math.PI / 2); }
    else                            { tmp.width = h; tmp.height = w; tc.translate(0, w); tc.rotate(-Math.PI / 2); }
    tc.drawImage(inst.canvas, 0, 0);
    inst.canvas.width = tmp.width; inst.canvas.height = tmp.height;
    inst.ctx.drawImage(tmp, 0, 0);
    _fitToView(inst); _pushUndo(inst);
}

function _flip(inst, dir) {
    const w = inst.canvas.width, h = inst.canvas.height;
    const tmp = document.createElement('canvas');
    tmp.width = w; tmp.height = h;
    const tc = tmp.getContext('2d');
    if (dir === 'h') { tc.translate(w, 0); tc.scale(-1, 1); }
    else             { tc.translate(0, h); tc.scale(1, -1); }
    tc.drawImage(inst.canvas, 0, 0);
    inst.ctx.clearRect(0, 0, w, h);
    inst.ctx.drawImage(tmp, 0, 0);
    _pushUndo(inst);
}

function _applyCrop(inst) {
    if (!inst.cropRect || inst.cropRect.w < 2 || inst.cropRect.h < 2) { _cancelCrop(inst); return; }
    const { x, y, w, h } = inst.cropRect;
    const cx = Math.max(0, Math.round(x));
    const cy = Math.max(0, Math.round(y));
    const cw = Math.min(inst.canvas.width  - cx, Math.round(w));
    const ch = Math.min(inst.canvas.height - cy, Math.round(h));
    if (cw < 1 || ch < 1) { _cancelCrop(inst); return; }
    const id = inst.ctx.getImageData(cx, cy, cw, ch);
    inst.canvas.width  = cw; inst.canvas.height = ch;
    inst.ctx.putImageData(id, 0, 0);
    _cancelCrop(inst); _fitToView(inst); _pushUndo(inst);
}

function _cancelCrop(inst) {
    inst.cropRect  = null; inst.cropStart = null; inst.isCropping = false;
    const ov = inst.winEl && inst.winEl.querySelector('.img-editor-overlay-canvas');
    if (ov) { const c = ov.getContext('2d'); c.clearRect(0, 0, ov.width, ov.height); }
    if (_activeTool === 'crop') _setTool(inst, 'pan');
}

// ── Text placement ────────────────────────────────────────────────────────────

function _placeText(inst, e) {
    _cancelTextDialog(inst);
    inst.textPos = _vpToImg(inst, e.clientX, e.clientY);
    inst.textSnapshot = inst.ctx.getImageData(0, 0, inst.canvas.width, inst.canvas.height);

    const bgChecked = _bgColor ? 'checked' : '';
    const bgVal     = _bgColor || '#ffffff';
    const bgOpacity = _bgColor ? '1' : '0.4';

    const dlg = document.createElement('div');
    dlg.className = 'img-ed-text-dialog';
    dlg.style.left = (e.clientX + 14) + 'px';
    dlg.style.top  = (e.clientY + 14) + 'px';
    dlg.innerHTML = `
        <div class="img-ed-txt-drag-handle" title="Drag to move">✎ Insert text</div>
        <textarea class="img-ed-txt-input" placeholder="Enter text… (Enter = new line, Ctrl+Enter = confirm)" autocomplete="off" spellcheck="false" rows="3"></textarea>
        <div class="img-ed-text-opts">
            <label title="Text color">Color <input type="color" class="img-ed-txt-color" value="${_textColor}"></label>
            <label title="Font size (px)">Size <input type="number" class="img-ed-txt-size" min="6" max="400" value="${_fontSize}" style="width:52px"></label>
            <label title="Text background color">
                <input type="checkbox" class="img-ed-txt-bg-en" ${bgChecked}>
                BG <input type="color" class="img-ed-txt-bg-col" value="${bgVal}" style="opacity:${bgOpacity}">
            </label>
        </div>
        <div class="img-ed-text-btns">
            <button class="img-ed-btn img-ed-btn-primary img-ed-txt-ok" title="Confirm (Ctrl+Enter)">OK</button>
            <button class="img-ed-btn img-ed-txt-cancel">Cancel</button>
        </div>`;

    inst.winEl.appendChild(dlg);
    inst.textDialogEl = dlg;

    const dr = dlg.getBoundingClientRect();
    if (dr.right  > window.innerWidth  - 8) dlg.style.left = (window.innerWidth  - dr.width  - 8) + 'px';
    if (dr.bottom > window.innerHeight - 8) dlg.style.top  = (window.innerHeight - dr.height - 8) + 'px';

    const textInput = dlg.querySelector('.img-ed-txt-input');
    const colorInp  = dlg.querySelector('.img-ed-txt-color');
    const sizeInp   = dlg.querySelector('.img-ed-txt-size');
    const bgEnCb    = dlg.querySelector('.img-ed-txt-bg-en');
    const bgColInp  = dlg.querySelector('.img-ed-txt-bg-col');
    let localBg    = _bgColor;
    let localColor = _textColor;
    let localSize  = _fontSize;

    const handle = dlg.querySelector('.img-ed-txt-drag-handle');
    handle.addEventListener('mousedown', ev => {
        if (ev.button !== 0) return;
        ev.preventDefault();
        const r = dlg.getBoundingClientRect();
        const dlgDragOff = { x: ev.clientX - r.left, y: ev.clientY - r.top };
        const onMove = mv => { dlg.style.left = (mv.clientX - dlgDragOff.x) + 'px'; dlg.style.top = (mv.clientY - dlgDragOff.y) + 'px'; };
        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
        document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    });
    handle.addEventListener('touchstart', ev => {
        ev.preventDefault();
        const r = dlg.getBoundingClientRect();
        const dlgDragOff = { x: ev.touches[0].clientX - r.left, y: ev.touches[0].clientY - r.top };
        const onMove = mv => { dlg.style.left = (mv.touches[0].clientX - dlgDragOff.x) + 'px'; dlg.style.top = (mv.touches[0].clientY - dlgDragOff.y) + 'px'; };
        const onEnd = () => { handle.removeEventListener('touchmove', onMove); handle.removeEventListener('touchend', onEnd); };
        handle.addEventListener('touchmove', onMove, { passive: false });
        handle.addEventListener('touchend', onEnd);
    }, { passive: false });

    const _getOvCanvas = () => inst.winEl && inst.winEl.querySelector('.img-editor-overlay-canvas');

    const _drawMultiline = txt => {
        const lineHeight = localSize * 1.25;
        const lines = txt.split('\n');
        const pad   = Math.max(2, Math.round(localSize * 0.15));
        inst.ctx.font = `${localSize}px ${_fontFamily}`; inst.ctx.textBaseline = 'top';
        const maxW   = lines.reduce((m, l) => Math.max(m, inst.ctx.measureText(l).width), 0);
        const totalH = lines.length * lineHeight;
        inst.textBBox = { x: inst.textPos.x - pad, y: inst.textPos.y - pad, w: Math.max(maxW + pad * 2, 20), h: totalH + pad * 2 };
        if (localBg) { inst.ctx.fillStyle = localBg; inst.ctx.fillRect(inst.textPos.x - pad, inst.textPos.y - pad, maxW + pad * 2, totalH + pad * 2); }
        inst.ctx.fillStyle = localColor;
        lines.forEach((line, i) => inst.ctx.fillText(line, inst.textPos.x, inst.textPos.y + i * lineHeight));
    };

    const _preview = () => {
        inst.ctx.putImageData(inst.textSnapshot, 0, 0);
        const txt = textInput.value;
        if (!txt) inst.textBBox = null; else _drawMultiline(txt);
        const ov = _getOvCanvas();
        if (ov) _redrawOverlay(inst, ov, ov.getContext('2d'));
    };

    inst.textPreviewFn = _preview;
    textInput.addEventListener('input', _preview);
    colorInp.addEventListener('input', () => { localColor = colorInp.value; _textColor = localColor; _preview(); });
    sizeInp.addEventListener('input', () => { localSize = Math.max(6, Math.min(400, +sizeInp.value || localSize)); _fontSize = localSize; _preview(); });
    bgEnCb.addEventListener('change', () => { localBg = bgEnCb.checked ? bgColInp.value : null; bgColInp.style.opacity = bgEnCb.checked ? '1' : '0.4'; _preview(); });
    bgColInp.addEventListener('input', () => { if (bgEnCb.checked) { localBg = bgColInp.value; _preview(); } });

    const _confirm = () => {
        const txt = textInput.value;
        if (txt) { _preview(); _pushUndo(inst); } else { inst.ctx.putImageData(inst.textSnapshot, 0, 0); }
        _closeTextDialog(inst);
    };
    const _cancel = () => {
        if (inst.textSnapshot) inst.ctx.putImageData(inst.textSnapshot, 0, 0);
        _closeTextDialog(inst);
    };

    dlg.querySelector('.img-ed-txt-ok').addEventListener('click', _confirm);
    dlg.querySelector('.img-ed-txt-cancel').addEventListener('click', _cancel);
    textInput.addEventListener('keydown', ev => {
        if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); _confirm(); }
        if (ev.key === 'Escape') { ev.preventDefault(); _cancel(); }
    });
    textInput.focus();
}

function _closeTextDialog(inst) {
    if (inst.textDialogEl) { inst.textDialogEl.remove(); inst.textDialogEl = null; }
    inst.textSnapshot = null; inst.textBBox = null; inst.textPos = null;
    inst.textPreviewFn = null; inst.isDraggingText = false; inst.textDragOff = null;
    const ov = inst.winEl && inst.winEl.querySelector('.img-editor-overlay-canvas');
    if (ov) _redrawOverlay(inst, ov, ov.getContext('2d'));
}

function _cancelTextDialog(inst) {
    if (inst.textSnapshot && inst.canvas) inst.ctx.putImageData(inst.textSnapshot, 0, 0);
    _closeTextDialog(inst);
}

// ── OCR ───────────────────────────────────────────────────────────────────────

function _placeRecognizedTextOnCanvas(inst, text, origin = { x: 20, y: 20 }) {
    const trimmed = String(text || '').trim();
    if (!trimmed) return;
    _pushUndo(inst);
    inst.ctx.font = `${_fontSize}px ${_fontFamily}`;
    inst.ctx.fillStyle = _textColor;
    inst.ctx.textBaseline = 'top';
    const lineHeight = _fontSize * 1.25;
    const lines = trimmed.split('\n');
    lines.forEach((line, i) => inst.ctx.fillText(line, origin.x, origin.y + i * lineHeight));
}

async function _runOcrOnImage(inst) {
    if (!inst.canvas) return;

    const sel = inst.selRect;
    const useSelection = sel && sel.w >= 4 && sel.h >= 4;
    const imageSource = useSelection ? canvasRegionToCanvas(inst.canvas, sel) : inst.canvas;
    const rectangle = useSelection
        ? { left: 0, top: 0, width: imageSource.width, height: imageSource.height }
        : undefined;

    const ocrBtn = _toolbarEl?.querySelector('#img-ed-ocr');
    if (ocrBtn) ocrBtn.disabled = true;

    try {
        const text = await runOcrWithProgress(onProgress =>
            runOcr(imageSource, { onProgress, rectangle })
        );

        if (text === null) return;

        if (!text) {
            alert('Na obrázku nebyl rozpoznán žádný text.');
            return;
        }

        const origin = useSelection
            ? { x: Math.round(sel.x), y: Math.round(sel.y) }
            : { x: 20, y: 20 };

        const { insertTextIntoActiveDocument, isDocumentEditorOpen } = await import('./documentsUtils.js');

        showOcrResultDialog(text, {
            canInsertToDoc: isDocumentEditorOpen(),
            onPlaceOnImage: val => _placeRecognizedTextOnCanvas(inst, val, origin),
            onInsertToDoc: val => {
                if (!insertTextIntoActiveDocument(val)) {
                    alert('Otevřete dokument v režimu úprav pro vložení textu.');
                }
            },
        });
    } catch (err) {
        console.error(err);
        alert(`OCR selhalo: ${err.message || err}`);
    } finally {
        if (ocrBtn) ocrBtn.disabled = false;
    }
}

// ── Canvas Size dialog ────────────────────────────────────────────────────────

function _showCanvasSizeDialog(inst) {
    if (inst.canvasSizeDialogEl) inst.canvasSizeDialogEl.remove();
    const origW = inst.canvas.width;
    const origH = inst.canvas.height;

    const dlg = document.createElement('div');
    dlg.className = 'img-ed-resize-dialog';
    dlg.innerHTML = `
        <div class="img-ed-resize-title">Canvas Size</div>
        <div class="img-ed-resize-row"><label>Width\u00a0 <input type="number" id="img-ed-csw" min="1" value="${origW}" style="width:80px"> px</label></div>
        <div class="img-ed-resize-row"><label>Height <input type="number" id="img-ed-csh" min="1" value="${origH}" style="width:80px"> px</label></div>
        <div class="img-ed-resize-row" style="margin-top:10px;font-size:11px;color:#aaa">Anchor</div>
        <div id="img-ed-cs-anchor" style="display:grid;grid-template-columns:repeat(3,26px);gap:3px;margin-bottom:10px">
            ${ ['nw','n','ne','w','c','e','sw','s','se'].map(k =>
                `<button class="img-ed-anchor-btn${k==='c'?' active':''}" data-anchor="${k}" style="width:26px;height:26px;padding:0;font-size:13px">${
                    {nw:'↖',n:'↑',ne:'↗',w:'←',c:'·',e:'→',sw:'↙',s:'↓',se:'↘'}[k]
                }</button>`
            ).join('') }
        </div>
        <div class="img-ed-resize-row" style="font-size:11px;color:#888">Fill: <span id="img-ed-cs-fill-label"></span></div>
        <div class="img-ed-resize-btns">
            <button class="img-ed-btn img-ed-btn-primary" id="img-ed-csapply">Apply</button>
            <button class="img-ed-btn" id="img-ed-cscancel">Cancel</button>
        </div>`;
    inst.winEl.appendChild(dlg);
    inst.canvasSizeDialogEl = dlg;

    const fillLabel = dlg.querySelector('#img-ed-cs-fill-label');
    fillLabel.textContent = _bgColor ? _bgColor : 'transparent';
    fillLabel.style.color = _bgColor || '#666';

    let _anchor = 'c';
    dlg.querySelectorAll('.img-ed-anchor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            dlg.querySelectorAll('.img-ed-anchor-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); _anchor = btn.dataset.anchor;
        });
    });

    const wInp = dlg.querySelector('#img-ed-csw');
    const hInp = dlg.querySelector('#img-ed-csh');

    dlg.querySelector('#img-ed-csapply').addEventListener('click', () => {
        const nw = Math.max(1, Math.round(+wInp.value));
        const nh = Math.max(1, Math.round(+hInp.value));
        const anchorX = { nw:0, n:0.5, ne:1, w:0, c:0.5, e:1, sw:0, s:0.5, se:1 }[_anchor];
        const anchorY = { nw:0, n:0,   ne:0, w:0.5, c:0.5, e:0.5, sw:1, s:1, se:1 }[_anchor];
        const ox = Math.round((nw - origW) * anchorX);
        const oy = Math.round((nh - origH) * anchorY);
        const tmp = document.createElement('canvas');
        tmp.width = nw; tmp.height = nh;
        const tc = tmp.getContext('2d');
        if (_bgColor) { tc.fillStyle = _bgColor; tc.fillRect(0, 0, nw, nh); }
        tc.drawImage(inst.canvas, ox, oy);
        inst.canvas.width = nw; inst.canvas.height = nh;
        inst.ctx.clearRect(0, 0, nw, nh);
        if (_bgColor) { inst.ctx.fillStyle = _bgColor; inst.ctx.fillRect(0, 0, nw, nh); }
        inst.ctx.drawImage(tmp, 0, 0);
        dlg.remove(); inst.canvasSizeDialogEl = null;
        _fitToView(inst); _pushUndo(inst);
    });
    dlg.querySelector('#img-ed-cscancel').addEventListener('click', () => { dlg.remove(); inst.canvasSizeDialogEl = null; });
}

// ── Resize dialog ─────────────────────────────────────────────────────────────

function _showResizeDialog(inst) {
    if (inst.resizeDialogEl) inst.resizeDialogEl.remove();
    const origW = inst.canvas.width;
    const origH = inst.canvas.height;

    const dlg = document.createElement('div');
    dlg.className = 'img-ed-resize-dialog';
    dlg.innerHTML = `
        <div class="img-ed-resize-title">Resize image</div>
        <div class="img-ed-resize-row"><label>Width <input type="number" id="img-ed-rw" min="1" value="${origW}" style="width:80px"> px</label></div>
        <div class="img-ed-resize-row"><label>Height <input type="number" id="img-ed-rh" min="1" value="${origH}" style="width:80px"> px</label></div>
        <div class="img-ed-resize-row"><label><input type="checkbox" id="img-ed-rlock" checked> Keep aspect ratio</label></div>
        <div class="img-ed-resize-btns">
            <button class="img-ed-btn img-ed-btn-primary" id="img-ed-rapply">Apply</button>
            <button class="img-ed-btn" id="img-ed-rcancel">Cancel</button>
        </div>`;
    inst.winEl.appendChild(dlg);
    inst.resizeDialogEl = dlg;

    const rwInput = dlg.querySelector('#img-ed-rw');
    const rhInput = dlg.querySelector('#img-ed-rh');
    const lock    = dlg.querySelector('#img-ed-rlock');

    rwInput.addEventListener('input', () => { if (!lock.checked) return; rhInput.value = Math.round(+rwInput.value * origH / origW); });
    rhInput.addEventListener('input', () => { if (!lock.checked) return; rwInput.value = Math.round(+rhInput.value * origW / origH); });

    dlg.querySelector('#img-ed-rapply').addEventListener('click', () => {
        const nw = Math.max(1, Math.round(+rwInput.value));
        const nh = Math.max(1, Math.round(+rhInput.value));
        const tmp = document.createElement('canvas');
        tmp.width = nw; tmp.height = nh;
        tmp.getContext('2d').drawImage(inst.canvas, 0, 0, nw, nh);
        inst.canvas.width = nw; inst.canvas.height = nh;
        inst.ctx.drawImage(tmp, 0, 0);
        dlg.remove(); inst.resizeDialogEl = null;
        _fitToView(inst); _pushUndo(inst);
    });
    dlg.querySelector('#img-ed-rcancel').addEventListener('click', () => { dlg.remove(); inst.resizeDialogEl = null; });
}

// ── Save / Download ───────────────────────────────────────────────────────────

function _getOutputMimeAndExt(inst) {
    const mime = inst.att.mimeType || 'image/png';
    const supported = ['image/png', 'image/jpeg', 'image/webp'];
    if (supported.includes(mime)) return { mime, ext: mime.split('/')[1] };
    return { mime: 'image/png', ext: 'png' };
}

function _canvasToBase64(inst) {
    const { mime } = _getOutputMimeAndExt(inst);
    const quality  = (mime === 'image/jpeg' || mime === 'image/webp') ? 0.92 : undefined;
    const dataUrl  = quality !== undefined ? inst.canvas.toDataURL(mime, quality) : inst.canvas.toDataURL(mime);
    return dataUrl.split(',')[1];
}

function _saveOverwrite(inst) {
    const b64 = _canvasToBase64(inst);
    const { mime } = _getOutputMimeAndExt(inst);
    inst.onSaveOverwrite(b64, Math.round(b64.length * 0.75), mime, inst.att);
}

function _saveNew(inst) {
    const b64 = _canvasToBase64(inst);
    const { mime, ext } = _getOutputMimeAndExt(inst);
    const lastDot = inst.att.name.lastIndexOf('.');
    const base    = lastDot >= 0 ? inst.att.name.slice(0, lastDot) : inst.att.name;
    const newName = window.prompt('Save as new — enter file name:', `${base}_new.${ext}`);
    if (!newName || !newName.trim()) return;
    const newAtt = inst.onSaveNew(b64, Math.round(b64.length * 0.75), newName.trim(), mime);
    if (newAtt) {
        inst.att = newAtt;
        const nameInp = inst.winEl && inst.winEl.querySelector('.img-editor-titlebar-name');
        if (nameInp) nameInp.value = inst.att.name;
    }
}

function _download(inst) {
    const b64 = _canvasToBase64(inst);
    const { mime, ext } = _getOutputMimeAndExt(inst);
    const binary = atob(b64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const lastDot = inst.att.name.lastIndexOf('.');
    const base    = lastDot >= 0 ? inst.att.name.slice(0, lastDot) : inst.att.name;
    a.href = url; a.download = `${base}.${ext}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ── Shape tools ───────────────────────────────────────────────────────────────

function _applyShapeToCtx(inst, start, end) {
    const x = Math.min(start.x, end.x), y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
    inst.ctx.save();
    inst.ctx.strokeStyle = _penColor; inst.ctx.fillStyle = _penColor;
    inst.ctx.lineWidth = _penSize; inst.ctx.lineCap = 'round'; inst.ctx.lineJoin = 'round';
    switch (_activeTool) {
        case 'rect':    if (_shapeFill) inst.ctx.fillRect(x, y, w, h); else inst.ctx.strokeRect(x, y, w, h); break;
        case 'ellipse':
            if (w < 1 || h < 1) break;
            inst.ctx.beginPath(); inst.ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
            if (_shapeFill) inst.ctx.fill(); else inst.ctx.stroke(); break;
        case 'line':    inst.ctx.beginPath(); inst.ctx.moveTo(start.x, start.y); inst.ctx.lineTo(end.x, end.y); inst.ctx.stroke(); break;
        case 'arrow':   _drawArrow(inst, start.x, start.y, end.x, end.y); break;
        case 'callout': _drawCallout(inst, end.x, end.y); break;
    }
    inst.ctx.restore();
}

function _commitShape(inst, start, end) { _applyShapeToCtx(inst, start, end); }

function _drawArrow(inst, x1, y1, x2, y2) {
    const headLen = Math.max(_penSize * 5, 12);
    const angle   = Math.atan2(y2 - y1, x2 - x1);
    inst.ctx.beginPath(); inst.ctx.moveTo(x1, y1); inst.ctx.lineTo(x2, y2); inst.ctx.stroke();
    inst.ctx.save(); inst.ctx.translate(x2, y2); inst.ctx.rotate(angle);
    inst.ctx.beginPath(); inst.ctx.moveTo(0, 0);
    inst.ctx.lineTo(-headLen, -headLen * 0.38); inst.ctx.lineTo(-headLen, headLen * 0.38);
    inst.ctx.closePath(); inst.ctx.fillStyle = _penColor; inst.ctx.fill();
    inst.ctx.restore();
}

function _drawCallout(inst, cx, cy) {
    const r = Math.max(_penSize * 5, 14);
    inst.ctx.beginPath(); inst.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (_bgColor) { inst.ctx.fillStyle = _bgColor; inst.ctx.fill(); }
    inst.ctx.strokeStyle = _penColor; inst.ctx.lineWidth = Math.max(1.5, _penSize); inst.ctx.stroke();
    inst.ctx.fillStyle = _penColor;
    inst.ctx.font = `bold ${Math.round(r * 1.3)}px sans-serif`;
    inst.ctx.textAlign = 'center'; inst.ctx.textBaseline = 'middle';
    inst.ctx.fillText(String(inst.calloutCount), cx, cy);
}

function _applyBlur(inst, rect) {
    const blockSize = Math.max(4, Math.round(_penSize * 2));
    const x = Math.max(0, Math.round(rect.x)), y = Math.max(0, Math.round(rect.y));
    const w = Math.min(inst.canvas.width  - x, Math.round(rect.w));
    const h = Math.min(inst.canvas.height - y, Math.round(rect.h));
    if (w < 2 || h < 2) return;
    const imgData = inst.ctx.getImageData(x, y, w, h);
    const d = imgData.data;
    for (let by = 0; by < h; by += blockSize) {
        for (let bx = 0; bx < w; bx += blockSize) {
            const bw = Math.min(blockSize, w - bx), bh = Math.min(blockSize, h - by);
            let r = 0, g = 0, b = 0, a = 0, cnt = 0;
            for (let dy = 0; dy < bh; dy++) for (let dx = 0; dx < bw; dx++) {
                const i = ((by + dy) * w + (bx + dx)) * 4;
                r += d[i]; g += d[i+1]; b += d[i+2]; a += d[i+3]; cnt++;
            }
            r = Math.round(r/cnt); g = Math.round(g/cnt); b = Math.round(b/cnt); a = Math.round(a/cnt);
            for (let dy = 0; dy < bh; dy++) for (let dx = 0; dx < bw; dx++) {
                const i = ((by + dy) * w + (bx + dx)) * 4;
                d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = a;
            }
        }
    }
    inst.ctx.putImageData(imgData, x, y);
}

// ── Resize all ───────────────────────────────────────────────────────────────

function _resizeAll() {
    if (_instances.length === 0) return;

    // Use first instance dimensions as defaults
    const refW = _instances[0].canvas.width;
    const refH = _instances[0].canvas.height;

    // Build a shared dialog attached to body
    const existing = document.getElementById('img-ed-resize-all-dlg');
    if (existing) existing.remove();

    const dlg = document.createElement('div');
    dlg.id = 'img-ed-resize-all-dlg';
    dlg.className = 'img-ed-resize-dialog';
    dlg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:200000;';
    dlg.innerHTML = `
        <div class="img-ed-resize-title">Resize all images</div>
        <div class="img-ed-resize-row"><label>Width  <input type="number" id="img-ed-raw" min="1" value="${refW}" style="width:80px"> px</label></div>
        <div class="img-ed-resize-row"><label>Height <input type="number" id="img-ed-rah" min="1" value="${refH}" style="width:80px"> px</label></div>
        <div class="img-ed-resize-row"><label><input type="checkbox" id="img-ed-ralock" checked> Keep aspect ratio (per image)</label></div>
        <div class="img-ed-resize-btns">
            <button class="img-ed-btn img-ed-btn-primary" id="img-ed-raapply">Apply to all</button>
            <button class="img-ed-btn" id="img-ed-racancel">Cancel</button>
        </div>`;
    document.body.appendChild(dlg);

    const rwInp = dlg.querySelector('#img-ed-raw');
    const rhInp = dlg.querySelector('#img-ed-rah');
    const lock  = dlg.querySelector('#img-ed-ralock');

    rwInp.addEventListener('input', () => { if (!lock.checked) return; rhInp.value = Math.round(+rwInp.value * refH / refW); });
    rhInp.addEventListener('input', () => { if (!lock.checked) return; rwInp.value = Math.round(+rhInp.value * refW / refH); });

    dlg.querySelector('#img-ed-raapply').addEventListener('click', () => {
        const targetW = Math.max(1, Math.round(+rwInp.value));
        const targetH = Math.max(1, Math.round(+rhInp.value));
        _instances.forEach(inst => {
            let nw = targetW, nh = targetH;
            if (lock.checked) {
                // scale each image proportionally to fit target box
                const scale = Math.min(targetW / inst.canvas.width, targetH / inst.canvas.height);
                nw = Math.max(1, Math.round(inst.canvas.width  * scale));
                nh = Math.max(1, Math.round(inst.canvas.height * scale));
            }
            const tmp = document.createElement('canvas');
            tmp.width = nw; tmp.height = nh;
            tmp.getContext('2d').drawImage(inst.canvas, 0, 0, nw, nh);
            inst.canvas.width = nw; inst.canvas.height = nh;
            inst.ctx.drawImage(tmp, 0, 0);
            _fitToView(inst); _pushUndo(inst);
        });
        dlg.remove();
    });
    dlg.querySelector('#img-ed-racancel').addEventListener('click', () => dlg.remove());
}

// ── GUI-on-top toggle ─────────────────────────────────────────────────────────

// GUI z-index is 1001 (see #gui-container in main.css).
// Editor windows normally sit at 100001+. When _guiOnTop is true we drop
// editor windows to 999 (below GUI) but keep the toolbar above GUI so the
// toggle button stays reachable.
const _Z_EDITOR_NORMAL  = 100001;
const _Z_EDITOR_BEHIND  = 999;
const _Z_TOOLBAR_GUITOP = 1002;  // just above GUI (1001) so toggle btn is clickable

function _toggleWinChrome() {
    _showWinChrome = !_showWinChrome;
    const btn = _toolbarEl && _toolbarEl.querySelector('#img-ed-chrome-toggle');
    if (btn) btn.classList.toggle('active', !_showWinChrome);
    _instances.forEach(inst => _applyWinChrome(inst));
}

function _applyWinChrome(inst) {
    if (!inst.winEl) return;
    const tb = inst.winEl.querySelector('.img-editor-titlebar');
    const sb = inst.winEl.querySelector('.img-editor-statusbar');
    if (tb) tb.style.display = _showWinChrome ? '' : 'none';
    if (sb) sb.style.display = _showWinChrome ? '' : 'none';
}

function _toggleGuiOnTop() {
    _guiOnTop = !_guiOnTop;
    _applyGuiOnTop();
}

function _applyGuiOnTop() {
    if (!_toolbarEl) return;
    const btn = _toolbarEl.querySelector('#img-ed-guitop');
    if (_guiOnTop) {
        _toolbarEl.style.zIndex = String(_Z_TOOLBAR_GUITOP);
        _instances.forEach(inst => { inst.winEl.style.zIndex = String(_Z_EDITOR_BEHIND); });
        if (btn) { btn.classList.add('active'); btn.title = 'Editor on top (click to switch)'; }
    } else {
        _toolbarEl.style.zIndex = '';          // CSS default (100002 from stylesheet)
        // Restore each window's original stacking order
        _instances.forEach((inst, i) => { inst.winEl.style.zIndex = String(_Z_EDITOR_NORMAL + i); });
        _nextZIndex = _Z_EDITOR_NORMAL + _instances.length;
        if (btn) { btn.classList.remove('active'); btn.title = 'GUI on top (click to switch)'; }
    }
}

// ── Auto-arrange (tile) ───────────────────────────────────────────────────────

export function autoArrangeImageEditors() { _autoArrange(); }

function _autoArrange() {
    const n = _instances.length;
    if (n === 0) return;

    // First restore any maximized windows so sizes are predictable
    _instances.forEach(inst => { if (inst.isMaximized) _toggleMaximize(inst); });

    const toolbarH = _toolbarEl ? _toolbarEl.getBoundingClientRect().height : 0;
    const availW   = window.innerWidth;
    const availH   = window.innerHeight - toolbarH;
    const margin   = 6;

    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);

    const cellW = Math.floor((availW - margin * (cols + 1)) / cols);
    const cellH = Math.floor((availH - margin * (rows + 1)) / rows);

    _instances.forEach((inst, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = margin + col * (cellW + margin);
        const y = toolbarH + margin + row * (cellH + margin);
        const win = inst.winEl;
        win.style.left   = x + 'px';
        win.style.top    = y + 'px';
        win.style.width  = cellW + 'px';
        win.style.height = cellH + 'px';
        win.style.zIndex = 100001 + i;
    });

    requestAnimationFrame(() => _instances.forEach(inst => _fitToView(inst)));
}

// ── Maximize / restore ───────────────────────────────────────────────────────

function _toggleMaximize(inst) {
    const win = inst.winEl;
    if (!inst.isMaximized) {
        const r = win.getBoundingClientRect();
        inst.savedBounds = { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' };
        const toolbarH = _toolbarEl ? _toolbarEl.getBoundingClientRect().height : 0;
        win.style.left   = '0px';
        win.style.top    = toolbarH + 'px';
        win.style.width  = window.innerWidth + 'px';
        win.style.height = (window.innerHeight - toolbarH) + 'px';
        win.classList.add('img-editor-window--maximized');
        inst.isMaximized = true;
        const btn = win.querySelector('#img-ed-maximize');
        if (btn) { btn.textContent = '⤡'; btn.title = 'Restore window'; }
    } else {
        const b = inst.savedBounds;
        win.style.left   = b.left;
        win.style.top    = b.top;
        win.style.width  = b.width;
        win.style.height = b.height;
        win.classList.remove('img-editor-window--maximized');
        inst.isMaximized = false;
        inst.savedBounds = null;
        const btn = win.querySelector('#img-ed-maximize');
        if (btn) { btn.textContent = '⤢'; btn.title = 'Maximize window'; }
    }
    // Fit to view after reflow (ResizeObserver handles overlay canvas)
    requestAnimationFrame(() => _fitToView(inst));
}

// ── Close ─────────────────────────────────────────────────────────────────────

function _close(inst) {
    _closeTextDialog(inst);
    document.removeEventListener('keydown', inst.winEl._keyHandler);
    if (inst.winEl._pasteHandler) document.removeEventListener('paste', inst.winEl._pasteHandler);
    if (inst.winEl._ro) inst.winEl._ro.disconnect();
    inst.winEl.remove();
    _instances = _instances.filter(i => i !== inst);

    if (_activeInst === inst) {
        _activeInst = _instances.length ? _instances[_instances.length - 1] : null;
        if (_activeInst) _focusInstance(_activeInst);
    }

    if (_instances.length === 0 && _toolbarEl) {
        _toolbarEl.remove();
        _toolbarEl = null;
    }

    inst.onClose?.();
}

// ── Selection helpers ─────────────────────────────────────────────────────────

function _ptInRect(pt, r) {
    return pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h;
}

function _liftSelection(inst) {
    if (!inst.selRect) return;
    const cx = Math.round(Math.max(0, inst.selRect.x));
    const cy = Math.round(Math.max(0, inst.selRect.y));
    const cw = Math.round(Math.min(inst.canvas.width  - cx, inst.selRect.w));
    const ch = Math.round(Math.min(inst.canvas.height - cy, inst.selRect.h));
    if (cw < 1 || ch < 1) return;
    inst.selImageData = inst.ctx.getImageData(cx, cy, cw, ch);
    inst.ctx.save();
    if (_bgColor) { inst.ctx.fillStyle = _bgColor; inst.ctx.fillRect(cx, cy, cw, ch); }
    else          { inst.ctx.clearRect(cx, cy, cw, ch); }
    inst.ctx.restore();
    if (inst.pendingInsertSnapshot) {
        inst.selHoleSnapshot = inst.pendingInsertSnapshot;
    } else {
        inst.selHoleSnapshot = inst.ctx.getImageData(0, 0, inst.canvas.width, inst.canvas.height);
    }
    inst.selRect = { x: cx, y: cy, w: cw, h: ch };
}

function _acceptPendingInsert(inst) {
    inst.pendingInsertSnapshot = null;
    inst.pendingInsertUndoIndex = null;
}

function _cancelPendingInsert(inst) {
    if (!inst.pendingInsertSnapshot) return;
    inst.ctx.putImageData(inst.pendingInsertSnapshot, 0, 0);
    if (inst.pendingInsertUndoIndex != null) {
        inst.undoStack.length = inst.pendingInsertUndoIndex;
    }
    inst.redoStack = [];
    _acceptPendingInsert(inst);
    inst.selRect = null; inst.selStart = null; inst.isSelectingRect = false;
    inst.isMovingSel = false; inst.selMoveOff = null;
    inst.isResizingSel = false; inst.selResizeHandle = null; inst.selResizeStart = null;
    inst.selImageData = null; inst.selHoleSnapshot = null;
    const ov = inst.winEl && inst.winEl.querySelector('.img-editor-overlay-canvas');
    if (ov) _redrawOverlay(inst, ov, ov.getContext('2d'));
}

function _drawFloatedAt(inst, x, y) {
    if (!inst.selImageData) return;
    const tmp = document.createElement('canvas');
    tmp.width  = inst.selImageData.width;
    tmp.height = inst.selImageData.height;
    tmp.getContext('2d').putImageData(inst.selImageData, 0, 0);
    const dw = inst.selRect ? inst.selRect.w : inst.selImageData.width;
    const dh = inst.selRect ? inst.selRect.h : inst.selImageData.height;
    inst.ctx.drawImage(tmp, Math.round(x), Math.round(y), Math.round(dw), Math.round(dh));
}

const _SEL_HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const _MIN_SEL_SIZE = 2;

function _selHandlePositions(r) {
    const { x, y, w, h } = r;
    return {
        nw: { x, y },
        n:  { x: x + w / 2, y },
        ne: { x: x + w, y },
        e:  { x: x + w, y: y + h / 2 },
        se: { x: x + w, y: y + h },
        s:  { x: x + w / 2, y: y + h },
        sw: { x, y: y + h },
        w:  { x, y: y + h / 2 },
    };
}

function _hitTestSelHandle(inst, pt) {
    if (!inst.selRect) return null;
    const tol = 8 / inst.zoom;
    const handles = _selHandlePositions(inst.selRect);
    for (const id of _SEL_HANDLES) {
        const h = handles[id];
        if (Math.abs(pt.x - h.x) <= tol && Math.abs(pt.y - h.y) <= tol) return id;
    }
    return null;
}

function _cursorForSelHandle(id) {
    return {
        nw: 'nwse-resize', se: 'nwse-resize',
        ne: 'nesw-resize', sw: 'nesw-resize',
        n: 'ns-resize', s: 'ns-resize',
        e: 'ew-resize', w: 'ew-resize',
    }[id] || 'default';
}

function _computeResizeRect(start, handle, pt, keepAspect) {
    const L = start.x, T = start.y, R = start.x + start.w, B = start.y + start.h;
    const ar = start.w / start.h || 1;

    let x, y, w, h;

    const box = (x1, y1, x2, y2) => {
        x = Math.min(x1, x2);
        y = Math.min(y1, y2);
        w = Math.max(_MIN_SEL_SIZE, Math.abs(x2 - x1));
        h = Math.max(_MIN_SEL_SIZE, Math.abs(y2 - y1));
    };

    switch (handle) {
        case 'se': box(L, T, pt.x, pt.y); break;
        case 'nw': box(pt.x, pt.y, R, B); break;
        case 'ne': box(L, pt.y, pt.x, B); break;
        case 'sw': box(pt.x, T, R, pt.y); break;
        case 'e':  box(L, T, pt.x, B); break;
        case 'w':  box(pt.x, T, R, B); break;
        case 's':  box(L, T, R, pt.y); break;
        case 'n':  box(L, pt.y, R, B); break;
        default:   return { ...start };
    }

    if (keepAspect) {
        if (handle === 'e' || handle === 'w') {
            h = w / ar;
            y = T;
            x = handle === 'w' ? R - w : L;
        } else if (handle === 'n' || handle === 's') {
            w = h * ar;
            x = L;
            y = handle === 'n' ? B - h : T;
        } else {
            if (w / h > ar) h = w / ar;
            else w = h * ar;
            if (handle === 'se')      { x = L; y = T; }
            else if (handle === 'nw') { x = R - w; y = B - h; }
            else if (handle === 'ne') { x = L; y = B - h; }
            else if (handle === 'sw') { x = R - w; y = T; }
        }
    }

    return { x, y, w, h };
}

function _clearSelection(inst) {
    if (inst.selImageData && inst.selHoleSnapshot && inst.selRect) {
        inst.ctx.putImageData(inst.selHoleSnapshot, 0, 0);
        _drawFloatedAt(inst, inst.selRect.x, inst.selRect.y);
        _pushUndo(inst);
    }
    inst.selRect = null; inst.selStart = null; inst.isSelectingRect = false;
    inst.isMovingSel = false; inst.selMoveOff = null;
    inst.isResizingSel = false; inst.selResizeHandle = null; inst.selResizeStart = null;
    inst.selImageData = null; inst.selHoleSnapshot = null;
    _acceptPendingInsert(inst);
    const ov = inst.winEl && inst.winEl.querySelector('.img-editor-overlay-canvas');
    if (ov) _redrawOverlay(inst, ov, ov.getContext('2d'));
}

function _deleteSelection(inst) {
    if (!inst.selRect) return;
    if (inst.selImageData && inst.selHoleSnapshot) {
        inst.ctx.putImageData(inst.selHoleSnapshot, 0, 0);
    } else {
        const cx = Math.round(Math.max(0, inst.selRect.x));
        const cy = Math.round(Math.max(0, inst.selRect.y));
        const cw = Math.round(Math.min(inst.canvas.width  - cx, inst.selRect.w));
        const ch = Math.round(Math.min(inst.canvas.height - cy, inst.selRect.h));
        if (cw >= 1 && ch >= 1) {
            inst.ctx.save();
            if (_bgColor) { inst.ctx.fillStyle = _bgColor; inst.ctx.fillRect(cx, cy, cw, ch); }
            else          { inst.ctx.clearRect(cx, cy, cw, ch); }
            inst.ctx.restore();
        }
    }
    inst.selImageData = null; inst.selHoleSnapshot = null; inst.selRect = null;
    inst.isMovingSel = false; inst.isSelectingRect = false;
    inst.isResizingSel = false; inst.selResizeHandle = null; inst.selResizeStart = null;
    _acceptPendingInsert(inst);
    _pushUndo(inst);
    const ov = inst.winEl && inst.winEl.querySelector('.img-editor-overlay-canvas');
    if (ov) _redrawOverlay(inst, ov, ov.getContext('2d'));
}

function _copySelection(inst) {
    if (!inst.selRect) return;
    if (inst.selImageData) {
        _clipboardData = new ImageData(new Uint8ClampedArray(inst.selImageData.data), inst.selImageData.width, inst.selImageData.height);
    } else {
        const cx = Math.round(Math.max(0, inst.selRect.x));
        const cy = Math.round(Math.max(0, inst.selRect.y));
        const cw = Math.round(Math.min(inst.canvas.width  - cx, inst.selRect.w));
        const ch = Math.round(Math.min(inst.canvas.height - cy, inst.selRect.h));
        if (cw < 1 || ch < 1) return;
        _clipboardData = inst.ctx.getImageData(cx, cy, cw, ch);
    }
    if (navigator.clipboard && navigator.clipboard.write) {
        const tmp = document.createElement('canvas');
        tmp.width  = _clipboardData.width; tmp.height = _clipboardData.height;
        tmp.getContext('2d').putImageData(_clipboardData, 0, 0);
        tmp.toBlob(blob => {
            navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).catch(() => {});
        }, 'image/png');
    }
}

function _insertImageFromDisk(inst) {
    pickImageFromDisk(dataUrl => _insertImageFromDataUrl(inst, dataUrl));
}

function _insertImageFromFiles(inst) {
    pickImageFromFiles(dataUrl => _insertImageFromDataUrl(inst, dataUrl));
}

async function _insertImageFromClipboard(inst) {
    const file = await readImageFileFromClipboard();
    if (!file) {
        alert('No image in clipboard.');
        return;
    }
    showImageInsertDialog(file, dataUrl => _insertImageFromDataUrl(inst, dataUrl));
}

function _insertImageFromDataUrl(inst, dataUrl) {
    const img = new Image();
    img.onload = () => {
        const tmp = document.createElement('canvas');
        tmp.width = img.naturalWidth;
        tmp.height = img.naturalHeight;
        tmp.getContext('2d').drawImage(img, 0, 0);
        const imageData = tmp.getContext('2d').getImageData(0, 0, tmp.width, tmp.height);

        _clipboardData = imageData;
        _clearSelection(inst);

        const pasteX = Math.min(16, Math.max(0, inst.canvas.width  - imageData.width));
        const pasteY = Math.min(16, Math.max(0, inst.canvas.height - imageData.height));

        inst.pendingInsertSnapshot  = inst.ctx.getImageData(0, 0, inst.canvas.width, inst.canvas.height);
        inst.pendingInsertUndoIndex = inst.undoStack.length;
        inst.selRect         = { x: pasteX, y: pasteY, w: imageData.width, h: imageData.height };
        inst.selImageData    = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
        inst.selHoleSnapshot = inst.pendingInsertSnapshot;
        _drawFloatedAt(inst, pasteX, pasteY);

        if (_activeTool !== 'select') _setTool(inst, 'select');

        const ov = inst.winEl && inst.winEl.querySelector('.img-editor-overlay-canvas');
        if (ov) _redrawOverlay(inst, ov, ov.getContext('2d'));
    };
    img.onerror = () => alert('Failed to load image.');
    img.src = dataUrl;
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function _normRect(a, b) {
    return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) };
}

function _updateSizeLabel(inst) {
    const el = inst.winEl && inst.winEl.querySelector('.img-ed-size-label');
    if (el) el.textContent = `${inst.canvas.width} × ${inst.canvas.height} px`;
}
