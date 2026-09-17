// Lightweight modal progress overlay for Open/Save GLB.
// Reuses OCR panel styles in main.css. No cancel — parse/export cannot be aborted.

export function yieldToUi() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => setTimeout(resolve, 0));
    });
}

/**
 * @param {string} title
 * @param {{ delayMs?: number }} [options] delayMs hides the panel until then (anti-flicker)
 */
export function openFileOpProgress(title, options = {}) {
    const { delayMs = 0 } = options;

    document.querySelectorAll('.file-op-progress-backdrop').forEach((el) => el.remove());

    const backdrop = document.createElement('div');
    backdrop.className = 'ocr-progress-backdrop file-op-progress-backdrop';
    if (delayMs > 0) backdrop.style.display = 'none';

    const panel = document.createElement('div');
    panel.className = 'ocr-progress-panel';
    panel.innerHTML = `
        <div class="ocr-progress-title"></div>
        <div class="ocr-progress-status"></div>
        <div class="ocr-progress-bar-row">
            <div class="ocr-progress-bar-wrap"><div class="ocr-progress-bar"></div></div>
            <div class="ocr-progress-pct">0%</div>
        </div>`;

    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);

    const titleEl = panel.querySelector('.ocr-progress-title');
    const statusEl = panel.querySelector('.ocr-progress-status');
    const barEl = panel.querySelector('.ocr-progress-bar');
    const pctEl = panel.querySelector('.ocr-progress-pct');
    titleEl.textContent = title;

    const state = { closed: false };
    const timer = delayMs > 0
        ? setTimeout(() => {
            if (!state.closed) backdrop.style.display = '';
        }, delayMs)
        : null;

    return {
        set({ status, progress, indeterminate } = {}) {
            if (state.closed) return;
            if (status) statusEl.textContent = status;
            if (typeof indeterminate === 'boolean') {
                barEl.classList.toggle('indeterminate', indeterminate);
                if (indeterminate) {
                    pctEl.textContent = '…';
                    return;
                }
                barEl.style.transform = '';
            }
            if (typeof progress === 'number') {
                const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
                barEl.style.width = `${pct}%`;
                if (!barEl.classList.contains('indeterminate')) {
                    pctEl.textContent = `${pct}%`;
                }
            }
        },
        close() {
            if (state.closed) return;
            state.closed = true;
            if (timer) clearTimeout(timer);
            backdrop.remove();
        },
    };
}
