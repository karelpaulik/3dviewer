// uiMenuUtils.js – shared context-menu positioning (clamp, scroll, anchor)

export const MENU_MARGIN = 8;

const DEFAULT_SCROLL_CLASS = 'ctx-menu-scroll';

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
