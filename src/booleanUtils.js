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
 * Collect all mesh descendants of a container (excludes the container itself and section meshes).
 * @param {THREE.Object3D} container
 * @returns {THREE.Mesh[]}
 */
export function collectDescendantMeshes(container) {
    const meshes = [];
    container.traverse(obj => {
        if (obj === container) return;
        if (obj.isMesh && obj.geometry && !obj.isSectionMesh) {
            meshes.push(obj);
        }
    });
    return meshes;
}

/**
 * Split a BufferGeometry into one geometry per material group.
 * @param {THREE.BufferGeometry} bufGeom
 * @returns {THREE.BufferGeometry[]}
 */
function extractGeometryGroups(bufGeom) {
    const outGeometries = [];
    const groups = bufGeom.groups;
    const posAttr = bufGeom.getAttribute('position');
    const normAttr = bufGeom.getAttribute('normal');
    const uvAttr = bufGeom.getAttribute('uv');
    const index = bufGeom.getIndex();

    for (let ig = 0, ng = groups.length; ig < ng; ig++) {
        const group = groups[ig];
        if (group.count <= 0) continue;

        const destNumVerts = group.count;
        const newBufGeom = new THREE.BufferGeometry();
        const newPositions = new Float32Array(destNumVerts * 3);
        const newNormals = normAttr ? new Float32Array(destNumVerts * 3) : null;
        const newUvs = uvAttr ? new Float32Array(destNumVerts * 2) : null;

        if (index) {
            for (let iv = 0; iv < destNumVerts; iv++) {
                const vi = index.getX(group.start + iv);
                const indexDest = 3 * iv;
                newPositions[indexDest + 0] = posAttr.getX(vi);
                newPositions[indexDest + 1] = posAttr.getY(vi);
                newPositions[indexDest + 2] = posAttr.getZ(vi);
                if (newNormals) {
                    newNormals[indexDest + 0] = normAttr.getX(vi);
                    newNormals[indexDest + 1] = normAttr.getY(vi);
                    newNormals[indexDest + 2] = normAttr.getZ(vi);
                }
                if (newUvs) {
                    newUvs[iv * 2] = uvAttr.getX(vi);
                    newUvs[iv * 2 + 1] = uvAttr.getY(vi);
                }
            }
        } else {
            const origPositions = posAttr.array;
            const origNormals = normAttr ? normAttr.array : null;
            const origUvs = uvAttr ? uvAttr.array : null;
            for (let iv = 0; iv < destNumVerts; iv++) {
                const indexOrig = 3 * (group.start + iv);
                const indexDest = 3 * iv;
                newPositions[indexDest + 0] = origPositions[indexOrig + 0];
                newPositions[indexDest + 1] = origPositions[indexOrig + 1];
                newPositions[indexDest + 2] = origPositions[indexOrig + 2];
                if (newNormals && origNormals) {
                    newNormals[indexDest + 0] = origNormals[indexOrig + 0];
                    newNormals[indexDest + 1] = origNormals[indexOrig + 1];
                    newNormals[indexDest + 2] = origNormals[indexOrig + 2];
                }
                if (newUvs && origUvs) {
                    const uvOrig = 2 * (group.start + iv);
                    newUvs[iv * 2] = origUvs[uvOrig];
                    newUvs[iv * 2 + 1] = origUvs[uvOrig + 1];
                }
            }
        }

        newBufGeom.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
        if (newNormals) {
            newBufGeom.setAttribute('normal', new THREE.BufferAttribute(newNormals, 3));
        } else {
            newBufGeom.computeVertexNormals();
        }
        if (newUvs) {
            newBufGeom.setAttribute('uv', new THREE.BufferAttribute(newUvs, 2));
        }

        outGeometries.push(newBufGeom);
    }

    return outGeometries;
}

/** @param {THREE.BufferGeometry[]} geometries */
function harmonizeMergeGeometryAttributes(geometries) {
    const optionalAttrs = ['uv', 'color'];
    for (const attrName of optionalAttrs) {
        const allHave = geometries.every(g => g.getAttribute(attrName));
        if (!allHave) {
            geometries.forEach(g => g.deleteAttribute(attrName));
        }
    }
}

/**
 * @param {THREE.BufferGeometry} geom
 * @param {THREE.Matrix4} meshMatrixWorld
 * @param {THREE.Matrix4} containerInv
 * @param {number} materialIndex
 * @returns {THREE.BufferGeometry}
 */
function prepareGeometryForMergePiece(geom, meshMatrixWorld, containerInv, materialIndex) {
    let piece = geom;
    if (piece.index) {
        piece = piece.toNonIndexed();
        if (piece !== geom) geom.dispose();
    }

    piece.applyMatrix4(meshMatrixWorld);
    piece.applyMatrix4(containerInv);

    const posCount = piece.getAttribute('position').count;
    piece.clearGroups();
    piece.addGroup(0, posCount, materialIndex);
    return piece;
}

/**
 * Merge all descendant meshes of a container into one BufferGeometry with material groups.
 * With one descendant, flattens the wrapper into a single mesh. Inverse of separateMesh / separateGroups.
 * @param {THREE.Object3D} container
 * @returns {{ geometry: THREE.BufferGeometry|null, materials: THREE.Material[], error: string|null }}
 */
export function mergeDescendantMeshes(container) {
    if (!container) {
        return { geometry: null, materials: [], error: 'No object selected.' };
    }

    const childMeshes = collectDescendantMeshes(container);
    if (childMeshes.length < 1) {
        return { geometry: null, materials: [], error: 'Selected object has no descendant meshes – nothing to merge.' };
    }

    for (const mesh of childMeshes) {
        if (!mesh.geometry.getAttribute('position')) {
            return { geometry: null, materials: [], error: `Child mesh "${mesh.name || 'mesh'}" has no valid geometry.` };
        }
    }

    container.updateWorldMatrix(true, true);
    const containerInv = new THREE.Matrix4().copy(container.matrixWorld).invert();

    const geometries = [];
    const materials = [];

    try {
        for (const mesh of childMeshes) {
            const meshName = mesh.name || 'mesh';
            const meshMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            const groups = mesh.geometry.groups;

            if (Array.isArray(mesh.material) && groups.length > 0) {
                const subGeoms = extractGeometryGroups(mesh.geometry);
                if (subGeoms.length === 0) {
                    return { geometry: null, materials: [], error: `Child mesh "${meshName}" has no valid geometry groups.` };
                }

                for (let g = 0, subGeomIdx = 0; g < groups.length; g++) {
                    const group = groups[g];
                    if (group.count <= 0) continue;

                    const subGeom = subGeoms[subGeomIdx++];
                    if (!subGeom || !subGeom.getAttribute('position')) continue;

                    const srcMatIdx = group.materialIndex >= 0 && group.materialIndex < meshMaterials.length
                        ? group.materialIndex
                        : 0;
                    const matIndex = materials.length;

                    const piece = prepareGeometryForMergePiece(subGeom, mesh.matrixWorld, containerInv, matIndex);
                    materials.push(meshMaterials[srcMatIdx].clone());
                    geometries.push(piece);
                }
            } else if (Array.isArray(mesh.material)) {
                const piece = prepareGeometryForMergePiece(mesh.geometry.clone(), mesh.matrixWorld, containerInv, materials.length);
                materials.push(meshMaterials[0].clone());
                geometries.push(piece);
            } else {
                const piece = prepareGeometryForMergePiece(mesh.geometry.clone(), mesh.matrixWorld, containerInv, materials.length);
                materials.push(mesh.material.clone());
                geometries.push(piece);
            }
        }

        if (geometries.length === 0) {
            return { geometry: null, materials: [], error: 'No valid geometry to merge.' };
        }

        harmonizeMergeGeometryAttributes(geometries);

        const merged = mergeGeometries(geometries, true);
        geometries.forEach(g => g.dispose());

        if (!merged) {
            return { geometry: null, materials: [], error: 'Failed to merge geometries.' };
        }

        return { geometry: merged, materials, error: null };
    } catch (err) {
        geometries.forEach(g => g.dispose());
        console.error('mergeDescendantMeshes failed:', err);
        return {
            geometry: null,
            materials: [],
            error: err?.message || 'Failed to merge child meshes.'
        };
    }
}

/** @deprecated Use mergeDescendantMeshes */
export const mergeDirectChildMeshes = mergeDescendantMeshes;

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
