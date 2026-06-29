// geometryOperationsUtils.js – flat / smooth vertex normal operations
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { collectDescendantMeshes } from './booleanUtils.js';

/**
 * @param {THREE.Object3D|null} root
 * @returns {THREE.Mesh[]}
 */
export function collectMeshesForGeometryOps(root) {
    if (!root) return [];
    if (root.isMesh && root.geometry && !root.isSectionMesh
        && !root.userData._isMeasurement
        && !root.userData._isAnnotation
        && !root.userData._isAnnotation3d
        && !root.userData._isCadDim3d) {
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
 * Merge coincident vertices and recompute averaged vertex normals.
 * @param {THREE.BufferGeometry} geometry
 * @returns {THREE.BufferGeometry}
 */
export function applySmoothVertexNormals(geometry) {
    const prepared = geometry.clone();
    // mergeVertices hashes all attributes; flat normals block position-only welding.
    if (prepared.getAttribute('normal')) {
        prepared.deleteAttribute('normal');
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
 * @returns {{ count: number, error: string|null }}
 */
export function applySmoothVertexNormalsToMeshes(meshes) {
    if (!meshes.length) {
        return { count: 0, error: 'No meshes found in selection.' };
    }
    for (const mesh of meshes) {
        if (!mesh.geometry?.getAttribute('position')) {
            return { count: 0, error: `Mesh "${mesh.name || 'unnamed'}" has no valid geometry.` };
        }
        replaceMeshGeometry(mesh, applySmoothVertexNormals);
    }
    return { count: meshes.length, error: null };
}
