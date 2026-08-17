// toolHintUtils.js – single viewport hint overlay for interactive tools

const ACTION_ATTRS = [
    'boolean-cancel',
    'deviation-ok',
    'deviation-cancel-pick',
    'deviation-cancel',
    'deviation-probe-cancel',
];

let _el = null;
let _onAction = null;
let _cacheKey = null;

export function hintButton(attr, label) {
    return `<button type="button" class="tool-hint-btn" data-${attr}>${label}</button>`;
}

export function initToolHintOverlay({ onAction } = {}) {
    _onAction = onAction || null;
    if (_el) return _el;

    _el = document.createElement('div');
    _el.id = 'tool-hint-overlay';
    _el.addEventListener('click', (e) => {
        for (const attr of ACTION_ATTRS) {
            if (e.target.closest(`[data-${attr}]`)) {
                e.preventDefault();
                e.stopPropagation();
                _onAction?.(attr);
                return;
            }
        }
    });
    document.body.appendChild(_el);
    return _el;
}

/** @param {{ html: string, interactive?: boolean } | null} hint */
export function updateToolHintOverlay(hint) {
    if (!_el) return;
    if (!hint) {
        if (_cacheKey === '') return;
        _cacheKey = '';
        _el.style.display = 'none';
        _el.innerHTML = '';
        _el.classList.remove('is-interactive');
        return;
    }
    const key = (hint.interactive ? '1' : '0') + '|' + hint.html;
    if (key === _cacheKey) return;
    _cacheKey = key;
    _el.innerHTML = hint.html;
    _el.style.display = 'block';
    _el.classList.toggle('is-interactive', !!hint.interactive);
}
