// geometryOperationsUtils.js – flat / smooth vertex normal operations
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { collectDescendantMeshes } from './booleanUtils.js';

/**
 * @param {THREE.Object3D} obj
 * @returns {boolean}
 */
export function isObjectVisibleInScene(obj) {
    let o = obj;
    while (o) {
        if (!o.visible) return false;
        o = o.parent;
    }
    return true;
}

/**
 * @param {THREE.Mesh} mesh
 * @returns {boolean}
 */
export function isMeshEligibleForNormalsOps(mesh) {
    return !!mesh?.isMesh && !!mesh.geometry && !mesh.isSectionMesh
        && !mesh.userData._isMeasurement
        && !mesh.userData._isAnnotation
        && !mesh.userData._isAnnotation3d
        && !mesh.userData._isCadDim3d;
}

/**
 * @param {THREE.Mesh[]} meshList
 * @returns {THREE.Mesh[]}
 */
export function collectAllMeshesForNormalsDisplay(meshList) {
    return meshList.filter((mesh) => isMeshEligibleForNormalsOps(mesh) && isObjectVisibleInScene(mesh));
}

/**
 * @param {THREE.Object3D|null} root
 * @returns {THREE.Mesh[]}
 */
export function collectMeshesForGeometryOps(root) {
    if (!root) return [];
    if (isMeshEligibleForNormalsOps(root)) {
        return [root];
    }
    return collectDescendantMeshes(root);
}

/**
 * Split indexed vertices and recompute face-aligned vertex normals.
 * @param {THREE.BufferGeometry} geometry
 * @returns {THREE.BufferGeometry}
 */
export function applyFlatVertexNormals(geometry) {
    const result = geometry.index != null ? geometry.toNonIndexed() : geometry.clone();
    result.computeVertexNormals();
    result.computeBoundingBox();
    result.computeBoundingSphere();
    return result;
}

/**
 * @typedef {Object} SmoothNormalsOptions
 * @property {boolean} [mergeNormalsBeforeSmooth=true]
 * @property {boolean} [mergeUvBeforeSmooth=true]
 */

/**
 * Merge coincident vertices and recompute averaged vertex normals.
 * @param {THREE.BufferGeometry} geometry
 * @param {SmoothNormalsOptions} [options]
 * @returns {THREE.BufferGeometry}
 */
export function applySmoothVertexNormals(geometry, options = {}) {
    const {
        mergeNormalsBeforeSmooth = true,
        mergeUvBeforeSmooth = true,
    } = options;
    const prepared = geometry.clone();
    // mergeVertices hashes all attributes; remove selected attrs to allow position welding.
    if (mergeNormalsBeforeSmooth && prepared.getAttribute('normal')) {
        prepared.deleteAttribute('normal');
    }
    if (mergeUvBeforeSmooth && prepared.getAttribute('uv')) {
        prepared.deleteAttribute('uv');
    }
    const result = mergeVertices(prepared);
    result.computeVertexNormals();
    result.computeBoundingBox();
    result.computeBoundingSphere();
    return result;
}

/**
 * @param {THREE.Mesh} mesh
 * @param {(geometry: THREE.BufferGeometry) => THREE.BufferGeometry} transform
 */
function replaceMeshGeometry(mesh, transform) {
    const old = mesh.geometry;
    mesh.geometry = transform(old);
    old.dispose();
}

/**
 * @param {THREE.Mesh[]} meshes
 * @returns {{ count: number, error: string|null }}
 */
export function applyFlatVertexNormalsToMeshes(meshes) {
    if (!meshes.length) {
        return { count: 0, error: 'No meshes found in selection.' };
    }
    for (const mesh of meshes) {
        if (!mesh.geometry?.getAttribute('position')) {
            return { count: 0, error: `Mesh "${mesh.name || 'unnamed'}" has no valid geometry.` };
        }
        replaceMeshGeometry(mesh, applyFlatVertexNormals);
    }
    return { count: meshes.length, error: null };
}

/**
 * @param {THREE.Mesh[]} meshes
 * @param {SmoothNormalsOptions} [options]
 * @returns {{ count: number, error: string|null }}
 */
export function applySmoothVertexNormalsToMeshes(meshes, options = {}) {
    if (!meshes.length) {
        return { count: 0, error: 'No meshes found in selection.' };
    }
    for (const mesh of meshes) {
        if (!mesh.geometry?.getAttribute('position')) {
            return { count: 0, error: `Mesh "${mesh.name || 'unnamed'}" has no valid geometry.` };
        }
        replaceMeshGeometry(mesh, (geometry) => applySmoothVertexNormals(geometry, options));
    }
    return { count: meshes.length, error: null };
}
