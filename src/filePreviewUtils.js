// filePreviewUtils.js
// Multi-instance floating file preview windows (images, PDF, video, audio, text).
// Pattern mirrors imageEditorUtils.js — shared toolbar + draggable resizable windows.

import { buildWysiwygEditor } from './annotationUtils.js';

const _Z_PREVIEW_BASE = 99990;
const _Z_PREVIEW_MAX  = 99999;

let _instances = [];
let _activeInst = null;
let _toolbarEl = null;
let _nextZIndex = _Z_PREVIEW_BASE + 1;
let _nextWinPos = 0;
let _globalHandlers = null;
let _keyHandlerAttached = false;

function _createInstance(att) {
    return {
        att,
        winEl: null,
        blobUrl: null,
        commentPanelOpen: false,
        commentEditorContent: null,
        savedBounds: null,
        isMaximized: false,
        imageFitFn: null,
    };
}

/**
 * @param {object} att – attachment { id, name, mimeType, data, comment? }
 * @param {object} handlers – callbacks from attachmentsUtils
 */
export function openFilePreview(att, handlers) {
    _globalHandlers = handlers;

    const existing = _instances.find(i =>
        i.att === att || (att.id && i.att.id === att.id)
    );
    if (existing) {
        _focusInstance(existing);
        return;
    }

    const inst = _createInstance(att);
    _instances.push(inst);
    _ensureToolbar();
    _buildInstanceUI(inst);
    _focusInstance(inst);
    // Defer maximize one frame so the toolbar is fully rendered and getBoundingClientRect returns correct height
    requestAnimationFrame(() => _toggleMaximize(inst));
}

export function closeFilePreviewForAttachment(att) {
    const inst = _instances.find(i =>
        i.att === att || (att?.id && i.att.id === att.id)
    );
    if (inst) _close(inst);
}

export function isFilePreviewOpenForAttachment(att) {
    return _instances.some(i =>
        i.att === att || (att?.id && i.att.id === att.id)
    );
}

export function autoArrangeFilePreviews() {
    _autoArrange();
}

export function updateFilePreviewConvertState(busy) {
    _instances.forEach(inst => {
        const mime = inst.att.mimeType;
        const isPdf = mime === 'application/pdf';
        const isImage = mime?.startsWith('image/');
        if (!isPdf && !isImage) return;
        const btn = inst.winEl?.querySelector('.fp-convert-btn');
        if (!btn) return;
        btn.disabled = busy;
        if (isPdf) {
            btn.textContent = busy ? 'Converting…' : '🖼 → Images';
        } else {
            btn.textContent = busy ? 'Converting…' : '📕 → PDF';
        }
        btn.style.opacity = busy ? '0.5' : '1';
        btn.style.cursor = busy ? 'default' : 'pointer';
    });
}

/** Re-render preview content when attachment data changes (e.g. after rename from outside). */
export function refreshFilePreviewAttachment(att) {
    const inst = _instances.find(i => att.id && i.att.id === att.id);
    if (inst) _renderPreview(inst);
}

// ── Shared toolbar ────────────────────────────────────────────────────────────

function _ensureToolbar() {
    if (_toolbarEl && document.body.contains(_toolbarEl)) return;

    _toolbarEl = document.createElement('div');
    _toolbarEl.id = 'file-preview-toolbar';
    _toolbarEl.innerHTML = `
        <div class="fp-toolbar-row">
            <span class="fp-toolbar-label">File preview</span>
            <button class="fp-toolbar-btn" id="fp-arrange" title="Arrange all windows into a grid">⊞ Tile</button>
            <button class="fp-toolbar-btn fp-toolbar-btn-close" id="fp-close-all" title="Close all preview windows">✕ Close all</button>
        </div>`;
    document.body.appendChild(_toolbarEl);

    _toolbarEl.querySelector('#fp-arrange').addEventListener('click', () => _autoArrange());
    _toolbarEl.querySelector('#fp-close-all').addEventListener('click', () => {
        while (_instances.length) _close(_instances[0]);
    });
}

function _removeToolbarIfEmpty() {
    if (_instances.length === 0 && _toolbarEl) {
        _toolbarEl.remove();
        _toolbarEl = null;
    }
}

// ── Instance UI ───────────────────────────────────────────────────────────────

function _buildInstanceUI(inst) {
    const offset = (_nextWinPos % 8) * 28;
    _nextWinPos++;

    const win = document.createElement('div');
    win.className = 'file-preview-window';
    win.style.left = (60 + offset) + 'px';
    win.style.top = (_toolbarHeight() + 60 + offset) + 'px';
    win.style.zIndex = String(_allocPreviewZIndex());

    win.innerHTML = `
        <div class="file-preview-titlebar">
            <span class="fp-title-icon">📄</span>
            <span class="fp-title-name">
                <input class="fp-name-input" title="Click to rename (extension is read-only)" spellcheck="false" />
                <span class="fp-name-ext"></span>
            </span>
            <div class="fp-titlebar-btns">
                <button class="fp-title-btn fp-ocr-btn" title="Recognize text (OCR)" style="display:none">🔤 OCR</button>
                <button class="fp-title-btn fp-edit-btn" title="Edit" style="display:none">✏ Edit</button>
                <button class="fp-title-btn fp-pages-btn" title="Reorder, add, or delete PDF pages" style="display:none">📄 Pages</button>
                <button class="fp-title-btn fp-convert-btn" title="Convert PDF pages to PNG/JPG images" style="display:none">🖼 → Images</button>
                <button class="fp-title-btn fp-comment-btn" title="Comment">💬</button>
                <button class="fp-title-btn fp-maximize-btn" title="Maximize window">⤢</button>
                <button class="fp-title-btn fp-close-btn" title="Close">✕</button>
            </div>
        </div>
        <div class="file-preview-body">
            <div class="file-preview-content"></div>
            <div class="file-preview-comment-panel" style="display:none"></div>
        </div>`;

    document.body.appendChild(win);
    inst.winEl = win;

    _updateTitleFields(inst);
    _renderPreview(inst);
    _wireInstanceEvents(inst);

    if (!_keyHandlerAttached) {
        _keyHandlerAttached = true;
        document.addEventListener('keydown', _onGlobalKeydown);
    }
}

function _wireInstanceEvents(inst) {
    const win = inst.winEl;
    const att = inst.att;

    win.addEventListener('mousedown', () => _focusInstance(inst));

    win.querySelector('.fp-close-btn').addEventListener('click', () => _close(inst));
    win.querySelector('.fp-maximize-btn').addEventListener('click', () => _toggleMaximize(inst));

    win.querySelector('.fp-ocr-btn').addEventListener('click', () => {
        _globalHandlers?.onOcr?.(att, win.querySelector('.fp-ocr-btn'));
    });
    win.querySelector('.fp-edit-btn').addEventListener('click', () => {
        if (att.mimeType === 'application/pdf') _globalHandlers?.onEditPdf?.(att);
        else _globalHandlers?.onEdit?.(att);
    });
    win.querySelector('.fp-pages-btn').addEventListener('click', () => {
        _globalHandlers?.onManagePages?.(att);
    });
    win.querySelector('.fp-convert-btn').addEventListener('click', () => {
        if (att.mimeType === 'application/pdf') _globalHandlers?.onConvertPdf?.(att);
        else if (att.mimeType?.startsWith('image/')) _globalHandlers?.onConvertImage?.(att);
    });
    win.querySelector('.fp-comment-btn').addEventListener('click', () => _toggleCommentPanel(inst));

    const nameInput = win.querySelector('.fp-name-input');
    nameInput.addEventListener('blur', () => _saveName(inst));
    nameInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); nameInput.blur(); }
        if (e.key === 'Escape') {
            _updateTitleFields(inst);
            nameInput.blur();
        }
    });

    const titlebar = win.querySelector('.file-preview-titlebar');
    titlebar.addEventListener('dblclick', e => {
        if (e.target.closest('button, input')) return;
        _toggleMaximize(inst);
    });
    _makeDraggable(inst, titlebar);
}

function _makeDraggable(inst, handle) {
    handle.addEventListener('mousedown', ev => {
        if (ev.button !== 0) return;
        if (inst.isMaximized) return;
        if (ev.target.closest('button, input')) return;
        ev.preventDefault();
        const win = inst.winEl;
        const r = win.getBoundingClientRect();
        const dragOff = { x: ev.clientX - r.left, y: ev.clientY - r.top };
        const onMove = mv => {
            win.style.left = (mv.clientX - dragOff.x) + 'px';
            win.style.top = (mv.clientY - dragOff.y) + 'px';
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });

    handle.addEventListener('touchstart', ev => {
        if (ev.touches.length !== 1) return;
        if (inst.isMaximized) return;
        if (ev.target.closest('button, input')) return;
        ev.preventDefault();
        const win = inst.winEl;
        const touch = ev.touches[0];
        const r = win.getBoundingClientRect();
        const dragOff = { x: touch.clientX - r.left, y: touch.clientY - r.top };
        const onMove = mv => {
            if (mv.touches.length !== 1) return;
            const t = mv.touches[0];
            win.style.left = (t.clientX - dragOff.x) + 'px';
            win.style.top = (t.clientY - dragOff.y) + 'px';
        };
        const onEnd = () => {
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
            document.removeEventListener('touchcancel', onEnd);
        };
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
        document.addEventListener('touchcancel', onEnd);
    }, { passive: false });
}

function _toolbarHeight() {
    return _toolbarEl ? _toolbarEl.getBoundingClientRect().height : 0;
}

function _updateTitleFields(inst) {
    const att = inst.att;
    const lastDot = att.name.lastIndexOf('.');
    const nameBase = lastDot >= 0 ? att.name.slice(0, lastDot) : att.name;
    const nameExt = lastDot >= 0 ? att.name.slice(lastDot) : '';
    inst.winEl.querySelector('.fp-name-input').value = nameBase;
    inst.winEl.querySelector('.fp-name-ext').textContent = nameExt;
}

function _saveName(inst) {
    const att = inst.att;
    const input = inst.winEl.querySelector('.fp-name-input');
    const extSpan = inst.winEl.querySelector('.fp-name-ext');
    const newBase = input.value.trim();
    if (!newBase) {
        _updateTitleFields(inst);
        return;
    }
    att.name = newBase + extSpan.textContent;
    _globalHandlers?.onNameChanged?.(att);
}

function _saveComment(inst) {
    if (!inst.commentEditorContent) return;
    const html = inst.commentEditorContent.innerHTML;
    inst.att.comment = (html && html !== '<br>') ? html : '';
}

function _buildCommentEditor(inst) {
    const panel = inst.winEl.querySelector('.file-preview-comment-panel');
    panel.innerHTML = '';
    inst.commentEditorContent = null;
    const { wrap, content } = buildWysiwygEditor(inst.att.comment || '');
    wrap.style.cssText += ';height:100%;box-sizing:border-box;';
    panel.appendChild(wrap);
    inst.commentEditorContent = content;
    content.addEventListener('input', () => {
        const html = content.innerHTML;
        inst.att.comment = (html && html !== '<br>') ? html : '';
    });
}

function _toggleCommentPanel(inst) {
    inst.commentPanelOpen = !inst.commentPanelOpen;
    const panel = inst.winEl.querySelector('.file-preview-comment-panel');
    if (inst.commentPanelOpen) {
        panel.style.display = 'block';
        _buildCommentEditor(inst);
    } else {
        _saveComment(inst);
        panel.style.display = 'none';
        inst.commentEditorContent = null;
    }
    _updateCommentBtn(inst);
}

function _updateCommentBtn(inst) {
    const btn = inst.winEl.querySelector('.fp-comment-btn');
    if (!btn) return;
    btn.style.background = inst.commentPanelOpen ? '#3a5a3a' : '';
    btn.style.borderColor = inst.commentPanelOpen ? '#6a6' : '';
    btn.style.color = inst.commentPanelOpen ? '#fff' : '';
}

function _renderPreview(inst) {
    const att = inst.att;
    const mime = att.mimeType || '';

    if (inst.blobUrl) {
        const oldUrl = inst.blobUrl;
        setTimeout(() => URL.revokeObjectURL(oldUrl), 10000);
    }

    const binary = atob(att.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: att.mimeType });
    inst.blobUrl = URL.createObjectURL(blob);

    const content = inst.winEl.querySelector('.file-preview-content');
    content.innerHTML = '';
    inst.imageFitFn = null;
    content.style.background = mime.startsWith('text/') ? '#f5f5f5' : '#1a1a1a';

    if (mime.startsWith('image/')) {
        inst.imageFitFn = _mountImagePreview(content, inst.blobUrl);
        inst.winEl.querySelector('.fp-title-icon').textContent = '🖼';
    } else if (mime.startsWith('video/')) {
        const v = document.createElement('video');
        v.src = inst.blobUrl;
        v.controls = true;
        v.style.cssText = 'width:100%;height:100%;display:block;background:#000;';
        content.appendChild(v);
        inst.winEl.querySelector('.fp-title-icon').textContent = '🎬';
    } else if (mime.startsWith('audio/')) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';
        const a = document.createElement('audio');
        a.src = inst.blobUrl;
        a.controls = true;
        a.style.width = '100%';
        wrap.appendChild(a);
        content.appendChild(wrap);
        inst.winEl.querySelector('.fp-title-icon').textContent = '🔊';
    } else {
        const iframe = document.createElement('iframe');
        iframe.src = inst.blobUrl;
        iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
        content.appendChild(iframe);
        inst.winEl.querySelector('.fp-title-icon').textContent =
            mime === 'application/pdf' ? '📕' : '📄';
    }

    const ocrBtn = inst.winEl.querySelector('.fp-ocr-btn');
    ocrBtn.style.display = mime.startsWith('image/') ? '' : 'none';

    const editBtn = inst.winEl.querySelector('.fp-edit-btn');
    const canEdit = mime.startsWith('image/') || mime === 'application/pdf';
    editBtn.style.display = canEdit ? '' : 'none';
    editBtn.textContent = mime === 'application/pdf' ? '✏ Edit PDF' : '✏ Edit';
    editBtn.title = mime === 'application/pdf' ? 'Edit PDF pages' : 'Edit image';

    inst.winEl.querySelector('.fp-pages-btn').style.display =
        mime === 'application/pdf' ? '' : 'none';

    const convertBtn = inst.winEl.querySelector('.fp-convert-btn');
    const canConvert = mime === 'application/pdf' || mime.startsWith('image/');
    convertBtn.style.display = canConvert ? '' : 'none';
    if (mime === 'application/pdf') {
        convertBtn.title = 'Convert PDF pages to PNG/JPG images';
        convertBtn.textContent = '🖼 → Images';
    } else if (mime.startsWith('image/')) {
        convertBtn.title = 'Convert image to PDF';
        convertBtn.textContent = '📕 → PDF';
    }

    if (inst.commentPanelOpen) _buildCommentEditor(inst);
    _updateCommentBtn(inst);
    _globalHandlers?.onAfterRender?.(inst);
}

function _mountImagePreview(container, blobUrl) {
    const vp = document.createElement('div');
    vp.style.cssText = 'width:100%;height:100%;overflow:hidden;position:relative;cursor:grab;touch-action:none;';

    const img = document.createElement('img');
    img.src = blobUrl;
    img.draggable = false;
    img.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0;user-select:none;-webkit-user-drag:none;';

    const state = {
        zoom: 1, panX: 0, panY: 0,
        isPanning: false, panStart: { x: 0, y: 0 },
        pinchDist0: null, touchMoved: false, lastTap: 0,
    };

    function applyTransform() {
        img.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
    }

    function fitToView() {
        const vpW = vp.clientWidth || 800;
        const vpH = vp.clientHeight || 600;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        if (!iw || !ih) return;
        state.zoom = Math.min(vpW / iw, vpH / ih, 1) * 0.95;
        state.panX = (vpW - iw * state.zoom) / 2;
        state.panY = (vpH - ih * state.zoom) / 2;
        applyTransform();
    }

    function zoomAt(mx, my, delta) {
        const newZoom = Math.min(Math.max(state.zoom * delta, 0.05), 20);
        state.panX = mx - (mx - state.panX) * (newZoom / state.zoom);
        state.panY = my - (my - state.panY) * (newZoom / state.zoom);
        state.zoom = newZoom;
        applyTransform();
    }

    img.onload = fitToView;

    vp.addEventListener('wheel', e => {
        e.preventDefault();
        const rect = vp.getBoundingClientRect();
        zoomAt(e.clientX - rect.left, e.clientY - rect.top, e.deltaY < 0 ? 1.12 : 1 / 1.12);
    }, { passive: false });

    function onMouseMove(e) {
        if (!state.isPanning) return;
        state.panX = e.clientX - state.panStart.x;
        state.panY = e.clientY - state.panStart.y;
        applyTransform();
    }
    function onMouseUp() {
        if (!state.isPanning) return;
        state.isPanning = false;
        vp.style.cursor = 'grab';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    vp.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        state.isPanning = true;
        state.panStart = { x: e.clientX - state.panX, y: e.clientY - state.panY };
        vp.style.cursor = 'grabbing';
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    vp.addEventListener('dblclick', fitToView);

    vp.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            state.pinchDist0 = Math.sqrt(dx * dx + dy * dy);
            state.isPanning = false;
            e.preventDefault();
            return;
        }
        state.pinchDist0 = null;
        if (e.touches.length !== 1) return;
        e.preventDefault();
        state.touchMoved = false;
        state.isPanning = true;
        state.panStart = { x: e.touches[0].clientX - state.panX, y: e.touches[0].clientY - state.panY };
    }, { passive: false });

    vp.addEventListener('touchmove', e => {
        if (e.touches.length === 2 && state.pinchDist0 !== null) {
            e.preventDefault();
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const rect = vp.getBoundingClientRect();
            const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
            const my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
            const delta = dist / state.pinchDist0;
            state.pinchDist0 = dist;
            zoomAt(mx, my, delta);
            return;
        }
        if (e.touches.length !== 1 || !state.isPanning) return;
        e.preventDefault();
        state.touchMoved = true;
        state.panX = e.touches[0].clientX - state.panStart.x;
        state.panY = e.touches[0].clientY - state.panStart.y;
        applyTransform();
    }, { passive: false });

    vp.addEventListener('touchend', e => {
        state.pinchDist0 = null;
        state.isPanning = false;
        if (e.changedTouches.length === 1 && !state.touchMoved) {
            const now = Date.now();
            if (now - state.lastTap < 300) { fitToView(); state.lastTap = 0; }
            else state.lastTap = now;
        }
        state.touchMoved = false;
    }, { passive: false });

    vp.addEventListener('touchcancel', () => {
        state.pinchDist0 = null;
        state.isPanning = false;
        state.touchMoved = false;
    });

    new ResizeObserver(() => fitToView()).observe(vp);
    vp.appendChild(img);
    container.appendChild(vp);
    return fitToView;
}

// ── Focus / z-index ───────────────────────────────────────────────────────────

function _allocPreviewZIndex() {
    const z = Math.min(_nextZIndex, _Z_PREVIEW_MAX);
    _nextZIndex = z >= _Z_PREVIEW_MAX ? _Z_PREVIEW_BASE + 1 : z + 1;
    return z;
}

function _focusInstance(inst) {
    _activeInst = inst;
    _instances.forEach(i => {
        i.winEl.classList.toggle('file-preview-window--active', i === inst);
    });
    inst.winEl.style.zIndex = String(_allocPreviewZIndex());
}

// ── Maximize / tile ───────────────────────────────────────────────────────────

function _toggleMaximize(inst) {
    const win = inst.winEl;
    const btn = win.querySelector('.fp-maximize-btn');
    if (!inst.isMaximized) {
        const r = win.getBoundingClientRect();
        inst.savedBounds = {
            left: r.left + 'px', top: r.top + 'px',
            width: r.width + 'px', height: r.height + 'px',
        };
        const toolbarH = _toolbarHeight();
        win.style.left = '0px';
        win.style.top = toolbarH + 'px';
        win.style.width = window.innerWidth + 'px';
        win.style.height = (window.innerHeight - toolbarH) + 'px';
        win.classList.add('file-preview-window--maximized');
        inst.isMaximized = true;
        if (btn) { btn.textContent = '⤡'; btn.title = 'Restore window'; }
    } else {
        const b = inst.savedBounds;
        win.style.left = b.left;
        win.style.top = b.top;
        win.style.width = b.width;
        win.style.height = b.height;
        win.classList.remove('file-preview-window--maximized');
        inst.isMaximized = false;
        inst.savedBounds = null;
        if (btn) { btn.textContent = '⤢'; btn.title = 'Maximize window'; }
    }
    requestAnimationFrame(() => inst.imageFitFn?.());
}

function _autoArrange() {
    const n = _instances.length;
    if (n === 0) return;

    _instances.forEach(inst => { if (inst.isMaximized) _toggleMaximize(inst); });

    const toolbarH = _toolbarHeight();
    const availW = window.innerWidth;
    const availH = window.innerHeight - toolbarH;
    const margin = 6;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const cellW = Math.floor((availW - margin * (cols + 1)) / cols);
    const cellH = Math.floor((availH - margin * (rows + 1)) / rows);

    _instances.forEach((inst, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const win = inst.winEl;
        win.style.left = (margin + col * (cellW + margin)) + 'px';
        win.style.top = (toolbarH + margin + row * (cellH + margin)) + 'px';
        win.style.width = cellW + 'px';
        win.style.height = cellH + 'px';
        win.style.zIndex = String(Math.min(_Z_PREVIEW_BASE + i, _Z_PREVIEW_MAX));
    });

    _nextZIndex = Math.min(_Z_PREVIEW_BASE + n, _Z_PREVIEW_MAX + 1);

    requestAnimationFrame(() => _instances.forEach(inst => inst.imageFitFn?.()));
}

// ── Close ─────────────────────────────────────────────────────────────────────

function _close(inst) {
    _saveComment(inst);
    _saveName(inst);
    if (inst.blobUrl) URL.revokeObjectURL(inst.blobUrl);
    inst.winEl.remove();
    _instances = _instances.filter(i => i !== inst);
    _activeInst = _instances.length ? _instances[_instances.length - 1] : null;
    if (_activeInst) _focusInstance(_activeInst);
    _removeToolbarIfEmpty();
    _globalHandlers?.onClose?.();
}

function _onGlobalKeydown(e) {
    if (!_activeInst) return;
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
    if (e.key === 'Escape') _close(_activeInst);
}
