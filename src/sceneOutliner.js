// sceneOutliner.js – Scene hierarchy panel (left side, collapsible, resizable)
import { positionFixedMenu, resetMenuScrollStyles } from './uiMenuUtils.js';

/** @type {HTMLDivElement} */
let panelEl = null;
/** @type {HTMLDivElement} */
let treeEl = null;
/** @type {boolean} */
let isOpen = false;

// External callbacks set via init()
let onSelectObject = null;
let onToggleVisibility = null;
let onToggleSelectable = null;
let onGroupAdd = null;
let onReparent = null;
let onRemove = null;
let onRemoveGroup = null;
let onGetGroupSelection = null;
let onGroupRemove = null;
let onHideOthers = null;
let onShowAll = null;
let onSortChildren = null;
let onCloneObject = null;
let onAddObject3D = null;
let onAddPrimitive = null;
let onPromoteToRoot = null;

// -------------------------------------------------------------------
// Context menu
// -------------------------------------------------------------------

/** @type {HTMLDivElement|null} */
let ctxMenuEl = null;

/** @type {HTMLButtonElement|null} */
let addBtnEl = null;

/** @type {HTMLDivElement|null} */
let addPrimitiveMenuEl = null;

/** @type {HTMLDivElement|null} */
let activeFlyoutEl = null;

/** @type {ReturnType<typeof setTimeout>|null} */
let flyoutHideTimer = null;

/** @type {(() => void)|null} */
let _onTreeRebuild = null;

/**
 * Register a callback invoked after each rebuildTree (scene graph changed).
 * @param {(() => void)|null} cb
 */
export function setOnTreeRebuild(cb) {
    _onTreeRebuild = cb;
}

const PRIMITIVE_TYPES = [
    ['box', 'Box'],
    ['sphere', 'Sphere'],
    ['cylinder', 'Cylinder'],
    ['cone', 'Cone'],
    ['plane', 'Plane'],
    ['torus', 'Torus']
];

function hidePrimitiveFlyout() {
    if (flyoutHideTimer) {
        clearTimeout(flyoutHideTimer);
        flyoutHideTimer = null;
    }
    if (activeFlyoutEl) {
        resetMenuScrollStyles(activeFlyoutEl);
        activeFlyoutEl.remove();
        activeFlyoutEl = null;
    }
}

function scheduleHideFlyout() {
    if (flyoutHideTimer) clearTimeout(flyoutHideTimer);
    flyoutHideTimer = setTimeout(hidePrimitiveFlyout, 150);
}

function showPrimitiveFlyout(parentObj, anchorEl) {
    if (!onAddPrimitive) return;
    hidePrimitiveFlyout();

    const flyout = document.createElement('div');
    flyout.className = 'outliner-ctx-menu outliner-ctx-flyout';
    PRIMITIVE_TYPES.forEach(([type, label]) => {
        const item = document.createElement('div');
        item.className = 'outliner-ctx-item';
        item.textContent = label;
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            hideCtxMenu();
            onAddPrimitive(type, parentObj);
        });
        flyout.appendChild(item);
    });
    document.body.appendChild(flyout);
    activeFlyoutEl = flyout;

    const rect = anchorEl.getBoundingClientRect();
    positionFixedMenu(flyout, rect.right + 2, rect.top, rect);

    flyout.addEventListener('mouseenter', () => {
        if (flyoutHideTimer) {
            clearTimeout(flyoutHideTimer);
            flyoutHideTimer = null;
        }
    });
    flyout.addEventListener('mouseleave', scheduleHideFlyout);
}

function appendAddPrimitiveSubmenu(menu, parentObj) {
    const submenuItem = document.createElement('div');
    submenuItem.className = 'outliner-ctx-item outliner-ctx-submenu';
    submenuItem.textContent = 'Add primitive';
    submenuItem.addEventListener('mouseenter', () => {
        if (flyoutHideTimer) {
            clearTimeout(flyoutHideTimer);
            flyoutHideTimer = null;
        }
        showPrimitiveFlyout(parentObj, submenuItem);
    });
    submenuItem.addEventListener('mouseleave', scheduleHideFlyout);
    menu.appendChild(submenuItem);
}

function getOrCreateCtxMenu() {
    if (ctxMenuEl) return ctxMenuEl;
    ctxMenuEl = document.createElement('div');
    ctxMenuEl.className = 'outliner-ctx-menu';
    ctxMenuEl.style.display = 'none';
    document.body.appendChild(ctxMenuEl);

    // Close on any outside click / Escape
    document.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        if (ctxMenuEl.contains(e.target)) return;
        if (activeFlyoutEl && activeFlyoutEl.contains(e.target)) return;
        hideCtxMenu();
    }, true);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideCtxMenu();
    });
    return ctxMenuEl;
}

function hideCtxMenu() {
    hidePrimitiveFlyout();
    if (ctxMenuEl) {
        resetMenuScrollStyles(ctxMenuEl);
        ctxMenuEl.style.display = 'none';
    }
}

function showCtxMenu(x, y, obj, li) {
    hideAddPrimitiveMenu();
    const menu = getOrCreateCtxMenu();
    menu.innerHTML = '';

    // --- Rename ---
    const renameItem = document.createElement('div');
    renameItem.className = 'outliner-ctx-item';
    renameItem.textContent = 'Rename';
    renameItem.addEventListener('click', () => {
        hideCtxMenu();
        startInlineRename(li, obj);
    });
    menu.appendChild(renameItem);

    // Separator
    const sep = document.createElement('div');
    sep.className = 'outliner-ctx-sep';
    menu.appendChild(sep);

    // --- Hide / Show ---
    const hideShowItem = document.createElement('div');
    hideShowItem.className = 'outliner-ctx-item';
    hideShowItem.textContent = obj.visible ? 'Hide' : 'Show';
    hideShowItem.addEventListener('click', () => {
        hideCtxMenu();
        if (onToggleVisibility) {
            const isMulti = groupHighlightNodes.size > 1 && groupHighlightNodes.has(li);
            if (isMulti) {
                groupHighlightNodes.forEach(selLi => {
                    const selObj = domToObject.get(selLi);
                    if (selObj) onToggleVisibility(selObj);
                });
            } else {
                onToggleVisibility(obj);
            }
        }
    });
    menu.appendChild(hideShowItem);

    // --- Lock / Unlock selection (viewport) ---
    const lockItem = document.createElement('div');
    lockItem.className = 'outliner-ctx-item';
    const isPickable = obj.userData?.selectable !== false;
    lockItem.textContent = isPickable ? 'Lock selection' : 'Unlock selection';
    lockItem.addEventListener('click', () => {
        hideCtxMenu();
        if (onToggleSelectable) {
            const isMulti = groupHighlightNodes.size > 1 && groupHighlightNodes.has(li);
            if (isMulti) {
                groupHighlightNodes.forEach(selLi => {
                    const selObj = domToObject.get(selLi);
                    if (selObj) onToggleSelectable(selObj);
                });
            } else {
                onToggleSelectable(obj);
            }
        }
    });
    menu.appendChild(lockItem);

    // --- Hide others ---
    const hideOthersItem = document.createElement('div');
    hideOthersItem.className = 'outliner-ctx-item';
    hideOthersItem.textContent = 'Hide others';
    hideOthersItem.addEventListener('click', () => {
        hideCtxMenu();
        if (onHideOthers) onHideOthers(obj);
    });
    menu.appendChild(hideOthersItem);

    // --- Show all ---
    const showAllItem = document.createElement('div');
    showAllItem.className = 'outliner-ctx-item';
    showAllItem.textContent = 'Show all';
    showAllItem.addEventListener('click', () => {
        hideCtxMenu();
        if (onShowAll) onShowAll();
    });
    menu.appendChild(showAllItem);

    // Separator
    const sepVis = document.createElement('div');
    sepVis.className = 'outliner-ctx-sep';
    menu.appendChild(sepVis);

    // --- Expand all ---
    const expandItem = document.createElement('div');
    expandItem.className = 'outliner-ctx-item';
    expandItem.textContent = 'Expand all';
    expandItem.addEventListener('click', () => {
        hideCtxMenu();
        expandSubtree(li, obj, getDepth(li));
    });
    menu.appendChild(expandItem);

    // --- Collapse all ---
    const collapseItem = document.createElement('div');
    collapseItem.className = 'outliner-ctx-item';
    collapseItem.textContent = 'Collapse all';
    collapseItem.addEventListener('click', () => {
        hideCtxMenu();
        collapseSubtree(li);
    });
    menu.appendChild(collapseItem);

    // Separator
    const sep2 = document.createElement('div');
    sep2.className = 'outliner-ctx-sep';
    menu.appendChild(sep2);

    // --- Add to selection ---
    const addSelItem = document.createElement('div');
    addSelItem.className = 'outliner-ctx-item';
    addSelItem.textContent = 'Add to selection';
    addSelItem.addEventListener('click', () => {
        hideCtxMenu();
        if (onGroupAdd) onGroupAdd(obj);
    });
    menu.appendChild(addSelItem);

    // --- Remove from selection ---
    const remSelItem = document.createElement('div');
    remSelItem.className = 'outliner-ctx-item';
    remSelItem.textContent = 'Remove from selection';
    remSelItem.addEventListener('click', () => {
        hideCtxMenu();
        if (onGroupRemove) onGroupRemove(obj);
    });
    menu.appendChild(remSelItem);

    // --- Select all children ---
    const selChildrenItem = document.createElement('div');
    selChildrenItem.className = 'outliner-ctx-item';
    selChildrenItem.textContent = 'Select children';
    selChildrenItem.addEventListener('click', () => {
        hideCtxMenu();
        if (onGroupAdd) {
            // Snapshot first — attach() reparents each child (mutates live children array)
            getOutlinerChildren(obj).forEach(child => onGroupAdd(child));
        }
    });
    menu.appendChild(selChildrenItem);

    // Separator
    const sep3 = document.createElement('div');
    sep3.className = 'outliner-ctx-sep';
    menu.appendChild(sep3);

    // --- Sort children (first level) ---
    if (getOutlinerChildren(obj).length > 1) {
        const sortItem = document.createElement('div');
        sortItem.className = 'outliner-ctx-item';
        sortItem.textContent = 'Sort children A→Z';
        sortItem.addEventListener('click', () => {
            hideCtxMenu();
            if (onSortChildren) onSortChildren(obj, false, false);
        });
        menu.appendChild(sortItem);

        // --- Sort all children (recursive) ---
        const sortAllItem = document.createElement('div');
        sortAllItem.className = 'outliner-ctx-item';
        sortAllItem.textContent = 'Sort all children A→Z';
        sortAllItem.addEventListener('click', () => {
            hideCtxMenu();
            if (onSortChildren) onSortChildren(obj, true, false);
        });
        menu.appendChild(sortAllItem);

        // --- Sort children (Z→A) ---
        const sortDescItem = document.createElement('div');
        sortDescItem.className = 'outliner-ctx-item';
        sortDescItem.textContent = 'Sort children Z→A';
        sortDescItem.addEventListener('click', () => {
            hideCtxMenu();
            if (onSortChildren) onSortChildren(obj, false, true);
        });
        menu.appendChild(sortDescItem);

        // --- Sort all children Z→A (recursive) ---
        const sortAllDescItem = document.createElement('div');
        sortAllDescItem.className = 'outliner-ctx-item';
        sortAllDescItem.textContent = 'Sort all children Z→A';
        sortAllDescItem.addEventListener('click', () => {
            hideCtxMenu();
            if (onSortChildren) onSortChildren(obj, true, true);
        });
        menu.appendChild(sortAllDescItem);

        const sep3b = document.createElement('div');
        sep3b.className = 'outliner-ctx-sep';
        menu.appendChild(sep3b);
    }

    // --- Add empty Object3D child ---
    const addObj3DItem = document.createElement('div');
    addObj3DItem.className = 'outliner-ctx-item';
    addObj3DItem.textContent = 'Add empty Object3D';
    addObj3DItem.addEventListener('click', () => {
        hideCtxMenu();
        if (onAddObject3D) onAddObject3D(obj);
    });
    menu.appendChild(addObj3DItem);

    // --- Add parametric primitives (submenu) ---
    if (onAddPrimitive) {
        appendAddPrimitiveSubmenu(menu, obj);
    }

    // --- Clone ---
    const cloneItem = document.createElement('div');
    cloneItem.className = 'outliner-ctx-item';
    cloneItem.textContent = 'Clone';
    cloneItem.addEventListener('click', () => {
        hideCtxMenu();
        if (onCloneObject) onCloneObject(obj);
    });
    menu.appendChild(cloneItem);

    // Separator
    const sepClone = document.createElement('div');
    sepClone.className = 'outliner-ctx-sep';
    menu.appendChild(sepClone);

    // --- Promote to root (only for nested objects) ---
    if (!lastLoadedModels.includes(obj)) {
        const promoteItem = document.createElement('div');
        promoteItem.className = 'outliner-ctx-item outliner-ctx-danger';
        promoteItem.textContent = 'Promote to root';
        promoteItem.addEventListener('click', () => {
            hideCtxMenu();
            if (onPromoteToRoot) onPromoteToRoot(obj);
        });
        menu.appendChild(promoteItem);
    }

    // --- Remove ---
    const removeItem = document.createElement('div');
    removeItem.className = 'outliner-ctx-item outliner-ctx-danger';
    removeItem.textContent = 'Remove';
    removeItem.addEventListener('click', () => {
        hideCtxMenu();
        if (onRemove) {
            const isMulti = groupHighlightNodes.size > 1 && groupHighlightNodes.has(li);
            if (isMulti) {
                const selectedObjs = Array.from(groupHighlightNodes).map(selLi => domToObject.get(selLi)).filter(Boolean);
                const groupObjs = onGetGroupSelection ? onGetGroupSelection() : [];
                const isFullGroup = groupObjs.length > 0
                    && selectedObjs.length === groupObjs.length
                    && selectedObjs.every(o => groupObjs.includes(o));
                if (!confirm(`Do you really want to permanently remove ${selectedObjs.length} objects?`)) return;
                if (isFullGroup && onRemoveGroup) {
                    onRemoveGroup();
                } else {
                    selectedObjs.forEach(selObj => onRemove(selObj, true));
                }
            } else {
                onRemove(obj);
            }
        }
    });
    menu.appendChild(removeItem);

    positionFixedMenu(menu, x, y);
}

function hideAddPrimitiveMenu() {
    if (!addPrimitiveMenuEl) return;
    resetMenuScrollStyles(addPrimitiveMenuEl);
    addPrimitiveMenuEl.style.display = 'none';
}

function ensureAddPrimitiveMenu() {
    if (addPrimitiveMenuEl) return addPrimitiveMenuEl;
    addPrimitiveMenuEl = document.createElement('div');
    addPrimitiveMenuEl.className = 'outliner-ctx-menu outliner-add-menu';
    addPrimitiveMenuEl.style.display = 'none';

    PRIMITIVE_TYPES.forEach(([type, label]) => {
        const item = document.createElement('div');
        item.className = 'outliner-ctx-item';
        item.textContent = label;
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            hideAddPrimitiveMenu();
            if (onAddPrimitive) onAddPrimitive(type, null);
        });
        addPrimitiveMenuEl.appendChild(item);
    });

    document.body.appendChild(addPrimitiveMenuEl);
    document.addEventListener('click', (e) => {
        if (addPrimitiveMenuEl && addPrimitiveMenuEl.style.display !== 'none') {
            if (!addPrimitiveMenuEl.contains(e.target) && e.target !== addBtnEl) {
                hideAddPrimitiveMenu();
            }
        }
    });
    return addPrimitiveMenuEl;
}

function showAddPrimitiveMenu(anchorEl) {
    if (!onAddPrimitive) return;
    hideCtxMenu();
    const menu = ensureAddPrimitiveMenu();
    const rect = anchorEl.getBoundingClientRect();
    positionFixedMenu(menu, rect.left, rect.bottom + 2);
}

// -------------------------------------------------------------------
// Inline rename
// -------------------------------------------------------------------

function startInlineRename(li, obj) {
    const labelEl = li.querySelector(':scope > .outliner-row > .outliner-label');
    if (!labelEl) return;

    const original = obj.name || '';
    const input = document.createElement('input');
    input.className = 'outliner-inline-rename';
    input.value = original;
    input.style.width = Math.max(labelEl.offsetWidth, 80) + 'px';

    // Replace label with input
    labelEl.replaceWith(input);
    input.focus();
    input.select();

    function commit() {
        const newName = input.value.trim() || original;
        input.replaceWith(labelEl);

        // Multi-selection: rename all selected items with the same name
        const isMulti = groupHighlightNodes.size > 1 && groupHighlightNodes.has(li);
        if (isMulti) {
            groupHighlightNodes.forEach(selLi => {
                const selObj = domToObject.get(selLi);
                if (!selObj) return;
                selObj.name = newName;
                const selLabel = selLi.querySelector(':scope > .outliner-row > .outliner-label');
                if (selLabel) selLabel.textContent = getDisplayName(selObj);
            });
        } else {
            obj.name = newName;
            labelEl.textContent = getDisplayName(obj);
        }
    }

    function cancel() {
        input.replaceWith(labelEl);
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter')  { e.stopPropagation(); commit(); }
        if (e.key === 'Escape') { e.stopPropagation(); cancel(); }
    });
    input.addEventListener('blur', commit);
}

// Drag & Drop state
let _draggedObj = null;
let _draggedObjs = null; // all group-selected objects when dragging with multi-select
let _dragOverLi = null;
let _dragOverPos = null; // 'before' | 'into' | 'after'
let _lastDragEndTime = 0; // Timestamp of last dragend – blocks spurious post-drag clicks

// WeakMap: DOM <li> → Object3D
const domToObject = new WeakMap();
// WeakMap: Object3D → DOM <li>
const objectToDom = new WeakMap();

// Currently highlighted node in the tree (matches viewport selection)
let activeTreeNode = null;

// Set of <li> nodes highlighted as group members
const groupHighlightNodes = new Set();

// Last loaded models (needed to rebuild after filter is cleared)
let lastLoadedModels = [];
// Search input elements
let searchInputEl = null;
let clearBtnEl = null;
let selectBtnEl = null;
let renameBtnEl = null;
let currentMatchSet = new Set();

/** When false, section mesh nodes are hidden from the outliner tree. */
let showAuxiliaryObjects = false;

function isOutlinerAuxiliaryNode(obj) {
    return !!obj.isSectionMesh;
}

function getOutlinerChildren(obj) {
    if (showAuxiliaryObjects) return obj.children;
    return obj.children.filter(child => !isOutlinerAuxiliaryNode(child));
}

// -------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------

/**
 * Create the outliner DOM (panel + resize handle). Call once at startup.
 * @param {{ onSelect: Function, onToggleVisibility: Function }} callbacks
 * @returns {HTMLDivElement} the panel element (for guiWrapper hit-testing)
 */
export function initOutliner({ onSelect, onToggleVisibility: onVis, onToggleSelectable: onSel, onGroupAdd: onGroupAddCb, onGroupRemove: onGroupRemoveCb, onHideOthers: onHideOthersCb, onShowAll: onShowAllCb, onReparent: onReparentCb, onRemove: onRemoveCb, onRemoveGroup: onRemoveGroupCb, onGetGroupSelection: onGetGroupSelectionCb, onSortChildren: onSortChildrenCb, onCloneObject: onCloneObjectCb, onAddObject3D: onAddObject3DCb, onAddPrimitive: onAddPrimitiveCb, onPromoteToRoot: onPromoteToRootCb }) {
    onSelectObject = onSelect;
    onToggleVisibility = onVis;
    onToggleSelectable = onSel || null;
    onGroupAdd = onGroupAddCb || null;
    onGroupRemove = onGroupRemoveCb || null;
    onHideOthers = onHideOthersCb || null;
    onShowAll = onShowAllCb || null;
    onReparent = onReparentCb || null;
    onRemove = onRemoveCb || null;
    onRemoveGroup = onRemoveGroupCb || null;
    onGetGroupSelection = onGetGroupSelectionCb || null;
    onSortChildren = onSortChildrenCb || null;
    onCloneObject = onCloneObjectCb || null;
    onAddObject3D = onAddObject3DCb || null;
    onAddPrimitive = onAddPrimitiveCb || null;
    onPromoteToRoot = onPromoteToRootCb || null;

    // --- Panel container ---
    panelEl = document.createElement('div');
    panelEl.id = 'outliner-panel';
    panelEl.classList.add('outliner-closed');

    // Header
    const header = document.createElement('div');
    header.className = 'outliner-header';
    header.textContent = 'Scene';
    panelEl.appendChild(header);

    // Search bar
    const searchBar = document.createElement('div');
    searchBar.className = 'outliner-search';
    searchInputEl = document.createElement('input');
    searchInputEl.type = 'text';
    searchInputEl.placeholder = 'Search… (wildcard*)';
    searchInputEl.className = 'outliner-search-input';
    searchInputEl.addEventListener('input', () => {
        filterTree(searchInputEl.value);
        const hasVal = !!searchInputEl.value;
        clearBtnEl.style.display = hasVal ? 'flex' : 'none';
        selectBtnEl.style.display = hasVal ? 'flex' : 'none';
    });
    clearBtnEl = document.createElement('button');
    clearBtnEl.className = 'outliner-search-clear';
    clearBtnEl.textContent = '×';
    clearBtnEl.style.display = 'none';
    clearBtnEl.title = 'Clear filter';
    clearBtnEl.addEventListener('click', () => {
        searchInputEl.value = '';
        filterTree('');
        clearBtnEl.style.display = 'none';
        selectBtnEl.style.display = 'none';
    });
    selectBtnEl = document.createElement('button');
    selectBtnEl.className = 'outliner-search-select';
    selectBtnEl.textContent = '\u2714';
    selectBtnEl.style.display = 'none';
    selectBtnEl.title = 'Select all matching objects';
    selectBtnEl.addEventListener('click', () => {
        if (!onGroupAdd || currentMatchSet.size === 0) return;
        for (const obj of currentMatchSet) {
            onGroupAdd(obj);
        }
    });
    renameBtnEl = document.createElement('button');
    renameBtnEl.className = 'outliner-search-rename';
    renameBtnEl.textContent = '\u270E';
    renameBtnEl.title = 'Bulk rename';
    renameBtnEl.addEventListener('click', openRenameDialog);
    addBtnEl = document.createElement('button');
    addBtnEl.className = 'outliner-search-add';
    addBtnEl.textContent = '+';
    addBtnEl.title = 'Add primitive (child of selection or new root)';
    addBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (addPrimitiveMenuEl && addPrimitiveMenuEl.style.display !== 'none') {
            hideAddPrimitiveMenu();
        } else {
            showAddPrimitiveMenu(addBtnEl);
        }
    });
    searchBar.appendChild(addBtnEl);
    searchBar.appendChild(searchInputEl);
    searchBar.appendChild(clearBtnEl);
    searchBar.appendChild(selectBtnEl);
    searchBar.appendChild(renameBtnEl);
    panelEl.appendChild(searchBar);

    // Scrollable tree area
    treeEl = document.createElement('ul');
    treeEl.className = 'outliner-tree';
    panelEl.appendChild(treeEl);

    // Clear drop indicators when drag leaves the tree panel entirely
    treeEl.addEventListener('dragleave', (e) => {
        if (!treeEl.contains(e.relatedTarget)) {
            clearDropIndicators();
            _dragOverLi = null;
            _dragOverPos = null;
        }
    });

    // --- Resize handle (right edge) ---
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'outliner-resize';
    panelEl.appendChild(resizeHandle);
    setupResize(resizeHandle);

    document.body.appendChild(panelEl);
    return panelEl;
}

/**
 * Toggle the outliner panel open/closed.
 * @returns {boolean} new open state
 */
export function toggleOutliner() {
    // Ignore calls fired within 300 ms of a drag end (spurious post-drag click)
    if (Date.now() - _lastDragEndTime < 300) return isOpen;
    isOpen = !isOpen;
    panelEl.classList.toggle('outliner-closed', !isOpen);
    return isOpen;
}

/** @returns {boolean} */
export function isOutlinerOpen() {
    return isOpen;
}

/**
 * Rebuild the entire tree from loadedModels array.
 * @param {Array<import('three').Object3D>} loadedModels
 */
export function rebuildTree(loadedModels, preserveExpanded = false) {
    lastLoadedModels = loadedModels;
    if (_onTreeRebuild) _onTreeRebuild();
    if (!treeEl) return;
    // Optionally save expanded state and scroll before destroying DOM
    const scrollTop = preserveExpanded ? treeEl.scrollTop : 0;
    const expandedUUIDs = preserveExpanded ? collectExpandedUUIDs() : null;
    // Reset search input when rebuilding from outside (new model loaded)
    if (!preserveExpanded && searchInputEl && searchInputEl.value) {
        searchInputEl.value = '';
        if (clearBtnEl) clearBtnEl.style.display = 'none';
        if (selectBtnEl) selectBtnEl.style.display = 'none';
    }
    treeEl.innerHTML = '';
    objectToDom.clear = clearWeakMapViaTree; // WeakMap has no clear — we just rebuild
    activeTreeNode = null;

    for (const root of loadedModels) {
        const li = createTreeNode(root, 0);
        treeEl.appendChild(li);
    }

    if (expandedUUIDs && expandedUUIDs.size > 0) {
        restoreExpandedUUIDs(expandedUUIDs);
    }
    if (preserveExpanded) {
        treeEl.scrollTop = scrollTop;
    }
}

/**
 * Toggle whether auxiliary view objects (e.g. section mesh) appear in the outliner.
 * @param {boolean} value
 */
export function setShowAuxiliaryObjects(value) {
    if (showAuxiliaryObjects === value) return;
    showAuxiliaryObjects = !!value;
    if (lastLoadedModels.length > 0) {
        rebuildTree(lastLoadedModels, true);
    }
}

/**
 * Highlight a node in the tree that matches the given Object3D.
 * @param {import('three').Object3D|null} object
 * @param {{ scroll?: boolean }} [options]
 */
export function highlightObject(object, options = {}) {
    const scroll = options.scroll !== false;
    if (activeTreeNode) {
        activeTreeNode.classList.remove('outliner-selected');
    }
    activeTreeNode = null;

    if (!object) return;

    // Build path from root to target object
    const path = [];
    let cur = object;
    while (cur) {
        path.unshift(cur);
        cur = cur.parent;
    }

    // Walk the path and ensure each ANCESTOR level is expanded / DOM-created
    // Skip the last element (the target itself) — only expand parents
    for (let i = 0; i < path.length - 1; i++) {
        const obj = path[i];
        const li = objectToDom.get(obj);
        if (!li) continue;
        // Expand this node if it has a collapsed children list
        const childList = li.querySelector(':scope > .outliner-children');
        if (childList && childList.style.display === 'none') {
            toggleExpand(li, obj, getDepth(li));
        }
    }

    // Now the target should have a DOM node
    const targetLi = objectToDom.get(object);
    if (targetLi) {
        targetLi.classList.add('outliner-selected');
        activeTreeNode = targetLi;
        if (scroll) {
            targetLi.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }
}

/**
 * Aktualizuje pozici navigace (activeTreeNode) bez CSS zvýraznění.
 * Používá se při Ctrl+šipka – objekt se přidává/odebírá ze skupiny.
 * @param {import('three').Object3D} object
 */
export function setNavigationPosition(object) {
    if (activeTreeNode) activeTreeNode.classList.remove('outliner-selected');
    activeTreeNode = null;
    if (!object) return;
    // Rozbal rodiče stejně jako highlightObject
    const path = [];
    let cur = object;
    while (cur) { path.unshift(cur); cur = cur.parent; }
    for (let i = 0; i < path.length - 1; i++) {
        const o = path[i];
        const li = objectToDom.get(o);
        if (!li) continue;
        const childList = li.querySelector(':scope > .outliner-children');
        if (childList && childList.style.display === 'none') toggleExpand(li, o, getDepth(li));
    }
    const targetLi = objectToDom.get(object);
    if (targetLi) {
        activeTreeNode = targetLi;
        targetLi.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

/**
 * Update the visibility icon for a specific object.
 * @param {import('three').Object3D} object
 */
export function updateVisibilityIcon(object) {
    const li = objectToDom.get(object);
    if (!li) return;
    const eyeBtn = li.querySelector(':scope > .outliner-row > .outliner-eye');
    if (eyeBtn) {
        eyeBtn.textContent = object.visible ? '👁' : '🚫';
        eyeBtn.title = object.visible ? 'Hide' : 'Show';
    }
}

/**
 * Update the selection-lock icon for a specific object.
 * @param {import('three').Object3D} object
 */
export function updateSelectableIcon(object) {
    const li = objectToDom.get(object);
    if (!li) return;
    const lockBtn = li.querySelector(':scope > .outliner-row > .outliner-selectable');
    if (lockBtn) {
        const pickable = object.userData?.selectable !== false;
        lockBtn.textContent = pickable ? '👆' : '🛑';
        lockBtn.title = pickable ? 'Lock selection (viewport)' : 'Unlock selection (viewport)';
    }
}

/**
 * Navigate the outliner selection up or down through the currently visible nodes.
 * Returns the Object3D that should become selected, or null if nothing to navigate to.
 * @param {'up'|'down'} direction
 * @returns {import('three').Object3D|null}
 */
export function navigateOutliner(direction) {
    if (!treeEl) return null;
    const allNodes = Array.from(treeEl.querySelectorAll('.outliner-node'));
    const visibleNodes = allNodes.filter(li => isNodeVisible(li));
    if (visibleNodes.length === 0) return null;

    let idx = activeTreeNode ? visibleNodes.indexOf(activeTreeNode) : -1;
    if (direction === 'up') {
        idx = idx <= 0 ? 0 : idx - 1;
    } else {
        idx = idx >= visibleNodes.length - 1 ? visibleNodes.length - 1 : idx + 1;
    }
    if (idx === -1) idx = 0;

    const targetLi = visibleNodes[idx];
    return domToObject.get(targetLi) || null;
}

/**
 * Check whether a tree <li> node is currently visible (not inside a collapsed container).
 * @param {HTMLLIElement} li
 * @returns {boolean}
 */
function isNodeVisible(li) {
    if (li.style && li.style.display === 'none') return false;
    let el = li.parentElement;
    while (el && el !== treeEl) {
        if (el.style && el.style.display === 'none') return false;
        el = el.parentElement;
    }
    return true;
}

/**
 * Update the label text for a specific object (e.g. after renaming).
 * @param {import('three').Object3D} object
 */
export function updateObjectLabel(object) {
    const li = objectToDom.get(object);
    if (!li) return;
    const label = li.querySelector(':scope > .outliner-row > .outliner-label');
    if (label) label.textContent = getDisplayName(object);
}

// -------------------------------------------------------------------
// Internal helpers
// -------------------------------------------------------------------

function clearWeakMapViaTree() {
    // No-op: WeakMap entries are GC'd automatically when DOM nodes are removed
}

function collectExpandedUUIDs() {
    const uuids = new Set();
    if (!treeEl) return uuids;
    treeEl.querySelectorAll('.outliner-node.outliner-expanded').forEach(li => {
        const obj = domToObject.get(li);
        if (obj) uuids.add(obj.uuid);
    });
    return uuids;
}

function restoreExpandedUUIDs(uuids) {
    function walk(ul, depth) {
        for (const li of Array.from(ul.children)) {
            if (!li.classList.contains('outliner-node')) continue;
            const obj = domToObject.get(li);
            if (!obj) continue;
            if (uuids.has(obj.uuid)) {
                const childList = li.querySelector(':scope > .outliner-children');
                const arrow = li.querySelector(':scope > .outliner-row > .outliner-arrow');
                if (childList) {
                    const outlinerChildren = getOutlinerChildren(obj);
                    if (childList.children.length === 0 && outlinerChildren.length > 0) {
                        for (const child of outlinerChildren) {
                            childList.appendChild(createTreeNode(child, depth + 1));
                        }
                    }
                    childList.style.display = '';
                    if (arrow) arrow.textContent = '▼';
                    li.classList.add('outliner-expanded');
                    walk(childList, depth + 1);
                }
            }
        }
    }
    walk(treeEl, 0);
}

function clearDropIndicators() {
    if (_dragOverLi) {
        _dragOverLi.classList.remove('outliner-drop-before', 'outliner-drop-into', 'outliner-drop-after');
    }
}

/**
 * Create a single <li> tree node for an Object3D.
 * Children are created lazily on first expand.
 */
function createTreeNode(obj, depth) {
    const li = document.createElement('li');
    li.className = 'outliner-node';
    domToObject.set(li, obj);
    objectToDom.set(obj, li);

    const hasChildren = getOutlinerChildren(obj).length > 0;

    // Row container
    const row = document.createElement('div');
    row.className = 'outliner-row';
    row.style.paddingLeft = (depth * 16 + 4) + 'px';
    row.draggable = true;

    // 1) Expand/collapse arrow
    const arrow = document.createElement('span');
    arrow.className = 'outliner-arrow';
    if (hasChildren) {
        arrow.textContent = '▶';
        arrow.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleExpand(li, obj, depth);
        });
    } else {
        arrow.textContent = ' ';
        arrow.style.visibility = 'hidden';
    }
    row.appendChild(arrow);

    // 2) Name label
    const label = document.createElement('span');
    label.className = 'outliner-label';
    label.textContent = getDisplayName(obj);
    label.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.ctrlKey && onGroupAdd) {
            onGroupAdd(obj);
            if (activeTreeNode) activeTreeNode.classList.remove('outliner-selected'); // vyčisti předchozí
            activeTreeNode = li; // aktualizuj pozici pro navigaci šipkami (bez CSS zvýraznění)
        } else if (onSelectObject) {
            onSelectObject(obj);
        }
    });
    row.appendChild(label);

    // 3) Selection lock (viewport pick)
    const lock = document.createElement('span');
    lock.className = 'outliner-selectable';
    const pickable = obj.userData?.selectable !== false;
    lock.textContent = pickable ? '👆' : '🛑';
    lock.title = pickable ? 'Lock selection (viewport)' : 'Unlock selection (viewport)';
    lock.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onToggleSelectable) {
            const isMulti = groupHighlightNodes.size > 1 && groupHighlightNodes.has(li);
            if (isMulti) {
                groupHighlightNodes.forEach(selLi => {
                    const selObj = domToObject.get(selLi);
                    if (selObj) onToggleSelectable(selObj);
                });
            } else {
                onToggleSelectable(obj);
            }
        }
    });
    row.appendChild(lock);

    // 4) Visibility eye
    const eye = document.createElement('span');
    eye.className = 'outliner-eye';
    eye.textContent = obj.visible ? '👁' : '🚫';
    eye.title = obj.visible ? 'Hide' : 'Show';
    eye.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onToggleVisibility) {
            const isMulti = groupHighlightNodes.size > 1 && groupHighlightNodes.has(li);
            if (isMulti) {
                groupHighlightNodes.forEach(selLi => {
                    const selObj = domToObject.get(selLi);
                    if (selObj) onToggleVisibility(selObj);
                });
            } else {
                onToggleVisibility(obj);
            }
        }
    });
    row.appendChild(eye);

    li.appendChild(row);

    // --- Drag & Drop ---
    row.addEventListener('dragstart', (e) => {
        _draggedObj = obj;
        // If this node is part of the group selection, drag all group members together
        if (groupHighlightNodes.has(li)) {
            _draggedObjs = Array.from(groupHighlightNodes)
                .map(n => domToObject.get(n))
                .filter(Boolean);
        } else {
            _draggedObjs = null;
        }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ''); // required for Firefox
        li.classList.add('outliner-drag-source');
    });

    row.addEventListener('dragend', () => {
        _lastDragEndTime = Date.now();
        li.classList.remove('outliner-drag-source');
        clearDropIndicators();
        _draggedObj = null;
        _draggedObjs = null;
        _dragOverLi = null;
        _dragOverPos = null;
    });

    row.addEventListener('dragover', (e) => {
        if (!_draggedObj || _draggedObj === obj) return;
        // When group-dragging, skip if hovered item is one of the dragged objects
        if (_draggedObjs && _draggedObjs.includes(obj)) return;
        // Prevent dropping onto own descendant of any dragged object
        let cur = obj;
        const isDragged = (n) => _draggedObjs ? _draggedObjs.includes(n) : n === _draggedObj;
        while (cur) { if (isDragged(cur)) return; cur = cur.parent; }
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = row.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const h = rect.height;
        const pos = y < h * 0.25 ? 'before' : y > h * 0.75 ? 'after' : 'into';
        if (_dragOverLi !== li || _dragOverPos !== pos) {
            clearDropIndicators();
            _dragOverLi = li;
            _dragOverPos = pos;
            li.classList.add('outliner-drop-' + pos);
        }
    });

    row.addEventListener('drop', (e) => {
        e.preventDefault();
        const source = _draggedObj;
        const sources = _draggedObjs || [source];
        const target = _dragOverLi ? domToObject.get(_dragOverLi) : null;
        const pos = _dragOverPos;
        clearDropIndicators();
        _dragOverLi = null;
        _dragOverPos = null;
        if (!source || !target || source === target) return;
        if (onReparent) onReparent(sources, target, pos);
    });

    // --- Context menu (right-click + touch long-press) ---
    row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showCtxMenu(e.clientX, e.clientY, obj, li);
    });

    // Long-press on touch devices (500 ms threshold)
    let _longPressTimer = null;
    row.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        _longPressTimer = setTimeout(() => {
            _longPressTimer = null;
            showCtxMenu(touch.clientX, touch.clientY, obj, li);
        }, 500);
    }, { passive: true });
    const _cancelLongPress = () => {
        if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
    };
    row.addEventListener('touchend',    _cancelLongPress, { passive: true });
    row.addEventListener('touchcancel', _cancelLongPress, { passive: true });
    row.addEventListener('touchmove',   _cancelLongPress, { passive: true });

    // Children container (lazy — not populated yet)
    if (hasChildren) {
        const childList = document.createElement('ul');
        childList.className = 'outliner-children';
        childList.style.display = 'none';
        li.appendChild(childList);
    }

    return li;
}

/** Recursively expand all nodes in the subtree rooted at li/obj. */
function expandSubtree(li, obj, depth) {
    const childList = li.querySelector(':scope > .outliner-children');
    const arrow = li.querySelector(':scope > .outliner-row > .outliner-arrow');
    if (!childList) return;
    // Lazy-populate if needed
    const outlinerChildren = getOutlinerChildren(obj);
    if (childList.children.length === 0 && outlinerChildren.length > 0) {
        for (const child of outlinerChildren) {
            childList.appendChild(createTreeNode(child, depth + 1));
        }
    }
    childList.style.display = '';
    if (arrow) arrow.textContent = '▼';
    li.classList.add('outliner-expanded');
    // Recurse into children
    for (const child of outlinerChildren) {
        const childLi = objectToDom.get(child);
        if (childLi) expandSubtree(childLi, child, depth + 1);
    }
}

/** Recursively collapse all nodes in the subtree rooted at li. */
function collapseSubtree(li) {
    const childList = li.querySelector(':scope > .outliner-children');
    const arrow = li.querySelector(':scope > .outliner-row > .outliner-arrow');
    if (!childList) return;
    // Collapse children first (post-order)
    for (const childLi of Array.from(childList.querySelectorAll('.outliner-node'))) {
        const childChildList = childLi.querySelector(':scope > .outliner-children');
        const childArrow = childLi.querySelector(':scope > .outliner-row > .outliner-arrow');
        if (childChildList) childChildList.style.display = 'none';
        if (childArrow) childArrow.textContent = '▶';
        childLi.classList.remove('outliner-expanded');
    }
    childList.style.display = 'none';
    if (arrow) arrow.textContent = '▶';
    li.classList.remove('outliner-expanded');
}

function toggleExpand(li, obj, depth) {
    const childList = li.querySelector(':scope > .outliner-children');
    const arrow = li.querySelector(':scope > .outliner-row > .outliner-arrow');
    if (!childList) return;

    const isExpanded = childList.style.display !== 'none';

    if (isExpanded) {
        childList.style.display = 'none';
        arrow.textContent = '▶';
        li.classList.remove('outliner-expanded');
    } else {
        // Lazy create children on first expand
        const outlinerChildren = getOutlinerChildren(obj);
        if (childList.children.length === 0 && outlinerChildren.length > 0) {
            for (const child of outlinerChildren) {
                childList.appendChild(createTreeNode(child, depth + 1));
            }
        }
        childList.style.display = '';
        arrow.textContent = '▼';
        li.classList.add('outliner-expanded');
    }
}

function expandParents(li) {
    let parent = li.parentElement;
    while (parent && parent !== treeEl) {
        if (parent.tagName === 'LI' && parent.classList.contains('outliner-node')) {
            const childList = parent.querySelector(':scope > .outliner-children');
            const arrow = parent.querySelector(':scope > .outliner-row > .outliner-arrow');
            if (childList && childList.style.display === 'none') {
                // Lazy populate if needed
                const obj = domToObject.get(parent);
                if (obj && childList.children.length === 0) {
                    const depth = getDepth(parent);
                    for (const child of getOutlinerChildren(obj)) {
                        childList.appendChild(createTreeNode(child, depth + 1));
                    }
                }
                childList.style.display = '';
                if (arrow) arrow.textContent = '▼';
                parent.classList.add('outliner-expanded');
            }
        }
        parent = parent.parentElement;
    }
}

function getDepth(li) {
    let depth = 0;
    let el = li.parentElement;
    while (el && el !== treeEl) {
        if (el.tagName === 'UL' && el.classList.contains('outliner-children')) depth++;
        el = el.parentElement;
    }
    return depth;
}

function getDisplayName(obj) {
    if (obj.name) return obj.name;
    if (obj.isMesh) return `Mesh`;
    if (obj.isGroup) return `Group`;
    return `Object3D`;
}

/**
 * Highlight all objects in the group in the outliner tree.
 * @param {Array<import('three').Object3D>} objects
 */
export function highlightGroupObjects(objects) {
    groupHighlightNodes.forEach(li => li.classList.remove('outliner-group-member'));
    groupHighlightNodes.clear();
    if (!objects || objects.length === 0) return;
    for (const obj of objects) {
        const li = objectToDom.get(obj);
        if (li) {
            li.classList.add('outliner-group-member');
            groupHighlightNodes.add(li);
        }
    }
}

/**
 * Clear all group member highlights in the outliner.
 */
export function clearGroupHighlights() {
    groupHighlightNodes.forEach(li => li.classList.remove('outliner-group-member'));
    groupHighlightNodes.clear();
}

// -------------------------------------------------------------------
// Search / filter helpers
// -------------------------------------------------------------------

/**
 * Convert a wildcard pattern to a RegExp.
 * Without wildcards (* ?): substring match.
 * With wildcards: anchored full-name match.
 */
function wildcardToRegex(pattern) {
    const trimmed = pattern.trim();
    const hasWildcard = trimmed.includes('*') || trimmed.includes('?');
    const escaped = trimmed.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    if (hasWildcard) {
        const regexStr = escaped.replace(/\*/g, '.*').replace(/\?/g, '.');
        return new RegExp('^' + regexStr + '$', 'i');
    }
    return new RegExp(escaped, 'i');
}

/**
 * Recursively determine which objects should be visible.
 * An object is visible if its own name matches OR any descendant matches.
 * Returns true if obj itself or any descendant is in the visible set.
 */
function computeVisibleSet(obj, regex, visibleSet, matchSet) {
    const selfMatch = regex.test(getDisplayName(obj));
    if (selfMatch && matchSet) matchSet.add(obj);
    let anyChildMatch = false;
    for (const child of getOutlinerChildren(obj)) {
        if (computeVisibleSet(child, regex, visibleSet, matchSet)) anyChildMatch = true;
    }
    const visible = selfMatch || anyChildMatch;
    if (visible) visibleSet.add(obj);
    return visible;
}

/**
 * Apply DOM visibility based on visibleSet.
 * Lazily populates children of visible nodes so deep matches are reachable.
 */
function applyFilterVisibility(obj, visibleSet, depth) {
    const li = objectToDom.get(obj);
    if (!li) return;
    if (!visibleSet.has(obj)) {
        li.style.display = 'none';
        return;
    }
    li.style.display = '';
    const outlinerChildren = getOutlinerChildren(obj);
    if (outlinerChildren.length > 0) {
        const childList = li.querySelector(':scope > .outliner-children');
        if (childList) {
            if (childList.children.length === 0) {
                for (const child of outlinerChildren) {
                    childList.appendChild(createTreeNode(child, depth + 1));
                }
            }
            childList.style.display = '';
            const arrow = li.querySelector(':scope > .outliner-row > .outliner-arrow');
            if (arrow) arrow.textContent = '\u25bc';
            for (const child of outlinerChildren) {
                applyFilterVisibility(child, visibleSet, depth + 1);
            }
        }
    }
}

/**
 * Filter the outliner tree by a wildcard pattern.
 * Empty pattern clears the filter and rebuilds the tree to its original state.
 */
function filterTree(pattern) {
    if (!treeEl || lastLoadedModels.length === 0) return;
    if (!pattern || !pattern.trim()) {
        currentMatchSet = new Set();
        const selectedObj = activeTreeNode ? domToObject.get(activeTreeNode) : null;
        rebuildTree(lastLoadedModels);
        if (selectedObj) highlightObject(selectedObj);
        return;
    }
    const regex = wildcardToRegex(pattern);
    const visibleSet = new Set();
    currentMatchSet = new Set();
    for (const root of lastLoadedModels) {
        computeVisibleSet(root, regex, visibleSet, currentMatchSet);
    }
    for (const root of lastLoadedModels) {
        applyFilterVisibility(root, visibleSet, 0);
    }

}

// -------------------------------------------------------------------
// Bulk rename dialog
// -------------------------------------------------------------------

/** Returns matched objects in DFS tree order. */
function getMatchedObjectsInOrder() {
    const result = [];
    function walk(obj) {
        if (currentMatchSet.has(obj)) result.push(obj);
        for (const child of getOutlinerChildren(obj)) walk(child);
    }
    for (const root of lastLoadedModels) walk(root);
    return result;
}

/** Open the bulk-rename modal for all currently filtered objects. */
function openRenameDialog() {
    // If no filter is active, treat all objects as matched (temporarily)
    const wasEmpty = currentMatchSet.size === 0;
    if (wasEmpty && lastLoadedModels.length > 0) {
        function walkAll(obj) {
            currentMatchSet.add(obj);
            for (const child of getOutlinerChildren(obj)) walkAll(child);
        }
        for (const root of lastLoadedModels) walkAll(root);
    }
    const objects = getMatchedObjectsInOrder();
    if (objects.length === 0) return;
    if (document.querySelector('.outliner-rename-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'outliner-rename-overlay';
    const modal = document.createElement('div');
    modal.className = 'outliner-rename-modal';
    modal.addEventListener('click', e => e.stopPropagation());

    const titleEl = document.createElement('div');
    titleEl.className = 'outliner-rename-title';
    titleEl.textContent = `Bulk Rename (${objects.length})`;
    modal.appendChild(titleEl);

    const tabs = document.createElement('div');
    tabs.className = 'outliner-rename-tabs';
    const tabFR = document.createElement('button');
    tabFR.className = 'outliner-rename-tab outliner-rename-tab-active';
    tabFR.textContent = 'Find & Replace';
    const tabFull = document.createElement('button');
    tabFull.className = 'outliner-rename-tab';
    tabFull.textContent = 'Full Rename';
    tabs.appendChild(tabFR);
    tabs.appendChild(tabFull);
    modal.appendChild(tabs);

    // Panel 1 — Find & Replace
    const panelFR = document.createElement('div');
    panelFR.className = 'outliner-rename-panel';
    const rowFind = document.createElement('div');
    rowFind.className = 'outliner-rename-row';
    const lblFind = document.createElement('label');
    lblFind.textContent = 'Find:';
    const inputFind = document.createElement('input');
    inputFind.type = 'text';
    inputFind.className = 'outliner-rename-input';
    inputFind.placeholder = 'search text';
    const btnRegex = document.createElement('button');
    btnRegex.type = 'button';
    btnRegex.className = 'outliner-rename-regex-btn';
    btnRegex.textContent = 'regexp';
    btnRegex.title = 'Regular expression';
    const matchCountEl = document.createElement('span');
    matchCountEl.className = 'outliner-rename-match-count';
    rowFind.appendChild(lblFind);
    rowFind.appendChild(inputFind);
    rowFind.appendChild(btnRegex);
    rowFind.appendChild(matchCountEl);
    const rowReplace = document.createElement('div');
    rowReplace.className = 'outliner-rename-row';
    const lblReplace = document.createElement('label');
    lblReplace.textContent = 'Replace:';
    const inputReplace = document.createElement('input');
    inputReplace.type = 'text';
    inputReplace.className = 'outliner-rename-input';
    inputReplace.placeholder = 'replacement';
    rowReplace.appendChild(lblReplace);
    rowReplace.appendChild(inputReplace);
    const hintFR = document.createElement('div');
    hintFR.className = 'outliner-rename-hint';
    hintFR.textContent = 'Capture groups in replacement: $1, $2, \u2026';
    hintFR.style.display = 'none';
    const presetDefs = [
        { label: 'remove _N',        find: '_\\d+$',          replace: '',  regex: true },
        { label: 'remove N_',        find: '^\\d+_',          replace: '',  regex: true },
        { label: 'remove (\u2026)',  find: '\\s*\\(.*?\\)', replace: '',  regex: true },
        { label: '_ \u2192 space',   find: '_',               replace: ' ', regex: false },
        { label: 'space \u2192 _',   find: ' ',               replace: '_', regex: false },
        { label: 'dup. spaces',      find: '\\s{2,}',         replace: ' ', regex: true },
        { label: 'trim',             find: '^\\s+|\\s+$',    replace: '',  regex: true },
    ];
    const rowPresets = document.createElement('div');
    rowPresets.className = 'outliner-rename-row';
    const lblPresets = document.createElement('label');
    lblPresets.textContent = 'Presets:';
    const selectPresets = document.createElement('select');
    selectPresets.className = 'outliner-rename-select';
    const optDefault = document.createElement('option');
    optDefault.value = '';
    optDefault.textContent = '\u2014 select preset \u2014';
    selectPresets.appendChild(optDefault);
    for (const preset of presetDefs) {
        const opt = document.createElement('option');
        opt.value = JSON.stringify(preset);
        opt.textContent = `${preset.label}\u2003\u2003${preset.find}`;
        selectPresets.appendChild(opt);
    }
    selectPresets.addEventListener('change', () => {
        if (!selectPresets.value) return;
        const preset = JSON.parse(selectPresets.value);
        inputFind.value = preset.find;
        inputReplace.value = preset.replace;
        if (preset.regex && !useRegex) {
            useRegex = true;
            btnRegex.classList.add('outliner-rename-regex-btn-active');
            hintFR.style.display = '';
        } else if (!preset.regex && useRegex) {
            useRegex = false;
            btnRegex.classList.remove('outliner-rename-regex-btn-active');
            hintFR.style.display = 'none';
        }
        selectPresets.value = '';
        updatePreview();
        inputReplace.focus();
    });
    rowPresets.appendChild(lblPresets);
    rowPresets.appendChild(selectPresets);
    panelFR.appendChild(rowFind);
    panelFR.appendChild(rowReplace);
    panelFR.appendChild(hintFR);
    panelFR.appendChild(rowPresets);

    // Panel 2 — Full rename
    const panelFull = document.createElement('div');
    panelFull.className = 'outliner-rename-panel';
    panelFull.style.display = 'none';
    const rowFull = document.createElement('div');
    rowFull.className = 'outliner-rename-row';
    const lblFull = document.createElement('label');
    lblFull.textContent = 'New name:';
    const inputFull = document.createElement('input');
    inputFull.type = 'text';
    inputFull.className = 'outliner-rename-input';
    inputFull.placeholder = 'name or name_{n}';
    rowFull.appendChild(lblFull);
    rowFull.appendChild(inputFull);
    const hint = document.createElement('div');
    hint.className = 'outliner-rename-hint';
    hint.textContent = 'Use {n} for numbering (1, 2, \u2026)';
    panelFull.appendChild(rowFull);
    panelFull.appendChild(hint);

    modal.appendChild(panelFR);
    modal.appendChild(panelFull);

    const previewEl = document.createElement('div');
    previewEl.className = 'outliner-rename-preview';
    modal.appendChild(previewEl);

    const btns = document.createElement('div');
    btns.className = 'outliner-rename-btns';
    const btnCancel = document.createElement('button');
    btnCancel.className = 'outliner-rename-btn';
    btnCancel.textContent = 'Cancel';
    const btnConfirm = document.createElement('button');
    btnConfirm.className = 'outliner-rename-btn outliner-rename-btn-primary';
    btnConfirm.textContent = 'Rename';
    btns.appendChild(btnCancel);
    btns.appendChild(btnConfirm);
    modal.appendChild(btns);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let mode = 'fr';
    let useRegex = false;
    btnRegex.addEventListener('click', () => {
        useRegex = !useRegex;
        btnRegex.classList.toggle('outliner-rename-regex-btn-active', useRegex);
        hintFR.style.display = useRegex ? '' : 'none';
        updatePreview();
    });
    tabFR.addEventListener('click', () => {
        mode = 'fr';
        tabFR.classList.add('outliner-rename-tab-active');
        tabFull.classList.remove('outliner-rename-tab-active');
        panelFR.style.display = '';
        panelFull.style.display = 'none';
        updatePreview();
    });
    tabFull.addEventListener('click', () => {
        mode = 'full';
        tabFull.classList.add('outliner-rename-tab-active');
        tabFR.classList.remove('outliner-rename-tab-active');
        panelFull.style.display = '';
        panelFR.style.display = 'none';
        updatePreview();
        inputFull.focus();
    });

    function computeNewName(obj, idx) {
        const orig = getDisplayName(obj);
        if (mode === 'fr') {
            const find = inputFind.value;
            if (!find) return orig;
            try {
                const regex = useRegex
                    ? new RegExp(find, 'gi')
                    : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                return orig.replace(regex, inputReplace.value);
            } catch { return orig; }
        } else {
            const pat = inputFull.value;
            if (!pat) return orig;
            return pat.replace(/\{n\}/g, String(idx + 1));
        }
    }

    function isRegexValid() {
        if (!useRegex || !inputFind.value) return true;
        try { new RegExp(inputFind.value); return true; }
        catch { return false; }
    }

    function updatePreview() {
        const valid = isRegexValid();
        inputFind.classList.toggle('outliner-rename-input-error', !valid);
        btnConfirm.disabled = !valid;
        btnConfirm.style.opacity = valid ? '' : '0.4';
        if (mode === 'fr' && inputFind.value && valid) {
            const hits = objects.filter((o, i) => computeNewName(o, i) !== getDisplayName(o)).length;
            matchCountEl.textContent = `${hits} match${hits === 1 ? '' : 'es'}`;
            matchCountEl.style.display = 'inline';
        } else {
            matchCountEl.style.display = 'none';
        }
        previewEl.innerHTML = '';
        for (let i = 0; i < objects.length; i++) {
            const row = document.createElement('div');
            row.className = 'outliner-rename-preview-row';
            const oldSpan = document.createElement('span');
            oldSpan.className = 'outliner-rename-preview-old';
            oldSpan.textContent = getDisplayName(objects[i]);
            const arrow = document.createElement('span');
            arrow.className = 'outliner-rename-preview-arrow';
            arrow.textContent = '\u2192';
            const newSpan = document.createElement('span');
            newSpan.className = 'outliner-rename-preview-new';
            newSpan.textContent = computeNewName(objects[i], i);
            row.appendChild(oldSpan);
            row.appendChild(arrow);
            row.appendChild(newSpan);
            previewEl.appendChild(row);
        }
    }

    inputFind.addEventListener('input', updatePreview);
    inputReplace.addEventListener('input', updatePreview);
    inputFull.addEventListener('input', updatePreview);
    updatePreview();

    function close() {
        document.removeEventListener('keydown', handleKey);
        if (wasEmpty) currentMatchSet = new Set();
        overlay.remove();
    }
    function handleKey(e) {
        if (e.key === 'Escape') close();
        if (e.key === 'Enter' && !e.shiftKey) btnConfirm.click();
    }
    document.addEventListener('keydown', handleKey);

    btnCancel.addEventListener('click', close);
    btnConfirm.addEventListener('click', () => {
        objects.forEach((obj, idx) => {
            const newName = computeNewName(obj, idx);
            if (newName !== getDisplayName(obj)) {
                obj.name = newName;
                updateObjectLabel(obj);
            }
        });
        close();
    });
    inputFind.focus();
}

// -------------------------------------------------------------------
// Resize logic
// -------------------------------------------------------------------

function setupResize(handle) {
    let startX, startWidth;

    function onMouseDown(e) {
        e.preventDefault();
        startX = e.clientX;
        startWidth = panelEl.offsetWidth;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    function onMouseMove(e) {
        const delta = e.clientX - startX;
        const newWidth = Math.max(180, Math.min(600, startWidth + delta));
        panelEl.style.width = newWidth + 'px';
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    function onTouchStart(e) {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        startX = e.touches[0].clientX;
        startWidth = panelEl.offsetWidth;
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    }

    function onTouchMove(e) {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        const delta = e.touches[0].clientX - startX;
        const newWidth = Math.max(180, Math.min(600, startWidth + delta));
        panelEl.style.width = newWidth + 'px';
    }

    function onTouchEnd() {
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
    }

    handle.addEventListener('mousedown', onMouseDown);
    handle.addEventListener('touchstart', onTouchStart, { passive: false });
}
