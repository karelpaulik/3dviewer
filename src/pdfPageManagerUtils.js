// pdfPageManagerUtils.js
// Reorder, delete, and insert pages in an existing PDF attachment.

import { PDFDocument } from 'pdf-lib';
import { loadPdfDocument } from './pdfUtils.js';

const A4_WIDTH_PT = 595.28;
const A4_HEIGHT_PT = 841.89;
const THUMB_SCALE = 0.3;

let _modalEl = null;
let _session = null;

/**
 * @param {object} att - PDF attachment { id, name, data (base64), ... }
 * @param {object} helpers
 * @param {(att: object) => Uint8Array} helpers.attToUint8Array
 * @param {(bytes: Uint8Array) => string} helpers.uint8ArrayToBase64
 * @param {(input: string, numPages: number) => number[] | null} helpers.parsePageSelection
 * @param {(name: string) => string} helpers.pdfBaseName
 * @param {(name: string) => string} helpers.uniqueAttachmentName
 * @param {() => object[]} helpers.getImageAttachments
 * @param {() => object[]} helpers.getPdfAttachments
 * @param {(att: object, pdfBytes: Uint8Array, mode: 'overwrite' | 'new') => void} helpers.commitPdfAttachment
 * @param {() => void} [helpers.onOpen]
 * @param {() => void} [helpers.onClose]
 */
export async function openPdfPageManager(att, helpers) {
    try {
        const bytes = helpers.attToUint8Array(att);
        const pdf = await loadPdfDocument(bytes);
        const numPages = pdf.numPages;
        const defaultSize = await _getPdfPageSizePt(pdf, 1);

        const pagePlan = Array.from({ length: numPages }, (_, i) => ({
            type: 'source',
            srcIndex: i,
        }));

        _session = {
            att,
            helpers,
            sourceBytes: bytes,
            pdf,
            defaultSize,
            pagePlan,
            selectedIndex: 0,
            thumbUrls: [],
        };

        _ensureModal();
        await _renderPageList();
        _modalEl.style.display = 'flex';
        helpers.onOpen?.();
    } catch (err) {
        console.error(err);
        alert('Cannot open PDF page manager: ' + (err.message || err));
        _session = null;
        helpers.onClose?.();
    }
}

// ── PDF build ─────────────────────────────────────────────────────────────────

async function _buildPdfFromPlan(sourceBytes, pagePlan) {
    const srcDoc = await PDFDocument.load(sourceBytes);
    const outDoc = await PDFDocument.create();
    const externalCache = new Map();

    for (const ref of pagePlan) {
        if (ref.type === 'source') {
            const [copied] = await outDoc.copyPages(srcDoc, [ref.srcIndex]);
            outDoc.addPage(copied);
        } else if (ref.type === 'blank') {
            outDoc.addPage([ref.widthPt, ref.heightPt]);
        } else if (ref.type === 'image') {
            const imgBytes = _base64ToUint8(ref.base64);
            const image = ref.mimeType === 'image/jpeg'
                ? await outDoc.embedJpg(imgBytes)
                : await outDoc.embedPng(imgBytes);
            const page = outDoc.addPage([ref.pageWidthPt, ref.pageHeightPt]);
            const dims = image.scale(1);
            const fitScale = Math.min(
                ref.pageWidthPt / dims.width,
                ref.pageHeightPt / dims.height
            );
            const w = dims.width * fitScale;
            const h = dims.height * fitScale;
            page.drawImage(image, {
                x: (ref.pageWidthPt - w) / 2,
                y: (ref.pageHeightPt - h) / 2,
                width: w,
                height: h,
            });
        } else if (ref.type === 'external') {
            let extDoc = externalCache.get(ref.bytes);
            if (!extDoc) {
                extDoc = await PDFDocument.load(ref.bytes);
                externalCache.set(ref.bytes, extDoc);
            }
            const [copied] = await outDoc.copyPages(extDoc, [ref.srcIndex]);
            outDoc.addPage(copied);
        }
    }

    return outDoc.save();
}

// ── Modal UI ──────────────────────────────────────────────────────────────────

function _ensureModal() {
    if (_modalEl) return;

    _modalEl = document.createElement('div');
    _modalEl.id = 'pdf-page-manager-modal';
    _modalEl.style.cssText =
        'position:fixed;inset:0;z-index:100003;background:rgba(0,0,0,0.85);' +
        'display:none;flex-direction:column;align-items:center;justify-content:center;' +
        'padding:16px;box-sizing:border-box;font-family:sans-serif;';

    _modalEl.innerHTML = `
        <div style="width:100%;max-width:960px;max-height:92vh;background:#1e1e1e;border-radius:8px;display:flex;flex-direction:column;overflow:hidden;">
            <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:#2a2a2a;flex-shrink:0;">
                <span id="pdf-pm-title" style="flex:1;color:#eee;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></span>
                <button id="pdf-pm-close" style="background:none;border:none;color:#eee;font-size:18px;cursor:pointer;padding:0 4px;">✕</button>
            </div>
            <div style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:#252525;flex-shrink:0;flex-wrap:wrap;">
                <button id="pdf-pm-add-blank" style="font-size:12px;padding:4px 10px;cursor:pointer;border:1px solid #555;background:#333;color:#ddd;border-radius:3px;">+ Blank page</button>
                <button id="pdf-pm-add-file" style="font-size:12px;padding:4px 10px;cursor:pointer;border:1px solid #555;background:#333;color:#ddd;border-radius:3px;">+ Image from disc</button>
                <button id="pdf-pm-add-att" style="font-size:12px;padding:4px 10px;cursor:pointer;border:1px solid #555;background:#333;color:#ddd;border-radius:3px;">+ Image from Files</button>
                <button id="pdf-pm-add-pdf" style="font-size:12px;padding:4px 10px;cursor:pointer;border:1px solid #555;background:#333;color:#ddd;border-radius:3px;">+ PDF from disc</button>
                <button id="pdf-pm-add-pdf-att" style="font-size:12px;padding:4px 10px;cursor:pointer;border:1px solid #555;background:#333;color:#ddd;border-radius:3px;">+ PDF from Files</button>
                <span style="flex:1;"></span>
                <button id="pdf-pm-save" style="font-size:12px;padding:4px 14px;cursor:pointer;border:1px solid #4a7;background:#2d5a3d;color:#efe;border-radius:3px;">Save</button>
                <button id="pdf-pm-cancel" style="font-size:12px;padding:4px 14px;cursor:pointer;border:1px solid #555;background:#333;color:#ddd;border-radius:3px;">Cancel</button>
            </div>
            <div id="pdf-pm-hint" style="padding:6px 14px;color:#888;font-size:11px;flex-shrink:0;">
                Drag pages to reorder. Click a page to select insert position. Use ↑ ↓ or ✕ on each card.
            </div>
            <div id="pdf-pm-list" style="flex:1;overflow:auto;padding:12px 14px;display:flex;flex-wrap:wrap;gap:12px;align-content:flex-start;"></div>
        </div>`;

    document.body.appendChild(_modalEl);

    _modalEl.querySelector('#pdf-pm-close').addEventListener('click', _closeModal);
    _modalEl.querySelector('#pdf-pm-cancel').addEventListener('click', _closeModal);
    _modalEl.querySelector('#pdf-pm-save').addEventListener('click', _savePdf);
    _modalEl.querySelector('#pdf-pm-add-blank').addEventListener('click', () => _addBlankPage());
    _modalEl.querySelector('#pdf-pm-add-file').addEventListener('click', () => _addImageFromFile());
    _modalEl.querySelector('#pdf-pm-add-att').addEventListener('click', () => _addImageFromAttachment());
    _modalEl.querySelector('#pdf-pm-add-pdf').addEventListener('click', () => _addPagesFromPdf());
    _modalEl.querySelector('#pdf-pm-add-pdf-att').addEventListener('click', () => _addPagesFromPdfAttachment());

    document.addEventListener('keydown', e => {
        if (!_modalEl || _modalEl.style.display === 'none') return;
        if (e.key === 'Escape') _closeModal();
    });
}

function _closeModal() {
    const onClose = _session?.helpers?.onClose;
    if (_modalEl) _modalEl.style.display = 'none';
    _revokeThumbUrls();
    _session = null;
    onClose?.();
}

async function _savePdf() {
    if (!_session) return;
    const { att, helpers, sourceBytes, pagePlan } = _session;

    if (pagePlan.length === 0) {
        alert('PDF must have at least one page.');
        return;
    }

    const overwrite = window.confirm(
        'Save page changes?\n\n' +
        'OK = overwrite the original PDF attachment\n' +
        'Cancel = save as a new PDF file'
    );

    try {
        const pdfBytes = await _buildPdfFromPlan(sourceBytes, pagePlan);
        helpers.commitPdfAttachment(att, pdfBytes, overwrite ? 'overwrite' : 'new');
        _closeModal();
    } catch (err) {
        console.error(err);
        alert('Failed to save PDF: ' + (err.message || err));
    }
}

async function _renderPageList() {
    if (!_session || !_modalEl) return;
    const { att, pagePlan } = _session;

    _modalEl.querySelector('#pdf-pm-title').textContent =
        `Manage PDF pages — ${att.name} (${pagePlan.length} page${pagePlan.length === 1 ? '' : 's'})`;

    _revokeThumbUrls();
    const list = _modalEl.querySelector('#pdf-pm-list');
    list.innerHTML = '';

    for (let i = 0; i < pagePlan.length; i++) {
        const ref = pagePlan[i];
        const card = document.createElement('div');
        card.dataset.index = String(i);
        card.draggable = true;
        const isSelected = i === _session.selectedIndex;
        card.style.cssText =
            'width:130px;flex-shrink:0;background:#2a2a2a;border-radius:6px;padding:6px;' +
            `border:2px solid ${isSelected ? '#5a9fd4' : '#3a3a3a'};cursor:grab;`;

        const thumbWrap = document.createElement('div');
        thumbWrap.style.cssText =
            'width:118px;height:150px;background:#111;border-radius:4px;overflow:hidden;' +
            'display:flex;align-items:center;justify-content:center;margin-bottom:6px;';

        const thumbUrl = await _renderThumb(ref);
        if (thumbUrl) {
            _session.thumbUrls.push(thumbUrl);
            const img = document.createElement('img');
            img.src = thumbUrl;
            img.draggable = false;
            img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;display:block;';
            thumbWrap.appendChild(img);
        } else {
            thumbWrap.textContent = '…';
            thumbWrap.style.color = '#666';
            thumbWrap.style.fontSize = '12px';
        }

        const label = document.createElement('div');
        label.style.cssText = 'color:#aaa;font-size:11px;text-align:center;margin-bottom:4px;';
        label.textContent = `${i + 1}. ${_pageRefLabel(ref)}`;

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;justify-content:center;gap:4px;';

        const mkBtn = (text, title, fn) => {
            const b = document.createElement('button');
            b.textContent = text;
            b.title = title;
            b.style.cssText =
                'background:none;border:1px solid #555;color:#ccc;font-size:12px;' +
                'cursor:pointer;padding:1px 6px;border-radius:3px;line-height:1.4;';
            b.addEventListener('click', e => { e.stopPropagation(); fn(); });
            return b;
        };

        btnRow.appendChild(mkBtn('↑', 'Move up', () => _movePage(i, -1)));
        btnRow.appendChild(mkBtn('↓', 'Move down', () => _movePage(i, 1)));
        btnRow.appendChild(mkBtn('✕', 'Delete page', () => _deletePage(i)));

        card.appendChild(thumbWrap);
        card.appendChild(label);
        card.appendChild(btnRow);

        card.addEventListener('click', () => {
            _session.selectedIndex = i;
            _renderPageList();
        });

        card.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', String(i));
            e.dataTransfer.effectAllowed = 'move';
            card.style.opacity = '0.5';
        });
        card.addEventListener('dragend', () => { card.style.opacity = '1'; });
        card.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            card.style.borderColor = '#5a9fd4';
        });
        card.addEventListener('dragleave', () => {
            card.style.borderColor = isSelected ? '#5a9fd4' : '#3a3a3a';
        });
        card.addEventListener('drop', e => {
            e.preventDefault();
            const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
            const to = i;
            if (!Number.isFinite(from) || from === to) return;
            _reorderPage(from, to);
        });

        list.appendChild(card);
    }
}

function _pageRefLabel(ref) {
    switch (ref.type) {
        case 'source': return `p.${ref.srcIndex + 1}`;
        case 'blank': return 'blank';
        case 'image': return 'image';
        case 'external': return `ext p.${ref.srcIndex + 1}`;
        default: return ref.type;
    }
}

function _movePage(index, delta) {
    const target = index + delta;
    if (!_session || target < 0 || target >= _session.pagePlan.length) return;
    const plan = _session.pagePlan;
    [plan[index], plan[target]] = [plan[target], plan[index]];
    if (_session.selectedIndex === index) _session.selectedIndex = target;
    else if (_session.selectedIndex === target) _session.selectedIndex = index;
    _renderPageList();
}

function _reorderPage(from, to) {
    if (!_session) return;
    const plan = _session.pagePlan;
    const [item] = plan.splice(from, 1);
    plan.splice(to, 0, item);
    _session.selectedIndex = to;
    _renderPageList();
}

function _deletePage(index) {
    if (!_session) return;
    if (_session.pagePlan.length <= 1) {
        alert('Cannot delete the last page.');
        return;
    }
    if (!window.confirm(`Delete page ${index + 1}?`)) return;
    _session.pagePlan.splice(index, 1);
    if (_session.selectedIndex >= _session.pagePlan.length) {
        _session.selectedIndex = _session.pagePlan.length - 1;
    }
    _renderPageList();
}

function _insertIndex() {
    if (!_session) return 0;
    const after = _session.selectedIndex;
    return after + 1;
}

function _insertRefs(refs) {
    if (!_session || refs.length === 0) return;
    const at = _insertIndex();
    _session.pagePlan.splice(at, 0, ...refs);
    _session.selectedIndex = at + refs.length - 1;
    _renderPageList();
}

// ── Add page sources ──────────────────────────────────────────────────────────

async function _addBlankPage() {
    if (!_session) return;
    const { defaultSize } = _session;
    const choice = window.prompt(
        'Blank page size:\n\n' +
        '  first = same as first page of this PDF\n' +
        '  a4 = A4 portrait\n' +
        '  Or enter page number to match (e.g. 2)',
        'first'
    );
    if (choice == null) return;

    let widthPt = defaultSize.widthPt;
    let heightPt = defaultSize.heightPt;
    const c = choice.trim().toLowerCase();
    if (c === 'a4') {
        widthPt = A4_WIDTH_PT;
        heightPt = A4_HEIGHT_PT;
    } else if (c !== 'first' && /^\d+$/.test(c)) {
        const pageNum = parseInt(c, 10);
        if (pageNum >= 1 && pageNum <= _session.pdf.numPages) {
            const size = await _getPdfPageSizePt(_session.pdf, pageNum);
            widthPt = size.widthPt;
            heightPt = size.heightPt;
        } else {
            alert('Invalid page number.');
            return;
        }
    }

    _insertRefs([{ type: 'blank', widthPt, heightPt }]);
}

function _addImageFromFile() {
    if (!_session) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg,image/webp';
    input.onchange = async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Select a PNG or JPG image.');
            return;
        }
        try {
            const base64 = await _fileToBase64(file);
            const ref = await _makeImagePageRef(base64, file.type, _session.defaultSize);
            _insertRefs([ref]);
        } catch (err) {
            console.error(err);
            alert('Cannot load image: ' + (err.message || err));
        }
    };
    input.click();
}

async function _addImageFromAttachment() {
    if (!_session) return;
    const images = _session.helpers.getImageAttachments();
    if (images.length === 0) {
        alert('No image attachments in Files panel.');
        return;
    }

    const list = images.map((a, i) => `${i + 1}. ${a.name}`).join('\n');
    const pick = window.prompt(
        `Select image attachment (1–${images.length}):\n\n${list}`,
        '1'
    );
    if (pick == null) return;
    const idx = parseInt(pick.trim(), 10) - 1;
    if (!Number.isFinite(idx) || idx < 0 || idx >= images.length) {
        alert('Invalid selection.');
        return;
    }

    const att = images[idx];
    try {
        const ref = await _makeImagePageRef(att.data, att.mimeType, _session.defaultSize);
        _insertRefs([ref]);
    } catch (err) {
        console.error(err);
        alert('Cannot load image: ' + (err.message || err));
    }
}

function _addPagesFromPdf() {
    if (!_session) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        try {
            const bytes = new Uint8Array(await file.arrayBuffer());
            await _insertPagesFromExternalPdf(bytes, file.name);
        } catch (err) {
            console.error(err);
            alert('Cannot load PDF: ' + (err.message || err));
        }
    };
    input.click();
}

async function _addPagesFromPdfAttachment() {
    if (!_session) return;
    const pdfs = _session.helpers.getPdfAttachments();
    if (pdfs.length === 0) {
        alert('No other PDF attachments in Files panel.');
        return;
    }

    const list = pdfs.map((a, i) => `${i + 1}. ${a.name}`).join('\n');
    const pick = window.prompt(
        `Select PDF attachment (1–${pdfs.length}):\n\n${list}`,
        '1'
    );
    if (pick == null) return;
    const idx = parseInt(pick.trim(), 10) - 1;
    if (!Number.isFinite(idx) || idx < 0 || idx >= pdfs.length) {
        alert('Invalid selection.');
        return;
    }

    const att = pdfs[idx];
    try {
        const bytes = _session.helpers.attToUint8Array(att);
        await _insertPagesFromExternalPdf(bytes, att.name);
    } catch (err) {
        console.error(err);
        alert('Cannot load PDF: ' + (err.message || err));
    }
}

async function _insertPagesFromExternalPdf(bytes, sourceLabel) {
    if (!_session) return;
    const pdf = await loadPdfDocument(bytes);
    const numPages = pdf.numPages;

    const pageInput = window.prompt(
        `Pages to add (${numPages} in "${sourceLabel}").\n` +
        'Examples: all   or   1   or   1, 3-5',
        'all'
    );
    if (pageInput == null) return;

    const selected = _session.helpers.parsePageSelection(pageInput, numPages);
    if (!selected) {
        alert('Invalid page selection.');
        return;
    }

    const refs = selected.map(pageNum => ({
        type: 'external',
        bytes,
        srcIndex: pageNum - 1,
    }));
    _insertRefs(refs);
}

async function _makeImagePageRef(base64, mimeType, pageSize) {
    const normalizedMime = (mimeType === 'image/jpg') ? 'image/jpeg' : mimeType;
    if (normalizedMime !== 'image/jpeg' && normalizedMime !== 'image/png') {
        const converted = await _convertImageToPngBase64(base64, mimeType);
        return {
            type: 'image',
            base64: converted.base64,
            mimeType: 'image/png',
            pageWidthPt: pageSize.widthPt,
            pageHeightPt: pageSize.heightPt,
        };
    }
    return {
        type: 'image',
        base64,
        mimeType: normalizedMime,
        pageWidthPt: pageSize.widthPt,
        pageHeightPt: pageSize.heightPt,
    };
}

// ── Thumbnails ────────────────────────────────────────────────────────────────

async function _renderThumb(ref) {
    if (!_session) return null;

    if (ref.type === 'source') {
        const { canvas } = await _renderPdfPageCanvas(_session.pdf, ref.srcIndex + 1, THUMB_SCALE);
        return canvas.toDataURL('image/png');
    }
    if (ref.type === 'external') {
        const pdf = await loadPdfDocument(ref.bytes);
        const { canvas } = await _renderPdfPageCanvas(pdf, ref.srcIndex + 1, THUMB_SCALE);
        return canvas.toDataURL('image/png');
    }
    if (ref.type === 'image') {
        return `data:${ref.mimeType};base64,${ref.base64}`;
    }
    if (ref.type === 'blank') {
        const canvas = document.createElement('canvas');
        const aspect = ref.widthPt / ref.heightPt;
        canvas.width = 118;
        canvas.height = Math.round(118 / aspect);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#cccccc';
        ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
        return canvas.toDataURL('image/png');
    }
    return null;
}

function _revokeThumbUrls() {
    if (!_session) return;
    for (const url of _session.thumbUrls) {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    }
    _session.thumbUrls = [];
}

// ── Low-level helpers ─────────────────────────────────────────────────────────

async function _getPdfPageSizePt(pdf, pageNum) {
    const page = await pdf.getPage(pageNum);
    const vp = page.getViewport({ scale: 1 });
    return { widthPt: vp.width, heightPt: vp.height };
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

function _base64ToUint8(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function _fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const comma = result.indexOf(',');
            resolve(comma >= 0 ? result.slice(comma + 1) : result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function _convertImageToPngBase64(base64, mimeType) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            resolve({ base64: dataUrl.replace(/^data:image\/png;base64,/, '') });
        };
        img.onerror = () => reject(new Error('Image decode failed'));
        img.src = `data:${mimeType};base64,${base64}`;
    });
}
