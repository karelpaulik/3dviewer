/**
 * Strip transient selection highlight (emissive + x-ray) from export clones
 * without mutating live scene materials.
 */

function sanitizeExportMaterial(mat) {
    const mc = mat.clone();
    if (mc.emissive) mc.emissive.setHex(0x000000);
    mc.depthTest = true;
    mc.needsUpdate = true;
    return mc;
}

/**
 * Clone materials on export subtree and reset selection highlight state.
 * @param {import('three').Object3D} root
 */
export function stripSelectionHighlightFromExportSubtree(root) {
    root.traverse(child => {
        if (!child.isMesh || !child.material) return;
        if (Array.isArray(child.material)) {
            child.material = child.material.map(m => sanitizeExportMaterial(m));
        } else {
            child.material = sanitizeExportMaterial(child.material);
        }
        child.renderOrder = 0;
    });
}
