// imageEditorUtils.js
// Canvas-based image editor: Crop, Rotate, Flip, Pen, Text, Undo/Redo, Resize, Zoom+Pan
// No external dependencies — pure Canvas API.

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Open the image editor for the given attachment.
 * @param {object} att  – attachment object { id, name, mimeType, data (base64) }
 * @param {Function} onSaveOverwrite  – cb(newBase64, newSize) → overwrite original
 * @param {Function} onSaveNew       – cb(newBase64, newSize, suggestedName) → save as new attachment
 */
export function openImageEditor(att, onSaveOverwrite, onSaveNew) {
    _launch(att, onSaveOverwrite, onSaveNew);
}

// ── State ─────────────────────────────────────────────────────────────────────

let _editorEl = null;        // root overlay element
let _canvas   = null;        // main canvas
let _ctx      = null;
let _att      = null;        // current attachment reference
let _onSaveOverwrite = null;
let _onSaveNew       = null;

// Undo/Redo stacks – each entry is an ImageData
let _undoStack = [];
let _redoStack = [];
const MAX_UNDO = 30;

// Tool state
let _activeTool = 'pan';     // 'pan'|'crop'|'pen'|'text'|...
let _penColor   = '#ff0000';
let _penSize    = 3;
let _textColor  = '#ff0000';
let _bgColor    = null;       // null = transparent (destination-out), hex = solid fill
let _fontSize   = 18;
let _fontFamily = 'sans-serif';

// Zoom & pan
let _zoom    = 1;
let _panX    = 0;
let _panY    = 0;
let _isPanning   = false;
let _panStart    = { x: 0, y: 0 };

// Pen drawing
let _isDrawing   = false;
let _lastDrawPt  = null;
let _hlPath      = [];   // highlight path points (snapshot-based redraw)

// Crop
let _isCropping  = false;
let _cropStart   = null;
let _cropRect    = null;   // { x, y, w, h } in image coordinates

// Text placement
let _pendingText    = false;
let _textDialogEl   = null;   // floating text-input dialog
let _textSnapshot   = null;   // canvas snapshot for live preview
// Text drag-on-canvas (while dialog is open)
let _textPos        = null;   // { x, y } text anchor in image coords
let _textBBox       = null;   // { x, y, w, h } in image coords — for drag hit-test
let _isDraggingText = false;
let _textDragOff       = null;   // { dx, dy } offset from anchor at drag start
let _textDragJustEnded = false;  // suppress click event after text drag ends
let _textPreviewFn  = null;   // () => void — redraw current text preview

// Eraser shape
let _eraserShape     = 'circle'; // 'circle' | 'square'

// Shape drawing state (rect, ellipse, line, arrow, callout, blur)
let _shapeFill       = false;
let _isShaping       = false;
let _shapeStart      = null;
let _shapeSnapshot   = null;
let _calloutCount    = 1;
let _blurPreviewRect = null;

// Resize dialog (keep ref to close it)
let _resizeDialogEl = null;

// ── Launch ────────────────────────────────────────────────────────────────────

function _launch(att, onSaveOverwrite, onSaveNew) {
    _att             = att;
    _onSaveOverwrite = onSaveOverwrite;
    _onSaveNew       = onSaveNew;
    _undoStack       = [];
    _redoStack       = [];
    _zoom            = 1;
    _panX            = 0;
    _panY            = 0;
    _activeTool      = 'pan';
    _cropRect        = null;
    _calloutCount    = 1;
    _shapeFill       = false;
    _eraserShape     = 'circle';
    _blurPreviewRect = null;

    _buildUI();

    // Load image into canvas
    const img = new Image();
    img.onload = () => {
        _canvas.width  = img.naturalWidth;
        _canvas.height = img.naturalHeight;
        _ctx.drawImage(img, 0, 0);
        _fitToView();
        _pushUndo();
        _updateCursor();
    };
    img.src = `data:${att.mimeType};base64,${att.data}`;
}

// ── UI construction ───────────────────────────────────────────────────────────

function _buildUI() {
    if (_editorEl) _editorEl.remove();

    _editorEl = document.createElement('div');
    _editorEl.id = 'img-editor-overlay';
    _editorEl.innerHTML = `
        <div id="img-editor-wrap">
            <div id="img-editor-toolbar">

                <div class="img-ed-row img-ed-row-top">
                    <input class="img-ed-title" id="img-ed-filename" title="Click to rename" spellcheck="false">
                    <div class="img-ed-sep"></div>
                    <button class="img-ed-btn" id="img-ed-undo"       title="Undo (Ctrl+Z)">↩</button>
                    <button class="img-ed-btn" id="img-ed-redo"       title="Redo (Ctrl+Y)">↪</button>
                    <button class="img-ed-btn" id="img-ed-goto-begin" title="Show original image (undo/redo stack preserved)">⏮</button>
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
                    <div style="flex:1"></div>
                    <button class="img-ed-btn img-ed-btn-save" id="img-ed-save-overwrite" title="Save (overwrite current attachment)">💾</button>
                    <button class="img-ed-btn img-ed-btn-save" id="img-ed-save-new"       title="Save as new attachment in Files">💾✎</button>
                    <button class="img-ed-btn img-ed-btn-save" id="img-ed-download"       title="Download to disk">⬇</button>
                    <div class="img-ed-sep"></div>
                    <button class="img-ed-btn" id="img-ed-close" title="Close">✕</button>
                </div>

                <div class="img-ed-row img-ed-row-tools">
                    <span class="img-ed-group-label">View</span>
                    <button class="img-ed-tool-btn" id="img-ed-tool-pan"  title="Pan">✋</button>
                    <button class="img-ed-tool-btn" id="img-ed-tool-crop" title="Crop">⛶</button>
                    <div class="img-ed-sep"></div>
                    <span class="img-ed-group-label">Draw</span>
                    <button class="img-ed-tool-btn" id="img-ed-tool-pen"       title="Freehand pen">✎</button>
                    <button class="img-ed-tool-btn" id="img-ed-tool-highlight" title="Highlighter (semi-transparent)">🖌</button>
                    <button class="img-ed-tool-btn" id="img-ed-tool-eraser"    title="Eraser — erase drawing">🩹</button>
                    <button class="img-ed-btn" id="img-ed-eraser-shape" title="Toggle eraser shape: circle / square">○</button>
                    <button class="img-ed-tool-btn" id="img-ed-tool-text"      title="Text (click on image)">T</button>
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
                        <input type="checkbox" id="img-ed-bg-enable" title="Enable background color">
                        BG <input type="color" id="img-ed-bgcolor" value="#ffffff" style="opacity:0.4">
                    </label>
                    <label class="img-ed-label" title="Brush / stroke size">
                        Size <input type="number" id="img-ed-pensize" min="1" max="100" value="3" style="width:44px">
                    </label>
                    <label class="img-ed-label" title="Font size (px)">
                        Font <input type="number" id="img-ed-fontsize" min="6" max="200" value="18" style="width:44px">
                    </label>
                </div>

            </div>
            <div id="img-editor-viewport">
                <canvas id="img-editor-canvas"></canvas>
                <canvas id="img-editor-overlay-canvas"></canvas>
            </div>
            <div id="img-editor-statusbar">
                <label id="img-ed-zoom-wrap" title="Zoom % — klikni pro 100%">
                    <input type="number" id="img-ed-zoom-label" min="1" max="2000" value="100" step="10">
                    <span id="img-ed-zoom-pct">%</span>
                </label>
                <span id="img-ed-size-label"></span>
                <span id="img-ed-hint"></span>
            </div>
        </div>`;

    document.body.appendChild(_editorEl);

    _canvas = _editorEl.querySelector('#img-editor-canvas');
    _ctx    = _canvas.getContext('2d', { willReadFrequently: true });
    const ovCanvas = _editorEl.querySelector('#img-editor-overlay-canvas');
    const ovCtx    = ovCanvas.getContext('2d');

    _editorEl.querySelector('#img-ed-filename').value = _att.name;

    _editorEl.querySelector('#img-ed-filename').addEventListener('change', e => {
        const v = e.target.value.trim();
        if (v) _att.name = v;
        else e.target.value = _att.name;
    });

    // ── Toolbar events ──
    _editorEl.querySelector('#img-ed-undo').addEventListener('click', _undo);
    _editorEl.querySelector('#img-ed-redo').addEventListener('click', _redo);
    _editorEl.querySelector('#img-ed-goto-begin').addEventListener('click', _gotoBegin);

    ['pan', 'crop', 'pen', 'text', 'rect', 'ellipse', 'line', 'arrow', 'highlight', 'eraser', 'callout', 'blur'].forEach(tool => {
        _editorEl.querySelector(`#img-ed-tool-${tool}`).addEventListener('click', () => _setTool(tool));
    });

    _editorEl.querySelector('#img-ed-eraser-shape').addEventListener('click', () => {
        _eraserShape = _eraserShape === 'circle' ? 'square' : 'circle';
        const btn = _editorEl.querySelector('#img-ed-eraser-shape');
        btn.textContent = _eraserShape === 'circle' ? '○' : '□';
        btn.classList.toggle('active', _eraserShape === 'square');
        _updateCursor();
    });

    _editorEl.querySelector('#img-ed-fill-toggle').addEventListener('click', () => {
        _shapeFill = !_shapeFill;
        const btn = _editorEl.querySelector('#img-ed-fill-toggle');
        btn.textContent = _shapeFill ? '■' : '◻';
        btn.classList.toggle('active', _shapeFill);
    });
    _editorEl.querySelector('#img-ed-callout-reset').addEventListener('click', () => { _calloutCount = 1; });

    _editorEl.querySelector('#img-ed-color').addEventListener('input', e => {
        _penColor  = e.target.value;
        _textColor = e.target.value;
    });
    const bgEnableCb  = _editorEl.querySelector('#img-ed-bg-enable');
    const bgColorInp  = _editorEl.querySelector('#img-ed-bgcolor');
    const _syncBg = () => {
        _bgColor = bgEnableCb.checked ? bgColorInp.value : null;
        bgColorInp.style.opacity = bgEnableCb.checked ? '1' : '0.4';
    };
    bgEnableCb.addEventListener('change', _syncBg);
    bgColorInp.addEventListener('input',  _syncBg);
    _editorEl.querySelector('#img-ed-pensize').addEventListener('input', e => { _penSize = +e.target.value; _updateCursor(); });
    _editorEl.querySelector('#img-ed-fontsize').addEventListener('input', e => { _fontSize = +e.target.value; });

    _editorEl.querySelector('#img-ed-rotate-cw').addEventListener('click',  () => _rotate(90));
    _editorEl.querySelector('#img-ed-rotate-ccw').addEventListener('click', () => _rotate(-90));
    _editorEl.querySelector('#img-ed-flip-h').addEventListener('click', () => _flip('h'));
    _editorEl.querySelector('#img-ed-flip-v').addEventListener('click', () => _flip('v'));

    // Zoom input: Enter or blur applies value; click selects all for quick overwrite
    const zoomInp = _editorEl.querySelector('#img-ed-zoom-label');
    const _applyZoomInput = () => {
        const v = Math.min(2000, Math.max(1, Math.round(+zoomInp.value || 100)));
        zoomInp.value = v;
        const vp = _editorEl.querySelector('#img-editor-viewport');
        const vpW = vp.clientWidth  || 800;
        const vpH = vp.clientHeight || 600;
        // Zoom around canvas center
        const cx = vpW / 2, cy = vpH / 2;
        const newZoom = v / 100;
        _panX = cx - (cx - _panX) * (newZoom / _zoom);
        _panY = cy - (cy - _panY) * (newZoom / _zoom);
        _zoom = newZoom;
        _applyTransform();
    };
    zoomInp.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') { ev.preventDefault(); _applyZoomInput(); zoomInp.blur(); }
        if (ev.key === 'Escape') { zoomInp.value = Math.round(_zoom * 100); zoomInp.blur(); }
    });
    zoomInp.addEventListener('blur', _applyZoomInput);
    zoomInp.addEventListener('click', ev => { ev.stopPropagation(); zoomInp.select(); });
    _editorEl.querySelector('#img-ed-resize').addEventListener('click', _showResizeDialog);
    _editorEl.querySelector('#img-ed-canvas-size').addEventListener('click', _showCanvasSizeDialog);

    _editorEl.querySelector('#img-ed-apply-crop').addEventListener('click',  _applyCrop);
    _editorEl.querySelector('#img-ed-cancel-crop').addEventListener('click', _cancelCrop);

    _editorEl.querySelector('#img-ed-save-overwrite').addEventListener('click', _saveOverwrite);
    _editorEl.querySelector('#img-ed-save-new').addEventListener('click', _saveNew);
    _editorEl.querySelector('#img-ed-download').addEventListener('click', _download);
    _editorEl.querySelector('#img-ed-close').addEventListener('click', _close);

    // ── Viewport / canvas events ──
    const vp = _editorEl.querySelector('#img-editor-viewport');

    vp.addEventListener('wheel', _onWheel, { passive: false });
    vp.addEventListener('mousedown', _onMouseDown);
    vp.addEventListener('mousemove', e => { _onMouseMove(e, ovCanvas, ovCtx); });
    vp.addEventListener('mouseup',   e => { _onMouseUp(e, ovCanvas, ovCtx); });
    vp.addEventListener('mouseleave', _onMouseLeave);
    vp.addEventListener('click',    e => {
        if (_activeTool === 'text') {
            if (_textDragJustEnded) { _textDragJustEnded = false; return; }
            _placeText(e);
        }
    });
    vp.addEventListener('dblclick', e => { if (_activeTool === 'text') e.stopPropagation(); });

    // ── Touch events ──
    let _pinchDist0 = null; // initial pinch distance for zoom gesture

    const _touchToMouse = (touch) => ({
        button: 0, buttons: 1,
        clientX: touch.clientX, clientY: touch.clientY,
        ctrlKey: false, metaKey: false,
        preventDefault: () => {},
        stopPropagation: () => {},
    });

    vp.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
            // Begin pinch-to-zoom
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            _pinchDist0 = Math.sqrt(dx * dx + dy * dy);
            e.preventDefault();
            return;
        }
        _pinchDist0 = null;
        if (e.touches.length !== 1) return;
        e.preventDefault();
        _onMouseDown(_touchToMouse(e.touches[0]));
    }, { passive: false });

    vp.addEventListener('touchmove', e => {
        if (e.touches.length === 2 && _pinchDist0 !== null) {
            // Pinch-to-zoom
            e.preventDefault();
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const rect = vp.getBoundingClientRect();
            const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
            const my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
            const delta = dist / _pinchDist0;
            _pinchDist0 = dist;
            const newZoom = Math.min(Math.max(_zoom * delta, 0.05), 20);
            _panX = mx - (mx - _panX) * (newZoom / _zoom);
            _panY = my - (my - _panY) * (newZoom / _zoom);
            _zoom = newZoom;
            _applyTransform();
            _updateCursor();
            _redrawOverlay(ovCanvas, ovCtx);
            return;
        }
        if (e.touches.length !== 1) return;
        e.preventDefault();
        _onMouseMove(_touchToMouse(e.touches[0]), ovCanvas, ovCtx);
    }, { passive: false });

    vp.addEventListener('touchend', e => {
        _pinchDist0 = null;
        const touch = e.changedTouches[0];
        e.preventDefault();
        _onMouseUp(_touchToMouse(touch), ovCanvas, ovCtx);
        // Simulate click for text tool
        if (_activeTool === 'text' && e.changedTouches.length === 1) {
            if (_textDragJustEnded) { _textDragJustEnded = false; return; }
            _placeText(_touchToMouse(touch));
        }
    }, { passive: false });

    vp.addEventListener('touchcancel', () => {
        _pinchDist0 = null;
        _onMouseLeave();
    });

    // ── Keyboard shortcuts ──
    document.addEventListener('keydown', _onKeyDown);
    // Mark the listener so we can remove it on close
    _editorEl._keyHandler = _onKeyDown;

    // Overlay canvas resize to match viewport
    const ro = new ResizeObserver(() => {
        ovCanvas.width  = vp.clientWidth;
        ovCanvas.height = vp.clientHeight;
        _redrawOverlay(ovCanvas, ovCtx);
    });
    ro.observe(vp);
    _editorEl._ro = ro;

    _setTool('pan');
}

// ── Tool helpers ──────────────────────────────────────────────────────────────

function _setTool(tool) {
    _cancelTextDialog();
    _activeTool = tool;
    ['pan', 'crop', 'pen', 'text', 'rect', 'ellipse', 'line', 'arrow', 'highlight', 'eraser', 'callout', 'blur'].forEach(t => {
        const btn = _editorEl.querySelector(`#img-ed-tool-${t}`);
        if (btn) btn.classList.toggle('active', t === tool);
    });

    // Show/hide crop apply/cancel buttons
    const showCrop = tool === 'crop';
    _editorEl.querySelector('#img-ed-apply-crop').style.display  = showCrop ? '' : 'none';
    _editorEl.querySelector('#img-ed-cancel-crop').style.display = showCrop ? '' : 'none';
    _editorEl.querySelector('#img-ed-crop-sep').style.display    = showCrop ? '' : 'none';

    if (tool !== 'crop') { _cropRect = null; _cropStart = null; }
    if (tool !== 'blur') {
        _blurPreviewRect = null;
        const _ovEl = _editorEl && _editorEl.querySelector('#img-editor-overlay-canvas');
        if (_ovEl) _redrawOverlay(_ovEl, _ovEl.getContext('2d'));
    }

    _updateHint();
    _updateCursor();
}

function _updateHint() {
    const hints = {
        pan:       'Drag to pan | Scroll to zoom | Fit: F',
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
    };
    const el = _editorEl && _editorEl.querySelector('#img-ed-hint');
    if (el) el.textContent = hints[_activeTool] || '';
}

function _updateCursor() {
    const vp = _editorEl && _editorEl.querySelector('#img-editor-viewport');
    if (!vp) return;

    if (_activeTool === 'highlight' || _activeTool === 'eraser') {
        const r = Math.max(2, Math.round(
            (_activeTool === 'highlight' ? _penSize * 8 : _penSize * 4) * _zoom * 0.5
        ));
        const size = r * 2 + 4;
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const cx = c.getContext('2d');
        if (_activeTool === 'eraser' && _eraserShape === 'square') {
            const s = r * 2;
            cx.strokeStyle = 'rgba(255,80,80,0.85)';
            cx.lineWidth   = 1.5;
            cx.strokeRect((size - s) / 2, (size - s) / 2, s, s);
        } else {
            cx.beginPath();
            cx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
            if (_activeTool === 'highlight') {
                cx.strokeStyle = 'rgba(0,0,0,0.7)';
                cx.lineWidth   = 1.5;
                cx.stroke();
                cx.strokeStyle = 'rgba(255,255,255,0.6)';
                cx.lineWidth   = 0.8;
                cx.stroke();
            } else {
                cx.strokeStyle = 'rgba(255,80,80,0.85)';
                cx.lineWidth   = 1.5;
                cx.stroke();
            }
        }
        // clamp hotspot to valid range
        const hot = Math.min(Math.max(0, Math.round(size / 2)), 128);
        vp.style.cursor = `url(${c.toDataURL()}) ${hot} ${hot}, crosshair`;
        return;
    }

    const cursors = {
        pan: 'grab', crop: 'crosshair', pen: 'crosshair', text: 'text',
        rect: 'crosshair', ellipse: 'crosshair', line: 'crosshair', arrow: 'crosshair',
        callout: 'crosshair', blur: 'crosshair',
    };
    vp.style.cursor = cursors[_activeTool] || 'default';
}

// ── Coordinate helpers ────────────────────────────────────────────────────────

/** Convert viewport pixel position → canvas image pixel position */
function _vpToImg(vpX, vpY) {
    const vp = _editorEl.querySelector('#img-editor-viewport');
    const rect = vp.getBoundingClientRect();
    const cx = vpX - rect.left;
    const cy = vpY - rect.top;
    // canvas is positioned at (_panX, _panY) scaled by _zoom
    const ix = (cx - _panX) / _zoom;
    const iy = (cy - _panY) / _zoom;
    return { x: ix, y: iy };
}

function _canvasToVp(ix, iy) {
    return { x: ix * _zoom + _panX, y: iy * _zoom + _panY };
}

// ── Undo / Redo ───────────────────────────────────────────────────────────────

function _pushUndo() {
    if (_canvas.width === 0 || _canvas.height === 0) return;
    _undoStack.push(_ctx.getImageData(0, 0, _canvas.width, _canvas.height));
    if (_undoStack.length > MAX_UNDO) _undoStack.shift();
    _redoStack = [];
    _updateSizeLabel();
}

function _undo() {
    if (_undoStack.length <= 1) return;
    _redoStack.push(_undoStack.pop());
    const state = _undoStack[_undoStack.length - 1];
    _canvas.width  = state.width;
    _canvas.height = state.height;
    _ctx.putImageData(state, 0, 0);
    _updateSizeLabel();
}

function _redo() {
    if (!_redoStack.length) return;
    const state = _redoStack.pop();
    _undoStack.push(state);
    _canvas.width  = state.width;
    _canvas.height = state.height;
    _ctx.putImageData(state, 0, 0);
    _updateSizeLabel();
}

function _gotoBegin() {
    if (_undoStack.length < 1) return;
    const original = _undoStack[0];
    _canvas.width  = original.width;
    _canvas.height = original.height;
    _ctx.putImageData(original, 0, 0);
    _fitToView();
    _updateSizeLabel();
    // undo/redo stacks are intentionally left untouched
}

// ── Zoom & Pan ────────────────────────────────────────────────────────────────

function _fitToView() {
    const vp = _editorEl.querySelector('#img-editor-viewport');
    const vpW = vp.clientWidth  || 800;
    const vpH = vp.clientHeight || 600;
    const scaleX = vpW / _canvas.width;
    const scaleY = vpH / _canvas.height;
    _zoom = Math.min(scaleX, scaleY, 1) * 0.95;
    _panX = (vpW - _canvas.width  * _zoom) / 2;
    _panY = (vpH - _canvas.height * _zoom) / 2;
    _applyTransform();
}

function _zoom100() {
    const vp = _editorEl.querySelector('#img-editor-viewport');
    const vpW = vp.clientWidth  || 800;
    const vpH = vp.clientHeight || 600;
    _zoom = 1;
    _panX = (vpW - _canvas.width)  / 2;
    _panY = (vpH - _canvas.height) / 2;
    _applyTransform();
}

function _applyTransform() {
    if (!_canvas) return;
    _canvas.style.transform         = `translate(${_panX}px, ${_panY}px) scale(${_zoom})`;
    _canvas.style.transformOrigin   = '0 0';
    const zl = _editorEl && _editorEl.querySelector('#img-ed-zoom-label');
    if (zl && document.activeElement !== zl) zl.value = Math.round(_zoom * 100);
}

function _onWheel(e) {
    e.preventDefault();
    const vp = _editorEl.querySelector('#img-editor-viewport');
    const rect = vp.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const delta = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const newZoom = Math.min(Math.max(_zoom * delta, 0.05), 20);

    _panX = mx - (mx - _panX) * (newZoom / _zoom);
    _panY = my - (my - _panY) * (newZoom / _zoom);
    _zoom = newZoom;
    _applyTransform();
    _updateCursor();

    // Redraw overlay
    const ov = _editorEl.querySelector('#img-editor-overlay-canvas');
    const ovCtx = ov.getContext('2d');
    _redrawOverlay(ov, ovCtx);
}

// ── Mouse events ──────────────────────────────────────────────────────────────

function _onMouseDown(e) {
    if (e.button !== 0) return;

    // ── Text drag (while text dialog is open) ──
    if (_textDialogEl && _textBBox) {
        const imgPt = _vpToImg(e.clientX, e.clientY);
        if (imgPt.x >= _textBBox.x && imgPt.x <= _textBBox.x + _textBBox.w &&
            imgPt.y >= _textBBox.y && imgPt.y <= _textBBox.y + _textBBox.h) {
            _isDraggingText = true;
            _textDragOff = { dx: imgPt.x - _textPos.x, dy: imgPt.y - _textPos.y };
            return;
        }
    }

    if (_activeTool === 'pan' || e.ctrlKey) {
        _isPanning = true;
        _panStart  = { x: e.clientX - _panX, y: e.clientY - _panY };
        const vp = _editorEl.querySelector('#img-editor-viewport');
        vp.style.cursor = 'grabbing';
        return;
    }

    if (_activeTool === 'crop') {
        const pt = _vpToImg(e.clientX, e.clientY);
        _isCropping = true;
        _cropStart  = pt;
        _cropRect   = null;
        return;
    }

    if (_activeTool === 'pen') {
        _isDrawing = true;
        const pt = _vpToImg(e.clientX, e.clientY);
        _lastDrawPt = pt;
        _ctx.beginPath();
        _ctx.arc(pt.x, pt.y, _penSize / 2, 0, Math.PI * 2);
        _ctx.fillStyle = _penColor;
        _ctx.fill();
        return;
    }

    if (_activeTool === 'highlight') {
        _isDrawing = true;
        const pt = _vpToImg(e.clientX, e.clientY);
        _lastDrawPt = pt;
        _hlPath = [pt];
        _shapeSnapshot = _ctx.getImageData(0, 0, _canvas.width, _canvas.height);
        return;
    }

    if (_activeTool === 'eraser') {
        _isDrawing = true;
        const pt = _vpToImg(e.clientX, e.clientY);
        _lastDrawPt = pt;
        _ctx.save();
        if (_bgColor) {
            _ctx.fillStyle = _bgColor;
        } else {
            _ctx.globalCompositeOperation = 'destination-out';
            _ctx.fillStyle = 'rgba(0,0,0,1)';
        }
        if (_eraserShape === 'square') {
            const s = _penSize * 4;
            _ctx.fillRect(pt.x - s / 2, pt.y - s / 2, s, s);
        } else {
            _ctx.beginPath();
            _ctx.arc(pt.x, pt.y, _penSize * 2, 0, Math.PI * 2);
            _ctx.fill();
        }
        _ctx.restore();
        return;
    }

    if (['rect', 'ellipse', 'line', 'arrow', 'callout', 'blur'].includes(_activeTool)) {
        const pt = _vpToImg(e.clientX, e.clientY);
        _isShaping     = true;
        _shapeStart    = pt;
        _shapeSnapshot = _ctx.getImageData(0, 0, _canvas.width, _canvas.height);
        return;
    }
}

function _onMouseMove(e, ovCanvas, ovCtx) {
    // ── Text drag ──
    if (_isDraggingText && _textPos) {
        const imgPt = _vpToImg(e.clientX, e.clientY);
        _textPos.x = imgPt.x - _textDragOff.dx;
        _textPos.y = imgPt.y - _textDragOff.dy;
        if (_textPreviewFn) _textPreviewFn();
        return;
    }

    // ── Hover cursor over text bbox ──
    if (_textDialogEl && _textBBox && !_isDraggingText) {
        const imgPt = _vpToImg(e.clientX, e.clientY);
        const inBox = imgPt.x >= _textBBox.x && imgPt.x <= _textBBox.x + _textBBox.w &&
                      imgPt.y >= _textBBox.y && imgPt.y <= _textBBox.y + _textBBox.h;
        const vp = _editorEl && _editorEl.querySelector('#img-editor-viewport');
        if (vp) vp.style.cursor = inBox ? 'move' : 'text';
    }

    if (_isPanning) {
        _panX = e.clientX - _panStart.x;
        _panY = e.clientY - _panStart.y;
        _applyTransform();
        _redrawOverlay(ovCanvas, ovCtx);
        return;
    }

    if (_isCropping && _cropStart) {
        const pt = _vpToImg(e.clientX, e.clientY);
        _cropRect = _normRect(_cropStart, pt);
        _redrawOverlay(ovCanvas, ovCtx);
        return;
    }

    if (_isDrawing && _lastDrawPt) {
        const pt = _vpToImg(e.clientX, e.clientY);
        if (_activeTool === 'pen') {
            _ctx.beginPath();
            _ctx.moveTo(_lastDrawPt.x, _lastDrawPt.y);
            _ctx.lineTo(pt.x, pt.y);
            _ctx.strokeStyle = _penColor;
            _ctx.lineWidth   = _penSize;
            _ctx.lineCap     = 'round';
            _ctx.lineJoin    = 'round';
            _ctx.stroke();
        } else if (_activeTool === 'highlight') {
            _hlPath.push(pt);
            // Restore snapshot and redraw entire path once → no alpha accumulation
            _ctx.putImageData(_shapeSnapshot, 0, 0);
            const off = document.createElement('canvas');
            off.width = _canvas.width; off.height = _canvas.height;
            const oc = off.getContext('2d');
            oc.strokeStyle = _penColor;
            oc.lineWidth   = _penSize * 8;
            oc.lineCap     = 'round';
            oc.lineJoin    = 'round';
            oc.beginPath();
            oc.moveTo(_hlPath[0].x, _hlPath[0].y);
            for (let i = 1; i < _hlPath.length; i++) oc.lineTo(_hlPath[i].x, _hlPath[i].y);
            oc.stroke();
            _ctx.save();
            _ctx.globalAlpha = 0.25;
            _ctx.drawImage(off, 0, 0);
            _ctx.restore();
        } else if (_activeTool === 'eraser') {
            _ctx.save();
            if (_bgColor) {
                _ctx.fillStyle   = _bgColor;
                _ctx.strokeStyle = _bgColor;
            } else {
                _ctx.globalCompositeOperation = 'destination-out';
                _ctx.strokeStyle = 'rgba(0,0,0,1)';
            }
            if (_eraserShape === 'square') {
                // Stamp squares along the drag path
                const s = _penSize * 4;
                const dx = pt.x - _lastDrawPt.x;
                const dy = pt.y - _lastDrawPt.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const steps = Math.max(1, Math.ceil(dist / (s * 0.5)));
                for (let i = 0; i <= steps; i++) {
                    const tx = _lastDrawPt.x + (dx * i) / steps;
                    const ty = _lastDrawPt.y + (dy * i) / steps;
                    _ctx.fillRect(tx - s / 2, ty - s / 2, s, s);
                }
            } else {
                _ctx.beginPath();
                _ctx.moveTo(_lastDrawPt.x, _lastDrawPt.y);
                _ctx.lineTo(pt.x, pt.y);
                _ctx.lineWidth   = _penSize * 4;
                _ctx.lineCap     = 'round';
                _ctx.lineJoin    = 'round';
                _ctx.stroke();
            }
            _ctx.restore();
        }
        _lastDrawPt = pt;
        return;
    }

    if (_isShaping && _shapeStart) {
        const pt = _vpToImg(e.clientX, e.clientY);
        if (_activeTool === 'blur') {
            _blurPreviewRect = _normRect(_shapeStart, pt);
            _redrawOverlay(ovCanvas, ovCtx);
        } else {
            _ctx.putImageData(_shapeSnapshot, 0, 0);
            _applyShapeToCtx(_shapeStart, pt);
        }
        return;
    }
}

function _onMouseUp(e, ovCanvas, ovCtx) {
    if (_isDraggingText) {
        _isDraggingText    = false;
        _textDragOff       = null;
        _textDragJustEnded = true;
        return;
    }

    if (_isPanning) {
        _isPanning = false;
        _updateCursor();
        return;
    }

    if (_isCropping) {
        _isCropping = false;
        return;
    }

    if (_isDrawing) {
        _isDrawing  = false;
        _lastDrawPt = null;
        _hlPath     = [];
        _shapeSnapshot = null;
        _pushUndo();
        return;
    }

    if (_isShaping) {
        _isShaping = false;
        const pt   = _vpToImg(e.clientX, e.clientY);
        if (_activeTool === 'blur') {
            const rect = _normRect(_shapeStart, pt);
            if (rect.w > 2 && rect.h > 2) _applyBlur(rect);
            _blurPreviewRect = null;
            _redrawOverlay(ovCanvas, ovCtx);
        } else {
            _ctx.putImageData(_shapeSnapshot, 0, 0);
            _commitShape(_shapeStart, pt);
            if (_activeTool === 'callout') _calloutCount++;
        }
        _shapeSnapshot = null;
        _shapeStart    = null;
        _pushUndo();
        return;
    }
}

function _onMouseLeave() {
    if (_isDrawing) {
        _isDrawing  = false;
        _lastDrawPt = null;
        _hlPath     = [];
        if (_shapeSnapshot && _activeTool === 'highlight') {
            // cancel incomplete highlight stroke — keep as-is
            _shapeSnapshot = null;
        }
        _pushUndo();
    }
    if (_isShaping) {
        // Restore snapshot to cancel in-progress preview
        if (_shapeSnapshot) {
            _ctx.putImageData(_shapeSnapshot, 0, 0);
            _shapeSnapshot = null;
        }
        _isShaping = false;
        _shapeStart = null;
        _blurPreviewRect = null;
        const _ovEl = _editorEl && _editorEl.querySelector('#img-editor-overlay-canvas');
        if (_ovEl) _redrawOverlay(_ovEl, _ovEl.getContext('2d'));
    }
    if (_isPanning) {
        _isPanning = false;
        _updateCursor();
    }
}

function _onKeyDown(e) {
    if (!_editorEl || _editorEl.style.display === 'none') return;
    // Don't intercept keys when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); _undo(); return; }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); _redo(); return; }
    if (e.key === 'f' || e.key === 'F') { _fitToView(); return; }
    if (e.key === 'Escape') { _cancelCrop(); return; }
}

// ── Overlay canvas (crop selection) ──────────────────────────────────────────

function _redrawOverlay(ov, ovCtx) {
    ovCtx.clearRect(0, 0, ov.width, ov.height);

    // ── Text placement bbox ──
    if (_textBBox) {
        const tl = _canvasToVp(_textBBox.x, _textBBox.y);
        const br = _canvasToVp(_textBBox.x + _textBBox.w, _textBBox.y + _textBBox.h);
        const rx = tl.x, ry = tl.y, rw = br.x - tl.x, rh = br.y - tl.y;
        ovCtx.strokeStyle = 'rgba(80,160,255,0.9)';
        ovCtx.lineWidth   = 1.5;
        ovCtx.setLineDash([4, 3]);
        ovCtx.strokeRect(rx, ry, rw, rh);
        ovCtx.setLineDash([]);
        // Move icon badge
        ovCtx.fillStyle = 'rgba(80,160,255,0.85)';
        ovCtx.fillRect(rx - 1, ry - 16, 20, 16);
        ovCtx.fillStyle = '#fff';
        ovCtx.font = '11px sans-serif';
        ovCtx.textBaseline = 'middle';
        ovCtx.fillText('\u2725', rx + 2, ry - 8);
    }

    if (_activeTool === 'blur' && _blurPreviewRect) {
        const { x, y, w, h } = _blurPreviewRect;
        const tl = _canvasToVp(x, y);
        const br = _canvasToVp(x + w, y + h);
        ovCtx.strokeStyle = '#fff';
        ovCtx.lineWidth   = 1.5;
        ovCtx.setLineDash([5, 3]);
        ovCtx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
        ovCtx.setLineDash([]);
        ovCtx.fillStyle = 'rgba(0,0,0,0.6)';
        ovCtx.fillRect(tl.x, tl.y - 18, 64, 16);
        ovCtx.fillStyle = '#fff';
        ovCtx.font = '10px sans-serif';
        ovCtx.textBaseline = 'top';
        ovCtx.fillText('Pixelate', tl.x + 4, tl.y - 17);
        return;
    }

    if (_activeTool !== 'crop' || !_cropRect) return;

    const { x, y, w, h } = _cropRect;
    const tl = _canvasToVp(x, y);
    const br = _canvasToVp(x + w, y + h);
    const rx = tl.x, ry = tl.y, rw = br.x - tl.x, rh = br.y - tl.y;

    // Dim outside crop
    ovCtx.fillStyle = 'rgba(0,0,0,0.5)';
    ovCtx.fillRect(0, 0, ov.width, ov.height);
    ovCtx.clearRect(rx, ry, rw, rh);

    // Border
    ovCtx.strokeStyle = '#fff';
    ovCtx.lineWidth   = 1;
    ovCtx.setLineDash([4, 4]);
    ovCtx.strokeRect(rx, ry, rw, rh);
    ovCtx.setLineDash([]);

    // Rule of thirds
    ovCtx.strokeStyle = 'rgba(255,255,255,0.35)';
    ovCtx.lineWidth   = 0.5;
    for (let i = 1; i < 3; i++) {
        ovCtx.beginPath(); ovCtx.moveTo(rx + rw * i / 3, ry); ovCtx.lineTo(rx + rw * i / 3, ry + rh); ovCtx.stroke();
        ovCtx.beginPath(); ovCtx.moveTo(rx, ry + rh * i / 3); ovCtx.lineTo(rx + rw, ry + rh * i / 3); ovCtx.stroke();
    }
}

// ── Image operations ──────────────────────────────────────────────────────────

function _rotate(deg) {
    const w = _canvas.width, h = _canvas.height;
    const tmp = document.createElement('canvas');
    const tc  = tmp.getContext('2d');
    if (deg === 90 || deg === -270) {
        tmp.width = h; tmp.height = w;
        tc.translate(h, 0); tc.rotate(Math.PI / 2);
    } else {
        tmp.width = h; tmp.height = w;
        tc.translate(0, w); tc.rotate(-Math.PI / 2);
    }
    tc.drawImage(_canvas, 0, 0);
    _canvas.width = tmp.width; _canvas.height = tmp.height;
    _ctx.drawImage(tmp, 0, 0);
    _fitToView();
    _pushUndo();
}

function _flip(dir) {
    const w = _canvas.width, h = _canvas.height;
    const tmp = document.createElement('canvas');
    tmp.width = w; tmp.height = h;
    const tc = tmp.getContext('2d');
    if (dir === 'h') { tc.translate(w, 0); tc.scale(-1, 1); }
    else             { tc.translate(0, h); tc.scale(1, -1); }
    tc.drawImage(_canvas, 0, 0);
    _ctx.clearRect(0, 0, w, h);
    _ctx.drawImage(tmp, 0, 0);
    _pushUndo();
}

function _applyCrop() {
    if (!_cropRect || _cropRect.w < 2 || _cropRect.h < 2) { _cancelCrop(); return; }
    const { x, y, w, h } = _cropRect;
    // Clamp to canvas bounds
    const cx = Math.max(0, Math.round(x));
    const cy = Math.max(0, Math.round(y));
    const cw = Math.min(_canvas.width  - cx, Math.round(w));
    const ch = Math.min(_canvas.height - cy, Math.round(h));
    if (cw < 1 || ch < 1) { _cancelCrop(); return; }

    const id = _ctx.getImageData(cx, cy, cw, ch);
    _canvas.width  = cw;
    _canvas.height = ch;
    _ctx.putImageData(id, 0, 0);
    _cancelCrop();
    _fitToView();
    _pushUndo();
}

function _cancelCrop() {
    _cropRect  = null;
    _cropStart = null;
    _isCropping = false;
    const ov    = _editorEl && _editorEl.querySelector('#img-editor-overlay-canvas');
    if (ov) { const c = ov.getContext('2d'); c.clearRect(0, 0, ov.width, ov.height); }
    if (_activeTool === 'crop') _setTool('pan');
}

// ── Text placement ────────────────────────────────────────────────────────────

function _placeText(e) {
    // Close any existing text dialog first
    _cancelTextDialog();

    _textPos = _vpToImg(e.clientX, e.clientY);
    _textSnapshot = _ctx.getImageData(0, 0, _canvas.width, _canvas.height);

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
            <label title="Text color">Color
                <input type="color" class="img-ed-txt-color" value="${_textColor}">
            </label>
            <label title="Font size (px)">Size
                <input type="number" class="img-ed-txt-size" min="6" max="400" value="${_fontSize}" style="width:52px">
            </label>
            <label title="Text background color">
                <input type="checkbox" class="img-ed-txt-bg-en" ${bgChecked}>
                BG <input type="color" class="img-ed-txt-bg-col" value="${bgVal}" style="opacity:${bgOpacity}">
            </label>
        </div>
        <div class="img-ed-text-btns">
            <button class="img-ed-btn img-ed-btn-primary img-ed-txt-ok" title="Confirm (Ctrl+Enter)">OK</button>
            <button class="img-ed-btn img-ed-txt-cancel">Cancel</button>
        </div>`;

    _editorEl.appendChild(dlg);
    _textDialogEl = dlg;

    // Clamp so dialog doesn't overflow the window
    const dr = dlg.getBoundingClientRect();
    if (dr.right  > window.innerWidth  - 8) dlg.style.left = (window.innerWidth  - dr.width  - 8) + 'px';
    if (dr.bottom > window.innerHeight - 8) dlg.style.top  = (window.innerHeight - dr.height - 8) + 'px';

    const textInput  = dlg.querySelector('.img-ed-txt-input');
    const colorInp   = dlg.querySelector('.img-ed-txt-color');
    const sizeInp    = dlg.querySelector('.img-ed-txt-size');
    const bgEnCb     = dlg.querySelector('.img-ed-txt-bg-en');
    const bgColInp   = dlg.querySelector('.img-ed-txt-bg-col');
    let   localBg    = _bgColor;
    let   localColor = _textColor;
    let   localSize  = _fontSize;

    // ── Drag dialog handle ──
    const handle = dlg.querySelector('.img-ed-txt-drag-handle');
    let _dragOff = null;
    const _startDlgDrag = (clientX, clientY) => {
        const r = dlg.getBoundingClientRect();
        _dragOff = { x: clientX - r.left, y: clientY - r.top };
    };
    const _moveDlg = (clientX, clientY) => {
        if (!_dragOff) return;
        dlg.style.left = (clientX - _dragOff.x) + 'px';
        dlg.style.top  = (clientY - _dragOff.y) + 'px';
    };
    const _endDlgDrag = () => { _dragOff = null; };

    handle.addEventListener('mousedown', ev => {
        if (ev.button !== 0) return;
        ev.preventDefault();
        _startDlgDrag(ev.clientX, ev.clientY);
        const _onMove = mv => _moveDlg(mv.clientX, mv.clientY);
        const _onUp = () => {
            document.removeEventListener('mousemove', _onMove);
            document.removeEventListener('mouseup',   _onUp);
            _endDlgDrag();
        };
        document.addEventListener('mousemove', _onMove);
        document.addEventListener('mouseup',   _onUp);
    });
    handle.addEventListener('touchstart', ev => {
        ev.preventDefault();
        _startDlgDrag(ev.touches[0].clientX, ev.touches[0].clientY);
    }, { passive: false });
    handle.addEventListener('touchmove', ev => {
        ev.preventDefault();
        _moveDlg(ev.touches[0].clientX, ev.touches[0].clientY);
    }, { passive: false });
    handle.addEventListener('touchend', () => _endDlgDrag());

    const _getOvCanvas = () => _editorEl && _editorEl.querySelector('#img-editor-overlay-canvas');

    const _drawMultiline = (txt) => {
        const lineHeight = localSize * 1.25;
        const lines = txt.split('\n');
        const pad   = Math.max(2, Math.round(localSize * 0.15));
        _ctx.font         = `${localSize}px ${_fontFamily}`;
        _ctx.textBaseline = 'top';
        const maxW   = lines.reduce((m, l) => Math.max(m, _ctx.measureText(l).width), 0);
        const totalH = lines.length * lineHeight;
        // Update bounding box for drag hit-test
        _textBBox = {
            x: _textPos.x - pad,
            y: _textPos.y - pad,
            w: Math.max(maxW + pad * 2, 20),
            h: totalH + pad * 2,
        };
        if (localBg) {
            _ctx.fillStyle = localBg;
            _ctx.fillRect(_textPos.x - pad, _textPos.y - pad, maxW + pad * 2, totalH + pad * 2);
        }
        _ctx.fillStyle = localColor;
        lines.forEach((line, i) => {
            _ctx.fillText(line, _textPos.x, _textPos.y + i * lineHeight);
        });
    };

    const _preview = () => {
        _ctx.putImageData(_textSnapshot, 0, 0);
        const txt = textInput.value;
        if (!txt) {
            _textBBox = null;
        } else {
            _drawMultiline(txt);
        }
        // Redraw overlay bbox
        const ov = _getOvCanvas();
        if (ov) _redrawOverlay(ov, ov.getContext('2d'));
    };

    _textPreviewFn = _preview;

    textInput.addEventListener('input', _preview);

    colorInp.addEventListener('input', () => {
        localColor = colorInp.value;
        _textColor = localColor;
        _preview();
    });

    sizeInp.addEventListener('input', () => {
        const v = Math.max(6, Math.min(400, +sizeInp.value || localSize));
        localSize = v;
        _fontSize = v;
        _preview();
    });

    bgEnCb.addEventListener('change', () => {
        localBg = bgEnCb.checked ? bgColInp.value : null;
        bgColInp.style.opacity = bgEnCb.checked ? '1' : '0.4';
        _preview();
    });
    bgColInp.addEventListener('input', () => {
        if (bgEnCb.checked) { localBg = bgColInp.value; _preview(); }
    });

    const _confirm = () => {
        const txt = textInput.value;
        if (txt) {
            _preview();
            _pushUndo();
        } else {
            _ctx.putImageData(_textSnapshot, 0, 0);
        }
        _closeTextDialog();
    };

    const _cancel = () => {
        if (_textSnapshot) _ctx.putImageData(_textSnapshot, 0, 0);
        _closeTextDialog();
    };

    dlg.querySelector('.img-ed-txt-ok').addEventListener('click', _confirm);
    dlg.querySelector('.img-ed-txt-cancel').addEventListener('click', _cancel);

    // Ctrl+Enter confirms; Escape cancels; plain Enter = new line (textarea default)
    textInput.addEventListener('keydown', ev => {
        if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') { ev.preventDefault(); _confirm(); }
        if (ev.key === 'Escape') { ev.preventDefault(); _cancel(); }
    });

    textInput.focus();
}

function _closeTextDialog() {
    if (_textDialogEl) { _textDialogEl.remove(); _textDialogEl = null; }
    _textSnapshot    = null;
    _textBBox        = null;
    _textPos         = null;
    _textPreviewFn   = null;
    _isDraggingText  = false;
    _textDragOff     = null;
    // Clear overlay bbox
    const ov = _editorEl && _editorEl.querySelector('#img-editor-overlay-canvas');
    if (ov) _redrawOverlay(ov, ov.getContext('2d'));
}

function _cancelTextDialog() {
    if (_textSnapshot && _canvas) _ctx.putImageData(_textSnapshot, 0, 0);
    _closeTextDialog();
}

// ── Canvas Size dialog ───────────────────────────────────────────────────────

let _canvasSizeDialogEl = null;

function _showCanvasSizeDialog() {
    if (_canvasSizeDialogEl) _canvasSizeDialogEl.remove();
    const origW = _canvas.width;
    const origH = _canvas.height;

    const dlg = document.createElement('div');
    dlg.className = 'img-ed-resize-dialog';
    dlg.innerHTML = `
        <div class="img-ed-resize-title">Canvas Size</div>
        <div class="img-ed-resize-row">
            <label>Width\u00a0 <input type="number" id="img-ed-csw" min="1" value="${origW}" style="width:80px"> px</label>
        </div>
        <div class="img-ed-resize-row">
            <label>Height <input type="number" id="img-ed-csh" min="1" value="${origH}" style="width:80px"> px</label>
        </div>
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
    _editorEl.appendChild(dlg);
    _canvasSizeDialogEl = dlg;

    // Fill label
    const fillLabel = dlg.querySelector('#img-ed-cs-fill-label');
    fillLabel.textContent = _bgColor ? _bgColor : 'transparent';
    fillLabel.style.color = _bgColor || '#666';

    // Anchor selection
    let _anchor = 'c';
    dlg.querySelectorAll('.img-ed-anchor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            dlg.querySelectorAll('.img-ed-anchor-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            _anchor = btn.dataset.anchor;
        });
    });

    const wInp = dlg.querySelector('#img-ed-csw');
    const hInp = dlg.querySelector('#img-ed-csh');

    dlg.querySelector('#img-ed-csapply').addEventListener('click', () => {
        const nw = Math.max(1, Math.round(+wInp.value));
        const nh = Math.max(1, Math.round(+hInp.value));

        // Compute origin offset based on anchor
        const anchorX = { nw:0, n:0.5, ne:1, w:0, c:0.5, e:1, sw:0, s:0.5, se:1 }[_anchor];
        const anchorY = { nw:0, n:0,   ne:0, w:0.5, c:0.5, e:0.5, sw:1, s:1, se:1 }[_anchor];
        const ox = Math.round((nw - origW) * anchorX);
        const oy = Math.round((nh - origH) * anchorY);

        const tmp = document.createElement('canvas');
        tmp.width = nw; tmp.height = nh;
        const tc = tmp.getContext('2d');

        // Fill background
        if (_bgColor) {
            tc.fillStyle = _bgColor;
            tc.fillRect(0, 0, nw, nh);
        }
        // Draw original image at offset
        tc.drawImage(_canvas, ox, oy);

        _canvas.width = nw; _canvas.height = nh;
        _ctx.clearRect(0, 0, nw, nh);
        if (_bgColor) {
            _ctx.fillStyle = _bgColor;
            _ctx.fillRect(0, 0, nw, nh);
        }
        _ctx.drawImage(tmp, 0, 0);

        dlg.remove(); _canvasSizeDialogEl = null;
        _fitToView();
        _pushUndo();
    });

    dlg.querySelector('#img-ed-cscancel').addEventListener('click', () => {
        dlg.remove(); _canvasSizeDialogEl = null;
    });
}

// ── Resize dialog ─────────────────────────────────────────────────────────────

function _showResizeDialog() {
    if (_resizeDialogEl) _resizeDialogEl.remove();
    const origW = _canvas.width;
    const origH = _canvas.height;

    const dlg = document.createElement('div');
    dlg.className = 'img-ed-resize-dialog';
    dlg.innerHTML = `
        <div class="img-ed-resize-title">Resize image</div>
        <div class="img-ed-resize-row">
            <label>Width <input type="number" id="img-ed-rw" min="1" value="${origW}" style="width:80px"> px</label>
        </div>
        <div class="img-ed-resize-row">
            <label>Height <input type="number" id="img-ed-rh" min="1" value="${origH}" style="width:80px"> px</label>
        </div>
        <div class="img-ed-resize-row">
            <label><input type="checkbox" id="img-ed-rlock" checked> Keep aspect ratio</label>
        </div>
        <div class="img-ed-resize-btns">
            <button class="img-ed-btn img-ed-btn-primary" id="img-ed-rapply">Apply</button>
            <button class="img-ed-btn" id="img-ed-rcancel">Cancel</button>
        </div>`;
    _editorEl.appendChild(dlg);
    _resizeDialogEl = dlg;

    const rwInput = dlg.querySelector('#img-ed-rw');
    const rhInput = dlg.querySelector('#img-ed-rh');
    const lock    = dlg.querySelector('#img-ed-rlock');

    rwInput.addEventListener('input', () => {
        if (!lock.checked) return;
        const nw = +rwInput.value;
        rhInput.value = Math.round(nw * origH / origW);
    });
    rhInput.addEventListener('input', () => {
        if (!lock.checked) return;
        const nh = +rhInput.value;
        rwInput.value = Math.round(nh * origW / origH);
    });

    dlg.querySelector('#img-ed-rapply').addEventListener('click', () => {
        const nw = Math.max(1, Math.round(+rwInput.value));
        const nh = Math.max(1, Math.round(+rhInput.value));
        const tmp = document.createElement('canvas');
        tmp.width = nw; tmp.height = nh;
        tmp.getContext('2d').drawImage(_canvas, 0, 0, nw, nh);
        _canvas.width = nw; _canvas.height = nh;
        _ctx.drawImage(tmp, 0, 0);
        dlg.remove(); _resizeDialogEl = null;
        _fitToView();
        _pushUndo();
    });
    dlg.querySelector('#img-ed-rcancel').addEventListener('click', () => {
        dlg.remove(); _resizeDialogEl = null;
    });
}

// ── Save / Download ───────────────────────────────────────────────────────────

function _getOutputMimeAndExt() {
    const mime = _att.mimeType || 'image/png';
    // Prefer the original format; fall back to png for unsupported types
    const supported = ['image/png', 'image/jpeg', 'image/webp'];
    if (supported.includes(mime)) return { mime, ext: mime.split('/')[1] };
    return { mime: 'image/png', ext: 'png' };
}

function _canvasToBase64() {
    const { mime } = _getOutputMimeAndExt();
    const quality  = (mime === 'image/jpeg' || mime === 'image/webp') ? 0.92 : undefined;
    const dataUrl  = quality !== undefined ? _canvas.toDataURL(mime, quality) : _canvas.toDataURL(mime);
    return dataUrl.split(',')[1];
}

function _saveOverwrite() {
    const b64  = _canvasToBase64();
    const { mime } = _getOutputMimeAndExt();
    // Approximate size from base64 length
    const size = Math.round(b64.length * 0.75);
    _onSaveOverwrite(b64, size, mime, _att);
}

function _saveNew() {
    const b64  = _canvasToBase64();
    const { mime, ext } = _getOutputMimeAndExt();
    const size = Math.round(b64.length * 0.75);
    const lastDot = _att.name.lastIndexOf('.');
    const base    = lastDot >= 0 ? _att.name.slice(0, lastDot) : _att.name;
    const suggested = `${base}_new.${ext}`;
    const newName = window.prompt('Save as new — enter file name:', suggested);
    if (!newName || !newName.trim()) return;
    const newAtt = _onSaveNew(b64, size, newName.trim(), mime);
    if (newAtt) {
        _att = newAtt;
        _editorEl.querySelector('#img-ed-filename').value = _att.name;
    }
}

function _download() {
    const b64  = _canvasToBase64();
    const { mime, ext } = _getOutputMimeAndExt();
    const binary = atob(b64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const lastDot = _att.name.lastIndexOf('.');
    const base    = lastDot >= 0 ? _att.name.slice(0, lastDot) : _att.name;
    a.href     = url;
    a.download = `${base}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ── Shape tools ──────────────────────────────────────────────────────────────

function _applyShapeToCtx(start, end) {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x);
    const h = Math.abs(end.y - start.y);
    _ctx.save();
    _ctx.strokeStyle = _penColor;
    _ctx.fillStyle   = _penColor;
    _ctx.lineWidth   = _penSize;
    _ctx.lineCap     = 'round';
    _ctx.lineJoin    = 'round';
    switch (_activeTool) {
        case 'rect':
            if (_shapeFill) { _ctx.fillRect(x, y, w, h); }
            else            { _ctx.strokeRect(x, y, w, h); }
            break;
        case 'ellipse':
            if (w < 1 || h < 1) break;
            _ctx.beginPath();
            _ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
            if (_shapeFill) _ctx.fill(); else _ctx.stroke();
            break;
        case 'line':
            _ctx.beginPath();
            _ctx.moveTo(start.x, start.y);
            _ctx.lineTo(end.x, end.y);
            _ctx.stroke();
            break;
        case 'arrow':
            _drawArrow(start.x, start.y, end.x, end.y);
            break;
        case 'callout':
            _drawCallout(end.x, end.y);
            break;
    }
    _ctx.restore();
}

/** Alias — same as preview, called at mouseup to commit final position */
function _commitShape(start, end) {
    _applyShapeToCtx(start, end);
}

function _drawArrow(x1, y1, x2, y2) {
    const headLen = Math.max(_penSize * 5, 12);
    const angle   = Math.atan2(y2 - y1, x2 - x1);
    _ctx.beginPath();
    _ctx.moveTo(x1, y1);
    _ctx.lineTo(x2, y2);
    _ctx.stroke();
    // Filled arrowhead
    _ctx.save();
    _ctx.translate(x2, y2);
    _ctx.rotate(angle);
    _ctx.beginPath();
    _ctx.moveTo(0, 0);
    _ctx.lineTo(-headLen, -headLen * 0.38);
    _ctx.lineTo(-headLen,  headLen * 0.38);
    _ctx.closePath();
    _ctx.fillStyle = _penColor;
    _ctx.fill();
    _ctx.restore();
}

function _drawCallout(cx, cy) {
    const r = Math.max(_penSize * 5, 14);
    _ctx.beginPath();
    _ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (_bgColor) {
        _ctx.fillStyle = _bgColor;
        _ctx.fill();
    }
    _ctx.strokeStyle = _penColor;
    _ctx.lineWidth   = Math.max(1.5, _penSize);
    _ctx.stroke();
    _ctx.fillStyle    = _penColor;
    _ctx.font         = `bold ${Math.round(r * 1.3)}px sans-serif`;
    _ctx.textAlign    = 'center';
    _ctx.textBaseline = 'middle';
    _ctx.fillText(String(_calloutCount), cx, cy);
}

function _applyBlur(rect) {
    const blockSize = Math.max(4, Math.round(_penSize * 2));
    const x  = Math.max(0, Math.round(rect.x));
    const y  = Math.max(0, Math.round(rect.y));
    const w  = Math.min(_canvas.width  - x, Math.round(rect.w));
    const h  = Math.min(_canvas.height - y, Math.round(rect.h));
    if (w < 2 || h < 2) return;
    const imgData = _ctx.getImageData(x, y, w, h);
    const d = imgData.data;
    for (let by = 0; by < h; by += blockSize) {
        for (let bx = 0; bx < w; bx += blockSize) {
            const bw = Math.min(blockSize, w - bx);
            const bh = Math.min(blockSize, h - by);
            let r = 0, g = 0, b = 0, a = 0, cnt = 0;
            for (let dy = 0; dy < bh; dy++) {
                for (let dx = 0; dx < bw; dx++) {
                    const i = ((by + dy) * w + (bx + dx)) * 4;
                    r += d[i]; g += d[i+1]; b += d[i+2]; a += d[i+3]; cnt++;
                }
            }
            r = Math.round(r/cnt); g = Math.round(g/cnt);
            b = Math.round(b/cnt); a = Math.round(a/cnt);
            for (let dy = 0; dy < bh; dy++) {
                for (let dx = 0; dx < bw; dx++) {
                    const i = ((by + dy) * w + (bx + dx)) * 4;
                    d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = a;
                }
            }
        }
    }
    _ctx.putImageData(imgData, x, y);
}

// ── Close ─────────────────────────────────────────────────────────────────────

function _close() {
    if (_editorEl) {
        _closeTextDialog();
        document.removeEventListener('keydown', _editorEl._keyHandler);
        if (_editorEl._ro) _editorEl._ro.disconnect();
        _editorEl.remove();
        _editorEl = null;
        _canvas   = null;
        _ctx      = null;
    }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function _normRect(a, b) {
    return {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        w: Math.abs(b.x - a.x),
        h: Math.abs(b.y - a.y),
    };
}

function _updateSizeLabel() {
    const el = _editorEl && _editorEl.querySelector('#img-ed-size-label');
    if (el) el.textContent = `${_canvas.width} × ${_canvas.height} px`;
}
