// undoCommands.js — undo/redo command factories for scene operations (phase 1)

import * as THREE from 'three';

// ── Assembly snapshot helpers ─────────────────────────────────────────────────

function _cloneVec3(v) {
    return v ? { x: v.x, y: v.y, z: v.z } : null;
}

function _cloneQuat(q) {
    return q ? { x: q.x, y: q.y, z: q.z, w: q.w } : null;
}

function _cloneTransformRec(t) {
    return {
        objectRef: t.objectRef,
        initPosition: _cloneVec3(t.initPosition),
        finalPosition: _cloneVec3(t.finalPosition),
        initQuaternion: _cloneQuat(t.initQuaternion),
        finalQuaternion: _cloneQuat(t.finalQuaternion),
        initScale: _cloneVec3(t.initScale),
        finalScale: _cloneVec3(t.finalScale),
    };
}

export function snapshotAssemblyState(ctx) {
    const { assemblyData, assemblyState, assemblyAnchors } = ctx;
    return {
        currentStepIndex: assemblyState.currentStepIndex,
        steps: assemblyData.steps.map(step => ({
            id: step.id,
            name: step.name,
            description: step.description,
            camera: step.camera ? JSON.parse(JSON.stringify(step.camera)) : null,
            transformations: step.transformations.map(_cloneTransformRec),
        })),
        anchors: [...assemblyAnchors.entries()].map(([obj, anchor]) => [obj, JSON.parse(JSON.stringify(anchor))]),
    };
}

export function restoreAssemblyState(ctx, snap) {
    if (!snap) return;
    const { assemblyData, assemblyState, assemblyAnchors } = ctx;
    assemblyData.steps.length = 0;
    snap.steps.forEach(step => {
        assemblyData.steps.push({
            id: step.id,
            name: step.name,
            description: step.description,
            camera: step.camera ? JSON.parse(JSON.stringify(step.camera)) : null,
            transformations: step.transformations.map(t => ({
                objectRef: t.objectRef,
                initPosition: _cloneVec3(t.initPosition),
                finalPosition: _cloneVec3(t.finalPosition),
                initQuaternion: _cloneQuat(t.initQuaternion),
                finalQuaternion: _cloneQuat(t.finalQuaternion),
                initScale: _cloneVec3(t.initScale),
                finalScale: _cloneVec3(t.finalScale),
            })),
        });
    });
    assemblyAnchors.clear();
    snap.anchors.forEach(([obj, anchor]) => {
        if (obj) assemblyAnchors.set(obj, JSON.parse(JSON.stringify(anchor)));
    });
    assemblyState.currentStepIndex = snap.currentStepIndex;
    ctx.updateAssemblyGuiInfo?.();
}

// ── Transform helpers ───────────────────────────────────────────────────────────

function _cloneEuler(e) {
    return new THREE.Euler(e.x, e.y, e.z, e.order);
}

function _applyLocalTransform(obj, t) {
    if (!obj || !t) return;
    obj.position.copy(t.position);
    obj.rotation.copy(t.rotation);
    obj.scale.copy(t.scale);
    obj.updateMatrixWorld(true, true);
}

function _setObjectFromWorldMatrix(obj, worldMatrix) {
    const parent = obj.parent;
    if (parent) {
        parent.updateWorldMatrix(true, false);
        const local = new THREE.Matrix4().multiplyMatrices(
            new THREE.Matrix4().copy(parent.matrixWorld).invert(),
            worldMatrix,
        );
        local.decompose(obj.position, obj.quaternion, obj.scale);
    } else {
        worldMatrix.decompose(obj.position, obj.quaternion, obj.scale);
    }
    obj.updateMatrixWorld(true, true);
}

function _worldMatrixDelta(a, b) {
    const pa = new THREE.Vector3();
    const pb = new THREE.Vector3();
    const qa = new THREE.Quaternion();
    const qb = new THREE.Quaternion();
    const sa = new THREE.Vector3();
    const sb = new THREE.Vector3();
    a.decompose(pa, qa, sa);
    b.decompose(pb, qb, sb);
    return pa.distanceTo(pb) + qa.angleTo(qb) + sa.distanceTo(sb);
}

export function transformStateChanged(before, after) {
    if (!before || !after) return false;
    const bp = before.position;
    const ap = after.position;
    const br = before.rotation;
    const ar = after.rotation;
    const bs = before.scale;
    const as = after.scale;
    if (bp.distanceTo(ap) > 1e-4) return true;
    const bq = new THREE.Quaternion().setFromEuler(br);
    const aq = new THREE.Quaternion().setFromEuler(ar);
    if (bq.angleTo(aq) > 1e-4) return true;
    if (bs.distanceTo(as) > 1e-4) return true;
    return false;
}

function _afterSceneTransform(ctx) {
    const obj = ctx.lastSelectedObject;
    if (obj) ctx.refreshCrossSectionLinesAfterTransform?.(obj);
    if (ctx.viewProp?.showCrossSection && ctx.viewProp?.autoUpdateSectionLines) {
        ctx.updateCrossSectionLines?.();
    }
    if (ctx.viewProp?.sectionCrossLines) ctx.updateSectionCrossLines?.();
    if (ctx.viewProp?.isGroupTransformActive && ctx.multiSelectionHelpers?.length) {
        ctx.multiSelectionHelpers.forEach((h, i) => {
            if (ctx.selectedObjects?.[i]) h.setFromObject(ctx.selectedObjects[i]);
        });
    }
    ctx._updateDeviationComparisonDisplayPosesFromDrag?.();
    ctx.render?.();
}

/**
 * @param {object} ctx
 * @param {{ label?: string, targets: Array<{ object, before, after }>, beforeAssembly?: object, afterAssembly?: object }} data
 */
export function createTransformCommand(ctx, data) {
    const label = data.label || 'Transform';
    const targets = data.targets.map(t => ({
        object: t.object,
        before: {
            position: t.before.position.clone(),
            rotation: _cloneEuler(t.before.rotation),
            scale: t.before.scale.clone(),
        },
        after: {
            position: t.after.position.clone(),
            rotation: _cloneEuler(t.after.rotation),
            scale: t.after.scale.clone(),
        },
    }));

    function apply(side) {
        const map = side === 'before' ? 'before' : 'after';
        const assembly = side === 'before' ? data.beforeAssembly : data.afterAssembly;
        targets.forEach(t => _applyLocalTransform(t.object, t[map]));
        restoreAssemblyState(ctx, assembly);
        targets.forEach(t => ctx.repairChainForObject?.(t.object));
        _afterSceneTransform(ctx);
    }

    return {
        label,
        undo: () => apply('before'),
        redo: () => apply('after'),
    };
}

/**
 * @param {object} ctx
 * @param {{ label?: string, targets: Array<{ object, beforeWorld: THREE.Matrix4, afterWorld: THREE.Matrix4 }>, beforeAssembly?: object, afterAssembly?: object }} data
 */
export function createGroupTransformCommand(ctx, data) {
    const label = data.label || 'Group transform';
    const targets = data.targets.map(t => ({
        object: t.object,
        beforeWorld: t.beforeWorld.clone(),
        afterWorld: t.afterWorld.clone(),
    }));

    function apply(side) {
        const key = side === 'before' ? 'beforeWorld' : 'afterWorld';
        const assembly = side === 'before' ? data.beforeAssembly : data.afterAssembly;
        targets.forEach(t => _setObjectFromWorldMatrix(t.object, t[key]));
        restoreAssemblyState(ctx, assembly);
        targets.forEach(t => ctx.repairChainForObject?.(t.object));
        _afterSceneTransform(ctx);
    }

    return {
        label,
        undo: () => apply('before'),
        redo: () => apply('after'),
    };
}

export function buildGroupTransformTargets(previousGroupTransformStates) {
    const targets = [];
    for (const state of previousGroupTransformStates) {
        const obj = state.object;
        if (!obj) continue;
        obj.updateWorldMatrix(true, false);
        const beforeWorld = state.worldMatrix.clone();
        const afterWorld = obj.matrixWorld.clone();
        if (_worldMatrixDelta(beforeWorld, afterWorld) > 1e-4) {
            targets.push({ object: obj, beforeWorld, afterWorld });
        }
    }
    return targets;
}

// ── Remove / restore object ───────────────────────────────────────────────────

export function captureRemoveSnapshot(ctx, part) {
    const parent = part.parent;
    const container = parent || ctx.scene;
    const siblingIndex = container.children.indexOf(part);
    const lmIdx = ctx.loadedModels.indexOf(part);

    const meshEntries = [];
    const hiddenEntries = [];
    part.traverse(obj => {
        if (obj.isMesh) {
            const mi = ctx.meshObjects.indexOf(obj);
            if (mi !== -1) meshEntries.push({ obj, index: mi });
        }
        const hi = ctx.hiddenObjects.indexOf(obj);
        if (hi !== -1) hiddenEntries.push({ obj, index: hi });
    });

    return {
        part,
        parent,
        siblingIndex,
        lmIdx,
        meshEntries: meshEntries.sort((a, b) => a.index - b.index),
        hiddenEntries: hiddenEntries.sort((a, b) => a.index - b.index),
        assemblySnap: snapshotAssemblyState(ctx),
        groupHistorySnap: ctx.groupHistory.map(e => ({ name: e.name, objects: [...e.objects] })),
        groupHistoryIndex: ctx.groupHistoryIndex,
    };
}

function _restoreRemovedObject(ctx, snap) {
    const { part, parent, siblingIndex, lmIdx, meshEntries, hiddenEntries } = snap;
    const container = parent || ctx.scene;

    if (parent) {
        parent.add(part);
    } else {
        ctx.scene.add(part);
    }
    ctx.insertChildAtIndex(container, part, siblingIndex);

    if (lmIdx !== -1) {
        ctx.loadedModels.splice(lmIdx, 0, part);
    }

    meshEntries.forEach(({ obj, index }) => {
        const idx = Math.min(index, ctx.meshObjects.length);
        ctx.meshObjects.splice(idx, 0, obj);
    });
    hiddenEntries.forEach(({ obj, index }) => {
        const idx = Math.min(index, ctx.hiddenObjects.length);
        ctx.hiddenObjects.splice(idx, 0, obj);
    });

    restoreAssemblyState(ctx, snap.assemblySnap);

    ctx.groupHistory.length = 0;
    snap.groupHistorySnap.forEach(e => ctx.groupHistory.push({ name: e.name, objects: [...e.objects] }));
    ctx.groupHistoryIndex = snap.groupHistoryIndex;
    ctx.updateHistoryInfo?.();

    if (ctx.viewProp?.showSectionMesh) {
        part.traverse(child => {
            if (child.isMesh && !child.isSectionMesh) ctx.createSectionMesh?.(child);
        });
    }
    if (ctx.viewProp?.showSharpEdges) {
        part.traverse(child => {
            if (child.isMesh) ctx.updateMeshEdgeOverlays?.(child);
        });
    }
    if (ctx.viewProp?.showCrossSection && ctx.viewProp?.autoUpdateSectionLines) {
        ctx.updateCrossSectionLines?.();
    }
    if (ctx.viewProp?.sectionCrossLines) ctx.updateSectionCrossLines?.();
    if (ctx.viewProp?.solidSection) ctx.computeSolidSection?.();
    ctx.markModelStatsDirty?.();
    ctx.rebuildTree?.(ctx.loadedModels, true);
    if (ctx.normalsViewGui?.showVertexAllNormals) ctx.updateVertexNormalsHelpers?.();
    else ctx.render?.();
}

export function createRemoveObjectCommand(ctx, snap) {
    const name = snap.part?.name || 'object';
    return {
        label: `Remove ${name}`,
        undo: () => _restoreRemovedObject(ctx, snap),
        redo: () => ctx.removeModel?.(snap.part, true, { skipSceneRebuild: false, skipUndo: true }),
    };
}

// ── Visibility ────────────────────────────────────────────────────────────────

export function captureVisibilitySnapshot(part, ctx) {
    return {
        object: part,
        beforeVisible: part.visible,
        wasInHiddenObjects: ctx.hiddenObjects.includes(part),
        wasInTemporarilyShown: ctx.temporarilyShownObjects.includes(part),
        hiddenIndex: ctx.hiddenObjects.indexOf(part),
    };
}

function _applyVisibility(ctx, snap, visible) {
    const part = snap.object;
    if (!part) return;

    part.visible = visible;
    ctx.updateVisibilityIcon?.(part);

    const hi = ctx.hiddenObjects.indexOf(part);
    if (!visible) {
        if (hi === -1) ctx.hiddenObjects.push(part);
        const ti = ctx.temporarilyShownObjects.indexOf(part);
        if (ti !== -1) ctx.temporarilyShownObjects.splice(ti, 1);
    } else {
        if (hi !== -1) ctx.hiddenObjects.splice(hi, 1);
    }

    if (ctx.viewProp?.showCrossSection && ctx.viewProp?.autoUpdateSectionLines) {
        ctx.updateCrossSectionLines?.();
    }
    if (ctx.viewProp?.solidSection) ctx.computeSolidSection?.();
    if (ctx.normalsViewGui?.showVertexAllNormals || ctx.normalsViewGui?.showVertexNormals) {
        ctx.updateVertexNormalsHelpers?.();
    } else {
        ctx.render?.();
    }
}

export function createVisibilityCommand(ctx, snap) {
    const name = snap.object?.name || 'object';
    return {
        label: `Hide ${name}`,
        undo: () => _applyVisibility(ctx, snap, snap.beforeVisible),
        redo: () => _applyVisibility(ctx, snap, false),
    };
}
