// booleanUtils.js – CSG boolean operations on meshes (three-bvh-csg)
import * as THREE from 'three';
import { Brush, Evaluator, ADDITION, SUBTRACTION, REVERSE_SUBTRACTION, INTERSECTION } from 'three-bvh-csg';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

export { ADDITION, SUBTRACTION, REVERSE_SUBTRACTION, INTERSECTION };

export const BOOLEAN_OPERATION_LABELS = {
    [ADDITION]: 'Union',
    [SUBTRACTION]: 'Subtract_A-B',
    [REVERSE_SUBTRACTION]: 'Subtract_B-A',
    [INTERSECTION]: 'Intersect'
};

const CSG_ATTRIBUTES = ['position', 'normal'];

const _evaluator = new Evaluator();
_evaluator.attributes = CSG_ATTRIBUTES;

/**
 * @param {THREE.BufferGeometry} geom
 */
function stripNonCSGAttributes(geom) {
    for (const key of Object.keys(geom.attributes)) {
        if (!CSG_ATTRIBUTES.includes(key)) {
            geom.deleteAttribute(key);
        }
    }
}

/**
 * @param {THREE.Object3D} object3d
 * @returns {THREE.Mesh[]}
 */
export function collectMeshes(object3d) {
    const meshes = [];
    if (!object3d) return meshes;
    object3d.updateWorldMatrix(true, true);
    object3d.traverse(obj => {
        if (obj.isMesh && obj.geometry) meshes.push(obj);
    });
    return meshes;
}

/**
 * @param {THREE.BufferGeometry} geom
 * @returns {THREE.BufferGeometry|null}
 */
export function prepareGeometryForCSG(geom) {
    if (!geom || !geom.getAttribute('position')) {
        return null;
    }

    let prepared = geom.index ? geom.clone() : mergeVertices(geom.clone());
    prepared = mergeVertices(prepared);

    if (!prepared.getAttribute('normal')) {
        prepared.computeVertexNormals();
    } else {
        prepared.computeVertexNormals();
    }

    stripNonCSGAttributes(prepared);
    prepared.clearGroups();
    prepared.drawRange = { start: 0, count: Infinity };

    return prepared;
}

/**
 * @param {THREE.BufferGeometry} geom
 * @returns {THREE.BufferGeometry}
 */
export function normalizeCSGResult(geom) {
    const normalized = geom.clone();
    normalized.clearGroups();
    normalized.drawRange = { start: 0, count: Infinity };

    const posAttr = normalized.getAttribute('position');
    if (posAttr && Number.isFinite(normalized.drawRange.count)) {
        normalized.setDrawRange(0, posAttr.count);
    }

    if (!normalized.getAttribute('normal')) {
        normalized.computeVertexNormals();
    }

    stripNonCSGAttributes(normalized);

    return normalized;
}

/**
 * @param {THREE.Object3D} object3d
 * @returns {THREE.BufferGeometry|null}
 */
export function objectToWorldGeometry(object3d) {
    const meshes = collectMeshes(object3d);
    if (meshes.length === 0) return null;

    const worldGeometries = [];
    for (const mesh of meshes) {
        const geom = mesh.geometry.clone();
        geom.applyMatrix4(mesh.matrixWorld);
        const prepared = prepareGeometryForCSG(geom);
        if (prepared) worldGeometries.push(prepared);
    }

    if (worldGeometries.length === 0) return null;
    if (worldGeometries.length === 1) return worldGeometries[0];

    const merged = mergeGeometries(worldGeometries, false);
    worldGeometries.forEach(g => g.dispose());
    return merged ? prepareGeometryForCSG(merged) : null;
}

/**
 * @param {THREE.Object3D} objectA
 * @param {THREE.Object3D} objectB
 * @param {number} operation - ADDITION | SUBTRACTION | REVERSE_SUBTRACTION | INTERSECTION
 * @returns {{ geometry: THREE.BufferGeometry|null, error: string|null }}
 */
export function performBooleanOperation(objectA, objectB, operation) {
    try {
        objectA.updateWorldMatrix(true, true);
        objectB.updateWorldMatrix(true, true);

        const geomA = objectToWorldGeometry(objectA);
        const geomB = objectToWorldGeometry(objectB);

        if (!geomA || !geomB) {
            return { geometry: null, error: 'One or both objects have no valid mesh geometry.' };
        }

        const brushA = new Brush(geomA);
        const brushB = new Brush(geomB);
        brushA.updateMatrixWorld(true);
        brushB.updateMatrixWorld(true);

        const result = _evaluator.evaluate(brushA, brushB, operation);
        if (!result || !result.geometry) {
            geomA.dispose();
            geomB.dispose();
            return { geometry: null, error: 'Boolean operation produced no result. Meshes may not be watertight.' };
        }

        const normalized = normalizeCSGResult(result.geometry);
        geomA.dispose();
        geomB.dispose();
        result.geometry.dispose();

        const pos = normalized.getAttribute('position');
        if (!pos || pos.count === 0) {
            normalized.dispose();
            return { geometry: null, error: 'Boolean operation produced empty geometry.' };
        }

        return { geometry: normalized, error: null };
    } catch (err) {
        console.error('Boolean operation failed:', err);
        return {
            geometry: null,
            error: err?.message || 'Boolean operation failed. Meshes may not be watertight or manifold.'
        };
    }
}

/**
 * Merge direct child meshes of a container into one BufferGeometry with material groups.
 * Inverse of separateMesh / separateGroups.
 * @param {THREE.Object3D} container
 * @returns {{ geometry: THREE.BufferGeometry|null, materials: THREE.Material[], error: string|null }}
 */
export function mergeDirectChildMeshes(container) {
    if (!container) {
        return { geometry: null, materials: [], error: 'No object selected.' };
    }

    const childMeshes = container.children.filter(c => c.isMesh && c.geometry);
    if (childMeshes.length < 2) {
        return { geometry: null, materials: [], error: 'Selected object has fewer than 2 direct child meshes – nothing to merge.' };
    }

    for (const mesh of childMeshes) {
        if (Array.isArray(mesh.material)) {
            return { geometry: null, materials: [], error: `Child mesh "${mesh.name || 'mesh'}" has multiple materials – merge supports single-material children only.` };
        }
        if (!mesh.geometry.getAttribute('position')) {
            return { geometry: null, materials: [], error: `Child mesh "${mesh.name || 'mesh'}" has no valid geometry.` };
        }
    }

    container.updateWorldMatrix(true, true);
    const containerInv = new THREE.Matrix4().copy(container.matrixWorld).invert();

    const geometries = [];
    const materials = [];

    try {
        for (let i = 0; i < childMeshes.length; i++) {
            const mesh = childMeshes[i];
            const geom = mesh.geometry.clone();
            geom.applyMatrix4(mesh.matrixWorld);
            geom.applyMatrix4(containerInv);

            const posCount = geom.getAttribute('position').count;
            geom.clearGroups();
            geom.addGroup(0, posCount, i);

            materials.push(mesh.material.clone());
            geometries.push(geom);
        }

        const merged = mergeGeometries(geometries, true);
        geometries.forEach(g => g.dispose());

        if (!merged) {
            return { geometry: null, materials: [], error: 'Failed to merge geometries.' };
        }

        return { geometry: merged, materials, error: null };
    } catch (err) {
        geometries.forEach(g => g.dispose());
        console.error('mergeDirectChildMeshes failed:', err);
        return {
            geometry: null,
            materials: [],
            error: err?.message || 'Failed to merge child meshes.'
        };
    }
}

/**
 * @param {THREE.Object3D} object3d
 * @returns {THREE.Material}
 */
export function pickMaterialFromObject(object3d) {
    let material = null;
    object3d.traverse(obj => {
        if (material || !obj.isMesh || !obj.material) return;
        material = Array.isArray(obj.material) ? obj.material[0] : obj.material;
    });
    if (material) return material.clone();
    return new THREE.MeshStandardMaterial({ color: 0x6699cc, roughness: 0.5, metalness: 0.1 });
}
