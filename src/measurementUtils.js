// measurementUtils.js – Point-to-point measurement with CSS2D labels
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// --- Private state ---
let _scene = null;
let _measurements = []; // { line, label, p1, p2 }
let _pendingPoint = null; // THREE.Vector3 | null – first click awaiting second
let _pendingMarker = null; // Mesh for pending point preview
let _previewMarker = null; // Hover preview sphere (follows cursor on surface)
let _previewLine = null;   // Dashed line from pending point to preview
let _active = false;

// --- Angle measurement state ---
let _angleActive = false;
let _angleStep = 0; // 0..3: how many points have been clicked
let _anglePoints = []; // up to 4 THREE.Vector3
let _angleMarkers = []; // markers for clicked points
let _angleLine1 = null; // line for first pair
let _anglePreviewLine = null; // dashed preview line from last point to cursor
let _angleMeasurements = []; // completed angle measurements

const ANGLE_LINE_COLOR = 0x4488ff;
const ANGLE_MARKER_COLOR = 0x4488ff;
const ANGLE_PREVIEW_COLOR = 0x88aaff;

const MARKER_RADIUS = 1;
const MARKER_COLOR = 0xff4444;
const LINE_COLOR = 0xff4444;
const PREVIEW_COLOR = 0xff8888;
const MARKER_SCREEN_SIZE = 5; // desired pixel-size (approximate)

// --- Helpers ---

function _createMarker(position) {
    const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: MARKER_COLOR, depthTest: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 999;
    mesh.position.copy(position);
    mesh.userData._isMeasurement = true;
    return mesh;
}

function _createLine(p1, p2) {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const mat = new THREE.LineBasicMaterial({ color: LINE_COLOR, depthTest: false });
    const line = new THREE.Line(geo, mat);
    line.renderOrder = 999;
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
        if (_pendingMarker && _scene) {
            _scene.remove(_pendingMarker);
            _pendingMarker.geometry.dispose();
            _pendingMarker.material.dispose();
            _pendingMarker = null;
        }
        _pendingPoint = null;
        _hidePreview();
    }
}

/**
 * Handle a click-point from raycaster intersection.
 * First call sets point 1, second call completes the measurement.
 * @param {THREE.Vector3} point – world-space intersection point
 * @param {Function} renderFn – callback to trigger a render
 */
export function addMeasurePoint(point, renderFn) {
    if (!_active || !_scene) return;

    if (!_pendingPoint) {
        // --- First point ---
        _pendingPoint = point.clone();
        _pendingMarker = _createMarker(_pendingPoint);
        _scene.add(_pendingMarker);
        if (renderFn) renderFn();
    } else {
        // --- Second point → complete measurement ---
        const p1 = _pendingPoint;
        const p2 = point.clone();
        const dist = p1.distanceTo(p2);

        const marker1 = _pendingMarker;
        const marker2 = _createMarker(p2);
        const line = _createLine(p1, p2);
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const dx = Math.abs(p2.x - p1.x);
        const dy = Math.abs(p2.y - p1.y);
        const dz = Math.abs(p2.z - p1.z);
        const labelText = dist.toFixed(2) + '<br><span style="font-size:10px;opacity:0.85;">Δx ' + dx.toFixed(2) + '<br>Δy ' + dy.toFixed(2) + '<br>Δz ' + dz.toFixed(2) + '</span>';
        const label = _createLabel(labelText, midPoint);

        _scene.add(marker2);
        _scene.add(line);
        _scene.add(label);

        _measurements.push({ line, label, marker1, marker2, p1, p2, distance: dist });

        // Reset pending state and hide preview
        _pendingPoint = null;
        _pendingMarker = null;
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
        _scene.remove(_pendingMarker);
        _pendingMarker.geometry.dispose();
        _pendingMarker.material.dispose();
        _pendingMarker = null;
    }
    _pendingPoint = null;

    // Remove completed measurements
    for (const m of _measurements) {
        _scene.remove(m.line);
        _scene.remove(m.label);
        _scene.remove(m.marker1);
        _scene.remove(m.marker2);
        m.line.geometry.dispose();
        m.line.material.dispose();
        m.marker1.geometry.dispose();
        m.marker1.material.dispose();
        m.marker2.geometry.dispose();
        m.marker2.material.dispose();
    }
    _measurements = [];

    // Also clear angle measurements
    _cancelAnglePending();
    for (const m of _angleMeasurements) {
        _scene.remove(m.line1);
        _scene.remove(m.line2);
        _scene.remove(m.midLine);
        _scene.remove(m.label);
        m.line1.geometry.dispose();
        m.line1.material.dispose();
        m.line2.geometry.dispose();
        m.line2.material.dispose();
        m.midLine.geometry.dispose();
        m.midLine.material.dispose();
        for (const mk of m.markers) {
            _scene.remove(mk);
            mk.geometry.dispose();
            mk.material.dispose();
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

    for (const marker of markers) {
        const dist = camera.position.distanceTo(marker.position);
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
    const mat = new THREE.MeshBasicMaterial({ color: ANGLE_MARKER_COLOR, depthTest: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 999;
    mesh.position.copy(position);
    mesh.userData._isMeasurement = true;
    return mesh;
}

function _createAngleLine(p1, p2) {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const mat = new THREE.LineBasicMaterial({ color: ANGLE_LINE_COLOR, depthTest: false });
    const line = new THREE.Line(geo, mat);
    line.renderOrder = 999;
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
    for (const m of _angleMarkers) {
        if (_scene) _scene.remove(m);
        m.geometry.dispose();
        m.material.dispose();
    }
    _angleMarkers = [];
    if (_angleLine1 && _scene) {
        _scene.remove(_angleLine1);
        _angleLine1.geometry.dispose();
        _angleLine1.material.dispose();
        _angleLine1 = null;
    }
    _anglePoints = [];
    _angleStep = 0;
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

export function addAnglePoint(point, renderFn) {
    if (!_angleActive || !_scene) return;

    const p = point.clone();
    _anglePoints.push(p);
    const marker = _createAngleMarker(p);
    _scene.add(marker);
    _angleMarkers.push(marker);
    _angleStep++;

    if (_angleStep === 2) {
        // Draw first line
        _angleLine1 = _createAngleLine(_anglePoints[0], _anglePoints[1]);
        _scene.add(_angleLine1);
        _hideAnglePreview();
        if (renderFn) renderFn();
    } else if (_angleStep === 4) {
        // Draw second line and compute angles
        const line2 = _createAngleLine(_anglePoints[2], _anglePoints[3]);
        _scene.add(line2);

        const v1 = new THREE.Vector3().subVectors(_anglePoints[1], _anglePoints[0]);
        const v2 = new THREE.Vector3().subVectors(_anglePoints[3], _anglePoints[2]);

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

        // Place label at midpoint of the two lines' midpoints
        const mid1 = new THREE.Vector3().addVectors(_anglePoints[0], _anglePoints[1]).multiplyScalar(0.5);
        const mid2 = new THREE.Vector3().addVectors(_anglePoints[2], _anglePoints[3]).multiplyScalar(0.5);
        const labelPos = new THREE.Vector3().addVectors(mid1, mid2).multiplyScalar(0.5);

        // Connecting line between midpoints of the two lines
        const geoMid = new THREE.BufferGeometry().setFromPoints([mid1, mid2]);
        const matMid = new THREE.LineDashedMaterial({ color: ANGLE_LINE_COLOR, dashSize: 3, gapSize: 2, depthTest: false, transparent: true, opacity: 0.5 });
        const midLine = new THREE.Line(geoMid, matMid);
        midLine.computeLineDistances();
        midLine.renderOrder = 999;
        midLine.userData._isMeasurement = true;
        _scene.add(midLine);

        const label = _createAngleLabel(labelText, labelPos);
        _scene.add(label);

        // Store for cleanup
        const storedMarkers = _angleMarkers.slice();
        _angleMeasurements.push({
            line1: _angleLine1, line2, midLine, label,
            markers: storedMarkers,
            points: _anglePoints.slice()
        });

        // Reset pending state
        _angleLine1 = null;
        _angleMarkers = [];
        _anglePoints = [];
        _angleStep = 0;
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
        const geo = new THREE.BufferGeometry().setFromPoints([lastPoint, point]);
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
        _scene.remove(m.line1);
        _scene.remove(m.line2);
        _scene.remove(m.midLine);
        _scene.remove(m.label);
        m.line1.geometry.dispose();
        m.line1.material.dispose();
        m.line2.geometry.dispose();
        m.line2.material.dispose();
        m.midLine.geometry.dispose();
        m.midLine.material.dispose();
        for (const mk of m.markers) {
            _scene.remove(mk);
            mk.geometry.dispose();
            mk.material.dispose();
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
