// edgeDisplayUtils.js – LineSegments overlays for sharp and tangential mesh edges
import * as THREE from 'three';
import { getMeshEdgeData } from './edgeDetectionUtils.js';

const SHARP_OVERLAY_KEY = '_edgeOverlaySharp';
const TANGENTIAL_OVERLAY_KEY = '_edgeOverlayTangential';

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

function _createLineSegments(geometry, color, renderOrder) {
    const material = new THREE.LineBasicMaterial({
        color,
        linewidth: 1,
        depthTest: true,
    });
    const lines = new THREE.LineSegments(geometry, material);
    lines.renderOrder = renderOrder;
    lines.frustumCulled = false;
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
    return _createLineSegments(lineGeometry, lineColor, (mesh.renderOrder || 0) + 1);
}

/**
 * Remove and dispose edge overlay children from a mesh.
 * @param {THREE.Mesh} mesh
 */
export function removeEdgeOverlays(mesh) {
    if (!mesh) return;

    for (const key of [SHARP_OVERLAY_KEY, TANGENTIAL_OVERLAY_KEY]) {
        const overlay = mesh.userData[key];
        if (!overlay) continue;
        mesh.remove(overlay);
        overlay.geometry?.dispose();
        overlay.material?.dispose();
        delete mesh.userData[key];
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
        if (overlay) {
            mesh.userData[SHARP_OVERLAY_KEY] = overlay;
            mesh.add(overlay);
        }
    }

    if (showTangential) {
        const overlay = createEdgeOverlay(mesh, 'tangential', thresholdDeg, tangentialColor);
        if (overlay) {
            mesh.userData[TANGENTIAL_OVERLAY_KEY] = overlay;
            mesh.add(overlay);
        }
    }
}
