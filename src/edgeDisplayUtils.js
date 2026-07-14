// edgeDisplayUtils.js – LineSegments overlays for sharp mesh edges
import * as THREE from 'three';
import { getMeshEdgeData } from './edgeDetectionUtils.js';

const DEFAULT_SHARP_COLOR = 0x000000;

/**
 * Build BufferGeometry with line segments for sharp edges.
 * @param {THREE.BufferGeometry} geometry
 * @param {number} thresholdDeg
 * @returns {THREE.BufferGeometry|null}
 */
export function buildEdgeLineGeometry(geometry, thresholdDeg = 12) {
    if (!geometry?.getAttribute('position')) return null;

    const { sharpEdgeSet, canonPos } = getMeshEdgeData(geometry, thresholdDeg);
    const pos = geometry.getAttribute('position');
    const segments = [];

    for (const key of sharpEdgeSet) {
        const [a, b] = key.split('_').map(Number);
        const ia = canonPos[a];
        const ib = canonPos[b];
        segments.push(
            pos.getX(ia), pos.getY(ia), pos.getZ(ia),
            pos.getX(ib), pos.getY(ib), pos.getZ(ib),
        );
    }

    if (segments.length === 0) return null;

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(segments, 3));
    return lineGeometry;
}

function _createLineSegments(geometry, color, renderOrder) {
    const material = new THREE.LineBasicMaterial({
        color,
        linewidth: 1,
        depthTest: true,
    });
    const lines = new THREE.LineSegments(geometry, material);
    lines.renderOrder = renderOrder;
    lines.frustumCulled = false;
    // Purely visual overlay – must never be hit by raycasting (picking, measurements, etc.)
    // or exported/cloned as if it were real model geometry. Bookkeeping is done via this
    // marker on the object itself (not via mesh.userData, which THREE clones through a
    // JSON round-trip and would corrupt a live object reference stored there).
    lines.raycast = () => {};
    lines.userData._isEdgeOverlay = true;
    return lines;
}

function _createEdgeOverlay(mesh, thresholdDeg, color) {
    if (!mesh?.geometry) return null;

    const lineGeometry = buildEdgeLineGeometry(mesh.geometry, thresholdDeg);
    if (!lineGeometry) return null;

    const lineColor = color ?? DEFAULT_SHARP_COLOR;
    return _createLineSegments(lineGeometry, lineColor, (mesh.renderOrder || 0) + 1);
}

/**
 * Remove and dispose edge overlay children from a mesh.
 * @param {THREE.Mesh} mesh
 */
export function removeEdgeOverlays(mesh) {
    if (!mesh) return;

    const overlays = mesh.children.filter(child => child.userData && child.userData._isEdgeOverlay);
    for (const overlay of overlays) {
        mesh.remove(overlay);
        overlay.geometry?.dispose();
        overlay.material?.dispose();
    }
}

/**
 * Remove and dispose edge overlay objects found anywhere under root (e.g. before
 * cloning or exporting a scene/object, mirroring stripMeasurementVisuals/stripAnnotationVisuals).
 * @param {THREE.Object3D} root
 */
export function stripEdgeOverlays(root) {
    if (!root) return;
    const toRemove = [];
    root.traverse(function (child) {
        if (child.userData && child.userData._isEdgeOverlay) {
            toRemove.push(child);
        }
    });
    for (const obj of toRemove) {
        if (obj.parent) obj.parent.remove(obj);
        obj.geometry?.dispose();
        obj.material?.dispose();
    }
}

/**
 * Update sharp edge overlays on a single mesh.
 * @param {THREE.Mesh} mesh
 * @param {{ thresholdDeg?: number, sharpColor?: number }} options
 */
export function updateMeshEdgeOverlays(mesh, {
    thresholdDeg = 12,
    sharpColor = DEFAULT_SHARP_COLOR,
} = {}) {
    removeEdgeOverlays(mesh);

    const overlay = _createEdgeOverlay(mesh, thresholdDeg, sharpColor);
    if (overlay) mesh.add(overlay);
}
