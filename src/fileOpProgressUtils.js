// Shared modal progress overlay for long file operations (Open/Save GLB, …).
// Reuses the OCR/file-op panel styles in main.css.

export function yieldToUi() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => setTimeout(resolve, 0));
    });
}

export function createAbortError(message = 'Cancelled.') {
    const err = new Error(message);
    err.name = 'AbortError';
    return err;
}

/**
 * @param {string} title
 * @param {{ cancellable?: boolean }} [options]
 */
export function openFileOpProgress(title, options = {}) {
    const { cancellable = false } = options;

    document.querySelectorAll('.file-op-progress-backdrop').forEach((el) => el.remove());

    const backdrop = document.createElement('div');
    backdrop.className = 'ocr-progress-backdrop file-op-progress-backdrop';

    const panel = document.createElement('div');
    panel.className = 'ocr-progress-panel';
    panel.innerHTML = `
        <div class="ocr-progress-title"></div>
        <div class="ocr-progress-status"></div>
        <div class="ocr-progress-bar-row">
            <div class="ocr-progress-bar-wrap"><div class="ocr-progress-bar"></div></div>
            <div class="ocr-progress-pct">0%</div>
        </div>
        ${cancellable ? '<button type="button" class="ocr-progress-cancel img-dialog-btn">Cancel</button>' : ''}`;

    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);

    const titleEl = panel.querySelector('.ocr-progress-title');
    const statusEl = panel.querySelector('.ocr-progress-status');
    const barEl = panel.querySelector('.ocr-progress-bar');
    const pctEl = panel.querySelector('.ocr-progress-pct');
    titleEl.textContent = title;

    const abortHandlers = new Set();
    const state = { cancelled: false, closed: false };

    panel.querySelector('.ocr-progress-cancel')?.addEventListener('click', () => {
        if (state.cancelled || state.closed) return;
        state.cancelled = true;
        statusEl.textContent = 'Cancelling…';
        for (const fn of abortHandlers) {
            try { fn(); } catch { /* ignore */ }
        }
    });

    return {
        get cancelled() { return state.cancelled; },
        onAbort(fn) {
            abortHandlers.add(fn);
            return () => abortHandlers.delete(fn);
        },
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
            abortHandlers.clear();
            backdrop.remove();
        },
    };
}
