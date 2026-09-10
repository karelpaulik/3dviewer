// geometryOperationsUtils.js – flat / smooth / creased vertex normal operations
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

/** Faces whose normals differ by less than this angle are averaged (smooth). */
export const DEFAULT_CREASE_ANGLE_DEG = 45;

const _creaseV0 = new THREE.Vector3();
const _creaseV1 = new THREE.Vector3();
const _creaseV2 = new THREE.Vector3();
const _creaseE1 = new THREE.Vector3();
const _creaseE2 = new THREE.Vector3();
const _creaseN = new THREE.Vector3();
const _creaseSum = new THREE.Vector3();
const _creaseSize = new THREE.Vector3();

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
        && !mesh.userData._isCadDim3d
        && !mesh.userData._isCoG;
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
    const meshes = [];
    root.traverse(obj => {
        if (obj === root) return;
        if (isMeshEligibleForNormalsOps(obj)) meshes.push(obj);
    });
    return meshes;
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
 * Rebuild vertex normals with a crease threshold: faces meeting below
 * `creaseAngleDeg` are averaged (smooth curves), steeper edges stay sharp.
 * Uses bbox-relative vertex welding so CAD models at any unit scale hash correctly.
 * Indexed input is converted to non-indexed; the returned geometry may be new.
 * @param {THREE.BufferGeometry} geometry
 * @param {number} [creaseAngleDeg]
 * @returns {THREE.BufferGeometry}
 */
export function applyCreasedVertexNormals(geometry, creaseAngleDeg = DEFAULT_CREASE_ANGLE_DEG) {
    const result = geometry.index != null ? geometry.toNonIndexed() : geometry;
    const posAttr = result.getAttribute('position');
    if (!posAttr || posAttr.count < 3) return result;

    if (result.getAttribute('normal')) result.deleteAttribute('normal');

    result.computeBoundingBox();
    result.boundingBox.getSize(_creaseSize);
    const maxDim = Math.max(_creaseSize.x, _creaseSize.y, _creaseSize.z, 1e-6);
    const invEps = 1 / (maxDim * 1e-5);
    const creaseDot = Math.cos(THREE.MathUtils.degToRad(creaseAngleDeg));

    const vertexMap = new Map();
    const faceCount = Math.floor(posAttr.count / 3);

    for (let i = 0; i < faceCount; i++) {
        const i3 = 3 * i;
        _creaseV0.fromBufferAttribute(posAttr, i3);
        _creaseV1.fromBufferAttribute(posAttr, i3 + 1);
        _creaseV2.fromBufferAttribute(posAttr, i3 + 2);
        _creaseE1.subVectors(_creaseV2, _creaseV1);
        _creaseE2.subVectors(_creaseV0, _creaseV1);
        const faceNormal = new THREE.Vector3().crossVectors(_creaseE1, _creaseE2).normalize();

        for (const vert of [_creaseV0, _creaseV1, _creaseV2]) {
            const key = `${Math.round(vert.x * invEps)}_${Math.round(vert.y * invEps)}_${Math.round(vert.z * invEps)}`;
            let list = vertexMap.get(key);
            if (!list) {
                list = [];
                vertexMap.set(key, list);
            }
            list.push(faceNormal);
        }
    }

    const normAttr = new THREE.BufferAttribute(new Float32Array(posAttr.count * 3), 3);
    for (let i = 0; i < faceCount; i++) {
        const i3 = 3 * i;
        _creaseV0.fromBufferAttribute(posAttr, i3);
        _creaseV1.fromBufferAttribute(posAttr, i3 + 1);
        _creaseV2.fromBufferAttribute(posAttr, i3 + 2);
        _creaseE1.subVectors(_creaseV2, _creaseV1);
        _creaseE2.subVectors(_creaseV0, _creaseV1);
        _creaseN.crossVectors(_creaseE1, _creaseE2).normalize();

        const corners = [_creaseV0, _creaseV1, _creaseV2];
        for (let n = 0; n < 3; n++) {
            const vert = corners[n];
            const key = `${Math.round(vert.x * invEps)}_${Math.round(vert.y * invEps)}_${Math.round(vert.z * invEps)}`;
            const others = vertexMap.get(key) || [];
            _creaseSum.set(0, 0, 0);
            for (let k = 0; k < others.length; k++) {
                if (_creaseN.dot(others[k]) >= creaseDot) _creaseSum.add(others[k]);
            }
            if (_creaseSum.lengthSq() === 0) _creaseSum.copy(_creaseN);
            else _creaseSum.normalize();
            normAttr.setXYZ(i3 + n, _creaseSum.x, _creaseSum.y, _creaseSum.z);
        }
    }

    result.setAttribute('normal', normAttr);
    return result;
}

/**
 * @typedef {Object} SmoothNormalsOptions
 * @property {boolean} [mergeNormalsBeforeSmooth=true]
 * @property {boolean} [mergeUvBeforeSmooth=true]
 * @property {number} [creaseAngleDeg]
 */

/**
 * Merge coincident vertices and recompute creased vertex normals.
 * @param {THREE.BufferGeometry} geometry
 * @param {SmoothNormalsOptions} [options]
 * @returns {THREE.BufferGeometry}
 */
export function applySmoothVertexNormals(geometry, options = {}) {
    const {
        mergeNormalsBeforeSmooth = true,
        mergeUvBeforeSmooth = true,
        creaseAngleDeg = DEFAULT_CREASE_ANGLE_DEG,
    } = options;
    const prepared = geometry.clone();
    // mergeVertices hashes all attributes; remove selected attrs to allow position welding.
    if (mergeNormalsBeforeSmooth && prepared.getAttribute('normal')) {
        prepared.deleteAttribute('normal');
    }
    if (mergeUvBeforeSmooth && prepared.getAttribute('uv')) {
        prepared.deleteAttribute('uv');
    }
    let result = mergeVertices(prepared);
    if (result !== prepared) prepared.dispose();

    const creased = applyCreasedVertexNormals(result, creaseAngleDeg);
    if (creased !== result) {
        result.dispose();
        result = creased;
    }
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
