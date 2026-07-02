// deviationProbeUtils.js – interactive deviation value probe (CSS2D labels)
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { formatDeviationValue, mapDistanceToColor } from './deviationMapUtils.js';

const BASE_FONT_SIZE = 11;
const BASE_PADDING_V = 2;
const BASE_PADDING_H = 6;
const BASE_BORDER_RADIUS = 3;
const MARKER_RADIUS = 1;
const PREVIEW_COLOR = 0xff8833;

let _scene = null;
let _active = false;
let _probes = [];
let _previewMarker = null;
let _hoverText = null;
let _labelScale = 1;
let _markerScale = 1;

export function initDeviationProbe(scene) {
    _scene = scene;
}

export function isDeviationProbeActive() {
    return _active;
}

export function setDeviationProbeActive(active) {
    _active = active;
    if (!active) {
        _hidePreview();
        _hoverText = null;
    }
}

export function getDeviationProbeHoverText() {
    return _hoverText;
}

export function getDeviationProbeLabelScale() {
    return _labelScale;
}

export function setDeviationProbeLabelScale(scale) {
    _labelScale = scale;
    for (const probe of _probes) {
        _applyLabelStyle(probe.label, probe.distance, probe.tolerance);
    }
}

export function getDeviationProbeMarkerScale() {
    return _markerScale;
}

export function setDeviationProbeMarkerScale(scale) {
    _markerScale = scale;
    for (const probe of _probes) {
        probe.marker?.scale.setScalar(scale);
    }
    if (_previewMarker) {
        _previewMarker.scale.setScalar(scale);
    }
}

function _deviationColorCss(distance, tolerance) {
    const t = Number.isFinite(distance) && tolerance > 0 ? distance / tolerance : 1;
    const c = mapDistanceToColor(t);
    const r = Math.round(c.r * 255);
    const g = Math.round(c.g * 255);
    const b = Math.round(c.b * 255);
    return `rgba(${r},${g},${b},0.92)`;
}

function _applyLabelStyle(label, distance, tolerance) {
    const el = label.element;
    const scale = _labelScale;
    el.style.fontSize = `${Math.round(BASE_FONT_SIZE * scale)}px`;
    el.style.padding = `${Math.round(BASE_PADDING_V * scale)}px ${Math.round(BASE_PADDING_H * scale)}px`;
    el.style.borderRadius = `${Math.round(BASE_BORDER_RADIUS * scale)}px`;
    el.style.background = _deviationColorCss(distance, tolerance);
}

function _createLabel(text, localPos, distance, tolerance) {
    const div = document.createElement('div');
    div.className = 'deviation-probe-label';
    div.textContent = text;
    div.style.cssText = 'color:#fff;pointer-events:none;white-space:nowrap;line-height:1.4;font-weight:600;';
    const label = new CSS2DObject(div);
    label.position.copy(localPos);
    label.userData._isDeviationProbe = true;
    _applyLabelStyle(label, distance, tolerance);
    return label;
}

function _createMarker(localPos, color) {
    const geo = new THREE.SphereGeometry(MARKER_RADIUS, 10, 10);
    const mat = new THREE.MeshBasicMaterial({ color: color ?? PREVIEW_COLOR, depthTest: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 999;
    mesh.position.copy(localPos);
    mesh.scale.setScalar(_markerScale);
    mesh.userData._isDeviationProbe = true;
    return mesh;
}

function _hidePreview() {
    if (_previewMarker) {
        _scene.remove(_previewMarker);
        _previewMarker.geometry.dispose();
        _previewMarker.material.dispose();
        _previewMarker = null;
    }
}

/**
 * @param {THREE.Vector3|null} worldPoint
 * @param {{ distance: number, isAmbiguous: boolean }|null} sample
 * @param {number} tolerance
 */
export function updateDeviationProbePreview(worldPoint, sample, tolerance) {
    if (!_active || !_scene) {
        _hidePreview();
        _hoverText = null;
        return;
    }
    if (!worldPoint || !sample) {
        _hidePreview();
        _hoverText = null;
        return;
    }

    _hoverText = `Deviation: ${formatDeviationValue(sample.distance)}`;

    if (!_previewMarker) {
        _previewMarker = _createMarker(new THREE.Vector3(), PREVIEW_COLOR);
        _scene.add(_previewMarker);
    }
    _previewMarker.position.copy(worldPoint);
    _previewMarker.visible = true;

    if (sample.isAmbiguous) {
        _previewMarker.material.color.set(0x888888);
    } else {
        const t = tolerance > 0 ? sample.distance / tolerance : 1;
        _previewMarker.material.color.copy(mapDistanceToColor(t));
    }
}

/**
 * @param {THREE.Vector3} worldPoint
 * @param {{ distance: number, isAmbiguous: boolean }} sample
 * @param {number} tolerance
 * @param {THREE.Object3D} ownerObject
 */
export function addDeviationProbeLabel(worldPoint, sample, tolerance, ownerObject) {
    if (!_scene || !ownerObject || !sample) return;

    ownerObject.updateWorldMatrix(true, false);
    const localPos = ownerObject.worldToLocal(worldPoint.clone());
    const text = formatDeviationValue(sample.distance);
    const markerColor = sample.isAmbiguous ? 0x888888 : null;
    const marker = _createMarker(localPos, markerColor);
    const label = _createLabel(text, localPos, sample.distance, tolerance);

    if (!sample.isAmbiguous) {
        const t = tolerance > 0 ? sample.distance / tolerance : 1;
        marker.material.color.copy(mapDistanceToColor(t));
    }

    ownerObject.add(marker);
    ownerObject.add(label);
    _probes.push({ marker, label, ownerObject, distance: sample.distance, tolerance });
}

export function clearDeviationProbes() {
    for (const probe of _probes) {
        if (probe.marker) {
            probe.ownerObject?.remove(probe.marker);
            probe.marker.geometry?.dispose();
            probe.marker.material?.dispose();
        }
        if (probe.label) {
            probe.ownerObject?.remove(probe.label);
        }
    }
    _probes.length = 0;
    _hidePreview();
    _hoverText = null;
}
