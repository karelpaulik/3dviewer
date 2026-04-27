// annotation3dUtils.js – CSS3D annotation system (labels rendered as 3D-oriented DOM elements)
import * as THREE from 'three';
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { showAnnotationTextDialog } from './annotationUtils.js';

// --- Private state ---
let _scene = null;
let _annotations3d = [];  // { label, labelLocal, text, ownerObject, _userDataRec, leaderLines, orientationMode }
let _active = false;
let _depthTestEnabled = true;
let _pendingPoint = null;
let _pendingMarker = null;
let _pendingOwner = null;
let _previewMarker = null;
let _previewLine = null;
let _renderFn = null;
let _dialogOpen = false;
let _pendingAddLeaderAnnotation = null;  // Annotation waiting for add-leader-line click
let _currentCamera = null;               // Updated each frame via updateAnnotation3dOrientations()

const MARKER_RADIUS = 1;
const MARKER_COLOR = 0x4499cc;
const MARKER_PREVIEW_COLOR = 0x88ccee;
const LINE_COLOR = 0x4499cc;
const MARKER_SCREEN_SIZE = 5;
const LABEL_SCALE = 0.2;  // CSS pixels → scene world units

const ORIENT_MODES = [
    { key: 'camera', label: 'Face camera' },
    { key: 'XY',     label: 'XY plane'    },
    { key: 'XZ',     label: 'XZ plane'    },
    { key: 'YZ',     label: 'YZ plane'    },
];

// --- Default settings for new annotations ---
const _defaults3d = {
    labelScale:      1,
    rotationCamera:  0,
    rotationXY:      0,
    rotationXZ:      0,
    rotationYZ:      0,
    orientationMode: 'camera',
    textColor:       '#ffffff',
    bgColor:         '#2850a0',
};

function _defaultRotation() {
    const m = _defaults3d.orientationMode;
    if (m === 'XY') return _defaults3d.rotationXY;
    if (m === 'XZ') return _defaults3d.rotationXZ;
    if (m === 'YZ') return _defaults3d.rotationYZ;
    return _defaults3d.rotationCamera;
}

export function getAnnotation3dDefaults() {
    return _defaults3d;
}

// --- Helpers ---

function _createMarker(position) {
    const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: MARKER_COLOR, depthTest: _depthTestEnabled });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = _depthTestEnabled ? 0 : 999;
    mesh.position.copy(position);
    mesh.userData._isAnnotation3d = true;
    return mesh;
}

function _createLabel3d(text, position) {
    const div = document.createElement('div');
    div.className = 'annotation-label annotation-label-3d';
    div.innerHTML = text;
    div.style.cssText = 'color:#fff;background:rgba(40,80,160,0.88);padding:3px 8px;border-radius:4px;font-size:11px;max-width:220px;line-height:1.4;pointer-events:auto;cursor:default;user-select:none;word-break:break-word;white-space:nowrap;';
    const label = new CSS3DObject(div);
    label.position.copy(position);
    label.scale.setScalar(LABEL_SCALE);
    label.userData._isAnnotation3d = true;
    return label;
}

function _createLeaderLine(p1, p2) {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const mat = new THREE.LineDashedMaterial({
        color: LINE_COLOR, dashSize: 3, gapSize: 2,
        depthTest: _depthTestEnabled, transparent: true, opacity: 0.6,
    });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    line.renderOrder = _depthTestEnabled ? 0 : 998;
    line.userData._isAnnotation3d = true;
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

/**
 * Apply the annotation's orientationMode to its CSS3DObject quaternion.
 * Also applies rotationAngle (rotation around label-local Z axis).
 */
function _applyOrientation(annotation, camera) {
    if (!annotation.label || !camera) return;
    const owner = annotation.ownerObject || _scene;

    const ownerWorldQuat = new THREE.Quaternion();
    owner.getWorldQuaternion(ownerWorldQuat);
    const ownerWorldQuatInv = ownerWorldQuat.clone().invert();

    let targetWorldQuat;

    if (annotation.orientationMode === 'camera') {
        const labelWorldPos = new THREE.Vector3();
        annotation.label.getWorldPosition(labelWorldPos);
        const m = new THREE.Matrix4();
        m.lookAt(camera.position, labelWorldPos, camera.up);
        targetWorldQuat = new THREE.Quaternion().setFromRotationMatrix(m);
    } else if (annotation.orientationMode === 'XY') {
        targetWorldQuat = new THREE.Quaternion(); // identity – faces +Z world axis
    } else if (annotation.orientationMode === 'XZ') {
        targetWorldQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
    } else { // YZ
        targetWorldQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    }

    // Apply additional in-plane rotation (around label-local Z)
    const rotAngle = annotation.rotationAngle || 0;
    if (rotAngle !== 0) {
        const rotQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), rotAngle);
        targetWorldQuat.multiply(rotQ);
    }

    // Convert world quaternion to owner-local quaternion
    annotation.label.quaternion.copy(ownerWorldQuatInv).multiply(targetWorldQuat);
}

function _applyScale(annotation) {
    if (!annotation.label) return;
    const s = LABEL_SCALE * (annotation.labelScale || 1);
    annotation.label.scale.set(annotation.mirrored ? -s : s, s, s);
}

function _applyColors(annotation) {
    if (!annotation.label) return;
    const el = annotation.label.element;
    el.style.color = annotation.textColor || '#ffffff';
    el.style.background = annotation.bgColor || '#2850a0';
}

function _showSizeDialog(currentScale) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.45);z-index:200001;display:flex;align-items:center;justify-content:center;';

        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:#2a2a2a;color:#fff;border-radius:8px;padding:16px 20px;min-width:260px;box-shadow:0 4px 24px rgba(0,0,0,0.5);font-family:sans-serif;';

        const title = document.createElement('div');
        title.textContent = 'Label size (scale multiplier)';
        title.style.cssText = 'font-size:13px;font-weight:bold;margin-bottom:10px;';

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0.1';
        input.max = '20';
        input.step = '0.1';
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

        btnRow.appendChild(btnCancel);
        btnRow.appendChild(btnOk);
        dialog.appendChild(title);
        dialog.appendChild(input);
        dialog.appendChild(btnRow);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        input.focus();
        input.select();

        function cleanup(result) {
            document.body.removeChild(overlay);
            resolve(result);
        }

        btnOk.addEventListener('click', () => {
            const v = parseFloat(input.value);
            cleanup(isFinite(v) && v > 0 ? v : null);
        });
        btnCancel.addEventListener('click', () => cleanup(null));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') btnOk.click();
            if (e.key === 'Escape') cleanup(null);
        });
        overlay.addEventListener('click', (e) => { e.stopPropagation(); });
    });
}

async function _editAnnotation(annotation, renderFn) {
    _dialogOpen = true;
    const newText = await showAnnotationTextDialog(annotation.text);
    await new Promise(r => setTimeout(r, 50));
    _dialogOpen = false;
    if (newText === null) return;
    annotation.text = newText;
    annotation.label.element.innerHTML = newText;
    if (annotation._userDataRec) annotation._userDataRec.text = newText;
    if (renderFn) renderFn();
}

function _deleteAnnotation(annotation, renderFn) {
    const owner = annotation.ownerObject || _scene;
    owner.remove(annotation.label);
    annotation.leaderLines.forEach(ll => {
        owner.remove(ll.marker);
        owner.remove(ll.line);
        ll.marker.geometry.dispose(); ll.marker.material.dispose();
        ll.line.geometry.dispose();   ll.line.material.dispose();
    });
    if (annotation._userDataRec && owner.userData && Array.isArray(owner.userData.annotations3d)) {
        const idx = owner.userData.annotations3d.indexOf(annotation._userDataRec);
        if (idx !== -1) owner.userData.annotations3d.splice(idx, 1);
        if (owner.userData.annotations3d.length === 0) delete owner.userData.annotations3d;
    }
    const i = _annotations3d.indexOf(annotation);
    if (i !== -1) _annotations3d.splice(i, 1);
    if (renderFn) renderFn();
}

function _removeLeaderLine(annotation, index, renderFn) {
    if (index < 0 || index >= annotation.leaderLines.length) return;
    const owner = annotation.ownerObject || _scene;
    const ll = annotation.leaderLines[index];
    owner.remove(ll.marker);
    owner.remove(ll.line);
    ll.marker.geometry.dispose(); ll.marker.material.dispose();
    ll.line.geometry.dispose();   ll.line.material.dispose();
    annotation.leaderLines.splice(index, 1);
    if (annotation._userDataRec && Array.isArray(annotation._userDataRec.anchors)) {
        annotation._userDataRec.anchors.splice(index, 1);
    }
    if (renderFn) renderFn();
}

function _addLeaderLine(annotation, anchorWorld, renderFn) {
    const owner = annotation.ownerObject || _scene;
    owner.updateWorldMatrix(true, false);
    const anchorLocal = owner.worldToLocal(anchorWorld.clone());
    const labelPos = annotation.label.position;
    const marker = _createMarker(anchorLocal);
    const line = _createLeaderLine(anchorLocal, labelPos);
    owner.add(marker);
    owner.add(line);
    annotation.leaderLines.push({ marker, line, anchorLocal: anchorLocal.clone() });
    if (annotation._userDataRec) {
        if (!Array.isArray(annotation._userDataRec.anchors)) annotation._userDataRec.anchors = [];
        annotation._userDataRec.anchors.push({ x: anchorLocal.x, y: anchorLocal.y, z: anchorLocal.z });
    }
    if (renderFn) renderFn();
}

function _attachHandlers(annotation, renderFn) {
    annotation.label.element.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        _editAnnotation(annotation, renderFn).catch(() => {});
    });
    annotation.label.element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        _showAnnotation3dContextMenu(annotation, e.clientX, e.clientY, renderFn);
    });
}

function _showAnnotation3dContextMenu(annotation, x, y, renderFn) {
    const existing = document.getElementById('_annotation3d-ctx-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = '_annotation3d-ctx-menu';
    menu.style.cssText = `position:fixed;left:${x}px;top:${y}px;background:#2a2a2a;color:#fff;border:1px solid #555;border-radius:5px;padding:4px 0;z-index:200000;min-width:180px;box-shadow:0 4px 16px rgba(0,0,0,0.5);font-family:sans-serif;font-size:12px;`;

    const item = (label, cb) => {
        const el = document.createElement('div');
        el.textContent = label;
        el.style.cssText = 'padding:1px 12px;cursor:pointer;';
        el.addEventListener('mouseenter', () => el.style.background = '#444');
        el.addEventListener('mouseleave', () => el.style.background = '');
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('click', (e) => { e.stopPropagation(); menu.remove(); cb(); });
        menu.appendChild(el);
    };

    const sep = () => {
        const el = document.createElement('div');
        el.style.cssText = 'height:1px;background:#444;margin:3px 0;';
        menu.appendChild(el);
    };

    const sectionLabel = (text) => {
        const el = document.createElement('div');
        el.textContent = text;
        el.style.cssText = 'padding:2px 12px;color:#aaa;font-size:11px;';
        menu.appendChild(el);
    };

    item('➕ Add leader line', () => {
        _pendingAddLeaderAnnotation = annotation;
        if (_renderFn) _renderFn();
    });

    if (annotation.leaderLines.length > 1) {
        sep();
        annotation.leaderLines.forEach((ll, idx) => {
            item(`✕ Remove leader line ${idx + 1}`, () => {
                _removeLeaderLine(annotation, idx, renderFn);
            });
        });
    } else if (annotation.leaderLines.length === 1) {
        item('✕ Remove leader line', () => {
            _removeLeaderLine(annotation, 0, renderFn);
        });
    }

    sep();
    item('✏ Edit text', () => { _editAnnotation(annotation, renderFn).catch(() => {}); });
    item('↻ Rotate +90°', () => {
        annotation.rotationAngle = ((annotation.rotationAngle || 0) + Math.PI / 2) % (Math.PI * 2);
        if (annotation._userDataRec) annotation._userDataRec.rotationAngle = annotation.rotationAngle;
        if (_currentCamera) _applyOrientation(annotation, _currentCamera);
        if (renderFn) renderFn();
    });
    item('↺ Rotate -90°', () => {
        annotation.rotationAngle = ((annotation.rotationAngle || 0) - Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
        if (annotation._userDataRec) annotation._userDataRec.rotationAngle = annotation.rotationAngle;
        if (_currentCamera) _applyOrientation(annotation, _currentCamera);
        if (renderFn) renderFn();
    });
    item('⤢ Edit size…', () => {
        _showSizeDialog(annotation.labelScale || 1).then(v => {
            if (v === null) return;
            annotation.labelScale = v;
            if (annotation._userDataRec) annotation._userDataRec.labelScale = v;
            _applyScale(annotation);
            if (renderFn) renderFn();
        });
    });
    item((annotation.mirrored ? '☑' : '☐') + ' Mirror text', () => {
        annotation.mirrored = !annotation.mirrored;
        if (annotation._userDataRec) annotation._userDataRec.mirrored = annotation.mirrored;
        _applyScale(annotation);
        if (renderFn) renderFn();
    });

    const colorItem = (labelText, currentColor, onChange) => {
        const el = document.createElement('div');
        el.style.cssText = 'padding:2px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:default;';
        const span = document.createElement('span');
        span.textContent = labelText;
        span.style.fontSize = '13px';
        const inp = document.createElement('input');
        inp.type = 'color';
        inp.value = currentColor;
        inp.style.cssText = 'width:26px;height:18px;border:none;padding:0;cursor:pointer;background:none;';
        inp.addEventListener('mousedown', e => e.stopPropagation());
        inp.addEventListener('click', e => e.stopPropagation());
        inp.addEventListener('input', e => { e.stopPropagation(); onChange(inp.value); });
        el.appendChild(span);
        el.appendChild(inp);
        menu.appendChild(el);
    };

    sep();
    colorItem('Text color', annotation.textColor || '#ffffff', (color) => {
        annotation.textColor = color;
        if (annotation._userDataRec) annotation._userDataRec.textColor = color;
        _applyColors(annotation);
        if (renderFn) renderFn();
    });
    colorItem('Background', annotation.bgColor || '#2850a0', (color) => {
        annotation.bgColor = color;
        if (annotation._userDataRec) annotation._userDataRec.bgColor = color;
        _applyColors(annotation);
        if (renderFn) renderFn();
    });

    item('🗑 Delete annotation', () => { _deleteAnnotation(annotation, renderFn); });

    sep();
    sectionLabel('Orientation:');

    for (const { key, label } of ORIENT_MODES) {
        const el = document.createElement('div');
        const isActive = annotation.orientationMode === key;
        el.textContent = (isActive ? '● ' : '○ ') + label;
        el.style.cssText = `padding:1px 12px;cursor:pointer;${isActive ? 'color:#88ccff;' : ''}`;
        el.addEventListener('mouseenter', () => el.style.background = '#444');
        el.addEventListener('mouseleave', () => el.style.background = '');
        el.addEventListener('mousedown', (e) => e.stopPropagation());
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.remove();
            annotation.orientationMode = key;
            if (annotation._userDataRec) annotation._userDataRec.orientationMode = key;
            if (_currentCamera) _applyOrientation(annotation, _currentCamera);
            if (renderFn) renderFn();
        });
        menu.appendChild(el);
    }

    document.body.appendChild(menu);

    const close = (e) => {
        if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('mousedown', close, true); }
    };
    setTimeout(() => document.addEventListener('mousedown', close, true), 0);
}

// --- Public API ---

export function deleteAnnotation3dByRef(annotation, renderFn) {
    _deleteAnnotation(annotation, renderFn);
}

export function initAnnotations3d(scene, renderFn) {
    _scene = scene;
    _renderFn = renderFn;
}

export function isAnnotation3dActive() {
    return _active;
}

export function getAnnotation3dPendingPoint() {
    return _pendingPoint ? _pendingPoint.clone() : null;
}

export function setAnnotation3dActive(val) {
    _active = val;
    if (!val) {
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
 * First call sets the anchor point, second call creates the annotation and opens the text dialog.
 */
export function addAnnotation3dPoint(point, ownerObject, renderFn) {
    if (!_active || !_scene || _dialogOpen) return;
    const owner = ownerObject || _scene;

    if (!_pendingPoint) {
        // First click: place anchor marker
        _pendingOwner = owner;
        _pendingPoint = point.clone();
        owner.updateWorldMatrix(true, false);
        const localP = owner.worldToLocal(point.clone());
        _pendingMarker = _createMarker(localP);
        owner.add(_pendingMarker);
        if (renderFn) renderFn();
    } else {
        // Second click: build annotation, open dialog
        const owner1 = _pendingOwner || _scene;
        owner1.updateWorldMatrix(true, false);

        const anchorLocal = owner1.worldToLocal(_pendingPoint.clone());
        const labelLocal  = owner1.worldToLocal(point.clone());
        const defaultText = 'txt';

        const marker = _pendingMarker;
        const line   = _createLeaderLine(anchorLocal, labelLocal);
        const label  = _createLabel3d(defaultText, labelLocal);

        owner1.add(label);
        owner1.add(line);

        if (!owner1.userData.annotations3d) owner1.userData.annotations3d = [];
        const userDataRec = {
            type: 'note3d',
            anchors: [{ x: anchorLocal.x, y: anchorLocal.y, z: anchorLocal.z }],
            labelPos: { x: labelLocal.x, y: labelLocal.y, z: labelLocal.z },
            text: defaultText,
            orientationMode: _defaults3d.orientationMode,
            rotationAngle:   _defaultRotation(),
            labelScale:      _defaults3d.labelScale,
            mirrored: false,
            textColor: _defaults3d.textColor,
            bgColor:   _defaults3d.bgColor,
        };
        owner1.userData.annotations3d.push(userDataRec);

        const annotation = {
            label,
            leaderLines: [{ marker, line, anchorLocal: anchorLocal.clone() }],
            labelLocal: labelLocal.clone(),
            text: defaultText,
            ownerObject: owner1,
            _userDataRec: userDataRec,
            orientationMode: _defaults3d.orientationMode,
            rotationAngle:   _defaultRotation(),
            labelScale:      _defaults3d.labelScale,
            mirrored: false,
            textColor: _defaults3d.textColor,
            bgColor:   _defaults3d.bgColor,
        };
        _annotations3d.push(annotation);

        if (_currentCamera) _applyOrientation(annotation, _currentCamera);
        _applyScale(annotation);
        _applyColors(annotation);
        _attachHandlers(annotation, renderFn);

        _pendingPoint  = null;
        _pendingMarker = null;
        _pendingOwner  = null;
        _hidePreview();
        if (renderFn) renderFn();

        _editAnnotation(annotation, renderFn);
    }
}

/**
 * Update hover preview sphere and dashed preview line while in annotation3d mode.
 */
export function updateAnnotation3dPreview(point) {
    const addLeaderMode = _pendingAddLeaderAnnotation !== null;
    if (!_active && !addLeaderMode) { _hidePreview(); return; }
    if (!point) { _hidePreview(); return; }

    if (!_previewMarker) {
        const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
        const mat = new THREE.MeshBasicMaterial({ color: MARKER_PREVIEW_COLOR, depthTest: false, transparent: true, opacity: 0.7 });
        _previewMarker = new THREE.Mesh(geo, mat);
        _previewMarker.renderOrder = 999;
        _previewMarker.userData._isAnnotation3d = true;
        _scene.add(_previewMarker);
    }
    _previewMarker.position.copy(point);

    let lineFrom = null;
    if (_pendingPoint) {
        lineFrom = _pendingPoint;
    } else if (addLeaderMode) {
        const ann   = _pendingAddLeaderAnnotation;
        const owner = ann.ownerObject || _scene;
        owner.updateWorldMatrix(true, false);
        lineFrom = owner.localToWorld(ann.label.position.clone());
    }

    if (lineFrom) {
        if (_previewLine) {
            _scene.remove(_previewLine);
            _previewLine.geometry.dispose();
            _previewLine.material.dispose();
        }
        const geo = new THREE.BufferGeometry().setFromPoints([lineFrom, point]);
        const mat = new THREE.LineDashedMaterial({ color: LINE_COLOR, dashSize: 4, gapSize: 3, depthTest: false });
        _previewLine = new THREE.Line(geo, mat);
        _previewLine.computeLineDistances();
        _previewLine.renderOrder = 999;
        _previewLine.userData._isAnnotation3d = true;
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
export function updateAnnotation3dMarkerScales(camera) {
    if (!camera) return;
    const markers = [];
    for (const a of _annotations3d) a.leaderLines.forEach(ll => markers.push(ll.marker));
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

/**
 * Update orientations of all CSS3D annotations each frame.
 * Must be called from the render loop so 'camera' mode stays in sync.
 */
export function updateAnnotation3dOrientations(camera) {
    if (!camera) return;
    _currentCamera = camera;
    for (const a of _annotations3d) {
        if (a.orientationMode === 'camera') {
            _applyOrientation(a, camera);
        }
    }
}

export function setAnnotations3dVisible(visible) {
    for (const a of _annotations3d) {
        a.label.visible = visible;
        a.leaderLines.forEach(ll => {
            ll.marker.visible = visible;
            ll.line.visible   = visible;
        });
    }
}

/**
 * Enable / disable depth testing for annotation markers and leader lines.
 * CSS3D labels are unaffected (CSS has no depth test).
 */
export function setAnnotation3dDepthTest(enabled) {
    _depthTestEnabled = enabled;
    for (const a of _annotations3d) {
        a.leaderLines.forEach(ll => {
            ll.marker.material.depthTest = enabled;
            ll.marker.renderOrder = enabled ? 0 : 999;
            ll.line.material.depthTest = enabled;
            ll.line.renderOrder   = enabled ? 0 : 998;
        });
    }
}

export function clearAnnotations3d(renderFn) {
    if (!_scene) return;
    if (_pendingMarker) {
        const pendingParent = _pendingOwner || _scene;
        pendingParent.remove(_pendingMarker);
        _pendingMarker.geometry.dispose();
        _pendingMarker.material.dispose();
        _pendingMarker = null;
    }
    _pendingPoint = null;
    _pendingOwner = null;

    for (const a of _annotations3d) {
        const owner = a.ownerObject || _scene;
        owner.remove(a.label);
        a.leaderLines.forEach(ll => {
            owner.remove(ll.marker);
            owner.remove(ll.line);
            ll.marker.geometry.dispose(); ll.marker.material.dispose();
            ll.line.geometry.dispose();   ll.line.material.dispose();
        });
        if (owner.userData.annotations3d) {
            owner.userData.annotations3d = owner.userData.annotations3d.filter(d => d.type !== 'note3d');
            if (owner.userData.annotations3d.length === 0) delete owner.userData.annotations3d;
        }
    }
    _annotations3d = [];
    _hidePreview();
    if (renderFn) renderFn();
}

/** True when the user has chosen "Add leader line" from context menu and awaits a click. */
export function isAddLeaderLine3dActive() {
    return _pendingAddLeaderAnnotation !== null;
}

export function cancelAddLeaderLine3d() {
    _pendingAddLeaderAnnotation = null;
    _hidePreview();
}

export function getAnnotations3d() {
    return _annotations3d;
}

/**
 * Update all leader lines of a CSS3D annotation to point from each anchorLocal to the new label position.
 * Called during label drag via selectDimension.
 */
export function updateAnnotation3dLeaderLine(annotation, newLabelPos) {
    const owner = annotation.ownerObject || _scene;
    annotation.leaderLines.forEach(ll => {
        owner.remove(ll.line);
        ll.line.geometry.dispose();
        ll.line.material.dispose();
        ll.line = _createLeaderLine(ll.anchorLocal, newLabelPos);
        owner.add(ll.line);
    });
}

/**
 * Sync CSS3D annotation label position back to userData after drag.
 */
export function syncAnnotation3dLabelPos(annotation) {
    const pos = annotation.label.position;
    annotation.labelLocal.copy(pos);
    if (annotation._userDataRec) {
        annotation._userDataRec.labelPos = { x: pos.x, y: pos.y, z: pos.z };
    }
}

export function commitAddLeaderLine3d(point, ownerObject, renderFn) {
    if (!_pendingAddLeaderAnnotation) return;
    const annotation = _pendingAddLeaderAnnotation;
    _pendingAddLeaderAnnotation = null;
    _hidePreview();
    _addLeaderLine(annotation, point, renderFn);
}

export function removeAnnotations3dForOwner(root) {
    if (!root) return;
    const owned = new Set();
    root.traverse(obj => owned.add(obj));
    _annotations3d = _annotations3d.filter(a => {
        if (!owned.has(a.ownerObject)) return true;
        if (a.label && a.label.element) a.label.element.remove();
        a.leaderLines.forEach(ll => {
            ll.marker.geometry.dispose(); ll.marker.material.dispose();
            ll.line.geometry.dispose();   ll.line.material.dispose();
        });
        return false;
    });
}

/**
 * Strip CSS3D annotation visual objects from a cloned tree (for GLB export).
 * Keeps userData.annotations3d intact for reconstruction on import.
 */
export function stripAnnotation3dVisuals(root) {
    if (!root) return;
    const toRemove = [];
    root.traverse(function (child) {
        if (child.userData && child.userData._isAnnotation3d) toRemove.push(child);
    });
    for (const obj of toRemove) {
        if (obj.parent) obj.parent.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    }
}

/**
 * Reconstruct CSS3D annotation visuals from userData after GLB import.
 */
export function reconstructAnnotations3d(root, renderFn) {
    if (!root) return;
    root.traverse(function (node) {
        const data = node.userData && node.userData.annotations3d;
        if (!Array.isArray(data) || data.length === 0) return;
        node.updateWorldMatrix(true, false);
        for (const rec of data) {
            if (rec.type === 'note3d') _reconstructAnnotation3d(node, rec, renderFn);
        }
    });
}

function _reconstructAnnotation3d(owner, rec, renderFn) {
    const anchorList = Array.isArray(rec.anchors) ? rec.anchors : (rec.anchor ? [rec.anchor] : []);
    const firstAnchor = anchorList[0];
    const labelLocal = rec.labelPos
        ? new THREE.Vector3(rec.labelPos.x, rec.labelPos.y, rec.labelPos.z)
        : (firstAnchor
            ? new THREE.Vector3(firstAnchor.x, firstAnchor.y, firstAnchor.z).add(new THREE.Vector3(5, 5, 0))
            : new THREE.Vector3());

    const label = _createLabel3d(rec.text, labelLocal);
    owner.add(label);

    const leaderLines = anchorList.map(a => {
        const anchorLocal = new THREE.Vector3(a.x, a.y, a.z);
        const marker = _createMarker(anchorLocal);
        const line   = _createLeaderLine(anchorLocal, labelLocal);
        owner.add(marker);
        owner.add(line);
        return { marker, line, anchorLocal };
    });

    const annotation = {
        label,
        leaderLines,
        labelLocal: labelLocal.clone(),
        text: rec.text,
        ownerObject: owner,
        _userDataRec: rec,
        orientationMode: rec.orientationMode || 'camera',
        rotationAngle: rec.rotationAngle || 0,
        labelScale: rec.labelScale || 1,
        mirrored: rec.mirrored || false,
        textColor: rec.textColor || '#ffffff',
        bgColor: rec.bgColor || '#2850a0',
    };
    _annotations3d.push(annotation);

    if (_currentCamera) _applyOrientation(annotation, _currentCamera);
    _applyScale(annotation);
    _applyColors(annotation);
    _attachHandlers(annotation, renderFn);
}
