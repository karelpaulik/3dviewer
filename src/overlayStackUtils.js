// overlayStackUtils.js
// Shared z-index stacking for docs overlay, file preview, and image editor.
// Band 5000–90000 sits above GUI (~1002) and below modal dialogs (100000+).

const Z_BASE = 5000;
const Z_MAX = 90000;
const INACTIVE_CLASS = 'overlay-toolbar--inactive';

let _next = Z_BASE;
const _toolbars = new Map();
let _topId = null;
let _topWindow = null;

function _allocZ() {
    if (_next >= Z_MAX) _next = Z_BASE;
    return _next++;
}

function _applyZ(el) {
    if (!el) return;
    el.style.zIndex = String(_allocZ());
}

function _syncToolbarInactive() {
    for (const [id, el] of _toolbars) {
        if (!el) continue;
        el.classList.toggle(INACTIVE_CLASS, id !== _topId);
    }
}

/**
 * Raise a floating overlay surface: window first, then its shared toolbar.
 * @param {{ id: string, windowEl?: HTMLElement|null, toolbarEl?: HTMLElement|null, force?: boolean }} opts
 */
export function raiseOverlaySurface({ id, windowEl = null, toolbarEl = null, force = false } = {}) {
    if (!id) return;

    if (toolbarEl) _toolbars.set(id, toolbarEl);

    if (!force && _topId === id && _topWindow === windowEl) {
        _syncToolbarInactive();
        return;
    }

    if (windowEl) _applyZ(windowEl);
    if (toolbarEl) _applyZ(toolbarEl);

    _topId = id;
    _topWindow = windowEl;
    _syncToolbarInactive();
}

/** Drop a surface from the stack (last window closed / docs overlay hidden). */
export function unregisterOverlaySurface(id) {
    _toolbars.delete(id);
    if (_topId === id) {
        _topId = null;
        _topWindow = null;
    }
    for (const el of _toolbars.values()) {
        if (el) el.classList.remove(INACTIVE_CLASS);
    }
}
