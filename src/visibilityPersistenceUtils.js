/**
 * Persist user-hidden object visibility through GLB export/import.
 * glTF has no standard node.visible; we store _appUserHidden in userData extras.
 */

const HIDDEN_FLAG = '_appUserHidden';

/**
 * Copy visibility state from original to export clone (same child order after clone(true)).
 * @param {import('three').Object3D} original
 * @param {import('three').Object3D} clone
 */
export function applyVisibilityToExportClone(original, clone) {
    function walk(orig, cln) {
        if (!orig.visible) {
            cln.visible = false;
            cln.userData[HIDDEN_FLAG] = true;
        }
        const count = Math.min(orig.children.length, cln.children.length);
        for (let i = 0; i < count; i++) {
            walk(orig.children[i], cln.children[i]);
        }
    }
    walk(original, clone);
}

/**
 * Restore hidden objects after GLB import.
 * @param {import('three').Object3D} root
 * @param {import('three').Object3D[]} hiddenObjectsArray
 * @param {(obj: import('three').Object3D) => void} updateVisibilityIconFn
 */
export function restoreVisibilityFromImport(root, hiddenObjectsArray, updateVisibilityIconFn) {
    const marked = [];
    root.traverse(node => {
        if (!node.userData[HIDDEN_FLAG]) return;
        node.visible = false;
        marked.push(node);
        delete node.userData[HIDDEN_FLAG];
    });

    const markedSet = new Set(marked);
    for (const node of marked) {
        let p = node.parent;
        let ancestorMarked = false;
        while (p) {
            if (markedSet.has(p)) {
                ancestorMarked = true;
                break;
            }
            p = p.parent;
        }
        if (!ancestorMarked && !hiddenObjectsArray.includes(node)) {
            hiddenObjectsArray.push(node);
        }
        if (updateVisibilityIconFn) updateVisibilityIconFn(node);
    }
}
