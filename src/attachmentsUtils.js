// attachmentsUtils.js
// Manages binary file attachments embedded in a GLB file.
// Each attachment is stored as base64-encoded data in userData.attachments.
// Attachments can be downloaded to disk on demand.

import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
    openFilePreview,
    closeFilePreviewForAttachment,
    isFilePreviewOpenForAttachment,
    autoArrangeFilePreviews,
    updateFilePreviewConvertState,
} from './filePreviewUtils.js';
import { openImageEditor, autoArrangeImageEditors } from './imageEditorUtils.js';
import { runOcr, runOcrWithProgress, showOcrResultDialog } from './ocrUtils.js';
import { openPdfPageManager } from './pdfPageManagerUtils.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

let attachmentsStore = []; // [{ id, name, mimeType, data (base64 string), size, addedAt }]
let _guiRef = null;
let _pdfConverting = false;
let _imageConverting = false;
let _pdfEditing = false;
let _pdfPageManaging = false;
/** @type {{ sourceAtt: object, originalBytes: Uint8Array, numPages: number, scale: number, pageSizes: Map<number, { widthPt: number, heightPt: number }>, editedPages: Map<number, { base64: string, mimeType: string, size: number }> } | null} */
let _pdfEditSession = null;
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

/** Add a PDF attachment from raw bytes (e.g. document export). */
export function addPdfAttachmentFromBytes(pdfBytes, suggestedName) {
    const pdfName = _uniqueAttachmentName(
        suggestedName.endsWith('.pdf') ? suggestedName : `${suggestedName}.pdf`
    );
    attachmentsStore.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: pdfName,
        mimeType: 'application/pdf',
        data: _uint8ArrayToBase64(pdfBytes),
        size: pdfBytes.length,
        addedAt: new Date().toISOString(),
    });
    refreshAttachmentsGui();
    return pdfName;
}

/** Rebuild the attachment list in the lil-gui panel. */
export function refreshAttachmentsGui() {
    if (!_guiRef) return;

    const openFolderIds = new Set(
        [..._guiRef.folders]
            .filter(f => f._attachmentId && f._closed === false)
            .map(f => f._attachmentId)
            .filter(id => attachmentsStore.some(a => a.id === id))
    );

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

    // "Open all viewable" button
    const viewableAtts = attachmentsStore.filter(a => _canOpenInBrowser(a.mimeType));
    if (viewableAtts.length > 0) {
        _guiRef.add({ fn: () => {
            viewableAtts.forEach(a => _openAttachment(a));
            if (viewableAtts.length > 1) {
                setTimeout(() => {
                    if (window.confirm('Arrange windows as tile?')) {
                        autoArrangeFilePreviews();
                    }
                }, 150);
            }
        } }, 'fn').name('↗  Open all viewable…');
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
    const canReorder = attachmentsStore.length > 1;
    attachmentsStore.forEach((att, index) => {
        const sizeStr = _formatSize(att.size);
        const prefix = att.comment ? '💬 ' : '';
        const folder = _guiRef.addFolder(`${prefix}${att.name}  (${sizeStr})`);
        if (canReorder && index > 0) {
            folder.add({ fn: () => _moveAttachment(att.id, -1) }, 'fn').name('↑  Move up');
        }
        if (canReorder && index < attachmentsStore.length - 1) {
            folder.add({ fn: () => _moveAttachment(att.id, 1) }, 'fn').name('↓  Move down');
        }
        if (_canOpenInBrowser(att.mimeType)) {
            folder.add({ fn: () => _openAttachment(att) }, 'fn').name('↗  Open');
        }
        if (att.mimeType && att.mimeType.startsWith('image/')) {
            folder.add({ fn: () => _editAttachment(att) }, 'fn').name('✏  Edit');
            folder.add({ fn: () => _convertImageToPdf(att) }, 'fn').name('📕 Convert to PDF…');
        }
        if (att.mimeType === 'application/pdf') {
            folder.add({ fn: () => _editPdf(att) }, 'fn').name('✏  Edit PDF…');
            folder.add({ fn: () => _managePdfPages(att) }, 'fn').name('📄  Manage PDF pages…');
            folder.add({ fn: () => _convertPdfToImages(att) }, 'fn').name('🖼 Convert to images…');
        }
        folder.add({ fn: () => _downloadAttachment(att) }, 'fn').name('⬇  Download');
        folder.add({ fn: () => _deleteAttachment(att.id) }, 'fn').name('✕  Delete');
        folder._attachmentId = att.id;
        if (openFolderIds.has(att.id)) folder.open();
        else folder.close();
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

const _previewHandlers = {
    onOcr: (att, ocrBtn) => _runOcrOnPreviewAttachment(att, ocrBtn),
    onEdit: att => _editAttachment(att),
    onEditPdf: att => _editPdf(att),
    onManagePages: att => _managePdfPages(att),
    onConvertPdf: att => _convertPdfToImages(att),
    onConvertImage: att => _convertImageToPdf(att),
    onNameChanged: () => refreshAttachmentsGui(),
    onClose: () => refreshAttachmentsGui(),
    onAfterRender: () => _updateConvertBtnState(_pdfConverting || _imageConverting),
};

function _openAttachment(att) {
    openFilePreview(att, _previewHandlers);
}

function _attachmentToOcrCanvas(att) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            resolve(canvas);
        };
        img.onerror = () => reject(new Error('Nepodařilo se načíst obrázek'));
        img.src = `data:${att.mimeType};base64,${att.data}`;
    });
}

async function _runOcrOnPreviewAttachment(att, ocrBtn) {
    if (!att?.mimeType?.startsWith('image/')) return;

    if (ocrBtn) ocrBtn.disabled = true;

    try {
        const canvas = await _attachmentToOcrCanvas(att);
        const text = await runOcrWithProgress(onProgress =>
            runOcr(canvas, { onProgress })
        );

        if (text === null) return;

        if (!text) {
            alert('Na obrázku nebyl rozpoznán žádný text.');
            return;
        }

        const { insertTextIntoActiveDocument, isDocumentEditorOpen } = await import('./documentsUtils.js');

        showOcrResultDialog(text, {
            canInsertToDoc: isDocumentEditorOpen(),
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
    closeFilePreviewForAttachment(att);

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

function _attToUint8Array(att) {
    const binary = atob(att.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function _uint8ArrayToBase64(bytes) {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
}

function _parsePageSelection(input, numPages) {
    const s = String(input).trim().toLowerCase();
    if (!s || s === 'all') {
        return Array.from({ length: numPages }, (_, i) => i + 1);
    }
    const pages = new Set();
    for (const part of s.split(',')) {
        const p = part.trim();
        if (!p) continue;
        const rangeMatch = p.match(/^(\d+)\s*-\s*(\d+)$/);
        if (rangeMatch) {
            let a = parseInt(rangeMatch[1], 10);
            let b = parseInt(rangeMatch[2], 10);
            if (a > b) [a, b] = [b, a];
            for (let n = a; n <= b; n++) pages.add(n);
        } else if (/^\d+$/.test(p)) {
            pages.add(parseInt(p, 10));
        } else {
            return null;
        }
    }
    const result = [...pages].filter(n => n >= 1 && n <= numPages).sort((a, b) => a - b);
    return result.length > 0 ? result : null;
}

async function _renderPdfPageCanvas(pdf, pageNum, scale) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const viewport1 = page.getViewport({ scale: 1 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    return {
        canvas,
        widthPt: viewport1.width,
        heightPt: viewport1.height,
    };
}

async function _canvasToBlob(canvas, mimeType, jpegQuality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            b => (b ? resolve(b) : reject(new Error('toBlob failed'))),
            mimeType,
            mimeType === 'image/jpeg' ? jpegQuality : undefined
        );
    });
}

function _makePdfPageEditCallbacks(session, pageNum) {
    return {
        onSaveOverwrite(newBase64, newSize, newMime) {
            session.editedPages.set(pageNum, {
                base64: newBase64,
                mimeType: newMime,
                size: newSize,
            });
            _offerPdfExport(session);
        },
        onSaveNew(newBase64, newSize, newName, newMime) {
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
            session.editedPages.set(pageNum, {
                base64: newBase64,
                mimeType: newMime,
                size: newSize,
            });
            _offerPdfExport(session);
            return newAtt;
        },
    };
}

function _offerPdfExport(session) {
    const n = session.editedPages.size;
    if (n === 0) return;
    const proceed = window.confirm(
        `${n} page(s) saved.\n\n` +
        'Export changes back to PDF?\n\n' +
        'Edited pages will be stored as images. Other pages stay unchanged.\n' +
        'Text on edited pages will no longer be selectable.'
    );
    if (!proceed) return;
    const overwrite = window.confirm(
        'Overwrite the original PDF attachment?\n\n' +
        'OK = overwrite original\n' +
        'Cancel = save as a new PDF file'
    );
    _exportPdfWithEdits(session, overwrite ? 'overwrite' : 'new');
}

function _isAttachmentBusy() {
    return _pdfEditing || _pdfConverting || _imageConverting || _pdfPageManaging;
}

function _commitPdfAttachment(att, pdfBytes, mode) {
    const base64 = _uint8ArrayToBase64(pdfBytes);

    if (mode === 'overwrite') {
        att.data = base64;
        att.size = pdfBytes.length;
        att.mimeType = 'application/pdf';
        alert('PDF updated.');
    } else {
        const baseName = _pdfBaseName(att.name);
        const newName = _uniqueAttachmentName(`${baseName}-pages-edited.pdf`);
        attachmentsStore.push({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            name: newName,
            mimeType: 'application/pdf',
            data: base64,
            size: pdfBytes.length,
            addedAt: new Date().toISOString(),
        });
        alert(`Saved as "${newName}".`);
    }

    refreshAttachmentsGui();
}

async function _exportPdfWithEdits(session, mode) {
    try {
        const srcDoc = await PDFDocument.load(session.originalBytes);
        const outDoc = await PDFDocument.create();

        for (let i = 0; i < session.numPages; i++) {
            const pageNum = i + 1;
            const edited = session.editedPages.get(pageNum);
            if (edited) {
                const size = session.pageSizes.get(pageNum);
                if (!size) throw new Error(`Missing page size for page ${pageNum}`);
                const imgBytes = _attToUint8Array({ data: edited.base64 });
                const image = edited.mimeType === 'image/jpeg'
                    ? await outDoc.embedJpg(imgBytes)
                    : await outDoc.embedPng(imgBytes);
                const page = outDoc.addPage([size.widthPt, size.heightPt]);
                page.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: size.widthPt,
                    height: size.heightPt,
                });
            } else {
                const [copiedPage] = await outDoc.copyPages(srcDoc, [i]);
                outDoc.addPage(copiedPage);
            }
        }

        const pdfBytes = await outDoc.save();

        if (mode === 'overwrite') {
            _commitPdfAttachment(session.sourceAtt, pdfBytes, 'overwrite');
        } else {
            const baseName = _pdfBaseName(session.sourceAtt.name);
            const newName = _uniqueAttachmentName(`${baseName}-edited.pdf`);
            attachmentsStore.push({
                id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                name: newName,
                mimeType: 'application/pdf',
                data: _uint8ArrayToBase64(pdfBytes),
                size: pdfBytes.length,
                addedAt: new Date().toISOString(),
            });
            alert(`Saved as "${newName}".`);
            refreshAttachmentsGui();
        }

        // Keep session alive for other open page editors; base PDF reflects latest export
        session.originalBytes = pdfBytes;
        session.editedPages.clear();
    } catch (err) {
        console.error(err);
        alert('Failed to export PDF: ' + (err.message || err));
    }
}

async function _managePdfPages(att) {
    if (_isAttachmentBusy()) {
        alert('Another PDF operation is in progress. Please wait.');
        return;
    }
    const hadPreview = isFilePreviewOpenForAttachment(att);
    closeFilePreviewForAttachment(att);

    await openPdfPageManager(att, {
        attToUint8Array: _attToUint8Array,
        uint8ArrayToBase64: _uint8ArrayToBase64,
        parsePageSelection: _parsePageSelection,
        pdfBaseName: _pdfBaseName,
        uniqueAttachmentName: _uniqueAttachmentName,
        getImageAttachments: () => attachmentsStore.filter(a => a.mimeType && a.mimeType.startsWith('image/')),
        getPdfAttachments: () => attachmentsStore.filter(
            a => a.mimeType === 'application/pdf' && a.id !== att.id
        ),
        commitPdfAttachment: _commitPdfAttachment,
        onOpen: () => { _pdfPageManaging = true; },
        onClose: () => {
            _pdfPageManaging = false;
            if (hadPreview) _openAttachment(att);
        },
    });
}

async function _editPdf(att) {
    if (_isAttachmentBusy()) return;

    const hadPreview = isFilePreviewOpenForAttachment(att);
    closeFilePreviewForAttachment(att);

    let editorsOpened = false;
    _pdfEditing = true;
    try {
        const bytes = _attToUint8Array(att);
        const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
        const numPages = pdf.numPages;

        const pageInput = window.prompt(
            `Pages to edit (${numPages} total).\n` +
            'Examples: all   or   1   or   1, 3-5',
            'all'
        );
        if (pageInput == null) return;

        const selectedPages = _parsePageSelection(pageInput, numPages);
        if (!selectedPages) {
            alert('Invalid page selection.');
            return;
        }

        const options = _askPdfConvertOptions();
        if (!options) return;

        const { format, scale, jpegQuality } = options;
        const mimeType = (format === 'jpg' || format === 'jpeg') ? 'image/jpeg' : 'image/png';
        const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
        const baseName = _pdfBaseName(att.name);

        window.alert(
            'Edited pages will be saved as images inside the PDF.\n' +
            'Other pages stay unchanged.\n' +
            'After saving a page in the editor, you will be asked to export back to PDF.\n' +
            'Tip: save all pages first, then export once.'
        );

        const session = {
            sourceAtt: att,
            originalBytes: bytes,
            numPages,
            scale,
            pageSizes: new Map(),
            editedPages: new Map(),
        };
        _pdfEditSession = session;

        const pageAtts = [];
        for (const pageNum of selectedPages) {
            const { canvas, widthPt, heightPt } = await _renderPdfPageCanvas(pdf, pageNum, scale);
            session.pageSizes.set(pageNum, { widthPt, heightPt });

            const blob = await _canvasToBlob(canvas, mimeType, jpegQuality);
            const data = await _blobToBase64(blob);
            const pageAtt = {
                id: `pdf-edit-${att.id}-${pageNum}`,
                name: numPages === 1 ? `${baseName}.${ext}` : `${baseName}-page-${pageNum}.${ext}`,
                mimeType,
                data,
                size: blob.size,
                addedAt: new Date().toISOString(),
                _pdfEditPageNum: pageNum,
            };
            pageAtts.push(pageAtt);
        }

        let editorsRemaining = pageAtts.length;
        const onEditorClose = () => {
            editorsRemaining--;
            if (editorsRemaining <= 0) {
                _pdfEditSession = null;
                if (hadPreview) _openAttachment(att);
            }
        };

        pageAtts.forEach(pageAtt => {
            const pageNum = pageAtt._pdfEditPageNum;
            const cbs = _makePdfPageEditCallbacks(session, pageNum);
            openImageEditor(pageAtt, cbs.onSaveOverwrite, cbs.onSaveNew, onEditorClose);
        });

        editorsOpened = true;

        if (pageAtts.length > 1) {
            setTimeout(() => {
                if (window.confirm('Arrange editor windows as tile?')) {
                    autoArrangeImageEditors();
                }
            }, 150);
        }
    } catch (err) {
        console.error(err);
        alert('Cannot open PDF for editing: ' + (err.message || err));
        _pdfEditSession = null;
    } finally {
        _pdfEditing = false;
        if (!editorsOpened && hadPreview) _openAttachment(att);
    }
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
    updateFilePreviewConvertState(busy);
}

function _decodeImageToPngBase64(base64, mimeType) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            canvas.getContext('2d').drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            resolve({ base64: dataUrl.replace(/^data:image\/png;base64,/, '') });
        };
        img.onerror = () => reject(new Error('Image decode failed'));
        img.src = `data:${mimeType};base64,${base64}`;
    });
}

async function _convertImageToPdf(att) {
    if (_isAttachmentBusy()) return;

    _imageConverting = true;
    _updateConvertBtnState(true);

    try {
        let mime = att.mimeType === 'image/jpg' ? 'image/jpeg' : att.mimeType;
        let base64 = att.data;
        if (mime !== 'image/jpeg' && mime !== 'image/png') {
            const converted = await _decodeImageToPngBase64(base64, att.mimeType);
            base64 = converted.base64;
            mime = 'image/png';
        }

        const imgBytes = _attToUint8Array({ data: base64 });
        const pdfDoc = await PDFDocument.create();
        const image = mime === 'image/jpeg'
            ? await pdfDoc.embedJpg(imgBytes)
            : await pdfDoc.embedPng(imgBytes);
        const { width, height } = image.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(image, { x: 0, y: 0, width, height });

        const pdfBytes = await pdfDoc.save();
        const pdfName = _uniqueAttachmentName(`${_pdfBaseName(att.name)}.pdf`);
        attachmentsStore.push({
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            name: pdfName,
            mimeType: 'application/pdf',
            data: _uint8ArrayToBase64(pdfBytes),
            size: pdfBytes.length,
            addedAt: new Date().toISOString(),
        });
        alert(`Added "${pdfName}".`);
        refreshAttachmentsGui();
    } catch (err) {
        console.error(err);
        alert('Cannot convert this image to PDF.');
    } finally {
        _imageConverting = false;
        _updateConvertBtnState(false);
    }
}

async function _convertPdfToImages(att, options) {
    if (_isAttachmentBusy()) return;
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
        const bytes = _attToUint8Array(att);
        const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
        const numPages = pdf.numPages;
        const baseName = _pdfBaseName(att.name);
        let added = 0;

        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const { canvas } = await _renderPdfPageCanvas(pdf, pageNum, scale);

            const blob = await _canvasToBlob(canvas, mimeType, jpegQuality);

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

function _moveAttachment(id, delta) {
    if (attachmentsStore.length < 2) return;
    const index = attachmentsStore.findIndex(a => a.id === id);
    if (index < 0) return;
    const target = index + delta;
    if (target < 0 || target >= attachmentsStore.length) return;
    [attachmentsStore[index], attachmentsStore[target]] = [attachmentsStore[target], attachmentsStore[index]];
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
