// edgeDetectionUtils.js – Shared mesh edge adjacency and sharp-edge classification
import * as THREE from 'three';

const _geoCache = new WeakMap(); // geometry → Map<thresholdDeg, data>

/**
 * Build adjacency graph and classify sharp vs smooth edges.
 * @param {THREE.BufferGeometry} geometry
 * @param {number} thresholdDeg – dihedral angle threshold in degrees (default 12)
 * @returns {{ canonPos, faceVerts, faceCount, faceNormals, edgeFaces, faceEdges, sharpEdgeSet, sharpThreshold, vertSharpAdj }}
 */
export function getMeshEdgeData(geometry, thresholdDeg = 12) {
    let thresholdMap = _geoCache.get(geometry);
    if (!thresholdMap) {
        thresholdMap = new Map();
        _geoCache.set(geometry, thresholdMap);
    }
    if (thresholdMap.has(thresholdDeg)) {
        return thresholdMap.get(thresholdDeg);
    }

    const pos = geometry.getAttribute('position');
    const rawIdx = geometry.index;
    const vertCount = pos.count;

    // --- 1. Merge vertices by position → canonical index --------------------
    const bbox = geometry.boundingBox || (geometry.computeBoundingBox(), geometry.boundingBox);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
    const eps = maxDim * 1e-5;
    const invEps = 1 / eps;

    const posMap = new Map();
    const canonical = new Int32Array(vertCount);
    const canonPos = [];
    let nextCanon = 0;

    for (let i = 0; i < vertCount; i++) {
        const kx = Math.round(pos.getX(i) * invEps);
        const ky = Math.round(pos.getY(i) * invEps);
        const kz = Math.round(pos.getZ(i) * invEps);
        const key = `${kx}_${ky}_${kz}`;
        if (!posMap.has(key)) {
            posMap.set(key, nextCanon);
            canonPos.push(i);
            nextCanon++;
        }
        canonical[i] = posMap.get(key);
    }

    // --- 2. Faces with canonical indices ------------------------------------
    const getOrigIdx = rawIdx ? (i) => rawIdx.getX(i) : (i) => i;
    const totalIdx = rawIdx ? rawIdx.count : vertCount;
    const faceCount = Math.floor(totalIdx / 3);

    const faceNormals = new Array(faceCount);
    const _v0 = new THREE.Vector3(), _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3();
    const _e1 = new THREE.Vector3(), _e2 = new THREE.Vector3();
    const faceVerts = new Array(faceCount);

    for (let f = 0; f < faceCount; f++) {
        const oi0 = getOrigIdx(f * 3), oi1 = getOrigIdx(f * 3 + 1), oi2 = getOrigIdx(f * 3 + 2);
        faceVerts[f] = [canonical[oi0], canonical[oi1], canonical[oi2]];
        _v0.fromBufferAttribute(pos, oi0);
        _v1.fromBufferAttribute(pos, oi1);
        _v2.fromBufferAttribute(pos, oi2);
        _e1.subVectors(_v1, _v0);
        _e2.subVectors(_v2, _v0);
        faceNormals[f] = new THREE.Vector3().crossVectors(_e1, _e2).normalize();
    }

    // --- 3. Edge → faces, face → edges -------------------------------------
    const edgeFaces = new Map();
    const faceEdges = new Array(faceCount);

    for (let f = 0; f < faceCount; f++) {
        const [a, b, c] = faceVerts[f];
        const keys = [];
        for (const [u, v] of [[a, b], [b, c], [c, a]]) {
            const key = Math.min(u, v) + '_' + Math.max(u, v);
            keys.push(key);
            if (!edgeFaces.has(key)) edgeFaces.set(key, []);
            edgeFaces.get(key).push(f);
        }
        faceEdges[f] = keys;
    }

    // --- 4. Sharp edges (canonical vertex pairs) ----------------------------
    const sharpThreshold = Math.cos(thresholdDeg * Math.PI / 180);
    const sharpEdgeSet = new Set();
    const vertSharpAdj = new Map();

    for (const [key, faces] of edgeFaces) {
        let isSharp = false;
        if (faces.length === 1) {
            isSharp = true;
        } else {
            for (let i = 0; i < faces.length - 1 && !isSharp; i++) {
                for (let j = i + 1; j < faces.length && !isSharp; j++) {
                    if (faceNormals[faces[i]].dot(faceNormals[faces[j]]) < sharpThreshold) {
                        isSharp = true;
                    }
                }
            }
        }
        if (isSharp) {
            sharpEdgeSet.add(key);
            const [a, b] = key.split('_').map(Number);
            if (!vertSharpAdj.has(a)) vertSharpAdj.set(a, new Map());
            if (!vertSharpAdj.has(b)) vertSharpAdj.set(b, new Map());
            vertSharpAdj.get(a).set(b, key);
            vertSharpAdj.get(b).set(a, key);
        }
    }

    const data = {
        canonPos,
        faceVerts,
        faceCount,
        faceNormals,
        edgeFaces,
        faceEdges,
        sharpEdgeSet,
        sharpThreshold,
        vertSharpAdj,
    };
    thresholdMap.set(thresholdDeg, data);
    return data;
}

/**
 * Clear cached edge data. If geometry is omitted, only face-cache callers should reset separately.
 * @param {THREE.BufferGeometry} [geometry]
 */
export function clearEdgeDetectionCache(geometry) {
    if (geometry) {
        _geoCache.delete(geometry);
    }
}
