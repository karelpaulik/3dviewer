// attachmentsUtils.js
// Manages binary file attachments embedded in a GLB file.
// Each attachment is stored as base64-encoded data in userData.attachments.
// Attachments can be downloaded to disk on demand.

import JSZip from 'jszip';

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

    // "Download all as ZIP" button — only shown when there is at least one attachment
    if (attachmentsStore.length > 0) {
        _guiRef.add({ fn: _downloadAllAsZip }, 'fn').name('⬇  Download all as ZIP');
    }

    // One folder per attachment with download + delete buttons inside
    attachmentsStore.forEach(att => {
        const sizeStr = _formatSize(att.size);
        const folder = _guiRef.addFolder(`${att.name}  (${sizeStr})`);
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

function _openAttachment(att) {
    const binary = atob(att.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: att.mimeType });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Revoke after a short delay to give the browser time to load the resource
    setTimeout(() => URL.revokeObjectURL(url), 10000);
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

function _formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
