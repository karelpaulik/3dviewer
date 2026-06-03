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
let _activeTool = 'pan';     // 'pan'|'crop'|'pen'|'text'
let _penColor   = '#ff0000';
let _penSize    = 3;
let _textColor  = '#ff0000';
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

// Crop
let _isCropping  = false;
let _cropStart   = null;
let _cropRect    = null;   // { x, y, w, h } in image coordinates

// Text placement
let _pendingText = false;

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
                <span class="img-ed-title" id="img-ed-filename"></span>
                <div class="img-ed-sep"></div>

                <button class="img-ed-btn" id="img-ed-undo" title="Undo (Ctrl+Z)">↩ Undo</button>
                <button class="img-ed-btn" id="img-ed-redo" title="Redo (Ctrl+Y)">↪ Redo</button>
                <div class="img-ed-sep"></div>

                <button class="img-ed-tool-btn" id="img-ed-tool-pan"  title="Pan / Move (Space+drag)">✋ Pan</button>
                <button class="img-ed-tool-btn" id="img-ed-tool-crop" title="Crop">✂ Crop</button>
                <button class="img-ed-tool-btn" id="img-ed-tool-pen"       title="Freehand pen">✏ Pen</button>
                <button class="img-ed-tool-btn" id="img-ed-tool-text"      title="Place text (double-click on image)">T Text</button>
                <button class="img-ed-tool-btn" id="img-ed-tool-rect"      title="Obdélník">▭ Rect</button>
                <button class="img-ed-tool-btn" id="img-ed-tool-ellipse"   title="Elipsa">⬭ Ellipse</button>
                <button class="img-ed-tool-btn" id="img-ed-tool-line"      title="Přímá čára">╱ Line</button>
                <button class="img-ed-tool-btn" id="img-ed-tool-arrow"     title="Šipka s hlavicí">→ Arrow</button>
                <button class="img-ed-tool-btn" id="img-ed-tool-highlight" title="Zvýrazňovač (poloprůhledný)">🖌 Hl</button>
                <button class="img-ed-tool-btn" id="img-ed-tool-eraser"    title="Guma — vymazat kresbu">⬜ Erase</button>
                <button class="img-ed-tool-btn" id="img-ed-tool-callout"   title="Číslovaný callout (kroužek s číslem)">① Callout</button>
                <button class="img-ed-tool-btn" id="img-ed-tool-blur"      title="Pixelate / Blur výběr (ochrana soukromí)">⊞ Blur</button>
                <button class="img-ed-btn" id="img-ed-fill-toggle"         title="Přepnout Fill / Outline pro tvary (Rect, Ellipse)">◻ Outline</button>
                <button class="img-ed-btn" id="img-ed-callout-reset"       title="Reset callout číslování na 1">↺①</button>
                <div class="img-ed-sep"></div>

                <label class="img-ed-label" title="Pen / Text colour">
                    Color <input type="color" id="img-ed-color" value="#ff0000">
                </label>
                <label class="img-ed-label" title="Pen stroke width">
                    Size <input type="number" id="img-ed-pensize" min="1" max="100" value="3" style="width:44px">
                </label>
                <label class="img-ed-label" title="Font size (px)">
                    Font <input type="number" id="img-ed-fontsize" min="6" max="200" value="18" style="width:44px">
                </label>
                <div class="img-ed-sep"></div>

                <button class="img-ed-btn" id="img-ed-rotate-cw"  title="Rotate 90° CW">↻ 90°</button>
                <button class="img-ed-btn" id="img-ed-rotate-ccw" title="Rotate 90° CCW">↺ 90°</button>
                <button class="img-ed-btn" id="img-ed-flip-h"     title="Flip Horizontal">⇄ H</button>
                <button class="img-ed-btn" id="img-ed-flip-v"     title="Flip Vertical">⇅ V</button>
                <button class="img-ed-btn" id="img-ed-resize"     title="Resize canvas">⊡ Resize</button>
                <div class="img-ed-sep"></div>

                <button class="img-ed-btn img-ed-btn-primary" id="img-ed-apply-crop" style="display:none">✔ Apply Crop</button>
                <button class="img-ed-btn" id="img-ed-cancel-crop" style="display:none">✕ Cancel</button>
                <div class="img-ed-sep" id="img-ed-crop-sep" style="display:none"></div>

                <div style="flex:1"></div>

                <button class="img-ed-btn img-ed-btn-save" id="img-ed-save-overwrite" title="Overwrite original attachment">💾 Overwrite</button>
                <button class="img-ed-btn img-ed-btn-save" id="img-ed-save-new"       title="Save as new attachment in Files">＋ Save as new</button>
                <button class="img-ed-btn img-ed-btn-save" id="img-ed-download"       title="Download to disk">⬇ Download</button>
                <div class="img-ed-sep"></div>
                <button class="img-ed-btn" id="img-ed-close">✕ Close</button>
            </div>
            <div id="img-editor-viewport">
                <canvas id="img-editor-canvas"></canvas>
                <canvas id="img-editor-overlay-canvas"></canvas>
            </div>
            <div id="img-editor-statusbar">
                <span id="img-ed-zoom-label">100%</span>
                <span id="img-ed-size-label"></span>
                <span id="img-ed-hint"></span>
            </div>
        </div>`;

    document.body.appendChild(_editorEl);

    _canvas = _editorEl.querySelector('#img-editor-canvas');
    _ctx    = _canvas.getContext('2d');
    const ovCanvas = _editorEl.querySelector('#img-editor-overlay-canvas');
    const ovCtx    = ovCanvas.getContext('2d');

    _editorEl.querySelector('#img-ed-filename').textContent = _att.name;

    // ── Toolbar events ──
    _editorEl.querySelector('#img-ed-undo').addEventListener('click', _undo);
    _editorEl.querySelector('#img-ed-redo').addEventListener('click', _redo);

    ['pan', 'crop', 'pen', 'text', 'rect', 'ellipse', 'line', 'arrow', 'highlight', 'eraser', 'callout', 'blur'].forEach(tool => {
        _editorEl.querySelector(`#img-ed-tool-${tool}`).addEventListener('click', () => _setTool(tool));
    });

    _editorEl.querySelector('#img-ed-fill-toggle').addEventListener('click', () => {
        _shapeFill = !_shapeFill;
        const btn = _editorEl.querySelector('#img-ed-fill-toggle');
        btn.textContent = _shapeFill ? '■ Fill' : '◻ Outline';
        btn.classList.toggle('active', _shapeFill);
    });
    _editorEl.querySelector('#img-ed-callout-reset').addEventListener('click', () => { _calloutCount = 1; });

    _editorEl.querySelector('#img-ed-color').addEventListener('input', e => {
        _penColor  = e.target.value;
        _textColor = e.target.value;
    });
    _editorEl.querySelector('#img-ed-pensize').addEventListener('input', e => { _penSize = +e.target.value; });
    _editorEl.querySelector('#img-ed-fontsize').addEventListener('input', e => { _fontSize = +e.target.value; });

    _editorEl.querySelector('#img-ed-rotate-cw').addEventListener('click',  () => _rotate(90));
    _editorEl.querySelector('#img-ed-rotate-ccw').addEventListener('click', () => _rotate(-90));
    _editorEl.querySelector('#img-ed-flip-h').addEventListener('click', () => _flip('h'));
    _editorEl.querySelector('#img-ed-flip-v').addEventListener('click', () => _flip('v'));
    _editorEl.querySelector('#img-ed-resize').addEventListener('click', _showResizeDialog);

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
    vp.addEventListener('click',    e => { if (_activeTool === 'text') _placeText(e); });
    vp.addEventListener('dblclick', e => { if (_activeTool === 'text') e.stopPropagation(); });

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
    const cursors = {
        pan: 'grab', crop: 'crosshair', pen: 'crosshair', text: 'text',
        rect: 'crosshair', ellipse: 'crosshair', line: 'crosshair', arrow: 'crosshair',
        highlight: 'crosshair', eraser: 'cell', callout: 'crosshair', blur: 'crosshair',
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

function _applyTransform() {
    if (!_canvas) return;
    _canvas.style.transform         = `translate(${_panX}px, ${_panY}px) scale(${_zoom})`;
    _canvas.style.transformOrigin   = '0 0';
    const zl = _editorEl && _editorEl.querySelector('#img-ed-zoom-label');
    if (zl) zl.textContent = `${Math.round(_zoom * 100)}%`;
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

    // Redraw overlay
    const ov = _editorEl.querySelector('#img-editor-overlay-canvas');
    const ovCtx = ov.getContext('2d');
    _redrawOverlay(ov, ovCtx);
}

// ── Mouse events ──────────────────────────────────────────────────────────────

function _onMouseDown(e) {
    if (e.button !== 0) return;

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
        _ctx.save();
        _ctx.globalAlpha = 0.4;
        _ctx.beginPath();
        _ctx.arc(pt.x, pt.y, _penSize * 3, 0, Math.PI * 2);
        _ctx.fillStyle = _penColor;
        _ctx.fill();
        _ctx.restore();
        return;
    }

    if (_activeTool === 'eraser') {
        _isDrawing = true;
        const pt = _vpToImg(e.clientX, e.clientY);
        _lastDrawPt = pt;
        _ctx.save();
        _ctx.globalCompositeOperation = 'destination-out';
        _ctx.beginPath();
        _ctx.arc(pt.x, pt.y, _penSize * 2, 0, Math.PI * 2);
        _ctx.fillStyle = 'rgba(0,0,0,1)';
        _ctx.fill();
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
            _ctx.save();
            _ctx.globalAlpha = 0.4;
            _ctx.beginPath();
            _ctx.moveTo(_lastDrawPt.x, _lastDrawPt.y);
            _ctx.lineTo(pt.x, pt.y);
            _ctx.strokeStyle = _penColor;
            _ctx.lineWidth   = _penSize * 6;
            _ctx.lineCap     = 'round';
            _ctx.lineJoin    = 'round';
            _ctx.stroke();
            _ctx.restore();
        } else if (_activeTool === 'eraser') {
            _ctx.save();
            _ctx.globalCompositeOperation = 'destination-out';
            _ctx.beginPath();
            _ctx.moveTo(_lastDrawPt.x, _lastDrawPt.y);
            _ctx.lineTo(pt.x, pt.y);
            _ctx.strokeStyle = 'rgba(0,0,0,1)';
            _ctx.lineWidth   = _penSize * 4;
            _ctx.lineCap     = 'round';
            _ctx.lineJoin    = 'round';
            _ctx.stroke();
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
    const pt   = _vpToImg(e.clientX, e.clientY);
    const text = window.prompt('Enter text:', '');
    if (!text) return;
    _ctx.font         = `${_fontSize}px ${_fontFamily}`;
    _ctx.fillStyle    = _textColor;
    _ctx.textBaseline = 'top';
    _ctx.fillText(text, pt.x, pt.y);
    _pushUndo();
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
    _onSaveOverwrite(b64, size, mime);
    _close();
}

function _saveNew() {
    const b64  = _canvasToBase64();
    const { mime, ext } = _getOutputMimeAndExt();
    const size = Math.round(b64.length * 0.75);
    // Suggest name with _edited suffix
    const lastDot = _att.name.lastIndexOf('.');
    const base    = lastDot >= 0 ? _att.name.slice(0, lastDot) : _att.name;
    const newName = `${base}_edited.${ext}`;
    _onSaveNew(b64, size, newName, mime);
    _close();
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
    a.download = `${base}_edited.${ext}`;
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
    _ctx.fillStyle = _penColor;
    _ctx.fill();
    _ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    _ctx.lineWidth   = Math.max(1, _penSize * 0.5);
    _ctx.stroke();
    _ctx.fillStyle    = '#fff';
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
