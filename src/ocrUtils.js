// ocrUtils.js
// Lazy-loaded Tesseract.js OCR — engine loads only on first use.

let _worker = null;
let _workerInitPromise = null;
let _idleTimer = null;

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const DEFAULT_LANGS = ['ces', 'eng'];

function _baseUrl() {
    const base = import.meta.env.BASE_URL || './';
    return base.endsWith('/') ? base : `${base}/`;
}

function _ocrPaths() {
    const base = _baseUrl();
    return {
        workerPath: `${base}tesseract/worker.min.js`,
        langPath: `${base}tessdata/4.0.0_best_int/`,
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@7.0.0/',
    };
}

function _resetIdleTimer() {
    clearTimeout(_idleTimer);
    _idleTimer = setTimeout(() => terminateOcrWorker(), IDLE_TIMEOUT_MS);
}

function _isOcrEngineReady() {
    return _worker !== null;
}

const _OCR_LOADING_STATUSES = new Set([
    'loading tesseract core',
    'initializing tesseract',
    'loading language traineddata',
]);

const OCR_ENGINE_HINT_TEXT =
    'Načítám OCR engine (~5 MB). Při dalším použití obvykle z cache.';

function _statusLabel(status) {
    switch (status) {
        case 'loading tesseract core': return 'Načítám OCR engine…';
        case 'initializing tesseract': return 'Inicializuji OCR…';
        case 'loading language traineddata': return 'Načítám jazyková data…';
        case 'initialized tesseract': return 'OCR připraveno';
        case 'recognizing text': return 'Rozpoznávám text…';
        default: return status || 'Zpracovávám…';
    }
}

/**
 * @param {(info: { status: string, progress: number, label: string }) => void} [onProgress]
 */
async function _ensureWorker(onProgress) {
    if (_worker) return _worker;
    if (!_workerInitPromise) {
        _workerInitPromise = (async () => {
            const { createWorker } = await import('tesseract.js');
            const worker = await createWorker(DEFAULT_LANGS, 1, {
                ..._ocrPaths(),
                gzip: true,
                logger: m => {
                    onProgress?.({
                        status: m.status,
                        progress: m.progress,
                        label: _statusLabel(m.status),
                    });
                },
            });
            _worker = worker;
            _resetIdleTimer();
            return worker;
        })().catch(err => {
            _workerInitPromise = null;
            throw err;
        });
    }
    return _workerInitPromise;
}

/**
 * Run OCR on a canvas, data URL, ImageData, or image element.
 * @param {HTMLCanvasElement|HTMLImageElement|ImageData|string} imageSource
 * @param {{ onProgress?: Function, rectangle?: { left: number, top: number, width: number, height: number } }} [options]
 * @returns {Promise<string>}
 */
export async function runOcr(imageSource, options = {}) {
    const { onProgress, rectangle } = options;
    const worker = await _ensureWorker(onProgress);
    _resetIdleTimer();

    const recognizeOpts = rectangle ? { rectangle } : undefined;
    const result = await worker.recognize(imageSource, recognizeOpts);
    return (result.data.text || '').trim();
}

export function terminateOcrWorker() {
    clearTimeout(_idleTimer);
    _idleTimer = null;
    if (_worker) {
        const w = _worker;
        _worker = null;
        _workerInitPromise = null;
        w.terminate().catch(() => {});
    }
}

/**
 * Show a modal progress overlay while OCR runs.
 * @param {() => Promise<string>} runFn
 * @returns {Promise<string|null>} null if cancelled
 */
export async function runOcrWithProgress(runFn) {
    document.querySelectorAll('.ocr-progress-backdrop').forEach(el => el.remove());

    const backdrop = document.createElement('div');
    backdrop.className = 'ocr-progress-backdrop';

    const panel = document.createElement('div');
    panel.className = 'ocr-progress-panel';
    panel.innerHTML = `
        <div class="ocr-progress-title">Rozpoznávání textu</div>
        <div class="ocr-progress-hint" style="display:none"></div>
        <div class="ocr-progress-status"></div>
        <div class="ocr-progress-bar-wrap"><div class="ocr-progress-bar"></div></div>
        <button type="button" class="ocr-progress-cancel img-dialog-btn">Zrušit</button>`;

    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);

    const hintEl = panel.querySelector('.ocr-progress-hint');
    const statusEl = panel.querySelector('.ocr-progress-status');
    const barEl = panel.querySelector('.ocr-progress-bar');
    let cancelled = false;

    const engineReady = _isOcrEngineReady();
    statusEl.textContent = engineReady ? 'Rozpoznávám text…' : 'Připravuji…';

    const close = () => backdrop.remove();
    const cancelBtn = panel.querySelector('.ocr-progress-cancel');
    cancelBtn.addEventListener('click', () => { cancelled = true; close(); });

    const onProgress = ({ status, label, progress }) => {
        statusEl.textContent = label;
        const pct = Math.round((progress || 0) * 100);
        barEl.style.width = `${pct}%`;

        if (_OCR_LOADING_STATUSES.has(status)) {
            hintEl.textContent = OCR_ENGINE_HINT_TEXT;
            hintEl.style.display = '';
        } else if (
            status === 'initialized tesseract' ||
            status === 'recognizing text'
        ) {
            hintEl.style.display = 'none';
        }
    };

    try {
        const text = await runFn(onProgress);
        if (cancelled) return null;
        close();
        return text;
    } catch (err) {
        close();
        throw err;
    }
}

/**
 * Show editable OCR result dialog.
 * @param {string} text
 * @param {{ canInsertToDoc?: boolean, onCopy?: () => void, onPlaceOnImage?: (text: string) => void, onInsertToDoc?: (text: string) => void }} callbacks
 */
export function showOcrResultDialog(text, callbacks = {}) {
    document.querySelectorAll('.ocr-result-backdrop').forEach(el => el.remove());

    const backdrop = document.createElement('div');
    backdrop.className = 'ocr-result-backdrop img-dialog-backdrop';

    const dialog = document.createElement('div');
    dialog.className = 'ocr-result-dialog img-dialog';
    dialog.style.maxWidth = '640px';

    const title = document.createElement('div');
    title.className = 'img-dialog-title';
    title.textContent = 'Rozpoznaný text';
    dialog.appendChild(title);

    const textarea = document.createElement('textarea');
    textarea.className = 'ocr-result-text';
    textarea.value = text;
    textarea.spellcheck = true;
    dialog.appendChild(textarea);

    const btnRow = document.createElement('div');
    btnRow.className = 'img-dialog-btns';

    const btnCopy = document.createElement('button');
    btnCopy.className = 'img-dialog-btn';
    btnCopy.textContent = 'Kopírovat';
    btnCopy.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(textarea.value);
            btnCopy.textContent = 'Zkopírováno ✓';
            setTimeout(() => { btnCopy.textContent = 'Kopírovat'; }, 1500);
            callbacks.onCopy?.();
        } catch {
            alert('Kopírování se nezdařilo.');
        }
    });

    const btnPlace = document.createElement('button');
    btnPlace.className = 'img-dialog-btn img-dialog-btn-primary';
    btnPlace.textContent = 'Vložit na obrázek';
    if (!callbacks.onPlaceOnImage) btnPlace.style.display = 'none';
    btnPlace.addEventListener('click', () => {
        const val = textarea.value.trim();
        if (!val) return;
        callbacks.onPlaceOnImage?.(val);
        backdrop.remove();
    });

    const btnDoc = document.createElement('button');
    btnDoc.className = 'img-dialog-btn';
    btnDoc.textContent = 'Vložit do dokumentu';
    btnDoc.style.display = callbacks.canInsertToDoc ? '' : 'none';
    btnDoc.addEventListener('click', () => {
        const val = textarea.value.trim();
        if (!val) return;
        callbacks.onInsertToDoc?.(val);
        backdrop.remove();
    });

    const btnClose = document.createElement('button');
    btnClose.className = 'img-dialog-btn';
    btnClose.textContent = 'Zavřít';
    btnClose.addEventListener('click', () => backdrop.remove());

    btnRow.appendChild(btnCopy);
    if (callbacks.onPlaceOnImage) btnRow.appendChild(btnPlace);
    if (callbacks.canInsertToDoc) btnRow.appendChild(btnDoc);
    btnRow.appendChild(btnClose);
    dialog.appendChild(btnRow);

    backdrop.appendChild(dialog);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
    document.body.appendChild(backdrop);
    textarea.focus();
    textarea.select();
}

/**
 * Extract a canvas region as a temporary canvas for OCR.
 * @param {HTMLCanvasElement} canvas
 * @param {{ x: number, y: number, w: number, h: number }} rect
 */
export function canvasRegionToCanvas(canvas, rect) {
    const tmp = document.createElement('canvas');
    tmp.width = Math.max(1, Math.round(rect.w));
    tmp.height = Math.max(1, Math.round(rect.h));
    tmp.getContext('2d').drawImage(
        canvas,
        rect.x, rect.y, rect.w, rect.h,
        0, 0, tmp.width, tmp.height
    );
    return tmp;
}
