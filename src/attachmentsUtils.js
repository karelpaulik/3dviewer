// attachmentsUtils.js
// Manages binary file attachments embedded in a GLB file.
// Each attachment is stored as base64-encoded data in userData.attachments.
// Attachments can be downloaded to disk on demand.

import JSZip from 'jszip';
import { buildWysiwygEditor } from './annotationUtils.js';

let attachmentsStore = []; // [{ id, name, mimeType, data (base64 string), size, addedAt }]
let _guiRef = null;

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
export function initAttachmentsGui(gui) {
    _guiRef = gui;
    refreshAttachmentsGui();
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

    // "Download all as ZIP" button — only shown when there is at least one attachment
    if (attachmentsStore.length > 0) {
        _guiRef.add({ fn: _downloadAllAsZip }, 'fn').name('⬇  Download all as ZIP');
    }

    // One folder per attachment with download + delete buttons inside
    attachmentsStore.forEach(att => {
        const sizeStr = _formatSize(att.size);
        const prefix = att.comment ? '💬 ' : '';
        const folder = _guiRef.addFolder(`${prefix}${att.name}  (${sizeStr})`);
        if (_canOpenInBrowser(att.mimeType)) {
            folder.add({ fn: () => _openAttachment(att) }, 'fn').name('↗  Open');
        }
        folder.add({ fn: () => _downloadAttachment(att) }, 'fn').name('⬇  Download');
        folder.add({ fn: () => _deleteAttachment(att.id) }, 'fn').name('✕  Delete');
        folder.close();
    });
}

// ── Internal helpers ──────────────────────────────────────────────────────────

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
                <span id="att-modal-title" style="color:#eee;font-size:13px;font-family:sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;margin-left:4px;"></span>
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
    _carouselIndex = next;
    _renderModal(_carouselList[_carouselIndex]);
}

function _closeModal() {
    _saveCurrentComment();
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
    _modalEl.querySelector('#att-modal-title').textContent = att.name;
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
        const wrap = document.createElement('div');
        wrap.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;';
        const img = document.createElement('img');
        img.src = _activeBlobUrl;
        img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;';
        wrap.appendChild(img);
        content.appendChild(wrap);
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

    // Rebuild comment editor if panel is open
    if (_commentPanelOpen) _buildCommentEditor(att);
    _updateCommentBtn();
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
