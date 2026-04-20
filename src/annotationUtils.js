// annotationUtils.js – Annotation (note) system with CSS2D labels
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// --- Private state ---
let _scene = null;
let _annotations = []; // { marker, label, point, text, ownerObject, leaderLine }
let _active = false;
let _depthTestEnabled = true; // true = skryté za modelem (výchozí), false = vždy viditelné přes model
let _pendingPoint = null;   // THREE.Vector3 | null – first click (on object surface)
let _pendingMarker = null;  // Mesh for pending point
let _pendingOwner = null;   // Owner object for the first click
let _previewMarker = null;  // Hover preview sphere (follows cursor)
let _previewLine = null;    // Dashed line from pending point to cursor
let _renderFn = null;
let _dialogOpen = false;     // Guard flag to prevent click-through from dialog

const MARKER_RADIUS = 1;
const MARKER_COLOR = 0x44aa44;
const MARKER_PREVIEW_COLOR = 0x88cc88;
const LINE_COLOR = 0x44aa44;
const MARKER_SCREEN_SIZE = 5;

// --- Helpers ---

function _createMarker(position) {
    const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: MARKER_COLOR, depthTest: _depthTestEnabled });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = _depthTestEnabled ? 0 : 999;
    mesh.position.copy(position);
    mesh.userData._isAnnotation = true;
    return mesh;
}

function _createLabel(text, position) {
    const div = document.createElement('div');
    div.className = 'annotation-label';
    div.textContent = text;
    div.style.cssText = 'color:#fff;background:rgba(40,140,40,0.88);padding:3px 8px;border-radius:4px;font-size:11px;white-space:pre-wrap;max-width:220px;line-height:1.4;pointer-events:auto;cursor:default;user-select:none;';
    const label = new CSS2DObject(div);
    label.position.copy(position);
    label.userData._isAnnotation = true;
    return label;
}

function _createLeaderLine(p1, p2) {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const mat = new THREE.LineDashedMaterial({ color: LINE_COLOR, dashSize: 3, gapSize: 2, depthTest: _depthTestEnabled, transparent: true, opacity: 0.6 });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    line.renderOrder = _depthTestEnabled ? 0 : 998;
    line.userData._isAnnotation = true;
    return line;
}

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

function _showTextDialog(defaultText) {
    return new Promise((resolve) => {
        // Overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.45);z-index:100000;display:flex;align-items:center;justify-content:center;';

        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:#2a2a2a;color:#fff;border-radius:8px;padding:16px 20px;min-width:300px;max-width:420px;box-shadow:0 4px 24px rgba(0,0,0,0.5);font-family:sans-serif;';

        const title = document.createElement('div');
        title.textContent = defaultText ? 'Upravit poznámku' : 'Nová poznámka';
        title.style.cssText = 'font-size:14px;font-weight:bold;margin-bottom:10px;';

        const textarea = document.createElement('textarea');
        textarea.value = defaultText || '';
        textarea.style.cssText = 'width:100%;min-height:80px;resize:vertical;background:#1a1a1a;color:#fff;border:1px solid #555;border-radius:4px;padding:8px;font-size:12px;font-family:sans-serif;box-sizing:border-box;';
        textarea.placeholder = 'Zadejte text poznámky...';

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;justify-content:flex-end;gap:8px;margin-top:12px;';

        const btnCancel = document.createElement('button');
        btnCancel.textContent = 'Zrušit';
        btnCancel.style.cssText = 'padding:6px 16px;border:1px solid #666;background:#444;color:#fff;border-radius:4px;cursor:pointer;font-size:12px;';

        const btnOk = document.createElement('button');
        btnOk.textContent = 'OK';
        btnOk.style.cssText = 'padding:6px 16px;border:none;background:#4a4;color:#fff;border-radius:4px;cursor:pointer;font-size:12px;';

        btnRow.appendChild(btnCancel);
        btnRow.appendChild(btnOk);
        dialog.appendChild(title);
        dialog.appendChild(textarea);
        dialog.appendChild(btnRow);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        textarea.focus();

        function cleanup(result) {
            document.body.removeChild(overlay);
            resolve(result);
        }

        btnOk.addEventListener('click', (e) => {
            e.stopPropagation();
            const val = textarea.value.trim();
            cleanup(val || null);
        });

        btnCancel.addEventListener('click', (e) => {
            e.stopPropagation();
            cleanup(null);
        });

        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const val = textarea.value.trim();
                cleanup(val || null);
            }
            if (e.key === 'Escape') {
                cleanup(null);
            }
        });

        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target === overlay) cleanup(null);
        });
    });
}

// --- Public API ---

export function initAnnotations(scene, renderFn) {
    _scene = scene;
    _renderFn = renderFn;
}

export function isAnnotationActive() {
    return _active;
}

/**
 * Returns the pending anchor point (world-space) if awaiting second click, otherwise null.
 */
export function getAnnotationPendingPoint() {
    return _pendingPoint ? _pendingPoint.clone() : null;
}

export function setAnnotationActive(val) {
    _active = val;
    if (!val) {
        // Cancel pending first-click
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
 * First call sets the anchor point, second call opens a dialog to enter text.
 * @param {THREE.Vector3} point – world-space intersection point
 * @param {THREE.Object3D} ownerObject – object to parent annotation to
 * @param {Function} renderFn – callback to trigger a render
 */
export function addAnnotationPoint(point, ownerObject, renderFn) {
    if (!_active || !_scene || _dialogOpen) return;
    const owner = ownerObject || _scene;

    if (!_pendingPoint) {
        // --- First click: place anchor point on object ---
        _pendingOwner = owner;
        _pendingPoint = point.clone();
        owner.updateWorldMatrix(true, false);
        const localP = owner.worldToLocal(point.clone());
        _pendingMarker = _createMarker(localP);
        owner.add(_pendingMarker);
        if (renderFn) renderFn();
    } else {
        // --- Second click: create annotation immediately, then open edit dialog ---
        const owner1 = _pendingOwner || _scene;
        owner1.updateWorldMatrix(true, false);

        const anchorWorld = _pendingPoint.clone();
        const labelWorld = point.clone();

        // Convert to owner local space
        const anchorLocal = owner1.worldToLocal(anchorWorld.clone());
        const labelLocal = owner1.worldToLocal(labelWorld.clone());

        const defaultText = 'txt';

        // Create annotation visuals immediately
        const marker = _pendingMarker; // reuse pending marker
        const label = _createLabel(defaultText, labelLocal);
        const leaderLine = _createLeaderLine(anchorLocal, labelLocal);

        owner1.add(label);
        owner1.add(leaderLine);

        const annotation = { marker, label, leaderLine, anchorLocal: anchorLocal.clone(), labelLocal: labelLocal.clone(), text: defaultText, ownerObject: owner1 };
        _annotations.push(annotation);

        // Attach dblclick handler for editing
        label.element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            _editAnnotation(annotation, renderFn);
        });

        // Store in userData for GLB export
        if (!owner1.userData.annotations) owner1.userData.annotations = [];
        owner1.userData.annotations.push({
            type: 'note',
            anchor: { x: anchorLocal.x, y: anchorLocal.y, z: anchorLocal.z },
            labelPos: { x: labelLocal.x, y: labelLocal.y, z: labelLocal.z },
            text: defaultText
        });

        // Reset pending state
        _pendingPoint = null;
        _pendingMarker = null;
        _pendingOwner = null;
        _hidePreview();
        if (renderFn) renderFn();

        // Open edit dialog for the newly created annotation
        _editAnnotation(annotation, renderFn);
    }
}

async function _editAnnotation(annotation, renderFn) {
    _dialogOpen = true;
    const newText = await _showTextDialog(annotation.text);
    await new Promise(r => setTimeout(r, 50));
    _dialogOpen = false;
    if (newText === null) return; // cancelled

    annotation.text = newText;
    annotation.label.element.textContent = newText;

    // Update userData
    const owner = annotation.ownerObject;
    if (owner && owner.userData && Array.isArray(owner.userData.annotations)) {
        const rec = owner.userData.annotations.find(a =>
            a.type === 'note' &&
            Math.abs(a.anchor.x - annotation.anchorLocal.x) < 1e-6 &&
            Math.abs(a.anchor.y - annotation.anchorLocal.y) < 1e-6 &&
            Math.abs(a.anchor.z - annotation.anchorLocal.z) < 1e-6
        );
        if (rec) rec.text = newText;
    }
    if (renderFn) renderFn();
}

/**
 * Update hover preview when annotation mode is active.
 */
export function updateAnnotationPreview(point) {
    if (!_active || !_scene) {
        _hidePreview();
        return;
    }
    if (!point) {
        _hidePreview();
        return;
    }

    // Show/move preview marker
    if (!_previewMarker) {
        const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
        const mat = new THREE.MeshBasicMaterial({ color: MARKER_PREVIEW_COLOR, depthTest: false, transparent: true, opacity: 0.7 });
        _previewMarker = new THREE.Mesh(geo, mat);
        _previewMarker.renderOrder = 999;
        _previewMarker.userData._isAnnotation = true;
        _scene.add(_previewMarker);
    }
    _previewMarker.position.copy(point);

    // Dashed line from pending point to cursor
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
        _previewLine.userData._isAnnotation = true;
        _scene.add(_previewLine);
    } else if (_previewLine) {
        _scene.remove(_previewLine);
        _previewLine.geometry.dispose();
        _previewLine.material.dispose();
        _previewLine = null;
    }
}

/**
 * Scale annotation markers to maintain constant screen size.
 */
export function updateAnnotationMarkerScales(camera) {
    if (!camera) return;
    const markers = [];
    for (const a of _annotations) markers.push(a.marker);
    if (_pendingMarker) markers.push(_pendingMarker);
    if (_previewMarker) markers.push(_previewMarker);
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

export function setAnnotationsVisible(visible) {
    for (const a of _annotations) {
        a.marker.visible = visible;
        a.label.visible = visible;
        if (a.leaderLine) a.leaderLine.visible = visible;
    }
}

/**
 * Enable / disable depth testing for annotation markers and leader lines.
 * enabled=false → vždy viditelné (přes model), enabled=true → skryté za modelem.
 */
export function setAnnotationDepthTest(enabled) {
    _depthTestEnabled = enabled;
    for (const a of _annotations) {
        a.marker.material.depthTest = enabled;
        a.marker.renderOrder = enabled ? 0 : 999;
        if (a.leaderLine) {
            a.leaderLine.material.depthTest = enabled;
            a.leaderLine.renderOrder = enabled ? 0 : 998;
        }
    }
}

export function clearAnnotations(renderFn) {
    if (!_scene) return;

    // Remove pending
    if (_pendingMarker) {
        const pendingParent = _pendingOwner || _scene;
        pendingParent.remove(_pendingMarker);
        _pendingMarker.geometry.dispose();
        _pendingMarker.material.dispose();
        _pendingMarker = null;
    }
    _pendingPoint = null;
    _pendingOwner = null;

    // Remove completed annotations
    for (const a of _annotations) {
        const owner = a.ownerObject || _scene;
        owner.remove(a.marker);
        owner.remove(a.label);
        if (a.leaderLine) {
            owner.remove(a.leaderLine);
            a.leaderLine.geometry.dispose();
            a.leaderLine.material.dispose();
        }
        a.marker.geometry.dispose();
        a.marker.material.dispose();
        // Clean up userData
        if (owner.userData.annotations) {
            owner.userData.annotations = owner.userData.annotations.filter(d => d.type !== 'note');
            if (owner.userData.annotations.length === 0) delete owner.userData.annotations;
        }
    }
    _annotations = [];
    _hidePreview();
    if (renderFn) renderFn();
}

export function getAnnotationCount() {
    return _annotations.length;
}

/**
 * Remove all annotations whose ownerObject is `root` or a descendant of it.
 * Cleans up CSS2D label DOM elements, disposes geometry/material, updates internal array.
 */
export function removeAnnotationsForOwner(root) {
    if (!root) return;
    const owned = new Set();
    root.traverse(obj => owned.add(obj));

    _annotations = _annotations.filter(a => {
        if (!owned.has(a.ownerObject)) return true;
        if (a.label && a.label.element) a.label.element.remove();
        a.marker.geometry.dispose(); a.marker.material.dispose();
        if (a.leaderLine) { a.leaderLine.geometry.dispose(); a.leaderLine.material.dispose(); }
        return false;
    });
}

/**
 * Return the internal annotations array (for select-dimension integration).
 */
export function getAnnotations() {
    return _annotations;
}

/**
 * Update the leader line of an annotation from anchorLocal to the new label position.
 */
export function updateAnnotationLeaderLine(annotation, newLabelPos) {
    const owner = annotation.ownerObject || _scene;
    if (annotation.leaderLine) {
        owner.remove(annotation.leaderLine);
        annotation.leaderLine.geometry.dispose();
        annotation.leaderLine.material.dispose();
    }
    annotation.leaderLine = _createLeaderLine(annotation.anchorLocal, newLabelPos);
    owner.add(annotation.leaderLine);
}

/**
 * Sync annotation label position back to userData after drag.
 */
export function syncAnnotationLabelPos(annotation) {
    const owner = annotation.ownerObject;
    const pos = annotation.label.position;
    annotation.labelLocal.copy(pos);
    if (owner && owner.userData && Array.isArray(owner.userData.annotations)) {
        const rec = owner.userData.annotations.find(a =>
            a.type === 'note' &&
            Math.abs(a.anchor.x - annotation.anchorLocal.x) < 1e-6 &&
            Math.abs(a.anchor.y - annotation.anchorLocal.y) < 1e-6 &&
            Math.abs(a.anchor.z - annotation.anchorLocal.z) < 1e-6
        );
        if (rec) rec.labelPos = { x: pos.x, y: pos.y, z: pos.z };
    }
}

/**
 * Strip annotation visual objects from a cloned tree (for GLB export).
 * Keeps userData.annotations intact for reconstruction on import.
 */
export function stripAnnotationVisuals(root) {
    if (!root) return;
    const toRemove = [];
    root.traverse(function (child) {
        if (child.userData && child.userData._isAnnotation) {
            toRemove.push(child);
        }
    });
    for (const obj of toRemove) {
        if (obj.parent) obj.parent.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }
}

/**
 * Reconstruct annotation visuals from userData after GLB import.
 */
export function reconstructAnnotations(root, renderFn) {
    if (!root) return;
    root.traverse(function (node) {
        const data = node.userData && node.userData.annotations;
        if (!Array.isArray(data) || data.length === 0) return;
        node.updateWorldMatrix(true, false);

        for (const rec of data) {
            if (rec.type === 'note') {
                _reconstructAnnotation(node, rec, renderFn);
            }
        }
    });
}

function _reconstructAnnotation(owner, rec, renderFn) {
    const anchorLocal = new THREE.Vector3(rec.anchor.x, rec.anchor.y, rec.anchor.z);
    const labelLocal = rec.labelPos
        ? new THREE.Vector3(rec.labelPos.x, rec.labelPos.y, rec.labelPos.z)
        : anchorLocal.clone().add(new THREE.Vector3(5, 5, 0));

    const marker = _createMarker(anchorLocal);
    const label = _createLabel(rec.text, labelLocal);
    const leaderLine = _createLeaderLine(anchorLocal, labelLocal);

    owner.add(marker);
    owner.add(label);
    owner.add(leaderLine);

    const annotation = { marker, label, leaderLine, anchorLocal: anchorLocal.clone(), labelLocal: labelLocal.clone(), text: rec.text, ownerObject: owner };
    _annotations.push(annotation);

    // Attach dblclick handler for editing
    label.element.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        _editAnnotation(annotation, renderFn);
    });
}
