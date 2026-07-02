// deviationMapUtils.js – deviation map (heatmap) between scan and reference meshes
import * as THREE from 'three';
import { MeshBVH, getTriangleHitPointInfo } from 'three-mesh-bvh';
import { meshesToWorldGeometry, collectMeshes } from './booleanUtils.js';

export const DEVIATION_DEFAULTS = {
    batchSize: 10000,
    referenceWireframe: true,
    tolerance: 0.1,
    withinToleranceOpacity: 1,
    useNormalFilter: false,
    normalAngleDeg: 60,
};

const _DEVIATION_VERTEX_ALPHA_HOOK = '_deviationVertexAlphaHook';
const _DEVIATION_VERTEX_ALPHA_PASS = '_deviationVertexAlphaPass';
const _DEVIATION_GHOST_OVERLAY = '_deviationGhostOverlay';

/** @typedef {'single' | 'oot' | 'ghost'} DeviationAlphaPass */

/**
 * @param {number} distance
 * @param {number} tolerance
 * @returns {boolean}
 */
export function isWithinTolerance(distance, tolerance) {
    return Number.isFinite(distance) && distance <= tolerance;
}

const _worldVertex = new THREE.Vector3();
const _scanNormal = new THREE.Vector3();
const _triNormal = new THREE.Vector3();
const _closestPoint = new THREE.Vector3();
const _normalMatrix = new THREE.Matrix3();
const _hitTarget = { point: new THREE.Vector3(), distance: 0, faceIndex: 0 };

/** @type {THREE.Color} */
const _tempColor = new THREE.Color();

const COLOR_STOPS = [
    { t: 0.0, color: new THREE.Color(0x2244ff) },
    { t: 0.33, color: new THREE.Color(0x22cc44) },
    { t: 0.66, color: new THREE.Color(0xffdd00) },
    { t: 1.0, color: new THREE.Color(0xff2222) },
];

/**
 * @param {number} deg
 * @returns {number}
 */
export function angleDegToNormalDot(deg) {
    return Math.cos(deg * Math.PI / 180);
}

/**
 * @param {number} dot
 * @returns {number}
 */
export function normalDotToAngleDeg(dot) {
    return Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI;
}

/**
 * Map normalized distance t in [0,1] to RGB color (blue → green → yellow → red).
 * @param {number} t
 * @returns {THREE.Color}
 */
export function mapDistanceToColor(t) {
    const clamped = Math.max(0, Math.min(1, t));
    for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
        const a = COLOR_STOPS[i];
        const b = COLOR_STOPS[i + 1];
        if (clamped <= b.t) {
            const localT = (clamped - a.t) / (b.t - a.t);
            return _tempColor.copy(a.color).lerp(b.color, localT).clone();
        }
    }
    return COLOR_STOPS[COLOR_STOPS.length - 1].color.clone();
}

/**
 * @param {THREE.Object3D} root
 * @returns {THREE.Mesh[]}
 */
export function collectComparisonMeshes(root) {
    return collectMeshes(root).filter(obj =>
        !obj.isSectionMesh
        && !obj.userData._isMeasurement
        && !obj.userData._isAnnotation
        && !obj.userData._isAnnotation3d
        && !obj.userData._isCadDim3d
    );
}

/**
 * @param {THREE.Object3D|null|undefined} root
 * @returns {boolean}
 */
export function hasComparisonMeshes(root) {
    return collectComparisonMeshes(root).length > 0;
}

/**
 * True when one target is the same node or an ancestor/descendant of the other.
 * @param {THREE.Object3D|null|undefined} a
 * @param {THREE.Object3D|null|undefined} b
 * @returns {boolean}
 */
export function comparisonTargetsOverlap(a, b) {
    if (!a || !b) return false;
    if (a === b) return true;
    let o = b;
    while (o) {
        if (o === a) return true;
        o = o.parent;
    }
    o = a;
    while (o) {
        if (o === b) return true;
        o = o.parent;
    }
    return false;
}

/**
 * @param {THREE.Mesh} mesh
 * @param {number} vertexIndex
 * @param {THREE.Vector3} target
 * @returns {THREE.Vector3}
 */
function getScanWorldNormal(mesh, vertexIndex, target) {
    let normalAttr = mesh.geometry.getAttribute('normal');
    if (!normalAttr) {
        mesh.geometry.computeVertexNormals();
        normalAttr = mesh.geometry.getAttribute('normal');
    }
    target.fromBufferAttribute(normalAttr, vertexIndex);
    _normalMatrix.getNormalMatrix(mesh.matrixWorld);
    target.applyMatrix3(_normalMatrix).normalize();
    return target;
}

/**
 * @param {THREE.BufferGeometry} refGeom
 * @param {number} faceIndex
 * @param {THREE.Vector3} point
 * @param {THREE.Vector3} target
 * @returns {THREE.Vector3}
 */
function getRefTriangleNormal(refGeom, faceIndex, point, target) {
    const info = getTriangleHitPointInfo(point, refGeom, faceIndex);
    return target.copy(info.face.normal);
}

/**
 * @param {MeshBVH} bvh
 * @param {THREE.BufferGeometry} refGeom
 * @param {THREE.Vector3} point
 * @param {THREE.Vector3} scanNormal
 * @param {number} minDot
 * @param {{ point: THREE.Vector3, distance: number, faceIndex: number }} target
 * @returns {number}
 */
function closestCompatibleDistance(bvh, refGeom, point, scanNormal, minDot, target) {
    const hit = bvh.closestPointToPoint(point, target);
    if (hit) {
        getRefTriangleNormal(refGeom, target.faceIndex, point, _triNormal);
        if (scanNormal.dot(_triNormal) >= minDot) {
            return target.distance;
        }
    }

    let bestDist = Infinity;
    let found = false;

    bvh.shapecast({
        intersectsBounds: (box) => box.distanceToPoint(point) < bestDist,
        intersectsTriangle: (tri, triangleIndex) => {
            tri.getNormal(_triNormal);
            if (scanNormal.dot(_triNormal) < minDot) return false;

            tri.closestPointToPoint(point, _closestPoint);
            const dist = point.distanceTo(_closestPoint);
            if (dist < bestDist) {
                bestDist = dist;
                target.point.copy(_closestPoint);
                target.distance = dist;
                target.faceIndex = triangleIndex;
                found = true;
            }
            return false;
        },
    });

    return found ? bestDist : Infinity;
}

/**
 * @param {THREE.Material|THREE.Material[]} material
 * @returns {object}
 */
function backupMaterialState(material) {
    const mats = Array.isArray(material) ? material : [material];
    return mats.map(mat => ({
        vertexColors: mat.vertexColors,
        color: mat.color?.isColor ? mat.color.clone() : null,
        map: mat.map || null,
        metalness: mat.metalness,
        roughness: mat.roughness,
        wireframe: mat.wireframe,
        opacity: mat.opacity,
        transparent: mat.transparent,
        depthWrite: mat.depthWrite,
        alphaTest: mat.alphaTest,
        onBeforeCompile: mat.onBeforeCompile,
        customProgramCacheKey: mat.customProgramCacheKey,
    }));
}

/**
 * @param {THREE.Material|THREE.Material[]} material
 * @param {object[]} backup
 */
function restoreMaterialState(material, backup) {
    const mats = Array.isArray(material) ? material : [material];
    mats.forEach((mat, i) => {
        const b = backup[i];
        if (!b) return;
        mat.vertexColors = b.vertexColors;
        if (b.color && mat.color) mat.color.copy(b.color);
        mat.map = b.map;
        if (b.metalness !== undefined) mat.metalness = b.metalness;
        if (b.roughness !== undefined) mat.roughness = b.roughness;
        mat.wireframe = b.wireframe;
        mat.opacity = b.opacity;
        mat.transparent = b.transparent;
        if (b.depthWrite !== undefined) mat.depthWrite = b.depthWrite;
        mat.alphaTest = b.alphaTest ?? 0;
        mat.onBeforeCompile = b.onBeforeCompile;
        if (b.customProgramCacheKey) {
            mat.customProgramCacheKey = b.customProgramCacheKey;
        } else {
            delete mat.customProgramCacheKey;
        }
        delete mat.userData[_DEVIATION_VERTEX_ALPHA_HOOK];
        delete mat.userData[_DEVIATION_VERTEX_ALPHA_PASS];
        mat.needsUpdate = true;
    });
}

/**
 * @param {THREE.Material} mat
 */
function clearDeviationShaderHook(mat) {
    delete mat.userData[_DEVIATION_VERTEX_ALPHA_HOOK];
    delete mat.userData[_DEVIATION_VERTEX_ALPHA_PASS];
}

/**
 * @param {DeviationAlphaPass} pass
 * @returns {string}
 */
function _deviationAlphaFragmentGlsl(pass) {
    if (pass === 'ghost') {
        return `#include <color_fragment>
#ifdef USE_COLOR
            if (vColor.a >= 0.999) {
                discard;
            } else if (vColor.a <= 0.001) {
                discard;
            } else {
                diffuseColor.a *= vColor.a;
            }
#endif`;
    }
    if (pass === 'oot') {
        return `#include <color_fragment>
#ifdef USE_COLOR
            if (vColor.a <= 0.001) {
                discard;
            } else if (vColor.a >= 0.999) {
                diffuseColor.a = 1.0;
            } else {
                discard;
            }
#endif`;
    }
    return `#include <color_fragment>
#ifdef USE_COLOR
            if (vColor.a <= 0.001) {
                discard;
            } else if (vColor.a >= 0.999) {
                diffuseColor.a = 1.0;
            } else {
                diffuseColor.a *= vColor.a;
            }
#endif`;
}

/**
 * Apply per-vertex alpha from the color attribute (RGBA) in the fragment shader.
 * @param {THREE.Material} mat
 * @param {DeviationAlphaPass} pass
 */
function ensureDeviationVertexAlphaShader(mat, pass) {
    if (mat.userData[_DEVIATION_VERTEX_ALPHA_HOOK] && mat.userData[_DEVIATION_VERTEX_ALPHA_PASS] === pass) {
        return;
    }

    clearDeviationShaderHook(mat);

    const previousOnBeforeCompile = mat.onBeforeCompile?.bind(mat);
    const previousCacheKey = mat.customProgramCacheKey?.bind(mat);
    const fragmentGlsl = _deviationAlphaFragmentGlsl(pass);

    mat.onBeforeCompile = (shader, renderer) => {
        previousOnBeforeCompile?.(shader, renderer);
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <color_fragment>',
            fragmentGlsl,
        );
    };

    mat.customProgramCacheKey = () => {
        const base = previousCacheKey ? previousCacheKey() : mat.type;
        return `${base}_deviationVertexAlpha_${pass}`;
    };

    mat.userData[_DEVIATION_VERTEX_ALPHA_HOOK] = true;
    mat.userData[_DEVIATION_VERTEX_ALPHA_PASS] = pass;
}

/**
 * @param {THREE.Material} mat
 * @param {DeviationAlphaPass} pass
 * @param {number} withinToleranceOpacity
 */
function applyDeviationMaterialState(mat, pass, withinToleranceOpacity) {
    const inTolAlpha = Math.max(0, Math.min(1, withinToleranceOpacity));

    mat.vertexColors = true;
    if (mat.color) mat.color.set(0xffffff);
    mat.map = null;
    if (mat.metalness !== undefined) mat.metalness = 0;
    if (mat.roughness !== undefined) mat.roughness = 1;
    mat.opacity = 1;

    if (pass === 'ghost') {
        mat.transparent = true;
        mat.depthWrite = false;
        mat.depthTest = true;
        mat.alphaTest = 0;
    } else if (pass === 'oot') {
        mat.transparent = false;
        mat.depthWrite = true;
        mat.depthTest = true;
        mat.alphaTest = 0;
    } else {
        const needsBlend = inTolAlpha > 0 && inTolAlpha < 1;
        mat.transparent = needsBlend;
        mat.depthWrite = true;
        mat.depthTest = true;
        mat.alphaTest = inTolAlpha <= 0 ? 0.001 : 0;
    }

    ensureDeviationVertexAlphaShader(mat, pass);
    mat.needsUpdate = true;
}

/**
 * @param {THREE.Material|THREE.Material[]} material
 * @returns {THREE.Material|THREE.Material[]}
 */
function cloneMaterialsForDeviationGhost(material) {
    const cloneOne = (mat) => {
        const cloned = mat.clone();
        clearDeviationShaderHook(cloned);
        return cloned;
    };
    return Array.isArray(material) ? material.map(cloneOne) : cloneOne(material);
}

/**
 * @param {THREE.Material|THREE.Material[]} material
 */
function disposeDeviationGhostMaterials(material) {
    const mats = Array.isArray(material) ? material : [material];
    mats.forEach(mat => mat.dispose());
}

/**
 * @param {THREE.Mesh} mesh
 */
function removeDeviationGhostOverlay(mesh) {
    const ghost = mesh.userData[_DEVIATION_GHOST_OVERLAY];
    if (!ghost) return;

    mesh.remove(ghost);
    disposeDeviationGhostMaterials(ghost.material);
    delete mesh.userData[_DEVIATION_GHOST_OVERLAY];
}

/**
 * @param {THREE.Mesh} mesh
 * @param {number} withinToleranceOpacity
 */
function ensureDeviationGhostOverlay(mesh, withinToleranceOpacity) {
    let ghost = mesh.userData[_DEVIATION_GHOST_OVERLAY];
    if (!ghost) {
        ghost = new THREE.Mesh(mesh.geometry, cloneMaterialsForDeviationGhost(mesh.material));
        ghost.userData._isDeviationGhostOverlay = true;
        ghost.raycast = () => {};
        mesh.add(ghost);
        mesh.userData[_DEVIATION_GHOST_OVERLAY] = ghost;
    } else {
        ghost.geometry = mesh.geometry;
    }

    ghost.renderOrder = 1;
    const ghostMats = Array.isArray(ghost.material) ? ghost.material : [ghost.material];
    ghostMats.forEach(mat => applyDeviationMaterialState(mat, 'ghost', withinToleranceOpacity));
}

/**
 * @param {THREE.Object3D|null|undefined} object
 * @returns {THREE.Mesh|null}
 */
function resolveDeviationSourceMesh(object) {
    if (!object?.isMesh) return null;
    if (object.userData._isDeviationGhostOverlay && object.parent?.isMesh) {
        return object.parent;
    }
    return object;
}

/**
 * @param {THREE.Mesh} mesh
 */
function backupMeshForDeviation(mesh) {
    if (mesh.userData._deviationBackup) return;
    mesh.userData._deviationBackup = {
        material: backupMaterialState(mesh.material),
        hadColorAttr: !!mesh.geometry.getAttribute('color'),
        renderOrder: mesh.renderOrder,
    };
}

/**
 * @param {THREE.Object3D} refRoot
 * @param {boolean} wireframe
 */
export function applyReferenceVisualization(refRoot, wireframe = true) {
    if (!refRoot) return;
    refRoot.traverse(obj => {
        if (!obj.isMesh || obj.isSectionMesh) return;
        if (obj.userData._deviationRefBackup) return;
        obj.userData._deviationRefBackup = backupMaterialState(obj.material);
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach(mat => {
            mat.wireframe = wireframe;
            if (wireframe) {
                mat.transparent = true;
                mat.opacity = 0.35;
            }
            mat.needsUpdate = true;
        });
    });
}

/**
 * @param {THREE.Object3D} refRoot
 */
export function clearReferenceVisualization(refRoot) {
    if (!refRoot) return;
    refRoot.traverse(obj => {
        if (!obj.isMesh || !obj.userData._deviationRefBackup) return;
        restoreMaterialState(obj.material, obj.userData._deviationRefBackup);
        delete obj.userData._deviationRefBackup;
    });
}

/**
 * @param {Float32Array|number[]} distances
 * @param {number} tolerance
 * @returns {{ min: number, max: number, mean: number, rms: number, vertexCount: number, outOfTolerance: number, outOfTolerancePct: number, ambiguousCount: number }}
 */
export function computeDeviationStats(distances, tolerance = DEVIATION_DEFAULTS.tolerance) {
    const n = distances.length;
    if (n === 0) {
        return {
            min: 0, max: 0, mean: 0, rms: 0, vertexCount: 0,
            outOfTolerance: 0, outOfTolerancePct: 0, ambiguousCount: 0,
        };
    }
    let finiteMin = Infinity;
    let finiteMax = -Infinity;
    let sum = 0;
    let sumSq = 0;
    let finiteCount = 0;
    let outOfTolerance = 0;
    let ambiguousCount = 0;

    for (let i = 0; i < n; i++) {
        const d = distances[i];
        if (!Number.isFinite(d)) {
            ambiguousCount++;
            outOfTolerance++;
            continue;
        }
        if (d < finiteMin) finiteMin = d;
        if (d > finiteMax) finiteMax = d;
        sum += d;
        sumSq += d * d;
        finiteCount++;
        if (d > tolerance) outOfTolerance++;
    }

    return {
        min: finiteCount > 0 ? finiteMin : 0,
        max: finiteCount > 0 ? finiteMax : 0,
        mean: finiteCount > 0 ? sum / finiteCount : 0,
        rms: finiteCount > 0 ? Math.sqrt(sumSq / finiteCount) : 0,
        vertexCount: n,
        outOfTolerance,
        outOfTolerancePct: (outOfTolerance / n) * 100,
        ambiguousCount,
    };
}

/**
 * Merge statistics from two deviation-map passes (e.g. A→B and B→A).
 * @param {object|null|undefined} statsA
 * @param {object|null|undefined} statsB
 * @returns {object|null}
 */
export function mergeDeviationStats(statsA, statsB) {
    if (!statsA && !statsB) return null;
    if (!statsB) return statsA;
    if (!statsA) return statsB;

    const vertexCount = statsA.vertexCount + statsB.vertexCount;
    const ambiguousCount = statsA.ambiguousCount + statsB.ambiguousCount;
    const outOfTolerance = statsA.outOfTolerance + statsB.outOfTolerance;
    const fcA = Math.max(0, statsA.vertexCount - statsA.ambiguousCount);
    const fcB = Math.max(0, statsB.vertexCount - statsB.ambiguousCount);
    const totalFinite = fcA + fcB;

    const minCandidates = [];
    const maxCandidates = [];
    if (fcA > 0) {
        minCandidates.push(statsA.min);
        maxCandidates.push(statsA.max);
    }
    if (fcB > 0) {
        minCandidates.push(statsB.min);
        maxCandidates.push(statsB.max);
    }

    return {
        min: minCandidates.length ? Math.min(...minCandidates) : 0,
        max: maxCandidates.length ? Math.max(...maxCandidates) : 0,
        mean: totalFinite > 0 ? (statsA.mean * fcA + statsB.mean * fcB) / totalFinite : 0,
        rms: totalFinite > 0
            ? Math.sqrt((statsA.rms ** 2 * fcA + statsB.rms ** 2 * fcB) / totalFinite)
            : 0,
        vertexCount,
        outOfTolerance,
        outOfTolerancePct: vertexCount > 0 ? (outOfTolerance / vertexCount) * 100 : 0,
        ambiguousCount,
    };
}

/**
 * @param {Map<THREE.Mesh, Float32Array>|null|undefined} mapA
 * @param {Map<THREE.Mesh, Float32Array>|null|undefined} mapB
 * @returns {Map<THREE.Mesh, Float32Array>}
 */
export function mergeDistancesByMesh(mapA, mapB) {
    const merged = new Map();
    if (mapA) {
        for (const [mesh, distances] of mapA) merged.set(mesh, distances);
    }
    if (mapB) {
        for (const [mesh, distances] of mapB) merged.set(mesh, distances);
    }
    return merged;
}

/**
 * @param {THREE.Object3D} objA
 * @param {THREE.Object3D} objB
 * @param {{ batchSize?: number, onProgress?: (p: number) => void, tolerance?: number, useNormalFilter?: boolean, minNormalDot?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<{ aToB: object, bToA: object|null, stats: object|null, maxDistance: number, error: string|null, cancelled?: boolean }>}
 */
export async function computeBidirectionalDeviationMap(objA, objB, options = {}) {
    const onProgress = options.onProgress ?? (() => {});
    const signal = options.signal;

    const aToB = await computeDeviationMap(objA, objB, {
        ...options,
        onProgress: (p) => onProgress(p * 0.5),
    });
    if (aToB.cancelled || signal?.aborted) {
        return {
            aToB,
            bToA: null,
            stats: null,
            maxDistance: 0,
            error: null,
            cancelled: true,
        };
    }
    if (aToB.error || !aToB.stats) {
        return {
            aToB,
            bToA: null,
            stats: null,
            maxDistance: 0,
            error: aToB.error || 'Deviation map computation failed (A → B).',
        };
    }

    const bToA = await computeDeviationMap(objB, objA, {
        ...options,
        onProgress: (p) => onProgress(0.5 + p * 0.5),
    });
    if (bToA.cancelled || signal?.aborted) {
        return {
            aToB,
            bToA,
            stats: null,
            maxDistance: 0,
            error: null,
            cancelled: true,
        };
    }
    if (bToA.error || !bToA.stats) {
        return {
            aToB,
            bToA,
            stats: null,
            maxDistance: 0,
            error: bToA.error || 'Deviation map computation failed (B → A).',
        };
    }

    const stats = mergeDeviationStats(aToB.stats, bToA.stats);
    return {
        aToB,
        bToA,
        stats,
        maxDistance: stats?.max ?? 0,
        error: null,
    };
}

/**
 * @param {THREE.Object3D} scanRoot
 * @param {THREE.Object3D} refRoot
 * @param {{ batchSize?: number, onProgress?: (p: number) => void, tolerance?: number, useNormalFilter?: boolean, minNormalDot?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<{ distancesByMesh: Map<THREE.Mesh, Float32Array>, stats: object, maxDistance: number, error: string|null, cancelled?: boolean }>}
 */
export function computeDeviationMap(scanRoot, refRoot, options = {}) {
    const batchSize = options.batchSize ?? DEVIATION_DEFAULTS.batchSize;
    const onProgress = options.onProgress ?? (() => {});
    const tolerance = options.tolerance ?? DEVIATION_DEFAULTS.tolerance;
    const useNormalFilter = options.useNormalFilter ?? DEVIATION_DEFAULTS.useNormalFilter;
    const minNormalDot = options.minNormalDot ?? angleDegToNormalDot(DEVIATION_DEFAULTS.normalAngleDeg);
    const signal = options.signal;

    const cancelledResult = () => ({
        cancelled: true,
        distancesByMesh: new Map(),
        stats: null,
        maxDistance: 0,
        error: null,
    });

    return new Promise((resolve) => {
        try {
            if (signal?.aborted) {
                resolve(cancelledResult());
                return;
            }

            scanRoot.updateWorldMatrix(true, true);
            refRoot.updateWorldMatrix(true, true);

            const refGeom = meshesToWorldGeometry(collectComparisonMeshes(refRoot), refRoot);
            if (!refGeom) {
                resolve({ distancesByMesh: new Map(), stats: null, maxDistance: 0, error: 'Reference object has no valid mesh geometry.' });
                return;
            }

            const bvh = new MeshBVH(refGeom);
            const scanMeshes = collectComparisonMeshes(scanRoot);
            if (scanMeshes.length === 0) {
                refGeom.dispose();
                resolve({ distancesByMesh: new Map(), stats: null, maxDistance: 0, error: 'Scan object has no valid mesh geometry.' });
                return;
            }

            const distancesByMesh = new Map();
            const allDistances = [];
            let totalVertices = 0;
            for (const mesh of scanMeshes) {
                totalVertices += mesh.geometry.getAttribute('position').count;
            }

            let processed = 0;
            let meshIndex = 0;
            let vertexIndex = 0;
            let currentMesh = null;
            let currentPos = null;
            let currentDistances = null;
            let currentMatrix = null;

            const processBatch = () => {
                if (signal?.aborted) {
                    refGeom.dispose();
                    resolve(cancelledResult());
                    return;
                }

                const end = Math.min(processed + batchSize, totalVertices);
                while (processed < end) {
                    if (!currentMesh || vertexIndex >= currentPos.count) {
                        if (meshIndex >= scanMeshes.length) break;
                        currentMesh = scanMeshes[meshIndex++];
                        currentPos = currentMesh.geometry.getAttribute('position');
                        currentMatrix = currentMesh.matrixWorld;
                        currentDistances = new Float32Array(currentPos.count);
                        distancesByMesh.set(currentMesh, currentDistances);
                        vertexIndex = 0;
                    }

                    _worldVertex.fromBufferAttribute(currentPos, vertexIndex);
                    _worldVertex.applyMatrix4(currentMatrix);

                    let dist;
                    if (useNormalFilter) {
                        getScanWorldNormal(currentMesh, vertexIndex, _scanNormal);
                        dist = closestCompatibleDistance(
                            bvh, refGeom, _worldVertex, _scanNormal, minNormalDot, _hitTarget,
                        );
                    } else {
                        const hit = bvh.closestPointToPoint(_worldVertex, _hitTarget);
                        dist = hit ? hit.distance : Infinity;
                    }

                    currentDistances[vertexIndex] = dist;
                    allDistances.push(dist);

                    vertexIndex++;
                    processed++;
                }

                onProgress(totalVertices > 0 ? processed / totalVertices : 1);

                if (processed < totalVertices) {
                    if (signal?.aborted) {
                        refGeom.dispose();
                        resolve(cancelledResult());
                        return;
                    }
                    setTimeout(processBatch, 0);
                } else {
                    refGeom.dispose();
                    const combined = new Float32Array(allDistances.length);
                    for (let i = 0; i < allDistances.length; i++) combined[i] = allDistances[i];
                    const stats = computeDeviationStats(combined, tolerance);
                    const maxDistance = stats.max === Infinity ? 0 : stats.max;
                    resolve({ distancesByMesh, stats, maxDistance, error: null });
                }
            };

            setTimeout(processBatch, 0);
        } catch (err) {
            console.error('computeDeviationMap failed:', err);
            resolve({
                distancesByMesh: new Map(),
                stats: null,
                maxDistance: 0,
                error: err?.message || 'Deviation map computation failed.',
            });
        }
    });
}

/**
 * @param {THREE.Mesh} mesh
 * @param {Float32Array} distances
 * @param {number} tolerance
 * @param {number} withinToleranceOpacity
 */
function applyColorsToMesh(mesh, distances, tolerance, withinToleranceOpacity = DEVIATION_DEFAULTS.withinToleranceOpacity) {
    backupMeshForDeviation(mesh);

    const pos = mesh.geometry.getAttribute('position');
    const colors = new Float32Array(pos.count * 4);
    const scale = tolerance > 0 ? tolerance : 1;
    const inTolAlpha = Math.max(0, Math.min(1, withinToleranceOpacity));

    for (let i = 0; i < pos.count; i++) {
        const d = distances[i];
        const t = Number.isFinite(d) ? d / scale : 1;
        const c = mapDistanceToColor(t);
        const alpha = isWithinTolerance(d, tolerance) ? inTolAlpha : 1;
        const i4 = i * 4;
        colors[i4] = c.r;
        colors[i4 + 1] = c.g;
        colors[i4 + 2] = c.b;
        colors[i4 + 3] = alpha;
    }

    mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    mesh.renderOrder = 0;

    removeDeviationGhostOverlay(mesh);

    const needsSplitPass = inTolAlpha > 0 && inTolAlpha < 1;
    const basePass = needsSplitPass ? 'oot' : 'single';
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach(mat => applyDeviationMaterialState(mat, basePass, inTolAlpha));

    if (needsSplitPass) {
        ensureDeviationGhostOverlay(mesh, inTolAlpha);
    }
}

/**
 * @param {THREE.Object3D} scanRoot
 * @param {Map<THREE.Mesh, Float32Array>} distancesByMesh
 * @param {number} tolerance
 * @param {number} [withinToleranceOpacity]
 */
export function applyDeviationColors(
    scanRoot,
    distancesByMesh,
    tolerance,
    withinToleranceOpacity = DEVIATION_DEFAULTS.withinToleranceOpacity,
) {
    for (const [mesh, distances] of distancesByMesh) {
        applyColorsToMesh(mesh, distances, tolerance, withinToleranceOpacity);
    }

    scanRoot.userData._deviationState = {
        ...(scanRoot.userData._deviationState || {}),
        tolerance,
        withinToleranceOpacity,
        distancesByMesh,
    };
}

/**
 * Re-apply colors using stored distances and a new tolerance scale.
 * @param {THREE.Object3D} scanRoot
 * @param {number} tolerance
 * @param {number} [withinToleranceOpacity]
 */
export function recolorDeviationMap(scanRoot, tolerance, withinToleranceOpacity) {
    const state = scanRoot.userData._deviationState;
    if (!state?.distancesByMesh) return false;
    const opacity = withinToleranceOpacity ?? state.withinToleranceOpacity ?? DEVIATION_DEFAULTS.withinToleranceOpacity;
    applyDeviationColors(scanRoot, state.distancesByMesh, tolerance, opacity);
    state.tolerance = tolerance;
    state.withinToleranceOpacity = opacity;
    return true;
}

/**
 * @param {THREE.Object3D} scanRoot
 * @param {THREE.Object3D} [refRoot]
 */
export function clearDeviationMap(scanRoot, refRoot) {
    if (!scanRoot) return;

    scanRoot.traverse(obj => {
        if (!obj.isMesh) return;
        removeDeviationGhostOverlay(obj);
        if (!obj.userData._deviationBackup) return;
        const backup = obj.userData._deviationBackup;
        restoreMaterialState(obj.material, backup.material);
        if (!backup.hadColorAttr && obj.geometry.getAttribute('color')) {
            obj.geometry.deleteAttribute('color');
        }
        if (backup.renderOrder !== undefined) obj.renderOrder = backup.renderOrder;
        delete obj.userData._deviationBackup;
    });

    if (refRoot) clearReferenceVisualization(refRoot);
    else {
        const state = scanRoot.userData._deviationState;
        const ref = state?.referenceObject ?? state?.partnerObject;
        if (ref) clearReferenceVisualization(ref);
    }

    delete scanRoot.userData._deviationState;
}

/**
 * @param {Map<THREE.Mesh, Float32Array>} distancesByMesh
 * @param {number} tolerance
 * @returns {{ outOfTolerance: number, outOfTolerancePct: number }}
 */
export function computeOutOfTolerance(distancesByMesh, tolerance) {
    let total = 0;
    let outOfTolerance = 0;
    for (const distances of distancesByMesh.values()) {
        for (let i = 0; i < distances.length; i++) {
            total++;
            const d = distances[i];
            if (!Number.isFinite(d) || d > tolerance) outOfTolerance++;
        }
    }
    return {
        outOfTolerance,
        outOfTolerancePct: total > 0 ? (outOfTolerance / total) * 100 : 0,
    };
}

function _deviationLegendRow(label, value) {
    return `<div style="display:flex;justify-content:space-between;gap:12px;"><span style="opacity:0.85;">${label}</span><span>${value}</span></div>`;
}

function _buildDeviationStatsSection(title, stats, tolerance, distancesByMesh) {
    if (!stats) return '';

    let outOfTolerance = stats.outOfTolerance;
    let outOfTolerancePct = stats.outOfTolerancePct;
    if (distancesByMesh) {
        const oot = computeOutOfTolerance(distancesByMesh, tolerance);
        outOfTolerance = oot.outOfTolerance;
        outOfTolerancePct = oot.outOfTolerancePct;
    }

    const withinTolerance = stats.vertexCount - outOfTolerance;
    const withinTolerancePct = stats.vertexCount > 0 ? (withinTolerance / stats.vertexCount) * 100 : 0;
    const tolLabel = tolerance.toFixed(4);
    const row = _deviationLegendRow;
    const ambiguousRow = stats.ambiguousCount > 0
        ? row('No compatible surface:', `${stats.ambiguousCount} vertices`)
        : '';

    return `
        <div style="font-size:11px;margin-top:8px;line-height:1.55;border-top:1px solid rgba(255,255,255,0.12);padding-top:8px;">
            <div style="font-weight:600;margin-bottom:4px;opacity:0.95;">${title}</div>
            ${row('Min deviation:', stats.min.toFixed(4))}
            ${row('Max deviation:', stats.max.toFixed(4))}
            ${row('Mean:', stats.mean.toFixed(4))}
            ${row('RMS:', stats.rms.toFixed(4))}
            ${row('Vertices:', String(stats.vertexCount))}
            ${ambiguousRow}
            ${row(`Over tolerance (${tolLabel}):`, `${outOfTolerance} vertices (${outOfTolerancePct.toFixed(1)}%)`)}
            ${row('Within tolerance:', `${withinTolerance} vertices (${withinTolerancePct.toFixed(1)}%)`)}
        </div>
    `;
}

/**
 * @param {object} stats
 * @param {number} tolerance
 * @param {Map<THREE.Mesh, Float32Array>} [distancesByMesh]
 * @param {{ useNormalFilter?: boolean, normalAngleDeg?: number }} [legendOptions]
 * @returns {string}
 */
export function buildDeviationLegendHtml(stats, tolerance, distancesByMesh, legendOptions = {}) {
    if (!stats) return '';

    const tolLabel = tolerance.toFixed(4);
    const row = _deviationLegendRow;

    const modeRow = legendOptions.useNormalFilter
        ? row('Filter by normal:', `on (${legendOptions.normalAngleDeg ?? DEVIATION_DEFAULTS.normalAngleDeg}°)`)
        : row('Filter by normal:', 'off');

    const comparisonModeRow = legendOptions.comparisonMode === 'bidirectional'
        ? row('Mode:', 'Bidirectional (A↔B)')
        : row('Mode:', 'Unidirectional (A→B)');

    return `
        <div style="height:14px;border-radius:3px;background:linear-gradient(to right,#2244ff,#22cc44,#ffdd00,#ff2222);margin-bottom:4px;"></div>
        <div style="display:flex;justify-content:space-between;font-size:11px;opacity:0.9;margin-bottom:2px;">
            <span>0</span><span>Tolerance: ${tolLabel}</span>
        </div>
        <div style="font-size:11px;margin-top:8px;line-height:1.55;border-top:1px solid rgba(255,255,255,0.12);padding-top:8px;">
            <div style="font-weight:600;margin-bottom:4px;opacity:0.95;">Comparison</div>
            ${comparisonModeRow}
            ${modeRow}
        </div>
        ${_buildDeviationStatsSection('Statistics', stats, tolerance, distancesByMesh)}
    `;
}

/**
 * @param {object} aStats
 * @param {object} bStats
 * @param {object} mergedStats
 * @param {number} tolerance
 * @param {Map<THREE.Mesh, Float32Array>} [aDistancesByMesh]
 * @param {Map<THREE.Mesh, Float32Array>} [bDistancesByMesh]
 * @param {{ useNormalFilter?: boolean, normalAngleDeg?: number, objectAName?: string, objectBName?: string }} [legendOptions]
 * @returns {string}
 */
export function buildBidirectionalLegendHtml(
    aStats,
    bStats,
    mergedStats,
    tolerance,
    aDistancesByMesh,
    bDistancesByMesh,
    legendOptions = {},
) {
    if (!mergedStats) return '';

    const tolLabel = tolerance.toFixed(4);
    const row = _deviationLegendRow;
    const nameA = legendOptions.objectAName || 'Object A';
    const nameB = legendOptions.objectBName || 'Object B';

    const modeRow = legendOptions.useNormalFilter
        ? row('Filter by normal:', `on (${legendOptions.normalAngleDeg ?? DEVIATION_DEFAULTS.normalAngleDeg}°)`)
        : row('Filter by normal:', 'off');

    return `
        <div style="height:14px;border-radius:3px;background:linear-gradient(to right,#2244ff,#22cc44,#ffdd00,#ff2222);margin-bottom:4px;"></div>
        <div style="display:flex;justify-content:space-between;font-size:11px;opacity:0.9;margin-bottom:2px;">
            <span>0</span><span>Tolerance: ${tolLabel}</span>
        </div>
        <div style="font-size:11px;margin-top:8px;line-height:1.55;border-top:1px solid rgba(255,255,255,0.12);padding-top:8px;">
            <div style="font-weight:600;margin-bottom:4px;opacity:0.95;">Comparison</div>
            ${row('Mode:', 'Bidirectional (A↔B)')}
            ${modeRow}
        </div>
        ${_buildDeviationStatsSection(`${nameA} (A → B)`, aStats, tolerance, aDistancesByMesh)}
        ${_buildDeviationStatsSection(`${nameB} (B → A)`, bStats, tolerance, bDistancesByMesh)}
        ${_buildDeviationStatsSection('Combined', mergedStats, tolerance, mergeDistancesByMesh(aDistancesByMesh, bDistancesByMesh))}
    `;
}

const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _vC = new THREE.Vector3();

/**
 * @param {number} distance
 * @returns {string}
 */
export function formatDeviationValue(distance) {
    if (!Number.isFinite(distance)) return 'N/A';
    return distance.toFixed(4);
}

/**
 * Sample deviation at a raycast hit using stored per-vertex distances.
 * @param {THREE.Intersection} hit
 * @param {Map<THREE.Mesh, Float32Array>} distancesByMesh
 * @returns {{ distance: number, isAmbiguous: boolean } | null}
 */
export function sampleDeviationAtHit(hit, distancesByMesh) {
    if (!hit?.object?.isMesh || !hit.face || !distancesByMesh) return null;

    const mesh = resolveDeviationSourceMesh(hit.object);
    if (!mesh) return null;

    const distances = distancesByMesh.get(mesh);
    if (!distances) return null;

    const { a, b, c } = hit.face;
    const da = distances[a];
    const db = distances[b];
    const dc = distances[c];

    let distance;
    if (hit.barycoord) {
        distance = hit.barycoord.x * da + hit.barycoord.y * db + hit.barycoord.z * dc;
    } else {
        const pos = mesh.geometry.getAttribute('position');
        _vA.fromBufferAttribute(pos, a).applyMatrix4(mesh.matrixWorld);
        _vB.fromBufferAttribute(pos, b).applyMatrix4(mesh.matrixWorld);
        _vC.fromBufferAttribute(pos, c).applyMatrix4(mesh.matrixWorld);
        const p = hit.point;
        const da2 = p.distanceToSquared(_vA);
        const db2 = p.distanceToSquared(_vB);
        const dc2 = p.distanceToSquared(_vC);
        if (da2 <= db2 && da2 <= dc2) distance = da;
        else if (db2 <= dc2) distance = db;
        else distance = dc;
    }

    return {
        distance,
        isAmbiguous: !Number.isFinite(distance),
    };
}

/**
 * @typedef {{ enabled?: boolean, mode?: 'above' | 'below', threshold?: number }} ProbeDeviationFilter
 */

/**
 * @param {number} distance
 * @param {ProbeDeviationFilter} [filter]
 * @returns {boolean}
 */
export function matchesProbeDeviationFilter(distance, filter) {
    if (!filter?.enabled) return true;
    const threshold = filter.threshold ?? 0;
    if (!Number.isFinite(distance)) return filter.mode === 'above';
    if (filter.mode === 'below') return distance <= threshold;
    return distance >= threshold;
}

/**
 * @param {THREE.Intersection[]} intersects
 * @param {Map<THREE.Mesh, Float32Array>} distancesByMesh
 * @param {ProbeDeviationFilter} [filter]
 * @returns {{ hit: THREE.Intersection, sample: { distance: number, isAmbiguous: boolean } } | null}
 */
export function findDeviationProbeHit(intersects, distancesByMesh, filter = {}) {
    if (!intersects?.length || !distancesByMesh) return null;
    for (const hit of intersects) {
        const sample = sampleDeviationAtHit(hit, distancesByMesh);
        if (!sample) continue;
        if (!matchesProbeDeviationFilter(sample.distance, filter)) continue;
        return { hit, sample };
    }
    return null;
}
