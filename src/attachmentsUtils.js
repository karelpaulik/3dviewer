// attachmentsUtils.js
// Manages binary file attachments embedded in a GLB file.
// Each attachment is stored as base64-encoded data in userData.attachments.
// Attachments can be downloaded to disk on demand.

import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { buildWysiwygEditor } from './annotationUtils.js';
import { openImageEditor, autoArrangeImageEditors } from './imageEditorUtils.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

let attachmentsStore = []; // [{ id, name, mimeType, data (base64 string), size, addedAt }]
let _guiRef = null;
let _pdfConverting = false;
let _saveScreenCaptureFn = null;

// ── Public API ────────────────────────────────────────────────────────────────

export function getAttachmentsStore() {
    return attachmentsStore;
}

/** Extracts attachments embedded in a loaded GLB scene and adds them to the store. */
export function importAttachmentsFromGltfScene(gltfScene) {
    let attachments = null;
    gltfScene.traverse(node => {
        if (Array.isArray(node.userData.attachments) && node.userData.attachments.length > 0) {
            if (!attachments) attachments = node.userData.attachments;
            // Remove from node so it is not re-exported with stale data on next save
            delete node.userData.attachments;
        }
    });
    if (!attachments) return;
    attachments.forEach(att => {
        if (!attachmentsStore.find(a => a.id === att.id)) {
            attachmentsStore.push(att);
        }
    });
    refreshAttachmentsGui();
}

/** Initialise the lil-gui panel. Must be called once with the folder/GUI instance. */
export function initAttachmentsGui(gui, saveScreenCaptureFn) {
    _guiRef = gui;
    _saveScreenCaptureFn = saveScreenCaptureFn || null;
    refreshAttachmentsGui();
}

/** Add an image attachment from a Blob (e.g. screen capture). */
export async function addImageAttachmentFromBlob(blob, suggestedName) {
    const name = _uniqueAttachmentName(suggestedName);
    const mimeType = blob.type || 'image/png';
    const data = await _blobToBase64(blob);
    attachmentsStore.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name,
        mimeType,
        data,
        size: blob.size,
        addedAt: new Date().toISOString(),
    });
    refreshAttachmentsGui();
    return name;
}

/** Rebuild the attachment list in the lil-gui panel. */
export function refreshAttachmentsGui() {
    if (!_guiRef) return;

    // Remove all existing controllers and child folders
    [..._guiRef.controllers].forEach(c => c.destroy());
    [..._guiRef.folders].forEach(f => f.destroy());

    // "Add files" button
    _guiRef.add({ fn: _addAttachments }, 'fn').name('+ Add files…');
    // "Paste image from clipboard" button
    _guiRef.add({ fn: _pasteImageFromClipboard }, 'fn').name('📋 Paste image…');
    // "New blank image" button
    _guiRef.add({ fn: _newImage }, 'fn').name('🖼 New image…');
    if (_saveScreenCaptureFn) {
        _guiRef.add({ fn: _saveScreenCaptureToFiles }, 'fn').name('📸 Screen capture…');
    }

    // "Download all as ZIP" button — only shown when there is at least one attachment
    if (attachmentsStore.length > 0) {
        _guiRef.add({ fn: _downloadAllAsZip }, 'fn').name('⬇  Download all as ZIP');
    }

    // "Edit all images" button — only shown when there is at least one image attachment
    const imageAtts = attachmentsStore.filter(a => a.mimeType && a.mimeType.startsWith('image/'));
    if (imageAtts.length > 0) {
        _guiRef.add({ fn: () => {
            imageAtts.forEach(a => _editAttachment(a));
            if (imageAtts.length > 1) {
                // Small delay so the browser paints the windows before the dialog blocks rendering
                setTimeout(() => {
                    if (window.confirm('Arrange windows as tile?')) {
                        autoArrangeImageEditors();
                    }
                }, 150);
            }
        } }, 'fn').name('✏  Edit all images…');
    }

    // One folder per attachment with download + delete buttons inside
    attachmentsStore.forEach(att => {
        const sizeStr = _formatSize(att.size);
        const prefix = att.comment ? '💬 ' : '';
        const folder = _guiRef.addFolder(`${prefix}${att.name}  (${sizeStr})`);
        if (_canOpenInBrowser(att.mimeType)) {
            folder.add({ fn: () => _openAttachment(att) }, 'fn').name('↗  Open');
        }
        if (att.mimeType && att.mimeType.startsWith('image/')) {
            folder.add({ fn: () => _editAttachment(att) }, 'fn').name('✏  Edit');
        }
        if (att.mimeType === 'application/pdf') {
            folder.add({ fn: () => _convertPdfToImages(att) }, 'fn').name('🖼 Convert to images…');
        }
        folder.add({ fn: () => _downloadAttachment(att) }, 'fn').name('⬇  Download');
        folder.add({ fn: () => _deleteAttachment(att.id) }, 'fn').name('✕  Delete');
        folder.close();
    });
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function _saveScreenCaptureToFiles() {
    if (!_saveScreenCaptureFn) return;
    try {
        await _saveScreenCaptureFn();
    } catch (err) {
        if (err.message === 'Screen capture was cancelled.') return;
        console.error('Screen capture failed:', err);
        alert('Failed to save screen capture: ' + (err.message || err));
    }
}

function _addAttachments() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
            // Skip if a file with the same name already exists
            if (attachmentsStore.find(a => a.name === file.name)) {
                if (!window.confirm(`Attachment "${file.name}" already exists. Replace it?`)) continue;
                attachmentsStore = attachmentsStore.filter(a => a.name !== file.name);
            }
            const data = await _fileToBase64(file);
            attachmentsStore.push({
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                name: file.name,
                mimeType: file.type || 'application/octet-stream',
                data,
                size: file.size,
                addedAt: new Date().toISOString(),
            });
        }
        refreshAttachmentsGui();
    };
    input.click();
}

async function _downloadAllAsZip() {
    const zip = new JSZip();
    attachmentsStore.forEach(att => {
        const binary = atob(att.data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        zip.file(att.name, bytes);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attachments.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function _canOpenInBrowser(mimeType) {
    if (!mimeType) return false;
    return (
        mimeType.startsWith('image/') ||
        mimeType.startsWith('text/') ||
        mimeType.startsWith('video/') ||
        mimeType.startsWith('audio/') ||
        mimeType === 'application/pdf'
    );
}

let _modalEl = null;
let _activeBlobUrl = null;
let _carouselList = []; // filtered list of openable attachments
let _carouselIndex = 0;
let _commentPanelOpen = false;
let _commentEditorContent = null; // the contenteditable div inside the comment editor

function _buildModal() {
    if (_modalEl) return;
    _modalEl = document.createElement('div');
    _modalEl.id = 'att-modal';
    _modalEl.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,0.82);display:none;flex-direction:column;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';
    _modalEl.innerHTML = `
        <div style="position:relative;width:100%;max-width:1100px;height:90vh;background:#1a1a1a;border-radius:8px;overflow:hidden;display:flex;flex-direction:column;">
            <div style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:#2a2a2a;flex-shrink:0;">
                <button id="att-modal-prev" style="background:none;border:none;color:#eee;font-size:18px;cursor:pointer;line-height:1;padding:0 4px;">‹</button>
                <span id="att-modal-counter" style="color:#aaa;font-size:12px;font-family:sans-serif;white-space:nowrap;"></span>
                <button id="att-modal-next" style="background:none;border:none;color:#eee;font-size:18px;cursor:pointer;line-height:1;padding:0 4px;">›</button>
                <span id="att-modal-title" style="display:flex;align-items:center;flex:1;min-width:0;margin-left:4px;overflow:hidden;">
                    <input id="att-modal-name-input" title="Click to rename (extension is read-only)" style="background:transparent;border:none;border-bottom:1px solid transparent;color:#eee;font-size:13px;font-family:sans-serif;outline:none;flex:1;min-width:0;padding:0;cursor:text;" />
                    <span id="att-modal-name-ext" style="color:#888;font-size:13px;font-family:sans-serif;white-space:nowrap;flex-shrink:0;"></span>
                </span>
                <button id="att-modal-edit-btn" title="Edit image" style="display:none;background:none;border:1px solid #555;color:#aaa;font-size:12px;cursor:pointer;line-height:1;padding:2px 8px;border-radius:3px;flex-shrink:0;">✏ Edit</button>
                <button id="att-modal-convert-btn" title="Convert PDF pages to PNG/JPG images" style="display:none;background:none;border:1px solid #555;color:#aaa;font-size:12px;cursor:pointer;line-height:1;padding:2px 8px;border-radius:3px;flex-shrink:0;">🖼 → Images</button>
                <button id="att-modal-comment-btn" title="Comment" style="background:none;border:1px solid #555;color:#aaa;font-size:12px;cursor:pointer;line-height:1;padding:2px 8px;border-radius:3px;flex-shrink:0;">💬</button>
                <button id="att-modal-close" style="background:none;border:none;color:#eee;font-size:20px;cursor:pointer;line-height:1;padding:0 4px;margin-left:4px;flex-shrink:0;">✕</button>
            </div>
            <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;">
                <div id="att-modal-preview" style="flex:1;overflow:hidden;min-height:0;"></div>
                <div id="att-modal-comment-panel" style="display:none;flex-shrink:0;border-top:1px solid #333;background:#1e1e1e;padding:8px;max-height:200px;box-sizing:border-box;"></div>
            </div>
        </div>`;
    document.body.appendChild(_modalEl);
    _modalEl.querySelector('#att-modal-close').addEventListener('click', _closeModal);
    _modalEl.querySelector('#att-modal-prev').addEventListener('click', () => _carouselStep(-1));
    _modalEl.querySelector('#att-modal-next').addEventListener('click', () => _carouselStep(+1));
    _modalEl.querySelector('#att-modal-comment-btn').addEventListener('click', () => _toggleCommentPanel(_carouselList[_carouselIndex]));
    _modalEl.querySelector('#att-modal-edit-btn').addEventListener('click', () => {
        const att = _carouselList[_carouselIndex];
        if (att) _editAttachment(att);
    });
    _modalEl.querySelector('#att-modal-convert-btn').addEventListener('click', () => {
        const att = _carouselList[_carouselIndex];
        if (att) _convertPdfToImages(att);
    });

    const nameInput = _modalEl.querySelector('#att-modal-name-input');
    nameInput.addEventListener('focus', () => { nameInput.style.borderBottomColor = '#888'; });
    nameInput.addEventListener('blur', () => { nameInput.style.borderBottomColor = 'transparent'; _saveCurrentName(); });
    nameInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); nameInput.blur(); }
        if (e.key === 'Escape') {
            const att = _carouselList[_carouselIndex];
            if (att) {
                const lastDot = att.name.lastIndexOf('.');
                nameInput.value = lastDot >= 0 ? att.name.slice(0, lastDot) : att.name;
            }
            nameInput.blur();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
        if (!_modalEl || _modalEl.style.display === 'none') return;
        if (e.key === 'ArrowLeft')  _carouselStep(-1);
        if (e.key === 'ArrowRight') _carouselStep(+1);
        if (e.key === 'Escape')     _closeModal();
    });
}

function _carouselStep(dir) {
    const next = _carouselIndex + dir;
    if (next < 0 || next >= _carouselList.length) return;
    _saveCurrentComment(); // save before index changes
    _saveCurrentName();
    _carouselIndex = next;
    _renderModal(_carouselList[_carouselIndex]);
}

function _closeModal() {
    _saveCurrentComment();
    _saveCurrentName();
    if (_modalEl) _modalEl.style.display = 'none';
    refreshAttachmentsGui();
}

function _saveCurrentComment() {
    if (!_commentEditorContent) return;
    const att = _carouselList[_carouselIndex];
    if (!att) return;
    const html = _commentEditorContent.innerHTML;
    att.comment = (html && html !== '<br>') ? html : '';
}

function _saveCurrentName() {
    if (!_modalEl) return;
    const att = _carouselList[_carouselIndex];
    if (!att) return;
    const input = _modalEl.querySelector('#att-modal-name-input');
    const extSpan = _modalEl.querySelector('#att-modal-name-ext');
    if (!input || !extSpan) return;
    const newBase = input.value.trim();
    if (!newBase) {
        // restore if left empty
        const lastDot = att.name.lastIndexOf('.');
        input.value = lastDot >= 0 ? att.name.slice(0, lastDot) : att.name;
        return;
    }
    att.name = newBase + extSpan.textContent;
}

function _buildCommentEditor(att) {
    const panel = _modalEl.querySelector('#att-modal-comment-panel');
    panel.innerHTML = '';
    _commentEditorContent = null;
    const { wrap, content } = buildWysiwygEditor(att.comment || '');
    wrap.style.cssText += ';height:100%;box-sizing:border-box;';
    panel.appendChild(wrap);
    _commentEditorContent = content;
    // Auto-save on input
    content.addEventListener('input', () => {
        const html = content.innerHTML;
        att.comment = (html && html !== '<br>') ? html : '';
    });
}

function _toggleCommentPanel(att) {
    _commentPanelOpen = !_commentPanelOpen;
    const panel = _modalEl.querySelector('#att-modal-comment-panel');
    if (_commentPanelOpen) {
        panel.style.display = 'block';
        _buildCommentEditor(att);
    } else {
        _saveCurrentComment();
        panel.style.display = 'none';
        _commentEditorContent = null;
    }
    _updateCommentBtn();
}

function _updateCommentBtn() {
    const btn = _modalEl && _modalEl.querySelector('#att-modal-comment-btn');
    if (!btn) return;
    btn.style.background = _commentPanelOpen ? '#3a5a3a' : 'none';
    btn.style.borderColor = _commentPanelOpen ? '#6a6' : '#555';
    btn.style.color = _commentPanelOpen ? '#fff' : '#aaa';
}

function _mountImagePreview(container, blobUrl) {
    const vp = document.createElement('div');
    vp.style.cssText = 'width:100%;height:100%;overflow:hidden;position:relative;cursor:grab;touch-action:none;';

    const img = document.createElement('img');
    img.src = blobUrl;
    img.draggable = false;
    img.style.cssText = 'position:absolute;left:0;top:0;transform-origin:0 0;user-select:none;-webkit-user-drag:none;';

    const state = {
        zoom: 1,
        panX: 0,
        panY: 0,
        isPanning: false,
        panStart: { x: 0, y: 0 },
        pinchDist0: null,
        touchMoved: false,
        lastTap: 0,
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
            if (now - state.lastTap < 300) {
                fitToView();
                state.lastTap = 0;
            } else {
                state.lastTap = now;
            }
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
}

function _openAttachment(att) {
    _carouselList = attachmentsStore.filter(a => _canOpenInBrowser(a.mimeType));
    _carouselIndex = _carouselList.findIndex(a => a.id === att.id);
    if (_carouselIndex < 0) _carouselIndex = 0;
    _buildModal();
    _renderModal(att);
    _modalEl.style.display = 'flex';
}

function _renderModal(att) {
    if (_activeBlobUrl) setTimeout(() => URL.revokeObjectURL(_activeBlobUrl), 10000);

    const binary = atob(att.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: att.mimeType });
    _activeBlobUrl = URL.createObjectURL(blob);

    // Update title and counter
    const lastDot = att.name.lastIndexOf('.');
    const _nameBase = lastDot >= 0 ? att.name.slice(0, lastDot) : att.name;
    const _nameExt  = lastDot >= 0 ? att.name.slice(lastDot) : '';
    _modalEl.querySelector('#att-modal-name-input').value = _nameBase;
    _modalEl.querySelector('#att-modal-name-ext').textContent = _nameExt;
    const total = _carouselList.length;
    _modalEl.querySelector('#att-modal-counter').textContent = total > 1 ? `${_carouselIndex + 1} / ${total}` : '';

    // Update arrow state
    const prevBtn = _modalEl.querySelector('#att-modal-prev');
    const nextBtn = _modalEl.querySelector('#att-modal-next');
    const disabledStyle = 'opacity:0.25;cursor:default;';
    const enabledStyle  = 'opacity:1;cursor:pointer;';
    prevBtn.style.cssText = prevBtn.style.cssText.replace(/opacity:[^;]+;cursor:[^;]+;/g, '');
    nextBtn.style.cssText = nextBtn.style.cssText.replace(/opacity:[^;]+;cursor:[^;]+;/g, '');
    prevBtn.disabled = (_carouselIndex === 0 || total <= 1);
    nextBtn.disabled = (_carouselIndex === total - 1 || total <= 1);
    prevBtn.style.opacity = prevBtn.disabled ? '0.25' : '1';
    prevBtn.style.cursor  = prevBtn.disabled ? 'default' : 'pointer';
    nextBtn.style.opacity = nextBtn.disabled ? '0.25' : '1';
    nextBtn.style.cursor  = nextBtn.disabled ? 'default' : 'pointer';

    // Render file preview
    const content = _modalEl.querySelector('#att-modal-preview');
    content.innerHTML = '';
    const mime = att.mimeType || '';

    // Light background for text so it stays readable; dark for everything else
    content.style.background = mime.startsWith('text/') ? '#f5f5f5' : '#1a1a1a';

    if (mime.startsWith('image/')) {
        _mountImagePreview(content, _activeBlobUrl);
    } else if (mime.startsWith('video/')) {
        const v = document.createElement('video');
        v.src = _activeBlobUrl;
        v.controls = true;
        v.style.cssText = 'width:100%;height:100%;display:block;background:#000;';
        content.appendChild(v);
    } else if (mime.startsWith('audio/')) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';
        const a = document.createElement('audio');
        a.src = _activeBlobUrl;
        a.controls = true;
        a.style.width = '100%';
        wrap.appendChild(a);
        content.appendChild(wrap);
    } else {
        const iframe = document.createElement('iframe');
        iframe.src = _activeBlobUrl;
        iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
        content.appendChild(iframe);
    }

    // Show/hide edit / convert buttons depending on attachment type
    const editBtn = _modalEl.querySelector('#att-modal-edit-btn');
    if (editBtn) editBtn.style.display = (mime.startsWith('image/')) ? '' : 'none';
    const convertBtn = _modalEl.querySelector('#att-modal-convert-btn');
    if (convertBtn) convertBtn.style.display = (mime === 'application/pdf') ? '' : 'none';
    _updateConvertBtnState(_pdfConverting);

    // Rebuild comment editor if panel is open
    if (_commentPanelOpen) _buildCommentEditor(att);
    _updateCommentBtn();
}

function _newImage() {
    const input = window.prompt('New image size (width × height):', '800x600');
    if (!input) return;
    const match = input.match(/^(\d+)\s*[xX×,]\s*(\d+)$/);
    if (!match) { alert('Invalid size. Use format: 800x600'); return; }
    const w = Math.max(1, Math.min(8192, parseInt(match[1], 10)));
    const h = Math.max(1, Math.min(8192, parseInt(match[2], 10)));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
    const size = Math.round(base64.length * 0.75);

    const att = {
        id: null,
        name: 'new-image.png',
        mimeType: 'image/png',
        data: base64,
        size,
        addedAt: new Date().toISOString(),
    };

    openImageEditor(
        att,
        // onSaveOverwrite — image not yet in store, so add it (or update if already saved via save-as-new)
        (newBase64, newSize, newMime, currentAtt) => {
            const target = currentAtt || att;
            const storeEntry = attachmentsStore.find(a => a.id === target.id);
            if (storeEntry) {
                storeEntry.data     = newBase64;
                storeEntry.size     = newSize;
                storeEntry.mimeType = newMime;
            } else {
                attachmentsStore.push({
                    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                    name: target.name,
                    mimeType: newMime,
                    data: newBase64,
                    size: newSize,
                    addedAt: target.addedAt || new Date().toISOString(),
                });
            }
            refreshAttachmentsGui();
        },
        // onSaveNew
        (newBase64, newSize, newName, newMime) => {
            const newAtt = {
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                name: newName,
                mimeType: newMime,
                data: newBase64,
                size: newSize,
                addedAt: new Date().toISOString(),
            };
            attachmentsStore.push(newAtt);
            refreshAttachmentsGui();
            return newAtt;
        }
    );
}

function _editAttachment(att) {
    // Close modal viewer first, then open editor
    if (_modalEl) _modalEl.style.display = 'none';

    openImageEditor(
        att,
        // onSaveOverwrite
        (newBase64, newSize, newMime, currentAtt) => {
            const target = attachmentsStore.find(a => a.id === (currentAtt || att).id) || att;
            target.data     = newBase64;
            target.size     = newSize;
            target.mimeType = newMime;
            refreshAttachmentsGui();
        },
        // onSaveNew
        (newBase64, newSize, newName, newMime) => {
            const newAtt = {
                id:      Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                name:    newName,
                mimeType: newMime,
                data:    newBase64,
                size:    newSize,
                addedAt: new Date().toISOString(),
            };
            attachmentsStore.push(newAtt);
            refreshAttachmentsGui();
            return newAtt;
        }
    );
}

function _pdfBaseName(name) {
    const lastDot = name.lastIndexOf('.');
    return lastDot >= 0 ? name.slice(0, lastDot) : name;
}

function _uniqueAttachmentName(proposedName) {
    if (!attachmentsStore.some(a => a.name === proposedName)) return proposedName;
    const lastDot = proposedName.lastIndexOf('.');
    const base = lastDot >= 0 ? proposedName.slice(0, lastDot) : proposedName;
    const ext = lastDot >= 0 ? proposedName.slice(lastDot) : '';
    let n = 2;
    while (attachmentsStore.some(a => a.name === `${base}-${n}${ext}`)) n++;
    return `${base}-${n}${ext}`;
}

const PDF_RENDER_SCALE_MIN = 1;
const PDF_RENDER_SCALE_MAX = 10;
const PDF_RENDER_SCALE_DEFAULT = 3;
const JPEG_QUALITY_DEFAULT = 0.95;

function _parsePdfRenderScale(input) {
    if (input == null || String(input).trim() === '') {
        return PDF_RENDER_SCALE_DEFAULT;
    }
    const s = String(input).trim().toLowerCase();
    let scale;
    const dpiMatch = s.match(/^(\d+(?:\.\d+)?)\s*dpi$/);
    if (dpiMatch) {
        scale = parseFloat(dpiMatch[1]) / 72;
    } else if (/^\d+(?:\.\d+)?$/.test(s)) {
        scale = parseFloat(s);
    } else {
        return null;
    }
    if (!Number.isFinite(scale) || scale <= 0) return null;
    return Math.min(PDF_RENDER_SCALE_MAX, Math.max(PDF_RENDER_SCALE_MIN, scale));
}

function _parseJpegQuality(input) {
    if (input == null || String(input).trim() === '') {
        return JPEG_QUALITY_DEFAULT;
    }
    const s = String(input).trim().replace(/%$/, '');
    const n = parseInt(s, 10);
    if (!Number.isFinite(n)) return null;
    const clamped = Math.min(100, Math.max(50, n));
    return clamped / 100;
}

function _askPdfConvertOptions() {
    const formatChoice = window.prompt('Image format: png or jpg', 'png');
    if (formatChoice == null) return null;
    const format = formatChoice.trim().toLowerCase();
    if (format !== 'png' && format !== 'jpg' && format !== 'jpeg') {
        alert('Use png or jpg.');
        return null;
    }

    const scaleRefLines = Array.from(
        { length: PDF_RENDER_SCALE_MAX - PDF_RENDER_SCALE_MIN + 1 },
        (_, i) => {
            const s = PDF_RENDER_SCALE_MIN + i;
            return `  scale ${s} ≈ ${s * 72} DPI`;
        }
    ).join('\n');

    const scaleInput = window.prompt(
        'Enter ONE value — scale (1–6) OR dpi:\n\n' +
        '  Examples: 3   or   300dpi\n' +
        '  Leave empty for default (3 ≈ 216 DPI)\n\n' +
        scaleRefLines,
        '3'
    );
    if (scaleInput == null) return null;

    let scale = _parsePdfRenderScale(scaleInput);
    if (scale == null) {
        alert('Invalid quality. Using default scale 3.');
        scale = PDF_RENDER_SCALE_DEFAULT;
    }

    const isJpeg = format === 'jpg' || format === 'jpeg';
    let jpegQuality = JPEG_QUALITY_DEFAULT;
    if (isJpeg) {
        const qInput = window.prompt('Enter ONE number 1–100 (leave empty for default 95):', '95');
        if (qInput == null) return null;
        const q = _parseJpegQuality(qInput);
        if (q == null) {
            alert('Invalid quality. Using default 95.');
            jpegQuality = JPEG_QUALITY_DEFAULT;
        } else {
            jpegQuality = q;
        }
    }

    return { format, scale, jpegQuality };
}

function _updateConvertBtnState(busy) {
    if (!_modalEl) return;
    const btn = _modalEl.querySelector('#att-modal-convert-btn');
    if (!btn || btn.style.display === 'none') return;
    btn.disabled = busy;
    btn.textContent = busy ? 'Converting…' : '🖼 → Images';
    btn.style.opacity = busy ? '0.5' : '1';
    btn.style.cursor = busy ? 'default' : 'pointer';
}

async function _convertPdfToImages(att, options) {
    if (_pdfConverting) return;
    if (!options) {
        options = _askPdfConvertOptions();
        if (!options) return;
    }
    const { format, scale, jpegQuality } = options;
    const mimeType = (format === 'jpg' || format === 'jpeg') ? 'image/jpeg' : 'image/png';
    const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';

    _pdfConverting = true;
    _updateConvertBtnState(true);

    try {
        const binary = atob(att.data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
        const numPages = pdf.numPages;
        const baseName = _pdfBaseName(att.name);
        let added = 0;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport, canvas }).promise;

            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob(
                    b => (b ? resolve(b) : reject(new Error('toBlob failed'))),
                    mimeType,
                    mimeType === 'image/jpeg' ? jpegQuality : undefined
                );
            });

            const proposedName = numPages === 1
                ? `${baseName}.${ext}`
                : `${baseName}-page-${pageNum}.${ext}`;
            const imageName = _uniqueAttachmentName(proposedName);

            const data = await _blobToBase64(blob);
            attachmentsStore.push({
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                name: imageName,
                mimeType,
                data,
                size: blob.size,
                addedAt: new Date().toISOString(),
            });
            added++;
        }

        if (added > 0) {
            alert(`Added ${added} image(s).`);
            refreshAttachmentsGui();
        }
    } catch (err) {
        console.error(err);
        alert('Cannot convert this PDF.');
    } finally {
        _pdfConverting = false;
        _updateConvertBtnState(false);
    }
}

function _downloadAttachment(att) {
    const binary = atob(att.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: att.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = att.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function _deleteAttachment(id) {
    const att = attachmentsStore.find(a => a.id === id);
    if (!att) return;
    if (!window.confirm(`Remove attachment "${att.name}"?`)) return;
    attachmentsStore = attachmentsStore.filter(a => a.id !== id);
    refreshAttachmentsGui();
}

function _fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // result is "data:<mime>;base64,<data>" — we only want the data part
            const result = reader.result;
            const comma = result.indexOf(',');
            resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function _pasteImageFromClipboard() {
    let items;
    try {
        items = await navigator.clipboard.read();
    } catch (err) {
        alert('Cannot access clipboard. Make sure the browser has clipboard-read permission.');
        return;
    }

    let found = false;
    for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (!imageType) continue;
        found = true;
        const blob = await item.getType(imageType);
        const ext = imageType.split('/')[1] || 'png';
        const ts = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
        const name = `clipboard-${ts}.${ext}`;

        if (attachmentsStore.find(a => a.name === name)) {
            if (!window.confirm(`Attachment "${name}" already exists. Replace it?`)) continue;
            attachmentsStore = attachmentsStore.filter(a => a.name !== name);
        }

        const data = await _blobToBase64(blob);
        attachmentsStore.push({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            name,
            mimeType: imageType,
            data,
            size: blob.size,
            addedAt: new Date().toISOString(),
        });
    }

    if (!found) {
        alert('No image found in clipboard.');
        return;
    }
    refreshAttachmentsGui();
}

function _blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const comma = result.indexOf(',');
            resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function _formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
