// meshDensityUtils.js – coarsen (Simplify) / refine (Tessellate) mesh geometry density
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js';
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

/** Vertex count above which Simplify's O(n^2) edge-collapse search may noticeably block the UI. */
export const SIMPLIFY_SLOW_VERTEX_THRESHOLD = 20000;

/**
 * @param {THREE.BufferGeometry} geometry
 * @returns {number}
 */
function triangleCountOf(geometry) {
    if (!geometry) return 0;
    const index = geometry.getIndex();
    const pos = geometry.getAttribute('position');
    const count = index ? index.count : (pos ? pos.count : 0);
    return Math.floor(count / 3);
}

/**
 * @param {THREE.Mesh[]} meshes
 * @returns {{ trianglesBefore: number, vertsBefore: number, maxVertsBefore: number }}
 */
export function estimateMeshDensityStats(meshes) {
    let trianglesBefore = 0;
    let vertsBefore = 0;
    let maxVertsBefore = 0;
    for (const mesh of meshes) {
        const geometry = mesh?.geometry;
        if (!geometry) continue;
        trianglesBefore += triangleCountOf(geometry);
        const posCount = geometry.getAttribute('position')?.count || 0;
        vertsBefore += posCount;
        if (posCount > maxVertsBefore) maxVertsBefore = posCount;
    }
    return { trianglesBefore, vertsBefore, maxVertsBefore };
}

/**
 * @param {THREE.Mesh} mesh
 * @returns {string|null} error message, or null if the mesh is eligible
 */
function checkMeshEligible(mesh) {
    if (!mesh?.geometry?.getAttribute('position')) {
        return `Mesh "${mesh?.name || 'unnamed'}" has no valid geometry.`;
    }
    const groups = mesh.geometry.groups;
    if (Array.isArray(mesh.material) && groups && groups.length > 1) {
        return `Mesh "${mesh.name || 'unnamed'}" has multiple materials/geometry groups, which Simplify/Tessellate would not preserve. `
            + 'Use "Flatten Materials + geometry" first (Mesh operations folder).';
    }
    return null;
}

/**
 * @param {THREE.BufferGeometry} geometry
 * @param {boolean} mergeVerticesAfter
 * @returns {THREE.BufferGeometry}
 */
function finalizeGeometry(geometry, mergeVerticesAfter) {
    let result = geometry;
    if (mergeVerticesAfter) {
        result = mergeVertices(result);
    }
    result.computeVertexNormals();
    result.computeBoundingBox();
    result.computeBoundingSphere();
    return result;
}

/**
 * @param {THREE.Mesh} mesh
 * @param {(geometry: THREE.BufferGeometry) => THREE.BufferGeometry} transform
 */
function replaceMeshGeometry(mesh, transform) {
    const old = mesh.geometry;
    mesh.geometry = transform(old);
    old.dispose();
}

/**
 * Default max edge length when "auto" (0) is requested: a fraction of the mesh's own bounding box diagonal.
 * @param {THREE.BufferGeometry} geometry
 * @returns {number}
 */
function autoMaxEdgeLength(geometry) {
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    const dx = bb.max.x - bb.min.x;
    const dy = bb.max.y - bb.min.y;
    const dz = bb.max.z - bb.min.z;
    const diagonal = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    return diagonal * 0.02;
}

/**
 * @typedef {Object} TessellateOptions
 * @property {number} maxEdgeLength – 0 means "auto" (2% of each mesh's own bbox diagonal)
 * @property {number} maxIterations
 * @property {boolean} mergeVerticesAfter
 */

/**
 * Refine (increase triangle count) by splitting edges longer than maxEdgeLength.
 * @param {THREE.Mesh[]} meshes
 * @param {TessellateOptions} options
 * @returns {{ count: number, error: string|null, trianglesBefore: number, trianglesAfter: number }}
 */
export function applyTessellateToMeshes(meshes, options = {}) {
    const { maxEdgeLength = 0, maxIterations = 6, mergeVerticesAfter = true } = options;
    if (!meshes.length) {
        return { count: 0, error: 'No meshes found in selection.', trianglesBefore: 0, trianglesAfter: 0 };
    }
    for (const mesh of meshes) {
        const err = checkMeshEligible(mesh);
        if (err) return { count: 0, error: err, trianglesBefore: 0, trianglesAfter: 0 };
    }

    let trianglesBefore = 0;
    let trianglesAfter = 0;

    for (const mesh of meshes) {
        trianglesBefore += triangleCountOf(mesh.geometry);
        const edgeLength = maxEdgeLength > 0 ? maxEdgeLength : autoMaxEdgeLength(mesh.geometry);
        const modifier = new TessellateModifier(edgeLength, maxIterations);
        replaceMeshGeometry(mesh, (geometry) => finalizeGeometry(modifier.modify(geometry), mergeVerticesAfter));
        trianglesAfter += triangleCountOf(mesh.geometry);
    }

    return { count: meshes.length, error: null, trianglesBefore, trianglesAfter };
}

/**
 * @typedef {Object} SimplifyOptions
 * @property {number} ratio – fraction of vertices to keep (0.05–0.95)
 * @property {boolean} mergeVerticesAfter
 */

/**
 * Coarsen (decrease triangle count) via edge-collapse decimation.
 * @param {THREE.Mesh[]} meshes
 * @param {SimplifyOptions} options
 * @returns {{ count: number, error: string|null, trianglesBefore: number, trianglesAfter: number }}
 */
export function applySimplifyToMeshes(meshes, options = {}) {
    const { ratio = 0.5, mergeVerticesAfter = true } = options;
    if (!meshes.length) {
        return { count: 0, error: 'No meshes found in selection.', trianglesBefore: 0, trianglesAfter: 0 };
    }
    for (const mesh of meshes) {
        const err = checkMeshEligible(mesh);
        if (err) return { count: 0, error: err, trianglesBefore: 0, trianglesAfter: 0 };
    }

    let trianglesBefore = 0;
    let trianglesAfter = 0;

    for (const mesh of meshes) {
        trianglesBefore += triangleCountOf(mesh.geometry);
        const vertCount = mesh.geometry.getAttribute('position').count;
        const targetVertCount = Math.max(4, Math.floor(vertCount * ratio));
        const removeCount = Math.max(0, vertCount - targetVertCount);
        if (removeCount > 0) {
            const modifier = new SimplifyModifier();
            replaceMeshGeometry(mesh, (geometry) => finalizeGeometry(modifier.modify(geometry, removeCount), mergeVerticesAfter));
        }
        trianglesAfter += triangleCountOf(mesh.geometry);
    }

    return { count: meshes.length, error: null, trianglesBefore, trianglesAfter };
}
