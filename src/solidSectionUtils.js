// solidSectionUtils.js – Solid (capped) section using stencil buffer
//
// For each clip plane:
//   1. All meshes write stencil (back faces ++, front faces --)
//   2. Cap quad renders where stencil ≠ 0
//   3. onAfterRender clears stencil before the next plane

import * as THREE from 'three';

const capObjects = [];   // Every created helper (for cleanup)
let sharedCapGeo = null;

// =====================================================================
//  Public API
// =====================================================================

/**
 * Build solid-section caps for the current clip-plane positions.
 */
export function computeSolidSection(scene, meshObjects, viewProp, renderFn) {
    clearSolidSection(scene);

    const sceneBBox = new THREE.Box3();
    meshObjects.forEach(obj => {
        if (obj.visible && !obj.isSectionMesh) sceneBBox.expandByObject(obj);
    });
    if (sceneBBox.isEmpty()) return;

    const sceneSize   = sceneBBox.getSize(new THREE.Vector3());
    const sceneCenter = sceneBBox.getCenter(new THREE.Vector3());
    const planeSize   = Math.max(sceneSize.x, sceneSize.y, sceneSize.z) * 4;
    sharedCapGeo = new THREE.PlaneGeometry(planeSize, planeSize);

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

    const visibleMeshes = meshObjects.filter(
        m => m.isMesh && m.visible && !m.isSectionMesh
    );

    buildCaps(scene, visibleMeshes, clipPlanes, constraintPlanes, capTransforms, viewProp.capColor);

    console.log(`Solid section: ${capObjects.length} objects, ${visibleMeshes.length} meshes × 3 planes`);
    renderFn();
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

function buildCaps(scene, visibleMeshes, clipPlanes, constraintPlanes, capTransforms, capColor) {
    let order = 1;
    for (let i = 0; i < 3; i++) {
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
        cap.rotation.copy(transform.rot);
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
    m.matrix.copy(mesh.matrixWorld);
    m.renderOrder = renderOrder;
    return m;
}

function addToScene(scene, obj) {
    scene.add(obj);
    capObjects.push(obj);
}
