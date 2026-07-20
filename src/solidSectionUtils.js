// solidSectionUtils.js – Solid (capped) section using stencil buffer
//
// For each clip plane:
//   1. All meshes write stencil (back faces ++, front faces --)
//   2. Cap quad renders where stencil ≠ 0
//   3. onAfterRender clears stencil before the next plane

import * as THREE from 'three';
import { isSingleSectionMode } from './sectionPlaneUtils.js';

const capObjects = [];   // Every created helper (for cleanup)
let sharedCapGeo = null;

const _capNormal = new THREE.Vector3();
const _capPoint = new THREE.Vector3();
const _capQuat = new THREE.Quaternion();
const _planeUp = new THREE.Vector3(0, 0, 1);

// =====================================================================
//  Public API
// =====================================================================

/** Returns true only if the object and all its ancestors are visible. */
function isEffectivelyVisible(obj) {
    let o = obj;
    while (o) {
        if (!o.visible) return false;
        o = o.parent;
    }
    return true;
}

/**
 * Build solid-section caps for the current clip-plane positions.
 */
export function computeSolidSection(scene, meshObjects, viewProp, renderFn, clipPlanes) {
    clearSolidSection(scene);

    const sceneBBox = new THREE.Box3();
    meshObjects.forEach(obj => {
        if (isEffectivelyVisible(obj) && !obj.isSectionMesh) sceneBBox.expandByObject(obj);
    });
    if (sceneBBox.isEmpty()) return;

    const sceneSize   = sceneBBox.getSize(new THREE.Vector3());
    const sceneCenter = sceneBBox.getCenter(new THREE.Vector3());
    const planeSize   = Math.max(sceneSize.x, sceneSize.y, sceneSize.z) * 4;
    sharedCapGeo = new THREE.PlaneGeometry(planeSize, planeSize);

    const visibleMeshes = meshObjects.filter(
        m => m.isMesh && isEffectivelyVisible(m) && !m.isSectionMesh
    );

    if (isSingleSectionMode(viewProp)) {
        computeSinglePlaneSolidSection(scene, visibleMeshes, clipPlanes, sceneCenter, viewProp.capColor);
        console.log(`Solid section (single): ${capObjects.length} objects, ${visibleMeshes.length} meshes`);
    } else {
        computeCornerSolidSection(scene, visibleMeshes, viewProp, sceneCenter, viewProp.capColor);
        console.log(`Solid section (corner): ${capObjects.length} objects, ${visibleMeshes.length} meshes × 3 planes`);
    }

    renderFn();
}

function computeCornerSolidSection(scene, visibleMeshes, viewProp, sceneCenter, capColor) {
    const px = viewProp.px, py = viewProp.py, pz = viewProp.pz;

    const clipPlanes = [
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), px),
        new THREE.Plane(new THREE.Vector3(0, -1, 0), py),
        new THREE.Plane(new THREE.Vector3(0, 0, -1), pz),
    ];

    const constraintPlanes = [
        [new THREE.Plane(new THREE.Vector3(0, 1, 0), -py), new THREE.Plane(new THREE.Vector3(0, 0, 1), -pz)],
        [new THREE.Plane(new THREE.Vector3(1, 0, 0), -px), new THREE.Plane(new THREE.Vector3(0, 0, 1), -pz)],
        [new THREE.Plane(new THREE.Vector3(1, 0, 0), -px), new THREE.Plane(new THREE.Vector3(0, 1, 0), -py)],
    ];

    const capTransforms = [
        { pos: new THREE.Vector3(px, sceneCenter.y, sceneCenter.z), rot: new THREE.Euler(0, Math.PI / 2, 0) },
        { pos: new THREE.Vector3(sceneCenter.x, py, sceneCenter.z), rot: new THREE.Euler(-Math.PI / 2, 0, 0) },
        { pos: new THREE.Vector3(sceneCenter.x, sceneCenter.y, pz), rot: new THREE.Euler(0, 0, 0) },
    ];

    buildCaps(scene, visibleMeshes, clipPlanes, constraintPlanes, capTransforms, capColor);
}

function computeSinglePlaneSolidSection(scene, visibleMeshes, clipPlanes, sceneCenter, capColor) {
    if (!clipPlanes || clipPlanes.length === 0) return;

    const plane = clipPlanes[0];
    _capNormal.copy(plane.normal);
    _capPoint.copy(sceneCenter);
    plane.projectPoint(sceneCenter, _capPoint);

    _capQuat.setFromUnitVectors(_planeUp, _capNormal);

    const clipPlanesArr = [plane.clone()];
    const constraintPlanes = [[]];
    const capTransforms = [{
        pos: _capPoint.clone(),
        quat: _capQuat.clone(),
    }];

    buildCaps(scene, visibleMeshes, clipPlanesArr, constraintPlanes, capTransforms, capColor, true);
}

/**
 * Remove all solid-section helpers.
 */
export function clearSolidSection(scene, renderFn) {
    capObjects.forEach(obj => {
        if (obj.parent) obj.parent.remove(obj);
        if (obj.material) {
            (Array.isArray(obj.material) ? obj.material : [obj.material])
                .forEach(m => m.dispose());
        }
    });
    capObjects.length = 0;

    if (sharedCapGeo) {
        sharedCapGeo.dispose();
        sharedCapGeo = null;
    }

    if (renderFn) renderFn();
}

function buildCaps(scene, visibleMeshes, clipPlanes, constraintPlanes, capTransforms, capColor, useQuaternion = false) {
    let order = 1;
    for (let i = 0; i < clipPlanes.length; i++) {
        const plane      = clipPlanes[i];
        const constraint = constraintPlanes[i];
        const transform  = capTransforms[i];

        visibleMeshes.forEach(mesh => {
            mesh.updateWorldMatrix(true, false);
            addToScene(scene, makeStencilMesh(mesh, plane, THREE.BackSide,  THREE.IncrementWrapStencilOp, order));
            addToScene(scene, makeStencilMesh(mesh, plane, THREE.FrontSide, THREE.DecrementWrapStencilOp, order));
        });

        const capMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(capColor),
            roughness: 0.5,
            metalness: 0.1,
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: true,
            stencilWrite: true,
            stencilRef: 0,
            stencilFunc: THREE.NotEqualStencilFunc,
            stencilFail:  THREE.KeepStencilOp,
            stencilZFail: THREE.KeepStencilOp,
            stencilZPass: THREE.KeepStencilOp,
            clippingPlanes: constraint,
        });
        const cap = new THREE.Mesh(sharedCapGeo, capMat);
        cap.position.copy(transform.pos);
        if (useQuaternion && transform.quat) {
            cap.quaternion.copy(transform.quat);
        } else if (transform.rot) {
            cap.rotation.copy(transform.rot);
        }
        cap.renderOrder = order + 1;
        cap.frustumCulled = false;
        cap.onAfterRender = function (r) { r.clearStencil(); };
        addToScene(scene, cap);

        order += 2;
    }
}

// =====================================================================
//  Shared mesh factories
// =====================================================================

function makeStencilMesh(mesh, clipPlane, side, stencilOp, renderOrder) {
    const mat = new THREE.MeshBasicMaterial({
        side,
        depthWrite: false,
        depthTest: false,
        colorWrite: false,
        stencilWrite: true,
        stencilFunc: THREE.AlwaysStencilFunc,
        stencilFail:  stencilOp,
        stencilZFail: stencilOp,
        stencilZPass: stencilOp,
        clippingPlanes: [clipPlane],
    });
    const m = new THREE.Mesh(mesh.geometry, mat);
    m.matrixAutoUpdate = false;
    m.frustumCulled = false;
    m.matrix.copy(mesh.matrixWorld);
    m.renderOrder = renderOrder;
    m.onBeforeRender = function () {
        mesh.updateWorldMatrix(true, false);
        m.matrixWorld.copy(mesh.matrixWorld);
    };
    return m;
}

function addToScene(scene, obj) {
    scene.add(obj);
    capObjects.push(obj);
}
