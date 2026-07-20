// sectionUtils.js – corner section view (3 clip planes rotated together)
import * as THREE from 'three';

const _euler = new THREE.Euler();
const _quaternion = new THREE.Quaternion();
const _normal = new THREE.Vector3();

export const SECTION_BASE_NORMALS = [
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, -1),
];

export function getDefaultSectionState() {
    return {
        px: 0,
        py: 0,
        pz: 0,
        sectionRx: 0,
        sectionRy: 0,
        sectionRz: 0,
    };
}

export function sectionQuaternionFromViewProp(viewProp, target = _quaternion) {
    _euler.set(
        THREE.MathUtils.degToRad(viewProp.sectionRx || 0),
        THREE.MathUtils.degToRad(viewProp.sectionRy || 0),
        THREE.MathUtils.degToRad(viewProp.sectionRz || 0),
        'XYZ'
    );
    return target.setFromEuler(_euler);
}

export function applySectionClipPlanes(clipPlanes, corner, quaternion) {
    for (let i = 0; i < 3; i++) {
        _normal.copy(SECTION_BASE_NORMALS[i]).applyQuaternion(quaternion).normalize();
        clipPlanes[i].setFromNormalAndCoplanarPoint(_normal, corner);
    }
}

export function readSectionFromGizmo(viewProp, helper) {
    viewProp.px = helper.position.x;
    viewProp.py = helper.position.y;
    viewProp.pz = helper.position.z;

    _euler.setFromQuaternion(helper.quaternion, 'XYZ');
    viewProp.sectionRx = THREE.MathUtils.radToDeg(_euler.x);
    viewProp.sectionRy = THREE.MathUtils.radToDeg(_euler.y);
    viewProp.sectionRz = THREE.MathUtils.radToDeg(_euler.z);
}

export function writeSectionToGizmo(helper, viewProp) {
    helper.position.set(viewProp.px, viewProp.py, viewProp.pz);
    sectionQuaternionFromViewProp(viewProp, helper.quaternion);
}

export function applySectionFromViewProp(clipPlanes, viewProp, corner = null, quaternion = null) {
    const c = corner || new THREE.Vector3(viewProp.px, viewProp.py, viewProp.pz);
    const q = quaternion || sectionQuaternionFromViewProp(viewProp);
    applySectionClipPlanes(clipPlanes, c, q);
}
