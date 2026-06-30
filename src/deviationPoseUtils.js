// deviationPoseUtils.js – snapshot/restore transforms for deviation map comparison
import * as THREE from 'three';

/**
 * @param {THREE.Object3D} obj
 * @returns {{ position: THREE.Vector3, quaternion: THREE.Quaternion, scale: THREE.Vector3 }}
 */
export function captureObjectTransform(obj) {
    return {
        position: obj.position.clone(),
        quaternion: obj.quaternion.clone(),
        scale: obj.scale.clone(),
    };
}

/**
 * @param {THREE.Object3D} obj
 * @param {{ position: THREE.Vector3, quaternion: THREE.Quaternion, scale: THREE.Vector3 }} snapshot
 */
export function applyObjectTransform(obj, snapshot) {
    if (!obj || !snapshot) return;
    obj.position.copy(snapshot.position);
    obj.quaternion.copy(snapshot.quaternion);
    obj.scale.copy(snapshot.scale);
    obj.updateWorldMatrix(true, true);
}

/**
 * @param {THREE.Object3D} scan
 * @param {THREE.Object3D} ref
 * @returns {{ scan: THREE.Object3D, ref: THREE.Object3D, poses: { scan: { comparison: object, display: object }, ref: { comparison: object, display: object } } }}
 */
export function createDeviationPoseState(scan, ref) {
    const scanSnapshot = captureObjectTransform(scan);
    const refSnapshot = captureObjectTransform(ref);
    return {
        scan,
        ref,
        poses: {
            scan: {
                comparison: scanSnapshot,
                display: captureObjectTransform(scan),
            },
            ref: {
                comparison: refSnapshot,
                display: captureObjectTransform(ref),
            },
        },
    };
}

/**
 * @param {{ scan: THREE.Object3D, ref: THREE.Object3D, poses: object }} state
 * @param {THREE.Object3D} obj
 * @returns {boolean}
 */
export function updateDisplayPose(state, obj) {
    if (!state || !obj) return false;
    if (obj === state.scan) {
        state.poses.scan.display = captureObjectTransform(obj);
        return true;
    }
    if (obj === state.ref) {
        state.poses.ref.display = captureObjectTransform(obj);
        return true;
    }
    return false;
}

/**
 * @param {{ scan: THREE.Object3D, ref: THREE.Object3D, poses: object }} state
 */
export function applyComparisonPoses(state) {
    if (!state) return;
    applyObjectTransform(state.scan, state.poses.scan.comparison);
    applyObjectTransform(state.ref, state.poses.ref.comparison);
}

/**
 * @param {{ scan: THREE.Object3D, ref: THREE.Object3D, poses: object }} state
 */
export function applyDisplayPoses(state) {
    if (!state) return;
    applyObjectTransform(state.scan, state.poses.scan.display);
    applyObjectTransform(state.ref, state.poses.ref.display);
}
