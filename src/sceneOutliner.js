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
/** @type {(() => Array<import('three').Object3D|null|undefined>)|null} */
let onGetGroupOriginalParents = null;
let onGroupRemove = null;
let onHideOthers = null;
let onShowAll = null;
let onSortChildren = null;
let onCloneObject = null;
let onAddObject3D = null;
let onAddPrimitive = null;
let onPromoteToRoot = null;
/** @type {(() => Array<{id: string, title?: string, folderId?: string|null}>)|null} */
let getDocuments = null;
/** @type {((doc: object) => string)|null} */
let getDocumentLabel = null;
/** @type {(() => Array<{id: string, name?: string, parentId?: string|null}>)|null} */
let getDocumentFolders = null;
/** @type {(() => Array<{id: string, name?: string, mimeType?: string, folderId?: string|null, comment?: string}>)|null} */
let getAttachments = null;
/** @type {((att: object) => void)|null} */
let onOpenAttachment = null;
/** @type {((mimeType: string) => boolean)|null} */
let canOpenAttachment = null;
/** @type {object} */
let fileOps = {};
/** @type {((id: string) => void)|null} */
let onOpenDocument = null;
/** @type {((id: string, name: string) => boolean)|null} */
let onRenameDocument = null;
/** @type {((id: string) => boolean)|null} */
let onDeleteDocument = null;
/** @type {((ids: string[]) => boolean)|null} */
let onDeleteDocuments = null;
/** @type {((folderId?: string|null) => object|null)|null} */
let onNewDocument = null;
/** @type {((parentId?: string|null) => object|null)|null} */
let onNewDocumentFolder = null;
/** @type {((folderId?: string|null) => void)|null} */
let onImportDocumentJson = null;
/** @type {(() => 'side'|'window')|null} */
let getDocOpenMode = null;
/** @type {((mode: 'side'|'window') => void)|null} */
let onSetDocOpenMode = null;
/** @type {(() => { showLastEditDate: boolean, showImportDate: boolean })|null} */
let getDocLabelOptions = null;
/** @type {((opts: { showLastEditDate?: boolean, showImportDate?: boolean }) => void)|null} */
let onSetDocLabelOptions = null;
/** @type {((id: string, name: string) => boolean)|null} */
let onRenameDocumentFolder = null;
/** @type {((id: string) => boolean)|null} */
let onDeleteDocumentFolder = null;
/** @type {((id: string, folderId: string|null, opts?: object) => boolean)|null} */
let onMoveDocument = null;
/** @type {((ids: string[], folderId: string|null, opts?: object) => boolean)|null} */
let onMoveDocuments = null;
/** @type {((id: string, parentId: string|null, opts?: object) => boolean)|null} */
let onMoveDocumentFolder = null;
/** @type {(() => Array<{id: number, name?: string, camera?: object|null}>)|null} */
let getArrangements = null;
/** @type {(() => number|null)|null} */
let getActiveArrangementId = null;
/** @type {(() => boolean)|null} */
let isArrangementDirty = null;
/** @type {((arrangement: object) => void)|null} */
let onApplyArrangement = null;
/** @type {(() => Array<{id: number, name?: string, steps?: Array<{name?: string, camera?: object|null}>}>)|null} */
let getSequences = null;
/** @type {(() => number|null)|null} */
let getActiveSequenceId = null;
/** @type {(() => number)|null} */
let getCurrentStepIndex = null;
/** @type {(() => boolean)|null} */
let isPlaybackDetached = null;
/** @type {((index: number) => void)|null} */
let onSelectSequence = null;
/** @type {((index: number) => void)|null} */
let onGoToAssembled = null;
/** @type {((index: number, stepIndex: number) => void)|null} */
let onGoToStep = null;

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

function startAssetInlineRename(li, original, onCommit) {
    const labelEl = li.querySelector(':scope > .outliner-row > .outliner-label');
    if (!labelEl) return;
    const originalName = original || '';
    const input = document.createElement('input');
    input.className = 'outliner-inline-rename';
    input.value = originalName;
    input.style.width = Math.max(labelEl.offsetWidth, 80) + 'px';
    labelEl.replaceWith(input);
    input.focus();
    input.select();

    let done = false;
    function finish(commitChange) {
        if (done) return;
        done = true;
        const newName = input.value.trim() || originalName;
        if (input.parentNode) input.replaceWith(labelEl);
        if (commitChange && newName && newName !== originalName) {
            onCommit(newName);
        } else {
            labelEl.textContent = originalName;
        }
    }

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.stopPropagation(); finish(true); }
        if (e.key === 'Escape') { e.stopPropagation(); finish(false); }
    });
    input.addEventListener('blur', () => finish(true));
}

// Drag & Drop state
let _draggedObj = null;
let _draggedObjs = null; // all group-selected objects when dragging with multi-select
/** @type {{ kind: 'doc'|'folder', id: string }|null} */
let _draggedDocAsset = null;
/** @type {Array<{ kind: 'doc'|'folder', id: string }>} */
let _draggedDocAssets = [];
/** @type {{ kind: 'file'|'folder', id: string }|null} */
let _draggedFileAsset = null;
/** @type {Array<{ kind: 'file'|'folder', id: string }>} */
let _draggedFileAssets = [];
let _dragOverLi = null;
let _dragOverPos = null; // 'before' | 'into' | 'after'
let _lastDragEndTime = 0; // Timestamp of last dragend – blocks spurious post-drag clicks

// WeakMap: DOM <li> → Object3D
const domToObject = new WeakMap();
// WeakMap: Object3D → DOM <li>
const objectToDom = new WeakMap();

// Currently highlighted node in the tree (matches viewport selection)
let activeTreeNode = null;
/** @type {string|null} expandId of a selected sequence Assembled/step row (survives DOM refresh) */
let selectedExpandId = null;
/** @type {Set<string>} multi-selected document ids */
const selectedDocIds = new Set();
/** @type {string|null} shift-click range anchor (document id) */
let docSelectAnchorId = null;
/** @type {Set<string>} multi-selected file ids */
const selectedFileIds = new Set();
/** @type {string|null} shift-click range anchor (file id) */
let fileSelectAnchorId = null;

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
/** Expanded node UUIDs captured when the search filter first becomes active. */
let preFilterExpandedUUIDs = null;

/** When false, overlays and tool objects are hidden from the outliner tree. */
let showAuxiliaryObjects = false;

function isOutlinerAuxiliaryNode(obj) {
    const ud = obj.userData;
    return !!obj.isSectionMesh
        || !!ud?._isEdgeOverlay
        || !!ud?._isMeasurement
        || !!ud?._isAnnotation
        || !!ud?._isAnnotation3d
        || !!ud?._isCadDim3d
        || !!ud?._isSectionSketch
        || !!ud?._isCoG;
}

/** @param {import('three').Object3D|null|undefined} obj */
export function isOutlinerAuxiliaryObject(obj) {
    return !!obj && isOutlinerAuxiliaryNode(obj);
}

/**
 * Logical parent for outliner walks. While group transform is active, members are
 * reparented under a pivot — use the stored original parent instead.
 * @param {import('three').Object3D} obj
 * @returns {import('three').Object3D|null}
 */
function getLogicalParent(obj) {
    if (onGetGroupSelection && onGetGroupOriginalParents) {
        const objs = onGetGroupSelection();
        const parents = onGetGroupOriginalParents();
        if (objs?.length && parents?.length === objs.length) {
            const idx = objs.indexOf(obj);
            if (idx !== -1) return parents[idx] || null;
        }
    }
    return obj.parent;
}

/**
 * Children shown under obj in the outliner. Merges in group-selection members
 * whose original parent is obj (they are temporarily attached to the pivot).
 * @param {import('three').Object3D} obj
 * @returns {Array<import('three').Object3D>}
 */
function getOutlinerChildren(obj) {
    let children = showAuxiliaryObjects
        ? Array.from(obj.children)
        : obj.children.filter(child => !isOutlinerAuxiliaryNode(child));

    if (onGetGroupSelection && onGetGroupOriginalParents) {
        const objs = onGetGroupSelection();
        const parents = onGetGroupOriginalParents();
        if (objs?.length && parents?.length === objs.length) {
            const groupSet = new Set(objs);
            children = children.filter(child => {
                if (!groupSet.has(child)) return true;
                const idx = objs.indexOf(child);
                return parents[idx] === obj;
            });
            for (let i = 0; i < objs.length; i++) {
                if (parents[i] !== obj) continue;
                const member = objs[i];
                if (!member || children.includes(member)) continue;
                if (!showAuxiliaryObjects && isOutlinerAuxiliaryNode(member)) continue;
                children.push(member);
            }
        }
    }
    return children;
}

// -------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------

/**
 * Create the outliner DOM (panel + resize handle). Call once at startup.
 * @param {{ onSelect: Function, onToggleVisibility: Function }} callbacks
 * @returns {HTMLDivElement} the panel element (for guiWrapper hit-testing)
 */
export function initOutliner({ onSelect, onToggleVisibility: onVis, onToggleSelectable: onSel, onGroupAdd: onGroupAddCb, onGroupRemove: onGroupRemoveCb, onHideOthers: onHideOthersCb, onShowAll: onShowAllCb, onReparent: onReparentCb, onRemove: onRemoveCb, onRemoveGroup: onRemoveGroupCb, onGetGroupSelection: onGetGroupSelectionCb, onGetGroupOriginalParents: onGetGroupOriginalParentsCb, onSortChildren: onSortChildrenCb, onCloneObject: onCloneObjectCb, onAddObject3D: onAddObject3DCb, onAddPrimitive: onAddPrimitiveCb, onPromoteToRoot: onPromoteToRootCb, getDocuments: getDocumentsCb, getDocumentLabel: getDocumentLabelCb, getDocumentFolders: getDocumentFoldersCb, getAttachments: getAttachmentsCb, onOpenDocument: onOpenDocumentCb, onNewDocument: onNewDocumentCb, onNewDocumentFolder: onNewDocumentFolderCb, onImportDocumentJson: onImportDocumentJsonCb, getDocOpenMode: getDocOpenModeCb, onSetDocOpenMode: onSetDocOpenModeCb, getDocLabelOptions: getDocLabelOptionsCb, onSetDocLabelOptions: onSetDocLabelOptionsCb, onRenameDocument: onRenameDocumentCb, onDeleteDocument: onDeleteDocumentCb, onDeleteDocuments: onDeleteDocumentsCb, onRenameDocumentFolder: onRenameDocumentFolderCb, onDeleteDocumentFolder: onDeleteDocumentFolderCb, onMoveDocument: onMoveDocumentCb, onMoveDocuments: onMoveDocumentsCb, onMoveDocumentFolder: onMoveDocumentFolderCb, onOpenAttachment: onOpenAttachmentCb, canOpenAttachment: canOpenAttachmentCb, getArrangements: getArrangementsCb, getActiveArrangementId: getActiveArrangementIdCb, isArrangementDirty: isArrangementDirtyCb, onApplyArrangement: onApplyArrangementCb, getSequences: getSequencesCb, getActiveSequenceId: getActiveSequenceIdCb, getCurrentStepIndex: getCurrentStepIndexCb, isPlaybackDetached: isPlaybackDetachedCb, onSelectSequence: onSelectSequenceCb, onGoToAssembled: onGoToAssembledCb, onGoToStep: onGoToStepCb, fileOps: fileOpsCb }) {
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
    onGetGroupOriginalParents = onGetGroupOriginalParentsCb || null;
    onSortChildren = onSortChildrenCb || null;
    onCloneObject = onCloneObjectCb || null;
    onAddObject3D = onAddObject3DCb || null;
    onAddPrimitive = onAddPrimitiveCb || null;
    onPromoteToRoot = onPromoteToRootCb || null;
    getDocuments = getDocumentsCb || null;
    getDocumentLabel = getDocumentLabelCb || null;
    getDocumentFolders = getDocumentFoldersCb || null;
    getAttachments = getAttachmentsCb || null;
    onOpenDocument = onOpenDocumentCb || null;
    onNewDocument = onNewDocumentCb || null;
    onNewDocumentFolder = onNewDocumentFolderCb || null;
    onImportDocumentJson = onImportDocumentJsonCb || null;
    getDocOpenMode = getDocOpenModeCb || null;
    onSetDocOpenMode = onSetDocOpenModeCb || null;
    getDocLabelOptions = getDocLabelOptionsCb || null;
    onSetDocLabelOptions = onSetDocLabelOptionsCb || null;
    onRenameDocument = onRenameDocumentCb || null;
    onDeleteDocument = onDeleteDocumentCb || null;
    onDeleteDocuments = onDeleteDocumentsCb || null;
    onRenameDocumentFolder = onRenameDocumentFolderCb || null;
    onDeleteDocumentFolder = onDeleteDocumentFolderCb || null;
    onMoveDocument = onMoveDocumentCb || null;
    onMoveDocuments = onMoveDocumentsCb || null;
    onMoveDocumentFolder = onMoveDocumentFolderCb || null;
    onOpenAttachment = onOpenAttachmentCb || null;
    canOpenAttachment = canOpenAttachmentCb || null;
    getArrangements = getArrangementsCb || null;
    getActiveArrangementId = getActiveArrangementIdCb || null;
    isArrangementDirty = isArrangementDirtyCb || null;
    onApplyArrangement = onApplyArrangementCb || null;
    getSequences = getSequencesCb || null;
    getActiveSequenceId = getActiveSequenceIdCb || null;
    getCurrentStepIndex = getCurrentStepIndexCb || null;
    isPlaybackDetached = isPlaybackDetachedCb || null;
    onSelectSequence = onSelectSequenceCb || null;
    onGoToAssembled = onGoToAssembledCb || null;
    onGoToStep = onGoToStepCb || null;
    fileOps = fileOpsCb || {};

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
    lastLoadedModels = loadedModels || [];
    preFilterExpandedUUIDs = null;
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
    rebuildTreeDom(expandedUUIDs);
    if (preserveExpanded) {
        treeEl.scrollTop = scrollTop;
    }
}

/**
 * Rebuild the outliner when documents or attachments change.
 */
export function notifyOutlinerProjectContentsChanged() {
    if (!treeEl) return;
    const searchVal = searchInputEl?.value?.trim() || '';
    rebuildTree(lastLoadedModels, true);
    if (searchVal) filterTree(searchVal);
}

/**
 * Replace only the Arrangements folder in place (catalog / active / dirty changed).
 * Avoids a full tree rebuild — updateArrangementsGuiInfo also runs on transform dirty.
 */
export function refreshArrangementsFolder() {
    if (!treeEl) return;
    const existing = treeEl.querySelector(':scope > [data-expand-id="project:arrangements"]');
    const childList = existing?.querySelector(':scope > .outliner-children');
    const expanded = existing
        ? (childList ? existing.classList.contains('outliner-expanded') : true)
        : true;
    const node = createArrangementsFolderNode(expanded);
    if (existing) {
        existing.replaceWith(node);
    } else {
        const sep = treeEl.querySelector(':scope > .outliner-project-section');
        if (sep) treeEl.insertBefore(node, sep);
        else treeEl.appendChild(node);
    }
    const searchVal = searchInputEl?.value?.trim() || '';
    if (searchVal) filterAssetSection(wildcardToRegex(searchVal));
    restoreSelectedExpandId({ scroll: true });
}

/**
 * Replace only the Sequences folder in place (catalog / active / current step changed).
 * Avoids a full tree rebuild — updateAssemblyGuiInfo also runs on playback.
 */
export function refreshSequencesFolder() {
    if (!treeEl) return;
    const existing = treeEl.querySelector(':scope > [data-expand-id="project:sequences"]');
    const childList = existing?.querySelector(':scope > .outliner-children');
    const expanded = existing
        ? (childList ? existing.classList.contains('outliner-expanded') : true)
        : true;
    const expandedIds = collectExpandedUUIDs();
    const node = createSequencesFolderNode(expanded, expandedIds);
    if (existing) {
        existing.replaceWith(node);
    } else {
        const sep = treeEl.querySelector(':scope > .outliner-project-section');
        if (sep) treeEl.insertBefore(node, sep);
        else treeEl.appendChild(node);
    }
    const searchVal = searchInputEl?.value?.trim() || '';
    if (searchVal) filterAssetSection(wildcardToRegex(searchVal));
    restoreSelectedExpandId({ scroll: true });
}

function rebuildTreeDom(expandedUUIDs) {
    clearGroupHighlights();
    treeEl.innerHTML = '';
    objectToDom.clear = clearWeakMapViaTree; // WeakMap has no clear — we just rebuild
    activeTreeNode = null;

    appendProjectSection(expandedUUIDs);

    for (const root of lastLoadedModels) {
        const li = createTreeNode(root, 0);
        treeEl.appendChild(li);
    }

    if (expandedUUIDs && expandedUUIDs.size > 0) {
        restoreExpandedUUIDs(expandedUUIDs);
    }
    if (onGetGroupSelection) {
        highlightGroupObjects(onGetGroupSelection());
    }
    restoreSelectedExpandId({ scroll: false });
}

/**
 * Rebuild the outliner when overlay/tool children changed and they should be visible in the tree.
 */
export function notifyOutlinerAuxiliaryChildrenChanged() {
    if (!showAuxiliaryObjects || lastLoadedModels.length === 0) return;
    rebuildTree(lastLoadedModels, true);
}

/**
 * Toggle whether overlays and tool objects appear in the outliner.
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
    selectedExpandId = null;
    if (object) {
        clearDocMultiSelection();
        clearFileMultiSelection();
    }
    if (activeTreeNode) {
        activeTreeNode.classList.remove('outliner-selected');
    }
    activeTreeNode = null;

    if (!object) return;

    // Build path from root to target object (logical parents while group-selected)
    const path = [];
    let cur = object;
    while (cur) {
        path.unshift(cur);
        cur = getLogicalParent(cur);
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
    selectedExpandId = null;
    if (activeTreeNode) activeTreeNode.classList.remove('outliner-selected');
    activeTreeNode = null;
    if (!object) return;
    // Rozbal rodiče stejně jako highlightObject (logical parents while group-selected)
    const path = [];
    let cur = object;
    while (cur) { path.unshift(cur); cur = getLogicalParent(cur); }
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

function parseDocumentExpandId(expandId) {
    if (typeof expandId !== 'string' || !expandId.startsWith('doc:') || expandId.startsWith('doc-folder:')) return null;
    return expandId.slice(4) || null;
}

function parseSelectedDocumentIds() {
    const ids = [];
    const seen = new Set();
    const add = (id) => {
        if (!id || seen.has(id)) return;
        seen.add(id);
        ids.push(id);
    };
    selectedDocIds.forEach(add);
    if (ids.length === 0) add(parseDocumentExpandId(selectedExpandId));
    return ids;
}

/**
 * Delete documents selected in the outliner (multi-select or primary document row).
 * @returns {boolean} true if a document deletion was handled
 */
export function deleteSelectedOutlinerDocuments() {
    if (!onDeleteDocuments) return false;
    const ids = parseSelectedDocumentIds();
    if (ids.length === 0) return false;
    onDeleteDocuments(ids);
    return true;
}

function parseFileExpandId(expandId) {
    if (typeof expandId !== 'string' || !expandId.startsWith('file:') || expandId.startsWith('file-folder:')) return null;
    return expandId.slice(5) || null;
}

function parseSelectedFileIds() {
    const ids = [];
    const seen = new Set();
    const add = (id) => {
        if (!id || seen.has(id)) return;
        seen.add(id);
        ids.push(id);
    };
    selectedFileIds.forEach(add);
    if (ids.length === 0) add(parseFileExpandId(selectedExpandId));
    return ids;
}

/**
 * Delete files selected in the outliner (multi-select or primary file row).
 * @returns {boolean} true if a file deletion was handled
 */
export function deleteSelectedOutlinerFiles() {
    if (!fileOps.deleteMany) return false;
    const ids = parseSelectedFileIds();
    if (ids.length === 0) return false;
    fileOps.deleteMany(ids);
    return true;
}

/**
 * Navigate the outliner selection up or down.
 * Sequence Assembled/step rows stay within the same sequence and are activated.
 * Arrangement rows stay within Arrangements and are applied.
 * Document rows stay within Documents (visible docs, including nested folders) and are opened.
 * Scene-graph nodes return the Object3D to select.
 * @param {'up'|'down'} direction
 * @returns {{ kind: 'sequence' } | { kind: 'arrangement' } | { kind: 'document' } | { kind: 'object', object: import('three').Object3D } | null}
 */
export function navigateOutliner(direction) {
    if (!treeEl) return null;

    const currentId = selectedExpandId || activeTreeNode?.dataset?.expandId || null;
    if (parseSequenceItemExpandId(currentId)) {
        navigateSequenceStep(direction, currentId);
        return { kind: 'sequence' };
    }
    if (parseArrangementExpandId(currentId) != null) {
        navigateArrangement(direction, currentId);
        return { kind: 'arrangement' };
    }
    if (parseDocumentExpandId(currentId)) {
        navigateDocument(direction, currentId);
        return { kind: 'document' };
    }

    const allNodes = Array.from(treeEl.querySelectorAll('.outliner-node:not(.outliner-asset)'));
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
    const object = domToObject.get(targetLi) || null;
    return object ? { kind: 'object', object } : null;
}

/** @returns {{ sequenceId: number, kind: 'assembled'|'step', stepIndex: number } | null} */
function parseSequenceItemExpandId(id) {
    if (!id) return null;
    const m = String(id).match(/^sequence:(\d+):(assembled|step:(\d+))$/);
    if (!m) return null;
    return {
        sequenceId: Number(m[1]),
        kind: m[2] === 'assembled' ? 'assembled' : 'step',
        stepIndex: m[2] === 'assembled' ? -1 : Number(m[3]),
    };
}

function sequenceIndexById(sequenceId) {
    const sequences = getSequences ? getSequences() : [];
    return sequences.findIndex(wf => wf.id === sequenceId);
}

function selectOutlinerAssetByExpandId(id, { scroll = true } = {}) {
    if (!treeEl || !id) return false;
    if (activeTreeNode) activeTreeNode.classList.remove('outliner-selected');
    selectedExpandId = id;
    const li = treeEl.querySelector(`[data-expand-id="${id}"]`);
    if (!li) {
        activeTreeNode = null;
        return false;
    }
    li.classList.add('outliner-selected');
    activeTreeNode = li;
    if (scroll) li.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return true;
}

function restoreSelectedExpandId({ scroll = false } = {}) {
    if (selectedExpandId && !selectOutlinerAssetByExpandId(selectedExpandId, { scroll })) {
        selectedExpandId = null;
    }
    applyDocMultiSelectClasses();
    applyFileMultiSelectClasses();
}

function applyDocMultiSelectClasses() {
    if (!treeEl) return;
    const liveIds = new Set(
        Array.from(treeEl.querySelectorAll('[data-doc-kind="doc"]')).map(li => li.dataset.docId)
    );
    for (const id of [...selectedDocIds]) {
        if (!liveIds.has(id)) selectedDocIds.delete(id);
    }
    treeEl.querySelectorAll('[data-doc-kind="doc"]').forEach(li => {
        const on = selectedDocIds.has(li.dataset.docId);
        const isPrimary = selectedExpandId === `doc:${li.dataset.docId}`;
        li.classList.toggle('outliner-group-member', on && selectedDocIds.size > 1 && !isPrimary);
    });
}

function clearDocMultiSelection() {
    selectedDocIds.clear();
    docSelectAnchorId = null;
    applyDocMultiSelectClasses();
}

function siblingDocItems(li) {
    const parent = li?.parentElement;
    if (!parent) return [];
    return Array.from(parent.children).filter(el => el.dataset?.docKind === 'doc');
}

function handleDocClick(e, li, docId) {
    clearFileMultiSelection();
    if (e.ctrlKey || e.metaKey || e.shiftKey) e.preventDefault();
    const expandId = `doc:${docId}`;
    const additive = !!(e.ctrlKey || e.metaKey);
    const range = !!e.shiftKey && !additive;

    if (range) {
        const siblings = siblingDocItems(li);
        const anchorId = docSelectAnchorId
            && siblings.some(s => s.dataset.docId === docSelectAnchorId)
            ? docSelectAnchorId
            : docId;
        const fromIdx = siblings.findIndex(s => s.dataset.docId === anchorId);
        const toIdx = siblings.findIndex(s => s.dataset.docId === docId);
        if (fromIdx >= 0 && toIdx >= 0) {
            const a = Math.min(fromIdx, toIdx);
            const b = Math.max(fromIdx, toIdx);
            selectedDocIds.clear();
            siblings.slice(a, b + 1).forEach(s => selectedDocIds.add(s.dataset.docId));
        } else {
            selectedDocIds.clear();
            selectedDocIds.add(docId);
            docSelectAnchorId = docId;
        }
        selectOutlinerAssetByExpandId(expandId, { scroll: false });
        applyDocMultiSelectClasses();
        return;
    }

    if (additive) {
        if (selectedDocIds.has(docId)) {
            selectedDocIds.delete(docId);
            if (selectedExpandId === expandId) {
                const next = [...selectedDocIds][selectedDocIds.size - 1];
                if (next) selectOutlinerAssetByExpandId(`doc:${next}`, { scroll: false });
                else {
                    selectedExpandId = null;
                    if (activeTreeNode) activeTreeNode.classList.remove('outliner-selected');
                    activeTreeNode = null;
                }
            }
        } else {
            if (selectedDocIds.size === 0) {
                const currentId = parseDocumentExpandId(selectedExpandId);
                if (currentId) selectedDocIds.add(currentId);
            }
            selectedDocIds.add(docId);
            selectOutlinerAssetByExpandId(expandId, { scroll: false });
        }
        docSelectAnchorId = docId;
        applyDocMultiSelectClasses();
        return;
    }

    selectedDocIds.clear();
    selectedDocIds.add(docId);
    docSelectAnchorId = docId;
    selectOutlinerAssetByExpandId(expandId, { scroll: false });
    applyDocMultiSelectClasses();
}

function navigateSequenceStep(direction, currentId) {
    const parsed = parseSequenceItemExpandId(currentId);
    if (!parsed) return;
    const wfIndex = sequenceIndexById(parsed.sequenceId);
    if (wfIndex < 0) return;

    const folder = treeEl.querySelector(`[data-expand-id="sequence:${parsed.sequenceId}"]`);
    const childList = folder?.querySelector(':scope > .outliner-children');
    if (!childList) return;

    const siblings = Array.from(childList.children).filter(li =>
        li.classList.contains('outliner-asset')
        && parseSequenceItemExpandId(li.dataset.expandId)
        && isNodeVisible(li)
    );
    if (siblings.length === 0) return;

    let idx = siblings.findIndex(li => li.dataset.expandId === currentId);
    if (idx < 0) idx = 0;
    if (direction === 'up') {
        idx = idx <= 0 ? 0 : idx - 1;
    } else {
        idx = idx >= siblings.length - 1 ? siblings.length - 1 : idx + 1;
    }

    const targetId = siblings[idx].dataset.expandId;
    const next = parseSequenceItemExpandId(targetId);
    if (!next) return;
    selectedExpandId = targetId;
    if (next.kind === 'assembled') {
        if (onGoToAssembled) onGoToAssembled(wfIndex);
    } else if (onGoToStep) {
        onGoToStep(wfIndex, next.stepIndex);
    }
}

/** @returns {number|null} arrangement id, or null if not an arrangement row */
function parseArrangementExpandId(id) {
    if (!id) return null;
    const m = String(id).match(/^arrangement:(\d+)$/);
    return m ? Number(m[1]) : null;
}

function navigateArrangement(direction, currentId) {
    const folder = treeEl.querySelector(':scope > [data-expand-id="project:arrangements"]');
    const childList = folder?.querySelector(':scope > .outliner-children');
    if (!childList) return;

    const siblings = Array.from(childList.children).filter(li =>
        li.classList.contains('outliner-asset')
        && parseArrangementExpandId(li.dataset.expandId) != null
        && isNodeVisible(li)
    );
    if (siblings.length === 0) return;

    let idx = siblings.findIndex(li => li.dataset.expandId === currentId);
    if (idx < 0) idx = 0;
    if (direction === 'up') {
        idx = idx <= 0 ? 0 : idx - 1;
    } else {
        idx = idx >= siblings.length - 1 ? siblings.length - 1 : idx + 1;
    }

    const targetId = siblings[idx].dataset.expandId;
    const arrangementId = parseArrangementExpandId(targetId);
    if (arrangementId == null) return;
    const arrangements = getArrangements ? getArrangements() : [];
    const arrangement = arrangements.find(a => a.id === arrangementId);
    if (!arrangement) return;
    selectedExpandId = targetId;
    if (onApplyArrangement) onApplyArrangement(arrangement);
}

function visibleDocumentItems() {
    const folder = treeEl.querySelector(':scope > [data-expand-id="project:documents"]');
    if (!folder) return [];
    return Array.from(folder.querySelectorAll('[data-doc-kind="doc"]')).filter(li => isNodeVisible(li));
}

function navigateDocument(direction, currentId) {
    const items = visibleDocumentItems();
    if (items.length === 0) return;

    let idx = items.findIndex(li => li.dataset.expandId === currentId);
    if (idx < 0) idx = 0;
    if (direction === 'up') {
        idx = idx <= 0 ? 0 : idx - 1;
    } else {
        idx = idx >= items.length - 1 ? items.length - 1 : idx + 1;
    }

    const targetLi = items[idx];
    const docId = targetLi?.dataset?.docId;
    if (!docId) return;

    const expandId = `doc:${docId}`;
    const changed = expandId !== currentId;
    clearFileMultiSelection();
    selectedDocIds.clear();
    selectedDocIds.add(docId);
    docSelectAnchorId = docId;
    selectOutlinerAssetByExpandId(expandId, { scroll: true });
    applyDocMultiSelectClasses();
    if (changed && onOpenDocument) onOpenDocument(docId);
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
        const expandId = li.dataset.expandId;
        if (expandId) uuids.add(expandId);
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

function appendProjectSection(expandedIds) {
    const docs = getDocuments ? getDocuments() : [];
    const docFolders = getDocumentFolders ? getDocumentFolders() : [];
    const atts = getAttachments ? getAttachments() : [];
    const attFolders = fileOps.getFolders ? fileOps.getFolders() : [];

    const docsExpanded = expandedIds ? expandedIds.has('project:documents') : true;
    const filesExpanded = expandedIds ? expandedIds.has('project:files') : true;

    treeEl.appendChild(createDocumentsFolderNode(docs, docFolders, docsExpanded, expandedIds));
    treeEl.appendChild(createFilesFolderNode(atts, attFolders, filesExpanded, expandedIds));

    const arrExpanded = expandedIds ? expandedIds.has('project:arrangements') : true;
    treeEl.appendChild(createArrangementsFolderNode(arrExpanded));

    const wfExpanded = expandedIds ? expandedIds.has('project:sequences') : true;
    treeEl.appendChild(createSequencesFolderNode(wfExpanded, expandedIds));

    const sep = document.createElement('li');
    sep.className = 'outliner-project-section';
    sep.setAttribute('aria-hidden', 'true');
    treeEl.appendChild(sep);
}

function createDocumentsFolderNode(docs, folders, expanded, expandedIds) {
    const children = buildDocumentTreeChildren(docs, folders, null, 1, expandedIds);
    const node = createAssetFolderNode({
        expandId: 'project:documents',
        label: `Documents (${docs.length})`,
        children,
        expanded,
        extraClass: 'outliner-project-folder',
    });
    attachDocAssetInteractions(node, { kind: 'root' });
    return node;
}

function buildDocumentTreeChildren(docs, folders, parentId, depth, expandedIds) {
    const pid = parentId || null;
    const childFolders = folders.filter(f => (f.parentId || null) === pid);
    const childDocs = docs.filter(d => (d.folderId || null) === pid);
    const nodes = [];

    for (const folder of childFolders) {
        const expandId = `doc-folder:${folder.id}`;
        const folderExpanded = expandedIds ? expandedIds.has(expandId) : true;
        const folderNode = createAssetFolderNode({
            expandId,
            label: folder.name || '(unnamed folder)',
            title: folder.name || '(unnamed folder)',
            children: buildDocumentTreeChildren(docs, folders, folder.id, depth + 1, expandedIds),
            expanded: folderExpanded,
            depth,
            extraClass: 'outliner-user-folder',
        });
        attachDocAssetInteractions(folderNode, {
            kind: 'folder',
            id: folder.id,
            name: folder.name || '',
        });
        nodes.push(folderNode);
    }

    for (const doc of childDocs) {
        const expandId = `doc:${doc.id}`;
        const fileName = doc.fileName || doc.title || '(no title)';
        const displayLabel = getDocumentLabel ? getDocumentLabel(doc) : fileName;
        const tooltip = (doc.title && doc.title !== fileName)
            ? `${displayLabel} — ${doc.title}`
            : displayLabel;
        const item = createAssetItemNode({
            expandId,
            label: displayLabel,
            title: tooltip,
            depth,
            onClick: (e) => {
                if (Date.now() - _lastDragEndTime < 300) return;
                handleDocClick(e, item, doc.id);
                if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                if (onOpenDocument) onOpenDocument(doc.id);
            },
        });
        attachDocAssetInteractions(item, {
            kind: 'doc',
            id: doc.id,
            name: fileName,
        });
        nodes.push(item);
    }

    return nodes;
}

function parseDocAsset(li) {
    const kind = li?.dataset?.docKind;
    if (!kind) return null;
    return {
        kind,
        id: li.dataset.docId || null,
        name: li.dataset.docName || '',
    };
}

function getDocFolderParentId(folderId) {
    const folders = getDocumentFolders ? getDocumentFolders() : [];
    return folders.find(f => f.id === folderId)?.parentId || null;
}

function getDocParentFolderId(docId) {
    const docs = getDocuments ? getDocuments() : [];
    return docs.find(d => d.id === docId)?.folderId || null;
}

function isDocFolderDescendant(ancestorId, maybeDescendantId) {
    if (!ancestorId || !maybeDescendantId) return false;
    const folders = getDocumentFolders ? getDocumentFolders() : [];
    const byId = new Map(folders.map(f => [f.id, f]));
    const seen = new Set();
    let id = maybeDescendantId;
    while (id) {
        if (id === ancestorId) return true;
        if (seen.has(id)) break;
        seen.add(id);
        id = byId.get(id)?.parentId || null;
    }
    return false;
}

function canDropDocAsset(source, target, pos) {
    if (!source || !target) return false;
    if (source.kind === 'root') return false;
    if (source.kind === target.kind && source.id && source.id === target.id) return false;
    if (source.kind !== 'folder') return true;
    let destFolderId = null;
    if (target.kind === 'root') destFolderId = null;
    else if (target.kind === 'folder' && pos === 'into') destFolderId = target.id;
    else if (target.kind === 'folder') destFolderId = getDocFolderParentId(target.id);
    else destFolderId = getDocParentFolderId(target.id);
    if (destFolderId === source.id || isDocFolderDescendant(source.id, destFolderId)) return false;
    return true;
}

function canDropDocAssets(sources, target, pos) {
    if (!sources?.length || !target) return false;
    if (sources.some(s => s.kind === target.kind && s.id && s.id === target.id)) return false;
    return sources.every(s => canDropDocAsset(s, target, pos));
}

function applyDocAssetsDrop(sources, target, pos) {
    if (!canDropDocAssets(sources, target, pos)) return;

    let destFolderId = null;
    let beforeId;
    let afterId;

    if (target.kind === 'root') {
        destFolderId = null;
    } else if (target.kind === 'folder') {
        if (pos === 'into') {
            destFolderId = target.id;
        } else {
            destFolderId = getDocFolderParentId(target.id);
            if (sources.every(s => s.kind === 'folder')) {
                if (pos === 'before') beforeId = target.id;
                else afterId = target.id;
            }
        }
    } else {
        destFolderId = getDocParentFolderId(target.id);
        if (sources.every(s => s.kind === 'doc')) {
            if (pos === 'before') beforeId = target.id;
            else afterId = target.id;
        }
    }

    const docIds = sources.filter(s => s.kind === 'doc').map(s => s.id);
    const folderSources = sources.filter(s => s.kind === 'folder');
    if (docIds.length) {
        if (onMoveDocuments) onMoveDocuments(docIds, destFolderId, { beforeId, afterId });
        else if (onMoveDocument) docIds.forEach(id => onMoveDocument(id, destFolderId, { beforeId, afterId }));
    }
    folderSources.forEach(folder => {
        if (onMoveDocumentFolder) onMoveDocumentFolder(folder.id, destFolderId, { beforeId, afterId });
    });
}

function revealAssetNode(expandId) {
    if (!treeEl || !expandId) return null;
    const escaped = (window.CSS && CSS.escape) ? CSS.escape(expandId) : expandId.replace(/"/g, '\\"');
    const li = treeEl.querySelector(`[data-expand-id="${escaped}"]`);
    if (!li) return null;
    const ancestors = [];
    let node = li.parentElement;
    while (node && node !== treeEl) {
        if (node.classList.contains('outliner-asset-folder')) ancestors.push(node);
        node = node.parentElement;
    }
    for (let i = ancestors.length - 1; i >= 0; i--) {
        const childList = ancestors[i].querySelector(':scope > .outliner-children');
        if (childList && childList.style.display === 'none') toggleAssetExpand(ancestors[i]);
    }
    return li;
}

function createDocCtxItem(label, onClick, extraClass) {
    const item = document.createElement('div');
    item.className = extraClass ? `outliner-ctx-item ${extraClass}` : 'outliner-ctx-item';
    item.textContent = label;
    item.addEventListener('click', () => {
        hideCtxMenu();
        onClick();
    });
    return item;
}

function showDocAssetCtxMenu(x, y, asset, li) {
    hideAddPrimitiveMenu();
    const menu = getOrCreateCtxMenu();
    menu.innerHTML = '';

    if (asset.kind === 'root' || asset.kind === 'folder') {
        const parentId = asset.kind === 'folder' ? asset.id : null;
        menu.appendChild(createDocCtxItem('New document', () => {
            if (!onNewDocument) return;
            const doc = onNewDocument(parentId);
            if (!doc?.id) return;
            const expandId = `doc:${doc.id}`;
            const newLi = revealAssetNode(expandId);
            if (!newLi) return;
            selectedDocIds.clear();
            selectedDocIds.add(doc.id);
            docSelectAnchorId = doc.id;
            selectOutlinerAssetByExpandId(expandId, { scroll: true });
            applyDocMultiSelectClasses();
            startAssetInlineRename(newLi, doc.fileName || 'new_file', (name) => {
                if (onRenameDocument) onRenameDocument(doc.id, name);
            });
        }));
        menu.appendChild(createDocCtxItem('New folder', () => {
            if (!onNewDocumentFolder) return;
            const folder = onNewDocumentFolder(parentId);
            if (!folder?.id) return;
            const newLi = revealAssetNode(`doc-folder:${folder.id}`);
            if (newLi) {
                startAssetInlineRename(newLi, folder.name || 'New folder', (name) => {
                    if (onRenameDocumentFolder) onRenameDocumentFolder(folder.id, name);
                });
            }
        }));
        menu.appendChild(createDocCtxItem('Import JSON', () => {
            if (onImportDocumentJson) onImportDocumentJson(parentId);
        }));
        if (asset.kind === 'root') {
            const sep = document.createElement('div');
            sep.className = 'outliner-ctx-sep';
            menu.appendChild(sep);
            const current = getDocOpenMode ? getDocOpenMode() : 'side';
            menu.appendChild(createDocCtxItem(
                `${current === 'side' ? '✓ ' : ''}Open as: Side-by-side`,
                () => { if (onSetDocOpenMode) onSetDocOpenMode('side'); },
                'outliner-ctx-pref'
            ));
            menu.appendChild(createDocCtxItem(
                `${current === 'window' ? '✓ ' : ''}Open as: Window`,
                () => { if (onSetDocOpenMode) onSetDocOpenMode('window'); },
                'outliner-ctx-pref'
            ));
            const labelOpts = getDocLabelOptions
                ? getDocLabelOptions()
                : { showLastEditDate: false, showImportDate: false };
            menu.appendChild(createDocCtxItem(
                `${labelOpts.showLastEditDate ? '✓ ' : ''}Show last edit date`,
                () => {
                    if (onSetDocLabelOptions) {
                        onSetDocLabelOptions({ showLastEditDate: !labelOpts.showLastEditDate });
                    }
                },
                'outliner-ctx-pref'
            ));
            menu.appendChild(createDocCtxItem(
                `${labelOpts.showImportDate ? '✓ ' : ''}Show import date`,
                () => {
                    if (onSetDocLabelOptions) {
                        onSetDocLabelOptions({ showImportDate: !labelOpts.showImportDate });
                    }
                },
                'outliner-ctx-pref'
            ));
        }
    }

    if (asset.kind === 'folder') {
        menu.appendChild(createDocCtxItem('Rename', () => {
            startAssetInlineRename(li, asset.name, (name) => {
                if (onRenameDocumentFolder) onRenameDocumentFolder(asset.id, name);
            });
        }));
        menu.appendChild(createDocCtxItem('Delete folder', () => {
            if (onDeleteDocumentFolder) onDeleteDocumentFolder(asset.id);
        }, 'outliner-ctx-danger'));
    }

    if (asset.kind === 'doc') {
        menu.appendChild(createDocCtxItem('Open', () => {
            selectOutlinerAssetByExpandId(`doc:${asset.id}`, { scroll: false });
            if (onOpenDocument) onOpenDocument(asset.id);
        }));
        menu.appendChild(createDocCtxItem('Rename', () => {
            startAssetInlineRename(li, asset.name || 'new_file', (name) => {
                if (onRenameDocument) onRenameDocument(asset.id, name);
            });
        }));
        menu.appendChild(createDocCtxItem('Delete', () => {
            const ids = (selectedDocIds.size > 1 && selectedDocIds.has(asset.id))
                ? [...selectedDocIds]
                : [asset.id];
            if (ids.length > 1) {
                if (onDeleteDocuments) onDeleteDocuments(ids);
                else if (onDeleteDocument) ids.forEach(id => onDeleteDocument(id));
            } else if (onDeleteDocument) {
                onDeleteDocument(asset.id);
            }
        }, 'outliner-ctx-danger'));
    }

    positionFixedMenu(menu, x, y);
}

function attachDocAssetInteractions(li, asset) {
    li.dataset.docKind = asset.kind;
    if (asset.id) li.dataset.docId = asset.id;
    if (asset.name) li.dataset.docName = asset.name;

    const row = li.querySelector(':scope > .outliner-row');
    if (!row) return;

    row.addEventListener('click', (e) => {
        if (Date.now() - _lastDragEndTime < 300) return;
        if (asset.kind === 'doc') {
            handleDocClick(e, li, asset.id);
            return;
        }
        clearDocMultiSelection();
        clearFileMultiSelection();
        if (li.dataset.expandId) {
            selectOutlinerAssetByExpandId(li.dataset.expandId, { scroll: false });
        }
    });

    if (asset.kind !== 'root') {
        row.draggable = true;
        row.addEventListener('dragstart', (e) => {
            _draggedObj = null;
            _draggedObjs = null;
            _draggedFileAsset = null;
            _draggedFileAssets = [];
            if (asset.kind === 'doc' && selectedDocIds.has(asset.id) && selectedDocIds.size > 1) {
                _draggedDocAssets = [...selectedDocIds].map(id => ({ kind: 'doc', id }));
            } else {
                _draggedDocAssets = [{ kind: asset.kind, id: asset.id }];
            }
            _draggedDocAsset = _draggedDocAssets[0];
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', '');
            li.classList.add('outliner-drag-source');
            _draggedDocAssets.forEach(src => {
                const srcLi = treeEl.querySelector(`[data-doc-kind="${src.kind}"][data-doc-id="${src.id}"]`);
                if (srcLi) srcLi.classList.add('outliner-drag-source');
            });
        });
        row.addEventListener('dragend', () => {
            _lastDragEndTime = Date.now();
            treeEl.querySelectorAll('.outliner-drag-source').forEach(el => el.classList.remove('outliner-drag-source'));
            clearDropIndicators();
            _draggedDocAsset = null;
            _draggedDocAssets = [];
            _dragOverLi = null;
            _dragOverPos = null;
        });
    }

    row.addEventListener('dragover', (e) => {
        if (!_draggedDocAsset) return;
        const target = parseDocAsset(li);
        const rect = row.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const h = rect.height;
        const pos = target.kind === 'root'
            ? 'into'
            : (y < h * 0.25 ? 'before' : y > h * 0.75 ? 'after' : 'into');
        const sources = _draggedDocAssets.length ? _draggedDocAssets : (_draggedDocAsset ? [_draggedDocAsset] : []);
        if (!canDropDocAssets(sources, target, pos)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (_dragOverLi !== li || _dragOverPos !== pos) {
            clearDropIndicators();
            _dragOverLi = li;
            _dragOverPos = pos;
            li.classList.add('outliner-drop-' + pos);
        }
    });

    row.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const sources = _draggedDocAssets.length ? _draggedDocAssets : (_draggedDocAsset ? [_draggedDocAsset] : []);
        const target = parseDocAsset(_dragOverLi || li);
        const pos = _dragOverPos || 'into';
        clearDropIndicators();
        _dragOverLi = null;
        _dragOverPos = null;
        if (sources.length && target) applyDocAssetsDrop(sources, target, pos);
    });

    row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (asset.kind === 'doc' && !selectedDocIds.has(asset.id)) {
            handleDocClick({ ctrlKey: false, metaKey: false, shiftKey: false }, li, asset.id);
        }
        showDocAssetCtxMenu(e.clientX, e.clientY, asset, li);
    });

    let longPressTimer = null;
    row.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        longPressTimer = setTimeout(() => {
            longPressTimer = null;
            showDocAssetCtxMenu(touch.clientX, touch.clientY, asset, li);
        }, 500);
    }, { passive: true });
    const cancelLongPress = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    };
    row.addEventListener('touchend', cancelLongPress, { passive: true });
    row.addEventListener('touchcancel', cancelLongPress, { passive: true });
    row.addEventListener('touchmove', cancelLongPress, { passive: true });
}

function createFilesFolderNode(atts, folders, expanded, expandedIds) {
    const children = buildFileTreeChildren(atts, folders, null, 1, expandedIds);
    const node = createAssetFolderNode({
        expandId: 'project:files',
        label: `Files (${atts.length})`,
        children,
        expanded,
        extraClass: 'outliner-project-folder',
    });
    attachFileAssetInteractions(node, { kind: 'root' });
    return node;
}

function buildFileTreeChildren(atts, folders, parentId, depth, expandedIds) {
    const pid = parentId || null;
    const childFolders = folders.filter(f => (f.parentId || null) === pid);
    const childAtts = atts.filter(a => (a.folderId || null) === pid);
    const nodes = [];

    for (const folder of childFolders) {
        const expandId = `file-folder:${folder.id}`;
        const folderExpanded = expandedIds ? expandedIds.has(expandId) : true;
        const folderNode = createAssetFolderNode({
            expandId,
            label: folder.name || '(unnamed folder)',
            title: folder.name || '(unnamed folder)',
            children: buildFileTreeChildren(atts, folders, folder.id, depth + 1, expandedIds),
            expanded: folderExpanded,
            depth,
            extraClass: 'outliner-user-folder',
        });
        attachFileAssetInteractions(folderNode, {
            kind: 'folder',
            id: folder.id,
            name: folder.name || '',
        });
        nodes.push(folderNode);
    }

    for (const att of childAtts) {
        const viewable = canOpenAttachment ? canOpenAttachment(att.mimeType) : false;
        const name = att.name || '(unnamed)';
        const sizeStr = getShowOutlinerFileSize() ? formatOutlinerFileSize(att.size) : '';
        const label = `${att.comment ? '💬 ' : ''}${name}${sizeStr ? `  (${sizeStr})` : ''}`;
        const item = createAssetItemNode({
            expandId: `file:${att.id}`,
            label,
            title: viewable
                ? label
                : `${label} — Cannot preview; download from the context menu`,
            muted: !viewable,
            depth,
            onClick: (e) => {
                if (Date.now() - _lastDragEndTime < 300) return;
                handleFileClick(e, item, att.id);
                if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                if (viewable && onOpenAttachment) onOpenAttachment(att);
            },
        });
        attachFileAssetInteractions(item, {
            kind: 'file',
            id: att.id,
            name: att.name || '',
            mimeType: att.mimeType || '',
        });
        nodes.push(item);
    }

    return nodes;
}

function parseFileAsset(li) {
    const kind = li?.dataset?.fileKind;
    if (!kind) return null;
    return {
        kind,
        id: li.dataset.fileId || null,
        name: li.dataset.fileName || '',
        mimeType: li.dataset.fileMime || '',
    };
}

function getFileFolderParentId(folderId) {
    const folders = fileOps.getFolders ? fileOps.getFolders() : [];
    return folders.find(f => f.id === folderId)?.parentId || null;
}

function getFileParentFolderId(fileId) {
    const atts = getAttachments ? getAttachments() : [];
    return atts.find(a => a.id === fileId)?.folderId || null;
}

function isFileFolderDescendant(ancestorId, maybeDescendantId) {
    if (!ancestorId || !maybeDescendantId) return false;
    const folders = fileOps.getFolders ? fileOps.getFolders() : [];
    const byId = new Map(folders.map(f => [f.id, f]));
    const seen = new Set();
    let id = maybeDescendantId;
    while (id) {
        if (id === ancestorId) return true;
        if (seen.has(id)) break;
        seen.add(id);
        id = byId.get(id)?.parentId || null;
    }
    return false;
}

function canDropFileAsset(source, target, pos) {
    if (!source || !target) return false;
    if (source.kind === 'root') return false;
    if (source.kind === target.kind && source.id && source.id === target.id) return false;
    if (source.kind !== 'folder') return true;
    let destFolderId = null;
    if (target.kind === 'root') destFolderId = null;
    else if (target.kind === 'folder' && pos === 'into') destFolderId = target.id;
    else if (target.kind === 'folder') destFolderId = getFileFolderParentId(target.id);
    else destFolderId = getFileParentFolderId(target.id);
    if (destFolderId === source.id || isFileFolderDescendant(source.id, destFolderId)) return false;
    return true;
}

function canDropFileAssets(sources, target, pos) {
    if (!sources?.length || !target) return false;
    if (sources.some(s => s.kind === target.kind && s.id && s.id === target.id)) return false;
    return sources.every(s => canDropFileAsset(s, target, pos));
}

function applyFileAssetsDrop(sources, target, pos) {
    if (!canDropFileAssets(sources, target, pos)) return;

    let destFolderId = null;
    let beforeId;
    let afterId;

    if (target.kind === 'root') {
        destFolderId = null;
    } else if (target.kind === 'folder') {
        if (pos === 'into') {
            destFolderId = target.id;
        } else {
            destFolderId = getFileFolderParentId(target.id);
            if (sources.every(s => s.kind === 'folder')) {
                if (pos === 'before') beforeId = target.id;
                else afterId = target.id;
            }
        }
    } else {
        destFolderId = getFileParentFolderId(target.id);
        if (sources.every(s => s.kind === 'file')) {
            if (pos === 'before') beforeId = target.id;
            else afterId = target.id;
        }
    }

    const fileIds = sources.filter(s => s.kind === 'file').map(s => s.id);
    const folderSources = sources.filter(s => s.kind === 'folder');
    if (fileIds.length) {
        if (fileOps.moveMany) fileOps.moveMany(fileIds, destFolderId, { beforeId, afterId });
        else if (fileOps.move) fileIds.forEach(id => fileOps.move(id, destFolderId, { beforeId, afterId }));
    }
    folderSources.forEach(folder => {
        if (fileOps.moveFolder) fileOps.moveFolder(folder.id, destFolderId, { beforeId, afterId });
    });
}

function attachmentRenameBase(name) {
    const lastDot = (name || '').lastIndexOf('.');
    return lastDot > 0 ? name.slice(0, lastDot) : (name || '');
}

function attachmentRenameExt(name) {
    const lastDot = (name || '').lastIndexOf('.');
    return lastDot > 0 ? name.slice(lastDot) : '';
}

function formatOutlinerFileSize(bytes) {
    if (bytes == null || !Number.isFinite(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const SHOW_OUTLINER_FILE_SIZE_KEY = 'outlinerShowFileSize';

function getShowOutlinerFileSize() {
    try {
        return localStorage.getItem(SHOW_OUTLINER_FILE_SIZE_KEY) === '1';
    } catch (_) {
        return false;
    }
}

function setShowOutlinerFileSize(show) {
    try {
        localStorage.setItem(SHOW_OUTLINER_FILE_SIZE_KEY, show ? '1' : '0');
    } catch (_) { /* ignore */ }
    notifyOutlinerProjectContentsChanged();
}

function applyFileMultiSelectClasses() {
    if (!treeEl) return;
    const liveIds = new Set(
        Array.from(treeEl.querySelectorAll('[data-file-kind="file"]')).map(li => li.dataset.fileId)
    );
    for (const id of [...selectedFileIds]) {
        if (!liveIds.has(id)) selectedFileIds.delete(id);
    }
    treeEl.querySelectorAll('[data-file-kind="file"]').forEach(li => {
        const on = selectedFileIds.has(li.dataset.fileId);
        const isPrimary = selectedExpandId === `file:${li.dataset.fileId}`;
        li.classList.toggle('outliner-group-member', on && selectedFileIds.size > 1 && !isPrimary);
    });
}

function clearFileMultiSelection() {
    selectedFileIds.clear();
    fileSelectAnchorId = null;
    applyFileMultiSelectClasses();
}

function siblingFileItems(li) {
    const parent = li?.parentElement;
    if (!parent) return [];
    return Array.from(parent.children).filter(el => el.dataset?.fileKind === 'file');
}

function handleFileClick(e, li, fileId) {
    clearDocMultiSelection();
    if (e.ctrlKey || e.metaKey || e.shiftKey) e.preventDefault();
    const expandId = `file:${fileId}`;
    const additive = !!(e.ctrlKey || e.metaKey);
    const range = !!e.shiftKey && !additive;

    if (range) {
        const siblings = siblingFileItems(li);
        const anchorId = fileSelectAnchorId
            && siblings.some(s => s.dataset.fileId === fileSelectAnchorId)
            ? fileSelectAnchorId
            : fileId;
        const fromIdx = siblings.findIndex(s => s.dataset.fileId === anchorId);
        const toIdx = siblings.findIndex(s => s.dataset.fileId === fileId);
        if (fromIdx >= 0 && toIdx >= 0) {
            const a = Math.min(fromIdx, toIdx);
            const b = Math.max(fromIdx, toIdx);
            selectedFileIds.clear();
            siblings.slice(a, b + 1).forEach(s => selectedFileIds.add(s.dataset.fileId));
        } else {
            selectedFileIds.clear();
            selectedFileIds.add(fileId);
            fileSelectAnchorId = fileId;
        }
        selectOutlinerAssetByExpandId(expandId, { scroll: false });
        applyFileMultiSelectClasses();
        return;
    }

    if (additive) {
        if (selectedFileIds.has(fileId)) {
            selectedFileIds.delete(fileId);
            if (selectedExpandId === expandId) {
                const next = [...selectedFileIds][selectedFileIds.size - 1];
                if (next) selectOutlinerAssetByExpandId(`file:${next}`, { scroll: false });
                else {
                    selectedExpandId = null;
                    if (activeTreeNode) activeTreeNode.classList.remove('outliner-selected');
                    activeTreeNode = null;
                }
            }
        } else {
            if (selectedFileIds.size === 0) {
                const currentId = parseFileExpandId(selectedExpandId);
                if (currentId) selectedFileIds.add(currentId);
            }
            selectedFileIds.add(fileId);
            selectOutlinerAssetByExpandId(expandId, { scroll: false });
        }
        fileSelectAnchorId = fileId;
        applyFileMultiSelectClasses();
        return;
    }

    selectedFileIds.clear();
    selectedFileIds.add(fileId);
    fileSelectAnchorId = fileId;
    selectOutlinerAssetByExpandId(expandId, { scroll: false });
    applyFileMultiSelectClasses();
}

function showFileAssetCtxMenu(x, y, asset, li) {
    hideAddPrimitiveMenu();
    const menu = getOrCreateCtxMenu();
    menu.innerHTML = '';

    const addSep = () => {
        const sep = document.createElement('div');
        sep.className = 'outliner-ctx-sep';
        menu.appendChild(sep);
    };

    if (asset.kind === 'root' || asset.kind === 'folder') {
        const parentId = asset.kind === 'folder' ? asset.id : null;
        menu.appendChild(createDocCtxItem('Add files…', () => {
            if (fileOps.addFiles) fileOps.addFiles(parentId);
        }));
        menu.appendChild(createDocCtxItem('Add folder…', () => {
            if (fileOps.addFolder) fileOps.addFolder(parentId);
        }));
        menu.appendChild(createDocCtxItem('Paste image…', () => {
            if (fileOps.pasteImage) fileOps.pasteImage(parentId);
        }));
        menu.appendChild(createDocCtxItem('New image…', () => {
            if (fileOps.newImage) fileOps.newImage(parentId);
        }));
        if (fileOps.captureScreen) {
            menu.appendChild(createDocCtxItem('Screen capture…', () => {
                fileOps.captureScreen(parentId);
            }));
        }
        menu.appendChild(createDocCtxItem('New folder', () => {
            if (!fileOps.createFolder) return;
            const folder = fileOps.createFolder(parentId);
            if (!folder?.id) return;
            const newLi = revealAssetNode(`file-folder:${folder.id}`);
            if (newLi) {
                startAssetInlineRename(newLi, folder.name || 'New folder', (name) => {
                    if (fileOps.renameFolder) fileOps.renameFolder(folder.id, name);
                });
            }
        }));
        addSep();
        menu.appendChild(createDocCtxItem('Download as ZIP', () => {
            if (fileOps.downloadZip) fileOps.downloadZip(parentId);
        }));
        menu.appendChild(createDocCtxItem('Open all viewable…', () => {
            if (fileOps.openAllViewable) fileOps.openAllViewable(parentId);
        }));
        menu.appendChild(createDocCtxItem('Edit all images…', () => {
            if (fileOps.editAllImages) fileOps.editAllImages(parentId);
        }));
        if (asset.kind === 'root') {
            addSep();
            const showSize = getShowOutlinerFileSize();
            menu.appendChild(createDocCtxItem(
                `${showSize ? '✓ ' : ''}Show file size`,
                () => setShowOutlinerFileSize(!showSize),
                'outliner-ctx-pref'
            ));
        }
    }

    if (asset.kind === 'folder') {
        addSep();
        menu.appendChild(createDocCtxItem('Rename', () => {
            startAssetInlineRename(li, asset.name, (name) => {
                if (fileOps.renameFolder) fileOps.renameFolder(asset.id, name);
            });
        }));
        menu.appendChild(createDocCtxItem('Delete folder', () => {
            if (fileOps.deleteFolder) fileOps.deleteFolder(asset.id);
        }, 'outliner-ctx-danger'));
    }

    if (asset.kind === 'file') {
        const mime = asset.mimeType || '';
        const viewable = canOpenAttachment ? canOpenAttachment(mime) : false;
        if (viewable) {
            menu.appendChild(createDocCtxItem('Open', () => {
                selectOutlinerAssetByExpandId(`file:${asset.id}`, { scroll: false });
                const att = getAttachments?.().find(a => a.id === asset.id);
                if (att && onOpenAttachment) onOpenAttachment(att);
            }));
        }
        if (mime.startsWith('image/')) {
            menu.appendChild(createDocCtxItem('Edit', () => {
                if (fileOps.edit) fileOps.edit(asset.id);
            }));
            menu.appendChild(createDocCtxItem('Convert to PDF…', () => {
                if (fileOps.convertImageToPdf) fileOps.convertImageToPdf(asset.id);
            }));
        }
        if (mime === 'application/pdf') {
            menu.appendChild(createDocCtxItem('Edit PDF…', () => {
                if (fileOps.editPdf) fileOps.editPdf(asset.id);
            }));
            menu.appendChild(createDocCtxItem('Manage PDF pages…', () => {
                if (fileOps.managePdfPages) fileOps.managePdfPages(asset.id);
            }));
            menu.appendChild(createDocCtxItem('Convert to images…', () => {
                if (fileOps.convertPdfToImages) fileOps.convertPdfToImages(asset.id);
            }));
        }
        menu.appendChild(createDocCtxItem('Download', () => {
            if (fileOps.download) fileOps.download(asset.id);
        }));
        menu.appendChild(createDocCtxItem('Rename', () => {
            startAssetInlineRename(li, attachmentRenameBase(asset.name), (base) => {
                if (fileOps.rename) fileOps.rename(asset.id, base + attachmentRenameExt(asset.name));
            });
        }));
        menu.appendChild(createDocCtxItem('Delete', () => {
            const ids = (selectedFileIds.size > 1 && selectedFileIds.has(asset.id))
                ? [...selectedFileIds]
                : [asset.id];
            if (ids.length > 1) {
                if (fileOps.deleteMany) fileOps.deleteMany(ids);
                else if (fileOps.deleteOne) ids.forEach(id => fileOps.deleteOne(id));
            } else if (fileOps.deleteOne) {
                fileOps.deleteOne(asset.id);
            }
        }, 'outliner-ctx-danger'));
    }

    positionFixedMenu(menu, x, y);
}

function attachFileAssetInteractions(li, asset) {
    li.dataset.fileKind = asset.kind;
    if (asset.id) li.dataset.fileId = asset.id;
    if (asset.name) li.dataset.fileName = asset.name;
    if (asset.mimeType) li.dataset.fileMime = asset.mimeType;

    const row = li.querySelector(':scope > .outliner-row');
    if (!row) return;

    row.addEventListener('click', (e) => {
        if (Date.now() - _lastDragEndTime < 300) return;
        if (asset.kind === 'file') {
            handleFileClick(e, li, asset.id);
            return;
        }
        clearDocMultiSelection();
        clearFileMultiSelection();
        if (li.dataset.expandId) {
            selectOutlinerAssetByExpandId(li.dataset.expandId, { scroll: false });
        }
    });

    if (asset.kind !== 'root') {
        row.draggable = true;
        row.addEventListener('dragstart', (e) => {
            _draggedObj = null;
            _draggedObjs = null;
            _draggedDocAsset = null;
            _draggedDocAssets = [];
            if (asset.kind === 'file' && selectedFileIds.has(asset.id) && selectedFileIds.size > 1) {
                _draggedFileAssets = [...selectedFileIds].map(id => ({ kind: 'file', id }));
            } else {
                _draggedFileAssets = [{ kind: asset.kind, id: asset.id }];
            }
            _draggedFileAsset = _draggedFileAssets[0];
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', '');
            li.classList.add('outliner-drag-source');
            _draggedFileAssets.forEach(src => {
                const srcLi = treeEl.querySelector(`[data-file-kind="${src.kind}"][data-file-id="${src.id}"]`);
                if (srcLi) srcLi.classList.add('outliner-drag-source');
            });
        });
        row.addEventListener('dragend', () => {
            _lastDragEndTime = Date.now();
            treeEl.querySelectorAll('.outliner-drag-source').forEach(el => el.classList.remove('outliner-drag-source'));
            clearDropIndicators();
            _draggedFileAsset = null;
            _draggedFileAssets = [];
            _dragOverLi = null;
            _dragOverPos = null;
        });
    }

    row.addEventListener('dragover', (e) => {
        if (!_draggedFileAsset) return;
        const target = parseFileAsset(li);
        const rect = row.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const h = rect.height;
        const pos = target.kind === 'root'
            ? 'into'
            : (y < h * 0.25 ? 'before' : y > h * 0.75 ? 'after' : 'into');
        const sources = _draggedFileAssets.length ? _draggedFileAssets : (_draggedFileAsset ? [_draggedFileAsset] : []);
        if (!canDropFileAssets(sources, target, pos)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (_dragOverLi !== li || _dragOverPos !== pos) {
            clearDropIndicators();
            _dragOverLi = li;
            _dragOverPos = pos;
            li.classList.add('outliner-drop-' + pos);
        }
    });

    row.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const sources = _draggedFileAssets.length ? _draggedFileAssets : (_draggedFileAsset ? [_draggedFileAsset] : []);
        const target = parseFileAsset(_dragOverLi || li);
        const pos = _dragOverPos || 'into';
        clearDropIndicators();
        _dragOverLi = null;
        _dragOverPos = null;
        if (sources.length && target) applyFileAssetsDrop(sources, target, pos);
    });

    row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (asset.kind === 'file' && !selectedFileIds.has(asset.id)) {
            handleFileClick({ ctrlKey: false, metaKey: false, shiftKey: false }, li, asset.id);
        }
        showFileAssetCtxMenu(e.clientX, e.clientY, asset, li);
    });

    let longPressTimer = null;
    row.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        longPressTimer = setTimeout(() => {
            longPressTimer = null;
            showFileAssetCtxMenu(touch.clientX, touch.clientY, asset, li);
        }, 500);
    }, { passive: true });
    const cancelLongPress = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    };
    row.addEventListener('touchend', cancelLongPress, { passive: true });
    row.addEventListener('touchcancel', cancelLongPress, { passive: true });
    row.addEventListener('touchmove', cancelLongPress, { passive: true });
}

function createArrangementsFolderNode(expanded) {
    const arrangements = getArrangements ? getArrangements() : [];
    const activeId = getActiveArrangementId ? getActiveArrangementId() : null;
    const dirty = isArrangementDirty ? isArrangementDirty() : false;

    const items = arrangements.map(arrangement => {
        const isActive = arrangement.id === activeId;
        const isDirty = isActive && dirty;
        const extraClass = [
            isActive ? 'outliner-asset-active' : '',
            isDirty ? 'outliner-asset-dirty' : '',
        ].filter(Boolean).join(' ');
        const titleParts = [arrangement.name || '(unnamed)'];
        if (arrangement.camera) titleParts.push('📷 camera saved');
        if (isDirty) titleParts.push('(modified)');
        return createAssetItemNode({
            expandId: `arrangement:${arrangement.id}`,
            label: arrangement.name || '(unnamed)',
            title: titleParts.join(' — '),
            extraClass: extraClass || undefined,
            onClick: () => {
                selectedExpandId = `arrangement:${arrangement.id}`;
                if (onApplyArrangement) onApplyArrangement(arrangement);
            },
        });
    });

    return createAssetFolderNode({
        expandId: 'project:arrangements',
        label: `Arrangements (${arrangements.length})`,
        children: items,
        expanded,
        extraClass: 'outliner-project-folder',
    });
}

function createSequencesFolderNode(expanded, expandedIds) {
    const sequences = getSequences ? getSequences() : [];
    const activeId = getActiveSequenceId ? getActiveSequenceId() : null;
    const currentStep = getCurrentStepIndex ? getCurrentStepIndex() : -1;
    const detached = isPlaybackDetached ? isPlaybackDetached() : false;

    const wfFolders = sequences.map((wf, index) => {
        const isActive = wf.id === activeId;
        const wfExpanded = expandedIds
            ? expandedIds.has(`sequence:${wf.id}`)
            : isActive;
        const steps = wf.steps || [];

        const assembledActive = isActive && !detached && currentStep === -1;
        const items = [
            createAssetItemNode({
                expandId: `sequence:${wf.id}:assembled`,
                label: '0: Assembled',
                title: 'Assembled',
                extraClass: assembledActive ? 'outliner-asset-active' : undefined,
                depth: 2,
                onClick: () => {
                    selectedExpandId = `sequence:${wf.id}:assembled`;
                    if (onGoToAssembled) onGoToAssembled(index);
                },
            }),
            ...steps.map((step, i) => {
                const isStepActive = isActive && !detached && currentStep === i;
                const titleParts = [step.name || '(unnamed)'];
                if (step.camera) titleParts.push('📷 camera saved');
                return createAssetItemNode({
                    expandId: `sequence:${wf.id}:step:${i}`,
                    label: `${i + 1}: ${step.name || '(unnamed)'}`,
                    title: titleParts.join(' — '),
                    extraClass: isStepActive ? 'outliner-asset-active' : undefined,
                    depth: 2,
                    onClick: () => {
                        selectedExpandId = `sequence:${wf.id}:step:${i}`;
                        if (onGoToStep) onGoToStep(index, i);
                    },
                });
            }),
        ];

        return createAssetFolderNode({
            expandId: `sequence:${wf.id}`,
            label: wf.name || '(unnamed)',
            title: wf.name || '(unnamed)',
            children: items,
            expanded: wfExpanded,
            depth: 1,
            extraClass: isActive ? 'outliner-asset-active' : undefined,
            onClick: () => {
                selectedExpandId = `sequence:${wf.id}:assembled`;
                if (onSelectSequence) onSelectSequence(index);
            },
        });
    });

    return createAssetFolderNode({
        expandId: 'project:sequences',
        label: `Sequences (${sequences.length})`,
        children: wfFolders,
        expanded,
        extraClass: 'outliner-project-folder',
    });
}

function createAssetFolderNode({ expandId, label, title, children, expanded, depth = 0, extraClass, onClick }) {
    const li = document.createElement('li');
    li.className = 'outliner-node outliner-asset outliner-asset-folder'
        + (extraClass ? ` ${extraClass}` : '');
    li.dataset.expandId = expandId;

    const row = document.createElement('div');
    row.className = 'outliner-row';
    row.style.paddingLeft = (4 + depth * 16) + 'px';

    const hasChildren = children.length > 0;
    const arrow = document.createElement('span');
    arrow.className = 'outliner-arrow';
    if (hasChildren) {
        arrow.textContent = expanded ? '▼' : '▶';
        arrow.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAssetExpand(li);
        });
    } else {
        arrow.textContent = ' ';
        arrow.style.visibility = 'hidden';
    }
    row.appendChild(arrow);

    const labelEl = document.createElement('span');
    labelEl.className = 'outliner-label';
    labelEl.textContent = label;
    if (title) labelEl.title = title;
    labelEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onClick) onClick();
        else if (hasChildren) toggleAssetExpand(li);
    });
    row.appendChild(labelEl);
    li.appendChild(row);

    if (hasChildren) {
        const childList = document.createElement('ul');
        childList.className = 'outliner-children';
        childList.style.display = expanded ? '' : 'none';
        for (const child of children) childList.appendChild(child);
        li.appendChild(childList);
        if (expanded) li.classList.add('outliner-expanded');
    }
    return li;
}

function createAssetItemNode({ expandId, label, title, muted, extraClass, onClick, depth = 1 }) {
    const li = document.createElement('li');
    li.className = 'outliner-node outliner-asset'
        + (muted ? ' outliner-asset-muted' : '')
        + (extraClass ? ` ${extraClass}` : '');
    li.dataset.expandId = expandId;

    const row = document.createElement('div');
    row.className = 'outliner-row';
    row.style.paddingLeft = (4 + depth * 16) + 'px';

    const arrow = document.createElement('span');
    arrow.className = 'outliner-arrow';
    arrow.textContent = ' ';
    arrow.style.visibility = 'hidden';
    row.appendChild(arrow);

    const labelEl = document.createElement('span');
    labelEl.className = 'outliner-label';
    labelEl.textContent = label;
    if (title) labelEl.title = title;
    if (onClick) {
        labelEl.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick(e);
        });
    }
    row.appendChild(labelEl);
    li.appendChild(row);
    return li;
}

function toggleAssetExpand(li) {
    const childList = li.querySelector(':scope > .outliner-children');
    const arrow = li.querySelector(':scope > .outliner-row > .outliner-arrow');
    if (!childList) return;
    const isExpanded = childList.style.display !== 'none';
    if (isExpanded) {
        childList.style.display = 'none';
        if (arrow) arrow.textContent = '▶';
        li.classList.remove('outliner-expanded');
    } else {
        childList.style.display = '';
        if (arrow) arrow.textContent = '▼';
        li.classList.add('outliner-expanded');
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

    if (onGetGroupSelection) {
        const sel = onGetGroupSelection();
        if (sel && sel.includes(obj)) {
            li.classList.add('outliner-group-member');
            groupHighlightNodes.add(li);
        }
    }

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
            if (activeTreeNode) activeTreeNode.classList.remove('outliner-selected');
            selectedExpandId = null;
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
        _draggedDocAsset = null;
        _draggedDocAssets = [];
        _draggedFileAsset = null;
        _draggedFileAssets = [];
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
 * Empty pattern clears the filter and restores the expand state from before filtering.
 */
function filterTree(pattern) {
    if (!treeEl) return;
    if (!pattern || !pattern.trim()) {
        currentMatchSet = new Set();
        const selectedObj = activeTreeNode ? domToObject.get(activeTreeNode) : null;
        const expanded = preFilterExpandedUUIDs;
        preFilterExpandedUUIDs = null;
        rebuildTreeDom(expanded);
        if (selectedObj) highlightObject(selectedObj);
        return;
    }
    if (preFilterExpandedUUIDs === null) {
        preFilterExpandedUUIDs = collectExpandedUUIDs();
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
    filterAssetSection(regex);
}

function filterAssetSection(regex) {
    const folders = treeEl.querySelectorAll(':scope > .outliner-asset-folder');
    let anyFolderVisible = false;
    for (const folder of folders) {
        if (applyAssetFilter(folder, regex, false)) anyFolderVisible = true;
    }
    const sep = treeEl.querySelector(':scope > .outliner-project-section');
    if (sep) sep.style.display = anyFolderVisible ? '' : 'none';
}

/**
 * Show an asset node when its label matches, an ancestor matched, or a descendant matches.
 * Matching folders expand so nested hits stay visible.
 * @returns {boolean} whether this node should be visible
 */
function applyAssetFilter(node, regex, ancestorMatch) {
    const lab = node.querySelector(':scope > .outliner-row > .outliner-label');
    const selfMatch = !!(lab && regex.test(lab.textContent));
    const forceShow = ancestorMatch || selfMatch;
    const childList = node.querySelector(':scope > .outliner-children');
    let anyDescendantMatch = false;
    if (childList) {
        for (const child of childList.children) {
            if (!child.classList.contains('outliner-asset')) continue;
            if (applyAssetFilter(child, regex, forceShow)) anyDescendantMatch = true;
        }
    }
    const visible = forceShow || anyDescendantMatch;
    node.style.display = visible ? '' : 'none';
    if (visible && childList && childList.children.length > 0) {
        childList.style.display = '';
        const arrow = node.querySelector(':scope > .outliner-row > .outliner-arrow');
        if (arrow && arrow.style.visibility !== 'hidden') arrow.textContent = '▼';
        node.classList.add('outliner-expanded');
    }
    return visible;
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
