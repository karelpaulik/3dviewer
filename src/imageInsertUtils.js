// imageInsertUtils.js
// Shared image insert dialog with compression — used by Docs (TipTap) and image editor.

import imageCompression from 'browser-image-compression';
import { getAttachmentsStore } from './attachmentsUtils.js';

async function compressImageLib(file, maxPx, quality) {
    const compressed = await imageCompression(file, {
        maxWidthOrHeight: maxPx,
        initialQuality: quality,
        useWebWorker: true,
    });
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(compressed);
    });
}

function fmtBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' kB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function dataUrlBytes(dataUrl) {
    const base64 = dataUrl.split(',')[1] || '';
    return Math.round(base64.length * 0.75);
}

/**
 * Show compression dialog and call onInsert(dataUrl) when user confirms.
 * @param {File} file
 * @param {(dataUrl: string) => void} onInsert
 */
export function showImageInsertDialog(file, onInsert) {
    document.querySelectorAll('.img-dialog-backdrop').forEach(el => el.remove());
    let maxPx = 1600;
    let quality = 0.85;
    let debounceTimer = null;
    let previewDataUrl = null;

    const origObjectUrl = URL.createObjectURL(file);
    const origBytes = file.size;

    const backdrop = document.createElement('div');
    backdrop.className = 'img-dialog-backdrop';

    const dialog = document.createElement('div');
    dialog.className = 'img-dialog';

    const title = document.createElement('div');
    title.className = 'img-dialog-title';
    title.textContent = 'Insert image';
    dialog.appendChild(title);

    const infoRow = document.createElement('div');
    infoRow.className = 'img-dialog-info';
    const origInfo = document.createElement('span');
    origInfo.textContent = `Original: ${fmtBytes(origBytes)}`;
    const previewInfo = document.createElement('span');
    previewInfo.className = 'img-dialog-preview-info';
    infoRow.appendChild(origInfo);
    infoRow.appendChild(previewInfo);
    dialog.appendChild(infoRow);

    const previews = document.createElement('div');
    previews.className = 'img-dialog-previews';

    const origThumb = document.createElement('img');
    origThumb.className = 'img-dialog-thumb';
    origThumb.src = origObjectUrl;
    origThumb.onload = () => {
        origInfo.textContent = `Original: ${origThumb.naturalWidth}×${origThumb.naturalHeight} · ${fmtBytes(origBytes)}`;
    };
    const origLabel = document.createElement('div');
    origLabel.className = 'img-dialog-thumb-label';
    origLabel.textContent = 'Originál';
    const origWrap = document.createElement('div');
    origWrap.className = 'img-dialog-thumb-wrap';
    origWrap.appendChild(origThumb);
    origWrap.appendChild(origLabel);

    const prevThumb = document.createElement('img');
    prevThumb.className = 'img-dialog-thumb';
    const prevLabel = document.createElement('div');
    prevLabel.className = 'img-dialog-thumb-label';
    prevLabel.textContent = 'Náhled';
    const prevWrap = document.createElement('div');
    prevWrap.className = 'img-dialog-thumb-wrap';
    prevWrap.appendChild(prevThumb);
    prevWrap.appendChild(prevLabel);

    previews.appendChild(origWrap);
    previews.appendChild(prevWrap);
    dialog.appendChild(previews);

    const controls = document.createElement('div');
    controls.className = 'img-dialog-controls';

    function makeSliderRow(labelText, min, max, step, value, unit, onChange) {
        const row = document.createElement('div');
        row.className = 'img-dialog-row';
        const lbl = document.createElement('label');
        lbl.className = 'img-dialog-label';
        lbl.textContent = labelText;
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min; slider.max = max; slider.step = step;
        slider.value = value;
        slider.className = 'img-dialog-slider';
        const valSpan = document.createElement('span');
        valSpan.className = 'img-dialog-val';
        valSpan.textContent = value + unit;
        slider.addEventListener('input', () => {
            valSpan.textContent = slider.value + unit;
            onChange(parseFloat(slider.value));
        });
        row.appendChild(lbl);
        row.appendChild(slider);
        row.appendChild(valSpan);
        return row;
    }

    controls.appendChild(makeSliderRow('Max rozměr', 200, 4000, 50, maxPx, ' px', v => { maxPx = v; schedulePreview(); }));
    controls.appendChild(makeSliderRow('Kvalita', 0.1, 1.0, 0.05, quality, '', v => { quality = v; schedulePreview(); }));

    dialog.appendChild(controls);

    function closeDialog() {
        URL.revokeObjectURL(origObjectUrl);
        backdrop.remove();
    }

    const btnRow = document.createElement('div');
    btnRow.className = 'img-dialog-btns';

    const btnInsert = document.createElement('button');
    btnInsert.className = 'img-dialog-btn img-dialog-btn-primary';
    btnInsert.textContent = 'Vložit';
    btnInsert.disabled = true;
    btnInsert.addEventListener('click', () => {
        if (previewDataUrl) {
            onInsert(previewDataUrl);
            closeDialog();
        }
    });

    const btnOrig = document.createElement('button');
    btnOrig.className = 'img-dialog-btn';
    btnOrig.textContent = 'Vložit originál';
    btnOrig.addEventListener('click', async () => {
        const dataUrl = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
        onInsert(dataUrl);
        closeDialog();
    });

    const btnCancel = document.createElement('button');
    btnCancel.className = 'img-dialog-btn';
    btnCancel.textContent = 'Zrušit';
    btnCancel.addEventListener('click', closeDialog);

    btnRow.appendChild(btnInsert);
    btnRow.appendChild(btnOrig);
    btnRow.appendChild(btnCancel);
    dialog.appendChild(btnRow);

    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    async function generatePreview() {
        btnInsert.disabled = true;
        prevLabel.textContent = 'Generuji…';
        try {
            const dataUrl = await compressImageLib(file, maxPx, quality);
            previewDataUrl = dataUrl;
            prevThumb.src = dataUrl;
            const prevBytes = dataUrlBytes(dataUrl);
            const prevImg = new Image();
            prevImg.onload = () => {
                prevLabel.textContent = `${prevImg.naturalWidth}×${prevImg.naturalHeight} · ${fmtBytes(prevBytes)}`;
                previewInfo.textContent = `Úspora: ${fmtBytes(origBytes - prevBytes)} (${Math.round((1 - prevBytes / origBytes) * 100)} %)`;
            };
            prevImg.src = dataUrl;
            btnInsert.textContent = `Vložit (${fmtBytes(prevBytes)})`;
            btnInsert.disabled = false;
        } catch (err) {
            prevLabel.textContent = 'Chyba komprese';
            console.error(err);
        }
    }

    function schedulePreview() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generatePreview, 400);
    }

    generatePreview();
}

/**
 * @param {(dataUrl: string) => void} onInsert
 */
export function pickImageFromDisk(onInsert) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;
        showImageInsertDialog(file, onInsert);
    };
    input.click();
}

/**
 * @param {(dataUrl: string) => void} onInsert
 */
export function pickImageFromFiles(onInsert) {
    const images = getAttachmentsStore().filter(a => a.mimeType && a.mimeType.startsWith('image/'));
    if (!images.length) {
        alert('No images in Files. Add images in the Files panel first.');
        return;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'img-dialog-backdrop';

    const dialog = document.createElement('div');
    dialog.className = 'img-dialog';
    dialog.style.maxWidth = '640px';

    const title = document.createElement('div');
    title.className = 'img-dialog-title';
    title.textContent = 'Insert image from Files';
    dialog.appendChild(title);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;max-height:400px;overflow-y:auto;margin:10px 0;';

    images.forEach(att => {
        const src = `data:${att.mimeType};base64,${att.data}`;

        const cell = document.createElement('div');
        cell.style.cssText = 'cursor:pointer;border:2px solid transparent;border-radius:4px;padding:4px;display:flex;flex-direction:column;align-items:center;gap:4px;transition:border-color 0.15s;';
        cell.title = att.name;

        const thumb = document.createElement('img');
        thumb.src = src;
        thumb.style.cssText = 'width:100%;height:90px;object-fit:contain;border-radius:2px;background:#111;';

        const label = document.createElement('span');
        label.style.cssText = 'font-size:10px;color:#bbb;word-break:break-all;text-align:center;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;';
        label.textContent = att.name;

        cell.appendChild(thumb);
        cell.appendChild(label);

        cell.addEventListener('mouseenter', () => { cell.style.borderColor = '#4a9eff'; });
        cell.addEventListener('mouseleave', () => { cell.style.borderColor = 'transparent'; });

        cell.addEventListener('click', () => {
            backdrop.remove();
            const binary = atob(att.data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            const blob = new Blob([bytes], { type: att.mimeType });
            const file = new File([blob], att.name, { type: att.mimeType });
            showImageInsertDialog(file, onInsert);
        });

        grid.appendChild(cell);
    });

    dialog.appendChild(grid);

    const btnCancel = document.createElement('button');
    btnCancel.className = 'img-dialog-btn';
    btnCancel.textContent = 'Cancel';
    btnCancel.addEventListener('click', () => backdrop.remove());
    dialog.appendChild(btnCancel);

    backdrop.appendChild(dialog);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
    document.body.appendChild(backdrop);
}

/** @returns {Promise<File|null>} */
export async function readImageFileFromClipboard() {
    if (!navigator.clipboard?.read) return null;
    try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
            const imageType = item.types.find(t => t.startsWith('image/'));
            if (imageType) {
                const blob = await item.getType(imageType);
                const ext = imageType.split('/')[1] || 'png';
                return new File([blob], `clipboard.${ext}`, { type: imageType });
            }
        }
    } catch (_) { /* permission denied or no image */ }
    return null;
}

/** @returns {Promise<File>} */
export function imageDataToFile(imageData, name = 'paste.png') {
    return new Promise(resolve => {
        const tmp = document.createElement('canvas');
        tmp.width = imageData.width;
        tmp.height = imageData.height;
        tmp.getContext('2d').putImageData(imageData, 0, 0);
        tmp.toBlob(blob => {
            resolve(new File([blob], name, { type: 'image/png' }));
        }, 'image/png');
    });
}
