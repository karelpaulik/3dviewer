/**
 * Tests for init transform helpers (clone + reset init location).
 * Run: node scripts/test-init-transform.mjs
 */
import * as THREE from 'three';
import {
    readInitComponent,
    applyInitTransformFromUserData,
    refreshInitTransformUserData,
} from '../src/createObjectUtils.js';

function assert(cond, msg) {
    if (!cond) throw new Error(msg);
}

// JSON-cloned Euler shape from Object3D.clone() userData copy
const jsonEuler = { _x: 0.5, _y: -1.2, _z: 0.25, order: 'XYZ' };
assert(readInitComponent(jsonEuler, 'x') === 0.5, 'read _x');
assert(readInitComponent(jsonEuler, 'y') === -1.2, 'read _y');
assert(readInitComponent(jsonEuler, 'z') === 0.25, 'read _z');
assert(readInitComponent({ x: 1, y: 2, z: 3 }, 'x') === 1, 'read plain x');

const obj = new THREE.Object3D();
obj.position.set(10, 20, 30);
obj.rotation.set(0.1, 0.2, 0.3);
obj.scale.set(2, 2, 2);
refreshInitTransformUserData(obj);

obj.position.set(99, 99, 99);
obj.rotation.set(0, 0, 0);
obj.scale.set(1, 1, 1);
assert(applyInitTransformFromUserData(obj), 'apply should succeed');
assert(obj.position.x === 10 && obj.position.y === 20 && obj.position.z === 30, 'position reset');
assert(Math.abs(obj.rotation.x - 0.1) < 1e-6, 'rotation x reset');
assert(obj.scale.x === 2, 'scale reset');

// Simulate legacy broken clone userData
const broken = new THREE.Object3D();
broken.userData.initPosition = { x: 1, y: 2, z: 3 };
broken.userData.initRotation = { _x: 0.4, _y: 0.5, _z: 0.6, order: 'XYZ' };
broken.userData.initScale = { x: 1, y: 1, z: 1 };
broken.rotation.set(0, 0, 0);
assert(applyInitTransformFromUserData(broken), 'apply broken clone data');
assert(Math.abs(broken.rotation.x - 0.4) < 1e-6, 'rotation from _x/_y/_z');
assert(Number.isFinite(broken.rotation.x), 'rotation must be finite');

console.log('test-init-transform.mjs: all passed');
