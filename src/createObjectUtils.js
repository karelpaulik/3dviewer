// createObjectUtils.js – Parametric primitive creation and regeneration
import * as THREE from 'three';

/** @typedef {'box'|'sphere'|'cylinder'|'cone'|'plane'|'torus'} ParametricType */

export const PRIMITIVE_TYPES = /** @type {const} */ ([
    'box', 'sphere', 'cylinder', 'cone', 'plane', 'torus'
]);

export const PRIMITIVE_LABELS = {
    box: 'Box',
    sphere: 'Sphere',
    cylinder: 'Cylinder',
    cone: 'Cone',
    plane: 'Plane',
    torus: 'Torus'
};

/** Default unit-size parameters (1×1×1 bounding intent). */
export const DEFAULT_PARAMS = {
    box: { width: 1, height: 1, depth: 1 },
    sphere: { radius: 0.5, widthSegments: 32, heightSegments: 16 },
    cylinder: { radiusTop: 0.5, radiusBottom: 0.5, height: 1, radialSegments: 32 },
    cone: { radius: 0.5, height: 1, radialSegments: 32 },
    plane: { width: 1, height: 1, widthSegments: 1, heightSegments: 1 },
    torus: { radius: 0.35, tube: 0.15, radialSegments: 16, tubularSegments: 48 }
};

/**
 * @param {ParametricType} type
 * @param {Record<string, number>} params
 * @returns {THREE.BufferGeometry}
 */
export function buildGeometry(type, params) {
    const p = { ...DEFAULT_PARAMS[type], ...params };
    switch (type) {
        case 'box':
            return new THREE.BoxGeometry(p.width, p.height, p.depth);
        case 'sphere':
            return new THREE.SphereGeometry(p.radius, p.widthSegments, p.heightSegments);
        case 'cylinder':
            return new THREE.CylinderGeometry(p.radiusTop, p.radiusBottom, p.height, p.radialSegments);
        case 'cone':
            return new THREE.ConeGeometry(p.radius, p.height, p.radialSegments);
        case 'plane':
            return new THREE.PlaneGeometry(p.width, p.height, p.widthSegments, p.heightSegments);
        case 'torus':
            return new THREE.TorusGeometry(p.radius, p.tube, p.radialSegments, p.tubularSegments);
        default:
            return new THREE.BoxGeometry(1, 1, 1);
    }
}

/**
 * @param {THREE.Material} material
 * @param {THREE.Plane[]} clipPlanes
 */
export function applyMeshMaterialDefaults(material, clipPlanes) {
    material.clippingPlanes = clipPlanes;
    material.clipIntersection = true;
    material.side = THREE.DoubleSide;
    material.polygonOffset = true;
    material.polygonOffsetFactor = 1;
    material.needsUpdate = true;
}

/**
 * @param {ParametricType} type
 * @param {Record<string, number>} [params]
 * @param {{ clipPlanes?: THREE.Plane[] }} [options]
 * @returns {THREE.Mesh}
 */
export function createParametricMesh(type, params, options = {}) {
    const clipPlanes = options.clipPlanes || [];
    const mergedParams = { ...DEFAULT_PARAMS[type], ...params };
    const geometry = buildGeometry(type, mergedParams);
    const material = new THREE.MeshStandardMaterial({
        color: 0x6699cc,
        roughness: 0.5,
        metalness: 0.1
    });
    applyMeshMaterialDefaults(material, clipPlanes);

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = PRIMITIVE_LABELS[type] || type;
    mesh.userData.parametric = {
        type,
        params: { ...mergedParams },
        version: 1
    };
    return mesh;
}

/**
 * @param {THREE.Object3D} mesh
 * @returns {boolean}
 */
export function isParametricMesh(mesh) {
    return !!(mesh && mesh.isMesh && mesh.userData && mesh.userData.parametric);
}

/**
 * @param {THREE.Mesh} mesh
 */
export function regenerateParametricMesh(mesh) {
    const parametric = mesh.userData.parametric;
    if (!parametric) return;

    const oldGeo = mesh.geometry;
    mesh.geometry = buildGeometry(parametric.type, parametric.params);
    if (oldGeo) oldGeo.dispose();
}

/**
 * Deep-clone parametric metadata and rebuild geometry after THREE.Object3D.clone().
 * @param {THREE.Mesh} clone
 */
export function prepareParametricClone(clone) {
    if (!isParametricMesh(clone)) return;
    clone.userData.parametric = JSON.parse(JSON.stringify(clone.userData.parametric));
    regenerateParametricMesh(clone);
}

/**
 * @param {THREE.Mesh} mesh
 * @param {THREE.Object3D} parent
 * @param {THREE.Scene} scene
 * @param {THREE.Object3D[]} loadedModels
 * @param {THREE.Mesh[]} meshObjects
 */
export function registerParametricMesh(mesh, parent, scene, loadedModels, meshObjects) {
    const isRoot = !parent || parent === scene || parent.isScene;

    if (isRoot) {
        scene.add(mesh);
        if (!loadedModels.includes(mesh)) loadedModels.push(mesh);
    } else {
        parent.add(mesh);
    }

    mesh.userData.initPosition = mesh.position.clone();
    mesh.userData.initRotation = mesh.rotation.clone();
    mesh.userData.initScale = mesh.scale.clone();
    meshObjects.push(mesh);
}

/** GUI field definitions per primitive type. */
const PARAM_FIELDS = {
    box: [
        { key: 'width', label: 'Width', min: 0.01, max: 1000, step: 0.01 },
        { key: 'height', label: 'Height', min: 0.01, max: 1000, step: 0.01 },
        { key: 'depth', label: 'Depth', min: 0.01, max: 1000, step: 0.01 }
    ],
    sphere: [
        { key: 'radius', label: 'Radius', min: 0.01, max: 500, step: 0.01 },
        { key: 'widthSegments', label: 'W segments', min: 3, max: 128, step: 1 },
        { key: 'heightSegments', label: 'H segments', min: 2, max: 64, step: 1 }
    ],
    cylinder: [
        { key: 'radiusTop', label: 'Radius top', min: 0, max: 500, step: 0.01 },
        { key: 'radiusBottom', label: 'Radius bottom', min: 0, max: 500, step: 0.01 },
        { key: 'height', label: 'Height', min: 0.01, max: 1000, step: 0.01 },
        { key: 'radialSegments', label: 'Segments', min: 3, max: 128, step: 1 }
    ],
    cone: [
        { key: 'radius', label: 'Radius', min: 0.01, max: 500, step: 0.01 },
        { key: 'height', label: 'Height', min: 0.01, max: 1000, step: 0.01 },
        { key: 'radialSegments', label: 'Segments', min: 3, max: 128, step: 1 }
    ],
    plane: [
        { key: 'width', label: 'Width', min: 0.01, max: 1000, step: 0.01 },
        { key: 'height', label: 'Height', min: 0.01, max: 1000, step: 0.01 },
        { key: 'widthSegments', label: 'W segments', min: 1, max: 64, step: 1 },
        { key: 'heightSegments', label: 'H segments', min: 1, max: 64, step: 1 }
    ],
    torus: [
        { key: 'radius', label: 'Radius', min: 0.01, max: 500, step: 0.01 },
        { key: 'tube', label: 'Tube', min: 0.01, max: 200, step: 0.01 },
        { key: 'radialSegments', label: 'Radial seg.', min: 3, max: 64, step: 1 },
        { key: 'tubularSegments', label: 'Tubular seg.', min: 3, max: 128, step: 1 }
    ]
};

/**
 * Add lil-gui controls for parametric dimensions.
 * @param {import('lil-gui').GUI} folder
 * @param {THREE.Mesh} mesh
 * @param {() => void} onChange
 */
export function buildParametricGui(folder, mesh, onChange) {
    const parametric = mesh.userData.parametric;
    if (!parametric) return;

    const fields = PARAM_FIELDS[parametric.type];
    if (!fields) return;

    const proxy = parametric.params;
    fields.forEach(({ key, label, min, max, step }) => {
        if (proxy[key] === undefined) return;
        const isInt = step >= 1 && Number.isInteger(step);
        folder.add(proxy, key, min, max, step)
            .name(label)
            .onChange(() => {
                if (isInt) proxy[key] = Math.round(proxy[key]);
                regenerateParametricMesh(mesh);
                onChange();
            });
    });
}
