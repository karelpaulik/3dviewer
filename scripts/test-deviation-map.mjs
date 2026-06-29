/**
 * Headless smoke test for deviation map computation.
 * Run: node scripts/test-deviation-map.mjs
 */
import * as THREE from 'three';
import {
    computeDeviationMap,
    applyDeviationColors,
    clearDeviationMap,
    computeDeviationStats,
    computeOutOfTolerance,
    mapDistanceToColor,
    angleDegToNormalDot,
    normalDotToAngleDeg,
    DEVIATION_DEFAULTS,
} from '../src/deviationMapUtils.js';

function makeBoxMesh(name, offsetX = 0) {
    const geom = new THREE.BoxGeometry(10, 10, 10);
    const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = name;
    mesh.position.x = offsetX;
    mesh.updateMatrixWorld(true);
    return mesh;
}

/** Vertices whose world normal matches targetNormal (e.g. pure -X face). */
function distancesOnFaceWithNormal(mesh, distancesByMesh, targetNormal, targetNormalTolerance = 0.01) {
    const meshDistances = distancesByMesh.get(mesh);
    if (!meshDistances) throw new Error('mesh distances missing');

    const pos = mesh.geometry.getAttribute('position');
    let normalAttr = mesh.geometry.getAttribute('normal');
    if (!normalAttr) {
        mesh.geometry.computeVertexNormals();
        normalAttr = mesh.geometry.getAttribute('normal');
    }

    const out = [];
    mesh.updateMatrixWorld(true);
    const v = new THREE.Vector3();
    const n = new THREE.Vector3();
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    const worldTarget = targetNormal.clone().normalize();

    for (let i = 0; i < pos.count; i++) {
        n.fromBufferAttribute(normalAttr, i).applyMatrix3(normalMatrix).normalize();
        if (n.dot(worldTarget) < 1 - targetNormalTolerance) continue;
        v.fromBufferAttribute(pos, i);
        v.applyMatrix4(mesh.matrixWorld);
        out.push({ index: i, distance: meshDistances[i], pos: v.clone() });
    }
    return out;
}

async function main() {
    if (Math.abs(angleDegToNormalDot(60) - 0.5) > 1e-6) {
        throw new Error('angleDegToNormalDot(60) should be 0.5');
    }
    if (Math.abs(normalDotToAngleDeg(0.5) - 60) > 1e-4) {
        throw new Error('normalDotToAngleDeg(0.5) should be 60');
    }

    const c = mapDistanceToColor(0);
    if (c.r <= 0 || c.b <= 0) throw new Error('mapDistanceToColor(0) should be bluish');

    const statsEmpty = computeDeviationStats(new Float32Array(0));
    if (statsEmpty.vertexCount !== 0 || statsEmpty.ambiguousCount !== 0) {
        throw new Error('empty stats failed');
    }

    const ambiguousStats = computeDeviationStats(new Float32Array([1, Infinity, 2]), 0.5);
    if (ambiguousStats.ambiguousCount !== 1) throw new Error('ambiguousCount failed');
    if (ambiguousStats.max !== 2) throw new Error('max should ignore Infinity');

    // --- Existing offset smoke test (normal-aware default) ---
    const ref = makeBoxMesh('reference', 0);
    const scan = makeBoxMesh('scan', 0.5);

    const result = await computeDeviationMap(scan, ref, { batchSize: 500, tolerance: 0.1 });
    if (result.error) throw new Error(result.error);
    if (!result.stats || result.stats.vertexCount !== 24) {
        throw new Error(`expected 24 vertices, got ${result.stats?.vertexCount}`);
    }
    if (result.stats.min < 0 || result.stats.max <= 0) {
        throw new Error(`invalid distance range min=${result.stats.min} max=${result.stats.max}`);
    }

    applyDeviationColors(scan, result.distancesByMesh, result.maxDistance);
    if (!scan.geometry.getAttribute('color')) throw new Error('color attribute missing');
    if (!scan.material.vertexColors) throw new Error('vertexColors not enabled');

    const ootLow = computeOutOfTolerance(result.distancesByMesh, 0.1);
    const ootHigh = computeOutOfTolerance(result.distancesByMesh, 10);
    if (ootHigh.outOfTolerance > ootLow.outOfTolerance) {
        throw new Error('out of tolerance count should decrease as tolerance increases');
    }

    clearDeviationMap(scan, ref);

    // --- Adjacent cubes: normal-aware should not report 0 on touching face ---
    const refAdjacent = makeBoxMesh('refAdjacent', 0);
    const scanAdjacent = makeBoxMesh('scanAdjacent', 10);

    const normalResult = await computeDeviationMap(scanAdjacent, refAdjacent, {
        batchSize: 500,
        tolerance: 0.1,
        useNormalFilter: true,
        minNormalDot: angleDegToNormalDot(60),
    });
    if (normalResult.error) throw new Error(normalResult.error);

    const minusX = new THREE.Vector3(-1, 0, 0);
    const touchSamples = distancesOnFaceWithNormal(scanAdjacent, normalResult.distancesByMesh, minusX);
    if (touchSamples.length !== 4) {
        throw new Error(`expected 4 pure -X face vertices, got ${touchSamples.length}`);
    }
    const touchDistances = touchSamples.map(s => s.distance);
    const touchMin = Math.min(...touchDistances);
    const touchMax = Math.max(...touchDistances);
    if (touchMin < 9.5 || touchMax > 10.5) {
        throw new Error(`adjacent normal-aware -X face expected ~10, got min=${touchMin} max=${touchMax}`);
    }

    // --- Legacy mode: touching face should be ~0 ---
    const legacyResult = await computeDeviationMap(scanAdjacent, refAdjacent, {
        batchSize: 500,
        tolerance: 0.1,
        useNormalFilter: false,
    });
    if (legacyResult.error) throw new Error(legacyResult.error);

    const legacyTouch = distancesOnFaceWithNormal(scanAdjacent, legacyResult.distancesByMesh, minusX)
        .map(s => s.distance);
    const legacyTouchMax = Math.max(...legacyTouch);
    if (legacyTouchMax > 0.01) {
        throw new Error(`legacy -X face expected ~0, got max=${legacyTouchMax}`);
    }

    // --- 180° angle: filter disabled, similar to legacy on touching face ---
    const wideAngleResult = await computeDeviationMap(scanAdjacent, refAdjacent, {
        batchSize: 500,
        tolerance: 0.1,
        useNormalFilter: true,
        minNormalDot: angleDegToNormalDot(180),
    });
    const wideTouch = distancesOnFaceWithNormal(scanAdjacent, wideAngleResult.distancesByMesh, minusX)
        .map(s => s.distance);
    if (Math.max(...wideTouch) > 0.01) {
        throw new Error('180° angle should allow opposite normals (-X face ~0)');
    }

    console.log('Deviation map smoke test OK');
    console.log(`  aligned offset: min=${result.stats.min.toFixed(4)} max=${result.stats.max.toFixed(4)}`);
    console.log(`  adjacent normal-aware -X face: ~${touchMin.toFixed(4)} mm`);
    console.log(`  adjacent legacy -X face max: ${legacyTouchMax.toFixed(4)} mm`);
}

main().catch(err => {
    console.error('TEST FAILED:', err);
    process.exit(1);
});
