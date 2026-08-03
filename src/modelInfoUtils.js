// modelInfoUtils.js – scene graph statistics and mesh geometry measures for user content
import * as THREE from 'three';

/**
 * Count Objects, Groups, Object3D containers, and Meshes under loadedModels roots.
 * Uses the same node classification as bomUtils / scene outliner.
 * @param {Array<import('three').Object3D>} loadedModels
 * @returns {{ objects: number, groups: number, object3d: number, meshes: number }}
 */
export function computeModelStats(loadedModels) {
    const stats = { objects: 0, groups: 0, object3d: 0, meshes: 0 };

    for (const root of loadedModels) {
        if (!root) continue;
        root.traverse(node => {
            if (node.userData._isMeasurement || node.userData._isAnnotation ||
                node.userData._isAnnotation3d || node.userData._isCadDim3d) return;
            if (node.isLight || node.isCamera) return;

            if (node.isMesh) {
                stats.meshes++;
                stats.objects++;
            } else if (node.isGroup) {
                stats.groups++;
                stats.objects++;
            } else if (node.type === 'Object3D') {
                stats.object3d++;
                stats.objects++;
            }
        });
    }

    return stats;
}

const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _vC = new THREE.Vector3();
const _ab = new THREE.Vector3();
const _ac = new THREE.Vector3();
const _cross = new THREE.Vector3();

/**
 * Format a length² / length³ measure for the Selected panel.
 * @param {number} value
 * @returns {string}
 */
export function formatGeometryMeasure(value) {
    if (!Number.isFinite(value)) return '–';
    const abs = Math.abs(value);
    if (abs === 0) return '0';
    if (abs >= 1e6 || abs < 1e-3) return value.toExponential(3);
    if (abs >= 100) return value.toFixed(1);
    if (abs >= 1) return value.toFixed(2);
    return value.toFixed(4);
}

/**
 * Surface area and signed volume over all triangles of the given meshes (world space).
 * Volume is meaningful when the meshes together form a closed, consistently oriented shell
 * (typical CAD part split by material/color into multiple meshes or geometry groups).
 *
 * @param {THREE.Mesh[]} meshes
 * @returns {{
 *   area: number,
 *   volume: number,
 *   signedVolume: number,
 *   triangleCount: number,
 *   meshCount: number,
 *   volumeReliable: boolean
 * }}
 */
export function computeSurfaceAreaAndVolume(meshes) {
    let area = 0;
    let signedVolume = 0;
    let triangleCount = 0;
    let meshCount = 0;

    for (const mesh of meshes) {
        const geometry = mesh?.geometry;
        const pos = geometry?.getAttribute?.('position');
        if (!pos) continue;
        meshCount++;

        const index = geometry.getIndex();
        const matrixWorld = mesh.matrixWorld;
        const triCount = index ? Math.floor(index.count / 3) : Math.floor(pos.count / 3);

        for (let t = 0; t < triCount; t++) {
            let i0;
            let i1;
            let i2;
            if (index) {
                const base = t * 3;
                i0 = index.getX(base);
                i1 = index.getX(base + 1);
                i2 = index.getX(base + 2);
            } else {
                i0 = t * 3;
                i1 = t * 3 + 1;
                i2 = t * 3 + 2;
            }

            _vA.fromBufferAttribute(pos, i0).applyMatrix4(matrixWorld);
            _vB.fromBufferAttribute(pos, i1).applyMatrix4(matrixWorld);
            _vC.fromBufferAttribute(pos, i2).applyMatrix4(matrixWorld);

            _ab.subVectors(_vB, _vA);
            _ac.subVectors(_vC, _vA);
            _cross.crossVectors(_ab, _ac);

            const twiceArea = _cross.length();
            if (twiceArea === 0) continue;

            area += 0.5 * twiceArea;
            // a · ((b-a)×(c-a)) / 6 == a · (b×c) / 6
            signedVolume += _vA.dot(_cross) / 6;
            triangleCount++;
        }
    }

    const volume = Math.abs(signedVolume);

    // Open / inconsistently oriented shells yield near-zero volume relative to area scale.
    let volumeReliable = triangleCount > 0 && area > 1e-12;
    if (volumeReliable) {
        const charLen = Math.sqrt(area);
        const charVol = charLen * charLen * charLen;
        if (charVol > 1e-18 && volume / charVol < 1e-4) {
            volumeReliable = false;
        }
    }

    return {
        area,
        volume,
        signedVolume,
        triangleCount,
        meshCount,
        volumeReliable,
    };
}

/** Supported scene length units (1 scene unit = this length). */
export const MODEL_UNIT_OPTIONS = ['mm', 'cm', 'm', 'inch'];

/** How many cm³ equal one cubic scene unit. */
const UNIT_VOLUME_TO_CM3 = {
    mm: 1e-3,       // 1 mm³ = 0.001 cm³
    cm: 1,
    m: 1e6,         // 1 m³ = 1_000_000 cm³
    inch: 16.387064, // 1 in³ in cm³
};

/**
 * @param {string} modelUnit
 * @returns {number}
 */
export function unitVolumeToCm3(modelUnit) {
    return UNIT_VOLUME_TO_CM3[modelUnit] ?? UNIT_VOLUME_TO_CM3.mm;
}

/**
 * @param {number} volumeModelUnits – abs signed volume in scene units³
 * @param {number} densityGPerCm3
 * @param {string} modelUnit
 * @returns {number} mass in grams
 */
export function computeMassGrams(volumeModelUnits, densityGPerCm3, modelUnit) {
    if (!(volumeModelUnits > 0) || !(densityGPerCm3 > 0)) return 0;
    return volumeModelUnits * unitVolumeToCm3(modelUnit) * densityGPerCm3;
}

/**
 * @param {number} grams
 * @returns {string}
 */
export function formatMass(grams) {
    if (!Number.isFinite(grams) || grams <= 0) return '–';
    if (grams >= 1e6) return `${(grams / 1e6).toFixed(3)} t`;
    if (grams >= 1000) return `${(grams / 1000).toFixed(3)} kg`;
    if (grams >= 1) return `${grams.toFixed(2)} g`;
    if (grams >= 1e-3) return `${(grams * 1000).toFixed(2)} mg`;
    return `${grams.toExponential(3)} g`;
}
