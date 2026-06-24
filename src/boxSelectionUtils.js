// boxSelectionUtils.js – Shift+drag rectangular (marquee) object selection
import * as THREE from 'three';

const _corner = new THREE.Vector3();
const _projected = new THREE.Vector3();
const _bboxCenter = new THREE.Vector3();

export const BOX_SELECT_MODES = {
    partial: 'partial',
    full: 'full',
    center: 'center',
};

/**
 * Project an object's world bounding box to screen-space client coordinates.
 * Returns null if the box is empty or all corners are behind the camera.
 */
export function projectObjectToScreenRect(obj, camera, viewport) {
    obj.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return null;

    const { width, height, offsetLeft, offsetTop } = viewport;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let anyInFront = false;

    const xs = [box.min.x, box.max.x];
    const ys = [box.min.y, box.max.y];
    const zs = [box.min.z, box.max.z];

    for (let xi = 0; xi < 2; xi++) {
        for (let yi = 0; yi < 2; yi++) {
            for (let zi = 0; zi < 2; zi++) {
                _corner.set(xs[xi], ys[yi], zs[zi]);
                _projected.copy(_corner).project(camera);
                if (_projected.z > 1) continue;
                anyInFront = true;
                const sx = (_projected.x * 0.5 + 0.5) * width + offsetLeft;
                const sy = (-_projected.y * 0.5 + 0.5) * height + offsetTop;
                minX = Math.min(minX, sx);
                maxX = Math.max(maxX, sx);
                minY = Math.min(minY, sy);
                maxY = Math.max(maxY, sy);
            }
        }
    }

    if (!anyInFront) return null;
    return { left: minX, top: minY, right: maxX, bottom: maxY };
}

/** Project bbox geometric center to screen client coordinates, or null if behind camera. */
export function projectObjectBBoxCenterToScreen(obj, camera, viewport) {
    obj.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return null;

    box.getCenter(_bboxCenter);
    _projected.copy(_bboxCenter).project(camera);
    if (_projected.z > 1) return null;

    const { width, height, offsetLeft, offsetTop } = viewport;
    return {
        x: (_projected.x * 0.5 + 0.5) * width + offsetLeft,
        y: (-_projected.y * 0.5 + 0.5) * height + offsetTop,
    };
}

/** True if two screen rects overlap (partial intersection). */
export function screenRectsIntersect(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

export function pointInScreenRect(x, y, rect) {
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export function screenRectContains(outer, inner) {
    return inner.left >= outer.left && inner.right <= outer.right
        && inner.top >= outer.top && inner.bottom <= outer.bottom;
}

export function matchesBoxSelectMode(objRect, selectionRect, mode, centerPoint) {
    switch (mode) {
        case BOX_SELECT_MODES.full:
            return screenRectContains(selectionRect, objRect);
        case BOX_SELECT_MODES.center:
            return centerPoint && pointInScreenRect(centerPoint.x, centerPoint.y, selectionRect);
        default:
            return screenRectsIntersect(objRect, selectionRect);
    }
}

/**
 * Collect unique selectable objects from mesh list.
 * cadSelectionMode: 'CAD' resolves via resolveCADSelection, otherwise raw meshes.
 */
export function collectBoxSelectCandidates(meshObjects, cadSelectionMode, resolveCADSelection, isObjectPickable, isObjectVisible) {
    const seen = new Set();
    const result = [];

    for (const mesh of meshObjects) {
        const sel = cadSelectionMode === 'CAD' ? resolveCADSelection(mesh) : mesh;
        if (!sel || !isObjectPickable(sel) || !isObjectVisible(sel)) continue;
        if (seen.has(sel.uuid)) continue;
        seen.add(sel.uuid);
        result.push(sel);
    }
    return result;
}

export function findObjectsInScreenRect(candidates, selectionRect, camera, viewport, mode = BOX_SELECT_MODES.partial) {
    const hits = [];
    for (const obj of candidates) {
        const objRect = projectObjectToScreenRect(obj, camera, viewport);
        if (!objRect) continue;
        const center = mode === BOX_SELECT_MODES.center
            ? projectObjectBBoxCenterToScreen(obj, camera, viewport)
            : null;
        if (matchesBoxSelectMode(objRect, selectionRect, mode, center)) {
            hits.push(obj);
        }
    }
    return hits;
}

/** Build normalized selection rect from drag start/end in client coordinates. */
export function clientDragToScreenRect(startX, startY, endX, endY) {
    const left = Math.min(startX, endX);
    const right = Math.max(startX, endX);
    const top = Math.min(startY, endY);
    const bottom = Math.max(startY, endY);
    return { left, top, right, bottom };
}

export function createBoxSelectOverlay() {
    const el = document.createElement('div');
    el.className = 'box-select-overlay';
    el.style.display = 'none';
    document.body.appendChild(el);

    return {
        show(left, top, width, height) {
            el.style.display = 'block';
            el.style.left = `${left}px`;
            el.style.top = `${top}px`;
            el.style.width = `${width}px`;
            el.style.height = `${height}px`;
        },
        hide() {
            el.style.display = 'none';
        },
        destroy() {
            el.remove();
        },
    };
}
