import * as THREE from 'three';
import { applyMeshMaterialDefaults } from './createObjectUtils.js';

export const MESH_MATERIAL_TYPE_KEYS = [
    'MeshBasicMaterial',
    'MeshLambertMaterial',
    'MeshPhongMaterial',
    'MeshStandardMaterial',
    'MeshPhysicalMaterial',
];

/** @type {Record<string, typeof THREE.Material>} */
export const MESH_MATERIAL_TYPES = {
    MeshBasicMaterial: THREE.MeshBasicMaterial,
    MeshLambertMaterial: THREE.MeshLambertMaterial,
    MeshPhongMaterial: THREE.MeshPhongMaterial,
    MeshStandardMaterial: THREE.MeshStandardMaterial,
    MeshPhysicalMaterial: THREE.MeshPhysicalMaterial,
};

const COMMON_PROPS = [
    'map', 'opacity', 'transparent', 'side', 'wireframe', 'vertexColors',
    'alphaMap', 'alphaTest', 'depthTest', 'depthWrite', 'visible', 'fog',
    'blending', 'toneMapped', 'name',
    'clippingPlanes', 'clipIntersection', 'polygonOffset',
    'polygonOffsetFactor', 'polygonOffsetUnits',
    'lightMap', 'lightMapIntensity',
    'envMap', 'reflectivity',
];

const PHYSICAL_EXTRA_PROPS = [
    'clearcoat', 'clearcoatRoughness', 'clearcoatMap', 'clearcoatNormalMap', 'clearcoatNormalScale',
    'clearcoatRoughnessMap', 'transmission', 'transmissionMap', 'thickness', 'thicknessMap',
    'ior', 'sheen', 'sheenRoughness', 'sheenColor', 'sheenColorMap', 'sheenRoughnessMap',
    'specularIntensity', 'specularColor', 'specularIntensityMap', 'specularColorMap',
    'iridescence', 'iridescenceIOR', 'iridescenceThicknessRange', 'iridescenceMap', 'iridescenceThicknessMap',
    'anisotropy', 'anisotropyRotation', 'anisotropyMap', 'attenuationColor', 'attenuationDistance',
    'displacementMap', 'displacementScale', 'displacementBias',
];

/**
 * @returns {Record<string, string>}
 */
export function getMaterialTypeOptions() {
    /** @type {Record<string, string>} */
    const opts = {};
    for (const key of MESH_MATERIAL_TYPE_KEYS) opts[key] = key;
    return opts;
}

/**
 * @param {THREE.Material} source
 * @returns {Record<string, unknown>}
 */
function pickCommonProps(source) {
    /** @type {Record<string, unknown>} */
    const params = {};
    if (source.color?.isColor) params.color = source.color.clone();
    for (const key of COMMON_PROPS) {
        if (source[key] !== undefined) params[key] = source[key];
    }
    if (source.userData && Object.keys(source.userData).length > 0) {
        params.userData = { ...source.userData };
    }
    return params;
}

/**
 * @param {THREE.Material} source
 * @param {Record<string, unknown>} params
 */
function pickEmissiveProps(source, params) {
    if (source.emissive?.isColor) params.emissive = source.emissive.clone();
    if (source.emissiveMap) params.emissiveMap = source.emissiveMap;
    if (source.emissiveIntensity !== undefined) params.emissiveIntensity = source.emissiveIntensity;
}

/**
 * @param {THREE.Material} source
 * @param {Record<string, unknown>} params
 */
function pickNormalBumpProps(source, params) {
    if (source.normalMap) params.normalMap = source.normalMap;
    if (source.normalScale?.isVector2) params.normalScale = source.normalScale.clone();
    if (source.bumpMap) params.bumpMap = source.bumpMap;
    if (source.bumpScale !== undefined) params.bumpScale = source.bumpScale;
}

/**
 * @param {THREE.Material} source
 * @param {Record<string, unknown>} params
 */
function pickAoProps(source, params) {
    if (source.aoMap) params.aoMap = source.aoMap;
    if (source.aoMapIntensity !== undefined) params.aoMapIntensity = source.aoMapIntensity;
}

/**
 * @param {THREE.Material} source
 * @returns {number}
 */
function standardRoughness(source) {
    if (source.roughness !== undefined) return source.roughness;
    if (source.shininess !== undefined) return Math.max(0, Math.min(1, 1 - source.shininess / 100));
    return 0.5;
}

/**
 * @param {THREE.Material} source
 * @returns {number}
 */
function standardMetalness(source) {
    if (source.metalness !== undefined) return source.metalness;
    return 0;
}

/**
 * @param {THREE.Material} source
 * @returns {number}
 */
function phongShininess(source) {
    if (source.shininess !== undefined) return source.shininess;
    if (source.roughness !== undefined) return Math.max(0, Math.min(100, (1 - source.roughness) * 100));
    return 30;
}

/**
 * @param {THREE.Material} source
 * @returns {THREE.Color}
 */
function phongSpecular(source) {
    if (source.specular?.isColor) return source.specular.clone();
    const m = standardMetalness(source);
    return new THREE.Color(m, m, m);
}

/**
 * @param {THREE.Material} source
 * @param {string} targetTypeKey
 * @returns {Record<string, unknown>}
 */
function buildParamsForType(source, targetTypeKey) {
    const params = pickCommonProps(source);

    switch (targetTypeKey) {
        case 'MeshBasicMaterial':
            break;

        case 'MeshLambertMaterial':
            pickEmissiveProps(source, params);
            pickNormalBumpProps(source, params);
            pickAoProps(source, params);
            break;

        case 'MeshPhongMaterial':
            pickEmissiveProps(source, params);
            pickNormalBumpProps(source, params);
            pickAoProps(source, params);
            if (source.specularMap) params.specularMap = source.specularMap;
            params.shininess = phongShininess(source);
            params.specular = phongSpecular(source);
            break;

        case 'MeshStandardMaterial':
            pickEmissiveProps(source, params);
            pickNormalBumpProps(source, params);
            pickAoProps(source, params);
            if (source.envMapIntensity !== undefined) params.envMapIntensity = source.envMapIntensity;
            params.roughness = standardRoughness(source);
            params.metalness = standardMetalness(source);
            if (source.roughnessMap) params.roughnessMap = source.roughnessMap;
            if (source.metalnessMap) params.metalnessMap = source.metalnessMap;
            if (source.displacementMap) params.displacementMap = source.displacementMap;
            if (source.displacementScale !== undefined) params.displacementScale = source.displacementScale;
            if (source.displacementBias !== undefined) params.displacementBias = source.displacementBias;
            break;

        case 'MeshPhysicalMaterial':
            pickEmissiveProps(source, params);
            pickNormalBumpProps(source, params);
            pickAoProps(source, params);
            if (source.envMapIntensity !== undefined) params.envMapIntensity = source.envMapIntensity;
            params.roughness = standardRoughness(source);
            params.metalness = standardMetalness(source);
            if (source.roughnessMap) params.roughnessMap = source.roughnessMap;
            if (source.metalnessMap) params.metalnessMap = source.metalnessMap;
            for (const key of PHYSICAL_EXTRA_PROPS) {
                if (source[key] === undefined) continue;
                if (source[key]?.isColor) params[key] = source[key].clone();
                else if (source[key]?.isVector2) params[key] = source[key].clone();
                else params[key] = source[key];
            }
            break;
    }

    return params;
}

/**
 * @param {THREE.Material} source
 * @param {string} targetTypeKey
 * @param {{ clipPlanes?: THREE.Plane[] }} [options]
 * @returns {THREE.Material}
 */
export function convertMaterial(source, targetTypeKey, { clipPlanes } = {}) {
    if (!source) throw new Error('No source material');

    const TargetClass = MESH_MATERIAL_TYPES[targetTypeKey];
    if (!TargetClass) throw new Error(`Unknown material type: ${targetTypeKey}`);

    if (source.type === targetTypeKey) {
        const cloned = source.clone();
        if (clipPlanes) applyMeshMaterialDefaults(cloned, clipPlanes);
        cloned.needsUpdate = true;
        return cloned;
    }

    const params = buildParamsForType(source, targetTypeKey);
    if (!params.color) params.color = new THREE.Color(0x888888);

    const newMat = new TargetClass(params);
    if (clipPlanes) {
        applyMeshMaterialDefaults(newMat, clipPlanes);
    } else {
        newMat.needsUpdate = true;
    }

    source.dispose();
    return newMat;
}

/**
 * @param {THREE.Mesh} mesh
 * @param {THREE.Material} newMaterial
 * @param {number} [materialIndex]
 */
export function replaceMeshMaterial(mesh, newMaterial, materialIndex = 0) {
    if (!mesh?.isMesh) return;
    if (Array.isArray(mesh.material)) {
        mesh.material[materialIndex] = newMaterial;
    } else {
        mesh.material = newMaterial;
    }
}

/**
 * @param {THREE.Mesh} mesh
 * @param {number} [materialIndex]
 */
export function syncSectionMeshFromParent(mesh, materialIndex = 0) {
    const parentMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const parentMat = parentMats[materialIndex];
    if (!parentMat?.color) return;

    mesh.children
        .filter(child => child.isSectionMesh)
        .forEach(sectionMesh => {
            const sectionMats = Array.isArray(sectionMesh.material)
                ? sectionMesh.material
                : [sectionMesh.material];
            const idx = Math.min(materialIndex, sectionMats.length - 1);
            if (sectionMats[idx]?.color) {
                sectionMats[idx].color.copy(parentMat.color);
                sectionMats[idx].needsUpdate = true;
            }
        });
}

/**
 * @param {THREE.Material} mat
 * @returns {THREE.Material}
 */
export function convertToStandardMaterial(mat) {
    return convertMaterial(mat, 'MeshStandardMaterial');
}
