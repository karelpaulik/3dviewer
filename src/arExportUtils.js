// arExportUtils.js – normalize scene for AR / model-viewer export
import * as THREE from 'three';
import { convertToStandardMaterial } from './materialUtils.js';

/** Target longest axis in meters (AR-friendly human scale). */
export const AR_TARGET_MAX_DIM = 1.5;

export function isObjectHierarchyVisible(obj) {
    let cur = obj;
    while (cur) {
        if (!cur.visible) return false;
        cur = cur.parent;
    }
    return true;
}

function fixExtremeScales(root) {
    root.traverse((child) => {
        const s = child.scale;
        if (
            Math.abs(s.x) < 0.1 || Math.abs(s.x) > 10 ||
            Math.abs(s.y) < 0.1 || Math.abs(s.y) > 10 ||
            Math.abs(s.z) < 0.1 || Math.abs(s.z) > 10
        ) {
            child.scale.set(1, 1, 1);
        }
    });
}

export function removeNonVisibleMeshes(root) {
    const toRemove = [];
    root.traverse((child) => {
        if (child.isMesh && !isObjectHierarchyVisible(child)) {
            toRemove.push(child);
        }
    });
    toRemove.forEach((mesh) => mesh.parent?.remove(mesh));
}

export function simplifyArMaterials(root) {
    root.traverse((child) => {
        if (!child.isMesh || !child.material) return;
        if (Array.isArray(child.material)) {
            child.material = child.material.map((m) => convertToStandardMaterial(m));
        } else {
            child.material = convertToStandardMaterial(child.material);
        }
    });
}

export function countArTriangles(root) {
    let count = 0;
    root.traverse((child) => {
        if (!child.isMesh || !child.geometry || !isObjectHierarchyVisible(child)) return;
        const index = child.geometry.index;
        if (index) count += index.count / 3;
        else if (child.geometry.attributes.position) {
            count += child.geometry.attributes.position.count / 3;
        }
    });
    return Math.floor(count);
}

/**
 * Center export root at origin and scale to AR-friendly size.
 * @returns {{ maxDim: number, triangleCount: number }}
 */
export function normalizeArExportRoot(root, targetMaxDim = AR_TARGET_MAX_DIM) {
    root.updateMatrixWorld(true);

    const box = new THREE.Box3();
    root.traverse((child) => {
        if (child.isMesh && isObjectHierarchyVisible(child)) {
            box.expandByObject(child);
        }
    });

    if (box.isEmpty()) {
        return { maxDim: 0, triangleCount: countArTriangles(root) };
    }

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? targetMaxDim / maxDim : 1;

    root.position.sub(center);
    root.scale.multiplyScalar(scale);
    root.updateMatrixWorld(true);

    return { maxDim, triangleCount: countArTriangles(root) };
}

/**
 * Prepare cloned export group for AR (materials, visibility, scale).
 * @returns {{ maxDim: number, triangleCount: number }}
 */
export function prepareArExportGroup(root) {
    fixExtremeScales(root);
    removeNonVisibleMeshes(root);
    simplifyArMaterials(root);
    return normalizeArExportRoot(root);
}
