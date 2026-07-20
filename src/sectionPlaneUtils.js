// sectionPlaneUtils.js – shared logic for corner (3-plane) and single-plane section cuts
import * as THREE from 'three';

/** @typedef {'corner' | 'singleXY' | 'singleXZ' | 'singleYZ'} SectionMode */

export const SECTION_MODES = ['corner', 'singleXY', 'singleXZ', 'singleYZ'];

const _baseNormal = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _point = new THREE.Vector3();
const _euler = new THREE.Euler(0, 0, 0, 'XYZ');
const _quat = new THREE.Quaternion();
const _center = new THREE.Vector3();

/** Per-mode: base clip normal at zero rotation. Plane point is viewProp.px/py/pz. */
const MODE_CONFIG = {
    singleXY: { baseNormal: new THREE.Vector3(0, 0, -1), tiltAxis: 'x' },
    singleXZ: { baseNormal: new THREE.Vector3(0, -1, 0), tiltAxis: 'z' },
    singleYZ: { baseNormal: new THREE.Vector3(-1, 0, 0), tiltAxis: 'y' },
};

function sectionEulerFromViewProp(viewProp, target = _euler) {
    return target.set(
        THREE.MathUtils.degToRad(viewProp.sectionRx || 0),
        THREE.MathUtils.degToRad(viewProp.sectionRy || 0),
        THREE.MathUtils.degToRad(viewProp.sectionRz || 0),
        'XYZ'
    );
}

function setSectionEulerFromRadians(viewProp, euler) {
    viewProp.sectionRx = THREE.MathUtils.radToDeg(euler.x);
    viewProp.sectionRy = THREE.MathUtils.radToDeg(euler.y);
    viewProp.sectionRz = THREE.MathUtils.radToDeg(euler.z);
}

function resetSectionRotation(viewProp) {
    viewProp.sectionRx = 0;
    viewProp.sectionRy = 0;
    viewProp.sectionRz = 0;
}

/** Cached plane instances for corner mode (stable references). */
export function createSectionPlaneStore() {
    return {
        corner: [
            new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0),
            new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
            new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
        ],
        single: new THREE.Plane(new THREE.Vector3(0, 0, -1), 0),
    };
}

/** Migrate legacy `single` to `singleXY`. */
export function normalizeSectionMode(mode) {
    if (mode === 'single') return 'singleXY';
    return SECTION_MODES.includes(mode) ? mode : 'corner';
}

export function isSingleSectionMode(viewProp) {
    return normalizeSectionMode(viewProp.sectionMode) !== 'corner';
}

export function isCornerSectionMode(viewProp) {
    return normalizeSectionMode(viewProp.sectionMode) === 'corner';
}

export function getBaseNormalForMode(mode, target = new THREE.Vector3()) {
    const cfg = MODE_CONFIG[normalizeSectionMode(mode)];
    if (!cfg) return target.set(0, 0, -1);
    return target.copy(cfg.baseNormal);
}

export function getSectionNormalFromViewProp(viewProp, target = new THREE.Vector3()) {
    const mode = normalizeSectionMode(viewProp.sectionMode);
    const cfg = MODE_CONFIG[mode];
    if (!cfg) return target.set(0, 0, -1);
    sectionEulerFromViewProp(viewProp, _euler);
    _quat.setFromEuler(_euler);
    return target.copy(cfg.baseNormal).applyQuaternion(_quat).normalize();
}

export function getSectionPointFromViewProp(viewProp, sceneCenter, target = new THREE.Vector3()) {
    if (isSingleSectionMode(viewProp)) {
        return target.set(viewProp.px ?? 0, viewProp.py ?? 0, viewProp.pz ?? 0);
    }
    const c = sceneCenter || _center.set(0, 0, 0);
    return target.copy(c);
}

export function syncGizmoFromViewProp(sectionGizmoHelper, viewProp, sceneCenter) {
    if (isSingleSectionMode(viewProp)) {
        getSectionPointFromViewProp(viewProp, sceneCenter, sectionGizmoHelper.position);
        sectionEulerFromViewProp(viewProp, _euler);
        sectionGizmoHelper.quaternion.setFromEuler(_euler);
    } else {
        sectionGizmoHelper.position.set(viewProp.px, viewProp.py, viewProp.pz);
        sectionGizmoHelper.quaternion.identity();
    }
}

export function syncSectionFromGizmo(sectionGizmoHelper, viewProp, clipPlanes, planeStore, sceneCenter) {
    if (isSingleSectionMode(viewProp)) {
        const c = sceneCenter || _center.set(0, 0, 0);
        viewProp.px = sectionGizmoHelper.position.x;
        viewProp.py = sectionGizmoHelper.position.y;
        viewProp.pz = sectionGizmoHelper.position.z;
        _euler.setFromQuaternion(sectionGizmoHelper.quaternion, 'XYZ');
        setSectionEulerFromRadians(viewProp, _euler);
        getSectionNormalFromViewProp(viewProp, _normal);
        getSectionPointFromViewProp(viewProp, c, _point);
        planeStore.single.setFromNormalAndCoplanarPoint(_normal, _point);
        rebuildClipPlanes(clipPlanes, viewProp, planeStore, sceneCenter);
    } else {
        viewProp.px = sectionGizmoHelper.position.x;
        viewProp.py = sectionGizmoHelper.position.y;
        viewProp.pz = sectionGizmoHelper.position.z;
        planeStore.corner[0].constant = viewProp.px;
        planeStore.corner[1].constant = viewProp.py;
        planeStore.corner[2].constant = viewProp.pz;
        rebuildClipPlanes(clipPlanes, viewProp, planeStore, sceneCenter);
    }
}

function syncSinglePlaneFromViewProp(plane, viewProp, sceneCenter) {
    getSectionNormalFromViewProp(viewProp, _normal);
    getSectionPointFromViewProp(viewProp, sceneCenter, _point);
    plane.setFromNormalAndCoplanarPoint(_normal, _point);
}

/** Mutate shared clipPlanes array in place (materials keep the same reference). */
export function rebuildClipPlanes(clipPlanes, viewProp, planeStore, sceneCenter) {
    clipPlanes.length = 0;
    if (isSingleSectionMode(viewProp)) {
        syncSinglePlaneFromViewProp(planeStore.single, viewProp, sceneCenter);
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

export function syncClipPlanesFromViewProp(clipPlanes, viewProp, planeStore, sceneCenter) {
    rebuildClipPlanes(clipPlanes, viewProp, planeStore, sceneCenter);
}

export function getSceneBBoxCenter(meshObjects, isEffectivelyVisible, target = new THREE.Vector3()) {
    const box = new THREE.Box3();
    meshObjects.forEach(obj => {
        if (isEffectivelyVisible(obj) && !obj.isSectionMesh) box.expandByObject(obj);
    });
    if (box.isEmpty()) return target.set(0, 0, 0);
    return box.getCenter(target);
}

/** Initialize single-plane point at bbox center and reset tilt. */
export function initSinglePlaneDefaults(viewProp, center, mode) {
    viewProp.sectionMode = normalizeSectionMode(mode || viewProp.sectionMode);
    if (!MODE_CONFIG[viewProp.sectionMode]) return;
    viewProp.px = center.x;
    viewProp.py = center.y;
    viewProp.pz = center.z;
    resetSectionRotation(viewProp);
}

/** Migrate legacy scalar sectionAngle to sectionRx/Ry/Rz. */
export function migrateLegacySectionAngle(viewProp) {
    if (viewProp.sectionAngle === undefined) return;
    const mode = normalizeSectionMode(viewProp.sectionMode);
    if (mode === 'corner') return;
    resetSectionRotation(viewProp);
    const angle = viewProp.sectionAngle;
    const cfg = MODE_CONFIG[mode];
    if (!cfg) return;
    switch (cfg.tiltAxis) {
        case 'x': viewProp.sectionRx = angle; break;
        case 'y': viewProp.sectionRy = angle; break;
        default: viewProp.sectionRz = angle; break;
    }
}

/** Migrate legacy scalar sectionPos (one axis + bbox center) to px/py/pz. */
export function migrateLegacySectionPoint(viewProp, sceneCenter) {
    if (viewProp.sectionPos === undefined) return;
    const mode = normalizeSectionMode(viewProp.sectionMode);
    if (mode === 'corner') return;
    const c = sceneCenter || _center.set(0, 0, 0);
    const pos = viewProp.sectionPos;
    switch (mode) {
        case 'singleXY': viewProp.px = c.x; viewProp.py = c.y; viewProp.pz = pos; break;
        case 'singleXZ': viewProp.px = c.x; viewProp.py = pos; viewProp.pz = c.z; break;
        case 'singleYZ': viewProp.px = pos; viewProp.py = c.y; viewProp.pz = c.z; break;
    }
}

export function shouldUseClipIntersection(viewProp) {
    return isCornerSectionMode(viewProp);
}
