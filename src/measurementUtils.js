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
