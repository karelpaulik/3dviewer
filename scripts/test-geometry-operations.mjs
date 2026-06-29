/**
 * Smoke test for geometry normal operations.
 * Run: node scripts/test-geometry-operations.mjs
 */
import * as THREE from 'three';
import {
    applyFlatVertexNormals,
    applySmoothVertexNormals,
    collectMeshesForGeometryOps,
    applyFlatVertexNormalsToMeshes,
    applySmoothVertexNormalsToMeshes,
} from '../src/geometryOperationsUtils.js';

function assertFlatNormals(geometry, label) {
    const n = geometry.getAttribute('normal');
    const p = geometry.getAttribute('position');
    if (!n || !p) throw new Error(`${label}: missing attributes`);

    // Box corner in local space – with flat split verts, each -X face vertex has nx ≈ -1
    let minusXCount = 0;
    for (let i = 0; i < p.count; i++) {
        if (Math.abs(n.getX(i) + 1) < 0.01 && Math.abs(n.getY(i)) < 0.01 && Math.abs(n.getZ(i)) < 0.01) {
            minusXCount++;
        }
    }
    if (minusXCount < 4) {
        throw new Error(`${label}: expected at least 4 flat -X normals, got ${minusXCount}`);
    }
}

function assertSmoothNormals(geometry, label) {
    const norm = geometry.getAttribute('normal');
    if (!norm) throw new Error(`${label}: missing normal attribute`);
    for (let i = 0; i < norm.count; i++) {
        const x = norm.getX(i);
        const y = norm.getY(i);
        const z = norm.getZ(i);
        const len = Math.sqrt(x * x + y * y + z * z);
        if (Math.abs(len - 1) > 0.01) {
            throw new Error(`${label}: normal not unit length at ${i}`);
        }
    }
}

// mergeVertices + computeVertexNormals on duplicated corner positions
function makeIndexedCubeWithSharedPositions() {
    const g = new THREE.BoxGeometry(10, 10, 10);
    return g;
}

const geom = new THREE.BoxGeometry(10, 10, 10);
const flat = applyFlatVertexNormals(geom);
assertFlatNormals(flat, 'flat');
geom.dispose();
flat.dispose();

const geom2 = makeIndexedCubeWithSharedPositions();
const smooth = applySmoothVertexNormals(geom2);
assertSmoothNormals(smooth, 'smooth');
geom2.dispose();
smooth.dispose();

const group = new THREE.Group();
group.add(new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5)));
group.add(new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3)));
const meshes = collectMeshesForGeometryOps(group);
if (meshes.length !== 2) throw new Error(`expected 2 meshes in group, got ${meshes.length}`);

const single = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2));
if (collectMeshesForGeometryOps(single).length !== 1) throw new Error('single mesh selection failed');

const r1 = applyFlatVertexNormalsToMeshes(meshes);
if (r1.error || r1.count !== 2) throw new Error('flat to meshes failed');
meshes.forEach(m => m.geometry.dispose());

const r2 = applySmoothVertexNormalsToMeshes([]);
if (!r2.error) throw new Error('empty selection should error');

// flat then smooth on sphere should restore shared topology (~original vertex count)
const sphere = new THREE.SphereGeometry(5, 32, 32);
const originalVertCount = sphere.attributes.position.count;
const faceted = applyFlatVertexNormals(sphere);
if (faceted.attributes.position.count <= originalVertCount * 2) {
    throw new Error('flat sphere should explode vertex count');
}
const resmoothed = applySmoothVertexNormals(faceted);
if (Math.abs(resmoothed.attributes.position.count - originalVertCount) > 5) {
    throw new Error(
        `flat->smooth sphere expected ~${originalVertCount} verts, got ${resmoothed.attributes.position.count}`,
    );
}
sphere.dispose();
faceted.dispose();
resmoothed.dispose();

console.log('Geometry operations smoke test OK');
