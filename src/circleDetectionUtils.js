// circleDetectionUtils.js – Detect circle center from a raycaster hit on tessellated CAD geometry
import * as THREE from 'three';
import { getMeshEdgeData, clearEdgeDetectionCache } from './edgeDetectionUtils.js';

const _circleCache = new WeakMap(); // geometry → { circles, vertToCircles }
const _faceCache = { mesh: null, faceIndex: -1, result: null };

const SHARP_ANGLE_DEG = 12;       // Normal angle threshold for a "sharp" (feature) edge
const CIRCLE_FIT_TOLERANCE = 0.25; // Max radial error as fraction of radius
const MIN_LOOP_VERTICES = 3;      // Minimum vertices for a valid circular loop
const MAX_LOOP_VERTICES = 4000;   // Safety cap
const DEBUG = false;               // Set true to see detection stats in console

// ---------------------------------------------------------------------------
// Internal: build adjacency + pre-detect all circle loops (cached per geometry)
// ---------------------------------------------------------------------------
function _getGeoData(geometry) {
    if (_circleCache.has(geometry)) return _circleCache.get(geometry);

    const pos = geometry.getAttribute('position');
    const edgeData = getMeshEdgeData(geometry, SHARP_ANGLE_DEG);
    const { canonPos, faceVerts, faceCount, edgeFaces, faceEdges, sharpEdgeSet, sharpThreshold, vertSharpAdj } = edgeData;

    // --- 5. Find ALL closed sharp-edge loops --------------------------------
    const usedEdges = new Set();
    const circles = [];

    for (const startEdge of sharpEdgeSet) {
        if (usedEdges.has(startEdge)) continue;
        const [startA, startB] = startEdge.split('_').map(Number);

        const loop = _walkLoop(startA, startB, vertSharpAdj, canonPos, pos);
        if (!loop || loop.length < MIN_LOOP_VERTICES) continue;

        const loopKey = loop.slice().sort((a, b) => a - b).join(',');
        if (usedEdges.has('L_' + loopKey)) continue;
        usedEdges.add('L_' + loopKey);

        const loopPts = loop.map(cv => new THREE.Vector3().fromBufferAttribute(pos, canonPos[cv]));
        const fit = _fitCircle3D(loopPts);
        if (!fit) continue;

        for (let i = 0; i < loop.length; i++) {
            const a = loop[i], b = loop[(i + 1) % loop.length];
            usedEdges.add(Math.min(a, b) + '_' + Math.max(a, b));
        }

        circles.push({ loopVerts: loop, center: fit.center, radius: fit.radius });
    }

    // --- 6. Map face → nearby circle indices (via shared canonical vertices) -
    const vertToCircles = new Map();
    for (let ci = 0; ci < circles.length; ci++) {
        for (const v of circles[ci].loopVerts) {
            if (!vertToCircles.has(v)) vertToCircles.set(v, []);
            vertToCircles.get(v).push(ci);
        }
    }

    if (DEBUG) {
        const vertCount = pos.count;
        console.log(`[CircleDetect] geometry: ${vertCount} verts, ${faceCount} faces, ${sharpEdgeSet.size} sharp edges, ${circles.length} circles detected`);
    }

    const data = { ...edgeData, circles, vertToCircles };
    _circleCache.set(geometry, data);
    return data;
}

// ---------------------------------------------------------------------------
// Walk sharp edges linearly. At T-junctions (degree>2) pick the neighbor
// whose outgoing direction best continues the incoming direction (greedy).
// O(n) per loop – safe, no combinatorial explosion.
// ---------------------------------------------------------------------------
function _walkLoop(startU, startV, vertSharpAdj, canonPos, pos) {
    const loop = [startU];
    let prev = startU, curr = startV;

    for (let i = 0; i < MAX_LOOP_VERTICES; i++) {
        if (curr === startU) return loop;
        loop.push(curr);

        const adj = vertSharpAdj.get(curr);
        if (!adj || adj.size < 2) return null;

        if (adj.size === 2) {
            let next = -1;
            for (const [n] of adj) {
                if (n !== prev) { next = n; break; }
            }
            if (next === -1) return null;
            prev = curr;
            curr = next;
        } else {
            const pPrev = _posFromCanon(prev, canonPos, pos);
            const pCurr = _posFromCanon(curr, canonPos, pos);
            const inDir = new THREE.Vector3().subVectors(pCurr, pPrev).normalize();

            let bestNext = -1;
            let bestDot = -2;
            for (const [n] of adj) {
                if (n === prev) continue;
                const pN = _posFromCanon(n, canonPos, pos);
                const outDir = new THREE.Vector3().subVectors(pN, pCurr).normalize();
                const d = inDir.dot(outDir);
                if (d > bestDot) {
                    bestDot = d;
                    bestNext = n;
                }
            }
            if (bestNext === -1) return null;
            prev = curr;
            curr = bestNext;
        }
    }
    return null;
}

function _posFromCanon(canonVert, canonPos, pos) {
    const oi = canonPos[canonVert];
    return new THREE.Vector3(pos.getX(oi), pos.getY(oi), pos.getZ(oi));
}

// ---------------------------------------------------------------------------
// Algebraic circle fit for coplanar 3-D points
// Returns { center: Vector3, radius: number } or null
// ---------------------------------------------------------------------------
function _fitCircle3D(points) {
    const count = points.length;
    if (count < 3) return null;

    const centroid = new THREE.Vector3();
    for (const p of points) centroid.add(p);
    centroid.divideScalar(count);

    const p0 = points[0];
    const p1 = points[Math.floor(count / 3)];
    const p2 = points[Math.floor(2 * count / 3)];
    const e1 = new THREE.Vector3().subVectors(p1, p0);
    const e2 = new THREE.Vector3().subVectors(p2, p0);
    const normal = new THREE.Vector3().crossVectors(e1, e2).normalize();
    if (normal.lengthSq() < 1e-10) return null;

    const uDir = e1.clone().normalize();
    const vDir = new THREE.Vector3().crossVectors(normal, uDir).normalize();

    const pts2d = points.map(p => {
        const d = new THREE.Vector3().subVectors(p, centroid);
        return { x: d.dot(uDir), y: d.dot(vDir) };
    });

    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxd = 0, syd = 0, sd = 0;
    for (const { x, y } of pts2d) {
        const d = x * x + y * y;
        sx += x; sy += y;
        sxx += x * x; syy += y * y; sxy += x * y;
        sxd += x * d; syd += y * d; sd += d;
    }

    const M = [
        [sxx, sxy, sx],
        [sxy, syy, sy],
        [sx, sy, count]
    ];
    const B = [sxd, syd, sd];

    const det = M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1])
              - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0])
              + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
    if (Math.abs(det) < 1e-12) return null;

    const a = (B[0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1])
             - M[0][1] * (B[1] * M[2][2] - M[1][2] * B[2])
             + M[0][2] * (B[1] * M[2][1] - M[1][1] * B[2])) / det;
    const b = (M[0][0] * (B[1] * M[2][2] - M[1][2] * B[2])
             - B[0] * (M[1][0] * M[2][2] - M[1][2] * M[2][0])
             + M[0][2] * (M[1][0] * B[2] - B[1] * M[2][0])) / det;

    const cx = a / 2, cy = b / 2;
    const cVal = (M[0][0] * (M[1][1] * B[2] - B[1] * M[2][1])
             - M[0][1] * (M[1][0] * B[2] - B[1] * M[2][0])
             + B[0] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])) / det;
    const rSq = cVal + cx * cx + cy * cy;
    if (rSq <= 0) return null;
    const r = Math.sqrt(rSq);

    let maxErr = 0;
    for (const { x, y } of pts2d) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        maxErr = Math.max(maxErr, Math.abs(dist - r));
    }
    if (maxErr > r * CIRCLE_FIT_TOLERANCE) return null;

    const center3d = centroid.clone()
        .add(uDir.clone().multiplyScalar(cx))
        .add(vDir.clone().multiplyScalar(cy));

    return { center: center3d, radius: r };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Detect circle center from a raycaster intersection hit.
 * @param {Object} hit – THREE.js raycaster intersection { object, faceIndex, point, … }
 * @returns {THREE.Vector3|null} world-space circle center, or null
 */
export function detectCircleCenterFromHit(hit) {
    if (!hit || hit.faceIndex == null) return null;

    const mesh = hit.object;
    const faceIndex = hit.faceIndex;

    if (_faceCache.mesh === mesh && _faceCache.faceIndex === faceIndex) {
        return _faceCache.result;
    }

    const geometry = mesh.geometry;
    if (!geometry) return _cache(mesh, faceIndex, null);
    const pos = geometry.getAttribute('position');
    if (!pos) return _cache(mesh, faceIndex, null);

    const data = _getGeoData(geometry);
    const { faceVerts, faceCount, faceEdges, edgeFaces, sharpEdgeSet, circles, vertToCircles } = data;

    if (faceIndex >= faceCount || circles.length === 0) return _cache(mesh, faceIndex, null);

    const BFS_MAX_FACES = 3000;
    const visitedFaces = new Set([faceIndex]);
    const candidateCircles = new Set();
    let frontier = [faceIndex];

    for (const cv of faceVerts[faceIndex]) {
        const cis = vertToCircles.get(cv);
        if (cis) for (const ci of cis) candidateCircles.add(ci);
    }

    while (frontier.length > 0 && visitedFaces.size < BFS_MAX_FACES) {
        const nextFrontier = [];
        for (const fi of frontier) {
            const edges = faceEdges[fi];
            for (const edgeKey of edges) {
                const isSharp = sharpEdgeSet.has(edgeKey);

                if (isSharp) {
                    const [a, b] = edgeKey.split('_').map(Number);
                    for (const cv of [a, b]) {
                        const cis = vertToCircles.get(cv);
                        if (cis) for (const ci of cis) candidateCircles.add(ci);
                    }
                    continue;
                }

                const neighborFaces = edgeFaces.get(edgeKey);
                if (!neighborFaces) continue;
                for (const nf of neighborFaces) {
                    if (!visitedFaces.has(nf)) {
                        visitedFaces.add(nf);
                        nextFrontier.push(nf);
                        for (const cv of faceVerts[nf]) {
                            const cis = vertToCircles.get(cv);
                            if (cis) for (const ci of cis) candidateCircles.add(ci);
                        }
                    }
                }
            }
        }
        frontier = nextFrontier;
    }

    if (candidateCircles.size === 0) return _cache(mesh, faceIndex, null);

    mesh.updateMatrixWorld(true);
    let bestResult = null;
    let bestDist = Infinity;

    for (const ci of candidateCircles) {
        const circle = circles[ci];
        const worldCenter = circle.center.clone().applyMatrix4(mesh.matrixWorld);
        const dist = worldCenter.distanceTo(hit.point);
        if (dist < bestDist) {
            bestDist = dist;
            bestResult = worldCenter;
        }
    }

    return _cache(mesh, faceIndex, bestResult);
}

function _cache(mesh, faceIndex, result) {
    _faceCache.mesh = mesh;
    _faceCache.faceIndex = faceIndex;
    _faceCache.result = result;
    return result;
}

/**
 * Clear the detection cache (call when geometry changes).
 * @param {THREE.BufferGeometry} [geometry]
 */
export function clearCircleDetectionCache(geometry) {
    _faceCache.mesh = null;
    _faceCache.faceIndex = -1;
    _faceCache.result = null;
    if (geometry) {
        _circleCache.delete(geometry);
    }
    clearEdgeDetectionCache(geometry);
}
