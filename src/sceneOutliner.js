// sceneOutliner.js – Scene hierarchy panel (left side, collapsible, resizable)

/** @type {HTMLDivElement} */
let panelEl = null;
/** @type {HTMLDivElement} */
let treeEl = null;
/** @type {boolean} */
let isOpen = false;

// External callbacks set via init()
let onSelectObject = null;
let onToggleVisibility = null;
let onGroupAdd = null;

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
let renameBtnEl = null;
let currentMatchSet = new Set();

// -------------------------------------------------------------------
// Public API
// -------------------------------------------------------------------

/**
 * Create the outliner DOM (panel + resize handle). Call once at startup.
 * @param {{ onSelect: Function, onToggleVisibility: Function }} callbacks
 * @returns {HTMLDivElement} the panel element (for guiWrapper hit-testing)
 */
export function initOutliner({ onSelect, onToggleVisibility: onVis, onGroupAdd: onGroupAddCb }) {
    onSelectObject = onSelect;
    onToggleVisibility = onVis;
    onGroupAdd = onGroupAddCb || null;

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
    searchInputEl.placeholder = 'Hledat… (podľéka*)';
    searchInputEl.className = 'outliner-search-input';
    searchInputEl.addEventListener('input', () => {
        filterTree(searchInputEl.value);
        clearBtnEl.style.display = searchInputEl.value ? 'flex' : 'none';
    });
    clearBtnEl = document.createElement('button');
    clearBtnEl.className = 'outliner-search-clear';
    clearBtnEl.textContent = '×';
    clearBtnEl.style.display = 'none';
    clearBtnEl.title = 'Vymazat filtr';
    clearBtnEl.addEventListener('click', () => {
        searchInputEl.value = '';
        filterTree('');
        clearBtnEl.style.display = 'none';
    });
    renameBtnEl = document.createElement('button');
    renameBtnEl.className = 'outliner-search-rename';
    renameBtnEl.textContent = '\u270f';
    renameBtnEl.style.display = 'none';
    renameBtnEl.title = 'Hromadn\u00e9 p\u0159ejmenov\u00e1n\u00ed';
    renameBtnEl.addEventListener('click', openRenameDialog);
    searchBar.appendChild(searchInputEl);
    searchBar.appendChild(clearBtnEl);
    searchBar.appendChild(renameBtnEl);
    panelEl.appendChild(searchBar);

    // Scrollable tree area
    treeEl = document.createElement('ul');
    treeEl.className = 'outliner-tree';
    panelEl.appendChild(treeEl);

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
export function rebuildTree(loadedModels) {
    lastLoadedModels = loadedModels;
    if (!treeEl) return;
    // Reset search input when rebuilding from outside (new model loaded)
    if (searchInputEl && searchInputEl.value) {
        searchInputEl.value = '';
        if (clearBtnEl) clearBtnEl.style.display = 'none';
    }
    treeEl.innerHTML = '';
    objectToDom.clear = clearWeakMapViaTree; // WeakMap has no clear — we just rebuild
    activeTreeNode = null;

    for (const root of loadedModels) {
        const li = createTreeNode(root, 0);
        treeEl.appendChild(li);
    }
}

/**
 * Highlight a node in the tree that matches the given Object3D.
 * @param {import('three').Object3D|null} object
 */
export function highlightObject(object) {
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
        targetLi.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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

/**
 * Create a single <li> tree node for an Object3D.
 * Children are created lazily on first expand.
 */
function createTreeNode(obj, depth) {
    const li = document.createElement('li');
    li.className = 'outliner-node';
    domToObject.set(li, obj);
    objectToDom.set(obj, li);

    const hasChildren = obj.children && obj.children.length > 0;

    // Row container
    const row = document.createElement('div');
    row.className = 'outliner-row';
    row.style.paddingLeft = (depth * 16 + 4) + 'px';

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

    // 3) Visibility eye
    const eye = document.createElement('span');
    eye.className = 'outliner-eye';
    eye.textContent = obj.visible ? '👁' : '🚫';
    eye.title = obj.visible ? 'Hide' : 'Show';
    eye.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onToggleVisibility) onToggleVisibility(obj);
    });
    row.appendChild(eye);

    li.appendChild(row);

    // Children container (lazy — not populated yet)
    if (hasChildren) {
        const childList = document.createElement('ul');
        childList.className = 'outliner-children';
        childList.style.display = 'none';
        li.appendChild(childList);
    }

    return li;
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
        if (childList.children.length === 0 && obj.children.length > 0) {
            for (const child of obj.children) {
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
                    for (const child of obj.children) {
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
    for (const child of obj.children) {
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
    if (obj.children.length > 0) {
        const childList = li.querySelector(':scope > .outliner-children');
        if (childList) {
            if (childList.children.length === 0) {
                for (const child of obj.children) {
                    childList.appendChild(createTreeNode(child, depth + 1));
                }
            }
            childList.style.display = '';
            const arrow = li.querySelector(':scope > .outliner-row > .outliner-arrow');
            if (arrow) arrow.textContent = '\u25bc';
            for (const child of obj.children) {
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
        if (renameBtnEl) renameBtnEl.style.display = 'none';
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
    if (renameBtnEl) renameBtnEl.style.display = currentMatchSet.size > 0 ? 'flex' : 'none';
}

// -------------------------------------------------------------------
// Bulk rename dialog
// -------------------------------------------------------------------

/** Returns matched objects in DFS tree order. */
function getMatchedObjectsInOrder() {
    const result = [];
    function walk(obj) {
        if (currentMatchSet.has(obj)) result.push(obj);
        for (const child of obj.children) walk(child);
    }
    for (const root of lastLoadedModels) walk(root);
    return result;
}

/** Open the bulk-rename modal for all currently filtered objects. */
function openRenameDialog() {
    const objects = getMatchedObjectsInOrder();
    if (objects.length === 0) return;
    if (document.querySelector('.outliner-rename-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'outliner-rename-overlay';
    const modal = document.createElement('div');
    modal.className = 'outliner-rename-modal';
    modal.addEventListener('click', e => e.stopPropagation());
    overlay.addEventListener('click', close);

    const titleEl = document.createElement('div');
    titleEl.className = 'outliner-rename-title';
    titleEl.textContent = `Hromadn\u00e9 p\u0159ejmenov\u00e1n\u00ed (${objects.length})`;
    modal.appendChild(titleEl);

    const tabs = document.createElement('div');
    tabs.className = 'outliner-rename-tabs';
    const tabFR = document.createElement('button');
    tabFR.className = 'outliner-rename-tab outliner-rename-tab-active';
    tabFR.textContent = 'Najdi a nahrad\u0165';
    const tabFull = document.createElement('button');
    tabFull.className = 'outliner-rename-tab';
    tabFull.textContent = 'Cel\u00fd n\u00e1zev';
    tabs.appendChild(tabFR);
    tabs.appendChild(tabFull);
    modal.appendChild(tabs);

    // Panel 1 — Find & Replace
    const panelFR = document.createElement('div');
    panelFR.className = 'outliner-rename-panel';
    const rowFind = document.createElement('div');
    rowFind.className = 'outliner-rename-row';
    const lblFind = document.createElement('label');
    lblFind.textContent = 'Naj\u00edt:';
    const inputFind = document.createElement('input');
    inputFind.type = 'text';
    inputFind.className = 'outliner-rename-input';
    inputFind.placeholder = 'p\u016fvodn\u00ed text';
    rowFind.appendChild(lblFind);
    rowFind.appendChild(inputFind);
    const rowReplace = document.createElement('div');
    rowReplace.className = 'outliner-rename-row';
    const lblReplace = document.createElement('label');
    lblReplace.textContent = 'Nahradit:';
    const inputReplace = document.createElement('input');
    inputReplace.type = 'text';
    inputReplace.className = 'outliner-rename-input';
    inputReplace.placeholder = 'nov\u00fd text';
    rowReplace.appendChild(lblReplace);
    rowReplace.appendChild(inputReplace);
    panelFR.appendChild(rowFind);
    panelFR.appendChild(rowReplace);

    // Panel 2 — Full rename
    const panelFull = document.createElement('div');
    panelFull.className = 'outliner-rename-panel';
    panelFull.style.display = 'none';
    const rowFull = document.createElement('div');
    rowFull.className = 'outliner-rename-row';
    const lblFull = document.createElement('label');
    lblFull.textContent = 'Nov\u00fd n\u00e1zev:';
    const inputFull = document.createElement('input');
    inputFull.type = 'text';
    inputFull.className = 'outliner-rename-input';
    inputFull.placeholder = 'n\u00e1zev nebo n\u00e1zev_{n}';
    rowFull.appendChild(lblFull);
    rowFull.appendChild(inputFull);
    const hint = document.createElement('div');
    hint.className = 'outliner-rename-hint';
    hint.textContent = 'Pou\u017eij {n} pro \u010d\u00edslovan\u00ed (1, 2, \u2026)';
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
    btnCancel.textContent = 'Zru\u0161it';
    const btnConfirm = document.createElement('button');
    btnConfirm.className = 'outliner-rename-btn outliner-rename-btn-primary';
    btnConfirm.textContent = 'P\u0159ejmenovat';
    btns.appendChild(btnCancel);
    btns.appendChild(btnConfirm);
    modal.appendChild(btns);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let mode = 'fr';
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
            const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return orig.replace(new RegExp(escaped, 'gi'), inputReplace.value);
        } else {
            const pat = inputFull.value;
            if (!pat) return orig;
            return pat.replace(/\{n\}/g, String(idx + 1));
        }
    }

    function updatePreview() {
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
