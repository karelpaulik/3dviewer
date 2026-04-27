// cadDim3dUtils.js – CSS3D-based CAD dimension measurement
// Labels are CSS3DObject (3D DOM elements oriented toward camera).
// Geometry (lines, markers) uses standard Three.js objects.
// Mirrors the CAD dimension logic from measurementUtils.js, but with CSS3D labels.

import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

// --- Private state ---
let _scene = null;
let _cadDim3dActive = false;
let _cadDim3dStep   = 0;       // 0: wait p1, 1: wait p2, 2: place dim line
let _cadDim3dP1World = null;   // THREE.Vector3 (world space)
let _cadDim3dP2World = null;
let _cadDim3dOwner   = null;
let _cadDim3dAxis    = 'x';   // 'x' | 'y' | 'z'
let _cadDim3dMeasurements = [];
let _depthTestEnabled = true;
let _currentCamera   = null;   // Updated each frame via updateCadDim3dOrientations()

// Phase 0-1 preview objects (world space)
let _cadHoverMarker3d   = null;
let _cadPendingMarker3d = null; // sphere at p1 (in owner local space)
let _cadPreviewLine3d   = null; // dashed preview line p1→cursor

// Phase 2 preview objects (world space)
let _cadP2Ext1_3d        = null;
let _cadP2Ext2_3d        = null;
let _cadP2DimLine_3d     = null;
let _cadP2FootMarker1_3d = null;
let _cadP2FootMarker2_3d = null;
let _cadP2Label3d        = null;
let _cadP2LastOffsetPoint3d = null;

// Reusable raycaster
const _cadTempRaycaster3d = new THREE.Raycaster();

// --- Constants ---
const CAD_DIM3D_COLOR          = 0xcc7700;
const CAD_DIM3D_EXT_COLOR      = 0xcc7700;
const CAD_DIM3D_LABEL_BG       = 'rgba(110,50,0,0.9)';
const CAD_DIM3D_LABEL_BG_HEX   = '#6e3200'; // hex approximation for color picker default
const CAD_DIM3D_LABEL_TEXT_HEX = '#ffffff';
const MARKER_RADIUS       = 1;
const MARKER_SCREEN_SIZE  = 5;
const LABEL_SCALE         = 0.2;   // CSS pixels → world units
const LABEL_SCALE_DEFAULT = 5;     // multiplier for the label

// --- Defaults (editable via tools panel) ---
const _cadDim3dDefaults = {
    labelScale:      LABEL_SCALE_DEFAULT,
    rotationCamera:  0,
    rotationXY:      0,
    rotationXZ:      0,
    rotationYZ:      0,
    orientationMode: 'camera',
    textColor:       CAD_DIM3D_LABEL_TEXT_HEX,
    bgColor:         CAD_DIM3D_LABEL_BG_HEX,
};

function _defaultCadDim3dRotation() {
    const m = _cadDim3dDefaults.orientationMode;
    if (m === 'XY') return _cadDim3dDefaults.rotationXY;
    if (m === 'XZ') return _cadDim3dDefaults.rotationXZ;
    if (m === 'YZ') return _cadDim3dDefaults.rotationYZ;
    return _cadDim3dDefaults.rotationCamera;
}

export function getCadDim3dDefaults() { return _cadDim3dDefaults; }

// --- Geometry helpers ---

function _cadGetFoot3d(pointWorld, axis, offsetPoint) {
    if (axis === 'x') return new THREE.Vector3(pointWorld.x, offsetPoint.y, offsetPoint.z);
    if (axis === 'y') return new THREE.Vector3(offsetPoint.x, pointWorld.y, offsetPoint.z);
    return new THREE.Vector3(offsetPoint.x, offsetPoint.y, pointWorld.z);
}

function _cadGetValue3d(p1, p2, axis) {
    if (axis === 'x') return Math.abs(p2.x - p1.x);
    if (axis === 'y') return Math.abs(p2.y - p1.y);
    return Math.abs(p2.z - p1.z);
}

function _makeLine3d(p1, p2, color, dashed) {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    let mat;
    if (dashed) {
        mat = new THREE.LineDashedMaterial({ color, dashSize: 4, gapSize: 3, depthTest: false, transparent: true, opacity: 0.85 });
    } else {
        mat = new THREE.LineBasicMaterial({ color, depthTest: _depthTestEnabled });
    }
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    line.renderOrder = dashed ? 999 : (_depthTestEnabled ? 0 : 999);
    line.userData._isCadDim3d = true;
    return line;
}

function _makeMarker3d(position, color, isPreview) {
    const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
    const mat = new THREE.MeshBasicMaterial({
        color,
        depthTest: isPreview ? false : _depthTestEnabled,
        transparent: !!isPreview,
        opacity: isPreview ? 0.7 : 1.0,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = isPreview ? 999 : (_depthTestEnabled ? 0 : 999);
    mesh.position.copy(position);
    mesh.userData._isCadDim3d = true;
    return mesh;
}

function _makeLabel3d(text, position, scaleMultiplier, textColor, bgColor) {
    const div = document.createElement('div');
    div.className = 'measurement-label cad-dim-3d-label';
    div.innerHTML = text;
    const bg = bgColor || CAD_DIM3D_LABEL_BG;
    const tc = textColor || '#fff';
    div.style.cssText = 'color:' + tc + ';background:' + bg + ';padding:2px 8px;border-radius:3px;font-size:11px;white-space:nowrap;line-height:1.4;pointer-events:none;user-select:none;';
    const label = new CSS3DObject(div);
    // CSS3DObject constructor forcefully sets pointerEvents='auto' — override it back to none.
    // _setLabelPointerEvents() will re-enable 'auto' for specific labels in Edit Labels mode.
    div.style.pointerEvents = 'none';
    label.position.copy(position);
    const s = LABEL_SCALE * (scaleMultiplier || LABEL_SCALE_DEFAULT);
    label.scale.setScalar(s);
    label.userData._isCadDim3d = true;
    return label;
}

function _getLabelText3d(axis, value) {
    return axis.toUpperCase() + ': ' + value.toFixed(2);
}

/**
 * Generate label HTML for a placed CAD dimension.
 * labelMode 0 = simple (axis: value), 1 = full (total + Δx/Δy/Δz)
 */
function _cadDimGetLabelText3d(meas) {
    const axisLabel = (meas.axis || 'x').toUpperCase();
    const value = meas.value;
    if (!meas.labelMode) {
        return axisLabel + ': ' + value.toFixed(2);
    }
    // Full mode
    const owner = meas.ownerObject || _scene;
    owner.updateWorldMatrix(true, false);
    const p1w = owner.localToWorld(meas.p1.clone());
    const p2w = owner.localToWorld(meas.p2.clone());
    const dx = Math.abs(p2w.x - p1w.x);
    const dy = Math.abs(p2w.y - p1w.y);
    const dz = Math.abs(p2w.z - p1w.z);
    const dist = p1w.distanceTo(p2w);
    const dXY = Math.sqrt(dx * dx + dy * dy);
    const dXZ = Math.sqrt(dx * dx + dz * dz);
    const dYZ = Math.sqrt(dy * dy + dz * dz);
    return axisLabel + ': ' + value.toFixed(2)
        + '<br>' + dist.toFixed(2)
        + '<br><span style="font-size:10px;opacity:0.85;">&Delta;x ' + dx.toFixed(2) + ' &nbsp;&Delta;YZ ' + dYZ.toFixed(2)
        + '<br>&Delta;y ' + dy.toFixed(2) + ' &nbsp;&Delta;XZ ' + dXZ.toFixed(2)
        + '<br>&Delta;z ' + dz.toFixed(2) + ' &nbsp;&Delta;XY ' + dXY.toFixed(2) + '</span>';
}

function _findUserDataRec3d(meas) {
    const owner = meas.ownerObject || _scene;
    if (!owner || !owner.userData || !Array.isArray(owner.userData.measurements3d)) return null;
    return owner.userData.measurements3d.find(d =>
        d.type === 'cadDim3d'
        && Math.abs(d.p1.x - meas.p1.x) < 1e-6
        && Math.abs(d.p1.y - meas.p1.y) < 1e-6
        && Math.abs(d.p1.z - meas.p1.z) < 1e-6) || null;
}

/**
 * Orient a CSS3DObject label.
 * orientationMode: 'camera' (default), 'XY', 'XZ', 'YZ'
 */
function _applyOrientation3d(labelObj, camera, orientationMode, rotationAngle) {
    if (!labelObj || !camera) return;
    const owner = labelObj.parent;
    const mode = orientationMode || 'camera';

    const ownerWorldQuat = new THREE.Quaternion();
    if (owner) owner.getWorldQuaternion(ownerWorldQuat);
    const ownerWorldQuatInv = ownerWorldQuat.clone().invert();

    let targetWorldQuat;
    if (mode === 'camera') {
        const labelWorldPos = new THREE.Vector3();
        labelObj.getWorldPosition(labelWorldPos);
        const m4 = new THREE.Matrix4();
        m4.lookAt(camera.position, labelWorldPos, camera.up);
        targetWorldQuat = new THREE.Quaternion().setFromRotationMatrix(m4);
    } else if (mode === 'XY') {
        targetWorldQuat = new THREE.Quaternion();
    } else if (mode === 'XZ') {
        targetWorldQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    } else { // YZ
        targetWorldQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    }

    // Apply additional in-plane rotation around label-local Z
    if (rotationAngle) {
        const rotQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotationAngle);
        targetWorldQuat.multiply(rotQ);
    }

    if (owner && owner !== _scene) {
        labelObj.quaternion.copy(ownerWorldQuatInv).multiply(targetWorldQuat);
    } else {
        labelObj.quaternion.copy(targetWorldQuat);
    }
}

function _applyScale3d(meas) {
    if (!meas.label) return;
    const s = LABEL_SCALE * (meas.labelScale || LABEL_SCALE_DEFAULT);
    meas.label.scale.set(meas.mirrored ? -s : s, s, s);
}

function _applyColors3d(meas) {
    if (!meas.label || !meas.label.element) return;
    meas.label.element.style.color      = meas.textColor || CAD_DIM3D_LABEL_TEXT_HEX;
    meas.label.element.style.background = meas.bgColor   || CAD_DIM3D_LABEL_BG;
}

function _applyOrientationForMeas(meas, camera) {
    if (!meas.label || !camera) return;
    _applyOrientation3d(meas.label, camera, meas.orientationMode || 'camera', meas.rotationAngle || 0);
}

function _showCadDim3dSizeDialog(currentScale) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.45);z-index:200001;display:flex;align-items:center;justify-content:center;';
        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:#2a2a2a;color:#fff;border-radius:8px;padding:16px 20px;min-width:260px;box-shadow:0 4px 24px rgba(0,0,0,0.5);font-family:sans-serif;';
        const title = document.createElement('div');
        title.textContent = 'Label size (scale multiplier)';
        title.style.cssText = 'font-size:13px;font-weight:bold;margin-bottom:10px;';
        const input = document.createElement('input');
        input.type = 'number'; input.min = '0.1'; input.max = '20'; input.step = '0.1';
        input.value = String(currentScale);
        input.style.cssText = 'width:100%;box-sizing:border-box;background:#1a1a1a;color:#fff;border:1px solid #555;border-radius:4px;padding:6px 8px;font-size:13px;margin-bottom:12px;';
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;';
        const btnCancel = document.createElement('button');
        btnCancel.textContent = 'Zrušit';
        btnCancel.style.cssText = 'padding:6px 16px;border:1px solid #666;background:#444;color:#fff;border-radius:4px;cursor:pointer;font-size:12px;';
        const btnOk = document.createElement('button');
        btnOk.textContent = 'OK';
        btnOk.style.cssText = 'padding:6px 16px;border:none;background:#4a4;color:#fff;border-radius:4px;cursor:pointer;font-size:12px;';
        btnRow.appendChild(btnCancel); btnRow.appendChild(btnOk);
        dialog.appendChild(title); dialog.appendChild(input); dialog.appendChild(btnRow);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        input.focus(); input.select();
        function cleanup(result) { document.body.removeChild(overlay); resolve(result); }
        btnOk.addEventListener('click', () => { const v = parseFloat(input.value); cleanup(isFinite(v) && v > 0 ? v : null); });
        btnCancel.addEventListener('click', () => cleanup(null));
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') btnOk.click(); if (e.key === 'Escape') cleanup(null); });
        overlay.addEventListener('click', (e) => e.stopPropagation());
    });
}

// --- Preview hide helpers ---

function _hidePreview3dPhase01() {
    if (_cadHoverMarker3d && _scene) {
        _scene.remove(_cadHoverMarker3d);
        _cadHoverMarker3d.geometry.dispose();
        _cadHoverMarker3d.material.dispose();
        _cadHoverMarker3d = null;
    }
    if (_cadPreviewLine3d && _scene) {
        _scene.remove(_cadPreviewLine3d);
        _cadPreviewLine3d.geometry.dispose();
        _cadPreviewLine3d.material.dispose();
        _cadPreviewLine3d = null;
    }
}

function _hidePreview3dPhase2() {
    if (!_scene) return;
    for (const obj of [_cadP2Ext1_3d, _cadP2Ext2_3d, _cadP2DimLine_3d, _cadP2FootMarker1_3d, _cadP2FootMarker2_3d]) {
        if (obj) {
            _scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        }
    }
    _cadP2Ext1_3d = _cadP2Ext2_3d = _cadP2DimLine_3d = _cadP2FootMarker1_3d = _cadP2FootMarker2_3d = null;
    if (_cadP2Label3d) {
        _scene.remove(_cadP2Label3d);
        if (_cadP2Label3d.element) _cadP2Label3d.element.remove();
        _cadP2Label3d = null;
    }
}

function _cancelAll3d() {
    _hidePreview3dPhase01();
    _hidePreview3dPhase2();
    if (_cadPendingMarker3d) {
        const owner = _cadDim3dOwner || _scene;
        if (owner) owner.remove(_cadPendingMarker3d);
        _cadPendingMarker3d.geometry.dispose();
        _cadPendingMarker3d.material.dispose();
        _cadPendingMarker3d = null;
    }
    _cadDim3dStep = 0;
    _cadDim3dP1World = null;
    _cadDim3dP2World = null;
    _cadDim3dOwner = null;
    _cadP2LastOffsetPoint3d = null;
}

function _buildPhase2Preview3d(offsetPoint) {
    if (!_scene || !_cadDim3dP1World || !_cadDim3dP2World) return;
    _cadP2LastOffsetPoint3d = offsetPoint.clone();
    _hidePreview3dPhase2();

    const foot1 = _cadGetFoot3d(_cadDim3dP1World, _cadDim3dAxis, offsetPoint);
    const foot2 = _cadGetFoot3d(_cadDim3dP2World, _cadDim3dAxis, offsetPoint);
    const value = _cadGetValue3d(_cadDim3dP1World, _cadDim3dP2World, _cadDim3dAxis);
    const axisLabel = _cadDim3dAxis.toUpperCase();

    // Extension lines (dashed, always on top during preview)
    _cadP2Ext1_3d = _makeLine3d(_cadDim3dP1World, foot1, CAD_DIM3D_EXT_COLOR, true);
    _cadP2Ext2_3d = _makeLine3d(_cadDim3dP2World, foot2, CAD_DIM3D_EXT_COLOR, true);

    // Dimension line (solid, always on top during preview)
    const dimGeo = new THREE.BufferGeometry().setFromPoints([foot1, foot2]);
    const dimMat = new THREE.LineBasicMaterial({ color: CAD_DIM3D_COLOR, depthTest: false });
    _cadP2DimLine_3d = new THREE.Line(dimGeo, dimMat);
    _cadP2DimLine_3d.renderOrder = 999;
    _cadP2DimLine_3d.userData._isCadDim3d = true;

    // Foot markers
    _cadP2FootMarker1_3d = _makeMarker3d(foot1, 0xffaa44, true);
    _cadP2FootMarker2_3d = _makeMarker3d(foot2, 0xffaa44, true);

    // CSS3D label at dim-line midpoint
    const labelPos = new THREE.Vector3().addVectors(foot1, foot2).multiplyScalar(0.5);
    const labelText = axisLabel + ': ' + value.toFixed(2)
        + '<br><span style="font-size:9px;opacity:0.7;">RMB: cycle axis · LMB: place</span>';
    _cadP2Label3d = _makeLabel3d(labelText, labelPos, _cadDim3dDefaults.labelScale, _cadDim3dDefaults.textColor, _cadDim3dDefaults.bgColor);

    // Orient label immediately if camera is known
    if (_currentCamera) _applyOrientation3d(_cadP2Label3d, _currentCamera, _cadDim3dDefaults.orientationMode, _defaultCadDim3dRotation());

    _scene.add(_cadP2Ext1_3d);
    _scene.add(_cadP2Ext2_3d);
    _scene.add(_cadP2DimLine_3d);
    _scene.add(_cadP2FootMarker1_3d);
    _scene.add(_cadP2FootMarker2_3d);
    _scene.add(_cadP2Label3d);
}

// --- Leader line helpers ---

function _updateCadDim3dLeaderLine(meas, labelPos) {
    if (!meas._labelAnchor) return;
    const owner = meas.ownerObject || _scene;
    if (meas.leaderLine) {
        owner.remove(meas.leaderLine);
        meas.leaderLine.geometry.dispose();
        meas.leaderLine.material.dispose();
    }
    const geo = new THREE.BufferGeometry().setFromPoints([meas._labelAnchor, labelPos]);
    const mat = new THREE.LineDashedMaterial({ color: 0x999999, dashSize: 3, gapSize: 2, depthTest: _depthTestEnabled, transparent: true, opacity: 0.6 });
    meas.leaderLine = new THREE.Line(geo, mat);
    meas.leaderLine.computeLineDistances();
    meas.leaderLine.renderOrder = _depthTestEnabled ? 0 : 998;
    meas.leaderLine.userData._isCadDim3d = true;
    owner.add(meas.leaderLine);
}

function _removeCadDim3dLeaderLine(meas) {
    if (meas.leaderLine) {
        const owner = meas.ownerObject || _scene;
        if (owner) owner.remove(meas.leaderLine);
        meas.leaderLine.geometry.dispose();
        meas.leaderLine.material.dispose();
        meas.leaderLine = null;
    }
}

// --- Single measurement remove ---

function _removeSingleCadDim3d(m) {
    _removeCadDim3dLeaderLine(m);
    const owner = m.ownerObject || _scene;
    for (const obj of [m.markerP1, m.markerP2, m.markerFoot1, m.markerFoot2, m.extLine1, m.extLine2, m.dimLine]) {
        if (!obj) continue;
        owner.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }
    if (m.label) {
        owner.remove(m.label);
        if (m.label.element) m.label.element.remove();
    }
    if (owner.userData.measurements3d) {
        const di = owner.userData.measurements3d.findIndex(d =>
            d.type === 'cadDim3d'
            && Math.abs(d.p1.x - m.p1.x) < 1e-6
            && Math.abs(d.p1.y - m.p1.y) < 1e-6
            && Math.abs(d.p1.z - m.p1.z) < 1e-6);
        if (di !== -1) owner.userData.measurements3d.splice(di, 1);
        if (owner.userData.measurements3d.length === 0) delete owner.userData.measurements3d;
    }
}

// ===================== Public API =====================

/** Initialise the module. Call once after scene is created. */
export function initCadDim3d(scene) {
    _scene = scene;
}

export function getCadDim3dMeasurements() { return _cadDim3dMeasurements; }

export function updateCadDim3dLeaderLine(meas, labelPos) { _updateCadDim3dLeaderLine(meas, labelPos); }

export function deleteCadDim3dByRef(meas) {
    const idx = _cadDim3dMeasurements.indexOf(meas);
    if (idx === -1) return;
    _removeSingleCadDim3d(meas);
    _cadDim3dMeasurements.splice(idx, 1);
}

/**
 * Rebuild all visual objects of a placed CSS3D CAD dimension in-place with a new offsetPoint.
 * isDragging=true: keep label DOM element alive (just reposition it).
 * isDragging=false: recreate the label DOM element with updated text.
 */
export function rebuildCadDim3dVisuals(meas, p1World, p2World, offsetPoint, isDragging) {
    if (!_scene) return;
    const owner = meas.ownerObject || _scene;
    owner.updateWorldMatrix(true, false);

    const axis = meas.axis;
    const foot1World = _cadGetFoot3d(p1World, axis, offsetPoint);
    const foot2World = _cadGetFoot3d(p2World, axis, offsetPoint);
    const f1    = owner.worldToLocal(foot1World.clone());
    const f2    = owner.worldToLocal(foot2World.clone());
    const value = _cadGetValue3d(p1World, p2World, axis);
    const newMid = new THREE.Vector3().addVectors(f1, f2).multiplyScalar(0.5);

    // Dispose and remove geometry objects (NOT markerP1/markerP2 anchor points)
    for (const obj of [meas.markerFoot1, meas.markerFoot2, meas.extLine1, meas.extLine2, meas.dimLine]) {
        if (!obj) continue;
        owner.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }

    // Label: during drag keep DOM alive, after drag recreate
    if (isDragging && meas.label) {
        // Preserve label offset relative to the old feet midpoint
        const oldMid = new THREE.Vector3().addVectors(meas.foot1, meas.foot2).multiplyScalar(0.5);
        const labelOffset = meas.label.position.clone().sub(oldMid);
        meas.label.position.copy(newMid).add(labelOffset);
    } else if (meas.label) {
        owner.remove(meas.label);
        if (meas.label.element) meas.label.element.remove();
        const tempMeas = Object.assign({}, meas, { value, foot1: f1, foot2: f2 });
        const labelText = _cadDimGetLabelText3d(tempMeas);
        const newLabel = _makeLabel3d(labelText, newMid, LABEL_SCALE_DEFAULT);
        owner.add(newLabel);
        meas.label = newLabel;
        if (_currentCamera) _applyOrientation3d(newLabel, _currentCamera, meas.orientationMode);
    }

    const markerFoot1 = _makeMarker3d(f1, CAD_DIM3D_COLOR, false);
    const markerFoot2 = _makeMarker3d(f2, CAD_DIM3D_COLOR, false);
    const extLine1    = _makeLine3d(meas.p1, f1, CAD_DIM3D_EXT_COLOR, false);
    const extLine2    = _makeLine3d(meas.p2, f2, CAD_DIM3D_EXT_COLOR, false);
    const dimLine     = _makeLine3d(f1, f2, CAD_DIM3D_COLOR, false);

    owner.add(markerFoot1); owner.add(markerFoot2);
    owner.add(extLine1);    owner.add(extLine2);
    owner.add(dimLine);

    meas.markerFoot1 = markerFoot1;
    meas.markerFoot2 = markerFoot2;
    meas.extLine1 = extLine1;
    meas.extLine2 = extLine2;
    meas.dimLine  = dimLine;
    meas.foot1 = f1;
    meas.foot2 = f2;
    meas.value = value;

    // Update leader line anchor to new feet midpoint and redraw
    if (meas._labelAnchor) {
        meas._labelAnchor = newMid.clone();
        if (meas.label) _updateCadDim3dLeaderLine(meas, meas.label.position);
    }
}

/** Sync foot positions + label position back to userData after a drag ends. */
export function syncCadDim3dLabelPos(meas) {
    if (!meas || !meas.label) return;
    const rec = _findUserDataRec3d(meas);
    if (!rec) return;
    rec.foot1    = { x: meas.foot1.x, y: meas.foot1.y, z: meas.foot1.z };
    rec.foot2    = { x: meas.foot2.x, y: meas.foot2.y, z: meas.foot2.z };
    rec.value    = meas.value;
    const lp = meas.label.position;
    rec.labelPos = { x: lp.x, y: lp.y, z: lp.z };
}

/** Change the label display mode of a CSS3D CAD dimension and update its HTML. */
export function setCadDim3dLabelMode(meas, mode, renderFn) {
    if (!meas) return;
    meas.labelMode = mode;
    if (meas.label && meas.label.element) {
        meas.label.element.innerHTML = _cadDimGetLabelText3d(meas);
    }
    const rec = _findUserDataRec3d(meas);
    if (rec) rec.labelMode = mode;
    if (renderFn) renderFn();
}

/** Toggle label-only drag (mode 1) vs whole-dimension drag (mode 0). */
export function setCadDim3dDragMode(meas, mode, renderFn) {
    if (!meas) return;
    meas.dragMode = mode;
    const rec = _findUserDataRec3d(meas);
    const anchor = new THREE.Vector3().addVectors(meas.foot1, meas.foot2).multiplyScalar(0.5);
    if (mode === 1) {
        // Label-offset ON: show leader line from dim-line midpoint to label
        // If label is currently at the midpoint, give it a small default offset so the user sees the line
        if (meas.label) {
            const mid = anchor.clone();
            if (meas.label.position.distanceTo(mid) < 1e-4) {
                meas.label.position.addScaledVector(new THREE.Vector3(0, 1, 0), 10);
            }
        }
        meas._labelAnchor = anchor;
        if (meas.label) _updateCadDim3dLeaderLine(meas, meas.label.position);
    } else {
        // Label-offset OFF: keep label where it is and keep the leader line visible
        // (leader line connects dim-line midpoint to current label position)
        meas._labelAnchor = anchor;
        if (meas.label) _updateCadDim3dLeaderLine(meas, meas.label.position);
        if (rec) { const lp = meas.label.position; rec.labelPos = { x: lp.x, y: lp.y, z: lp.z }; }
    }
    if (rec) rec.dragMode = mode;
    if (renderFn) renderFn();
}

/** Change orientation mode and immediately re-orient the label. */
export function setCadDim3dOrientationMode(meas, mode, renderFn) {
    if (!meas) return;
    meas.orientationMode = mode;
    if (meas.label && _currentCamera) _applyOrientation3d(meas.label, _currentCamera, mode, meas.rotationAngle || 0);
    const rec = _findUserDataRec3d(meas);
    if (rec) rec.orientationMode = mode;
    if (renderFn) renderFn();
}

/** Rotate label by ±90° (incremental). */
export function setCadDim3dRotate(meas, deltaRad, renderFn) {
    if (!meas) return;
    meas.rotationAngle = ((meas.rotationAngle || 0) + deltaRad + Math.PI * 2) % (Math.PI * 2);
    if (meas.label && _currentCamera) _applyOrientation3d(meas.label, _currentCamera, meas.orientationMode || 'camera', meas.rotationAngle);
    const rec = _findUserDataRec3d(meas);
    if (rec) rec.rotationAngle = meas.rotationAngle;
    if (renderFn) renderFn();
}

/** Open size dialog and apply new labelScale. Returns a Promise. */
export function setCadDim3dLabelScaleDialog(meas, renderFn) {
    if (!meas) return;
    const currentScale = meas.labelScale != null ? meas.labelScale : LABEL_SCALE_DEFAULT;
    return _showCadDim3dSizeDialog(currentScale).then(v => {
        if (v === null) return;
        meas.labelScale = v;
        _applyScale3d(meas);
        const rec = _findUserDataRec3d(meas);
        if (rec) rec.labelScale = v;
        if (renderFn) renderFn();
    });
}

/** Toggle mirrored state of the label. */
export function setCadDim3dMirrored(meas, renderFn) {
    if (!meas) return;
    meas.mirrored = !meas.mirrored;
    _applyScale3d(meas);
    const rec = _findUserDataRec3d(meas);
    if (rec) rec.mirrored = meas.mirrored;
    if (renderFn) renderFn();
}

/** Set label text color. */
export function setCadDim3dTextColor(meas, color, renderFn) {
    if (!meas) return;
    meas.textColor = color;
    _applyColors3d(meas);
    const rec = _findUserDataRec3d(meas);
    if (rec) rec.textColor = color;
    if (renderFn) renderFn();
}

/** Set label background color. */
export function setCadDim3dBgColor(meas, color, renderFn) {
    if (!meas) return;
    meas.bgColor = color;
    _applyColors3d(meas);
    const rec = _findUserDataRec3d(meas);
    if (rec) rec.bgColor = color;
    if (renderFn) renderFn();
}

export function isCadDim3dActive()  { return _cadDim3dActive; }
export function getCadDim3dStep()   { return _cadDim3dStep;   }
export function getCadDim3dAxis()   { return _cadDim3dAxis;   }

export function setCadDim3dActive(val) {
    _cadDim3dActive = val;
    if (!val) _cancelAll3d();
}

/**
 * Handle a surface click in phases 0 and 1.
 * Phase 0: place first point. Phase 1: place second point and enter placement mode.
 */
export function addCadDim3dPoint(point, ownerObject, renderFn) {
    if (!_cadDim3dActive || !_scene || _cadDim3dStep >= 2) return;

    if (_cadDim3dStep === 0) {
        _cadDim3dOwner = ownerObject || _scene;
        _cadDim3dP1World = point.clone();
        _cadDim3dOwner.updateWorldMatrix(true, false);
        const localP = _cadDim3dOwner.worldToLocal(point.clone());
        _cadPendingMarker3d = _makeMarker3d(localP, CAD_DIM3D_COLOR, false);
        _cadDim3dOwner.add(_cadPendingMarker3d);
        _hidePreview3dPhase01();
        _cadDim3dStep = 1;
        if (renderFn) renderFn();
    } else if (_cadDim3dStep === 1) {
        _cadDim3dP2World = point.clone();
        _hidePreview3dPhase01();
        _cadDim3dStep = 2;
        if (renderFn) renderFn();
    }
}

/**
 * Update the placement preview in phase 2 (call every frame from render loop).
 * mouseNDC: THREE.Vector2 with normalised device coordinates.
 */
export function updateCadDim3dPreview(mouseNDC, camera) {
    if (!_cadDim3dActive || !_scene || _cadDim3dStep !== 2) return;
    if (!_cadDim3dP1World || !_cadDim3dP2World) return;

    const mid = new THREE.Vector3().addVectors(_cadDim3dP1World, _cadDim3dP2World).multiplyScalar(0.5);
    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(cameraDir, mid);

    _cadTempRaycaster3d.setFromCamera(mouseNDC, camera);
    const offsetPoint = new THREE.Vector3();
    const hit = _cadTempRaycaster3d.ray.intersectPlane(plane, offsetPoint);
    if (!hit) {
        if (_cadP2LastOffsetPoint3d) _buildPhase2Preview3d(_cadP2LastOffsetPoint3d);
        return;
    }
    _buildPhase2Preview3d(offsetPoint);
}

/**
 * Update hover marker on surface (phases 0 and 1).
 * Call every frame; pass null when cursor is not over any surface.
 */
export function updateCadDim3dHoverPreview(surfacePoint) {
    if (!_cadDim3dActive || !_scene || _cadDim3dStep >= 2) {
        _hidePreview3dPhase01();
        return;
    }
    if (!surfacePoint) {
        _hidePreview3dPhase01();
        return;
    }

    // Hover sphere
    if (!_cadHoverMarker3d) {
        const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
        const mat = new THREE.MeshBasicMaterial({ color: 0xffaa44, depthTest: false, transparent: true, opacity: 0.7 });
        _cadHoverMarker3d = new THREE.Mesh(geo, mat);
        _cadHoverMarker3d.renderOrder = 999;
        _cadHoverMarker3d.userData._isCadDim3d = true;
        _scene.add(_cadHoverMarker3d);
    }
    _cadHoverMarker3d.position.copy(surfacePoint);

    // Dashed line from p1 to cursor (only in phase 1)
    if (_cadDim3dStep === 1 && _cadDim3dP1World) {
        if (_cadPreviewLine3d) {
            _scene.remove(_cadPreviewLine3d);
            _cadPreviewLine3d.geometry.dispose();
            _cadPreviewLine3d.material.dispose();
        }
        const geo = new THREE.BufferGeometry().setFromPoints([_cadDim3dP1World, surfacePoint]);
        const mat = new THREE.LineDashedMaterial({ color: CAD_DIM3D_COLOR, dashSize: 4, gapSize: 3, depthTest: false });
        _cadPreviewLine3d = new THREE.Line(geo, mat);
        _cadPreviewLine3d.computeLineDistances();
        _cadPreviewLine3d.renderOrder = 999;
        _cadPreviewLine3d.userData._isCadDim3d = true;
        _scene.add(_cadPreviewLine3d);
    } else if (!_cadDim3dP1World && _cadPreviewLine3d) {
        _scene.remove(_cadPreviewLine3d);
        _cadPreviewLine3d.geometry.dispose();
        _cadPreviewLine3d.material.dispose();
        _cadPreviewLine3d = null;
    }
}

/** Cycle measurement axis X → Y → Z → X. Rebuilds preview if in phase 2. */
export function cycleCadDim3dAxis(mouseNDC, camera) {
    if (_cadDim3dAxis === 'x') _cadDim3dAxis = 'y';
    else if (_cadDim3dAxis === 'y') _cadDim3dAxis = 'z';
    else _cadDim3dAxis = 'x';
    if (_cadDim3dStep === 2) updateCadDim3dPreview(mouseNDC, camera);
    return _cadDim3dAxis;
}

/**
 * Finalise dimension placement using the last computed offset point.
 * Creates permanent measurement objects in owner local space.
 */
export function placeCadDim3d(renderFn) {
    if (_cadDim3dStep !== 2 || !_cadP2LastOffsetPoint3d || !_cadDim3dP1World || !_cadDim3dP2World) return;
    if (!_scene) return;

    const offsetPoint = _cadP2LastOffsetPoint3d;
    const foot1World  = _cadGetFoot3d(_cadDim3dP1World, _cadDim3dAxis, offsetPoint);
    const foot2World  = _cadGetFoot3d(_cadDim3dP2World, _cadDim3dAxis, offsetPoint);
    const value       = _cadGetValue3d(_cadDim3dP1World, _cadDim3dP2World, _cadDim3dAxis);
    const owner       = _cadDim3dOwner || _scene;

    owner.updateWorldMatrix(true, false);
    const p1 = owner.worldToLocal(_cadDim3dP1World.clone());
    const p2 = owner.worldToLocal(_cadDim3dP2World.clone());
    const f1 = owner.worldToLocal(foot1World.clone());
    const f2 = owner.worldToLocal(foot2World.clone());

    _hidePreview3dPhase2();

    // Reuse pending marker as markerP1
    const markerP1 = _cadPendingMarker3d;
    _cadPendingMarker3d = null;

    const markerP2    = _makeMarker3d(p2, CAD_DIM3D_COLOR, false);
    const markerFoot1 = _makeMarker3d(f1, CAD_DIM3D_COLOR, false);
    const markerFoot2 = _makeMarker3d(f2, CAD_DIM3D_COLOR, false);

    const extLine1 = _makeLine3d(p1, f1, CAD_DIM3D_EXT_COLOR, false);
    const extLine2 = _makeLine3d(p2, f2, CAD_DIM3D_EXT_COLOR, false);
    const dimLine  = _makeLine3d(f1, f2, CAD_DIM3D_COLOR,     false);

    const labelPos  = new THREE.Vector3().addVectors(f1, f2).multiplyScalar(0.5);
    const labelText = _getLabelText3d(_cadDim3dAxis, value);
    const label     = _makeLabel3d(labelText, labelPos, _cadDim3dDefaults.labelScale, _cadDim3dDefaults.textColor, _cadDim3dDefaults.bgColor);

    owner.add(markerP2);
    owner.add(markerFoot1);
    owner.add(markerFoot2);
    owner.add(extLine1);
    owner.add(extLine2);
    owner.add(dimLine);
    owner.add(label);

    // Apply orientation immediately
    if (_currentCamera) _applyOrientation3d(label, _currentCamera, _cadDim3dDefaults.orientationMode, _defaultCadDim3dRotation());

    const meas = {
        markerP1, markerP2, markerFoot1, markerFoot2,
        extLine1, extLine2, dimLine, label,
        p1, p2, foot1: f1, foot2: f2,
        axis: _cadDim3dAxis, value,
        ownerObject: owner,
        labelMode: 0,
        dragMode: 0,
        orientationMode: _cadDim3dDefaults.orientationMode,
        rotationAngle: _defaultCadDim3dRotation(),
        labelScale: _cadDim3dDefaults.labelScale,
        mirrored: false,
        textColor: _cadDim3dDefaults.textColor,
        bgColor:   _cadDim3dDefaults.bgColor,
    };
    _cadDim3dMeasurements.push(meas);

    // Persist in userData for GLB export
    if (!owner.userData.measurements3d) owner.userData.measurements3d = [];
    owner.userData.measurements3d.push({
        type:     'cadDim3d',
        p1:       { x: p1.x, y: p1.y, z: p1.z },
        p2:       { x: p2.x, y: p2.y, z: p2.z },
        foot1:    { x: f1.x, y: f1.y, z: f1.z },
        foot2:    { x: f2.x, y: f2.y, z: f2.z },
        axis:     _cadDim3dAxis,
        value,
        labelPos:        { x: labelPos.x, y: labelPos.y, z: labelPos.z },
        labelMode:       0,
        dragMode:        0,
        orientationMode: _cadDim3dDefaults.orientationMode,
        rotationAngle:   _defaultCadDim3dRotation(),
        labelScale:      _cadDim3dDefaults.labelScale,
        mirrored:        false,
        textColor:       _cadDim3dDefaults.textColor,
        bgColor:         _cadDim3dDefaults.bgColor,
    });

    // Reset to phase 0 (keep mode active for next dimension)
    _cadDim3dStep = 0;
    _cadDim3dP1World = null;
    _cadDim3dP2World = null;
    _cadDim3dOwner = null;
    _cadP2LastOffsetPoint3d = null;

    if (renderFn) renderFn();
}

/** Remove all CSS3D CAD dimension measurements from the scene. */
export function clearCadDim3dMeasurements(renderFn) {
    if (!_scene) return;
    _cancelAll3d();
    for (const m of _cadDim3dMeasurements) _removeSingleCadDim3d(m);
    _cadDim3dMeasurements = [];
    if (renderFn) renderFn();
}

/** Remove measurements whose ownerObject is a descendant of root. Call when removing a loaded model. */
export function removeCadDim3dMeasurementsForOwner(root) {
    if (!root) return;
    const owned = new Set();
    root.traverse(obj => owned.add(obj));
    _cadDim3dMeasurements = _cadDim3dMeasurements.filter(m => {
        if (!owned.has(m.ownerObject)) return true;
        if (m.label && m.label.element) m.label.element.remove();
        for (const obj of [m.markerP1, m.markerP2, m.markerFoot1, m.markerFoot2, m.extLine1, m.extLine2, m.dimLine]) {
            if (obj) { if (obj.geometry) obj.geometry.dispose(); if (obj.material) obj.material.dispose(); }
        }
        if (m.leaderLine) { m.leaderLine.geometry.dispose(); m.leaderLine.material.dispose(); m.leaderLine = null; }
        return false;
    });
}

/** Show / hide all placed CSS3D CAD dimension visuals. */
export function setCadDim3dVisible(visible) {
    for (const m of _cadDim3dMeasurements) {
        m.markerP1.visible   = visible;
        m.markerP2.visible   = visible;
        m.markerFoot1.visible = visible;
        m.markerFoot2.visible = visible;
        m.extLine1.visible   = visible;
        m.extLine2.visible   = visible;
        m.dimLine.visible    = visible;
        m.label.visible      = visible;
        if (m.leaderLine) m.leaderLine.visible = visible;
    }
}

/**
 * Enable / disable depth testing for all measurement geometry.
 * enabled=false → always visible (over model), enabled=true → hidden behind model.
 */
export function setCadDim3dDepthTest(enabled) {
    _depthTestEnabled = enabled;
    const ro = enabled ? 0 : 999;
    for (const m of _cadDim3dMeasurements) {
        for (const mk of [m.markerP1, m.markerP2, m.markerFoot1, m.markerFoot2]) {
            if (mk) { mk.material.depthTest = enabled; mk.renderOrder = ro; }
        }
        for (const ln of [m.extLine1, m.extLine2, m.dimLine]) {
            if (ln) { ln.material.depthTest = enabled; ln.renderOrder = ro; }
        }
        if (m.leaderLine) { m.leaderLine.material.depthTest = enabled; m.leaderLine.renderOrder = enabled ? 0 : 998; }
    }
}

/**
 * Update CSS3D label orientations so they face the camera.
 * Call once per frame from the render loop.
 */
export function updateCadDim3dOrientations(camera) {
    _currentCamera = camera;
    if (!camera) return;
    for (const m of _cadDim3dMeasurements) {
        if (m.label) _applyOrientation3d(m.label, camera, m.orientationMode || 'camera', m.rotationAngle || 0);
    }
    if (_cadP2Label3d) _applyOrientation3d(_cadP2Label3d, camera);
}

/**
 * Scale all markers to a constant screen size.
 * Call once per frame from the render loop.
 */
export function updateCadDim3dMarkerScales(camera) {
    if (!camera) return;
    const markers = [];
    for (const m of _cadDim3dMeasurements) {
        markers.push(m.markerP1, m.markerP2, m.markerFoot1, m.markerFoot2);
    }
    if (_cadPendingMarker3d)  markers.push(_cadPendingMarker3d);
    if (_cadHoverMarker3d)    markers.push(_cadHoverMarker3d);
    if (_cadP2FootMarker1_3d) markers.push(_cadP2FootMarker1_3d);
    if (_cadP2FootMarker2_3d) markers.push(_cadP2FootMarker2_3d);

    if (markers.length === 0) return;

    const worldPos = new THREE.Vector3();
    for (const marker of markers) {
        marker.getWorldPosition(worldPos);
        const dist = camera.position.distanceTo(worldPos);
        let scale;
        if (camera.isPerspectiveCamera) {
            const vFov = THREE.MathUtils.degToRad(camera.fov);
            scale = (dist * Math.tan(vFov * 0.5) * 2) / window.innerHeight * MARKER_SCREEN_SIZE;
        } else {
            const viewHeight = (camera.top - camera.bottom) / camera.zoom;
            scale = viewHeight / window.innerHeight * MARKER_SCREEN_SIZE;
        }
        marker.scale.setScalar(scale);
    }
}

/**
 * Reconstruct CSS3D CAD dimension visuals from userData.measurements3d stored on scene graph nodes.
 * Call after loading a GLB model.
 */
export function reconstructCadDim3d(root) {
    if (!root) return;
    root.traverse(function (node) {
        const data = node.userData && node.userData.measurements3d;
        if (!Array.isArray(data) || data.length === 0) return;
        node.updateWorldMatrix(true, false);
        for (const rec of data) {
            if (rec.type === 'cadDim3d') _reconstructCadDim3dFromRec(node, rec);
        }
    });
}

function _reconstructCadDim3dFromRec(owner, rec) {
    const p1    = new THREE.Vector3(rec.p1.x,    rec.p1.y,    rec.p1.z);
    const p2    = new THREE.Vector3(rec.p2.x,    rec.p2.y,    rec.p2.z);
    const f1    = new THREE.Vector3(rec.foot1.x, rec.foot1.y, rec.foot1.z);
    const f2    = new THREE.Vector3(rec.foot2.x, rec.foot2.y, rec.foot2.z);
    const value = rec.value != null ? rec.value : f1.distanceTo(f2);

    const markerP1    = _makeMarker3d(p1, CAD_DIM3D_COLOR, false);
    const markerP2    = _makeMarker3d(p2, CAD_DIM3D_COLOR, false);
    const markerFoot1 = _makeMarker3d(f1, CAD_DIM3D_COLOR, false);
    const markerFoot2 = _makeMarker3d(f2, CAD_DIM3D_COLOR, false);
    const extLine1    = _makeLine3d(p1, f1, CAD_DIM3D_EXT_COLOR, false);
    const extLine2    = _makeLine3d(p2, f2, CAD_DIM3D_EXT_COLOR, false);
    const dimLine     = _makeLine3d(f1, f2, CAD_DIM3D_COLOR,     false);
    const labelPos    = rec.labelPos
        ? new THREE.Vector3(rec.labelPos.x, rec.labelPos.y, rec.labelPos.z)
        : new THREE.Vector3().addVectors(f1, f2).multiplyScalar(0.5);

    // Build a temporary meas-like object so _cadDimGetLabelText3d can generate the correct text
    const labelMode = rec.labelMode || 0;
    const tempMeas = {
        axis: rec.axis || 'x', value,
        p1, p2, foot1: f1, foot2: f2,
        labelMode,
        ownerObject: owner,
    };
    const labelText   = _cadDimGetLabelText3d(tempMeas);
    const label       = _makeLabel3d(labelText, labelPos, LABEL_SCALE_DEFAULT, rec.textColor, rec.bgColor);

    owner.add(markerP1); owner.add(markerP2);
    owner.add(markerFoot1); owner.add(markerFoot2);
    owner.add(extLine1); owner.add(extLine2);
    owner.add(dimLine);  owner.add(label);

    // Apply orientation + scale immediately if camera is known
    const rotAngle = rec.rotationAngle || 0;
    const lblScale = rec.labelScale != null ? rec.labelScale : LABEL_SCALE_DEFAULT;
    const isMirror = rec.mirrored || false;
    if (_currentCamera) _applyOrientation3d(label, _currentCamera, rec.orientationMode || 'camera', rotAngle);
    const sInit = LABEL_SCALE * lblScale;
    label.scale.set(isMirror ? -sInit : sInit, sInit, sInit);

    const dragMode = rec.dragMode || 0;
    const meas = {
        markerP1, markerP2, markerFoot1, markerFoot2,
        extLine1, extLine2, dimLine, label,
        p1, p2, foot1: f1, foot2: f2,
        axis: rec.axis || 'x', value,
        ownerObject: owner,
        labelMode,
        dragMode,
        orientationMode: rec.orientationMode || 'camera',
        rotationAngle:   rotAngle,
        labelScale:      lblScale,
        mirrored:        isMirror,
        textColor:       rec.textColor || null,
        bgColor:         rec.bgColor   || null,
    };
    // Restore leader line if label is offset from dim-line midpoint
    const mid = new THREE.Vector3().addVectors(f1, f2).multiplyScalar(0.5);
    if (dragMode === 1 || mid.distanceTo(labelPos) > 1e-6) {
        meas._labelAnchor = mid;
        _updateCadDim3dLeaderLine(meas, labelPos);
    }
    _cadDim3dMeasurements.push(meas);
}

/**
 * Strip CSS3D CAD dimension visual objects (_isCadDim3d) from a cloned scene graph before GLB export.
 * Keeps userData.measurements3d intact so measurements can be reconstructed on import.
 */
export function stripCadDim3dVisuals(root) {
    if (!root) return;
    const toRemove = [];
    root.traverse(function (child) {
        if (child.userData && child.userData._isCadDim3d) toRemove.push(child);
    });
    for (const obj of toRemove) {
        if (obj.parent) obj.parent.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }
}
