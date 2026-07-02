/**
 * Headless smoke test for deviation map computation.
 * Run: node scripts/test-deviation-map.mjs
 */
import * as THREE from 'three';
import {
    computeDeviationMap,
    computeBidirectionalDeviationMap,
    mergeDeviationStats,
    mergeDistancesByMesh,
    applyDeviationColors,
    clearDeviationMap,
    computeDeviationStats,
    computeOutOfTolerance,
    mapDistanceToColor,
    angleDegToNormalDot,
    normalDotToAngleDeg,
    hasComparisonMeshes,
    comparisonTargetsOverlap,
    matchesProbeDeviationFilter,
    findDeviationProbeHit,
    sampleDeviationAtHit,
    DEVIATION_DEFAULTS,
} from '../src/deviationMapUtils.js';
import {
    captureObjectTransform,
    applyObjectTransform,
    createDeviationPoseState,
    updateDisplayPose,
    applyComparisonPoses,
    applyDisplayPoses,
} from '../src/deviationPoseUtils.js';

function makeMockObject(x = 0, y = 0, z = 0) {
    const obj = new THREE.Object3D();
    obj.position.set(x, y, z);
    obj.quaternion.setFromEuler(new THREE.Euler(0.1, 0.2, 0.3));
    obj.scale.set(1.1, 1.2, 1.3);
    obj.updateMatrixWorld(true);
    return obj;
}

function testDeviationPoseUtils() {
    const scan = makeMockObject(0, 0, 0);
    const ref = makeMockObject(5, 0, 0);

    const state = createDeviationPoseState(scan, ref);
    if (state.scan !== scan || state.ref !== ref) {
        throw new Error('createDeviationPoseState should store object refs');
    }
    if (state.poses.scan.comparison.position.x !== 0 || state.poses.ref.comparison.position.x !== 5) {
        throw new Error('createDeviationPoseState comparison pose mismatch');
    }
    if (state.poses.scan.display.position.x !== 0 || state.poses.ref.display.position.x !== 5) {
        throw new Error('createDeviationPoseState display pose mismatch');
    }

    scan.position.set(100, 0, 0);
    scan.updateMatrixWorld(true);
    if (!updateDisplayPose(state, scan)) {
        throw new Error('updateDisplayPose should return true for scan');
    }
    if (state.poses.scan.display.position.x !== 100) {
        throw new Error('updateDisplayPose should update scan display pose');
    }
    if (state.poses.scan.comparison.position.x !== 0) {
        throw new Error('updateDisplayPose must not change comparison pose');
    }
    if (updateDisplayPose(state, makeMockObject())) {
        throw new Error('updateDisplayPose should return false for unrelated object');
    }

    applyComparisonPoses(state);
    if (scan.position.x !== 0 || ref.position.x !== 5) {
        throw new Error('applyComparisonPoses should restore comparison transforms');
    }

    applyDisplayPoses(state);
    if (scan.position.x !== 100 || ref.position.x !== 5) {
        throw new Error('applyDisplayPoses should restore display transforms');
    }

    const snapshot = captureObjectTransform(scan);
    scan.position.set(999, 999, 999);
    applyObjectTransform(scan, snapshot);
    if (scan.position.x !== 100) {
        throw new Error('applyObjectTransform should restore captured transform');
    }
}

function makeBoxMesh(name, offsetX = 0) {
    const geom = new THREE.BoxGeometry(10, 10, 10);
    const mat = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.name = name;
    mesh.position.x = offsetX;
    mesh.updateMatrixWorld(true);
    return mesh;
}

/** Cube 10³ and cuboid 10×10×10.5 with five faces aligned (shared bottom). */
function makeAlignedCubeCuboidPair() {
    const cube = makeBoxMesh('cube', 0);
    const cuboid = new THREE.Mesh(
        new THREE.BoxGeometry(10, 10, 10.5),
        new THREE.MeshStandardMaterial({ color: 0x888888 }),
    );
    cuboid.name = 'cuboid';
    cuboid.position.z = 0.25;
    cuboid.updateMatrixWorld(true);
    return { cube, cuboid };
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

function testProbeDeviationFilter() {
    if (!matchesProbeDeviationFilter(0.05, { enabled: false })) {
        throw new Error('disabled filter should accept any distance');
    }
    if (!matchesProbeDeviationFilter(0.15, { enabled: true, mode: 'above', threshold: 0.1 })) {
        throw new Error('above filter should accept distance >= threshold');
    }
    if (matchesProbeDeviationFilter(0.05, { enabled: true, mode: 'above', threshold: 0.1 })) {
        throw new Error('above filter should reject distance < threshold');
    }
    if (!matchesProbeDeviationFilter(0.05, { enabled: true, mode: 'below', threshold: 0.1 })) {
        throw new Error('below filter should accept distance <= threshold');
    }
    if (matchesProbeDeviationFilter(0.15, { enabled: true, mode: 'below', threshold: 0.1 })) {
        throw new Error('below filter should reject distance > threshold');
    }
    if (!matchesProbeDeviationFilter(Number.NaN, { enabled: true, mode: 'above', threshold: 0.1 })) {
        throw new Error('ambiguous distance should pass above filter');
    }
    if (matchesProbeDeviationFilter(Number.NaN, { enabled: true, mode: 'below', threshold: 0.1 })) {
        throw new Error('ambiguous distance should fail below filter');
    }

    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array([
        0, 0, 0,
        1, 0, 0,
        0, 1, 0,
    ]);
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mesh = new THREE.Mesh(geom, new THREE.MeshStandardMaterial());
    mesh.updateMatrixWorld(true);

    const distances = new Float32Array([0.05, 0.05, 0.05]);
    const distancesByMesh = new Map([[mesh, distances]]);

    const hitNear = {
        object: mesh,
        face: { a: 0, b: 1, c: 2 },
        barycoord: new THREE.Vector3(1, 0, 0),
        point: new THREE.Vector3(),
    };
    const hitFar = {
        object: mesh,
        face: { a: 0, b: 1, c: 2 },
        barycoord: new THREE.Vector3(0, 1, 0),
        point: new THREE.Vector3(),
    };

    const nearSample = sampleDeviationAtHit(hitNear, distancesByMesh);
    const farSample = sampleDeviationAtHit(hitFar, distancesByMesh);
    if (!nearSample || Math.abs(nearSample.distance - 0.05) > 1e-6 || !farSample || Math.abs(farSample.distance - 0.05) > 1e-6) {
        throw new Error('sampleDeviationAtHit mock setup failed');
    }

    const unfiltered = findDeviationProbeHit([hitNear, hitFar], distancesByMesh);
    if (!unfiltered || unfiltered.hit !== hitNear) {
        throw new Error('unfiltered probe hit should return first intersection');
    }

    distances[1] = 0.15;
    distances[2] = 0.15;
    const aboveHit = findDeviationProbeHit([hitNear, hitFar], distancesByMesh, {
        enabled: true,
        mode: 'above',
        threshold: 0.1,
    });
    if (!aboveHit || aboveHit.hit !== hitFar) {
        throw new Error('above filter should skip in-tolerance hit and return OOT hit');
    }

    distances[0] = 0.15;
    distances[1] = 0.05;
    distances[2] = 0.05;
    const belowHit = findDeviationProbeHit([hitNear, hitFar], distancesByMesh, {
        enabled: true,
        mode: 'below',
        threshold: 0.1,
    });
    if (!belowHit || belowHit.hit !== hitFar) {
        throw new Error('below filter should skip OOT hit and return in-tolerance hit');
    }

    distances[0] = 0.05;
    const noneAfterReset = findDeviationProbeHit([hitNear], distancesByMesh, {
        enabled: true,
        mode: 'above',
        threshold: 0.1,
    });
    if (noneAfterReset !== null) {
        throw new Error('above filter should return null when all hits are below threshold');
    }
}

async function testComputeAbort() {
    const { cube, cuboid } = makeAlignedCubeCuboidPair();
    const controller = new AbortController();
    let progressCalls = 0;

    const result = await computeDeviationMap(cube, cuboid, {
        batchSize: 10,
        tolerance: 0.1,
        signal: controller.signal,
        onProgress() {
            progressCalls++;
            if (progressCalls === 1) controller.abort();
        },
    });

    if (!result.cancelled) {
        throw new Error('aborted computeDeviationMap should return cancelled: true');
    }
    if (result.error) {
        throw new Error(`aborted computeDeviationMap should not set error: ${result.error}`);
    }
    if (result.distancesByMesh.size !== 0) {
        throw new Error('aborted computeDeviationMap should return empty distancesByMesh');
    }

    const biController = new AbortController();
    let biAborted = false;
    const biResult = await computeBidirectionalDeviationMap(cube, cuboid, {
        batchSize: 10,
        tolerance: 0.1,
        signal: biController.signal,
        onProgress(p) {
            if (!biAborted && p > 0.01) {
                biAborted = true;
                biController.abort();
            }
        },
    });
    if (!biResult.cancelled) {
        throw new Error('aborted computeBidirectionalDeviationMap should return cancelled: true');
    }
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
    if (scan.geometry.getAttribute('color').itemSize !== 4) throw new Error('color attribute should be RGBA');
    if (!scan.material.vertexColors) throw new Error('vertexColors not enabled');

    applyDeviationColors(scan, result.distancesByMesh, 10, 0.25);
    const rgba = scan.geometry.getAttribute('color').array;
    if (Math.abs(rgba[3] - 0.25) > 1e-6 || Math.abs(rgba[7] - 0.25) > 1e-6) {
        throw new Error('within-tolerance vertices should use configured opacity');
    }
    if (scan.material.transparent) throw new Error('base mesh should stay opaque in split-pass mode');
    if (!scan.material.depthWrite) throw new Error('base mesh should write depth in split-pass mode');
    const ghost = scan.userData._deviationGhostOverlay;
    if (!ghost?.isMesh) throw new Error('ghost overlay expected for partial opacity');
    if (!ghost.material.transparent) throw new Error('ghost overlay should be transparent');
    if (ghost.material.depthWrite) throw new Error('ghost overlay should not write depth');

    applyDeviationColors(scan, result.distancesByMesh, 10, 0);
    if (scan.userData._deviationGhostOverlay) throw new Error('ghost overlay should be removed when opacity is 0');
    if (scan.material.transparent) throw new Error('opacity 0 should use opaque pass with alphaTest');
    if (scan.material.alphaTest <= 0) throw new Error('opacity 0 should discard in-tolerance fragments via alphaTest');

    applyDeviationColors(scan, result.distancesByMesh, 10, 1);
    const rgbaFull = scan.geometry.getAttribute('color').array;
    if (Math.abs(rgbaFull[3] - 1) > 1e-6) throw new Error('opacity 1 should restore full alpha on in-tolerance vertices');
    if (scan.material.transparent) throw new Error('transparent should be disabled when opacity is 1');
    if (scan.userData._deviationGhostOverlay) throw new Error('ghost overlay should be removed when opacity is 1');

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

    // --- mergeDeviationStats ---
    const merged = mergeDeviationStats(
        {
            vertexCount: 24, ambiguousCount: 0, min: 0, max: 1, mean: 0.5, rms: 0.6,
            outOfTolerance: 5, outOfTolerancePct: 20.83,
        },
        {
            vertexCount: 24, ambiguousCount: 0, min: 0, max: 0.5, mean: 0.1, rms: 0.2,
            outOfTolerance: 2, outOfTolerancePct: 8.33,
        },
    );
    if (merged.vertexCount !== 48) throw new Error(`merged vertexCount expected 48, got ${merged.vertexCount}`);
    if (merged.max !== 1) throw new Error(`merged max expected 1, got ${merged.max}`);
    if (merged.outOfTolerance !== 7) throw new Error(`merged outOfTolerance expected 7, got ${merged.outOfTolerance}`);

    // --- Cube vs taller cuboid (5 faces aligned, +Z overshoot on cuboid) ---
    const { cube, cuboid } = makeAlignedCubeCuboidPair();
    const plusZ = new THREE.Vector3(0, 0, 1);

    const cuboidScanResult = await computeDeviationMap(cuboid, cube, {
        batchSize: 500,
        tolerance: 0.1,
    });
    if (cuboidScanResult.error) throw new Error(cuboidScanResult.error);

    const cuboidTop = distancesOnFaceWithNormal(cuboid, cuboidScanResult.distancesByMesh, plusZ)
        .map(s => s.distance);
    if (cuboidTop.length !== 4) {
        throw new Error(`expected 4 cuboid +Z face vertices, got ${cuboidTop.length}`);
    }
    const cuboidTopMin = Math.min(...cuboidTop);
    const cuboidTopMax = Math.max(...cuboidTop);
    if (cuboidTopMin < 0.45 || cuboidTopMax > 0.55) {
        throw new Error(`cuboid +Z overshoot expected ~0.5, got min=${cuboidTopMin} max=${cuboidTopMax}`);
    }

    const biResult = await computeBidirectionalDeviationMap(cube, cuboid, {
        batchSize: 500,
        tolerance: 0.1,
    });
    if (biResult.error) throw new Error(biResult.error);
    if (!biResult.stats || biResult.stats.vertexCount !== 48) {
        throw new Error(`bidirectional vertexCount expected 48, got ${biResult.stats?.vertexCount}`);
    }
    if (biResult.bToA.stats.max < 0.45) {
        throw new Error(`bidirectional B→A max expected >= 0.5, got ${biResult.bToA.stats.max}`);
    }

    const mergedMaps = mergeDistancesByMesh(biResult.aToB.distancesByMesh, biResult.bToA.distancesByMesh);
    if (mergedMaps.size !== 2) {
        throw new Error(`merged distance maps expected 2 meshes, got ${mergedMaps.size}`);
    }

    clearDeviationMap(cube, null);
    clearDeviationMap(cuboid, null);

    // --- Hierarchy roots (Group with mesh descendants) ---
    const groupA = new THREE.Group();
    groupA.name = 'AssemblyA';
    const meshA1 = makeBoxMesh('meshA1', 0);
    const meshA2 = makeBoxMesh('meshA2', 15);
    groupA.add(meshA1, meshA2);

    const groupB = new THREE.Group();
    groupB.name = 'AssemblyB';
    const meshB1 = makeBoxMesh('meshB1', 0.5);
    groupB.add(meshB1);

    const hierarchyResult = await computeDeviationMap(groupA, groupB, { batchSize: 500, tolerance: 0.1 });
    if (hierarchyResult.error) throw new Error(hierarchyResult.error);
    if (hierarchyResult.distancesByMesh.size !== 2) {
        throw new Error(`hierarchy scan expected 2 meshes, got ${hierarchyResult.distancesByMesh.size}`);
    }
    if (!hierarchyResult.stats || hierarchyResult.stats.vertexCount !== 48) {
        throw new Error(`hierarchy vertexCount expected 48, got ${hierarchyResult.stats?.vertexCount}`);
    }

    if (!hasComparisonMeshes(groupA) || !hasComparisonMeshes(groupB)) {
        throw new Error('hasComparisonMeshes should accept hierarchy roots');
    }
    if (hasComparisonMeshes(new THREE.Group())) {
        throw new Error('hasComparisonMeshes should reject empty groups');
    }
    if (!comparisonTargetsOverlap(groupA, meshA1)) {
        throw new Error('comparisonTargetsOverlap should detect parent/child');
    }
    if (comparisonTargetsOverlap(groupA, groupB)) {
        throw new Error('comparisonTargetsOverlap should not match unrelated roots');
    }

    // --- Hierarchy with mixed optional attributes (uv on one mesh only, multi-material groups) ---
    function makeIndexedMultiMaterialBox(name, offsetX = 0) {
        const geom = new THREE.BoxGeometry(10, 10, 10);
        const posCount = geom.getAttribute('position').count;
        geom.clearGroups();
        geom.addGroup(0, posCount / 2, 0);
        geom.addGroup(posCount / 2, posCount / 2, 1);
        const matA = new THREE.MeshStandardMaterial({ color: 0xaa4444 });
        const matB = new THREE.MeshStandardMaterial({ color: 0x44aa44 });
        const mesh = new THREE.Mesh(geom, [matA, matB]);
        mesh.name = name;
        mesh.position.x = offsetX;
        mesh.updateMatrixWorld(true);
        return mesh;
    }

    const mixedGroupA = new THREE.Group();
    mixedGroupA.name = 'MixedA';
    const mixedMeshWithUv = makeBoxMesh('withUv', 0);
    mixedMeshWithUv.geometry.setAttribute('uv', mixedMeshWithUv.geometry.getAttribute('uv').clone());
    const mixedMeshNoUv = makeBoxMesh('noUv', 12);
    mixedMeshNoUv.geometry.deleteAttribute('uv');
    const mixedMultiMat = makeIndexedMultiMaterialBox('multiMat', 24);
    mixedGroupA.add(mixedMeshWithUv, mixedMeshNoUv, mixedMultiMat);

    const mixedGroupB = new THREE.Group();
    mixedGroupB.name = 'MixedB';
    const mixedRefMesh = makeIndexedMultiMaterialBox('refMulti', 0.5);
    mixedGroupB.add(mixedRefMesh);

    const mixedResult = await computeDeviationMap(mixedGroupA, mixedGroupB, { batchSize: 500, tolerance: 0.1 });
    if (mixedResult.error) throw new Error(`mixed hierarchy: ${mixedResult.error}`);
    if (mixedResult.distancesByMesh.size !== 3) {
        throw new Error(`mixed hierarchy scan expected 3 meshes, got ${mixedResult.distancesByMesh.size}`);
    }

    const mixedBi = await computeBidirectionalDeviationMap(mixedGroupA, mixedGroupB, { batchSize: 500, tolerance: 0.1 });
    if (mixedBi.error) throw new Error(`mixed hierarchy bidirectional: ${mixedBi.error}`);

    testDeviationPoseUtils();
    testProbeDeviationFilter();
    await testComputeAbort();

    console.log('Deviation map smoke test OK');
    console.log(`  aligned offset: min=${result.stats.min.toFixed(4)} max=${result.stats.max.toFixed(4)}`);
    console.log(`  adjacent normal-aware -X face: ~${touchMin.toFixed(4)} mm`);
    console.log(`  adjacent legacy -X face max: ${legacyTouchMax.toFixed(4)} mm`);
    console.log(`  cuboid +Z overshoot: ~${cuboidTopMin.toFixed(4)} mm`);
    console.log(`  bidirectional combined vertices: ${biResult.stats.vertexCount}`);
}

main().catch(err => {
    console.error('TEST FAILED:', err);
    process.exit(1);
});
