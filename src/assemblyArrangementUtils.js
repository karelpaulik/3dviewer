// assemblyArrangementUtils.js — named assembly arrangements: snapshots of object poses
// (position, rotation, scale, visibility) and optionally the camera view. Independent of
// assembly workflow steps — an arrangement captures *where things are*, not *how you get
// there*. Global across all workflows.

import * as THREE from 'three';
import { readInitComponent } from './createObjectUtils.js';

export const INITIAL_ARRANGEMENT_ID = 0;
export const INITIAL_ARRANGEMENT_NAME = 'Initial';

const assemblyArrangements = [];
let activeArrangementId = null;
// True once the scene has diverged from the selected/active arrangement's stored poses (e.g.
// after a manual drag or workflow navigation). The selection itself (activeArrangementId) is
// kept — only the "does it still match" bit changes — so Update/Rename/Delete/Save camera stay
// usable for saving the divergence back into the same arrangement.
let arrangementDirty = false;
let nextArrangementId = 1;

export function getAssemblyArrangements() {
    return assemblyArrangements;
}

export function getActiveArrangementId() {
    return activeArrangementId;
}

export function setActiveArrangementId(id) {
    activeArrangementId = id;
}

export function isArrangementDirty() {
    return arrangementDirty;
}

export function setArrangementDirty(dirty) {
    arrangementDirty = !!dirty;
}

export function getNextArrangementId() {
    return nextArrangementId;
}

export function getActiveArrangement() {
    if (activeArrangementId == null) return null;
    return assemblyArrangements.find(s => s.id === activeArrangementId) || null;
}

export function isInitArrangement(arrangement) {
    return !!arrangement?.isInit || arrangement?.id === INITIAL_ARRANGEMENT_ID;
}

export function createInitialArrangement() {
    return {
        id: INITIAL_ARRANGEMENT_ID,
        name: INITIAL_ARRANGEMENT_NAME,
        description: '',
        camera: null,
        poses: [],
        isInit: true,
    };
}

// The built-in "Initial" arrangement is always present at index 0 and represents the as-loaded
// pose (from userData.initPosition/initRotation/initScale) rather than a stored pose list.
export function ensureInitialArrangement() {
    if (!assemblyArrangements[0] || !isInitArrangement(assemblyArrangements[0])) {
        assemblyArrangements.unshift(createInitialArrangement());
    }
    return assemblyArrangements[0];
}

export function resetArrangementsCatalog() {
    assemblyArrangements.length = 0;
    assemblyArrangements.push(createInitialArrangement());
    activeArrangementId = null;
    arrangementDirty = false;
    nextArrangementId = 1;
}

resetArrangementsCatalog();

// Objects that must never be captured/restored as part of an arrangement — overlays, gizmos and
// other auxiliary visuals that are not "real" assembly parts.
export function isArrangementOverlayObject(obj) {
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
        || ud._isCoG
    );
}

export function collectArrangementObjects(loadedModels) {
    const out = [];
    if (!loadedModels) return out;
    function walk(obj) {
        if (!obj || isArrangementOverlayObject(obj)) return;
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
    return collectArrangementObjects(loadedModels).map(poseFromInitUserData);
}

export function captureCurrentPoses(loadedModels, captureCtx = {}) {
    return collectArrangementObjects(loadedModels).map(obj => ({
        objectRef: obj,
        ...captureObjectLocalTrs(obj, captureCtx),
        visible: obj.visible !== false,
    }));
}

// Poses to apply for a given arrangement — the Initial arrangement is computed on demand so it
// always reflects the current scene contents, even if objects were added/removed since load.
export function resolveArrangementPoses(arrangement, loadedModels) {
    if (!arrangement) return [];
    if (isInitArrangement(arrangement)) return buildInitPoses(loadedModels);
    return (arrangement.poses || []).filter(p => p.objectRef);
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

export function cloneArrangement(arrangement) {
    return {
        id: arrangement.id,
        name: arrangement.name,
        description: arrangement.description || '',
        isInit: !!arrangement.isInit,
        camera: _cloneCamera(arrangement.camera),
        poses: isInitArrangement(arrangement) ? [] : (arrangement.poses || []).map(_clonePose),
    };
}

// Whole-catalog capture/restore — used as the before/after payload of catalog-mutating undo
// commands (capture / update / rename / delete / duplicate / move / clear camera).
export function captureArrangementsCatalog() {
    return {
        activeId: activeArrangementId,
        dirty: arrangementDirty,
        nextId: nextArrangementId,
        arrangements: assemblyArrangements.map(cloneArrangement),
    };
}

export function restoreArrangementsCatalog(snap) {
    if (!snap) return;
    assemblyArrangements.length = 0;
    (snap.arrangements || []).forEach(s => assemblyArrangements.push(cloneArrangement(s)));
    ensureInitialArrangement();
    activeArrangementId = snap.activeId ?? null;
    arrangementDirty = !!snap.dirty;
    const maxId = assemblyArrangements.reduce((m, s) => Math.max(m, s.id || 0), 0);
    nextArrangementId = Math.max(snap.nextId ?? 1, maxId + 1);
}

function _nextDefaultName() {
    const n = assemblyArrangements.filter(s => !isInitArrangement(s)).length + 1;
    return `Arrangement ${n}`;
}

export function captureArrangement(loadedModels, captureCtx, extras = {}) {
    ensureInitialArrangement();
    const arrangement = {
        id: nextArrangementId++,
        name: extras.name || _nextDefaultName(),
        description: extras.description || '',
        camera: extras.camera ? _cloneCamera(extras.camera) : null,
        poses: captureCurrentPoses(loadedModels, captureCtx),
        isInit: false,
    };
    assemblyArrangements.push(arrangement);
    activeArrangementId = arrangement.id;
    arrangementDirty = false;
    return arrangement;
}

export function updateArrangement(arrangement, loadedModels, captureCtx, extras = {}) {
    if (!arrangement || isInitArrangement(arrangement)) return false;
    arrangement.poses = captureCurrentPoses(loadedModels, captureCtx);
    if (Object.prototype.hasOwnProperty.call(extras, 'camera')) {
        arrangement.camera = extras.camera ? _cloneCamera(extras.camera) : null;
    }
    if (extras.name != null) arrangement.name = extras.name;
    if (extras.description != null) arrangement.description = extras.description;
    activeArrangementId = arrangement.id;
    arrangementDirty = false;
    return true;
}

export function duplicateArrangement(arrangement, loadedModels) {
    if (!arrangement) return null;
    ensureInitialArrangement();
    const copy = cloneArrangement(arrangement);
    copy.id = nextArrangementId++;
    copy.isInit = false;
    copy.name = `${arrangement.name || 'Arrangement'} (copy)`;
    if (isInitArrangement(arrangement)) {
        copy.poses = buildInitPoses(loadedModels);
        copy.camera = null;
    }
    const srcIndex = assemblyArrangements.indexOf(arrangement);
    const insertAt = srcIndex >= 0 ? srcIndex + 1 : assemblyArrangements.length;
    assemblyArrangements.splice(insertAt, 0, copy);
    activeArrangementId = copy.id;
    arrangementDirty = false;
    return copy;
}

// User-defined arrangements occupy indices 1..length-1; Initial is pinned at 0.
export function canMoveArrangement(arrangement, delta) {
    if (!arrangement || isInitArrangement(arrangement) || !delta) return false;
    const i = assemblyArrangements.indexOf(arrangement);
    const j = i + delta;
    return i >= 1 && j >= 1 && j < assemblyArrangements.length;
}

export function moveArrangement(arrangement, delta) {
    if (!canMoveArrangement(arrangement, delta)) return false;
    const i = assemblyArrangements.indexOf(arrangement);
    const j = i + delta;
    [assemblyArrangements[i], assemblyArrangements[j]] =
        [assemblyArrangements[j], assemblyArrangements[i]];
    return true;
}

export function deleteArrangement(arrangement) {
    if (!arrangement || isInitArrangement(arrangement)) return false;
    const i = assemblyArrangements.indexOf(arrangement);
    if (i < 0) return false;
    assemblyArrangements.splice(i, 1);
    if (activeArrangementId === arrangement.id) {
        activeArrangementId = null;
        arrangementDirty = false;
    }
    return true;
}

export function deleteAllUserArrangements() {
    const kept = assemblyArrangements.filter(isInitArrangement);
    assemblyArrangements.length = 0;
    if (kept.length) assemblyArrangements.push(kept[0]);
    else assemblyArrangements.push(createInitialArrangement());
    ensureInitialArrangement();
    activeArrangementId = activeArrangementId === INITIAL_ARRANGEMENT_ID
        ? INITIAL_ARRANGEMENT_ID
        : null;
    arrangementDirty = false;
}

export function setArrangementCamera(arrangement, camera) {
    if (!arrangement || isInitArrangement(arrangement)) return false;
    arrangement.camera = camera ? _cloneCamera(camera) : null;
    return true;
}

// Called when an object is permanently removed from the scene — drop it from every arrangement
// so stale references never linger.
export function purgeArrangementObjects(removedSet) {
    if (!removedSet || removedSet.size === 0) return;
    assemblyArrangements.forEach(arrangement => {
        if (isInitArrangement(arrangement)) return;
        arrangement.poses = arrangement.poses.filter(p => p.objectRef && !removedSet.has(p.objectRef));
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
// object must be remapped through the inverse bake matrix to keep the arrangement visually
// consistent.
export function remapArrangementsAfterObjectBake(obj, invBake) {
    if (!obj || !invBake) return;
    assemblyArrangements.forEach(arrangement => {
        if (isInitArrangement(arrangement)) return;
        arrangement.poses.forEach(pose => {
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

// Write each user-defined arrangement's pose for every referenced object into that object's
// userData, so a per-object GLTFExporter round trip carries the poses along (mirrors
// assemblyTransformations).
export function writeArrangementsToUserData() {
    const userArrangements = assemblyArrangements.filter(s => !isInitArrangement(s));
    const allObjects = new Set();
    userArrangements.forEach(s => s.poses.forEach(p => {
        if (p.objectRef) allObjects.add(p.objectRef);
    }));
    allObjects.forEach(obj => { obj.userData.assemblyArrangementPoses = []; });

    userArrangements.forEach(s => {
        s.poses.forEach(p => {
            if (!p.objectRef) return;
            if (!Array.isArray(p.objectRef.userData.assemblyArrangementPoses)) {
                p.objectRef.userData.assemblyArrangementPoses = [];
            }
            p.objectRef.userData.assemblyArrangementPoses.push({
                arrangement_id: s.id,
                arrangement_name: s.name,
                position: { ...p.position },
                quaternion: { ...p.quaternion },
                scale: { ...p.scale },
                visible: !!p.visible,
            });
        });
    });
}

// Arrangement-level metadata (name, order, description, camera) travels in the export root's
// userData, next to the workflow index — it cannot be reconstructed from the per-object records
// alone.
export function embedArrangementIndex(userData) {
    const index = assemblyArrangements
        .filter(s => !isInitArrangement(s))
        .map((s, i) => ({
            id: s.id,
            name: s.name,
            description: s.description || '',
            camera: _cloneCamera(s.camera),
            order: i,
        }));
    if (index.length > 0) userData.assemblyArrangementIndex = index;
}

// Remove assemblyArrangementPoses from userData of all objects referenced by any arrangement.
// Call on originals immediately after cloning for export — clones already carry the data.
export function clearArrangementsUserData() {
    assemblyArrangements.forEach(s => {
        if (isInitArrangement(s)) return;
        s.poses.forEach(p => {
            if (p.objectRef) delete p.objectRef.userData.assemblyArrangementPoses;
        });
    });
}

// Read userData.assemblyArrangementPoses / assemblyArrangementIndex from an imported GLTF scene
// and add every arrangement it contains to the (already-loaded) catalog.
export function importArrangementsFromGltfScene(gltfScene) {
    if (!gltfScene) return 0;
    const imported = new Map();
    let indexMeta = null;

    gltfScene.traverse(function (child) {
        if (Array.isArray(child.userData.assemblyArrangementIndex)) {
            if (!indexMeta) indexMeta = child.userData.assemblyArrangementIndex;
            delete child.userData.assemblyArrangementIndex;
        }

        const arr = child.userData.assemblyArrangementPoses;
        if (!Array.isArray(arr) || arr.length === 0) return;

        arr.forEach(entry => {
            const sid = entry.arrangement_id;
            if (sid == null || Number(sid) === INITIAL_ARRANGEMENT_ID) return;
            if (!imported.has(sid)) {
                imported.set(sid, {
                    id: sid,
                    name: entry.arrangement_name || '',
                    description: '',
                    camera: null,
                    poses: [],
                });
            }
            const st = imported.get(sid);
            if (!st.name && entry.arrangement_name) st.name = entry.arrangement_name;
            st.poses.push({
                objectRef: child,
                position: entry.position,
                quaternion: entry.quaternion,
                scale: entry.scale,
                visible: entry.visible !== false,
            });
        });
        delete child.userData.assemblyArrangementPoses;
    });

    if (imported.size === 0) return 0;

    const meta = new Map((indexMeta || []).map(e => [e.id, e]));
    const incoming = [...imported.values()].sort((a, b) => {
        const oa = meta.get(a.id)?.order ?? a.id;
        const ob = meta.get(b.id)?.order ?? b.id;
        return oa - ob;
    });

    ensureInitialArrangement();
    incoming.forEach(imp => {
        const m = meta.get(imp.id);
        const arrangement = {
            id: nextArrangementId++,
            name: m?.name || imp.name || `Arrangement ${nextArrangementId - 1}`,
            description: m?.description || imp.description || '',
            camera: m?.camera ? _cloneCamera(m.camera) : null,
            poses: imp.poses,
            isInit: false,
        };
        assemblyArrangements.push(arrangement);
    });

    console.log(`[Assembly] Imported ${incoming.length} arrangement(s) from GLB.`);
    return incoming.length;
}
