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
const _inertiaAccum = { Ixx: 0, Iyy: 0, Izz: 0, Ixy: 0, Ixz: 0, Iyz: 0 };

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
 * When `options.withInertia` is set, the same triangle pass also accumulates the geometric
 * (unit-density) inertia tensor about the world origin `(0,0,0)`, using the closed-form
 * tetrahedron second-moment formulas (Tonon 2004) applied to each signed tetrahedron
 * `(origin, a, b, c)` — the same decomposition already used for volume/centroid. `inertiaOrigin`
 * is `null` under the same reliability conditions as `centroid` (open/degenerate shells), since
 * it is even more sensitive to a wrong/missing shell than the scalar volume.
 *
 * @param {THREE.Mesh[]} meshes
 * @param {{ withInertia?: boolean }} [options]
 * @returns {{
 *   area: number,
 *   volume: number,
 *   signedVolume: number,
 *   triangleCount: number,
 *   meshCount: number,
 *   volumeReliable: boolean,
 *   centroid: THREE.Vector3|null,
 *   inertiaOrigin: {Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number}|null
 * }}
 */
export function computeSurfaceAreaAndVolume(meshes, options) {
    const withInertia = !!options?.withInertia;
    let area = 0;
    let signedVolume = 0;
    let triangleCount = 0;
    let meshCount = 0;
    _centroidAccum.set(0, 0, 0);
    if (withInertia) {
        _inertiaAccum.Ixx = 0; _inertiaAccum.Iyy = 0; _inertiaAccum.Izz = 0;
        _inertiaAccum.Ixy = 0; _inertiaAccum.Ixz = 0; _inertiaAccum.Iyz = 0;
    }

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

            if (withInertia) {
                // Closed-form second moments of the tetrahedron (origin O, a, b, c), with O=(0,0,0)
                // so all terms involving vertex 1 vanish (Tonon 2004, specialised to O at origin).
                // `v` plays the role of the tetrahedron's signed "mass" (unit density = its signed volume).
                const v = tetVolume;
                const xa = _vA.x, ya = _vA.y, za = _vA.z;
                const xb = _vB.x, yb = _vB.y, zb = _vB.z;
                const xc = _vC.x, yc = _vC.y, zc = _vC.z;

                const sumX2 = xa * xa + xb * xb + xc * xc;
                const sumXX = xa * xb + xa * xc + xb * xc;
                const sumY2 = ya * ya + yb * yb + yc * yc;
                const sumYY = ya * yb + ya * yc + yb * yc;
                const sumZ2 = za * za + zb * zb + zc * zc;
                const sumZZ = za * zb + za * zc + zb * zc;

                _inertiaAccum.Ixx += (v / 10) * (sumY2 + sumYY + sumZ2 + sumZZ);
                _inertiaAccum.Iyy += (v / 10) * (sumX2 + sumXX + sumZ2 + sumZZ);
                _inertiaAccum.Izz += (v / 10) * (sumX2 + sumXX + sumY2 + sumYY);

                const pxy = (v / 20) * (2 * (xa * ya + xb * yb + xc * yc) + (xa * yb + xb * ya) + (xa * yc + xc * ya) + (xb * yc + xc * yb));
                const pxz = (v / 20) * (2 * (xa * za + xb * zb + xc * zc) + (xa * zb + xb * za) + (xa * zc + xc * za) + (xb * zc + xc * zb));
                const pyz = (v / 20) * (2 * (ya * za + yb * zb + yc * zc) + (ya * zb + yb * za) + (ya * zc + yc * za) + (yb * zc + yc * zb));
                // Off-diagonal inertia-tensor entries are the *negative* products of inertia.
                _inertiaAccum.Ixy -= pxy;
                _inertiaAccum.Ixz -= pxz;
                _inertiaAccum.Iyz -= pyz;
            }

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

    const reliableAndNonDegenerate = volumeReliable && Math.abs(signedVolume) > 1e-12;

    const centroid = reliableAndNonDegenerate
        ? _centroidAccum.clone().divideScalar(4 * signedVolume)
        : null;

    let inertiaOrigin = null;
    if (withInertia && reliableAndNonDegenerate) {
        // If the shell winding is globally inverted (signedVolume < 0), every accumulated term
        // above is likewise negated (all terms scale linearly with the per-triangle signed
        // tetrahedron volume) — flip back to the physically-meaningful sign, mirroring how
        // `volume` itself takes the absolute value of `signedVolume`.
        const volSign = signedVolume < 0 ? -1 : 1;
        inertiaOrigin = {
            Ixx: _inertiaAccum.Ixx * volSign,
            Iyy: _inertiaAccum.Iyy * volSign,
            Izz: _inertiaAccum.Izz * volSign,
            Ixy: _inertiaAccum.Ixy * volSign,
            Ixz: _inertiaAccum.Ixz * volSign,
            Iyz: _inertiaAccum.Iyz * volSign,
        };
    }

    return {
        area,
        volume,
        signedVolume,
        triangleCount,
        meshCount,
        volumeReliable,
        centroid,
        inertiaOrigin,
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

/** How many cm equal one scene length unit (cube root of UNIT_VOLUME_TO_CM3). */
const UNIT_LENGTH_TO_CM = {
    mm: 0.1,
    cm: 1,
    m: 100,
    inch: 2.54,
};

/**
 * @param {string} modelUnit
 * @returns {number}
 */
export function unitLengthToCm(modelUnit) {
    return UNIT_LENGTH_TO_CM[modelUnit] ?? UNIT_LENGTH_TO_CM.mm;
}

/**
 * Scale a geometric (unit-density) inertia tensor — in scene-unit⁵, as returned by
 * `computeSurfaceAreaAndVolume(meshes, { withInertia: true }).inertiaOrigin` — to a mass-moment
 * tensor in g·cm² for a given density.
 * @param {{Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number}} inertiaOrigin
 * @param {number} densityGPerCm3
 * @param {string} modelUnit
 * @returns {{Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number}}
 */
export function computeInertiaTensorGrams(inertiaOrigin, densityGPerCm3, modelUnit) {
    if (!inertiaOrigin || !(densityGPerCm3 > 0)) return _zeroInertiaTensor();
    const l = unitLengthToCm(modelUnit);
    const factor = l * l * l * l * l * densityGPerCm3; // scene-unit⁵ → cm⁵, then × g/cm³ → g·cm²
    return {
        Ixx: inertiaOrigin.Ixx * factor,
        Iyy: inertiaOrigin.Iyy * factor,
        Izz: inertiaOrigin.Izz * factor,
        Ixy: inertiaOrigin.Ixy * factor,
        Ixz: inertiaOrigin.Ixz * factor,
        Iyz: inertiaOrigin.Iyz * factor,
    };
}

/** @returns {{Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number}} */
function _zeroInertiaTensor() {
    return { Ixx: 0, Iyy: 0, Izz: 0, Ixy: 0, Ixz: 0, Iyz: 0 };
}

/** @param {...({Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number}|null)} tensors */
function _addInertiaTensors(...tensors) {
    const sum = _zeroInertiaTensor();
    for (const t of tensors) {
        if (!t) continue;
        sum.Ixx += t.Ixx; sum.Iyy += t.Iyy; sum.Izz += t.Izz;
        sum.Ixy += t.Ixy; sum.Ixz += t.Ixz; sum.Iyz += t.Iyz;
    }
    return sum;
}

/**
 * Parallel-axis (Steiner) contribution to an inertia tensor for a point mass `massGrams` located
 * at `offset` relative to the reference point the tensor is/will-be expressed about. Note that
 * only `|offset|²` and pairwise *products* of its components are used, both invariant to negating
 * `offset` — so the very same term both (a) adds the shift when going from "about center of mass"
 * to "about an offset point", and (b) subtracts it when going the other way (see
 * `shiftInertiaTensorToCentroid`).
 * @param {number} massGrams
 * @param {{x:number,y:number,z:number}} offset
 * @returns {{Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number}}
 */
export function computeSteinerTerm(massGrams, offset) {
    if (!(massGrams !== 0) || !offset) return _zeroInertiaTensor();
    const { x, y, z } = offset;
    const r2 = x * x + y * y + z * z;
    return {
        Ixx: massGrams * (r2 - x * x),
        Iyy: massGrams * (r2 - y * y),
        Izz: massGrams * (r2 - z * z),
        Ixy: -massGrams * x * y,
        Ixz: -massGrams * x * z,
        Iyz: -massGrams * y * z,
    };
}

/**
 * Convert an inertia tensor expressed about the world origin `(0,0,0)` into one expressed about
 * the body's own center of mass, given its total mass and world-space centroid — a single
 * parallel-axis (Steiner) correction: `I_com = I_origin − steinerTerm(mass, centroid)`.
 * @param {{Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number}} tensorAtOrigin
 * @param {number} massGrams
 * @param {{x:number,y:number,z:number}} centroidWorld
 * @returns {{Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number}}
 */
export function shiftInertiaTensorToCentroid(tensorAtOrigin, massGrams, centroidWorld) {
    const steiner = computeSteinerTerm(massGrams, centroidWorld);
    return {
        Ixx: tensorAtOrigin.Ixx - steiner.Ixx,
        Iyy: tensorAtOrigin.Iyy - steiner.Iyy,
        Izz: tensorAtOrigin.Izz - steiner.Izz,
        Ixy: tensorAtOrigin.Ixy - steiner.Ixy,
        Ixz: tensorAtOrigin.Ixz - steiner.Ixz,
        Iyz: tensorAtOrigin.Iyz - steiner.Iyz,
    };
}

/**
 * Principal moments of inertia and their principal axes: eigenvalues/eigenvectors of the
 * symmetric 3×3 inertia tensor, via cyclic Jacobi rotations (Numerical-Recipes-style `jacobi`
 * routine — a handful of sweeps converge to machine precision for a 3×3 matrix; no dependency
 * needed). Eigenvalues are returned ascending, each paired with its unit-vector axis.
 * @param {{Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number}} tensor
 * @returns {{ values: number[], vectors: THREE.Vector3[] }}
 */
export function computePrincipalInertia(tensor) {
    const a = [
        [tensor.Ixx, tensor.Ixy, tensor.Ixz],
        [tensor.Ixy, tensor.Iyy, tensor.Iyz],
        [tensor.Ixz, tensor.Iyz, tensor.Izz],
    ];
    const v = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ];
    const n = 3;

    for (let sweep = 0; sweep < 60; sweep++) {
        let off = 0;
        for (let p = 0; p < n; p++) {
            for (let q = p + 1; q < n; q++) off += a[p][q] * a[p][q];
        }
        if (off < 1e-24) break;

        for (let p = 0; p < n - 1; p++) {
            for (let q = p + 1; q < n; q++) {
                const apq = a[p][q];
                if (Math.abs(apq) < 1e-300) continue;

                const theta = (a[q][q] - a[p][p]) / (2 * apq);
                const t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
                const c = 1 / Math.sqrt(t * t + 1);
                const s = t * c;
                const tau = s / (1 + c);
                const h = t * apq;

                a[p][p] -= h;
                a[q][q] += h;
                a[p][q] = 0;
                a[q][p] = 0;

                for (let i = 0; i < n; i++) {
                    if (i !== p && i !== q) {
                        const gip = a[i][p];
                        const giq = a[i][q];
                        a[i][p] = gip - s * (giq + tau * gip);
                        a[p][i] = a[i][p];
                        a[i][q] = giq + s * (gip - tau * giq);
                        a[q][i] = a[i][q];
                    }
                }
                for (let i = 0; i < n; i++) {
                    const gip = v[i][p];
                    const giq = v[i][q];
                    v[i][p] = gip - s * (giq + tau * gip);
                    v[i][q] = giq + s * (gip - tau * giq);
                }
            }
        }
    }

    const values = [a[0][0], a[1][1], a[2][2]];
    const vectors = [
        new THREE.Vector3(v[0][0], v[1][0], v[2][0]).normalize(),
        new THREE.Vector3(v[0][1], v[1][1], v[2][1]).normalize(),
        new THREE.Vector3(v[0][2], v[1][2], v[2][2]).normalize(),
    ];

    const order = [0, 1, 2].sort((i, j) => values[i] - values[j]);
    return {
        values: order.map(i => values[i]),
        vectors: order.map(i => vectors[i]),
    };
}

/**
 * Radius of gyration for each principal axis: r_i = sqrt(I_i / m). Returns `null` entries where
 * the principal moment is negative (numerical noise near zero) or mass is not positive.
 * @param {number[]} principalValuesGCm2 – principal moments, in g·cm²
 * @param {number} massGrams
 * @returns {(number|null)[]} radii in cm
 */
export function computeRadiusOfGyrationCm(principalValuesGCm2, massGrams) {
    if (!(massGrams > 0)) return principalValuesGCm2.map(() => null);
    return principalValuesGCm2.map(iVal => (iVal >= 0 ? Math.sqrt(iVal / massGrams) : null));
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

/**
 * @param {number} gramsCm2 – moment of inertia in g·cm² (base unit returned by
 *  `computeInertiaTensorGrams` / the mass-property roll-up)
 * @returns {string}
 */
export function formatInertia(gramsCm2) {
    if (!Number.isFinite(gramsCm2)) return '–';
    if (gramsCm2 === 0) return '0 g·cm²';
    const sign = gramsCm2 < 0 ? '-' : '';
    const abs = Math.abs(gramsCm2);
    const kgM2 = abs / 1e7; // 1 kg·m² = 1000 g × 10 000 cm² = 1e7 g·cm²
    if (kgM2 >= 1) return `${sign}${kgM2.toFixed(4)} kg·m²`;
    if (abs >= 1) return `${sign}${abs.toFixed(3)} g·cm²`;
    const gMm2 = abs * 100; // 1 g·mm² = 0.01 g·cm²
    if (gMm2 >= 1e-3) return `${sign}${gMm2.toFixed(3)} g·mm²`;
    return `${sign}${abs.toExponential(3)} g·cm²`;
}

function _isAuxiliaryObject(obj) {
    const ud = obj?.userData;
    return !!(ud && (ud._isMeasurement || ud._isAnnotation || ud._isAnnotation3d || ud._isCadDim3d || ud._isCoG));
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
 * `inertiaOriginGrams` is the inertia tensor (g·cm²) about the world origin `(0,0,0)`. Because
 * every mesh is integrated directly in world space, tensors about a *common* fixed point are
 * simply additive across the whole subtree — no parallel-axis correction is needed between
 * parent and children, exactly like `massGrams`/the numerator of `centroid` above. A node's own
 * `massOffset` contributes as a point mass anchored at the same point used for its centroid
 * (zero self-inertia, pure Steiner term). `inertiaCentroidGrams` is derived from
 * `inertiaOriginGrams` with a single parallel-axis shift once this node's own total mass and
 * centroid are known; it is `null` whenever `centroid` is `null`.
 *
 * @param {THREE.Object3D} node
 * @param {string} modelUnit
 * @returns {{
 *   massGrams: number,
 *   centroid: THREE.Vector3|null,
 *   hasOwnContribution: boolean,
 *   hasChildContribution: boolean,
 *   ownUnreliable: boolean,
 *   childUnreliable: boolean,
 *   inertiaOriginGrams: {Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number},
 *   inertiaCentroidGrams: {Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number}|null
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
        inertiaOriginGrams: _zeroInertiaTensor(),
        inertiaCentroidGrams: null,
    };
    if (!node) return empty;

    let childMassGrams = 0;
    let childWeightedCentroid = null;
    let childInertiaOriginGrams = _zeroInertiaTensor();
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
        // Child tensors are already expressed about the same world origin as this node's own
        // contribution, so they simply add — no parallel-axis correction needed here.
        childInertiaOriginGrams = _addInertiaTensors(childInertiaOriginGrams, sub.inertiaOriginGrams);
        if (sub.ownUnreliable || sub.childUnreliable) childUnreliable = true;
    }

    const density = Number(node.userData?.density);
    let ownMassGrams = 0;
    let ownVolumeCentroid = null;
    let ownInertiaOriginGrams = _zeroInertiaTensor();
    let hasOwnContribution = false;
    let ownUnreliable = false;

    if (Number.isFinite(density) && density > 0) {
        hasOwnContribution = true;
        const meshes = _collectMeshesUnder(node);
        const stats = computeSurfaceAreaAndVolume(meshes, { withInertia: true });
        if (stats.triangleCount > 0) {
            if (!stats.volumeReliable) ownUnreliable = true;
            ownMassGrams = computeMassGrams(stats.volume, density, modelUnit);
            ownVolumeCentroid = stats.centroid;
            if (stats.inertiaOrigin) {
                ownInertiaOriginGrams = computeInertiaTensorGrams(stats.inertiaOrigin, density, modelUnit);
            }
        }
    }

    const massOffsetKg = Number(node.userData?.massOffset);
    if (Number.isFinite(massOffsetKg) && massOffsetKg !== 0) {
        hasOwnContribution = true;
        const massOffsetGrams = massOffsetKg * 1000;
        ownMassGrams += massOffsetGrams;
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
        // massOffset is a point mass: zero self-inertia, its only contribution to the
        // about-origin tensor is the parallel-axis (Steiner) term anchored at the same point
        // used above for the mass-weighted centroid.
        ownInertiaOriginGrams = _addInertiaTensors(ownInertiaOriginGrams, computeSteinerTerm(massOffsetGrams, ownVolumeCentroid));
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

    const inertiaOriginGrams = _addInertiaTensors(ownInertiaOriginGrams, childInertiaOriginGrams);
    const inertiaCentroidGrams = centroid
        ? shiftInertiaTensorToCentroid(inertiaOriginGrams, totalMassGrams, centroid)
        : null;

    return {
        massGrams: totalMassGrams,
        centroid,
        hasOwnContribution,
        hasChildContribution,
        ownUnreliable,
        childUnreliable,
        inertiaOriginGrams,
        inertiaCentroidGrams,
    };
}

/**
 * Sum rolled-up mass and mass-weighted center of gravity for one or more selected roots.
 * `inertiaOriginGrams` tensors from independent roots are still about the same common world
 * origin, so — as within a single hierarchy — they simply add across roots too.
 * @param {THREE.Object3D|THREE.Object3D[]} rootOrRoots
 * @param {string} modelUnit
 * @returns {{
 *   massGrams: number,
 *   centroid: THREE.Vector3|null,
 *   hasContribution: boolean,
 *   unreliable: boolean,
 *   inertiaOriginGrams: {Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number},
 *   inertiaCentroidGrams: {Ixx:number,Iyy:number,Izz:number,Ixy:number,Ixz:number,Iyz:number}|null
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
    let inertiaOriginGrams = _zeroInertiaTensor();

    for (const root of roots) {
        const r = computeRolledUpMass(root, modelUnit);
        massGrams += r.massGrams;
        if (r.hasOwnContribution || r.hasChildContribution) hasContribution = true;
        if (r.centroid && r.massGrams !== 0) {
            if (!weightedCentroid) weightedCentroid = new THREE.Vector3();
            weightedCentroid.addScaledVector(r.centroid, r.massGrams);
        }
        inertiaOriginGrams = _addInertiaTensors(inertiaOriginGrams, r.inertiaOriginGrams);
        if (r.ownUnreliable || r.childUnreliable) unreliable = true;
    }

    const centroid = (weightedCentroid && massGrams !== 0) ? weightedCentroid.divideScalar(massGrams) : null;
    const inertiaCentroidGrams = centroid
        ? shiftInertiaTensorToCentroid(inertiaOriginGrams, massGrams, centroid)
        : null;

    return { massGrams, centroid, hasContribution, unreliable, inertiaOriginGrams, inertiaCentroidGrams };
}
