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
        const labelText = dist.toFixed(2) + '<br><span style="font-size:10px;opacity:0.85;">Δx ' + dx.toFixed(2) + '<br>Δy ' + dy.toFixed(2) + '<br>Δz ' + dz.toFixed(2) + '</span>';
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
        for (const a of getAnnotations()) {
            if (a.label.element === el) { found = a; foundType = 'annotation'; break; }
        }
    }
    if (!found) return;

    _selectDim(found, foundType);

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
        // Sync final label position back to userData for GLB export
        if (_selectedDim) {
            if (_selectedDimType === 'annotation') {
                syncAnnotationLabelPos(_selectedDim);
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
    const labelText = dist.toFixed(2) + '<br><span style="font-size:10px;opacity:0.85;">Δx ' + dx.toFixed(2) + '<br>Δy ' + dy.toFixed(2) + '<br>Δz ' + dz.toFixed(2) + '</span>';
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
