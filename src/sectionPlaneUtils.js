// sectionPlaneUtils.js – shared logic for corner (3-plane) and single oblique section cuts
import * as THREE from 'three';

export const SECTION_DEFAULT_NORMAL = new THREE.Vector3(0, 0, -1);

const _normal = new THREE.Vector3();
const _euler = new THREE.Euler(0, 0, 0, 'XYZ');
const _quat = new THREE.Quaternion();
const _point = new THREE.Vector3();
const _delta = new THREE.Vector3();
const _along = new THREE.Vector3();

/** Cached plane instances for corner mode (stable references). */
export function createSectionPlaneStore() {
    return {
        corner: [
            new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
            new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
            new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
        ],
        single: new THREE.Plane(new THREE.Vector3().copy(SECTION_DEFAULT_NORMAL), 0),
    };
}

export function isSingleSectionMode(viewProp) {
    return viewProp.sectionMode === 'single';
}

export function isCornerSectionMode(viewProp) {
    return viewProp.sectionMode !== 'single';
}

export function getSectionNormalFromQuaternion(quaternion, target = new THREE.Vector3()) {
    return target.copy(SECTION_DEFAULT_NORMAL).applyQuaternion(quaternion).normalize();
}

export function getSectionNormalFromViewProp(viewProp, target = new THREE.Vector3()) {
    _euler.set(
        THREE.MathUtils.degToRad(viewProp.sectionRx || 0),
        THREE.MathUtils.degToRad(viewProp.sectionRy || 0),
        THREE.MathUtils.degToRad(viewProp.sectionRz || 0)
    );
    _quat.setFromEuler(_euler);
    return getSectionNormalFromQuaternion(_quat, target);
}

export function eulerDegToQuaternion(rx, ry, rz, target = new THREE.Quaternion()) {
    _euler.set(
        THREE.MathUtils.degToRad(rx || 0),
        THREE.MathUtils.degToRad(ry || 0),
        THREE.MathUtils.degToRad(rz || 0)
    );
    return target.setFromEuler(_euler);
}

export function quaternionToEulerDeg(quaternion, viewProp) {
    _euler.setFromQuaternion(quaternion, 'XYZ');
    viewProp.sectionRx = THREE.MathUtils.radToDeg(_euler.x);
    viewProp.sectionRy = THREE.MathUtils.radToDeg(_euler.y);
    viewProp.sectionRz = THREE.MathUtils.radToDeg(_euler.z);
}

/** Mutate shared clipPlanes array in place (materials keep the same reference). */
export function rebuildClipPlanes(clipPlanes, viewProp, planeStore) {
    clipPlanes.length = 0;
    if (isSingleSectionMode(viewProp)) {
        syncSinglePlaneFromViewProp(planeStore.single, viewProp);
        clipPlanes.push(planeStore.single);
    } else {
        planeStore.corner[0].normal.set(-1, 0, 0);
        planeStore.corner[0].constant = viewProp.px;
        planeStore.corner[1].normal.set(0, -1, 0);
        planeStore.corner[1].constant = viewProp.py;
        planeStore.corner[2].normal.set(0, 0, -1);
        planeStore.corner[2].constant = viewProp.pz;
        clipPlanes.push(planeStore.corner[0], planeStore.corner[1], planeStore.corner[2]);
    }
}

export function syncClipPlanesFromViewProp(clipPlanes, viewProp, planeStore) {
    rebuildClipPlanes(clipPlanes, viewProp, planeStore);
}

function syncSinglePlaneFromViewProp(plane, viewProp) {
    getSectionNormalFromViewProp(viewProp, _normal);
    _point.set(viewProp.sectionPx, viewProp.sectionPy, viewProp.sectionPz);
    plane.setFromNormalAndCoplanarPoint(_normal, _point);
}

export function syncGizmoFromViewProp(sectionGizmoHelper, viewProp) {
    if (isSingleSectionMode(viewProp)) {
        sectionGizmoHelper.position.set(viewProp.sectionPx, viewProp.sectionPy, viewProp.sectionPz);
        eulerDegToQuaternion(viewProp.sectionRx, viewProp.sectionRy, viewProp.sectionRz, sectionGizmoHelper.quaternion);
    } else {
        sectionGizmoHelper.position.set(viewProp.px, viewProp.py, viewProp.pz);
        sectionGizmoHelper.quaternion.identity();
    }
}

export function syncSectionFromGizmo(sectionGizmoHelper, viewProp, clipPlanes, planeStore) {
    if (isSingleSectionMode(viewProp)) {
        viewProp.sectionPx = sectionGizmoHelper.position.x;
        viewProp.sectionPy = sectionGizmoHelper.position.y;
        viewProp.sectionPz = sectionGizmoHelper.position.z;
        quaternionToEulerDeg(sectionGizmoHelper.quaternion, viewProp);
        getSectionNormalFromQuaternion(sectionGizmoHelper.quaternion, _normal);
        planeStore.single.setFromNormalAndCoplanarPoint(_normal, sectionGizmoHelper.position);
        rebuildClipPlanes(clipPlanes, viewProp, planeStore);
    } else {
        viewProp.px = sectionGizmoHelper.position.x;
        viewProp.py = sectionGizmoHelper.position.y;
        viewProp.pz = sectionGizmoHelper.position.z;
        planeStore.corner[0].constant = viewProp.px;
        planeStore.corner[1].constant = viewProp.py;
        planeStore.corner[2].constant = viewProp.pz;
        rebuildClipPlanes(clipPlanes, viewProp, planeStore);
    }
}

/** In single + translate mode: keep movement only along the plane normal. */
export function constrainGizmoTranslateAlongNormal(helper, prevPosition, normal) {
    if (!prevPosition) return;
    _delta.copy(helper.position).sub(prevPosition);
    const along = _delta.dot(normal);
    _along.copy(normal).multiplyScalar(along);
    helper.position.copy(prevPosition).add(_along);
}

export function getSceneBBoxCenter(meshObjects, isEffectivelyVisible, target = new THREE.Vector3()) {
    const box = new THREE.Box3();
    meshObjects.forEach(obj => {
        if (isEffectivelyVisible(obj) && !obj.isSectionMesh) box.expandByObject(obj);
    });
    if (box.isEmpty()) return target.set(0, 0, 0);
    return box.getCenter(target);
}

/** Initialize single-plane point/rotation when switching from corner or on reset. */
export function initSinglePlaneDefaults(viewProp, center) {
    viewProp.sectionPx = center.x;
    viewProp.sectionPy = center.y;
    viewProp.sectionPz = center.z;
    viewProp.sectionRx = 0;
    viewProp.sectionRy = 0;
    viewProp.sectionRz = 0;
}

export function shouldUseClipIntersection(viewProp) {
    return isCornerSectionMode(viewProp);
}
