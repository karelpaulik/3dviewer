// sectionSketchUtils.js – 2D sketch entities on the section plane (UV space)
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { planeUVToWorld } from './sectionPlaneUtils.js';

const VERTEX_PICK_PX = 10;
const SEGMENT_PICK_PX = 8;
const HIGHLIGHT_COLOR = '#ffff00';
const DEFAULT_MARKER_RADIUS = 1;
const SELECTED_MARKER_SCALE = 1.6;
const LABEL_BG = '#1565c0';
const LABEL_FG = '#ffffff';

let _scene = null;
let _sketchRoot = null;
let _entitiesGroup = null;
let _previewGroup = null;
let _labelsGroup = null;
let _active = false;
let _entities = [];
let _nextId = 1;
let _strokePoints = []; // UV [u,v][]
let _strokeEntityType = 'line'; // 'line' | 'polyline'
let _previewUv = null;
let _sketchColor = '#ff9800';
let _markerRadius = DEFAULT_MARKER_RADIUS;
let _formatLength = (len) => (Number.isFinite(len) ? len.toFixed(2) : '–');
let _onChange = null;
let _onSelectionChanged = null;
let _editingLabel = null;

/** @type {{ kind: 'vertex', entityId: number, pointIndex: number } | { kind: 'entity', entityId: number } | null} */
let _selection = null;
/** @type {{ startUv: { u: number, v: number }, origPoints: number[][] } | null} */
let _drag = null;

const _worldPt = new THREE.Vector3();
const _ndcPt = new THREE.Vector3();
const _segA = new THREE.Vector2();
const _segB = new THREE.Vector2();
const _segP = new THREE.Vector2();
const _segAB = new THREE.Vector2();
const _segAP = new THREE.Vector2();

/**
 * @param {{ scene: THREE.Scene }} opts
 */
export function initSectionSketch({ scene }) {
    _scene = scene;
    if (_sketchRoot) return;

    _sketchRoot = new THREE.Object3D();
    _sketchRoot.name = 'SectionSketchRoot';
    _sketchRoot.userData._isSectionSketch = true;
    _sketchRoot.matrixAutoUpdate = true;

    _entitiesGroup = new THREE.Group();
    _entitiesGroup.name = 'SectionSketchEntities';
    _entitiesGroup.userData._isSectionSketch = true;

    _previewGroup = new THREE.Group();
    _previewGroup.name = 'SectionSketchPreview';
    _previewGroup.userData._isSectionSketch = true;

    _labelsGroup = new THREE.Group();
    _labelsGroup.name = 'SectionSketchLabels';
    _labelsGroup.userData._isSectionSketch = true;

    _sketchRoot.add(_entitiesGroup);
    _sketchRoot.add(_previewGroup);
    _sketchRoot.add(_labelsGroup);
    _scene.add(_sketchRoot);
}

/** @param {(len: number) => string} fn */
export function setSectionSketchLengthFormatter(fn) {
    _formatLength = fn || ((len) => (Number.isFinite(len) ? len.toFixed(2) : '–'));
    rebuildSketchVisuals();
}

/** @param {(() => void)|null} fn */
export function setSectionSketchOnChange(fn) {
    _onChange = fn;
}

/** @param {(() => void)|null} fn */
export function setSectionSketchOnSelectionChanged(fn) {
    _onSelectionChanged = fn;
}

function _notifyChange() {
    if (_onChange) _onChange();
}

function _notifySelectionChanged() {
    if (_onSelectionChanged) _onSelectionChanged();
}

export function isSectionSketchActive() {
    return _active;
}

export function setSectionSketchActive(val) {
    _active = !!val;
    if (!_active) {
        _cancelLabelEdit();
        cancelStroke();
        endSelectionDrag();
        clearSketchSelection();
    }
    _refreshLabelPointerEvents();
}

/** Show / hide all section sketch visuals (entities, preview, length labels). */
export function setSectionSketchVisible(visible) {
    if (_sketchRoot) _sketchRoot.visible = !!visible;
}

export function isSectionSketchVisible() {
    return _sketchRoot ? _sketchRoot.visible : true;
}

/** Show / hide driven length labels only (lines/markers stay). */
export function setSectionSketchLabelsVisible(visible) {
    if (_labelsGroup) _labelsGroup.visible = !!visible;
    if (!visible) _cancelLabelEdit();
}

export function isSectionSketchLabelsVisible() {
    return _labelsGroup ? _labelsGroup.visible : true;
}

/** @param {'line'|'polyline'} entityType */
export function setSectionSketchEntityType(entityType) {
    const next = entityType === 'polyline' ? 'polyline' : 'line';
    if (_strokePoints.length > 0 && next !== _strokeEntityType) {
        cancelStroke();
    }
    _strokeEntityType = next;
}

export function getSectionSketchEntityType() {
    return _strokeEntityType;
}

export function setSectionSketchColor(color) {
    _sketchColor = color || '#ff9800';
    rebuildSketchVisuals();
}

export function getSectionSketchColor() {
    return _sketchColor;
}

/** World-space sphere radius for sketch vertex markers. */
export function setSectionSketchMarkerSize(size) {
    const n = Number(size);
    _markerRadius = (Number.isFinite(n) && n > 0) ? n : DEFAULT_MARKER_RADIUS;
    rebuildSketchVisuals();
}

export function getSectionSketchMarkerSize() {
    return _markerRadius;
}

export function getSectionSketchCount() {
    return _entities.length;
}

export function hasStrokeInProgress() {
    return _strokePoints.length > 0;
}

export function getSketchSelection() {
    return _selection;
}

export function hasSketchSelection() {
    return !!_selection;
}

export function isSelectionDragActive() {
    return !!_drag;
}

/**
 * Align sketchRoot so local +Z = frame.normal, local +X = frame.u, local +Y = frame.v.
 * Entity points are stored as (u, v, 0) in root local space.
 */
export function syncSketchFrame(frame) {
    if (!_sketchRoot || !frame) return;
    _sketchRoot.position.copy(frame.origin);
    const m = new THREE.Matrix4().makeBasis(frame.u, frame.v, frame.normal);
    _sketchRoot.quaternion.setFromRotationMatrix(m);
    _sketchRoot.updateMatrixWorld(true);
}

function _disposeObject3D(obj) {
    if (obj.isCSS2DObject && obj.element) {
        obj.element.replaceChildren();
        if (obj.element.parentNode) obj.element.parentNode.removeChild(obj.element);
    }
    obj.traverse?.(child => {
        if (child === obj) return;
        if (child.isCSS2DObject && child.element) {
            if (child.element.parentNode) child.element.parentNode.removeChild(child.element);
        }
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else child.material.dispose();
        }
    });
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
    }
}

function _clearGroup(group) {
    if (!group) return;
    while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
        _disposeObject3D(child);
    }
}

function _findEntity(entityId) {
    return _entities.find(e => e.id === entityId) || null;
}

function _segmentLength(ent, segIndex) {
    const a = ent.points[segIndex];
    const b = ent.points[segIndex + 1];
    if (!a || !b) return NaN;
    return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

export function getSegmentLength(entityId, segIndex) {
    const ent = _findEntity(entityId);
    if (!ent) return null;
    const len = _segmentLength(ent, segIndex);
    return Number.isFinite(len) ? len : null;
}

/**
 * Length of segment 0 for selected entity (line / polyline tools field).
 * @returns {number|null}
 */
export function getSelectedEntityLength() {
    if (!_selection || _selection.kind !== 'entity') return null;
    return getSegmentLength(_selection.entityId, 0);
}

/**
 * Move segment end point along current direction to match length (P0 fixed).
 * @returns {boolean}
 */
export function setSegmentLength(entityId, segIndex, length, renderFn) {
    const len = Number(length);
    if (!(len > 0) || !Number.isFinite(len)) return false;
    const ent = _findEntity(entityId);
    if (!ent || segIndex < 0 || segIndex >= ent.points.length - 1) return false;

    const p0 = ent.points[segIndex];
    const p1 = ent.points[segIndex + 1];
    const dx = p1[0] - p0[0];
    const dy = p1[1] - p0[1];
    const cur = Math.hypot(dx, dy);
    if (cur < 1e-12) {
        ent.points[segIndex + 1] = [p0[0] + len, p0[1]];
    } else {
        const s = len / cur;
        ent.points[segIndex + 1] = [p0[0] + dx * s, p0[1] + dy * s];
    }
    rebuildSketchVisuals();
    if (renderFn) renderFn();
    _notifyChange();
    _notifySelectionChanged();
    return true;
}

export function setSelectedEntityLength(length, renderFn) {
    if (!_selection || _selection.kind !== 'entity') return false;
    return setSegmentLength(_selection.entityId, 0, length, renderFn);
}

function _uvToClient(u, v, frame, camera, canvasRect) {
    planeUVToWorld(u, v, frame, _worldPt);
    _ndcPt.copy(_worldPt).project(camera);
    return {
        x: (_ndcPt.x * 0.5 + 0.5) * canvasRect.width + canvasRect.left,
        y: (-_ndcPt.y * 0.5 + 0.5) * canvasRect.height + canvasRect.top,
    };
}

function _distPointToSegment2D(px, py, ax, ay, bx, by) {
    _segP.set(px, py);
    _segA.set(ax, ay);
    _segB.set(bx, by);
    _segAB.subVectors(_segB, _segA);
    const lenSq = _segAB.lengthSq();
    if (lenSq < 1e-12) return _segP.distanceTo(_segA);
    let t = _segAP.subVectors(_segP, _segA).dot(_segAB) / lenSq;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + _segAB.x * t;
    const cy = ay + _segAB.y * t;
    return Math.hypot(px - cx, py - cy);
}

/**
 * Screen-space pick: vertex first, then segment.
 * @param {{ frame: object, camera: THREE.Camera, clientX: number, clientY: number, canvasRect: DOMRect }} opts
 */
export function pickSketchAtScreen(opts) {
    const { frame, camera, clientX, clientY, canvasRect } = opts;
    if (!frame || !camera || !canvasRect || _entities.length === 0) return null;

    let bestVertex = null;
    let bestVertexDist = VERTEX_PICK_PX;

    for (const ent of _entities) {
        for (let i = 0; i < ent.points.length; i++) {
            const [u, v] = ent.points[i];
            const c = _uvToClient(u, v, frame, camera, canvasRect);
            const d = Math.hypot(clientX - c.x, clientY - c.y);
            if (d <= bestVertexDist) {
                bestVertexDist = d;
                bestVertex = { kind: 'vertex', entityId: ent.id, pointIndex: i };
            }
        }
    }
    if (bestVertex) return bestVertex;

    let bestSeg = null;
    let bestSegDist = SEGMENT_PICK_PX;

    for (const ent of _entities) {
        for (let i = 0; i < ent.points.length - 1; i++) {
            const [u0, v0] = ent.points[i];
            const [u1, v1] = ent.points[i + 1];
            const a = _uvToClient(u0, v0, frame, camera, canvasRect);
            const b = _uvToClient(u1, v1, frame, camera, canvasRect);
            const d = _distPointToSegment2D(clientX, clientY, a.x, a.y, b.x, b.y);
            if (d <= bestSegDist) {
                bestSegDist = d;
                bestSeg = { kind: 'entity', entityId: ent.id };
            }
        }
    }
    return bestSeg;
}

export function setSketchSelection(sel) {
    if (_editingLabel) _commitLabelEdit();
    _selection = sel ? { ...sel } : null;
    rebuildSketchVisuals();
    _notifySelectionChanged();
}

export function clearSketchSelection(renderFn) {
    if (!_selection && !_drag) {
        if (renderFn) renderFn();
        return;
    }
    if (_editingLabel) _cancelLabelEdit();
    _selection = null;
    _drag = null;
    rebuildSketchVisuals();
    _notifySelectionChanged();
    if (renderFn) renderFn();
}

/**
 * @param {{ u: number, v: number }} uv
 * @returns {boolean}
 */
export function beginSelectionDrag(uv) {
    if (!_selection) return false;
    const ent = _findEntity(_selection.entityId);
    if (!ent) return false;
    _cancelLabelEdit();
    _drag = {
        startUv: { u: uv.u, v: uv.v },
        origPoints: ent.points.map(p => [p[0], p[1]]),
    };
    return true;
}

/**
 * @param {{ u: number, v: number }} uv
 */
export function updateSelectionDrag(uv) {
    if (!_drag || !_selection) return;
    const ent = _findEntity(_selection.entityId);
    if (!ent) return;

    const du = uv.u - _drag.startUv.u;
    const dv = uv.v - _drag.startUv.v;

    if (_selection.kind === 'vertex') {
        const i = _selection.pointIndex;
        const orig = _drag.origPoints[i];
        if (!orig) return;
        ent.points[i] = [orig[0] + du, orig[1] + dv];
    } else {
        ent.points = _drag.origPoints.map(p => [p[0] + du, p[1] + dv]);
    }
    rebuildSketchVisuals();
    _notifySelectionChanged();
}

export function endSelectionDrag() {
    _drag = null;
}

/**
 * @param {Function} [renderFn]
 * @returns {boolean}
 */
export function deleteSketchSelection(renderFn) {
    if (!_selection) return false;
    const ent = _findEntity(_selection.entityId);
    if (!ent) {
        clearSketchSelection(renderFn);
        return false;
    }

    _cancelLabelEdit();
    if (_selection.kind === 'entity') {
        _entities = _entities.filter(e => e.id !== ent.id);
    } else if (ent.points.length <= 2) {
        _entities = _entities.filter(e => e.id !== ent.id);
    } else {
        ent.points.splice(_selection.pointIndex, 1);
        if (ent.points.length < 2) {
            _entities = _entities.filter(e => e.id !== ent.id);
        }
    }

    _selection = null;
    _drag = null;
    rebuildSketchVisuals();
    _notifySelectionChanged();
    if (renderFn) renderFn();
    return true;
}

function _isEntitySelected(entityId) {
    return _selection && _selection.entityId === entityId && _selection.kind === 'entity';
}

function _isVertexSelected(entityId, pointIndex) {
    return _selection
        && _selection.kind === 'vertex'
        && _selection.entityId === entityId
        && _selection.pointIndex === pointIndex;
}

function _createLineObject(pointsUv, color, dashed = false, linewidthHint = false) {
    const positions = [];
    for (const p of pointsUv) {
        positions.push(p[0], p[1], 0);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = dashed
        ? new THREE.LineDashedMaterial({
            color: new THREE.Color(color),
            dashSize: 2,
            gapSize: 1.5,
            depthTest: false,
            transparent: true,
            opacity: 0.9,
        })
        : new THREE.LineBasicMaterial({
            color: new THREE.Color(color),
            depthTest: false,
            transparent: true,
            opacity: 1,
        });
    const line = new THREE.Line(geometry, material);
    line.frustumCulled = false;
    line.renderOrder = 999;
    line.userData._isSectionSketch = true;
    line.userData._sketchSelected = !!linewidthHint;
    line.raycast = () => {};
    if (dashed) line.computeLineDistances();
    return line;
}

function _createMarker(u, v, color, radius = _markerRadius) {
    const geom = new THREE.SphereGeometry(radius, 12, 12);
    const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        depthTest: false,
        transparent: true,
        opacity: 0.95,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(u, v, 0);
    mesh.frustumCulled = false;
    mesh.renderOrder = 1000;
    mesh.userData._isSectionSketch = true;
    mesh.raycast = () => {};
    return mesh;
}

function _parseLengthInput(text) {
    const cleaned = String(text).replace(/,/g, '.').replace(/[^\d.+-eE]/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
}

function _cancelLabelEdit() {
    if (!_editingLabel) return;
    const { div, entityId, segIndex } = _editingLabel;
    _editingLabel = null;
    if (div.isConnected) {
        div.contentEditable = 'false';
        const len = getSegmentLength(entityId, segIndex);
        div.textContent = _formatLength(len ?? NaN);
    }
}

function _commitLabelEdit() {
    if (!_editingLabel) return;
    const { div, entityId, segIndex } = _editingLabel;
    const raw = div.isConnected ? div.textContent : '';
    _editingLabel = null;
    if (div.isConnected) div.contentEditable = 'false';
    const n = _parseLengthInput(raw);
    if (n > 0) {
        setSegmentLength(entityId, segIndex, n);
    } else {
        rebuildSketchVisuals();
        _notifyChange();
        _notifySelectionChanged();
    }
}

function _findLabelElement(entityId, segIndex) {
    if (!_labelsGroup) return null;
    let found = null;
    for (const child of _labelsGroup.children) {
        if (child.isCSS2DObject
            && child.userData.entityId === entityId
            && child.userData.segIndex === segIndex) {
            found = child.element;
            break;
        }
    }
    return found;
}

function _beginEditSegmentLength(entityId, segIndex) {
    if (!_active) return;
    if (_editingLabel) _commitLabelEdit();

    _selection = { kind: 'entity', entityId };
    rebuildSketchVisuals();
    _notifySelectionChanged();

    const div = _findLabelElement(entityId, segIndex);
    if (!div) return;

    const len = getSegmentLength(entityId, segIndex);
    div.textContent = Number.isFinite(len) ? String(Number(len.toFixed(4))) : '';
    div.contentEditable = 'true';
    div.focus();
    const range = document.createRange();
    range.selectNodeContents(div);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    _editingLabel = { div, entityId, segIndex };
}

function _refreshLabelPointerEvents() {
    if (!_labelsGroup) return;
    _labelsGroup.traverse(child => {
        if (child.isCSS2DObject && child.element) {
            child.element.style.pointerEvents = _active ? 'auto' : 'none';
        }
    });
}

function _createLengthLabel(entityId, segIndex, midU, midV, length, highlighted) {
    const div = document.createElement('div');
    div.className = 'section-sketch-length-label';
    div.textContent = _formatLength(length);
    const bg = highlighted ? '#f9a825' : LABEL_BG;
    const fg = highlighted ? '#111111' : LABEL_FG;
    div.style.cssText = [
        `color:${fg}`,
        `background:${bg}`,
        'padding:2px 6px',
        'border-radius:3px',
        'font-size:11px',
        'font-family:sans-serif',
        'white-space:nowrap',
        'line-height:1.3',
        `pointer-events:${_active ? 'auto' : 'none'}`,
        'cursor:text',
        'user-select:none',
        'border:1px solid rgba(0,0,0,0.25)',
    ].join(';');
    div.title = 'Click to edit length';

    const stop = (e) => {
        e.stopPropagation();
    };
    div.addEventListener('pointerdown', stop);
    div.addEventListener('mousedown', stop);
    div.addEventListener('mouseup', stop);
    div.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        _beginEditSegmentLength(entityId, segIndex);
    });
    div.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            div.blur();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            _cancelLabelEdit();
            div.blur();
        }
    });
    div.addEventListener('blur', () => {
        if (_editingLabel && _editingLabel.div === div) {
            _commitLabelEdit();
        }
    });

    const label = new CSS2DObject(div);
    label.position.set(midU, midV, 0);
    label.userData._isSectionSketch = true;
    label.userData.entityId = entityId;
    label.userData.segIndex = segIndex;
    return label;
}

export function rebuildSketchVisuals() {
    if (!_entitiesGroup) return;
    // Drop edit handle; DOM nodes are about to be disposed
    _editingLabel = null;
    _clearGroup(_entitiesGroup);
    if (_labelsGroup) _clearGroup(_labelsGroup);

    for (const ent of _entities) {
        const entitySelected = _isEntitySelected(ent.id);
        const baseColor = ent.color || _sketchColor;
        const lineColor = entitySelected ? HIGHLIGHT_COLOR : baseColor;
        if (ent.points.length >= 2) {
            const line = _createLineObject(ent.points, lineColor, false, entitySelected);
            line.userData.entityId = ent.id;
            _entitiesGroup.add(line);
        }
        for (let i = 0; i < ent.points.length; i++) {
            const p = ent.points[i];
            const vertexSelected = _isVertexSelected(ent.id, i);
            const markerColor = (entitySelected || vertexSelected) ? HIGHLIGHT_COLOR : baseColor;
            const radius = vertexSelected ? _markerRadius * SELECTED_MARKER_SCALE : _markerRadius;
            const marker = _createMarker(p[0], p[1], markerColor, radius);
            marker.userData.entityId = ent.id;
            marker.userData.pointIndex = i;
            _entitiesGroup.add(marker);
        }
        if (_labelsGroup) {
            for (let i = 0; i < ent.points.length - 1; i++) {
                const a = ent.points[i];
                const b = ent.points[i + 1];
                const midU = (a[0] + b[0]) * 0.5;
                const midV = (a[1] + b[1]) * 0.5;
                const len = _segmentLength(ent, i);
                const label = _createLengthLabel(ent.id, i, midU, midV, len, entitySelected);
                _labelsGroup.add(label);
            }
        }
    }
}

function _rebuildPreview() {
    if (!_previewGroup) return;
    _clearGroup(_previewGroup);
    if (_strokePoints.length === 0) return;

    const color = _sketchColor;
    for (const p of _strokePoints) {
        _previewGroup.add(_createMarker(p[0], p[1], color));
    }

    const previewPts = _strokePoints.slice();
    if (_previewUv) {
        previewPts.push([_previewUv.u, _previewUv.v]);
        _previewGroup.add(_createMarker(_previewUv.u, _previewUv.v, color));
    }
    if (previewPts.length >= 2) {
        _previewGroup.add(_createLineObject(previewPts, color, true));
    }
}

/**
 * @param {'line'|'polyline'} entityType
 */
export function beginStroke(entityType) {
    cancelStroke();
    _strokeEntityType = entityType === 'polyline' ? 'polyline' : 'line';
}

/**
 * @param {{ u: number, v: number }} uv
 * @param {Function} [renderFn]
 * @returns {'added'|'committed'|null}
 */
export function addStrokePoint(uv, renderFn) {
    if (!_active || !_sketchRoot) return null;
    clearSketchSelection();
    _strokePoints.push([uv.u, uv.v]);
    _previewUv = null;
    _rebuildPreview();
    if (renderFn) renderFn();

    if (_strokeEntityType === 'line' && _strokePoints.length >= 2) {
        commitStroke(renderFn);
        return 'committed';
    }
    return 'added';
}

/**
 * @param {{ u: number, v: number }|null} uv
 */
export function updateStrokePreview(uv) {
    if (!_active || _strokePoints.length === 0) {
        _previewUv = null;
        _rebuildPreview();
        return;
    }
    _previewUv = uv ? { u: uv.u, v: uv.v } : null;
    _rebuildPreview();
}

export function commitStroke(renderFn, opts = {}) {
    if (opts.dropLastIfDuplicate && _strokePoints.length >= 2) {
        const a = _strokePoints[_strokePoints.length - 1];
        const b = _strokePoints[_strokePoints.length - 2];
        if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-6) {
            _strokePoints.pop();
        }
    }
    if (_strokePoints.length < 2) {
        cancelStroke();
        if (renderFn) renderFn();
        return false;
    }
    const entity = {
        id: _nextId++,
        type: _strokeEntityType,
        points: _strokePoints.map(p => [p[0], p[1]]),
        color: _sketchColor,
    };
    _entities.push(entity);
    _strokePoints = [];
    _previewUv = null;
    _clearGroup(_previewGroup);
    rebuildSketchVisuals();
    if (renderFn) renderFn();
    _notifyChange();
    return true;
}

export function cancelStroke(renderFn) {
    _strokePoints = [];
    _previewUv = null;
    _clearGroup(_previewGroup);
    if (renderFn) renderFn();
}

export function clearSectionSketches(renderFn) {
    _cancelLabelEdit();
    _entities = [];
    _selection = null;
    _drag = null;
    cancelStroke();
    rebuildSketchVisuals();
    _notifySelectionChanged();
    if (renderFn) renderFn();
}

export function getSectionSketchEntities() {
    return _entities.slice();
}
