// deviationMapUtils.js – deviation map (heatmap) between scan and reference meshes
import * as THREE from 'three';
import { MeshBVH, getTriangleHitPointInfo } from 'three-mesh-bvh';
import { objectToWorldGeometry, collectMeshes } from './booleanUtils.js';

export const DEVIATION_DEFAULTS = {
    batchSize: 10000,
    referenceWireframe: true,
    tolerance: 0.1,
    useNormalFilter: false,
    normalAngleDeg: 60,
};

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
function collectComparisonMeshes(root) {
    return collectMeshes(root).filter(obj =>
        !obj.isSectionMesh
        && !obj.userData._isMeasurement
        && !obj.userData._isAnnotation
        && !obj.userData._isAnnotation3d
        && !obj.userData._isCadDim3d
    );
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
        mat.needsUpdate = true;
    });
}

/**
 * @param {THREE.Mesh} mesh
 */
function backupMeshForDeviation(mesh) {
    if (mesh.userData._deviationBackup) return;
    mesh.userData._deviationBackup = {
        material: backupMaterialState(mesh.material),
        hadColorAttr: !!mesh.geometry.getAttribute('color'),
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
 * @param {THREE.Object3D} scanRoot
 * @param {THREE.Object3D} refRoot
 * @param {{ batchSize?: number, onProgress?: (p: number) => void, tolerance?: number, useNormalFilter?: boolean, minNormalDot?: number }} [options]
 * @returns {Promise<{ distancesByMesh: Map<THREE.Mesh, Float32Array>, stats: object, maxDistance: number, error: string|null }>}
 */
export function computeDeviationMap(scanRoot, refRoot, options = {}) {
    const batchSize = options.batchSize ?? DEVIATION_DEFAULTS.batchSize;
    const onProgress = options.onProgress ?? (() => {});
    const tolerance = options.tolerance ?? DEVIATION_DEFAULTS.tolerance;
    const useNormalFilter = options.useNormalFilter ?? DEVIATION_DEFAULTS.useNormalFilter;
    const minNormalDot = options.minNormalDot ?? angleDegToNormalDot(DEVIATION_DEFAULTS.normalAngleDeg);

    return new Promise((resolve) => {
        try {
            scanRoot.updateWorldMatrix(true, true);
            refRoot.updateWorldMatrix(true, true);

            const refGeom = objectToWorldGeometry(refRoot);
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
 */
function applyColorsToMesh(mesh, distances, tolerance) {
    backupMeshForDeviation(mesh);

    const pos = mesh.geometry.getAttribute('position');
    const colors = new Float32Array(pos.count * 3);
    const scale = tolerance > 0 ? tolerance : 1;

    for (let i = 0; i < pos.count; i++) {
        const d = distances[i];
        const t = Number.isFinite(d) ? d / scale : 1;
        const c = mapDistanceToColor(t);
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }

    mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach(mat => {
        mat.vertexColors = true;
        if (mat.color) mat.color.set(0xffffff);
        mat.map = null;
        if (mat.metalness !== undefined) mat.metalness = 0;
        if (mat.roughness !== undefined) mat.roughness = 1;
        mat.needsUpdate = true;
    });
}

/**
 * @param {THREE.Object3D} scanRoot
 * @param {Map<THREE.Mesh, Float32Array>} distancesByMesh
 * @param {number} tolerance
 */
export function applyDeviationColors(scanRoot, distancesByMesh, tolerance) {
    for (const [mesh, distances] of distancesByMesh) {
        applyColorsToMesh(mesh, distances, tolerance);
    }

    scanRoot.userData._deviationState = {
        ...(scanRoot.userData._deviationState || {}),
        tolerance,
        distancesByMesh,
    };
}

/**
 * Re-apply colors using stored distances and a new tolerance scale.
 * @param {THREE.Object3D} scanRoot
 * @param {number} tolerance
 */
export function recolorDeviationMap(scanRoot, tolerance) {
    const state = scanRoot.userData._deviationState;
    if (!state?.distancesByMesh) return false;
    applyDeviationColors(scanRoot, state.distancesByMesh, tolerance);
    state.tolerance = tolerance;
    return true;
}

/**
 * @param {THREE.Object3D} scanRoot
 * @param {THREE.Object3D} [refRoot]
 */
export function clearDeviationMap(scanRoot, refRoot) {
    if (!scanRoot) return;

    scanRoot.traverse(obj => {
        if (!obj.isMesh || !obj.userData._deviationBackup) return;
        const backup = obj.userData._deviationBackup;
        restoreMaterialState(obj.material, backup.material);
        if (!backup.hadColorAttr && obj.geometry.getAttribute('color')) {
            obj.geometry.deleteAttribute('color');
        }
        delete obj.userData._deviationBackup;
    });

    if (refRoot) clearReferenceVisualization(refRoot);
    else {
        const ref = scanRoot.userData._deviationState?.referenceObject;
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

/**
 * @param {object} stats
 * @param {number} tolerance
 * @param {Map<THREE.Mesh, Float32Array>} [distancesByMesh]
 * @param {{ useNormalFilter?: boolean, normalAngleDeg?: number }} [legendOptions]
 * @returns {string}
 */
export function buildDeviationLegendHtml(stats, tolerance, distancesByMesh, legendOptions = {}) {
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

    const row = (label, value) =>
        `<div style="display:flex;justify-content:space-between;gap:12px;"><span style="opacity:0.85;">${label}</span><span>${value}</span></div>`;

    const modeRow = legendOptions.useNormalFilter
        ? row('Filter by normal:', `on (${legendOptions.normalAngleDeg ?? DEVIATION_DEFAULTS.normalAngleDeg}°)`)
        : row('Filter by normal:', 'off');

    const ambiguousRow = stats.ambiguousCount > 0
        ? row('No compatible surface:', `${stats.ambiguousCount} vertices`)
        : '';

    return `
        <div style="height:14px;border-radius:3px;background:linear-gradient(to right,#2244ff,#22cc44,#ffdd00,#ff2222);margin-bottom:4px;"></div>
        <div style="display:flex;justify-content:space-between;font-size:11px;opacity:0.9;margin-bottom:2px;">
            <span>0</span><span>Tolerance: ${tolLabel}</span>
        </div>
        <div style="font-size:11px;margin-top:8px;line-height:1.55;border-top:1px solid rgba(255,255,255,0.12);padding-top:8px;">
            <div style="font-weight:600;margin-bottom:4px;opacity:0.95;">Comparison</div>
            ${modeRow}
        </div>
        <div style="font-size:11px;margin-top:8px;line-height:1.55;border-top:1px solid rgba(255,255,255,0.12);padding-top:8px;">
            <div style="font-weight:600;margin-bottom:4px;opacity:0.95;">Statistics</div>
            ${row('Min deviation:', stats.min.toFixed(4))}
            ${row('Max deviation:', stats.max.toFixed(4))}
            ${row('Mean:', stats.mean.toFixed(4))}
            ${row('RMS:', stats.rms.toFixed(4))}
            ${row('Vertices:', String(stats.vertexCount))}
            ${ambiguousRow}
        </div>
        <div style="font-size:11px;margin-top:8px;line-height:1.55;border-top:1px solid rgba(255,255,255,0.12);padding-top:8px;">
            <div style="font-weight:600;margin-bottom:4px;opacity:0.95;">Tolerance check</div>
            ${row(`Over tolerance (${tolLabel}):`, `${outOfTolerance} vertices (${outOfTolerancePct.toFixed(1)}%)`)}
            ${row('Within tolerance:', `${withinTolerance} vertices (${withinTolerancePct.toFixed(1)}%)`)}
        </div>
    `;
}
