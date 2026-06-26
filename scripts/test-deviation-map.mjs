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

async function main() {
    const ref = makeBoxMesh('reference', 0);
    const scan = makeBoxMesh('scan', 0.5);

    const c = mapDistanceToColor(0);
    if (c.r <= 0 || c.b <= 0) throw new Error('mapDistanceToColor(0) should be bluish');

    const statsEmpty = computeDeviationStats(new Float32Array(0));
    if (statsEmpty.vertexCount !== 0) throw new Error('empty stats failed');

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
    if (scan.geometry.getAttribute('color')) throw new Error('color attribute should be removed');
    if (scan.material.vertexColors) throw new Error('vertexColors should be restored');

    console.log('Deviation map smoke test OK');
    console.log(`  vertices: ${result.stats.vertexCount}, min: ${result.stats.min.toFixed(4)}, max: ${result.stats.max.toFixed(4)}, mean: ${result.stats.mean.toFixed(4)}`);
}

main().catch(err => {
    console.error('TEST FAILED:', err);
    process.exit(1);
});
