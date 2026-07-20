// measurementUtils.js – Point-to-point measurement with CSS2D/CSS3D labels
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { getAnnotations, updateAnnotationLeaderLine, syncAnnotationLabelPos, deleteAnnotationByRef } from './annotationUtils.js';
import { getAnnotations3d, updateAnnotation3dLeaderLine, syncAnnotation3dLabelPos, deleteAnnotation3dByRef } from './annotation3dUtils.js';
import { getCadDim3dMeasurements, deleteCadDim3dByRef, rebuildCadDim3dVisuals, syncCadDim3dLabelPos, updateCadDim3dLeaderLine } from './cadDim3dUtils.js';

// --- Private state ---
let _scene = null;
let _measurements = []; // { line, label, p1, p2 }
let _pendingPoint = null; // THREE.Vector3 | null – first click awaiting second
let _pendingMarker = null; // Mesh for pending point preview
let _previewMarker = null; // Hover preview sphere (follows cursor on surface)
let _previewLine = null;   // Dashed line from pending point to preview
let _active = false;
let _pendingOwner = null;  // Owner object for the first click (distance measurement)

// --- Angle measurement state ---
let _angleActive = false;
let _angleStep = 0; // 0..3: how many points have been clicked
let _anglePoints = []; // up to 4 THREE.Vector3
let _angleMarkers = []; // markers for clicked points
let _angleLine1 = null; // line for first pair
let _anglePreviewLine = null; // dashed preview line from last point to cursor
let _angleMeasurements = []; // completed angle measurements
let _angleOwner = null; // Owner object for angle measurement (set on first click)

let _onMeasureSessionComplete = null;
let _onAngleSessionComplete = null;
let _onCadDimSessionComplete = null;

export function setMeasureOnSessionComplete(fn) { _onMeasureSessionComplete = fn; }
export function setAngleOnSessionComplete(fn) { _onAngleSessionComplete = fn; }
export function setCadDimOnSessionComplete(fn) { _onCadDimSessionComplete = fn; }

const _distanceMarkerDefaults = { markerColor: '#ff4444' };
const _angleMarkerDefaults    = { markerColor: '#4488ff' };

function _lighterColorHex(hex) {
    const c = new THREE.Color(hex);
    c.r = Math.min(1, c.r + 0.27);
    c.g = Math.min(1, c.g + 0.27);
    c.b = Math.min(1, c.b + 0.27);
    return '#' + c.getHexString();
}

function _applyDistanceMarkerColors() {
    const color = _distanceMarkerDefaults.markerColor;
    for (const m of _measurements) {
        if (m.marker1?.material) m.marker1.material.color.set(color);
        if (m.marker2?.material) m.marker2.material.color.set(color);
        if (m.line?.material) m.line.material.color.set(color);
    }
    if (_pendingMarker?.material) _pendingMarker.material.color.set(color);
    if (_previewMarker?.material) _previewMarker.material.color.set(_lighterColorHex(color));
    if (_previewLine?.material) _previewLine.material.color.set(color);
}

function _applyAngleMarkerColors() {
    const color = _angleMarkerDefaults.markerColor;
    for (const m of _angleMeasurements) {
        for (const mk of m.markers) {
            if (mk?.material) mk.material.color.set(color);
        }
        if (m.line1?.material) m.line1.material.color.set(color);
        if (m.line2?.material) m.line2.material.color.set(color);
        if (m.midLine?.material) m.midLine.material.color.set(color);
    }
    for (const mk of _angleMarkers) {
        if (mk?.material) mk.material.color.set(color);
    }
    if (_angleLine1?.material) _angleLine1.material.color.set(color);
    if (_anglePreviewLine?.material) _anglePreviewLine.material.color.set(color);
}

// --- Select dimension state ---
let _selectDimActive = false;
let _selectedDim = null; // reference to the selected measurement object (from _measurements or _angleMeasurements)
let _selectedDimType = null; // 'distance' | 'angle'
let _isDraggingLabel = false;
let _dragStartMouse = new THREE.Vector2();
let _dragStartPos = new THREE.Vector3();
let _currentCamera = null;
let _renderFn = null;
let _orbitControls = null;
const SELECTED_BORDER = '2px solid #ffdd00';

let _depthTestEnabled = true; // true = skryté za modelem (výchozí), false = vždy viditelné přes model

const MARKER_RADIUS = 1;
const MARKER_SCREEN_SIZE = 5; // desired pixel-size (approximate)

// --- Dimension marker size settings (shared with cadDim3dUtils via setters in main.js) ---
// Persistent settings object – same reference returned by getDimMarkerSettings so lil-gui .listen() stays in sync
const _dimMarkerSettings = {
    fixedSize:    false,
    fixedScreenPx: 3,
    worldSize:    5,
    markerColor:  '#22aacc',
};
let _dimMarkerColor = _dimMarkerSettings.markerColor; // shortcut kept in sync for creation callsites

export function setDimMarkerFixedSize(v)     { _dimMarkerSettings.fixedSize = v; }
export function setDimMarkerFixedScreenPx(v) { _dimMarkerSettings.fixedScreenPx = v; }
export function setDimMarkerWorldSize(v)     { _dimMarkerSettings.worldSize = v; }
export function setDimMarkerColor(v)         { _dimMarkerSettings.markerColor = v; _dimMarkerColor = v; _applyDimMarkerColor(); }
export function getDimMarkerSettings()       { return _dimMarkerSettings; }

// --- Measurement marker size settings (distance + angle, separate from CAD dimension markers) ---
const _measurementMarkerSettings = {
    fixedSize:     false,
    fixedScreenPx: 3,
    worldSize:     5,
};

export function getMeasurementMarkerSettings()       { return _measurementMarkerSettings; }
export function setMeasurementMarkerFixedSize(v)     { _measurementMarkerSettings.fixedSize = v; }
export function setMeasurementMarkerFixedScreenPx(v) { _measurementMarkerSettings.fixedScreenPx = v; }
export function setMeasurementMarkerWorldSize(v)     { _measurementMarkerSettings.worldSize = v; }

function _applyDimMarkerColor() {
    for (const m of _cadDimMeasurements) {
        for (const mk of [m.markerP1, m.markerP2, m.markerFoot1, m.markerFoot2]) {
            if (mk) mk.material.color.set(_dimMarkerColor);
        }
        for (const ln of [m.extLine1, m.extLine2, m.dimLine]) {
            if (ln) ln.material.color.set(_dimMarkerColor);
        }
    }
}

// --- Flat dimension defaults ---
const _flatDimDefaults = {
    textColor: '#ffffff',
    bgColor:   '#1976d2',
    fontSize:  11,
};

const _distanceLabelDefaults = {
    textColor: '#ffffff',
    bgColor:   '#c82828',
    fontSize:  11,
};

const _angleLabelDefaults = {
    textColor: '#ffffff',
    bgColor:   '#2850c8',
    fontSize:  11,
};

const LABEL_SCALE = 0.2;
let _defaultMeasurementLabelDim = '3d';

const _measurement3dDefaults = {
    labelScale:      5,
    rotationCamera:  0,
    rotationXY:      0,
    rotationXZ:      0,
    rotationYZ:      0,
    orientationMode: 'camera',
};

export function getDefaultMeasurementLabelDim() { return _defaultMeasurementLabelDim; }
export function setDefaultMeasurementLabelDim(v) { _defaultMeasurementLabelDim = v; }
export function getMeasurement3dDefaults() { return _measurement3dDefaults; }

function _defaultMeasurement3dRotation(mode) {
    const m = mode || _measurement3dDefaults.orientationMode;
    if (m === 'XY') return _measurement3dDefaults.rotationXY;
    if (m === 'XZ') return _measurement3dDefaults.rotationXZ;
    if (m === 'YZ') return _measurement3dDefaults.rotationYZ;
    return _measurement3dDefaults.rotationCamera;
}

function _initMeasurement3dFields(meas, rec) {
    const def = _measurement3dDefaults;
    meas.labelScale = rec?.labelScale ?? def.labelScale;
    meas.orientationMode = rec?.orientationMode ?? def.orientationMode;
    meas.rotationAngle = rec?.rotationAngle ?? _defaultMeasurement3dRotation(meas.orientationMode);
}

function _initMeasurementLabelDim(meas, labelDim, rec) {
    meas.labelDim = labelDim;
    if (labelDim === '3d') _initMeasurement3dFields(meas, rec);
}

function _measurementLabelDimUserData(meas) {
    if (meas.labelDim === '3d') {
        return {
            labelDim: '3d',
            labelScale: meas.labelScale,
            orientationMode: meas.orientationMode,
            rotationAngle: meas.rotationAngle,
        };
    }
    return { labelDim: '2d' };
}

function _measurementLabelDefaults(type) {
    return type === 'angle' ? _angleLabelDefaults : _distanceLabelDefaults;
}

function _measurementLabelBaseCss(textColor, bgColor, fontSize) {
    return `color:${textColor};background:${bgColor};padding:2px 6px;border-radius:3px;font-size:${fontSize}px;pointer-events:none;white-space:nowrap;line-height:1.4;`;
}

function _applyMeasurementLabelElementStyle(el, textColor, bgColor, fontSize) {
    el.style.color = textColor;
    el.style.background = bgColor;
    el.style.fontSize = fontSize + 'px';
}

function _getMeasurementLabelStyle(meas, type) {
    const def = _measurementLabelDefaults(type);
    if (meas.labelDim === '3d') {
        const ls = meas.labelScale ?? _measurement3dDefaults.labelScale;
        return {
            textColor: meas._textColor ?? def.textColor,
            bgColor: meas._bgColor ?? def.bgColor,
            fontSize: Math.round(ls * 2.2),
        };
    }
    return {
        textColor: meas._textColor ?? def.textColor,
        bgColor: meas._bgColor ?? def.bgColor,
        fontSize: meas._fontSize ?? def.fontSize,
    };
}

function _applyMeasurement3dScale(meas) {
    if (!meas.label || meas.labelDim !== '3d') return;
    const s = LABEL_SCALE * (meas.labelScale ?? _measurement3dDefaults.labelScale);
    const owner = meas.ownerObject || _scene;
    if (owner) {
        owner.updateWorldMatrix(true, false);
        const ws = new THREE.Vector3();
        owner.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), ws);
        const ix = ws.x !== 0 ? s / ws.x : s;
        const iy = ws.y !== 0 ? s / ws.y : s;
        const iz = ws.z !== 0 ? s / ws.z : s;
        meas.label.scale.set(ix, iy, iz);
    } else {
        meas.label.scale.setScalar(s);
    }
}

function _applyMeasurement3dOrientation(meas, camera) {
    if (!meas.label || meas.labelDim !== '3d' || !camera) return;
    const owner = meas.ownerObject || _scene;
    const ownerWorldQuat = new THREE.Quaternion();
    owner.getWorldQuaternion(ownerWorldQuat);
    const ownerWorldQuatInv = ownerWorldQuat.clone().invert();

    let targetWorldQuat;
    const mode = meas.orientationMode || 'camera';
    if (mode === 'camera') {
        const labelWorldPos = new THREE.Vector3();
        meas.label.getWorldPosition(labelWorldPos);
        const m = new THREE.Matrix4();
        m.lookAt(camera.position, labelWorldPos, camera.up);
        targetWorldQuat = new THREE.Quaternion().setFromRotationMatrix(m);
    } else if (mode === 'XY') {
        targetWorldQuat = new THREE.Quaternion();
    } else if (mode === 'XZ') {
        targetWorldQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    } else {
        targetWorldQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    }

    const rotAngle = meas.rotationAngle || 0;
    if (rotAngle !== 0) {
        const rotQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotAngle);
        targetWorldQuat.multiply(rotQ);
    }

    meas.label.quaternion.copy(ownerWorldQuatInv).multiply(targetWorldQuat);
}

export function updateMeasurement3dOrientations(camera) {
    if (camera) _currentCamera = camera;
    for (const m of _measurements) {
        if (m.labelDim === '3d') {
            _applyMeasurement3dScale(m);
            _applyMeasurement3dOrientation(m, camera);
        }
    }
    for (const m of _angleMeasurements) {
        if (m.labelDim === '3d') {
            _applyMeasurement3dScale(m);
            _applyMeasurement3dOrientation(m, camera);
        }
    }
}

function _applyMeasurementLabelStyle(meas, type) {
    if (!meas?.label?.element) return;
    const s = _getMeasurementLabelStyle(meas, type);
    _applyMeasurementLabelElementStyle(meas.label.element, s.textColor, s.bgColor, s.fontSize);
    if (meas.labelDim === '3d') {
        _applyMeasurement3dScale(meas);
        if (_currentCamera) _applyMeasurement3dOrientation(meas, _currentCamera);
    }
}

function _findMeasurementUserDataRec(meas, type) {
    const owner = meas.ownerObject || _scene;
    if (!owner?.userData?.measurements) return null;
    return owner.userData.measurements.find(d => {
        if (d.type !== type) return false;
        if (type === 'distance') return Math.abs(d.p1.x - meas.p1.x) < 1e-6;
        if (type === 'angle') return Math.abs(d.points[0].x - meas.points[0].x) < 1e-6;
        return false;
    }) || null;
}

function _syncMeasurementLabelStyleToUserData(meas, type) {
    const rec = _findMeasurementUserDataRec(meas, type);
    if (!rec) return;
    const s = _getMeasurementLabelStyle(meas, type);
    rec.textColor = meas._textColor ?? s.textColor;
    rec.bgColor = meas._bgColor ?? s.bgColor;
    rec.fontSize = meas._fontSize ?? s.fontSize;
    Object.assign(rec, _measurementLabelDimUserData(meas));
    if (meas.labelDim !== '3d') {
        delete rec.labelScale;
        delete rec.orientationMode;
        delete rec.rotationAngle;
    }
}

function _initMeasurementLabelFields(meas, type) {
    const def = _measurementLabelDefaults(type);
    meas._textColor = def.textColor;
    meas._bgColor = def.bgColor;
    meas._fontSize = def.fontSize;
}

function _measurementLabelStyleUserData(meas) {
    return {
        textColor: meas._textColor,
        bgColor: meas._bgColor,
        fontSize: meas._fontSize,
    };
}

export function getFlatDimDefaults() { return _flatDimDefaults; }

export function applyDefaultsToAllFlatDim(renderFn) {
    for (const meas of _cadDimMeasurements) {
        const el = meas.label && meas.label.element;
        if (el) {
            el.style.color = _flatDimDefaults.textColor;
            el.style.background = _flatDimDefaults.bgColor;
            el.style.fontSize = _flatDimDefaults.fontSize + 'px';
        }
    }
    if (renderFn) renderFn();
}

export function getDistanceLabelDefaults() { return _distanceLabelDefaults; }
export function getAngleLabelDefaults() { return _angleLabelDefaults; }
export function getDistanceMarkerDefaults() { return _distanceMarkerDefaults; }
export function getAngleMarkerDefaults() { return _angleMarkerDefaults; }

export function setDistanceMarkerColor(v) {
    _distanceMarkerDefaults.markerColor = v;
    _applyDistanceMarkerColors();
}

export function setAngleMarkerColor(v) {
    _angleMarkerDefaults.markerColor = v;
    _applyAngleMarkerColors();
}

export function applyDefaultsToAllDistanceMeasurements(renderFn) {
    for (const meas of _measurements) {
        meas._textColor = _distanceLabelDefaults.textColor;
        meas._bgColor = _distanceLabelDefaults.bgColor;
        meas._fontSize = _distanceLabelDefaults.fontSize;
        _applyMeasurementLabelStyle(meas, 'distance');
        _syncMeasurementLabelStyleToUserData(meas, 'distance');
    }
    _applyDistanceMarkerColors();
    if (renderFn) renderFn();
}

export function applyDefaultsToAllAngleMeasurements(renderFn) {
    for (const meas of _angleMeasurements) {
        meas._textColor = _angleLabelDefaults.textColor;
        meas._bgColor = _angleLabelDefaults.bgColor;
        meas._fontSize = _angleLabelDefaults.fontSize;
        _applyMeasurementLabelStyle(meas, 'angle');
        _syncMeasurementLabelStyleToUserData(meas, 'angle');
    }
    _applyAngleMarkerColors();
    if (renderFn) renderFn();
}

// --- Helpers ---

function _createMarker(position) {
    const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: _distanceMarkerDefaults.markerColor, depthTest: _depthTestEnabled });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = _depthTestEnabled ? 0 : 999;
    mesh.position.copy(position);
    mesh.userData._isMeasurement = true;
    return mesh;
}

function _createLine(p1, p2) {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const mat = new THREE.LineBasicMaterial({ color: _distanceMarkerDefaults.markerColor, depthTest: _depthTestEnabled });
    const line = new THREE.Line(geo, mat);
    line.renderOrder = _depthTestEnabled ? 0 : 999;
    line.userData._isMeasurement = true;
    return line;
}

function _createLabel3d(text, position, style, measOpts) {
    const s = style;
    const labelScale = measOpts?.labelScale ?? _measurement3dDefaults.labelScale;
    const div = document.createElement('div');
    div.className = 'measurement-label measurement-label-3d';
    div.innerHTML = text;
    div.style.cssText = _measurementLabelBaseCss(s.textColor, s.bgColor, s.fontSize);
    const label = new CSS3DObject(div);
    div.style.pointerEvents = 'none';
    label.position.copy(position);
    label.userData._isMeasurement = true;
    label.scale.setScalar(LABEL_SCALE * labelScale);
    return label;
}

function _createMeasurementLabel(text, position, style, type, labelDim, measOpts) {
    if (labelDim === '3d') return _createLabel3d(text, position, style, measOpts);
    if (type === 'angle') return _createAngleLabel(text, position, style);
    return _createLabel(text, position, style);
}

function _buildDistanceLabelText(dist, p1w, p2w) {
    const dx = Math.abs(p2w.x - p1w.x);
    const dy = Math.abs(p2w.y - p1w.y);
    const dz = Math.abs(p2w.z - p1w.z);
    const dXY = Math.sqrt(dx * dx + dy * dy);
    const dXZ = Math.sqrt(dx * dx + dz * dz);
    const dYZ = Math.sqrt(dy * dy + dz * dz);
    return dist.toFixed(2)
        + '<br><span style="font-size:10px;opacity:0.85;">Δx ' + dx.toFixed(2) + ' &nbsp;ΔYZ ' + dYZ.toFixed(2)
        + '<br>Δy ' + dy.toFixed(2) + ' &nbsp;ΔXZ ' + dXZ.toFixed(2)
        + '<br>Δz ' + dz.toFixed(2) + ' &nbsp;ΔXY ' + dXY.toFixed(2) + '</span>';
}

function _buildDistanceLabelTextFromMeas(meas) {
    const owner = meas.ownerObject || _scene;
    owner.updateWorldMatrix(true, false);
    const p1w = owner.localToWorld(meas.p1.clone());
    const p2w = owner.localToWorld(meas.p2.clone());
    return _buildDistanceLabelText(meas.distance, p1w, p2w);
}

function _buildAngleLabelText(v1, v2) {
    const dot3d = v1.dot(v2) / (v1.length() * v2.length());
    const a3D = THREE.MathUtils.radToDeg(Math.acos(Math.max(-1, Math.min(1, dot3d))));
    const aXY = _angleBetweenProjections(v1, v2, 'z');
    const aYZ = _angleBetweenProjections(v1, v2, 'x');
    const aXZ = _angleBetweenProjections(v1, v2, 'y');
    let labelText = '<b>Angle</b><br>';
    labelText += '3D: ' + a3D.toFixed(1) + '°<br>';
    labelText += '<span style="font-size:10px;opacity:0.85;">';
    labelText += 'XY: ' + (aXY !== null ? aXY.toFixed(1) + '°' : 'N/A') + '<br>';
    labelText += 'YZ: ' + (aYZ !== null ? aYZ.toFixed(1) + '°' : 'N/A') + '<br>';
    labelText += 'XZ: ' + (aXZ !== null ? aXZ.toFixed(1) + '°' : 'N/A');
    labelText += '</span>';
    return labelText;
}

function _buildAngleLabelTextFromMeas(meas) {
    const owner = meas.ownerObject || _scene;
    owner.updateWorldMatrix(true, false);
    const p0w = owner.localToWorld(meas.points[0].clone());
    const p1w = owner.localToWorld(meas.points[1].clone());
    const p2w = owner.localToWorld(meas.points[2].clone());
    const p3w = owner.localToWorld(meas.points[3].clone());
    const v1 = new THREE.Vector3().subVectors(p1w, p0w);
    const v2 = new THREE.Vector3().subVectors(p3w, p2w);
    return _buildAngleLabelText(v1, v2);
}

function _finalizeMeasurementLabel(meas, type) {
    if (meas.labelDim === '3d') {
        _applyMeasurement3dScale(meas);
        if (_currentCamera) _applyMeasurement3dOrientation(meas, _currentCamera);
    }
}

function _createLabel(text, position, style) {
    const s = style || _distanceLabelDefaults;
    const div = document.createElement('div');
    div.className = 'measurement-label';
    div.innerHTML = text;
    div.style.cssText = _measurementLabelBaseCss(s.textColor, s.bgColor, s.fontSize);
    const label = new CSS2DObject(div);
    label.position.copy(position);
    label.userData._isMeasurement = true;
    return label;
}

// --- Public API ---

/**
 * Initialize the measurement system.
 * @param {THREE.Scene} scene
 */
export function initMeasurement(scene) {
    _scene = scene;
}

/**
 * Returns true when measurement mode is active.
 */
export function isMeasureActive() {
    return _active;
}

/**
 * Enable / disable measurement mode.
 */
export function setMeasureActive(val) {
    _active = val;
    if (!val) {
        // Cancel any pending first-click
        if (_pendingMarker) {
            const pendingParent = _pendingOwner || _scene;
            if (pendingParent) pendingParent.remove(_pendingMarker);
            _pendingMarker.geometry.dispose();
            _pendingMarker.material.dispose();
            _pendingMarker = null;
        }
        _pendingPoint = null;
        _pendingOwner = null;
        _hidePreview();
    }
}

/**
 * Handle a click-point from raycaster intersection.
 * First call sets point 1, second call completes the measurement.
 * @param {THREE.Vector3} point – world-space intersection point
 * @param {THREE.Object3D} ownerObject – object to parent measurement visuals to (resolved via CAD/Detailed selection)
 * @param {Function} renderFn – callback to trigger a render
 */
export function addMeasurePoint(point, ownerObject, renderFn) {
    if (!_active || !_scene) return;
    const owner = ownerObject || _scene;

    if (!_pendingPoint) {
        // --- First point ---
        _pendingOwner = owner;
        _pendingPoint = point.clone();
        // Convert to owner local space
        owner.updateWorldMatrix(true, false);
        const localP = owner.worldToLocal(point.clone());
        _pendingMarker = _createMarker(localP);
        owner.add(_pendingMarker);
        if (renderFn) renderFn();
    } else {
        // --- Second point → complete measurement ---
        // Use owner from first click
        const owner1 = _pendingOwner || _scene;
        owner1.updateWorldMatrix(true, false);
        const p1world = _pendingPoint;
        const p2world = point.clone();
        const dist = p1world.distanceTo(p2world);

        // Convert both points to owner1 local space
        const p1 = owner1.worldToLocal(p1world.clone());
        const p2 = owner1.worldToLocal(p2world.clone());

        const marker1 = _pendingMarker;
        const marker2 = _createMarker(p2);
        const line = _createLine(p1, p2);
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const dx = Math.abs(p2world.x - p1world.x);
        const dy = Math.abs(p2world.y - p1world.y);
        const dz = Math.abs(p2world.z - p1world.z);
        const dXY = Math.sqrt(dx * dx + dy * dy);
        const dXZ = Math.sqrt(dx * dx + dz * dz);
        const dYZ = Math.sqrt(dy * dy + dz * dz);
        const labelText = _buildDistanceLabelText(dist, p1world, p2world);
        const labelDim = getDefaultMeasurementLabelDim();
        const meas = { line: null, label: null, marker1, marker2, p1, p2, distance: dist, ownerObject: owner1 };
        _initMeasurementLabelFields(meas, 'distance');
        _initMeasurementLabelDim(meas, labelDim, null);
        const labelStyle = _getMeasurementLabelStyle(meas, 'distance');
        const label = _createMeasurementLabel(labelText, midPoint, labelStyle, 'distance', labelDim, meas);

        owner1.add(marker2);
        owner1.add(line);
        owner1.add(label);
        meas.line = line;
        meas.label = label;
        _finalizeMeasurementLabel(meas, 'distance');
        _measurements.push(meas);

        // Store measurement data in ownerObject.userData for GLB export
        if (!owner1.userData.measurements) owner1.userData.measurements = [];
        owner1.userData.measurements.push({
            type: 'distance',
            p1: { x: p1.x, y: p1.y, z: p1.z },
            p2: { x: p2.x, y: p2.y, z: p2.z },
            distance: dist,
            labelPos: { x: midPoint.x, y: midPoint.y, z: midPoint.z },
            ..._measurementLabelStyleUserData(meas),
            ..._measurementLabelDimUserData(meas),
        });

        // Reset pending state and hide preview
        _pendingPoint = null;
        _pendingMarker = null;
        _pendingOwner = null;
        _hidePreview();
        if (renderFn) renderFn();
        if (_onMeasureSessionComplete) _onMeasureSessionComplete();
    }
}

/**
 * Remove all measurements from the scene.
 * @param {Function} renderFn – callback to trigger a render
 */
export function clearMeasurements(renderFn) {
    if (!_scene) return;

    // Remove pending marker
    if (_pendingMarker) {
        const pendingParent = _pendingOwner || _scene;
        pendingParent.remove(_pendingMarker);
        _pendingMarker.geometry.dispose();
        _pendingMarker.material.dispose();
        _pendingMarker = null;
    }
    _pendingPoint = null;
    _pendingOwner = null;

    // Remove completed measurements
    for (const m of _measurements) {
        _removeLeaderLine(m);
        const owner = m.ownerObject || _scene;
        owner.remove(m.line);
        owner.remove(m.label);
        owner.remove(m.marker1);
        owner.remove(m.marker2);
        m.line.geometry.dispose();
        m.line.material.dispose();
        m.marker1.geometry.dispose();
        m.marker1.material.dispose();
        m.marker2.geometry.dispose();
        m.marker2.material.dispose();
        // Clean up userData
        if (owner.userData.measurements) {
            owner.userData.measurements = owner.userData.measurements.filter(d => d.type !== 'distance');
            if (owner.userData.measurements.length === 0) delete owner.userData.measurements;
        }
    }
    _measurements = [];

    // Also clear angle measurements
    _cancelAnglePending();
    for (const m of _angleMeasurements) {
        _removeLeaderLine(m);
        const owner = m.ownerObject || _scene;
        owner.remove(m.line1);
        owner.remove(m.line2);
        owner.remove(m.midLine);
        owner.remove(m.label);
        m.line1.geometry.dispose();
        m.line1.material.dispose();
        m.line2.geometry.dispose();
        m.line2.material.dispose();
        m.midLine.geometry.dispose();
        m.midLine.material.dispose();
        for (const mk of m.markers) {
            owner.remove(mk);
            mk.geometry.dispose();
            mk.material.dispose();
        }
        // Clean up userData
        if (owner.userData.measurements) {
            owner.userData.measurements = owner.userData.measurements.filter(d => d.type !== 'angle');
            if (owner.userData.measurements.length === 0) delete owner.userData.measurements;
        }
    }
    _angleMeasurements = [];

    // Also clear CAD dim measurements
    _cadCancelAll();
    for (const m of _cadDimMeasurements) _removeSingleCadDim(m);
    _cadDimMeasurements = [];

    if (renderFn) renderFn();
}

/**
 * Get count of measurements.
 */
export function getMeasurementCount() {
    return _measurements.length;
}

/**
 * Remove all measurements and angle measurements whose ownerObject is `root` or a descendant of it.
 * Cleans up CSS2D label DOM elements, disposes geometry/material, updates internal arrays.
 */
export function removeMeasurementsForOwner(root) {
    if (!root) return;
    const owned = new Set();
    root.traverse(obj => owned.add(obj));

    for (const m of _measurements.filter(m => owned.has(m.ownerObject))) {
        _removeSingleMeasurement(m, 'distance');
    }
    for (const m of _angleMeasurements.filter(m => owned.has(m.ownerObject))) {
        _removeSingleMeasurement(m, 'angle');
    }
    for (const m of _cadDimMeasurements.filter(m => owned.has(m.ownerObject))) {
        _removeSingleMeasurement(m, 'cadDim');
    }

    // Clear selected dim if it was one of the removed ones
    if (_selectedDim && owned.has(_selectedDim.ownerObject)) {
        _selectedDim = null;
        _selectedDimType = null;
    }
}

export function setMeasurementsVisible(visible) {
    for (const m of _measurements) {
        m.line.visible = visible;
        m.label.visible = visible;
        m.marker1.visible = visible;
        m.marker2.visible = visible;
        if (m.leaderLine) m.leaderLine.visible = visible;
    }
    for (const m of _angleMeasurements) {
        m.line1.visible = visible;
        m.line2.visible = visible;
        m.midLine.visible = visible;
        m.label.visible = visible;
        for (const mk of m.markers) mk.visible = visible;
        if (m.leaderLine) m.leaderLine.visible = visible;
    }
    for (const m of _cadDimMeasurements) {
        m.markerP1.visible = visible;
        m.markerP2.visible = visible;
        m.markerFoot1.visible = visible;
        m.markerFoot2.visible = visible;
        m.extLine1.visible = visible;
        m.extLine2.visible = visible;
        m.dimLine.visible = visible;
        m.label.visible = visible;
        if (m.leaderLine) m.leaderLine.visible = visible;
    }
}

/**
 * Enable / disable depth testing for all measurement markers and lines.
 * enabled=false → vždy viditelné (přes model), enabled=true → skryté za modelem.
 */
export function setMeasurementDepthTest(enabled) {
    _depthTestEnabled = enabled;
    const ro = enabled ? 0 : 999;
    const roLeader = enabled ? 0 : 998;
    for (const m of _measurements) {
        m.marker1.material.depthTest = enabled; m.marker1.renderOrder = ro;
        m.marker2.material.depthTest = enabled; m.marker2.renderOrder = ro;
        m.line.material.depthTest = enabled; m.line.renderOrder = ro;
        if (m.leaderLine) { m.leaderLine.material.depthTest = enabled; m.leaderLine.renderOrder = roLeader; }
    }
    for (const m of _angleMeasurements) {
        for (const mk of m.markers) { mk.material.depthTest = enabled; mk.renderOrder = ro; }
        m.line1.material.depthTest = enabled; m.line1.renderOrder = ro;
        m.line2.material.depthTest = enabled; m.line2.renderOrder = ro;
        m.midLine.material.depthTest = enabled; m.midLine.renderOrder = ro;
        if (m.leaderLine) { m.leaderLine.material.depthTest = enabled; m.leaderLine.renderOrder = roLeader; }
    }
    for (const m of _cadDimMeasurements) {
        const ro2 = enabled ? 0 : 999;
        m.markerP1.material.depthTest = enabled; m.markerP1.renderOrder = ro2;
        m.markerP2.material.depthTest = enabled; m.markerP2.renderOrder = ro2;
        m.markerFoot1.material.depthTest = enabled; m.markerFoot1.renderOrder = ro2;
        m.markerFoot2.material.depthTest = enabled; m.markerFoot2.renderOrder = ro2;
        m.extLine1.material.depthTest = enabled; m.extLine1.renderOrder = ro2;
        m.extLine2.material.depthTest = enabled; m.extLine2.renderOrder = ro2;
        m.dimLine.material.depthTest = enabled; m.dimLine.renderOrder = ro2;
        if (m.leaderLine) { m.leaderLine.material.depthTest = enabled; m.leaderLine.renderOrder = roLeader; }
    }
}

// --- Hover preview ---

function _hidePreview() {
    if (_previewMarker && _scene) {
        _scene.remove(_previewMarker);
        _previewMarker.geometry.dispose();
        _previewMarker.material.dispose();
        _previewMarker = null;
    }
    if (_previewLine && _scene) {
        _scene.remove(_previewLine);
        _previewLine.geometry.dispose();
        _previewLine.material.dispose();
        _previewLine = null;
    }
}

/**
 * Update the hover preview marker on the surface.
 * Call from render loop when measure mode is active.
 * @param {THREE.Vector3|null} point – world-space intersection point under cursor, or null if none
 */
export function updateMeasurePreview(point) {
    if (!_active || !_scene) {
        _hidePreview();
        return;
    }

    if (!point) {
        _hidePreview();
        return;
    }

    // Show / move preview marker
    if (!_previewMarker) {
        const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
        const mat = new THREE.MeshBasicMaterial({ color: _lighterColorHex(_distanceMarkerDefaults.markerColor), depthTest: false, transparent: true, opacity: 0.7 });
        _previewMarker = new THREE.Mesh(geo, mat);
        _previewMarker.renderOrder = 999;
        _previewMarker.userData._isMeasurement = true;
        _scene.add(_previewMarker);
    }
    _previewMarker.position.copy(point);

    // Show / update dashed line from pending point to preview
    if (_pendingPoint) {
        if (_previewLine) {
            _scene.remove(_previewLine);
            _previewLine.geometry.dispose();
            _previewLine.material.dispose();
        }
        const geo = new THREE.BufferGeometry().setFromPoints([_pendingPoint, point]);
        const mat = new THREE.LineDashedMaterial({ color: _distanceMarkerDefaults.markerColor, dashSize: 4, gapSize: 3, depthTest: false });
        _previewLine = new THREE.Line(geo, mat);
        _previewLine.computeLineDistances();
        _previewLine.renderOrder = 999;
        _previewLine.userData._isMeasurement = true;
        _scene.add(_previewLine);
    } else if (_previewLine) {
        _scene.remove(_previewLine);
        _previewLine.geometry.dispose();
        _previewLine.material.dispose();
        _previewLine = null;
    }
}

/**
 * Scale all measurement markers so they appear at a constant screen size
 * regardless of camera zoom / distance.
 * Call once per frame from the render loop.
 * @param {THREE.Camera} camera
 */
export function updateMarkerScales(camera) {
    if (!camera) return;

    const measMarkers = [];
    for (const m of _measurements) {
        measMarkers.push(m.marker1, m.marker2);
    }
    if (_pendingMarker) measMarkers.push(_pendingMarker);
    if (_previewMarker) measMarkers.push(_previewMarker);

    for (const m of _angleMeasurements) {
        measMarkers.push(...m.markers);
    }
    measMarkers.push(..._angleMarkers);

    const cadMarkers = [];
    for (const m of _cadDimMeasurements) {
        cadMarkers.push(m.markerP1, m.markerP2, m.markerFoot1, m.markerFoot2);
    }
    if (_cadPendingMarker) cadMarkers.push(_cadPendingMarker);
    if (_cadHoverMarker) cadMarkers.push(_cadHoverMarker);
    if (_cadP2FootMarker1) cadMarkers.push(_cadP2FootMarker1);
    if (_cadP2FootMarker2) cadMarkers.push(_cadP2FootMarker2);

    _scaleMarkerList(measMarkers, camera, _measurementMarkerSettings);
    _scaleMarkerList(cadMarkers, camera, _dimMarkerSettings);
}

function _scaleMarkerList(markers, camera, settings) {
    if (markers.length === 0) return;

    const worldPos = new THREE.Vector3();
    const parentWorldScale = new THREE.Vector3();
    for (const marker of markers) {
        if (!marker) continue;
        let scale;
        if (settings.fixedSize) {
            marker.getWorldPosition(worldPos);
            const dist = camera.position.distanceTo(worldPos);
            if (camera.isPerspectiveCamera) {
                const vFov = THREE.MathUtils.degToRad(camera.fov);
                scale = (dist * Math.tan(vFov * 0.5) * 2) / window.innerHeight * settings.fixedScreenPx;
            } else {
                const viewHeight = (camera.top - camera.bottom) / camera.zoom;
                scale = viewHeight / window.innerHeight * settings.fixedScreenPx;
            }
        } else {
            scale = settings.worldSize;
        }
        if (marker.parent) {
            marker.parent.getWorldScale(parentWorldScale);
            marker.scale.set(scale / parentWorldScale.x, scale / parentWorldScale.y, scale / parentWorldScale.z);
        } else {
            marker.scale.setScalar(scale);
        }
    }
}

// ===================== Angle Measurement =====================

function _createAngleMarker(position) {
    const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: _angleMarkerDefaults.markerColor, depthTest: _depthTestEnabled });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = _depthTestEnabled ? 0 : 999;
    mesh.position.copy(position);
    mesh.userData._isMeasurement = true;
    return mesh;
}

function _createAngleLine(p1, p2) {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const mat = new THREE.LineBasicMaterial({ color: _angleMarkerDefaults.markerColor, depthTest: _depthTestEnabled });
    const line = new THREE.Line(geo, mat);
    line.renderOrder = _depthTestEnabled ? 0 : 999;
    line.userData._isMeasurement = true;
    return line;
}

function _createAngleLabel(text, position, style) {
    const s = style || _angleLabelDefaults;
    const div = document.createElement('div');
    div.className = 'measurement-label';
    div.innerHTML = text;
    div.style.cssText = _measurementLabelBaseCss(s.textColor, s.bgColor, s.fontSize);
    const label = new CSS2DObject(div);
    label.position.copy(position);
    label.userData._isMeasurement = true;
    return label;
}

function _angleBetweenProjections(v1, v2, dropAxis) {
    const a = v1.clone();
    const b = v2.clone();
    if (dropAxis === 'z') { a.z = 0; b.z = 0; }      // XY plane
    else if (dropAxis === 'x') { a.x = 0; b.x = 0; }  // YZ plane
    else if (dropAxis === 'y') { a.y = 0; b.y = 0; }   // XZ plane
    const lenA = a.length();
    const lenB = b.length();
    if (lenA < 1e-10 || lenB < 1e-10) return null; // line is perpendicular to this plane
    const dot = a.dot(b) / (lenA * lenB);
    const clamped = Math.max(-1, Math.min(1, dot));
    return THREE.MathUtils.radToDeg(Math.acos(clamped));
}

function _hideAnglePreview() {
    if (_anglePreviewLine && _scene) {
        _scene.remove(_anglePreviewLine);
        _anglePreviewLine.geometry.dispose();
        _anglePreviewLine.material.dispose();
        _anglePreviewLine = null;
    }
}

function _cancelAnglePending() {
    const owner = _angleOwner || _scene;
    for (const m of _angleMarkers) {
        if (owner) owner.remove(m);
        m.geometry.dispose();
        m.material.dispose();
    }
    _angleMarkers = [];
    if (_angleLine1 && owner) {
        owner.remove(_angleLine1);
        _angleLine1.geometry.dispose();
        _angleLine1.material.dispose();
        _angleLine1 = null;
    }
    _anglePoints = [];
    _angleStep = 0;
    _angleOwner = null;
    _hideAnglePreview();
}

export function isAngleActive() {
    return _angleActive;
}

export function setAngleActive(val) {
    _angleActive = val;
    if (!val) {
        _cancelAnglePending();
    }
}

export function addAnglePoint(point, ownerObject, renderFn) {
    if (!_angleActive || !_scene) return;

    const pWorld = point.clone();

    // On first click, set the owner
    if (_angleStep === 0) {
        _angleOwner = ownerObject || _scene;
    }
    const owner = _angleOwner;
    owner.updateWorldMatrix(true, false);

    // Convert world point to owner local space
    const p = owner.worldToLocal(pWorld.clone());
    _anglePoints.push(p);
    const marker = _createAngleMarker(p);
    owner.add(marker);
    _angleMarkers.push(marker);
    _angleStep++;

    if (_angleStep === 2) {
        // Draw first line (in local space)
        _angleLine1 = _createAngleLine(_anglePoints[0], _anglePoints[1]);
        owner.add(_angleLine1);
        _hideAnglePreview();
        if (renderFn) renderFn();
    } else if (_angleStep === 4) {
        // Draw second line and compute angles
        const line2 = _createAngleLine(_anglePoints[2], _anglePoints[3]);
        owner.add(line2);

        // Compute angles in world space for correctness
        const p0w = owner.localToWorld(_anglePoints[0].clone());
        const p1w = owner.localToWorld(_anglePoints[1].clone());
        const p2w = owner.localToWorld(_anglePoints[2].clone());
        const p3w = owner.localToWorld(_anglePoints[3].clone());
        const v1 = new THREE.Vector3().subVectors(p1w, p0w);
        const v2 = new THREE.Vector3().subVectors(p3w, p2w);

        const labelText = _buildAngleLabelText(v1, v2);

        // Place label at midpoint of the two lines' midpoints (local space)
        const mid1 = new THREE.Vector3().addVectors(_anglePoints[0], _anglePoints[1]).multiplyScalar(0.5);
        const mid2 = new THREE.Vector3().addVectors(_anglePoints[2], _anglePoints[3]).multiplyScalar(0.5);
        const labelPos = new THREE.Vector3().addVectors(mid1, mid2).multiplyScalar(0.5);

        // Connecting line between midpoints of the two lines (local space)
        const geoMid = new THREE.BufferGeometry().setFromPoints([mid1, mid2]);
        const matMid = new THREE.LineDashedMaterial({ color: _angleMarkerDefaults.markerColor, dashSize: 3, gapSize: 2, depthTest: _depthTestEnabled, transparent: true, opacity: 0.5 });
        const midLine = new THREE.Line(geoMid, matMid);
        midLine.computeLineDistances();
        midLine.renderOrder = _depthTestEnabled ? 0 : 999;
        midLine.userData._isMeasurement = true;
        owner.add(midLine);

        const labelDim = getDefaultMeasurementLabelDim();
        const meas = {
            line1: _angleLine1, line2, midLine, label: null,
            markers: null,
            points: _anglePoints.slice(),
            ownerObject: owner
        };
        _initMeasurementLabelFields(meas, 'angle');
        _initMeasurementLabelDim(meas, labelDim, null);
        const labelStyle = _getMeasurementLabelStyle(meas, 'angle');
        const label = _createMeasurementLabel(labelText, labelPos, labelStyle, 'angle', labelDim, meas);
        owner.add(label);
        meas.label = label;
        meas.markers = _angleMarkers.slice();
        _finalizeMeasurementLabel(meas, 'angle');
        _angleMeasurements.push(meas);

        // Store measurement data in ownerObject.userData for GLB export
        if (!owner.userData.measurements) owner.userData.measurements = [];
        owner.userData.measurements.push({
            type: 'angle',
            points: _anglePoints.map(pt => ({ x: pt.x, y: pt.y, z: pt.z })),
            labelPos: { x: labelPos.x, y: labelPos.y, z: labelPos.z },
            ..._measurementLabelStyleUserData(meas),
            ..._measurementLabelDimUserData(meas),
        });

        // Reset pending state
        _angleLine1 = null;
        _angleMarkers = [];
        _anglePoints = [];
        _angleStep = 0;
        _angleOwner = null;
        _hideAnglePreview();
        if (renderFn) renderFn();
        if (_onAngleSessionComplete) _onAngleSessionComplete();
    } else {
        _hideAnglePreview();
        if (renderFn) renderFn();
    }
}

export function updateAnglePreview(point) {
    if (!_angleActive || !_scene) {
        _hideAnglePreview();
        return;
    }
    if (!point || _angleStep === 0 || _angleStep === 2) {
        _hideAnglePreview();
        // Show/move preview marker for angle mode
        if (_angleActive && point) {
            if (!_previewMarker) {
                const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
                const mat = new THREE.MeshBasicMaterial({ color: _lighterColorHex(_angleMarkerDefaults.markerColor), depthTest: false, transparent: true, opacity: 0.7 });
                _previewMarker = new THREE.Mesh(geo, mat);
                _previewMarker.renderOrder = 999;
                _previewMarker.userData._isMeasurement = true;
                _scene.add(_previewMarker);
            }
            _previewMarker.position.copy(point);
        }
        return;
    }

    // Show preview marker
    if (!_previewMarker) {
        const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
        const mat = new THREE.MeshBasicMaterial({ color: _lighterColorHex(_angleMarkerDefaults.markerColor), depthTest: false, transparent: true, opacity: 0.7 });
        _previewMarker = new THREE.Mesh(geo, mat);
        _previewMarker.renderOrder = 999;
        _previewMarker.userData._isMeasurement = true;
        _scene.add(_previewMarker);
    }
    _previewMarker.position.copy(point);

    // Show dashed line from last point to cursor
    const lastPoint = _anglePoints[_anglePoints.length - 1];
    if (lastPoint) {
        _hideAnglePreview();
        // lastPoint is in owner local space, point is in world space — convert lastPoint to world
        const owner = _angleOwner || _scene;
        owner.updateWorldMatrix(true, false);
        const lastPointWorld = owner.localToWorld(lastPoint.clone());
        const geo = new THREE.BufferGeometry().setFromPoints([lastPointWorld, point]);
        const mat = new THREE.LineDashedMaterial({ color: _angleMarkerDefaults.markerColor, dashSize: 4, gapSize: 3, depthTest: false });
        _anglePreviewLine = new THREE.Line(geo, mat);
        _anglePreviewLine.computeLineDistances();
        _anglePreviewLine.renderOrder = 999;
        _anglePreviewLine.userData._isMeasurement = true;
        _scene.add(_anglePreviewLine);
    }
}

export function clearAngleMeasurements(renderFn) {
    if (!_scene) return;

    _cancelAnglePending();

    for (const m of _angleMeasurements) {
        _removeLeaderLine(m);
        const owner = m.ownerObject || _scene;
        owner.remove(m.line1);
        owner.remove(m.line2);
        owner.remove(m.midLine);
        owner.remove(m.label);
        m.line1.geometry.dispose();
        m.line1.material.dispose();
        m.line2.geometry.dispose();
        m.line2.material.dispose();
        m.midLine.geometry.dispose();
        m.midLine.material.dispose();
        for (const mk of m.markers) {
            owner.remove(mk);
            mk.geometry.dispose();
            mk.material.dispose();
        }
        // Clean up userData
        if (owner.userData.measurements) {
            owner.userData.measurements = owner.userData.measurements.filter(d => d.type !== 'angle');
            if (owner.userData.measurements.length === 0) delete owner.userData.measurements;
        }
    }
    _angleMeasurements = [];
    if (renderFn) renderFn();
}

export function getAngleMarkers() {
    const markers = [];
    for (const m of _angleMeasurements) {
        markers.push(...m.markers);
    }
    markers.push(..._angleMarkers);
    return markers;
}

// ===================== Select Dimension Mode =====================

function _deselectDim() {
    if (_selectedDim && _selectedDim.label) {
        _selectedDim.label.element.style.border = 'none';
    }
    _selectedDim = null;
    _selectedDimType = null;
}

function _selectDim(meas, type) {
    _deselectDim();
    _selectedDim = meas;
    _selectedDimType = type;
    meas.label.element.style.border = SELECTED_BORDER;
}

function _setLabelPointerEvents(enabled) {
    const pe = enabled ? 'auto' : 'none';
    for (const m of _measurements) {
        m.label.element.style.pointerEvents = pe;
    }
    for (const m of _angleMeasurements) {
        m.label.element.style.pointerEvents = pe;
    }
    for (const m of _cadDimMeasurements) {
        m.label.element.style.pointerEvents = pe;
    }
    for (const a of getAnnotations()) {
        a.label.element.style.pointerEvents = pe;
    }
    for (const a of getAnnotations3d()) {
        a.label.element.style.pointerEvents = pe;
    }
    for (const m of getCadDim3dMeasurements()) {
        if (m.label && m.label.element) m.label.element.style.pointerEvents = pe;
    }
}

function _onLabelMouseDown(e) {
    if (!_selectDimActive) return;
    e.stopPropagation();

    // Find which measurement this label belongs to
    const el = e.currentTarget;
    let found = null, foundType = null;
    for (const m of _measurements) {
        if (m.label.element === el) { found = m; foundType = 'distance'; break; }
    }
    if (!found) {
        for (const m of _angleMeasurements) {
            if (m.label.element === el) { found = m; foundType = 'angle'; break; }
        }
    }
    if (!found) {
        for (const m of _cadDimMeasurements) {
            if (m.label.element === el) { found = m; foundType = 'cadDim'; break; }
        }
    }
    if (!found) {
        for (const a of getAnnotations()) {
            if (a.label.element === el) { found = a; foundType = 'annotation'; break; }
        }
    }
    if (!found) {
        for (const a of getAnnotations3d()) {
            if (a.label.element === el) { found = a; foundType = 'annotation3d'; break; }
        }
    }
    if (!found) {
        for (const m of getCadDim3dMeasurements()) {
            if (m.label && m.label.element === el) { found = m; foundType = 'cadDim3d'; break; }
        }
    }
    if (!found) return;

    _selectDim(found, foundType);

    if (foundType === 'cadDim') {
        if (found.dragMode === 1) {
            // Label-only drag: anchor is midpoint of the dim line (foot1–foot2)
            found._labelAnchor = new THREE.Vector3().addVectors(found.foot1, found.foot2).multiplyScalar(0.5);
        } else {
            // dragMode 0: whole dimension drag – compute grab offset to prevent jump
            const owner = found.ownerObject || _scene;
            owner.updateWorldMatrix(true, false);
            const p1World = owner.localToWorld(found.p1.clone());
            const p2World = owner.localToWorld(found.p2.clone());
            const mid = new THREE.Vector3().addVectors(p1World, p2World).multiplyScalar(0.5);
            const cameraDir = new THREE.Vector3();
            _currentCamera.getWorldDirection(cameraDir);
            const grabPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(cameraDir, mid);
            const grabNDC = new THREE.Vector2(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1
            );
            _cadTempRaycaster.setFromCamera(grabNDC, _currentCamera);
            const initOnPlane = new THREE.Vector3();
            if (_cadTempRaycaster.ray.intersectPlane(grabPlane, initOnPlane)) {
                const foot1World = owner.localToWorld(found.foot1.clone());
                found._cadDragOffset = initOnPlane.clone().sub(foot1World);
            } else {
                found._cadDragOffset = new THREE.Vector3();
            }
        }
        _isDraggingLabel = true;
        _dragStartMouse.set(e.clientX, e.clientY);
        _dragStartPos.copy(found.label.position);
        if (_orbitControls) _orbitControls.enabled = false;
        if (_renderFn) _renderFn();
        return;
    }

    if (foundType === 'cadDim3d') {
        if (found.dragMode === 1) {
            // Label-only drag
            found._labelAnchor = new THREE.Vector3().addVectors(found.foot1, found.foot2).multiplyScalar(0.5);
        } else {
            // dragMode 0: whole dimension drag – compute grab offset to prevent jump
            const owner = found.ownerObject || _scene;
            owner.updateWorldMatrix(true, false);
            const p1World = owner.localToWorld(found.p1.clone());
            const p2World = owner.localToWorld(found.p2.clone());
            const mid = new THREE.Vector3().addVectors(p1World, p2World).multiplyScalar(0.5);
            const cameraDir = new THREE.Vector3();
            _currentCamera.getWorldDirection(cameraDir);
            const grabPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(cameraDir, mid);
            const grabNDC = new THREE.Vector2(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1
            );
            _cadTempRaycaster.setFromCamera(grabNDC, _currentCamera);
            const initOnPlane = new THREE.Vector3();
            if (_cadTempRaycaster.ray.intersectPlane(grabPlane, initOnPlane)) {
                const foot1World = owner.localToWorld(found.foot1.clone());
                found._cadDragOffset = initOnPlane.clone().sub(foot1World);
            } else {
                found._cadDragOffset = new THREE.Vector3();
            }
        }
        _isDraggingLabel = true;
        _dragStartMouse.set(e.clientX, e.clientY);
        _dragStartPos.copy(found.label.position);
        if (_orbitControls) _orbitControls.enabled = false;
        if (_renderFn) _renderFn();
        return;
    }

    // Compute the anchor point (midpoint in local space of the owner)
    let anchor;
    if (foundType === 'distance') {
        anchor = new THREE.Vector3().addVectors(found.p1, found.p2).multiplyScalar(0.5);
    } else if (foundType === 'angle') {
        const mid1 = new THREE.Vector3().addVectors(found.points[0], found.points[1]).multiplyScalar(0.5);
        const mid2 = new THREE.Vector3().addVectors(found.points[2], found.points[3]).multiplyScalar(0.5);
        anchor = new THREE.Vector3().addVectors(mid1, mid2).multiplyScalar(0.5);
    } else if (foundType === 'annotation') {
        anchor = found.leaderLines.length > 0 ? found.leaderLines[0].anchorLocal.clone() : found.label.position.clone();
    } else if (foundType === 'annotation3d') {
        anchor = found.leaderLines.length > 0 ? found.leaderLines[0].anchorLocal.clone() : found.label.position.clone();
    }
    found._labelAnchor = anchor;

    // Start drag
    _isDraggingLabel = true;
    _dragStartMouse.set(e.clientX, e.clientY);
    _dragStartPos.copy(found.label.position);
    if (_orbitControls) _orbitControls.enabled = false;

    if (_renderFn) _renderFn();
}

// Labels (CSS2DObject/CSS3DObject) live in overlay DOM trees that are siblings of the
// WebGL canvas, not its descendants. OrbitControls listens for 'pointerdown'/'wheel'
// directly on the canvas, so those events never arrive while the cursor is over a label
// with pointer-events enabled. Forward them manually so camera navigation (middle-button
// dolly, right-button pan, wheel zoom) keeps working while hovering a label.
function _forwardEventToOrbitControls(e) {
    if (!_orbitControls || !_orbitControls.domElement) return;
    e.preventDefault();
    const EventCtor = e.type === 'wheel' ? WheelEvent : PointerEvent;
    _orbitControls.domElement.dispatchEvent(new EventCtor(e.type, e));
}

function _onLabelPointerDown(e) {
    if (!_selectDimActive || e.button === 0) return; // left button: handled by _onLabelMouseDown
    _forwardEventToOrbitControls(e);
}

function _onLabelWheel(e) {
    if (!_selectDimActive) return;
    _forwardEventToOrbitControls(e);
}

function _addLabelInteractionListeners(el) {
    el.removeEventListener('mousedown', _onLabelMouseDown);
    el.addEventListener('mousedown', _onLabelMouseDown);
    el.removeEventListener('pointerdown', _onLabelPointerDown);
    el.addEventListener('pointerdown', _onLabelPointerDown);
    el.removeEventListener('wheel', _onLabelWheel);
    el.addEventListener('wheel', _onLabelWheel, { passive: false });
}

function _removeLabelInteractionListeners(el) {
    el.removeEventListener('mousedown', _onLabelMouseDown);
    el.removeEventListener('pointerdown', _onLabelPointerDown);
    el.removeEventListener('wheel', _onLabelWheel);
}

function _onDocumentMouseMove(e) {
    if (!_isDraggingLabel || !_selectedDim || !_currentCamera) return;

    // --- CSS3D CAD dimension: dragMode 0 = rebuild whole dim ---
    if (_selectedDimType === 'cadDim3d' && !(_selectedDim.dragMode)) {
        const mouseNDC = new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
        );
        const meas = _selectedDim;
        const owner = meas.ownerObject || _scene;
        owner.updateWorldMatrix(true, false);
        const p1World = owner.localToWorld(meas.p1.clone());
        const p2World = owner.localToWorld(meas.p2.clone());
        const mid = new THREE.Vector3().addVectors(p1World, p2World).multiplyScalar(0.5);
        const cameraDir = new THREE.Vector3();
        _currentCamera.getWorldDirection(cameraDir);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(cameraDir, mid);
        _cadTempRaycaster.setFromCamera(mouseNDC, _currentCamera);
        const offsetPoint = new THREE.Vector3();
        if (!_cadTempRaycaster.ray.intersectPlane(plane, offsetPoint)) return;
        if (meas._cadDragOffset) offsetPoint.sub(meas._cadDragOffset);
        rebuildCadDim3dVisuals(meas, p1World, p2World, offsetPoint, true);
        if (_renderFn) _renderFn();
        return;
    }

    // --- CAD dimension: drag repositions the whole dimension (dragMode 0 only) ---
    if (_selectedDimType === 'cadDim' && !(_selectedDim.dragMode)) {
        const mouseNDC = new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
        );
        const meas = _selectedDim;
        const owner = meas.ownerObject || _scene;
        owner.updateWorldMatrix(true, false);
        const p1World = owner.localToWorld(meas.p1.clone());
        const p2World = owner.localToWorld(meas.p2.clone());
        const mid = new THREE.Vector3().addVectors(p1World, p2World).multiplyScalar(0.5);
        const cameraDir = new THREE.Vector3();
        _currentCamera.getWorldDirection(cameraDir);
        const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(cameraDir, mid);
        _cadTempRaycaster.setFromCamera(mouseNDC, _currentCamera);
        const offsetPoint = new THREE.Vector3();
        if (!_cadTempRaycaster.ray.intersectPlane(plane, offsetPoint)) return;
        // Apply grab offset to prevent jump when drag starts
        if (meas._cadDragOffset) offsetPoint.sub(meas._cadDragOffset);
        _rebuildCadDimVisuals(meas, p1World, p2World, offsetPoint);
        if (_renderFn) _renderFn();
        return;
    }

    const dx = e.clientX - _dragStartMouse.x;
    const dy = e.clientY - _dragStartMouse.y;

    // Convert label start position from local to world for NDC projection
    const owner = _selectedDim.ownerObject || _scene;
    owner.updateWorldMatrix(true, false);
    const labelWorldPos = owner.localToWorld(_dragStartPos.clone());
    const labelNDC = labelWorldPos.clone().project(_currentCamera);

    const ndcDx = (dx / window.innerWidth) * 2;
    const ndcDy = -(dy / window.innerHeight) * 2;

    const newNDC = new THREE.Vector3(labelNDC.x + ndcDx, labelNDC.y + ndcDy, labelNDC.z);
    const newWorldPos = newNDC.unproject(_currentCamera);

    // Convert back to owner local space
    const newLocalPos = owner.worldToLocal(newWorldPos);
    _selectedDim.label.position.copy(newLocalPos);

    // Update leader line from anchor to label (both in local space)
    if (_selectedDimType === 'annotation') {
        updateAnnotationLeaderLine(_selectedDim, newLocalPos);
    } else if (_selectedDimType === 'annotation3d') {
        updateAnnotation3dLeaderLine(_selectedDim, newLocalPos);
    } else if (_selectedDimType === 'cadDim3d') {
        updateCadDim3dLeaderLine(_selectedDim, newLocalPos);
    } else {
        _updateLeaderLine(_selectedDim, newLocalPos);
    }

    if (_renderFn) _renderFn();
}

/**
 * Rebuild all visual objects of a placed CAD dimension in-place with a new offsetPoint.
 * p1World and p2World are the measured points in world space.
 */
function _rebuildCadDimVisuals(meas, p1World, p2World, offsetPoint) {
    const owner = meas.ownerObject || _scene;
    // Compute label offset relative to old feet midpoint (preserve user-set offset)
    const oldMid = new THREE.Vector3().addVectors(meas.foot1, meas.foot2).multiplyScalar(0.5);
    const labelOffset = meas.label ? meas.label.position.clone().sub(oldMid) : new THREE.Vector3();
    owner.updateWorldMatrix(true, false);
    const axis = meas.axis;

    // Work in owner local space — derive axis direction from stored feet.
    // normalize(foot2-foot1) = R⁻¹·axisWorld, which correctly handles any
    // object rotation at the time the dimension was created.
    const p1Local     = owner.worldToLocal(p1World.clone());
    const p2Local     = owner.worldToLocal(p2World.clone());
    const offsetLocal = owner.worldToLocal(offsetPoint.clone());
    const _axisDirLocal = new THREE.Vector3().subVectors(meas.foot2, meas.foot1);
    if (_axisDirLocal.length() < 1e-10) {
        if (axis === 'x') _axisDirLocal.set(1, 0, 0);
        else if (axis === 'y') _axisDirLocal.set(0, 1, 0);
        else _axisDirLocal.set(0, 0, 1);
    }
    const _axisHat = _axisDirLocal.normalize();
    const f1 = offsetLocal.clone().addScaledVector(_axisHat, p1Local.clone().sub(offsetLocal).dot(_axisHat));
    const f2 = offsetLocal.clone().addScaledVector(_axisHat, p2Local.clone().sub(offsetLocal).dot(_axisHat));
    const value = f1.distanceTo(f2);

    // Dispose and remove old objects (all except markerP1 and markerP2)
    for (const obj of [meas.markerFoot1, meas.markerFoot2, meas.extLine1, meas.extLine2, meas.dimLine]) {
        if (!obj) continue;
        owner.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }
    // During a drag, keep the label DOM element alive to avoid cancelling touch gestures
    if (!_isDraggingLabel && meas.label) {
        owner.remove(meas.label);
        if (meas.label.element) meas.label.element.remove();
    }

    // Rebuild
    const markerFoot1 = _cadMakeMarker(f1, _dimMarkerColor, false);
    const markerFoot2 = _cadMakeMarker(f2, _dimMarkerColor, false);
    const extLine1    = _cadMakeLine(meas.p1, f1, _dimMarkerColor, false);
    const extLine2    = _cadMakeLine(meas.p2, f2, _dimMarkerColor, false);
    const dimLine     = _cadMakeLine(f1, f2, _dimMarkerColor, false);
    // Preserve label offset relative to new feet midpoint
    const newMid  = new THREE.Vector3().addVectors(f1, f2).multiplyScalar(0.5);
    const labelPos = newMid.clone().add(labelOffset);
    // Temporarily set foot1/foot2 and value so _cadDimGetLabelText can use them
    meas.foot1 = f1; meas.foot2 = f2; meas.value = value;

    // During an active drag: update the label in-place so the DOM element is NOT removed.
    const label = meas.label;
    label.position.copy(labelPos);

    owner.add(markerFoot1); owner.add(markerFoot2);
    owner.add(extLine1);    owner.add(extLine2);
    owner.add(dimLine);

    meas.markerFoot1 = markerFoot1;
    meas.markerFoot2 = markerFoot2;
    meas.extLine1 = extLine1;
    meas.extLine2 = extLine2;
    meas.dimLine  = dimLine;
    meas.label    = label;

    // Update leader line anchor to new feet midpoint (keep it visible if offset exists)
    if (meas._labelAnchor) {
        meas._labelAnchor = newMid.clone();
        _updateLeaderLine(meas, labelPos);
    }

    // Restore selection highlight and pointer-events
    if (_selectedDim === meas) {
        label.element.style.border = SELECTED_BORDER;
    }
    if (_selectDimActive) {
        label.element.style.pointerEvents = 'auto';
        _addLabelInteractionListeners(label.element);
    }
}

function _updateLeaderLine(meas, labelPos) {
    if (!meas._labelAnchor) return;
    const owner = meas.ownerObject || _scene;
    // Remove old leader line
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
    meas.leaderLine.userData._isMeasurement = true;
    owner.add(meas.leaderLine);
}

function _removeLeaderLine(meas) {
    if (meas.leaderLine) {
        const owner = meas.ownerObject || _scene;
        if (owner) owner.remove(meas.leaderLine);
        meas.leaderLine.geometry.dispose();
        meas.leaderLine.material.dispose();
        meas.leaderLine = null;
    }
}

function _onDocumentMouseUp(e) {
    if (_isDraggingLabel) {
        _isDraggingLabel = false;
        if (_orbitControls) _orbitControls.enabled = true;
        // Sync final position back to userData for GLB export
        if (_selectedDim) {
            if (_selectedDimType === 'annotation') {
                syncAnnotationLabelPos(_selectedDim);
            } else if (_selectedDimType === 'annotation3d') {
                syncAnnotation3dLabelPos(_selectedDim);
            } else if (_selectedDimType === 'cadDim') {
                const meas = _selectedDim;
                const owner = meas.ownerObject || _scene;
                if (owner && owner.userData && Array.isArray(owner.userData.measurements)) {
                    const rec = owner.userData.measurements.find(d => d.type === 'cadDim'
                        && Math.abs(d.p1.x - meas.p1.x) < 1e-6
                        && Math.abs(d.p1.y - meas.p1.y) < 1e-6
                        && Math.abs(d.p1.z - meas.p1.z) < 1e-6);
                    if (rec) {
                        rec.foot1    = { x: meas.foot1.x, y: meas.foot1.y, z: meas.foot1.z };
                        rec.foot2    = { x: meas.foot2.x, y: meas.foot2.y, z: meas.foot2.z };
                        rec.value    = meas.value;
                        const lp = meas.label.position;
                        rec.labelPos = { x: lp.x, y: lp.y, z: lp.z };
                    }
                }
            } else if (_selectedDimType === 'cadDim3d') {
                syncCadDim3dLabelPos(_selectedDim);
            } else {
                const owner = _selectedDim.ownerObject || _scene;
                const pos = _selectedDim.label.position;
                if (owner && owner.userData && Array.isArray(owner.userData.measurements)) {
                    const type = _selectedDimType;
                    const rec = owner.userData.measurements.find(d => {
                        if (d.type !== type) return false;
                        if (type === 'distance') return Math.abs(d.p1.x - _selectedDim.p1.x) < 1e-6;
                        if (type === 'angle') return Math.abs(d.points[0].x - _selectedDim.points[0].x) < 1e-6;
                        return false;
                    });
                    if (rec) rec.labelPos = { x: pos.x, y: pos.y, z: pos.z };
                }
            }
        }
    }
}

function _onCanvasClick(e) {
    if (!_selectDimActive) return;
    // If click is not on a label, deselect
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (el && (el.closest('.measurement-label') || el.closest('.annotation-label'))) return; // handled by label mousedown
    if (el && el.closest('.ctx-menu')) return; // context menu – keep selection alive
    _deselectDim();
    if (_renderFn) _renderFn();
}

function _removeSingleMeasurement(meas, type) {
    if (!_scene) return;
    _removeLeaderLine(meas);
    const owner = meas.ownerObject || _scene;
    if (type === 'distance') {
        if (meas.label && meas.label.element) meas.label.element.remove();
        owner.remove(meas.line);
        owner.remove(meas.label);
        owner.remove(meas.marker1);
        owner.remove(meas.marker2);
        meas.line.geometry.dispose(); meas.line.material.dispose();
        meas.marker1.geometry.dispose(); meas.marker1.material.dispose();
        meas.marker2.geometry.dispose(); meas.marker2.material.dispose();
        const idx = _measurements.indexOf(meas);
        if (idx !== -1) _measurements.splice(idx, 1);
        // Clean up userData
        if (owner.userData.measurements) {
            // Remove the first matching distance entry
            const di = owner.userData.measurements.findIndex(d => d.type === 'distance'
                && Math.abs(d.p1.x - meas.p1.x) < 1e-6 && Math.abs(d.p1.y - meas.p1.y) < 1e-6 && Math.abs(d.p1.z - meas.p1.z) < 1e-6);
            if (di !== -1) owner.userData.measurements.splice(di, 1);
            if (owner.userData.measurements.length === 0) delete owner.userData.measurements;
        }
    } else if (type === 'angle') {
        if (meas.label && meas.label.element) meas.label.element.remove();
        owner.remove(meas.line1);
        owner.remove(meas.line2);
        owner.remove(meas.midLine);
        owner.remove(meas.label);
        meas.line1.geometry.dispose(); meas.line1.material.dispose();
        meas.line2.geometry.dispose(); meas.line2.material.dispose();
        meas.midLine.geometry.dispose(); meas.midLine.material.dispose();
        for (const mk of meas.markers) {
            owner.remove(mk);
            mk.geometry.dispose(); mk.material.dispose();
        }
        const idx = _angleMeasurements.indexOf(meas);
        if (idx !== -1) _angleMeasurements.splice(idx, 1);
        // Clean up userData
        if (owner.userData.measurements) {
            const di = owner.userData.measurements.findIndex(d => d.type === 'angle'
                && Math.abs(d.points[0].x - meas.points[0].x) < 1e-6 && Math.abs(d.points[0].y - meas.points[0].y) < 1e-6);
            if (di !== -1) owner.userData.measurements.splice(di, 1);
            if (owner.userData.measurements.length === 0) delete owner.userData.measurements;
        }
    } else if (type === 'cadDim') {
        _removeSingleCadDim(meas);
        const idx = _cadDimMeasurements.indexOf(meas);
        if (idx !== -1) _cadDimMeasurements.splice(idx, 1);
    } else if (type === 'annotation') {
        deleteAnnotationByRef(meas, null);
    } else if (type === 'annotation3d') {
        deleteAnnotation3dByRef(meas, null);
    } else if (type === 'cadDim3d') {
        deleteCadDim3dByRef(meas);
    }
}

export function initSelectDimension(camera, renderFn, orbitCtrl) {
    _currentCamera = camera;
    _renderFn = renderFn;
    _orbitControls = orbitCtrl;
}

export function updateSelectDimensionCamera(camera) {
    _currentCamera = camera;
}

export function isSelectDimActive() {
    return _selectDimActive;
}

export function hasSelectedDimension() {
    return _selectedDim !== null;
}

export function deselectSelectedDimension() {
    _deselectDim();
}

function _attachLabelMousedownListeners() {
    for (const m of _measurements) {
        if (!m.label?.element) continue;
        _addLabelInteractionListeners(m.label.element);
    }
    for (const m of _angleMeasurements) {
        if (!m.label?.element) continue;
        _addLabelInteractionListeners(m.label.element);
    }
    for (const m of _cadDimMeasurements) {
        if (!m.label?.element) continue;
        _addLabelInteractionListeners(m.label.element);
    }
    for (const a of getAnnotations()) {
        if (!a.label?.element) continue;
        _addLabelInteractionListeners(a.label.element);
    }
    for (const a of getAnnotations3d()) {
        if (!a.label?.element) continue;
        _addLabelInteractionListeners(a.label.element);
    }
    for (const m of getCadDim3dMeasurements()) {
        if (!m.label?.element) continue;
        _addLabelInteractionListeners(m.label.element);
    }
}

function _detachLabelMousedownListeners() {
    for (const m of _measurements) {
        if (m.label?.element) _removeLabelInteractionListeners(m.label.element);
    }
    for (const m of _angleMeasurements) {
        if (m.label?.element) _removeLabelInteractionListeners(m.label.element);
    }
    for (const m of _cadDimMeasurements) {
        if (m.label?.element) _removeLabelInteractionListeners(m.label.element);
    }
    for (const a of getAnnotations()) {
        if (a.label?.element) _removeLabelInteractionListeners(a.label.element);
    }
    for (const a of getAnnotations3d()) {
        if (a.label?.element) _removeLabelInteractionListeners(a.label.element);
    }
    for (const m of getCadDim3dMeasurements()) {
        if (m.label?.element) _removeLabelInteractionListeners(m.label.element);
    }
}

/** Re-apply pointer-events and mousedown handlers after labels are created (e.g. GLB load). */
export function refreshLabelEditListeners() {
    if (!_selectDimActive) return;
    _setLabelPointerEvents(true);
    _attachLabelMousedownListeners();
}

export function setSelectDimActive(val) {
    if (val === _selectDimActive) {
        if (val) refreshLabelEditListeners();
        return;
    }
    _selectDimActive = val;
    _setLabelPointerEvents(val);
    if (!val) {
        _deselectDim();
        _isDraggingLabel = false;
    }
    if (val) {
        document.addEventListener('mousemove', _onDocumentMouseMove);
        document.addEventListener('mouseup', _onDocumentMouseUp);
        window.addEventListener('click', _onCanvasClick, true);
        _attachLabelMousedownListeners();
    } else {
        document.removeEventListener('mousemove', _onDocumentMouseMove);
        document.removeEventListener('mouseup', _onDocumentMouseUp);
        window.removeEventListener('click', _onCanvasClick, true);
        _detachLabelMousedownListeners();
    }
}

export function deleteSelectedDimension(renderFn) {
    if (!_selectedDim) return;
    _removeSingleMeasurement(_selectedDim, _selectedDimType);
    _selectedDim = null;
    _selectedDimType = null;
    if (renderFn) renderFn();
}

/**
 * Attach mousedown (selection) listener to a newly created annotation label,
 * when label edit is active (Navigate). Call after creating an annotation
 * programmatically (e.g. after CSS2D<->CSS3D conversion).
 */
export function registerLabelForSelection(annotation) {
    if (!_selectDimActive || !annotation?.label?.element) return;
    annotation.label.element.style.pointerEvents = 'auto';
    _addLabelInteractionListeners(annotation.label.element);
}

/**
 * Touch equivalents for the select-dim drag system.
 * Call from touch handlers in main.js when label edit is active.
 */
export function selectDimTouchStart(clientX, clientY) {
    if (!_selectDimActive) return false;
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return false;
    const labelEl = el.closest('.measurement-label') || el.closest('.annotation-label');
    if (!labelEl) return false;
    // Synthesise a mousedown-like event on that element
    const synth = { clientX, clientY, currentTarget: labelEl, stopPropagation: () => {} };
    _onLabelMouseDown(synth);
    return true; // consumed
}

export function selectDimTouchMove(clientX, clientY) {
    if (!_isDraggingLabel) return false;
    _onDocumentMouseMove({ clientX, clientY });
    return true;
}

export function selectDimTouchEnd() {
    if (!_isDraggingLabel) return;
    _onDocumentMouseUp({});
}

/**
 * Reconstruct visual measurement objects from userData.measurements stored on scene graph nodes.
 * Call after loading a GLB model. Traverses the given root and rebuilds distance / angle visuals.
 * @param {THREE.Object3D} root – root of the loaded model (gltf.scene)
 */
/**
 * Strip measurement visual objects (_isMeasurement) from a cloned scene graph before GLB export.
 * Keeps userData.measurements intact so measurements can be reconstructed on import.
 * @param {THREE.Object3D} root – cloned root to clean
 */
export function stripMeasurementVisuals(root) {
    if (!root) return;
    const toRemove = [];
    root.traverse(function (child) {
        if (child.userData && child.userData._isMeasurement) {
            toRemove.push(child);
        }
    });
    for (const obj of toRemove) {
        if (obj.parent) obj.parent.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }
}

export function reconstructMeasurements(root) {
    if (!root) return;
    root.traverse(function (node) {
        const data = node.userData && node.userData.measurements;
        if (!Array.isArray(data) || data.length === 0) return;
        node.updateWorldMatrix(true, false);

        for (const rec of data) {
            if (rec.type === 'distance') {
                _reconstructDistance(node, rec);
            } else if (rec.type === 'angle') {
                _reconstructAngle(node, rec);
            } else if (rec.type === 'cadDim') {
                _reconstructCadDim(node, rec);
            }
        }
    });
}

function _reconstructDistance(owner, rec) {
    const p1 = new THREE.Vector3(rec.p1.x, rec.p1.y, rec.p1.z);
    const p2 = new THREE.Vector3(rec.p2.x, rec.p2.y, rec.p2.z);
    const dist = rec.distance;

    const marker1 = _createMarker(p1);
    const marker2 = _createMarker(p2);
    const line = _createLine(p1, p2);

    const labelPos = rec.labelPos
        ? new THREE.Vector3(rec.labelPos.x, rec.labelPos.y, rec.labelPos.z)
        : new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    // Compute deltas in world space for label
    const p1w = owner.localToWorld(p1.clone());
    const p2w = owner.localToWorld(p2.clone());
    const labelText = _buildDistanceLabelText(dist, p1w, p2w);
    const labelStyle = {
        textColor: rec.textColor || _distanceLabelDefaults.textColor,
        bgColor: rec.bgColor || _distanceLabelDefaults.bgColor,
        fontSize: rec.fontSize != null ? rec.fontSize : _distanceLabelDefaults.fontSize,
    };
    const labelDim = rec.labelDim || '2d';
    const meas = { line: null, label: null, marker1, marker2, p1, p2, distance: dist, ownerObject: owner };
    meas._textColor = labelStyle.textColor;
    meas._bgColor = labelStyle.bgColor;
    meas._fontSize = labelStyle.fontSize;
    _initMeasurementLabelDim(meas, labelDim, rec);
    const label = _createMeasurementLabel(labelText, labelPos, labelStyle, 'distance', labelDim, meas);

    owner.add(marker1);
    owner.add(marker2);
    owner.add(line);
    owner.add(label);
    meas.line = line;
    meas.label = label;
    _finalizeMeasurementLabel(meas, 'distance');

    const defaultMid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    // If label was dragged from its default midpoint, restore anchor + leader line
    if (labelPos.distanceTo(defaultMid) > 1e-4) {
        meas._labelAnchor = defaultMid.clone();
        _updateLeaderLine(meas, labelPos);
    }
    _measurements.push(meas);
}

function _reconstructAngle(owner, rec) {
    if (!Array.isArray(rec.points) || rec.points.length !== 4) return;
    const pts = rec.points.map(p => new THREE.Vector3(p.x, p.y, p.z));

    // Markers
    const markers = pts.map(p => {
        const m = _createAngleMarker(p);
        owner.add(m);
        return m;
    });

    // Lines
    const line1 = _createAngleLine(pts[0], pts[1]);
    owner.add(line1);
    const line2 = _createAngleLine(pts[2], pts[3]);
    owner.add(line2);

    // Compute angles in world space
    owner.updateWorldMatrix(true, false);
    const p0w = owner.localToWorld(pts[0].clone());
    const p1w = owner.localToWorld(pts[1].clone());
    const p2w = owner.localToWorld(pts[2].clone());
    const p3w = owner.localToWorld(pts[3].clone());
    const v1 = new THREE.Vector3().subVectors(p1w, p0w);
    const v2 = new THREE.Vector3().subVectors(p3w, p2w);
    const labelText = _buildAngleLabelText(v1, v2);

    // Midpoints and connecting line
    const mid1 = new THREE.Vector3().addVectors(pts[0], pts[1]).multiplyScalar(0.5);
    const mid2 = new THREE.Vector3().addVectors(pts[2], pts[3]).multiplyScalar(0.5);
    const geoMid = new THREE.BufferGeometry().setFromPoints([mid1, mid2]);
    const matMid = new THREE.LineDashedMaterial({ color: _angleMarkerDefaults.markerColor, dashSize: 3, gapSize: 2, depthTest: _depthTestEnabled, transparent: true, opacity: 0.5 });
    const midLine = new THREE.Line(geoMid, matMid);
    midLine.computeLineDistances();
    midLine.renderOrder = _depthTestEnabled ? 0 : 999;
    midLine.userData._isMeasurement = true;
    owner.add(midLine);

    const defaultLabelPos = new THREE.Vector3().addVectors(mid1, mid2).multiplyScalar(0.5);
    const labelPos = rec.labelPos
        ? new THREE.Vector3(rec.labelPos.x, rec.labelPos.y, rec.labelPos.z)
        : defaultLabelPos.clone();
    const labelStyle = {
        textColor: rec.textColor || _angleLabelDefaults.textColor,
        bgColor: rec.bgColor || _angleLabelDefaults.bgColor,
        fontSize: rec.fontSize != null ? rec.fontSize : _angleLabelDefaults.fontSize,
    };
    const labelDim = rec.labelDim || '2d';
    const angleMeas = {
        line1, line2, midLine, label: null,
        markers,
        points: pts,
        ownerObject: owner
    };
    angleMeas._textColor = labelStyle.textColor;
    angleMeas._bgColor = labelStyle.bgColor;
    angleMeas._fontSize = labelStyle.fontSize;
    _initMeasurementLabelDim(angleMeas, labelDim, rec);
    const label = _createMeasurementLabel(labelText, labelPos, labelStyle, 'angle', labelDim, angleMeas);
    owner.add(label);
    angleMeas.label = label;
    _finalizeMeasurementLabel(angleMeas, 'angle');
    // If label was dragged from its default position, restore anchor + leader line
    if (labelPos.distanceTo(defaultLabelPos) > 1e-4) {
        angleMeas._labelAnchor = defaultLabelPos.clone();
        _updateLeaderLine(angleMeas, labelPos);
    }
    _angleMeasurements.push(angleMeas);
}

// ===================== CAD Dimension Measurement =====================
// Two measured points, axis-aligned dimension line with extension lines.
// Phases: 0 = wait p1, 1 = wait p2, 2 = placement mode (mouse positions dim line).
// Right-click in phase 2 cycles the measurement axis (X → Y → Z → X).

const CAD_DIM_COLOR = 0x22aacc;
const CAD_DIM_EXT_COLOR = 0x22aacc;
const CAD_DIM_LABEL_BG = 'rgba(20,60,120,0.9)';

let _cadDimActive = false;
let _cadDimStep = 0;       // 0: wait p1, 1: wait p2, 2: place dim line
let _cadDimP1World = null; // THREE.Vector3 (world space)
let _cadDimP2World = null;
let _cadDimOwner = null;
let _cadDimAxis = 'x';     // 'x' | 'y' | 'z'
let _cadDimMeasurements = [];

// Phase 0-1 preview objects
let _cadHoverMarker = null;
let _cadPendingMarker = null; // sphere at p1 (in owner local space)
let _cadPreviewLine = null;   // dashed preview line p1→cursor (world space)

// Phase 2 preview objects (added to scene in world space)
let _cadP2Ext1 = null;
let _cadP2Ext2 = null;
let _cadP2DimLine = null;
let _cadP2FootMarker1 = null;
let _cadP2FootMarker2 = null;
let _cadP2Label = null;
let _cadP2LastOffsetPoint = null; // most recent computed offset point for placeCadDim

// Reusable raycaster (avoids per-frame allocation)
const _cadTempRaycaster = new THREE.Raycaster();

// --- CAD dim helpers ---

function _cadGetAxisVec(axis) {
    if (axis === 'x') return new THREE.Vector3(1, 0, 0);
    if (axis === 'y') return new THREE.Vector3(0, 1, 0);
    return new THREE.Vector3(0, 0, 1);
}

function _cadGetFoot(pointWorld, axis, offsetPoint) {
    if (axis === 'x') return new THREE.Vector3(pointWorld.x, offsetPoint.y, offsetPoint.z);
    if (axis === 'y') return new THREE.Vector3(offsetPoint.x, pointWorld.y, offsetPoint.z);
    return new THREE.Vector3(offsetPoint.x, offsetPoint.y, pointWorld.z);
}

function _cadGetValue(p1, p2, axis) {
    if (axis === 'x') return Math.abs(p2.x - p1.x);
    if (axis === 'y') return Math.abs(p2.y - p1.y);
    return Math.abs(p2.z - p1.z);
}

function _cadMakeLine(p1, p2, color, dashed) {
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
    line.userData._isMeasurement = true;
    return line;
}

function _cadMakeMarker(position, color, isPreview) {
    const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
    const mat = new THREE.MeshBasicMaterial({
        color,
        depthTest: isPreview ? false : _depthTestEnabled,
        transparent: !!isPreview,
        opacity: isPreview ? 0.7 : 1.0
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = isPreview ? 999 : (_depthTestEnabled ? 0 : 999);
    mesh.position.copy(position);
    mesh.userData._isMeasurement = true;
    return mesh;
}

function _cadMakeLabel(text, position) {
    const div = document.createElement('div');
    div.className = 'measurement-label';
    div.innerHTML = text;
    div.style.cssText = `color:${_flatDimDefaults.textColor};background:${_flatDimDefaults.bgColor};padding:2px 6px;border-radius:3px;font-size:${_flatDimDefaults.fontSize}px;pointer-events:none;white-space:nowrap;line-height:1.4;`;
    const label = new CSS2DObject(div);
    label.position.copy(position);
    label.userData._isMeasurement = true;
    return label;
}

function _cadHidePhase01Preview() {
    if (_cadHoverMarker && _scene) {
        _scene.remove(_cadHoverMarker);
        _cadHoverMarker.geometry.dispose();
        _cadHoverMarker.material.dispose();
        _cadHoverMarker = null;
    }
    if (_cadPreviewLine && _scene) {
        _scene.remove(_cadPreviewLine);
        _cadPreviewLine.geometry.dispose();
        _cadPreviewLine.material.dispose();
        _cadPreviewLine = null;
    }
}

function _cadHidePhase2Preview() {
    if (!_scene) return;
    for (const obj of [_cadP2Ext1, _cadP2Ext2, _cadP2DimLine, _cadP2FootMarker1, _cadP2FootMarker2]) {
        if (obj) {
            _scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        }
    }
    _cadP2Ext1 = _cadP2Ext2 = _cadP2DimLine = _cadP2FootMarker1 = _cadP2FootMarker2 = null;
    if (_cadP2Label) {
        _scene.remove(_cadP2Label);
        if (_cadP2Label.element) _cadP2Label.element.remove();
        _cadP2Label = null;
    }
}

function _cadCancelAll() {
    _cadHidePhase01Preview();
    _cadHidePhase2Preview();
    if (_cadPendingMarker) {
        const owner = _cadDimOwner || _scene;
        if (owner) owner.remove(_cadPendingMarker);
        _cadPendingMarker.geometry.dispose();
        _cadPendingMarker.material.dispose();
        _cadPendingMarker = null;
    }
    _cadDimStep = 0;
    _cadDimP1World = null;
    _cadDimP2World = null;
    _cadDimOwner = null;
    _cadP2LastOffsetPoint = null;
}

function _cadBuildPhase2Preview(offsetPoint) {
    if (!_scene || !_cadDimP1World || !_cadDimP2World) return;
    _cadP2LastOffsetPoint = offsetPoint.clone();

    _cadHidePhase2Preview();

    const foot1 = _cadGetFoot(_cadDimP1World, _cadDimAxis, offsetPoint);
    const foot2 = _cadGetFoot(_cadDimP2World, _cadDimAxis, offsetPoint);
    const value = _cadGetValue(_cadDimP1World, _cadDimP2World, _cadDimAxis);

    // Extension lines (dashed)
    _cadP2Ext1 = _cadMakeLine(_cadDimP1World, foot1, _dimMarkerColor, true);
    _cadP2Ext2 = _cadMakeLine(_cadDimP2World, foot2, _dimMarkerColor, true);

    // Dimension line (solid, always on top during preview)
    const dimGeo = new THREE.BufferGeometry().setFromPoints([foot1, foot2]);
    const dimMat = new THREE.LineBasicMaterial({ color: _dimMarkerColor, depthTest: false });
    _cadP2DimLine = new THREE.Line(dimGeo, dimMat);
    _cadP2DimLine.renderOrder = 999;
    _cadP2DimLine.userData._isMeasurement = true;

    // Foot markers
    _cadP2FootMarker1 = _cadMakeMarker(foot1, 0x66ccff, true);
    _cadP2FootMarker2 = _cadMakeMarker(foot2, 0x66ccff, true);

    // Label at midpoint of dimension line
    const labelPos = new THREE.Vector3().addVectors(foot1, foot2).multiplyScalar(0.5);
    const labelText = value.toFixed(2)
        + '<br><span style="font-size:9px;opacity:0.7;">RMB: cycle axis · LMB: place</span>';
    _cadP2Label = _cadMakeLabel(labelText, labelPos);

    _scene.add(_cadP2Ext1);
    _scene.add(_cadP2Ext2);
    _scene.add(_cadP2DimLine);
    _scene.add(_cadP2FootMarker1);
    _scene.add(_cadP2FootMarker2);
    _scene.add(_cadP2Label);
}

// --- CAD dim label text helper ---
/**
 * Generate label HTML for a placed CAD dimension.
 * labelMode 0 = simple (axis: value)
 * labelMode 1 = full (like point-to-point, shows total + Δx/Δy/Δz/ΔXY/ΔXZ/ΔYZ)
 */
function _cadDimGetLabelText(meas, labelMode) {
    const value = meas.value;
    if (!labelMode) {
        return value.toFixed(2);
    }
    // Full mode: compute 3D distance and all deltas in world space
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
    return value.toFixed(2)
        + '<br>3D ' + dist.toFixed(2)
        + '<br><span style="font-size:10px;opacity:0.85;">\u0394x ' + dx.toFixed(2) + ' &nbsp;\u0394YZ ' + dYZ.toFixed(2)
        + '<br>\u0394y ' + dy.toFixed(2) + ' &nbsp;\u0394XZ ' + dXZ.toFixed(2)
        + '<br>\u0394z ' + dz.toFixed(2) + ' &nbsp;\u0394XY ' + dXY.toFixed(2) + '</span>';
}

// --- Public CAD Dim API ---

export function isCadDimActive() { return _cadDimActive; }
export function getCadDimStep() { return _cadDimStep; }
export function getCadDimAxis() { return _cadDimAxis; }

/**
 * Return the currently selected CAD dimension (or null).
 */
export function getSelectedCadDim() {
    return (_selectedDimType === 'cadDim') ? _selectedDim : null;
}

export function getSelectedCadDim3d() {
    return (_selectedDimType === 'cadDim3d') ? _selectedDim : null;
}

export function getSelectedAnnotation() {
    return (_selectedDimType === 'annotation') ? _selectedDim : null;
}

export function getSelectedAnnotation3d() {
    return (_selectedDimType === 'annotation3d') ? _selectedDim : null;
}

export function getSelectedDistance() {
    return (_selectedDimType === 'distance') ? _selectedDim : null;
}

export function getSelectedAngle() {
    return (_selectedDimType === 'angle') ? _selectedDim : null;
}

function _defaultMeasurementLabelPos(meas, type) {
    if (type === 'distance') {
        return new THREE.Vector3().addVectors(meas.p1, meas.p2).multiplyScalar(0.5);
    }
    if (type === 'angle') {
        const mid1 = new THREE.Vector3().addVectors(meas.points[0], meas.points[1]).multiplyScalar(0.5);
        const mid2 = new THREE.Vector3().addVectors(meas.points[2], meas.points[3]).multiplyScalar(0.5);
        return new THREE.Vector3().addVectors(mid1, mid2).multiplyScalar(0.5);
    }
    return null;
}

/**
 * Reset the selected distance/angle label to its default position and remove the leader line.
 */
export function resetSelectedMeasurementLabel(renderFn) {
    if (!_selectedDim || (_selectedDimType !== 'distance' && _selectedDimType !== 'angle')) return;
    const meas = _selectedDim;
    const type = _selectedDimType;
    const defaultPos = _defaultMeasurementLabelPos(meas, type);
    if (!defaultPos || !meas.label) return;

    meas.label.position.copy(defaultPos);
    meas._labelAnchor = null;
    _removeLeaderLine(meas);

    const owner = meas.ownerObject || _scene;
    const rec = _findMeasurementUserDataRec(meas, type);
    if (rec) {
        rec.labelPos = { x: defaultPos.x, y: defaultPos.y, z: defaultPos.z };
    }

    if (renderFn) renderFn();
}

export function getSelectedMeasurementLabelStyle() {
    const type = getSelectedDistance() ? 'distance' : (getSelectedAngle() ? 'angle' : null);
    const meas = type === 'distance' ? getSelectedDistance() : (type === 'angle' ? getSelectedAngle() : null);
    if (!meas || !type) return null;
    return _getMeasurementLabelStyle(meas, type);
}

export function setSelectedMeasurementTextColor(color, renderFn) {
    const type = getSelectedDistance() ? 'distance' : (getSelectedAngle() ? 'angle' : null);
    const meas = type === 'distance' ? getSelectedDistance() : (type === 'angle' ? getSelectedAngle() : null);
    if (!meas || !type) return;
    meas._textColor = color;
    _applyMeasurementLabelStyle(meas, type);
    _syncMeasurementLabelStyleToUserData(meas, type);
    if (renderFn) renderFn();
}

export function setSelectedMeasurementBgColor(color, renderFn) {
    const type = getSelectedDistance() ? 'distance' : (getSelectedAngle() ? 'angle' : null);
    const meas = type === 'distance' ? getSelectedDistance() : (type === 'angle' ? getSelectedAngle() : null);
    if (!meas || !type) return;
    meas._bgColor = color;
    _applyMeasurementLabelStyle(meas, type);
    _syncMeasurementLabelStyleToUserData(meas, type);
    if (renderFn) renderFn();
}

export function setSelectedMeasurementFontSize(size, renderFn) {
    const type = getSelectedDistance() ? 'distance' : (getSelectedAngle() ? 'angle' : null);
    const meas = type === 'distance' ? getSelectedDistance() : (type === 'angle' ? getSelectedAngle() : null);
    if (!meas || !type || !Number.isFinite(size)) return;
    if (meas.labelDim === '3d') {
        meas.labelScale = size / 2.2;
    } else {
        meas._fontSize = size;
    }
    _applyMeasurementLabelStyle(meas, type);
    _syncMeasurementLabelStyleToUserData(meas, type);
    if (renderFn) renderFn();
}

function _swapMeasurementLabel(meas, type, newDim, renderFn) {
    const owner = meas.ownerObject || _scene;
    const labelPos = meas.label.position.clone();
    const labelText = meas.label.element?.innerHTML
        || (type === 'distance' ? _buildDistanceLabelTextFromMeas(meas) : _buildAngleLabelTextFromMeas(meas));
    const style = _getMeasurementLabelStyle(meas, type);
    const wasSelected = _selectedDim === meas;
    const hadAnchor = meas._labelAnchor ? meas._labelAnchor.clone() : null;

    owner.remove(meas.label);
    if (meas.label.element) meas.label.element.remove();

    meas.labelDim = newDim;
    if (newDim === '3d') {
        _initMeasurement3dFields(meas, null);
    }

    const label = _createMeasurementLabel(labelText, labelPos, style, type, newDim, meas);
    owner.add(label);
    meas.label = label;

    if (hadAnchor) {
        meas._labelAnchor = hadAnchor;
        _updateLeaderLine(meas, labelPos);
    }

    _finalizeMeasurementLabel(meas, type);
    _syncMeasurementLabelStyleToUserData(meas, type);

    if (wasSelected) {
        _selectDim(meas, type);
    }
    if (_selectDimActive) {
        registerLabelForSelection(meas);
    }

    if (renderFn) renderFn();
}

export function convertMeasurementTo3d(meas, type, renderFn) {
    if (!meas || meas.labelDim === '3d') return;
    _swapMeasurementLabel(meas, type, '3d', renderFn);
}

export function convertMeasurementToFlat(meas, type, renderFn) {
    if (!meas || meas.labelDim !== '3d') return;
    _swapMeasurementLabel(meas, type, '2d', renderFn);
}

export function getSelectedMeasurementLabelDim() {
    const type = getSelectedDistance() ? 'distance' : (getSelectedAngle() ? 'angle' : null);
    const meas = type === 'distance' ? getSelectedDistance() : (type === 'angle' ? getSelectedAngle() : null);
    if (!meas) return null;
    return meas.labelDim || '2d';
}

export function setSelectedMeasurementLabelDim(dim, renderFn) {
    const type = getSelectedDistance() ? 'distance' : (getSelectedAngle() ? 'angle' : null);
    const meas = type === 'distance' ? getSelectedDistance() : (type === 'angle' ? getSelectedAngle() : null);
    if (!meas || !type) return;
    if (dim === '3d') convertMeasurementTo3d(meas, type, renderFn);
    else convertMeasurementToFlat(meas, type, renderFn);
}

export function setSelectedMeasurementOrientationMode(mode, renderFn) {
    const type = getSelectedDistance() ? 'distance' : (getSelectedAngle() ? 'angle' : null);
    const meas = type === 'distance' ? getSelectedDistance() : (type === 'angle' ? getSelectedAngle() : null);
    if (!meas || !type || meas.labelDim !== '3d') return;
    meas.orientationMode = mode;
    if (_currentCamera) _applyMeasurement3dOrientation(meas, _currentCamera);
    _syncMeasurementLabelStyleToUserData(meas, type);
    if (renderFn) renderFn();
}

/**
 * Change the label mode of a placed CAD dimension and rebuild its label.
 * labelMode: 0 = simple (axis: value), 1 = full (like point-to-point)
 */
export function setCadDimLabelMode(meas, mode, renderFn) {
    if (!meas) return;
    meas.labelMode = mode;
    // Rebuild just the label text
    const owner = meas.ownerObject || _scene;
    owner.remove(meas.label);
    if (meas.label.element) meas.label.element.remove();
    const newLabel = _cadMakeLabel(_cadDimGetLabelText(meas, mode), meas.label.position.clone());
    owner.add(newLabel);
    meas.label = newLabel;
    // Restore selection highlight and pointer-events if needed
    if (_selectedDim === meas) newLabel.element.style.border = SELECTED_BORDER;
    if (_selectDimActive) {
        newLabel.element.style.pointerEvents = 'auto';
        _addLabelInteractionListeners(newLabel.element);
    }
    // Persist labelMode in userData
    const o = meas.ownerObject || _scene;
    if (o && o.userData && Array.isArray(o.userData.measurements)) {
        const rec = o.userData.measurements.find(d => d.type === 'cadDim'
            && Math.abs(d.p1.x - meas.p1.x) < 1e-6
            && Math.abs(d.p1.y - meas.p1.y) < 1e-6
            && Math.abs(d.p1.z - meas.p1.z) < 1e-6);
        if (rec) rec.labelMode = mode;
    }
    if (renderFn) renderFn();
}

/**
 * Toggle whether dragging with label edit active moves the whole dimension (mode 0)
 * or only the label with a leader line to the dim-line midpoint (mode 1).
 */
export function setCadDimDragMode(meas, mode, renderFn) {
    if (!meas) return;
    const owner = meas.ownerObject || _scene;
    meas.dragMode = mode;
    if (mode === 1) {
        // Anchor = midpoint of dim line
        const anchor = new THREE.Vector3().addVectors(meas.foot1, meas.foot2).multiplyScalar(0.5);
        meas._labelAnchor = anchor;
        // Create leader line from anchor to current label position
        _updateLeaderLine(meas, meas.label.position);
    } else {
        // Keep leader line visible; just update anchor to feet midpoint so it stays connected
        const anchor = new THREE.Vector3().addVectors(meas.foot1, meas.foot2).multiplyScalar(0.5);
        meas._labelAnchor = anchor;
        _updateLeaderLine(meas, meas.label.position);
    }
    // Persist to userData
    if (owner && owner.userData && Array.isArray(owner.userData.measurements)) {
        const rec = owner.userData.measurements.find(d => d.type === 'cadDim'
            && Math.abs(d.p1.x - meas.p1.x) < 1e-6
            && Math.abs(d.p1.y - meas.p1.y) < 1e-6
            && Math.abs(d.p1.z - meas.p1.z) < 1e-6);
        if (rec) {
            rec.dragMode = mode;
            const lp = meas.label.position;
            rec.labelPos = { x: lp.x, y: lp.y, z: lp.z };
        }
    }
    if (renderFn) renderFn();
}

export function setCadDimActive(val) {
    _cadDimActive = val;
    if (!val) {
        _cadCancelAll();
    }
}

/**
 * Handle a surface click in phases 0 and 1.
 * Phase 0: places first point. Phase 1: places second point and enters placement mode.
 */
export function addCadDimPoint(point, ownerObject, renderFn) {
    if (!_cadDimActive || !_scene || _cadDimStep >= 2) return;

    if (_cadDimStep === 0) {
        _cadDimOwner = ownerObject || _scene;
        _cadDimP1World = point.clone();
        _cadDimOwner.updateWorldMatrix(true, false);
        const localP = _cadDimOwner.worldToLocal(point.clone());
        _cadPendingMarker = _cadMakeMarker(localP, _dimMarkerColor, false);
        _cadDimOwner.add(_cadPendingMarker);
        _cadHidePhase01Preview();
        _cadDimStep = 1;
        if (renderFn) renderFn();
    } else if (_cadDimStep === 1) {
        _cadDimP2World = point.clone();
        _cadHidePhase01Preview();
        _cadDimStep = 2;
        if (renderFn) renderFn();
    }
}

/**
 * Update the placement preview in phase 2 (called every frame from render loop).
 * mouseNDC: THREE.Vector2 with normalised device coordinates.
 */
export function updateCadDimPreview(mouseNDC, camera) {
    if (!_cadDimActive || !_scene || _cadDimStep !== 2) return;
    if (!_cadDimP1World || !_cadDimP2World) return;

    const mid = new THREE.Vector3().addVectors(_cadDimP1World, _cadDimP2World).multiplyScalar(0.5);
    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(cameraDir, mid);

    _cadTempRaycaster.setFromCamera(mouseNDC, camera);
    const offsetPoint = new THREE.Vector3();
    const hit = _cadTempRaycaster.ray.intersectPlane(plane, offsetPoint);
    if (!hit) {
        // Ray parallel to plane — keep last known offset if available
        if (_cadP2LastOffsetPoint) _cadBuildPhase2Preview(_cadP2LastOffsetPoint);
        return;
    }
    _cadBuildPhase2Preview(offsetPoint);
}

/**
 * Update hover marker on surface (phases 0 and 1).
 * Called every frame; pass null when cursor is not over any surface.
 */
export function updateCadDimHoverPreview(surfacePoint) {
    if (!_cadDimActive || !_scene || _cadDimStep >= 2) {
        _cadHidePhase01Preview();
        return;
    }

    if (!surfacePoint) {
        _cadHidePhase01Preview();
        return;
    }

    // Hover sphere
    if (!_cadHoverMarker) {
        const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
        const mat = new THREE.MeshBasicMaterial({ color: 0x66ccff, depthTest: false, transparent: true, opacity: 0.7 });
        _cadHoverMarker = new THREE.Mesh(geo, mat);
        _cadHoverMarker.renderOrder = 999;
        _cadHoverMarker.userData._isMeasurement = true;
        _scene.add(_cadHoverMarker);
    }
    _cadHoverMarker.position.copy(surfacePoint);

    // Dashed line from p1 to cursor (only in phase 1)
    if (_cadDimStep === 1 && _cadDimP1World) {
        if (_cadPreviewLine) {
            _scene.remove(_cadPreviewLine);
            _cadPreviewLine.geometry.dispose();
            _cadPreviewLine.material.dispose();
        }
        const geo = new THREE.BufferGeometry().setFromPoints([_cadDimP1World, surfacePoint]);
        const mat = new THREE.LineDashedMaterial({ color: _dimMarkerColor, dashSize: 4, gapSize: 3, depthTest: false });
        _cadPreviewLine = new THREE.Line(geo, mat);
        _cadPreviewLine.computeLineDistances();
        _cadPreviewLine.renderOrder = 999;
        _cadPreviewLine.userData._isMeasurement = true;
        _scene.add(_cadPreviewLine);
    } else if (_cadPreviewLine) {
        _scene.remove(_cadPreviewLine);
        _cadPreviewLine.geometry.dispose();
        _cadPreviewLine.material.dispose();
        _cadPreviewLine = null;
    }
}

/**
 * Cycle the measurement axis (X → Y → Z → X) and rebuild preview.
 * Returns the new axis string.
 */
export function cycleCadDimAxis(mouseNDC, camera) {
    if (_cadDimAxis === 'x') _cadDimAxis = 'y';
    else if (_cadDimAxis === 'y') _cadDimAxis = 'z';
    else _cadDimAxis = 'x';
    if (_cadDimStep === 2) updateCadDimPreview(mouseNDC, camera);
    return _cadDimAxis;
}

/**
 * Finalise dimension placement using the last computed offset point.
 * Creates permanent measurement objects in owner local space.
 */
export function placeCadDim(renderFn) {
    if (_cadDimStep !== 2 || !_cadP2LastOffsetPoint || !_cadDimP1World || !_cadDimP2World) return;
    if (!_scene) return;

    const offsetPoint = _cadP2LastOffsetPoint;
    const foot1World = _cadGetFoot(_cadDimP1World, _cadDimAxis, offsetPoint);
    const foot2World = _cadGetFoot(_cadDimP2World, _cadDimAxis, offsetPoint);
    const value = _cadGetValue(_cadDimP1World, _cadDimP2World, _cadDimAxis);
    const owner = _cadDimOwner || _scene;

    // Convert all points to owner local space
    owner.updateWorldMatrix(true, false);
    const p1 = owner.worldToLocal(_cadDimP1World.clone());
    const p2 = owner.worldToLocal(_cadDimP2World.clone());
    const f1 = owner.worldToLocal(foot1World.clone());
    const f2 = owner.worldToLocal(foot2World.clone());

    _cadHidePhase2Preview();

    // Keep the pending marker as markerP1 (already placed in owner space)
    const markerP1 = _cadPendingMarker;
    _cadPendingMarker = null;

    const markerP2 = _cadMakeMarker(p2, _dimMarkerColor, false);
    const markerFoot1 = _cadMakeMarker(f1, _dimMarkerColor, false);
    const markerFoot2 = _cadMakeMarker(f2, _dimMarkerColor, false);

    const extLine1 = _cadMakeLine(p1, f1, _dimMarkerColor, false);
    const extLine2 = _cadMakeLine(p2, f2, _dimMarkerColor, false);
    const dimLine  = _cadMakeLine(f1, f2, _dimMarkerColor, false);

    const labelPos  = new THREE.Vector3().addVectors(f1, f2).multiplyScalar(0.5);
    const meas = {
        markerP1, markerP2, markerFoot1, markerFoot2,
        extLine1, extLine2, dimLine,
        label: null, // assigned below
        p1, p2, foot1: f1, foot2: f2,
        axis: _cadDimAxis, value,
        labelMode: 0,
        ownerObject: owner
    };
    const label = _cadMakeLabel(_cadDimGetLabelText(meas, 0), labelPos);
    meas.label = label;

    owner.add(markerP2);
    owner.add(markerFoot1);
    owner.add(markerFoot2);
    owner.add(extLine1);
    owner.add(extLine2);
    owner.add(dimLine);
    owner.add(label);

    _cadDimMeasurements.push(meas);

    // Persist in userData for GLB export
    if (!owner.userData.measurements) owner.userData.measurements = [];
    owner.userData.measurements.push({
        type: 'cadDim',
        p1: { x: p1.x, y: p1.y, z: p1.z },
        p2: { x: p2.x, y: p2.y, z: p2.z },
        foot1: { x: f1.x, y: f1.y, z: f1.z },
        foot2: { x: f2.x, y: f2.y, z: f2.z },
        axis: _cadDimAxis, value,
        labelMode: 0,
        labelPos: { x: labelPos.x, y: labelPos.y, z: labelPos.z }
    });

    // Reset to phase 0 for next dimension (keep mode active)
    _cadDimStep = 0;
    _cadDimP1World = null;
    _cadDimP2World = null;
    _cadDimOwner = null;
    _cadP2LastOffsetPoint = null;

    if (renderFn) renderFn();
    if (_onCadDimSessionComplete) _onCadDimSessionComplete();
}

function _removeSingleCadDim(m) {
    _removeLeaderLine(m);
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
    if (owner.userData.measurements) {
        const di = owner.userData.measurements.findIndex(d => d.type === 'cadDim'
            && Math.abs(d.p1.x - m.p1.x) < 1e-6 && Math.abs(d.p1.y - m.p1.y) < 1e-6 && Math.abs(d.p1.z - m.p1.z) < 1e-6);
        if (di !== -1) owner.userData.measurements.splice(di, 1);
        if (owner.userData.measurements.length === 0) delete owner.userData.measurements;
    }
}

export function clearCadDimMeasurements(renderFn) {
    if (!_scene) return;
    _cadCancelAll();
    for (const m of _cadDimMeasurements) _removeSingleCadDim(m);
    _cadDimMeasurements = [];
    if (renderFn) renderFn();
}

export function removeCadDimMeasurementsForOwner(root) {
    if (!root) return;
    const owned = new Set();
    root.traverse(obj => owned.add(obj));
    for (const m of _cadDimMeasurements.filter(m => owned.has(m.ownerObject))) {
        _removeSingleMeasurement(m, 'cadDim');
    }
}

function _reconstructCadDim(owner, rec) {
    const p1 = new THREE.Vector3(rec.p1.x, rec.p1.y, rec.p1.z);
    const p2 = new THREE.Vector3(rec.p2.x, rec.p2.y, rec.p2.z);
    const f1 = new THREE.Vector3(rec.foot1.x, rec.foot1.y, rec.foot1.z);
    const f2 = new THREE.Vector3(rec.foot2.x, rec.foot2.y, rec.foot2.z);
    const axisLabel = (rec.axis || 'x').toUpperCase();
    const value = rec.value != null ? rec.value : f1.distanceTo(f2);

    const markerP1    = _cadMakeMarker(p1, _dimMarkerColor, false);
    const markerP2    = _cadMakeMarker(p2, _dimMarkerColor, false);
    const markerFoot1 = _cadMakeMarker(f1, _dimMarkerColor, false);
    const markerFoot2 = _cadMakeMarker(f2, _dimMarkerColor, false);
    const extLine1    = _cadMakeLine(p1, f1, _dimMarkerColor, false);
    const extLine2    = _cadMakeLine(p2, f2, _dimMarkerColor, false);
    const dimLine     = _cadMakeLine(f1, f2, _dimMarkerColor, false);
    const labelPos    = rec.labelPos
        ? new THREE.Vector3(rec.labelPos.x, rec.labelPos.y, rec.labelPos.z)
        : new THREE.Vector3().addVectors(f1, f2).multiplyScalar(0.5);
    const labelMode = rec.labelMode || 0;
    const dragMode  = rec.dragMode  || 0;
    const measRec = {
        markerP1, markerP2, markerFoot1, markerFoot2,
        extLine1, extLine2, dimLine,
        label: null, // assigned below
        p1, p2, foot1: f1, foot2: f2,
        axis: rec.axis || 'x', value,
        labelMode, dragMode,
        ownerObject: owner
    };
    const label = _cadMakeLabel(_cadDimGetLabelText(measRec, labelMode), labelPos);
    measRec.label = label;

    owner.add(markerP1); owner.add(markerP2);
    owner.add(markerFoot1); owner.add(markerFoot2);
    owner.add(extLine1); owner.add(extLine2);
    owner.add(dimLine); owner.add(label);

    // Restore leader line when label is offset from dim-line midpoint (regardless of dragMode)
    const mid = new THREE.Vector3().addVectors(f1, f2).multiplyScalar(0.5);
    if (dragMode === 1 || mid.distanceTo(labelPos) > 1e-6) {
        measRec._labelAnchor = mid;
        _updateLeaderLine(measRec, labelPos);
    }

    _cadDimMeasurements.push(measRec);
}

export function getCadDimMeasurements() { return _cadDimMeasurements; }

export function deleteCadDimByRef(meas) {
    _removeSingleCadDim(meas);
    const idx = _cadDimMeasurements.indexOf(meas);
    if (idx !== -1) _cadDimMeasurements.splice(idx, 1);
}

/**
 * Convert a placed CSS3D CAD dimension to a CSS2D CAD dimension.
 * Removes the CSS3D meas, creates a matching CSS2D one.
 * If the measurement was selected, clears the selection.
 */
export function convertCadDim3dTo2d(meas3d, renderFn) {
    if (!meas3d) return;
    const owner = meas3d.ownerObject || _scene;
    const labelPos = meas3d.label ? meas3d.label.position.clone() : null;
    const wasSelected = (_selectedDim === meas3d);
    if (wasSelected) _deselectDim();

    // Remove the CSS3D visual
    deleteCadDim3dByRef(meas3d);

    // Build a rec mirroring the CSS2D userData format
    const p1 = meas3d.p1, p2 = meas3d.p2, f1 = meas3d.foot1, f2 = meas3d.foot2;
    const rec = {
        type:      'cadDim',
        p1:        { x: p1.x, y: p1.y, z: p1.z },
        p2:        { x: p2.x, y: p2.y, z: p2.z },
        foot1:     { x: f1.x, y: f1.y, z: f1.z },
        foot2:     { x: f2.x, y: f2.y, z: f2.z },
        axis:      meas3d.axis,
        value:     meas3d.value,
        labelMode: meas3d.labelMode || 0,
        dragMode:  meas3d.dragMode  || 0,
        labelPos:  labelPos ? { x: labelPos.x, y: labelPos.y, z: labelPos.z } : undefined,
    };

    // Persist in userData.measurements
    if (!owner.userData.measurements) owner.userData.measurements = [];
    owner.userData.measurements.push(rec);

    // Build visuals via existing reconstruct function
    _reconstructCadDim(owner, rec);

    // Wire up selection and pointer events for the newly created meas
    const newMeas = _cadDimMeasurements[_cadDimMeasurements.length - 1];
    if (_selectDimActive && newMeas && newMeas.label) {
        newMeas.label.element.style.pointerEvents = 'auto';
        _addLabelInteractionListeners(newMeas.label.element);
    }

    if (renderFn) renderFn();
    return newMeas;
}
