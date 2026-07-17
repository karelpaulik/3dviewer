// uiMenuUtils.js – shared context-menu positioning (clamp, scroll, anchor) and tool menu DOM helpers

export const MENU_MARGIN = 8;

const DEFAULT_SCROLL_CLASS = 'ctx-menu-scroll';

const CTX_INPUT_ROW_STYLE = 'padding:2px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:default;';

/**
 * @param {string} id
 * @param {string} title
 * @returns {HTMLDivElement}
 */
export function createToolContextMenu(id, title) {
    const menu = document.createElement('div');
    menu.id = id;
    menu.className = 'ctx-menu ctx-menu-annotation-style';
    const lbl = document.createElement('div');
    lbl.className = 'ctx-label';
    lbl.textContent = title;
    menu.appendChild(lbl);
    menu.appendChild(createCtxMenuSeparator());
    return menu;
}

/**
 * @returns {HTMLDivElement}
 */
export function createCtxMenuSeparator() {
    const el = document.createElement('div');
    el.className = 'ctx-separator';
    return el;
}

/**
 * @param {string} label
 * @param {() => void} onClick
 * @param {{ onClose?: () => void }} [opts]
 * @returns {HTMLDivElement}
 */
export function createCtxMenuItem(label, onClick, opts = {}) {
    const el = document.createElement('div');
    el.className = 'ctx-item';
    el.textContent = label;
    el.addEventListener('mousedown', (e) => e.stopPropagation());
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        opts.onClose?.();
        onClick();
    });
    return el;
}

/**
 * @param {string} labelText
 * @param {string} currentVal
 * @param {(color: string) => void} onInput
 * @returns {HTMLDivElement}
 */
export function createCtxMenuColorRow(labelText, currentVal, onInput) {
    const el = document.createElement('div');
    el.style.cssText = CTX_INPUT_ROW_STYLE;
    const span = document.createElement('span');
    span.textContent = labelText;
    span.style.fontSize = '12px';
    const inp = document.createElement('input');
    inp.type = 'color';
    inp.value = currentVal;
    inp.style.cssText = 'width:26px;height:18px;border:none;padding:0;cursor:pointer;background:none;';
    inp.addEventListener('mousedown', (e) => e.stopPropagation());
    inp.addEventListener('click', (e) => e.stopPropagation());
    inp.addEventListener('input', (e) => { e.stopPropagation(); onInput(inp.value); });
    el.appendChild(span);
    el.appendChild(inp);
    return el;
}

/**
 * @param {string} labelText
 * @param {number} currentVal
 * @param {(size: number) => void} onInput
 * @returns {HTMLDivElement}
 */
export function createCtxMenuSizeRow(labelText, currentVal, onInput) {
    const el = document.createElement('div');
    el.style.cssText = CTX_INPUT_ROW_STYLE;
    const span = document.createElement('span');
    span.textContent = labelText;
    span.style.fontSize = '12px';
    const inp = document.createElement('input');
    inp.type = 'number';
    inp.min = '6';
    inp.max = '32';
    inp.step = '1';
    inp.value = String(currentVal);
    inp.style.cssText = 'width:46px;font-size:12px;background:#333;color:#fff;border:1px solid #555;border-radius:3px;padding:1px 3px;';
    inp.addEventListener('mousedown', (e) => e.stopPropagation());
    inp.addEventListener('click', (e) => e.stopPropagation());
    inp.addEventListener('change', (e) => { e.stopPropagation(); onInput(parseInt(e.target.value, 10)); });
    el.appendChild(span);
    el.appendChild(inp);
    return el;
}

/**
 * @param {HTMLElement} menu
 */
export function attachCtxMenuOutsideClose(menu) {
    const close = (e) => {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('mousedown', close, true);
        }
    };
    setTimeout(() => document.addEventListener('mousedown', close, true), 0);
}

/**
 * @param {HTMLElement} menu
 * @param {string} [scrollClass]
 */
export function resetMenuScrollStyles(menu, scrollClass = DEFAULT_SCROLL_CLASS) {
    menu.style.maxHeight = '';
    menu.style.overflowY = '';
    menu.classList.remove(scrollClass);
    menu.classList.remove('outliner-ctx-scroll');
}

/**
 * Position a fixed menu within the viewport; enable vertical scroll when taller than viewport.
 * @param {HTMLElement} menu
 * @param {number} x
 * @param {number} y
 * @param {{ bounds?: {left:number,top:number,width:number,height:number}, anchorRect?: DOMRect|null, margin?: number, scrollClass?: string }} [opts]
 */
export function positionContextMenu(menu, x, y, opts = {}) {
    const margin = opts.margin ?? MENU_MARGIN;
    const anchorRect = opts.anchorRect ?? null;
    const scrollClass = opts.scrollClass ?? DEFAULT_SCROLL_CLASS;
    const bounds = opts.bounds ?? {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
    };

    resetMenuScrollStyles(menu, scrollClass);

    const prevDisplay = menu.style.display;
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
    }
    if (getComputedStyle(menu).display === 'none') {
        menu.style.display = 'block';
    }

    const maxAllowedH = bounds.height - margin * 2;

    let effectiveH = menu.offsetHeight;
    if (menu.offsetHeight > maxAllowedH) {
        effectiveH = maxAllowedH;
        menu.style.maxHeight = maxAllowedH + 'px';
        menu.style.overflowY = 'auto';
        menu.classList.add(scrollClass);
    }

    const mw = menu.offsetWidth;
    let left = x;
    let top = y;

    const rightEdge = bounds.left + bounds.width - margin;
    const bottomEdge = bounds.top + bounds.height - margin;
    const leftEdge = bounds.left + margin;
    const topEdge = bounds.top + margin;

    if (anchorRect) {
        left = anchorRect.right + 2;
        top = anchorRect.top;
        if (left + mw > rightEdge) {
            left = anchorRect.left - mw - 2;
        }
    } else if (left + mw > rightEdge) {
        left = rightEdge - mw;
    }

    if (top + effectiveH > bottomEdge) {
        top = bottomEdge - effectiveH;
    }
    if (top < topEdge) top = topEdge;
    if (left < leftEdge) left = leftEdge;

    menu.style.left = left + 'px';
    menu.style.top = top + 'px';

    if (prevDisplay && prevDisplay !== menu.style.display) {
        // keep display as set above for visible menus
    }
}

/**
 * Outliner-compatible wrapper (full window bounds, outliner scroll class).
 * @param {HTMLElement} menu
 * @param {number} x
 * @param {number} y
 * @param {DOMRect|null} [anchorRect]
 */
export function positionFixedMenu(menu, x, y, anchorRect = null) {
    positionContextMenu(menu, x, y, {
        anchorRect,
        scrollClass: 'outliner-ctx-scroll',
    });
}
