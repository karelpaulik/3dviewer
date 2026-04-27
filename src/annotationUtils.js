// annotationUtils.js – Annotation (note) system with CSS2D labels
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// --- Private state ---
let _scene = null;
let _annotations = []; // { label, labelLocal, text, ownerObject, _userDataRec, leaderLines: [{ marker, line, anchorLocal }] }
let _active = false;
let _depthTestEnabled = true; // true = skryté za modelem (výchozí), false = vždy viditelné přes model
let _pendingPoint = null;   // THREE.Vector3 | null – first click (on object surface)
let _pendingMarker = null;  // Mesh for pending point
let _pendingOwner = null;   // Owner object for the first click
let _previewMarker = null;  // Hover preview sphere (follows cursor)
let _previewLine = null;    // Dashed line from pending point to cursor
let _renderFn = null;
let _dialogOpen = false;     // Guard flag to prevent click-through from dialog
let _pendingAddLeaderAnnotation = null; // Annotation waiting for a new leader-line anchor click
let _convertTo3dFn = null;  // set from main.js to avoid circular dep

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
    div.innerHTML = text;
    div.style.cssText = 'color:#fff;background:rgba(40,140,40,0.88);padding:3px 8px;border-radius:4px;font-size:11px;line-height:1.4;pointer-events:auto;cursor:default;user-select:none;white-space:nowrap;';
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

// --- Minimal WYSIWYG editor (no external dependencies) ---

function _isHtmlEmpty(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || '').trim() === '';
}

/**
 * Build a lightweight contenteditable toolbar+editor.
 * Uses a `_busy` guard around execCommand to prevent the
 * "called recursively" browser warning.
 * Returns { wrap, content } where `content` is the editable div.
 */
function _buildWysiwygEditor(defaultHtml) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'border:1px solid #555;border-radius:4px;overflow:hidden;';

    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'background:#1e1e1e;border-bottom:1px solid #444;display:flex;gap:2px;padding:4px;flex-wrap:wrap;';

    // Shadow DOM host – isolates contenteditable from extension MutationObservers
    // (extensions observing document.body cannot see DOM mutations inside a shadow root)
    const shadowHost = document.createElement('div');
    shadowHost.style.cssText = 'background:#1a1a1a;cursor:text;resize:both;overflow:hidden;min-height:80px;min-width:200px;height:120px;width:100%;box-sizing:border-box;';
    const shadow = shadowHost.attachShadow({ mode: 'open' });

    const shadowStyle = document.createElement('style');
    shadowStyle.textContent = [
        'div{color:#fff;height:100%;min-height:inherit;overflow-y:auto;',
        'padding:8px;font-size:12px;font-family:sans-serif;outline:none;',
        'word-break:break-word;box-sizing:border-box;width:100%;}',
        'ul,ol{padding-left:20px;margin:4px 0;}',
        'li{margin:2px 0;}',
        'b,strong{font-weight:bold;}i,em{font-style:italic;}',
        'u{text-decoration:underline;}s{text-decoration:line-through;}',
    ].join('');
    shadow.appendChild(shadowStyle);

    const content = document.createElement('div');
    content.contentEditable = 'true';
    content.innerHTML = defaultHtml || '';
    shadow.appendChild(content);

    // Clicking the host area (padding below text) should focus the editor – no preventDefault to keep text selection working
    shadowHost.addEventListener('mousedown', () => { content.focus(); });

    let _busy = false;
    const _stateBtns = []; // { btn, cmd } – buttons that support queryCommandState

    const _updateActiveStates = () => {
        for (const { btn, cmd } of _stateBtns) {
            const active = document.queryCommandState(cmd);
            btn.style.background = active ? '#4a7a4a' : 'none';
            btn.style.borderColor = active ? '#6a6' : '#555';
            btn.style.color = active ? '#fff' : '#ddd';
        }
    };

    const addBtn = (label, title, cmd, value, trackState = false) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.innerHTML = label;
        b.title = title;
        b.style.cssText = 'background:none;color:#ddd;border:1px solid #555;border-radius:3px;padding:2px 7px;cursor:pointer;font-size:11px;min-width:24px;line-height:1.4;transition:background 0.1s;';
        b.addEventListener('mouseenter', () => { if (b.style.background === 'none' || b.style.background === '') b.style.background = '#333'; });
        b.addEventListener('mouseleave', () => { _updateActiveStates(); });
        // mousedown preventDefault keeps selection/focus alive in contenteditable
        b.addEventListener('mousedown', (e) => { e.preventDefault(); });
        b.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (_busy) return;
            _busy = true;
            try {
                content.focus();
                document.execCommand(cmd, false, value !== undefined ? value : null);
            } finally {
                _busy = false;
            }
            _updateActiveStates();
        });
        toolbar.appendChild(b);
        if (trackState) _stateBtns.push({ btn: b, cmd });
    };

    const addSep = () => {
        const s = document.createElement('span');
        s.style.cssText = 'width:1px;background:#444;margin:2px 4px;display:inline-block;';
        toolbar.appendChild(s);
    };

    addBtn('<b>B</b>', 'Tučné (Ctrl+B)', 'bold', undefined, true);
    addBtn('<i>I</i>', 'Kurzíva (Ctrl+I)', 'italic', undefined, true);
    addBtn('<u>U</u>', 'Podtržení (Ctrl+U)', 'underline', undefined, true);
    addBtn('<s>S</s>', 'Přeškrtnutí', 'strikeThrough', undefined, true);
    addSep();
    addBtn('OL', 'Číslovaný seznam', 'insertOrderedList', undefined, true);
    addBtn('UL', 'Odrážkový seznam', 'insertUnorderedList', undefined, true);

    // Update active states on selection change (keyboard + mouse)
    content.addEventListener('keyup', _updateActiveStates);
    content.addEventListener('mouseup', _updateActiveStates);
    content.addEventListener('focus', _updateActiveStates);

    wrap.appendChild(toolbar);
    wrap.appendChild(shadowHost);
    return { wrap, content };
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
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.45);z-index:100000;display:flex;align-items:center;justify-content:center;';

        const dialog = document.createElement('div');
        dialog.style.cssText = 'background:#2a2a2a;color:#fff;border-radius:8px;padding:16px 20px;min-width:340px;box-shadow:0 4px 24px rgba(0,0,0,0.5);font-family:sans-serif;display:inline-block;';

        const title = document.createElement('div');
        title.textContent = defaultText ? 'Upravit poznámku' : 'Nová poznámka';
        title.style.cssText = 'font-size:14px;font-weight:bold;margin-bottom:10px;';

        const { wrap: editorWrap, content: editorContent } = _buildWysiwygEditor(defaultText || '');

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
        dialog.appendChild(editorWrap);
        dialog.appendChild(btnRow);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        editorContent.focus();

        function cleanup(result) {
            document.body.removeChild(overlay);
            resolve(result);
        }

        btnOk.addEventListener('click', (e) => {
            e.stopPropagation();
            const html = editorContent.innerHTML;
            cleanup(_isHtmlEmpty(html) ? null : html);
        });

        btnCancel.addEventListener('click', (e) => {
            e.stopPropagation();
            cleanup(null);
        });

        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') cleanup(null);
        });

        overlay.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
}

// --- Private helpers ---

function _deleteAnnotation(annotation, renderFn) {
    const owner = annotation.ownerObject || _scene;
    owner.remove(annotation.label);
    annotation.leaderLines.forEach(ll => {
        owner.remove(ll.marker);
        owner.remove(ll.line);
        ll.marker.geometry.dispose(); ll.marker.material.dispose();
        ll.line.geometry.dispose(); ll.line.material.dispose();
    });
    // Remove userData record
    if (annotation._userDataRec && owner.userData && Array.isArray(owner.userData.annotations)) {
        const idx = owner.userData.annotations.indexOf(annotation._userDataRec);
        if (idx !== -1) owner.userData.annotations.splice(idx, 1);
        if (owner.userData.annotations.length === 0) delete owner.userData.annotations;
    }
    const i = _annotations.indexOf(annotation);
    if (i !== -1) _annotations.splice(i, 1);
    if (renderFn) renderFn();
}

function _showAnnotationContextMenu(annotation, x, y, renderFn) {
    // Remove any existing context menu
    const existing = document.getElementById('_annotation-ctx-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.id = '_annotation-ctx-menu';
    menu.style.cssText = `position:fixed;left:${x}px;top:${y}px;background:#2a2a2a;color:#fff;border:1px solid #555;border-radius:5px;padding:4px 0;z-index:200000;min-width:170px;box-shadow:0 4px 16px rgba(0,0,0,0.5);font-family:sans-serif;font-size:12px;`;

    const item = (label, cb) => {
        const el = document.createElement('div');
        el.textContent = label;
        el.style.cssText = 'padding:1px 12px;cursor:pointer;';
        el.addEventListener('mouseenter', () => el.style.background = '#444');
        el.addEventListener('mouseleave', () => el.style.background = '');
        el.addEventListener('mousedown', (e) => { e.stopPropagation(); });
        el.addEventListener('click', (e) => { e.stopPropagation(); menu.remove(); cb(); });
        menu.appendChild(el);
    };

    const sep = () => {
        const el = document.createElement('div');
        el.style.cssText = 'height:1px;background:#444;margin:3px 0;';
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
                removeAnnotationLeaderLine(annotation, idx, renderFn);
            });
        });
    } else if (annotation.leaderLines.length === 1) {
        item('✕ Remove leader line', () => {
            removeAnnotationLeaderLine(annotation, 0, renderFn);
        });
    }

    sep();
    item('✏ Edit text', () => { _editAnnotation(annotation, renderFn); });
    if (_convertTo3dFn) {
        sep();
        item('⇄ Convert to 3D annotation', () => { _convertTo3dFn(annotation, renderFn); });
    }
    item('🗑 Delete annotation', () => { _deleteAnnotation(annotation, renderFn); });

    document.body.appendChild(menu);

    // Close on click anywhere outside
    const close = (e) => {
        if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('mousedown', close, true); }
    };
    setTimeout(() => document.addEventListener('mousedown', close, true), 0);
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
        const marker = _pendingMarker; // reuse pending marker (already added to owner1 on first click)
        const line = _createLeaderLine(anchorLocal, labelLocal);
        const label = _createLabel(defaultText, labelLocal);

        owner1.add(label);
        owner1.add(line);

        const leaderLines = [{ marker, line, anchorLocal: anchorLocal.clone() }];

        // Store in userData for GLB export
        if (!owner1.userData.annotations) owner1.userData.annotations = [];
        const userDataRec = {
            type: 'note',
            anchors: [{ x: anchorLocal.x, y: anchorLocal.y, z: anchorLocal.z }],
            labelPos: { x: labelLocal.x, y: labelLocal.y, z: labelLocal.z },
            text: defaultText
        };
        owner1.userData.annotations.push(userDataRec);

        const annotation = { label, leaderLines, labelLocal: labelLocal.clone(), text: defaultText, ownerObject: owner1, _userDataRec: userDataRec };
        _annotations.push(annotation);

        // Attach dblclick + contextmenu handlers
        label.element.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            _editAnnotation(annotation, renderFn).catch(() => {});
        });
        label.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            _showAnnotationContextMenu(annotation, e.clientX, e.clientY, renderFn);
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
    annotation.label.element.innerHTML = newText;

    // Update userData
    if (annotation._userDataRec) annotation._userDataRec.text = newText;
    if (renderFn) renderFn();
}

/**
 * Update hover preview when annotation mode or add-leader mode is active.
 */
export function updateAnnotationPreview(point) {
    const addLeaderMode = _pendingAddLeaderAnnotation !== null;
    if (!_active && !addLeaderMode) {
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

    // Determine line origin: pending annotation anchor (regular mode) or label world pos (add-leader mode)
    let lineFrom = null;
    if (_pendingPoint) {
        lineFrom = _pendingPoint;
    } else if (addLeaderMode) {
        const ann = _pendingAddLeaderAnnotation;
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
    for (const a of _annotations) a.leaderLines.forEach(ll => markers.push(ll.marker));
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
        a.label.visible = visible;
        a.leaderLines.forEach(ll => {
            ll.marker.visible = visible;
            ll.line.visible = visible;
        });
    }
}

/**
 * Enable / disable depth testing for annotation markers and leader lines.
 * enabled=false → vždy viditelné (přes model), enabled=true → skryté za modelem.
 */
export function setAnnotationDepthTest(enabled) {
    _depthTestEnabled = enabled;
    for (const a of _annotations) {
        a.leaderLines.forEach(ll => {
            ll.marker.material.depthTest = enabled;
            ll.marker.renderOrder = enabled ? 0 : 999;
            ll.line.material.depthTest = enabled;
            ll.line.renderOrder = enabled ? 0 : 998;
        });
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
        owner.remove(a.label);
        a.leaderLines.forEach(ll => {
            owner.remove(ll.marker);
            owner.remove(ll.line);
            ll.marker.geometry.dispose();
            ll.marker.material.dispose();
            ll.line.geometry.dispose();
            ll.line.material.dispose();
        });
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
        a.leaderLines.forEach(ll => {
            ll.marker.geometry.dispose(); ll.marker.material.dispose();
            ll.line.geometry.dispose(); ll.line.material.dispose();
        });
        return false;
    });
}

/**
 * Return the internal annotations array (for select-dimension integration).
 */
export function getAnnotations() {
    return _annotations;
}

/** True when the user has chosen "Add leader line" from context menu and awaits a click on the model. */
export function isAddLeaderLineActive() {
    return _pendingAddLeaderAnnotation !== null;
}

/** Cancel the pending add-leader-line action (e.g. on Escape). */
export function cancelAddLeaderLine() {
    _pendingAddLeaderAnnotation = null;
    _hidePreview();
}

/**
 * Commit a new leader line for the pending annotation.
 * Call from onClick when isAddLeaderLineActive() is true.
 * @param {THREE.Vector3} point – world-space surface point from raycaster
 * @param {THREE.Object3D|null} ownerObject – hit object (used only as fallback; anchor is stored on the annotation's own owner)
 * @param {Function} renderFn
 */
export function commitAddLeaderLine(point, ownerObject, renderFn) {
    if (!_pendingAddLeaderAnnotation) return;
    const annotation = _pendingAddLeaderAnnotation;
    _pendingAddLeaderAnnotation = null;
    _hidePreview();
    addAnnotationLeaderLine(annotation, point, renderFn);
}

/**
 * Update all leader lines of an annotation to point from each anchorLocal to the new label position.
 * Called during label drag.
 */
export function updateAnnotationLeaderLine(annotation, newLabelPos) {
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
 * Add a new leader line to an existing annotation.
 * @param {Object} annotation – runtime annotation object
 * @param {THREE.Vector3} anchorWorld – world-space anchor point on the model surface
 * @param {Function} renderFn
 */
export function addAnnotationLeaderLine(annotation, anchorWorld, renderFn) {
    const owner = annotation.ownerObject || _scene;
    owner.updateWorldMatrix(true, false);
    const anchorLocal = owner.worldToLocal(anchorWorld.clone());
    const labelPos = annotation.label.position;
    const marker = _createMarker(anchorLocal);
    const line = _createLeaderLine(anchorLocal, labelPos);
    owner.add(marker);
    owner.add(line);
    annotation.leaderLines.push({ marker, line, anchorLocal: anchorLocal.clone() });
    // Sync to userData
    if (annotation._userDataRec) {
        if (!Array.isArray(annotation._userDataRec.anchors)) {
            annotation._userDataRec.anchors = annotation._userDataRec.anchor
                ? [annotation._userDataRec.anchor]
                : [];
        }
        annotation._userDataRec.anchors.push({ x: anchorLocal.x, y: anchorLocal.y, z: anchorLocal.z });
    }
    if (renderFn) renderFn();
}

/**
 * Remove a leader line from an annotation by index.
 * When all leader lines are removed the annotation (label + ownerObject binding) is preserved.
 * @param {Object} annotation – runtime annotation object
 * @param {number} index – index into annotation.leaderLines
 * @param {Function} renderFn
 */
export function removeAnnotationLeaderLine(annotation, index, renderFn) {
    if (index < 0 || index >= annotation.leaderLines.length) return;
    const owner = annotation.ownerObject || _scene;
    const ll = annotation.leaderLines[index];
    owner.remove(ll.marker);
    owner.remove(ll.line);
    ll.marker.geometry.dispose(); ll.marker.material.dispose();
    ll.line.geometry.dispose(); ll.line.material.dispose();
    annotation.leaderLines.splice(index, 1);
    // Sync to userData – handle both new `anchors` array and legacy `anchor` (single) format
    if (annotation._userDataRec) {
        if (Array.isArray(annotation._userDataRec.anchors)) {
            annotation._userDataRec.anchors.splice(index, 1);
        } else if (annotation._userDataRec.anchor) {
            // Legacy format: convert to empty anchors so re-import won't recreate the line
            delete annotation._userDataRec.anchor;
            annotation._userDataRec.anchors = [];
        }
    }
    if (renderFn) renderFn();
}

/**
 * Sync annotation label position back to userData after drag.
 */
export function syncAnnotationLabelPos(annotation) {
    const pos = annotation.label.position;
    annotation.labelLocal.copy(pos);
    if (annotation._userDataRec) {
        annotation._userDataRec.labelPos = { x: pos.x, y: pos.y, z: pos.z };
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

/**
 * Show the shared annotation text dialog (used by both CSS2D and CSS3D annotation systems).
 */
export function deleteAnnotationByRef(annotation, renderFn) {
    _deleteAnnotation(annotation, renderFn);
}

export function setConvertTo3dFn(fn) {
    _convertTo3dFn = fn;
}

export function reconstructAnnotationFromRec(owner, rec, renderFn) {
    return _reconstructAnnotation(owner, rec, renderFn);
}

export function showAnnotationTextDialog(defaultText) {
    return _showTextDialog(defaultText);
}

function _reconstructAnnotation(owner, rec, renderFn) {
    // Support both new `anchors` array and legacy `anchor` (single) format
    const anchorList = Array.isArray(rec.anchors)
        ? rec.anchors
        : (rec.anchor ? [rec.anchor] : []);

    const firstAnchor = anchorList[0];
    const labelLocal = rec.labelPos
        ? new THREE.Vector3(rec.labelPos.x, rec.labelPos.y, rec.labelPos.z)
        : (firstAnchor
            ? new THREE.Vector3(firstAnchor.x, firstAnchor.y, firstAnchor.z).add(new THREE.Vector3(5, 5, 0))
            : new THREE.Vector3());

    const label = _createLabel(rec.text, labelLocal);
    owner.add(label);

    const leaderLines = anchorList.map(a => {
        const anchorLocal = new THREE.Vector3(a.x, a.y, a.z);
        const marker = _createMarker(anchorLocal);
        const line = _createLeaderLine(anchorLocal, labelLocal);
        owner.add(marker);
        owner.add(line);
        return { marker, line, anchorLocal };
    });

    const annotation = { label, leaderLines, labelLocal: labelLocal.clone(), text: rec.text, ownerObject: owner, _userDataRec: rec };
    _annotations.push(annotation);

    // Attach dblclick + contextmenu handlers
    label.element.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        _editAnnotation(annotation, renderFn).catch(() => {});
    });
    label.element.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        _showAnnotationContextMenu(annotation, e.clientX, e.clientY, renderFn);
    });
    return annotation;
}
