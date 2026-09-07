import {
    BufferAttribute,
    BufferGeometry,
    Color,
    ConeGeometry,
    Group,
    LineBasicMaterial,
    LineSegments,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    Vector3,
} from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

export const WORLD_AXES_COLOR_X = '#ff4466';
export const WORLD_AXES_COLOR_Y = '#88ff44';
export const WORLD_AXES_COLOR_Z = '#4488ff';
export const WORLD_AXES_SIZE_MIN = 40;
export const WORLD_AXES_SIZE_MAX = 240;
export const WORLD_AXES_SIZE_DEFAULT = 100;

const LINE_LENGTH = 0.90;
const CONE_RADIUS = 0.024;
const CONE_LENGTH = 0.08;
const LABEL_OFFSET = 1.08;

const AXIS_DEFS = [
    { label: 'X', color: WORLD_AXES_COLOR_X, dir: [1, 0, 0], rx: 0, ry: 0, rz: 0 },
    { label: 'Y', color: WORLD_AXES_COLOR_Y, dir: [0, 1, 0], rx: 0, ry: 0, rz: Math.PI / 2 },
    { label: 'Z', color: WORLD_AXES_COLOR_Z, dir: [0, 0, 1], rx: 0, ry: -Math.PI / 2, rz: 0 },
];

function overlayMaterial(color) {
    return new MeshBasicMaterial({
        color,
        toneMapped: false,
        depthTest: false,
        depthWrite: false,
        clippingPlanes: [],
    });
}

function disableRaycast(obj) {
    obj.raycast = () => {};
}

function createAxisLabel(letter, color) {
    const el = document.createElement('div');
    el.className = 'world-axes-label';
    el.textContent = letter;
    el.style.color = color;
    const label = new CSS2DObject(el);
    label.center.set(0.5, 0.5);
    disableRaycast(label);
    return label;
}

/**
 * CAD world-origin triad (unit length 1). Scale the group for on-screen size.
 * Lines + cones; X/Y/Z are CSS2D overlays just beyond the arrowheads.
 */
export function createWorldAxesTriad() {
    const group = new Group();
    group.name = 'WorldAxesTriad';
    group.renderOrder = 1000;
    group.userData._isWorldAxes = true;
    disableRaycast(group);

    const positions = new Float32Array(18);
    const colors = new Float32Array(18);
    for (let i = 0; i < AXIS_DEFS.length; i++) {
        const { color, dir } = AXIS_DEFS[i];
        const rgb = new Color(color);
        const o = i * 6;
        positions[o] = 0;
        positions[o + 1] = 0;
        positions[o + 2] = 0;
        positions[o + 3] = dir[0] * LINE_LENGTH;
        positions[o + 4] = dir[1] * LINE_LENGTH;
        positions[o + 5] = dir[2] * LINE_LENGTH;
        colors[o] = colors[o + 3] = rgb.r;
        colors[o + 1] = colors[o + 4] = rgb.g;
        colors[o + 2] = colors[o + 5] = rgb.b;
    }

    const lineGeo = new BufferGeometry();
    lineGeo.setAttribute('position', new BufferAttribute(positions, 3));
    lineGeo.setAttribute('color', new BufferAttribute(colors, 3));
    const lineMat = new LineBasicMaterial({
        vertexColors: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
        clippingPlanes: [],
    });
    const lines = new LineSegments(lineGeo, lineMat);
    lines.renderOrder = 1001;
    disableRaycast(lines);
    group.add(lines);

    const coneGeo = new ConeGeometry(CONE_RADIUS, CONE_LENGTH, 16)
        .rotateZ(-Math.PI / 2)
        .translate(LINE_LENGTH + CONE_LENGTH / 2, 0, 0);
    const disposables = [lineGeo, lineMat, coneGeo];
    const axisLabels = [];

    for (const def of AXIS_DEFS) {
        const cone = new Mesh(coneGeo, overlayMaterial(def.color));
        cone.rotation.set(def.rx, def.ry, def.rz);
        cone.renderOrder = 1001;
        disableRaycast(cone);
        group.add(cone);
        disposables.push(cone.material);

        const label = createAxisLabel(def.label, def.color);
        label.position.set(
            def.dir[0] * LABEL_OFFSET,
            def.dir[1] * LABEL_OFFSET,
            def.dir[2] * LABEL_OFFSET
        );
        group.add(label);
        axisLabels.push(label);
    }

    group.userData.axisLabels = axisLabels;
    group.userData._disposables = disposables;
    return group;
}

export function disposeWorldAxesTriad(group) {
    if (!group) return;
    const labels = group.userData.axisLabels;
    if (Array.isArray(labels)) {
        for (const label of labels) {
            label.element?.remove();
            label.removeFromParent();
        }
    }
    const list = group.userData._disposables;
    if (Array.isArray(list)) {
        for (const item of list) item.dispose?.();
    }
    group.userData._disposables = [];
    group.userData.axisLabels = [];
}

const _camWorldPos = new Vector3();

/**
 * World scale so the triad (origin to X/Y/Z labels) spans `screenPx` on screen.
 */
export function computeWorldAxesScreenScale(camera, viewportHeight, screenPx) {
    const px = Math.max(Number(screenPx) || 0, 1);
    const h = Math.max(viewportHeight, 1);
    let pixelWorld;
    if (camera.isPerspectiveCamera) {
        camera.getWorldPosition(_camWorldPos);
        const dist = Math.max(_camWorldPos.length(), camera.near);
        const vFov = MathUtils.degToRad(camera.fov);
        const zoom = camera.zoom || 1;
        pixelWorld = (dist * Math.tan(vFov * 0.5) * 2) / (h * zoom);
    } else {
        pixelWorld = ((camera.top - camera.bottom) / (camera.zoom || 1)) / h;
    }
    return pixelWorld * px / LABEL_OFFSET;
}
