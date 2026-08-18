/**
 * Smoke tests for STEP/STP export.
 * Run: node scripts/test-step-export.mjs
 */
import * as THREE from 'three';
import {
    collectStepParts,
    extractWorldTriangleMesh,
    exportObjectToStep,
    buildTessellatedStep,
    buildFacetedStep,
    isStepExportableMesh,
    STEP_FORMAT_FACETED,
    STEP_FORMAT_TESSELLATED,
} from '../src/stepExportUtils.js';

function assert(cond, message) {
    if (!cond) throw new Error(message);
}

function countMatches(text, re) {
    const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
    return (text.match(new RegExp(re.source, flags)) || []).length;
}

const box = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshPhongMaterial({ color: 0xff0000 }));
box.name = 'TestBox';
const boxPart = extractWorldTriangleMesh(box);
assert(boxPart.triangleCount === 12, `box should have 12 triangles, got ${boxPart.triangleCount}`);
assert(boxPart.positions.length / 3 === 8, `welded box should have 8 unique verts, got ${boxPart.positions.length / 3}`);
assert(boxPart.color && Math.abs(boxPart.color[0] - 1) < 1e-6, 'box colour should be red');

const tess = exportObjectToStep(box, {
    format: STEP_FORMAT_TESSELLATED,
    productName: 'TestBox',
    filename: 'TestBox.stp',
    modelUnit: 'mm',
    timestamp: '2026-08-18T10:00:00',
});
assert(tess.text.startsWith('ISO-10303-21;'), 'tessellated STEP must start with ISO-10303-21');
assert(tess.text.includes('END-ISO-10303-21;'), 'tessellated STEP must close');
assert(tess.text.includes('AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LF'), 'tessellated schema');
assert(tess.text.includes('TESSELLATED_SOLID'), 'missing TESSELLATED_SOLID');
assert(tess.text.includes('TRIANGULATED_FACE'), 'missing TRIANGULATED_FACE');
assert(tess.text.includes('COORDINATES_LIST'), 'missing COORDINATES_LIST');
assert(tess.text.includes("PRODUCT('TestBox'"), 'product name');
assert(tess.text.includes('SI_UNIT(.MILLI.,.METRE.)'), 'mm unit');
assert(tess.triangleCount === 12, `tessellated triangleCount ${tess.triangleCount}`);
assert(countMatches(tess.text, /\(\d+,\d+,\d+\)/) >= 12, 'expected at least 12 triangle index triples');

const moved = box.clone();
moved.position.set(10, 0, 0);
moved.updateMatrixWorld(true);
const movedPart = extractWorldTriangleMesh(moved);
let maxX = -Infinity;
for (let i = 0; i < movedPart.positions.length; i += 3) {
    maxX = Math.max(maxX, movedPart.positions[i]);
}
assert(maxX > 9, `translated box should have x≈11, maxX=${maxX}`);

const nested = new THREE.Group();
nested.position.set(0, 5, 0);
const child = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
child.position.set(0, 2, 0);
nested.add(child);
nested.updateMatrixWorld(true);
const nestedPart = extractWorldTriangleMesh(child);
let minY = Infinity;
let maxY = -Infinity;
for (let i = 1; i < nestedPart.positions.length; i += 3) {
    minY = Math.min(minY, nestedPart.positions[i]);
    maxY = Math.max(maxY, nestedPart.positions[i]);
}
assert(minY > 6.4 && maxY < 7.6, `nested world Y should be around 7, got ${minY}..${maxY}`);

const degenerate = new THREE.Mesh(new THREE.BufferGeometry());
degenerate.geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0,
    1, 0, 0,
    2, 0, 0,
    0, 0, 0,
    0, 1, 0,
    1, 0, 0,
], 3));
const degPart = extractWorldTriangleMesh(degenerate);
assert(degPart.triangleCount === 1, `degenerate collinear triangle should be dropped, got ${degPart.triangleCount}`);

const faceted = exportObjectToStep(box, {
    format: STEP_FORMAT_FACETED,
    productName: 'TestBox',
    filename: 'TestBox.stp',
    modelUnit: 'inch',
    timestamp: '2026-08-18T10:00:00',
});
assert(faceted.text.includes('AUTOMOTIVE_DESIGN'), 'faceted schema');
assert(faceted.text.includes('FACETED_BREP'), 'missing FACETED_BREP');
assert(faceted.text.includes('POLY_LOOP'), 'missing POLY_LOOP');
assert(faceted.text.includes('FACE_SURFACE'), 'missing FACE_SURFACE');
assert(countMatches(faceted.text, /POLY_LOOP/) === 12, `expected 12 POLY_LOOP, got ${countMatches(faceted.text, /POLY_LOOP/)}`);
assert(faceted.text.includes("CONVERSION_BASED_UNIT('INCH'"), 'inch unit');

const quoted = box.clone();
quoted.name = "O'Brien";
const quotedStep = exportObjectToStep(quoted, { format: STEP_FORMAT_TESSELLATED, productName: "O'Brien" });
assert(quotedStep.text.includes("O''Brien"), 'STEP string quotes must be escaped');

const overlay = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
overlay.userData._isEdgeOverlay = true;
assert(!isStepExportableMesh(overlay), 'edge overlay must not export');

const section = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
section.name = 'cut__section';
assert(!isStepExportableMesh(section), 'section mesh must not export');

const empty = new THREE.Group();
let threw = false;
try {
    exportObjectToStep(empty);
} catch {
    threw = true;
}
assert(threw, 'empty group should throw');

const group = new THREE.Group();
const a = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
a.name = 'A';
const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
b.name = 'B';
b.position.set(4, 0, 0);
group.add(a, b);
group.updateMatrixWorld(true);
const collected = collectStepParts(group);
assert(collected.parts.length === 2, `expected 2 parts, got ${collected.parts.length}`);
assert(collected.triangleCount === 24, `expected 24 triangles, got ${collected.triangleCount}`);
const multi = buildTessellatedStep(collected.parts, { productName: 'Asm' });
assert(multi.includes("TESSELLATED_SOLID('A'"), 'part A name');
assert(multi.includes("TESSELLATED_SOLID('B'"), 'part B name');

const metre = buildFacetedStep(collected.parts, { productName: 'Asm', modelUnit: 'm' });
assert(metre.includes('SI_UNIT($,.METRE.)'), 'metre unit');

console.log('test-step-export: ok');
