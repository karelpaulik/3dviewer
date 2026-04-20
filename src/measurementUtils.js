// measurementUtils.js – Point-to-point measurement with CSS2D labels
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { getAnnotations, updateAnnotationLeaderLine, syncAnnotationLabelPos } from './annotationUtils.js';

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

const ANGLE_LINE_COLOR = 0x4488ff;
const ANGLE_MARKER_COLOR = 0x4488ff;
const ANGLE_PREVIEW_COLOR = 0x88aaff;

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
const MARKER_COLOR = 0xff4444;
const LINE_COLOR = 0xff4444;
const PREVIEW_COLOR = 0xff8888;
const MARKER_SCREEN_SIZE = 5; // desired pixel-size (approximate)

// --- Helpers ---

function _createMarker(position) {
    const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: MARKER_COLOR, depthTest: _depthTestEnabled });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = _depthTestEnabled ? 0 : 999;
    mesh.position.copy(position);
    mesh.userData._isMeasurement = true;
    return mesh;
}

function _createLine(p1, p2) {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const mat = new THREE.LineBasicMaterial({ color: LINE_COLOR, depthTest: _depthTestEnabled });
    const line = new THREE.Line(geo, mat);
    line.renderOrder = _depthTestEnabled ? 0 : 999;
    line.userData._isMeasurement = true;
    return line;
}

function _createLabel(text, position) {
    const div = document.createElement('div');
    div.className = 'measurement-label';
    div.innerHTML = text;
    div.style.cssText = 'color:#fff;background:rgba(200,40,40,0.85);padding:2px 6px;border-radius:3px;font-size:11px;pointer-events:none;white-space:nowrap;line-height:1.4;';
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
        const labelText = dist.toFixed(2)
            + '<br><span style="font-size:10px;opacity:0.85;">Δx ' + dx.toFixed(2) + ' &nbsp;ΔYZ ' + dYZ.toFixed(2)
            + '<br>Δy ' + dy.toFixed(2) + ' &nbsp;ΔXZ ' + dXZ.toFixed(2)
            + '<br>Δz ' + dz.toFixed(2) + ' &nbsp;ΔXY ' + dXY.toFixed(2) + '</span>';
        const label = _createLabel(labelText, midPoint);

        owner1.add(marker2);
        owner1.add(line);
        owner1.add(label);

        _measurements.push({ line, label, marker1, marker2, p1, p2, distance: dist, ownerObject: owner1 });

        // Store measurement data in ownerObject.userData for GLB export
        if (!owner1.userData.measurements) owner1.userData.measurements = [];
        owner1.userData.measurements.push({
            type: 'distance',
            p1: { x: p1.x, y: p1.y, z: p1.z },
            p2: { x: p2.x, y: p2.y, z: p2.z },
            distance: dist,
            labelPos: { x: midPoint.x, y: midPoint.y, z: midPoint.z }
        });

        // Reset pending state and hide preview
        _pendingPoint = null;
        _pendingMarker = null;
        _pendingOwner = null;
        _hidePreview();
        if (renderFn) renderFn();
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

    _measurements = _measurements.filter(m => {
        if (!owned.has(m.ownerObject)) return true;
        if (m.label && m.label.element) m.label.element.remove();
        m.line.geometry.dispose(); m.line.material.dispose();
        m.marker1.geometry.dispose(); m.marker1.material.dispose();
        m.marker2.geometry.dispose(); m.marker2.material.dispose();
        if (m.leaderLine) { m.leaderLine.geometry.dispose(); m.leaderLine.material.dispose(); }
        return false;
    });

    _angleMeasurements = _angleMeasurements.filter(m => {
        if (!owned.has(m.ownerObject)) return true;
        if (m.label && m.label.element) m.label.element.remove();
        m.line1.geometry.dispose(); m.line1.material.dispose();
        m.line2.geometry.dispose(); m.line2.material.dispose();
        m.midLine.geometry.dispose(); m.midLine.material.dispose();
        for (const mk of m.markers) { mk.geometry.dispose(); mk.material.dispose(); }
        if (m.leaderLine) { m.leaderLine.geometry.dispose(); m.leaderLine.material.dispose(); }
        return false;
    });

    // Also remove CAD dim measurements for this owner
    removeCadDimMeasurementsForOwner(root);

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
        const mat = new THREE.MeshBasicMaterial({ color: PREVIEW_COLOR, depthTest: false, transparent: true, opacity: 0.7 });
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
        const mat = new THREE.LineDashedMaterial({ color: LINE_COLOR, dashSize: 4, gapSize: 3, depthTest: false });
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

    const markers = [];
    for (const m of _measurements) {
        markers.push(m.marker1, m.marker2);
    }
    if (_pendingMarker) markers.push(_pendingMarker);
    if (_previewMarker) markers.push(_previewMarker);

    // Include angle measurement markers
    for (const m of _angleMeasurements) {
        markers.push(...m.markers);
    }
    markers.push(..._angleMarkers);

    // Include CAD dimension markers
    for (const m of _cadDimMeasurements) {
        markers.push(m.markerP1, m.markerP2, m.markerFoot1, m.markerFoot2);
    }
    if (_cadPendingMarker) markers.push(_cadPendingMarker);
    if (_cadHoverMarker) markers.push(_cadHoverMarker);
    if (_cadP2FootMarker1) markers.push(_cadP2FootMarker1);
    if (_cadP2FootMarker2) markers.push(_cadP2FootMarker2);

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

// ===================== Angle Measurement =====================

function _createAngleMarker(position) {
    const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: ANGLE_MARKER_COLOR, depthTest: _depthTestEnabled });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = _depthTestEnabled ? 0 : 999;
    mesh.position.copy(position);
    mesh.userData._isMeasurement = true;
    return mesh;
}

function _createAngleLine(p1, p2) {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const mat = new THREE.LineBasicMaterial({ color: ANGLE_LINE_COLOR, depthTest: _depthTestEnabled });
    const line = new THREE.Line(geo, mat);
    line.renderOrder = _depthTestEnabled ? 0 : 999;
    line.userData._isMeasurement = true;
    return line;
}

function _createAngleLabel(text, position) {
    const div = document.createElement('div');
    div.className = 'measurement-label';
    div.innerHTML = text;
    div.style.cssText = 'color:#fff;background:rgba(40,80,200,0.85);padding:2px 6px;border-radius:3px;font-size:11px;pointer-events:none;white-space:nowrap;line-height:1.4;';
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

        // 3D angle between direction vectors
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

        // Place label at midpoint of the two lines' midpoints (local space)
        const mid1 = new THREE.Vector3().addVectors(_anglePoints[0], _anglePoints[1]).multiplyScalar(0.5);
        const mid2 = new THREE.Vector3().addVectors(_anglePoints[2], _anglePoints[3]).multiplyScalar(0.5);
        const labelPos = new THREE.Vector3().addVectors(mid1, mid2).multiplyScalar(0.5);

        // Connecting line between midpoints of the two lines (local space)
        const geoMid = new THREE.BufferGeometry().setFromPoints([mid1, mid2]);
        const matMid = new THREE.LineDashedMaterial({ color: ANGLE_LINE_COLOR, dashSize: 3, gapSize: 2, depthTest: _depthTestEnabled, transparent: true, opacity: 0.5 });
        const midLine = new THREE.Line(geoMid, matMid);
        midLine.computeLineDistances();
        midLine.renderOrder = _depthTestEnabled ? 0 : 999;
        midLine.userData._isMeasurement = true;
        owner.add(midLine);

        const label = _createAngleLabel(labelText, labelPos);
        owner.add(label);

        // Store for cleanup
        const storedMarkers = _angleMarkers.slice();
        _angleMeasurements.push({
            line1: _angleLine1, line2, midLine, label,
            markers: storedMarkers,
            points: _anglePoints.slice(),
            ownerObject: owner
        });

        // Store measurement data in ownerObject.userData for GLB export
        if (!owner.userData.measurements) owner.userData.measurements = [];
        owner.userData.measurements.push({
            type: 'angle',
            points: _anglePoints.map(pt => ({ x: pt.x, y: pt.y, z: pt.z })),
            labelPos: { x: labelPos.x, y: labelPos.y, z: labelPos.z }
        });

        // Reset pending state
        _angleLine1 = null;
        _angleMarkers = [];
        _anglePoints = [];
        _angleStep = 0;
        _angleOwner = null;
        _hideAnglePreview();
        if (renderFn) renderFn();
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
                const mat = new THREE.MeshBasicMaterial({ color: ANGLE_PREVIEW_COLOR, depthTest: false, transparent: true, opacity: 0.7 });
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
        const mat = new THREE.MeshBasicMaterial({ color: ANGLE_PREVIEW_COLOR, depthTest: false, transparent: true, opacity: 0.7 });
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
        const mat = new THREE.LineDashedMaterial({ color: ANGLE_LINE_COLOR, dashSize: 4, gapSize: 3, depthTest: false });
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
    if (!found) return;

    _selectDim(found, foundType);

    if (foundType === 'cadDim') {
        if (found.dragMode === 1) {
            // Label-only drag: anchor is midpoint of the dim line (foot1–foot2)
            found._labelAnchor = new THREE.Vector3().addVectors(found.foot1, found.foot2).multiplyScalar(0.5);
        }
        // dragMode 0: whole dimension drag (no anchor needed, handled in mouseMove)
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
        anchor = found.anchorLocal.clone();
    }
    found._labelAnchor = anchor;

    // Start drag
    _isDraggingLabel = true;
    _dragStartMouse.set(e.clientX, e.clientY);
    _dragStartPos.copy(found.label.position);
    if (_orbitControls) _orbitControls.enabled = false;

    if (_renderFn) _renderFn();
}

function _onDocumentMouseMove(e) {
    if (!_isDraggingLabel || !_selectedDim || !_currentCamera) return;

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
    // Clear any label-offset leader line – whole-dim drag resets to default
    _removeLeaderLine(meas);
    meas._labelAnchor = null;
    owner.updateWorldMatrix(true, false);
    const axis = meas.axis;

    const foot1World = _cadGetFoot(p1World, axis, offsetPoint);
    const foot2World = _cadGetFoot(p2World, axis, offsetPoint);
    const f1 = owner.worldToLocal(foot1World.clone());
    const f2 = owner.worldToLocal(foot2World.clone());
    const value = _cadGetValue(p1World, p2World, axis);
    const axisLabel = axis.toUpperCase();

    // Dispose and remove old objects (all except markerP1 and markerP2)
    for (const obj of [meas.markerFoot1, meas.markerFoot2, meas.extLine1, meas.extLine2, meas.dimLine]) {
        if (!obj) continue;
        owner.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }
    if (meas.label) {
        owner.remove(meas.label);
        if (meas.label.element) meas.label.element.remove();
    }

    // Rebuild
    const markerFoot1 = _cadMakeMarker(f1, CAD_DIM_COLOR, false);
    const markerFoot2 = _cadMakeMarker(f2, CAD_DIM_COLOR, false);
    const extLine1    = _cadMakeLine(meas.p1, f1, CAD_DIM_EXT_COLOR, false);
    const extLine2    = _cadMakeLine(meas.p2, f2, CAD_DIM_EXT_COLOR, false);
    const dimLine     = _cadMakeLine(f1, f2, CAD_DIM_COLOR, false);
    const labelPos    = new THREE.Vector3().addVectors(f1, f2).multiplyScalar(0.5);
    // Temporarily set foot1/foot2 and value so _cadDimGetLabelText can use them
    meas.foot1 = f1; meas.foot2 = f2; meas.value = value;
    const label = _cadMakeLabel(_cadDimGetLabelText(meas, meas.labelMode || 0), labelPos);

    owner.add(markerFoot1); owner.add(markerFoot2);
    owner.add(extLine1);    owner.add(extLine2);
    owner.add(dimLine);     owner.add(label);

    meas.markerFoot1 = markerFoot1;
    meas.markerFoot2 = markerFoot2;
    meas.extLine1 = extLine1;
    meas.extLine2 = extLine2;
    meas.dimLine  = dimLine;
    meas.label    = label;

    // Restore selection highlight and pointer-events
    if (_selectedDim === meas) {
        label.element.style.border = SELECTED_BORDER;
    }
    if (_selectDimActive) {
        label.element.style.pointerEvents = 'auto';
        label.element.addEventListener('mousedown', _onLabelMouseDown);
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

export function setSelectDimActive(val) {
    _selectDimActive = val;
    _setLabelPointerEvents(val);
    if (!val) {
        _deselectDim();
        _isDraggingLabel = false;
    }
    // Add / remove global listeners
    if (val) {
        document.addEventListener('mousemove', _onDocumentMouseMove);
        document.addEventListener('mouseup', _onDocumentMouseUp);
        window.addEventListener('click', _onCanvasClick, true);
        // Attach mousedown to all existing labels
        for (const m of _measurements) {
            m.label.element.addEventListener('mousedown', _onLabelMouseDown);
        }
        for (const m of _angleMeasurements) {
            m.label.element.addEventListener('mousedown', _onLabelMouseDown);
        }
        for (const m of _cadDimMeasurements) {
            m.label.element.addEventListener('mousedown', _onLabelMouseDown);
        }
        for (const a of getAnnotations()) {
            a.label.element.addEventListener('mousedown', _onLabelMouseDown);
        }
    } else {
        document.removeEventListener('mousemove', _onDocumentMouseMove);
        document.removeEventListener('mouseup', _onDocumentMouseUp);
        window.removeEventListener('click', _onCanvasClick, true);
        for (const m of _measurements) {
            m.label.element.removeEventListener('mousedown', _onLabelMouseDown);
        }
        for (const m of _angleMeasurements) {
            m.label.element.removeEventListener('mousedown', _onLabelMouseDown);
        }
        for (const m of _cadDimMeasurements) {
            m.label.element.removeEventListener('mousedown', _onLabelMouseDown);
        }
        for (const a of getAnnotations()) {
            a.label.element.removeEventListener('mousedown', _onLabelMouseDown);
        }
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
    const dx = Math.abs(p2w.x - p1w.x);
    const dy = Math.abs(p2w.y - p1w.y);
    const dz = Math.abs(p2w.z - p1w.z);
    const dXY = Math.sqrt(dx * dx + dy * dy);
    const dXZ = Math.sqrt(dx * dx + dz * dz);
    const dYZ = Math.sqrt(dy * dy + dz * dz);
    const labelText = dist.toFixed(2)
        + '<br><span style="font-size:10px;opacity:0.85;">Δx ' + dx.toFixed(2) + ' &nbsp;ΔYZ ' + dYZ.toFixed(2)
        + '<br>Δy ' + dy.toFixed(2) + ' &nbsp;ΔXZ ' + dXZ.toFixed(2)
        + '<br>Δz ' + dz.toFixed(2) + ' &nbsp;ΔXY ' + dXY.toFixed(2) + '</span>';
    const label = _createLabel(labelText, labelPos);

    owner.add(marker1);
    owner.add(marker2);
    owner.add(line);
    owner.add(label);

    const defaultMid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const meas = { line, label, marker1, marker2, p1, p2, distance: dist, ownerObject: owner };
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

    // Midpoints and connecting line
    const mid1 = new THREE.Vector3().addVectors(pts[0], pts[1]).multiplyScalar(0.5);
    const mid2 = new THREE.Vector3().addVectors(pts[2], pts[3]).multiplyScalar(0.5);
    const geoMid = new THREE.BufferGeometry().setFromPoints([mid1, mid2]);
    const matMid = new THREE.LineDashedMaterial({ color: ANGLE_LINE_COLOR, dashSize: 3, gapSize: 2, depthTest: _depthTestEnabled, transparent: true, opacity: 0.5 });
    const midLine = new THREE.Line(geoMid, matMid);
    midLine.computeLineDistances();
    midLine.renderOrder = _depthTestEnabled ? 0 : 999;
    midLine.userData._isMeasurement = true;
    owner.add(midLine);

    const defaultLabelPos = new THREE.Vector3().addVectors(mid1, mid2).multiplyScalar(0.5);
    const labelPos = rec.labelPos
        ? new THREE.Vector3(rec.labelPos.x, rec.labelPos.y, rec.labelPos.z)
        : defaultLabelPos.clone();
    const label = _createAngleLabel(labelText, labelPos);
    owner.add(label);

    const angleMeas = {
        line1, line2, midLine, label,
        markers,
        points: pts,
        ownerObject: owner
    };
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
    div.style.cssText = 'color:#fff;background:' + CAD_DIM_LABEL_BG + ';padding:2px 6px;border-radius:3px;font-size:11px;pointer-events:none;white-space:nowrap;line-height:1.4;';
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
    const axisLabel = _cadDimAxis.toUpperCase();

    // Extension lines (dashed)
    _cadP2Ext1 = _cadMakeLine(_cadDimP1World, foot1, CAD_DIM_EXT_COLOR, true);
    _cadP2Ext2 = _cadMakeLine(_cadDimP2World, foot2, CAD_DIM_EXT_COLOR, true);

    // Dimension line (solid, always on top during preview)
    const dimGeo = new THREE.BufferGeometry().setFromPoints([foot1, foot2]);
    const dimMat = new THREE.LineBasicMaterial({ color: CAD_DIM_COLOR, depthTest: false });
    _cadP2DimLine = new THREE.Line(dimGeo, dimMat);
    _cadP2DimLine.renderOrder = 999;
    _cadP2DimLine.userData._isMeasurement = true;

    // Foot markers
    _cadP2FootMarker1 = _cadMakeMarker(foot1, 0x66ccff, true);
    _cadP2FootMarker2 = _cadMakeMarker(foot2, 0x66ccff, true);

    // Label at midpoint of dimension line
    const labelPos = new THREE.Vector3().addVectors(foot1, foot2).multiplyScalar(0.5);
    const labelText = axisLabel + ': ' + value.toFixed(2)
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
    const axisLabel = (meas.axis || 'x').toUpperCase();
    const value = meas.value;
    if (!labelMode) {
        return axisLabel + ': ' + value.toFixed(2);
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
    return axisLabel + ': ' + value.toFixed(2)
        + '<br>' + dist.toFixed(2)
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
        newLabel.element.addEventListener('mousedown', _onLabelMouseDown);
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
 * Toggle whether dragging in Edit Labels mode moves the whole dimension (mode 0)
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
        // Remove leader line, reset label to dim-line midpoint
        _removeLeaderLine(meas);
        meas._labelAnchor = null;
        const mid = new THREE.Vector3().addVectors(meas.foot1, meas.foot2).multiplyScalar(0.5);
        meas.label.position.copy(mid);
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
        _cadPendingMarker = _cadMakeMarker(localP, CAD_DIM_COLOR, false);
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
        const mat = new THREE.LineDashedMaterial({ color: CAD_DIM_COLOR, dashSize: 4, gapSize: 3, depthTest: false });
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
    const axisLabel = _cadDimAxis.toUpperCase();
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

    const markerP2 = _cadMakeMarker(p2, CAD_DIM_COLOR, false);
    const markerFoot1 = _cadMakeMarker(f1, CAD_DIM_COLOR, false);
    const markerFoot2 = _cadMakeMarker(f2, CAD_DIM_COLOR, false);

    const extLine1 = _cadMakeLine(p1, f1, CAD_DIM_EXT_COLOR, false);
    const extLine2 = _cadMakeLine(p2, f2, CAD_DIM_EXT_COLOR, false);
    const dimLine  = _cadMakeLine(f1, f2, CAD_DIM_COLOR, false);

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
    _cadDimMeasurements = _cadDimMeasurements.filter(m => {
        if (!owned.has(m.ownerObject)) return true;
        if (m.label && m.label.element) m.label.element.remove();
        for (const obj of [m.markerP1, m.markerP2, m.markerFoot1, m.markerFoot2, m.extLine1, m.extLine2, m.dimLine]) {
            if (obj) { if (obj.geometry) obj.geometry.dispose(); if (obj.material) obj.material.dispose(); }
        }
        return false;
    });
}

function _reconstructCadDim(owner, rec) {
    const p1 = new THREE.Vector3(rec.p1.x, rec.p1.y, rec.p1.z);
    const p2 = new THREE.Vector3(rec.p2.x, rec.p2.y, rec.p2.z);
    const f1 = new THREE.Vector3(rec.foot1.x, rec.foot1.y, rec.foot1.z);
    const f2 = new THREE.Vector3(rec.foot2.x, rec.foot2.y, rec.foot2.z);
    const axisLabel = (rec.axis || 'x').toUpperCase();
    const value = rec.value != null ? rec.value : f1.distanceTo(f2);

    const markerP1    = _cadMakeMarker(p1, CAD_DIM_COLOR, false);
    const markerP2    = _cadMakeMarker(p2, CAD_DIM_COLOR, false);
    const markerFoot1 = _cadMakeMarker(f1, CAD_DIM_COLOR, false);
    const markerFoot2 = _cadMakeMarker(f2, CAD_DIM_COLOR, false);
    const extLine1    = _cadMakeLine(p1, f1, CAD_DIM_EXT_COLOR, false);
    const extLine2    = _cadMakeLine(p2, f2, CAD_DIM_EXT_COLOR, false);
    const dimLine     = _cadMakeLine(f1, f2, CAD_DIM_COLOR, false);
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

    // Restore leader line for label-offset mode
    if (dragMode === 1) {
        measRec._labelAnchor = new THREE.Vector3().addVectors(f1, f2).multiplyScalar(0.5);
        _updateLeaderLine(measRec, labelPos);
    }

    _cadDimMeasurements.push(measRec);
}
