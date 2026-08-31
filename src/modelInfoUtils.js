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
const _centroidAccum = new THREE.Vector3();

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
 * `centroid` is the volumetric (uniform-density) center of gravity of the enclosed solid,
 * computed via the divergence-theorem tetrahedron decomposition (same triangle pass as the
 * volume itself). It is `null` whenever the volume is not reliable (open / inconsistently
 * oriented shell) or degenerate (near-zero volume).
 *
 * @param {THREE.Mesh[]} meshes
 * @returns {{
 *   area: number,
 *   volume: number,
 *   signedVolume: number,
 *   triangleCount: number,
 *   meshCount: number,
 *   volumeReliable: boolean,
 *   centroid: THREE.Vector3|null
 * }}
 */
export function computeSurfaceAreaAndVolume(meshes) {
    let area = 0;
    let signedVolume = 0;
    let triangleCount = 0;
    let meshCount = 0;
    _centroidAccum.set(0, 0, 0);

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
            const tetVolume = _vA.dot(_cross) / 6;
            signedVolume += tetVolume;
            // Tetrahedron (origin, a, b, c) centroid is (a+b+c)/4; accumulate weighted by its signed volume.
            _centroidAccum.x += (_vA.x + _vB.x + _vC.x) * tetVolume;
            _centroidAccum.y += (_vA.y + _vB.y + _vC.y) * tetVolume;
            _centroidAccum.z += (_vA.z + _vB.z + _vC.z) * tetVolume;
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

    const centroid = (volumeReliable && Math.abs(signedVolume) > 1e-12)
        ? _centroidAccum.clone().divideScalar(4 * signedVolume)
        : null;

    return {
        area,
        volume,
        signedVolume,
        triangleCount,
        meshCount,
        volumeReliable,
        centroid,
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
    if (!Number.isFinite(grams)) return '–';
    if (grams === 0) return '0 g';
    const sign = grams < 0 ? '-' : '';
    const abs = Math.abs(grams);
    if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(3)} t`;
    if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(3)} kg`;
    if (abs >= 1) return `${sign}${abs.toFixed(2)} g`;
    if (abs >= 1e-3) return `${sign}${(abs * 1000).toFixed(2)} mg`;
    return `${sign}${abs.toExponential(3)} g`;
}

function _isAuxiliaryObject(obj) {
    const ud = obj?.userData;
    return !!(ud && (ud._isMeasurement || ud._isAnnotation || ud._isAnnotation3d || ud._isCadDim3d));
}

function _isMassStructuralChild(obj) {
    if (!obj || _isAuxiliaryObject(obj)) return false;
    if (obj.isLight || obj.isCamera) return false;
    return !!(obj.isMesh || obj.isGroup || obj.type === 'Object3D');
}

/**
 * Meshes under root (including root if it is a mesh), excluding auxiliaries / section meshes.
 * @param {THREE.Object3D} root
 * @returns {THREE.Mesh[]}
 */
function _collectMeshesUnder(root) {
    const meshes = [];
    if (!root) return meshes;
    if (root.isMesh && root.geometry && !root.isSectionMesh && !_isAuxiliaryObject(root)) {
        meshes.push(root);
    }
    root.traverse(obj => {
        if (obj === root) return;
        if (_isAuxiliaryObject(obj)) return;
        if (obj.isMesh && obj.geometry && !obj.isSectionMesh) {
            meshes.push(obj);
        }
    });
    return meshes;
}

/**
 * Hierarchical mass and mass-weighted center of gravity:
 * mass(node) = ρ(node)×V(all meshes under node) + Σ mass(children) + massOffsetKg(node)×1000.
 * Density 0 / missing → no density contribution. massOffset (kg in userData) may be +/‑/0.
 * Negative child mass subtracts from parent. Double-counting ρ on parent+child is intentional.
 *
 * `centroid` is the mass-weighted center of gravity (world space), combining this node's own
 * volumetric centroid (density×volume and/or massOffset, both anchored at the same point) with
 * the mass-weighted centroids of all structural children. A node's own massOffset has no
 * inherent position, so when the node has no own density-based centroid it is anchored, in order
 * of preference: (1) at the mass-weighted center of gravity of this node's children, when they
 * carry any mass; (2) at the plain volumetric centroid of all mesh geometry in the node's subtree,
 * when children carry no mass but geometry exists; (3) at the node's world position as a last
 * resort (e.g. a pure Group used only for a manual mass correction, with no meshed descendants).
 * `centroid` is `null` when the node's total rolled-up mass is zero (no well-defined weighting point).
 *
 * @param {THREE.Object3D} node
 * @param {string} modelUnit
 * @returns {{
 *   massGrams: number,
 *   centroid: THREE.Vector3|null,
 *   hasOwnContribution: boolean,
 *   hasChildContribution: boolean,
 *   ownUnreliable: boolean,
 *   childUnreliable: boolean
 * }}
 */
export function computeRolledUpMass(node, modelUnit) {
    const empty = {
        massGrams: 0,
        centroid: null,
        hasOwnContribution: false,
        hasChildContribution: false,
        ownUnreliable: false,
        childUnreliable: false,
    };
    if (!node) return empty;

    let childMassGrams = 0;
    let childWeightedCentroid = null;
    let hasChildContribution = false;
    let childUnreliable = false;

    for (const child of node.children) {
        if (!_isMassStructuralChild(child)) continue;
        const sub = computeRolledUpMass(child, modelUnit);
        if (sub.hasOwnContribution || sub.hasChildContribution) hasChildContribution = true;
        childMassGrams += sub.massGrams;
        if (sub.centroid && sub.massGrams !== 0) {
            if (!childWeightedCentroid) childWeightedCentroid = new THREE.Vector3();
            childWeightedCentroid.addScaledVector(sub.centroid, sub.massGrams);
        }
        if (sub.ownUnreliable || sub.childUnreliable) childUnreliable = true;
    }

    const density = Number(node.userData?.density);
    let ownMassGrams = 0;
    let ownVolumeCentroid = null;
    let hasOwnContribution = false;
    let ownUnreliable = false;

    if (Number.isFinite(density) && density > 0) {
        hasOwnContribution = true;
        const meshes = _collectMeshesUnder(node);
        const stats = computeSurfaceAreaAndVolume(meshes);
        if (stats.triangleCount > 0) {
            if (!stats.volumeReliable) ownUnreliable = true;
            ownMassGrams = computeMassGrams(stats.volume, density, modelUnit);
            ownVolumeCentroid = stats.centroid;
        }
    }

    const massOffsetKg = Number(node.userData?.massOffset);
    if (Number.isFinite(massOffsetKg) && massOffsetKg !== 0) {
        hasOwnContribution = true;
        ownMassGrams += massOffsetKg * 1000;
        // massOffset has no defined position. Anchor it, in order of preference, at:
        // (1) the node's own density-based volumetric centroid (already computed above),
        // (2) the mass-weighted center of gravity of this node's children (correct even when
        //     children have different densities, unlike a plain volume-weighted centroid),
        // (3) the plain volumetric centroid of all mesh geometry in the node's subtree,
        // (4) the node's world position, when there is no mass or geometry information at all.
        if (!ownVolumeCentroid) {
            if (childWeightedCentroid && childMassGrams !== 0) {
                ownVolumeCentroid = childWeightedCentroid.clone().divideScalar(childMassGrams);
            } else {
                const meshes = _collectMeshesUnder(node);
                const stats = computeSurfaceAreaAndVolume(meshes);
                if (stats.triangleCount > 0 && stats.centroid) {
                    ownVolumeCentroid = stats.centroid;
                } else {
                    ownVolumeCentroid = node.getWorldPosition(new THREE.Vector3());
                }
            }
        }
    }

    const totalMassGrams = ownMassGrams + childMassGrams;
    let centroid = null;
    if (totalMassGrams !== 0) {
        const weightedSum = childWeightedCentroid ? childWeightedCentroid.clone() : new THREE.Vector3();
        if (ownVolumeCentroid && ownMassGrams !== 0) {
            weightedSum.addScaledVector(ownVolumeCentroid, ownMassGrams);
        }
        centroid = weightedSum.divideScalar(totalMassGrams);
    }

    return {
        massGrams: totalMassGrams,
        centroid,
        hasOwnContribution,
        hasChildContribution,
        ownUnreliable,
        childUnreliable,
    };
}

/**
 * Sum rolled-up mass and mass-weighted center of gravity for one or more selected roots.
 * @param {THREE.Object3D|THREE.Object3D[]} rootOrRoots
 * @param {string} modelUnit
 * @returns {{
 *   massGrams: number,
 *   centroid: THREE.Vector3|null,
 *   hasContribution: boolean,
 *   unreliable: boolean
 * }}
 */
export function computeRolledUpMassForRoots(rootOrRoots, modelUnit) {
    const roots = Array.isArray(rootOrRoots)
        ? rootOrRoots.filter(Boolean)
        : (rootOrRoots ? [rootOrRoots] : []);

    let massGrams = 0;
    let weightedCentroid = null;
    let hasContribution = false;
    let unreliable = false;

    for (const root of roots) {
        const r = computeRolledUpMass(root, modelUnit);
        massGrams += r.massGrams;
        if (r.hasOwnContribution || r.hasChildContribution) hasContribution = true;
        if (r.centroid && r.massGrams !== 0) {
            if (!weightedCentroid) weightedCentroid = new THREE.Vector3();
            weightedCentroid.addScaledVector(r.centroid, r.massGrams);
        }
        if (r.ownUnreliable || r.childUnreliable) unreliable = true;
    }

    const centroid = (weightedCentroid && massGrams !== 0) ? weightedCentroid.divideScalar(massGrams) : null;

    return { massGrams, centroid, hasContribution, unreliable };
}
