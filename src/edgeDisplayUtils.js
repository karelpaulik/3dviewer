// edgeDisplayUtils.js – LineSegments overlays for sharp and tangential mesh edges
import * as THREE from 'three';
import { getMeshEdgeData } from './edgeDetectionUtils.js';

const DEFAULT_SHARP_COLOR = 0x000000;
const DEFAULT_TANGENTIAL_COLOR = 0x888888;

/**
 * Build BufferGeometry with line segments for selected edge types.
 * @param {THREE.BufferGeometry} geometry
 * @param {{ sharpOnly?: boolean, smoothOnly?: boolean, thresholdDeg?: number }} options
 * @returns {THREE.BufferGeometry|null}
 */
export function buildEdgeLineGeometry(geometry, { sharpOnly = false, smoothOnly = false, thresholdDeg = 12 } = {}) {
    if (!geometry?.getAttribute('position')) return null;

    const { edgeFaces, sharpEdgeSet, canonPos } = getMeshEdgeData(geometry, thresholdDeg);
    const pos = geometry.getAttribute('position');
    const segments = [];

    for (const [key, faces] of edgeFaces) {
        const isSharp = sharpEdgeSet.has(key);
        if (sharpOnly && !isSharp) continue;
        if (smoothOnly && isSharp) continue;
        // Tangential = shared edge with smooth transition (2+ faces, not sharp)
        if (smoothOnly && faces.length < 2) continue;

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

function _createLineSegments(geometry, color, renderOrder, type) {
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
    lines.userData._edgeOverlayType = type;
    return lines;
}

/**
 * Create a single edge overlay LineSegments child for a mesh.
 * @param {THREE.Mesh} mesh
 * @param {'sharp'|'tangential'} type
 * @param {number} thresholdDeg
 * @param {number} [color]
 * @returns {THREE.LineSegments|null}
 */
export function createEdgeOverlay(mesh, type, thresholdDeg, color) {
    if (!mesh?.geometry) return null;

    const sharpOnly = type === 'sharp';
    const smoothOnly = type === 'tangential';
    const lineGeometry = buildEdgeLineGeometry(mesh.geometry, { sharpOnly, smoothOnly, thresholdDeg });
    if (!lineGeometry) return null;

    const lineColor = color ?? (sharpOnly ? DEFAULT_SHARP_COLOR : DEFAULT_TANGENTIAL_COLOR);
    return _createLineSegments(lineGeometry, lineColor, (mesh.renderOrder || 0) + 1, type);
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
 * Update edge overlays on a single mesh according to display options.
 * @param {THREE.Mesh} mesh
 * @param {{ showSharp?: boolean, showTangential?: boolean, thresholdDeg?: number, sharpColor?: number, tangentialColor?: number }} options
 */
export function updateMeshEdgeOverlays(mesh, {
    showSharp = false,
    showTangential = false,
    thresholdDeg = 12,
    sharpColor = DEFAULT_SHARP_COLOR,
    tangentialColor = DEFAULT_TANGENTIAL_COLOR,
} = {}) {
    removeEdgeOverlays(mesh);

    if (showSharp) {
        const overlay = createEdgeOverlay(mesh, 'sharp', thresholdDeg, sharpColor);
        if (overlay) mesh.add(overlay);
    }

    if (showTangential) {
        const overlay = createEdgeOverlay(mesh, 'tangential', thresholdDeg, tangentialColor);
        if (overlay) mesh.add(overlay);
    }
}
