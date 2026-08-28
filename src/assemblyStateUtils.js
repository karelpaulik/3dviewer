// assemblyStateUtils.js — named assembly "states": snapshots of object poses (position, rotation,
// scale, visibility) and optionally the camera view. Independent of assembly workflow steps —
// a state captures *where things are*, not *how you get there*. Global across all workflows.

import * as THREE from 'three';
import { readInitComponent } from './createObjectUtils.js';

export const INITIAL_POSE_STATE_ID = 0;
export const INITIAL_POSE_STATE_NAME = 'Initial';

const assemblyStates = [];
let activeAssemblyStateId = null;
// True once the scene has diverged from the selected/active state's stored poses (e.g. after a
// manual drag or workflow navigation). The selection itself (activeAssemblyStateId) is kept —
// only the "does it still match" bit changes — so Update/Rename/Delete/Save camera stay usable
// for saving the divergence back into the same state.
let poseStateDirty = false;
let nextStateId = 1;

export function getAssemblyStates() {
    return assemblyStates;
}

export function getActiveAssemblyStateId() {
    return activeAssemblyStateId;
}

export function setActiveAssemblyStateId(id) {
    activeAssemblyStateId = id;
}

export function isPoseStateDirty() {
    return poseStateDirty;
}

export function setPoseStateDirty(dirty) {
    poseStateDirty = !!dirty;
}

export function getNextStateId() {
    return nextStateId;
}

export function getActiveAssemblyState() {
    if (activeAssemblyStateId == null) return null;
    return assemblyStates.find(s => s.id === activeAssemblyStateId) || null;
}

export function isInitPoseState(state) {
    return !!state?.isInit || state?.id === INITIAL_POSE_STATE_ID;
}

export function createInitialPoseState() {
    return {
        id: INITIAL_POSE_STATE_ID,
        name: INITIAL_POSE_STATE_NAME,
        description: '',
        camera: null,
        poses: [],
        isInit: true,
    };
}

// The built-in "Initial" state is always present at index 0 and represents the as-loaded pose
// (from userData.initPosition/initRotation/initScale) rather than a stored pose list.
export function ensureInitialPoseState() {
    if (!assemblyStates[0] || !isInitPoseState(assemblyStates[0])) {
        assemblyStates.unshift(createInitialPoseState());
    }
    return assemblyStates[0];
}

export function resetPoseStatesCatalog() {
    assemblyStates.length = 0;
    assemblyStates.push(createInitialPoseState());
    activeAssemblyStateId = null;
    poseStateDirty = false;
    nextStateId = 1;
}

resetPoseStatesCatalog();

// Objects that must never be captured/restored as part of a pose state — overlays, gizmos and
// other auxiliary visuals that are not "real" assembly parts.
export function isPoseStateOverlayObject(obj) {
    if (!obj) return true;
    if (obj.isSectionMesh) return true;
    const ud = obj.userData || {};
    return !!(
        ud._isMeasurement
        || ud._isAnnotation
        || ud._isAnnotation3d
        || ud._isCadDim3d
        || ud._isDeviationProbe
        || ud._isEdgeOverlay
        || ud._isDeviationGhostOverlay
        || ud._isTransformSpaceGizmo
        || ud._isSectionSketch
    );
}

export function collectPoseStateObjects(loadedModels) {
    const out = [];
    if (!loadedModels) return out;
    function walk(obj) {
        if (!obj || isPoseStateOverlayObject(obj)) return;
        out.push(obj);
        const children = obj.children;
        for (let i = 0; i < children.length; i++) walk(children[i]);
    }
    loadedModels.forEach(root => walk(root));
    return out;
}

function _cloneVec3(v) {
    return v ? { x: v.x, y: v.y, z: v.z } : { x: 0, y: 0, z: 0 };
}

function _cloneQuat(q) {
    return q ? { x: q.x, y: q.y, z: q.z, w: q.w } : { x: 0, y: 0, z: 0, w: 1 };
}

// Captures an object's local TRS. During an active group transform, the object is temporarily
// re-parented to a shared pivot, so its local transform must be recomputed relative to its
// original parent (mirrors the logic used when committing group-transform undo).
export function captureObjectLocalTrs(obj, captureCtx = {}) {
    const {
        isGroupTransformActive,
        selectedObjects,
        multiOriginalParents,
    } = captureCtx;

    if (isGroupTransformActive && Array.isArray(selectedObjects)) {
        const i = selectedObjects.indexOf(obj);
        if (i >= 0) {
            obj.updateWorldMatrix(true, false);
            const world = obj.matrixWorld.clone();
            const originalParent = multiOriginalParents?.[i];
            const local = world.clone();
            if (originalParent) {
                originalParent.updateWorldMatrix(true, false);
                local.premultiply(new THREE.Matrix4().copy(originalParent.matrixWorld).invert());
            }
            const p = new THREE.Vector3();
            const q = new THREE.Quaternion();
            const s = new THREE.Vector3();
            local.decompose(p, q, s);
            return {
                position: { x: p.x, y: p.y, z: p.z },
                quaternion: { x: q.x, y: q.y, z: q.z, w: q.w },
                scale: { x: s.x, y: s.y, z: s.z },
            };
        }
    }

    return {
        position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
        quaternion: { x: obj.quaternion.x, y: obj.quaternion.y, z: obj.quaternion.z, w: obj.quaternion.w },
        scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
    };
}

function _initEuler(obj) {
    const r = obj.userData?.initRotation;
    if (!r) return null;
    return new THREE.Euler(
        readInitComponent(r, 'x'),
        readInitComponent(r, 'y'),
        readInitComponent(r, 'z'),
        r.order || 'XYZ',
    );
}

// Pose of an object as originally loaded, read from its userData.init* baseline.
export function poseFromInitUserData(obj) {
    const p = obj.userData?.initPosition;
    const r = obj.userData?.initRotation;
    const s = obj.userData?.initScale;
    if (!p || !r || !s) {
        const trs = captureObjectLocalTrs(obj);
        return { objectRef: obj, ...trs, visible: true };
    }
    const e = _initEuler(obj);
    const q = new THREE.Quaternion().setFromEuler(e);
    return {
        objectRef: obj,
        position: {
            x: readInitComponent(p, 'x'),
            y: readInitComponent(p, 'y'),
            z: readInitComponent(p, 'z'),
        },
        quaternion: { x: q.x, y: q.y, z: q.z, w: q.w },
        scale: {
            x: readInitComponent(s, 'x'),
            y: readInitComponent(s, 'y'),
            z: readInitComponent(s, 'z'),
        },
        visible: true,
    };
}

export function buildInitPoses(loadedModels) {
    return collectPoseStateObjects(loadedModels).map(poseFromInitUserData);
}

export function captureCurrentPoses(loadedModels, captureCtx = {}) {
    return collectPoseStateObjects(loadedModels).map(obj => ({
        objectRef: obj,
        ...captureObjectLocalTrs(obj, captureCtx),
        visible: obj.visible !== false,
    }));
}

// Poses to apply for a given state — the Initial state is computed on demand so it always
// reflects the current scene contents, even if objects were added/removed since load.
export function resolveStatePoses(state, loadedModels) {
    if (!state) return [];
    if (isInitPoseState(state)) return buildInitPoses(loadedModels);
    return (state.poses || []).filter(p => p.objectRef);
}

function _cloneCamera(camera) {
    if (!camera) return null;
    return {
        position: { ...camera.position },
        target: { ...camera.target },
        zoom: camera.zoom,
    };
}

function _clonePose(p) {
    return {
        objectRef: p.objectRef,
        position: _cloneVec3(p.position),
        quaternion: _cloneQuat(p.quaternion),
        scale: _cloneVec3(p.scale),
        visible: !!p.visible,
    };
}

export function clonePoseState(state) {
    return {
        id: state.id,
        name: state.name,
        description: state.description || '',
        isInit: !!state.isInit,
        camera: _cloneCamera(state.camera),
        poses: isInitPoseState(state) ? [] : (state.poses || []).map(_clonePose),
    };
}

// Whole-catalog snapshot/restore — used as the before/after payload of catalog-mutating undo
// commands (capture / update / rename / delete / duplicate / clear camera).
export function snapshotPoseStatesCatalog() {
    return {
        activeId: activeAssemblyStateId,
        dirty: poseStateDirty,
        nextId: nextStateId,
        states: assemblyStates.map(clonePoseState),
    };
}

export function restorePoseStatesCatalog(snap) {
    if (!snap) return;
    assemblyStates.length = 0;
    (snap.states || []).forEach(s => assemblyStates.push(clonePoseState(s)));
    ensureInitialPoseState();
    activeAssemblyStateId = snap.activeId ?? null;
    poseStateDirty = !!snap.dirty;
    const maxId = assemblyStates.reduce((m, s) => Math.max(m, s.id || 0), 0);
    nextStateId = Math.max(snap.nextId ?? 1, maxId + 1);
}

function _nextDefaultName() {
    const n = assemblyStates.filter(s => !isInitPoseState(s)).length + 1;
    return `State ${n}`;
}

export function capturePoseState(loadedModels, captureCtx, extras = {}) {
    ensureInitialPoseState();
    const state = {
        id: nextStateId++,
        name: extras.name || _nextDefaultName(),
        description: extras.description || '',
        camera: extras.camera ? _cloneCamera(extras.camera) : null,
        poses: captureCurrentPoses(loadedModels, captureCtx),
        isInit: false,
    };
    assemblyStates.push(state);
    activeAssemblyStateId = state.id;
    poseStateDirty = false;
    return state;
}

export function updatePoseState(state, loadedModels, captureCtx, extras = {}) {
    if (!state || isInitPoseState(state)) return false;
    state.poses = captureCurrentPoses(loadedModels, captureCtx);
    if (Object.prototype.hasOwnProperty.call(extras, 'camera')) {
        state.camera = extras.camera ? _cloneCamera(extras.camera) : null;
    }
    if (extras.name != null) state.name = extras.name;
    if (extras.description != null) state.description = extras.description;
    activeAssemblyStateId = state.id;
    poseStateDirty = false;
    return true;
}

export function duplicatePoseState(state, loadedModels) {
    if (!state) return null;
    ensureInitialPoseState();
    const copy = clonePoseState(state);
    copy.id = nextStateId++;
    copy.isInit = false;
    copy.name = `${state.name || 'State'} (copy)`;
    if (isInitPoseState(state)) {
        copy.poses = buildInitPoses(loadedModels);
        copy.camera = null;
    }
    const srcIndex = assemblyStates.indexOf(state);
    const insertAt = srcIndex >= 0 ? srcIndex + 1 : assemblyStates.length;
    assemblyStates.splice(insertAt, 0, copy);
    activeAssemblyStateId = copy.id;
    poseStateDirty = false;
    return copy;
}

export function deletePoseState(state) {
    if (!state || isInitPoseState(state)) return false;
    const i = assemblyStates.indexOf(state);
    if (i < 0) return false;
    assemblyStates.splice(i, 1);
    if (activeAssemblyStateId === state.id) {
        activeAssemblyStateId = null;
        poseStateDirty = false;
    }
    return true;
}

export function deleteAllUserPoseStates() {
    const kept = assemblyStates.filter(isInitPoseState);
    assemblyStates.length = 0;
    if (kept.length) assemblyStates.push(kept[0]);
    else assemblyStates.push(createInitialPoseState());
    ensureInitialPoseState();
    activeAssemblyStateId = activeAssemblyStateId === INITIAL_POSE_STATE_ID
        ? INITIAL_POSE_STATE_ID
        : null;
    poseStateDirty = false;
}

export function setPoseStateCamera(state, camera) {
    if (!state || isInitPoseState(state)) return false;
    state.camera = camera ? _cloneCamera(camera) : null;
    return true;
}

// Called when an object is permanently removed from the scene — drop it from every state so
// stale references never linger.
export function purgePoseStateObjects(removedSet) {
    if (!removedSet || removedSet.size === 0) return;
    assemblyStates.forEach(state => {
        if (isInitPoseState(state)) return;
        state.poses = state.poses.filter(p => p.objectRef && !removedSet.has(p.objectRef));
    });
}

function _trsRecordsToMatrix(pos, quat, scale) {
    const p = new THREE.Vector3(pos.x, pos.y, pos.z);
    const q = quat
        ? new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w)
        : new THREE.Quaternion();
    const s = scale
        ? new THREE.Vector3(scale.x, scale.y, scale.z)
        : new THREE.Vector3(1, 1, 1);
    return new THREE.Matrix4().compose(p, q, s);
}

function _matrixToTrsRecords(matrix) {
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    matrix.decompose(p, q, s);
    return {
        position: { x: p.x, y: p.y, z: p.z },
        quaternion: { x: q.x, y: q.y, z: q.z, w: q.w },
        scale: { x: s.x, y: s.y, z: s.z },
    };
}

// Baking absorbs an object's local transform into its geometry, so every stored pose for that
// object must be remapped through the inverse bake matrix to keep the state visually consistent.
export function remapPoseStatesAfterObjectBake(obj, invBake) {
    if (!obj || !invBake) return;
    assemblyStates.forEach(state => {
        if (isInitPoseState(state)) return;
        state.poses.forEach(pose => {
            if (pose.objectRef !== obj) return;
            const m = _trsRecordsToMatrix(pose.position, pose.quaternion, pose.scale);
            m.multiply(invBake);
            const rec = _matrixToTrsRecords(m);
            pose.position = rec.position;
            pose.quaternion = rec.quaternion;
            pose.scale = rec.scale;
        });
    });
}

// ── GLB persistence ─────────────────────────────────────────────────────────────

// Write each user-defined state's pose for every referenced object into that object's userData,
// so a per-object GLTFExporter round trip carries the poses along (mirrors assemblyTransformations).
export function writePoseStatesToUserData() {
    const userStates = assemblyStates.filter(s => !isInitPoseState(s));
    const allObjects = new Set();
    userStates.forEach(s => s.poses.forEach(p => {
        if (p.objectRef) allObjects.add(p.objectRef);
    }));
    allObjects.forEach(obj => { obj.userData.assemblyStatePoses = []; });

    userStates.forEach(s => {
        s.poses.forEach(p => {
            if (!p.objectRef) return;
            if (!Array.isArray(p.objectRef.userData.assemblyStatePoses)) {
                p.objectRef.userData.assemblyStatePoses = [];
            }
            p.objectRef.userData.assemblyStatePoses.push({
                state_id: s.id,
                state_name: s.name,
                position: { ...p.position },
                quaternion: { ...p.quaternion },
                scale: { ...p.scale },
                visible: !!p.visible,
            });
        });
    });
}

// State-level metadata (name, order, description, camera) travels in the export root's userData,
// next to the workflow index — it cannot be reconstructed from the per-object records alone.
export function embedAssemblyStateIndex(userData) {
    const index = assemblyStates
        .filter(s => !isInitPoseState(s))
        .map((s, i) => ({
            id: s.id,
            name: s.name,
            description: s.description || '',
            camera: _cloneCamera(s.camera),
            order: i,
        }));
    if (index.length > 0) userData.assemblyStateIndex = index;
}

// Remove assemblyStatePoses from userData of all objects referenced by any state. Call on
// originals immediately after cloning for export — clones already carry the data.
export function clearPoseStatesUserData() {
    assemblyStates.forEach(s => {
        if (isInitPoseState(s)) return;
        s.poses.forEach(p => {
            if (p.objectRef) delete p.objectRef.userData.assemblyStatePoses;
        });
    });
}

// Read userData.assemblyStatePoses / assemblyStateIndex from an imported GLTF scene and add
// every state it contains to the (already-loaded) catalog.
export function importAssemblyStatesFromGltfScene(gltfScene) {
    if (!gltfScene) return 0;
    const imported = new Map();
    let indexMeta = null;

    gltfScene.traverse(function (child) {
        if (Array.isArray(child.userData.assemblyStateIndex)) {
            if (!indexMeta) indexMeta = child.userData.assemblyStateIndex;
            delete child.userData.assemblyStateIndex;
        }

        const arr = child.userData.assemblyStatePoses;
        if (!Array.isArray(arr) || arr.length === 0) return;

        arr.forEach(entry => {
            const sid = entry.state_id;
            if (sid == null || Number(sid) === INITIAL_POSE_STATE_ID) return;
            if (!imported.has(sid)) {
                imported.set(sid, {
                    id: sid,
                    name: entry.state_name || '',
                    description: '',
                    camera: null,
                    poses: [],
                });
            }
            const st = imported.get(sid);
            if (!st.name && entry.state_name) st.name = entry.state_name;
            st.poses.push({
                objectRef: child,
                position: entry.position,
                quaternion: entry.quaternion,
                scale: entry.scale,
                visible: entry.visible !== false,
            });
        });
        delete child.userData.assemblyStatePoses;
    });

    if (imported.size === 0) return 0;

    const meta = new Map((indexMeta || []).map(e => [e.id, e]));
    const incoming = [...imported.values()].sort((a, b) => {
        const oa = meta.get(a.id)?.order ?? a.id;
        const ob = meta.get(b.id)?.order ?? b.id;
        return oa - ob;
    });

    ensureInitialPoseState();
    incoming.forEach(imp => {
        const m = meta.get(imp.id);
        const state = {
            id: nextStateId++,
            name: m?.name || imp.name || `State ${nextStateId - 1}`,
            description: m?.description || imp.description || '',
            camera: m?.camera ? _cloneCamera(m.camera) : null,
            poses: imp.poses,
            isInit: false,
        };
        assemblyStates.push(state);
    });

    console.log(`[Assembly] Imported ${incoming.length} state(s) from GLB.`);
    return incoming.length;
}
