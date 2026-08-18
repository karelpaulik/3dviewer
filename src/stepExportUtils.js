// stepExportUtils.js – tessellated / faceted STEP (ISO 10303) export from Three.js meshes
import * as THREE from 'three';

const _va = new THREE.Vector3();
const _vb = new THREE.Vector3();
const _vc = new THREE.Vector3();
const _ab = new THREE.Vector3();
const _ac = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _ref = new THREE.Vector3();
const _tmp = new THREE.Vector3();

const DEG_EPS = 1e-18;
const QUANTIZE = 1e6;

export const STEP_FORMAT_TESSELLATED = 'tessellated';
export const STEP_FORMAT_FACETED = 'faceted';

/**
 * @param {import('three').Object3D} obj
 * @returns {boolean}
 */
export function isStepExportableMesh(obj) {
    if (!obj?.isMesh || !obj.geometry) return false;
    if (obj.isInstancedMesh) return false;
    if (obj.isSectionMesh) return false;
    if (typeof obj.name === 'string' && obj.name.endsWith('__section')) return false;
    const ud = obj.userData || {};
    if (ud._isEdgeOverlay || ud._isMeasurement || ud._isAnnotation
        || ud._isAnnotation3d || ud._isCadDim3d || ud._isSectionSketch) {
        return false;
    }
    return !!obj.geometry.getAttribute('position');
}

/**
 * @param {import('three').Object3D} root
 * @returns {import('three').Mesh[]}
 */
export function collectStepExportMeshes(root) {
    const meshes = [];
    if (!root) return meshes;
    root.traverse(obj => {
        if (isStepExportableMesh(obj)) meshes.push(obj);
    });
    return meshes;
}

function quantKey(x, y, z) {
    return `${Math.round(x * QUANTIZE)}:${Math.round(y * QUANTIZE)}:${Math.round(z * QUANTIZE)}`;
}

function meshDisplayName(mesh, fallback) {
    const n = (mesh.name || '').trim();
    return n || fallback || 'mesh';
}

function meshRgb(mesh) {
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    if (!mat?.color) return null;
    return [clamp01(mat.color.r), clamp01(mat.color.g), clamp01(mat.color.b)];
}

function clamp01(v) {
    if (!Number.isFinite(v)) return 0;
    return Math.min(1, Math.max(0, v));
}

function triangleArea2(a, b, c) {
    _ab.subVectors(b, a);
    _ac.subVectors(c, a);
    _tmp.copy(_ab).cross(_ac);
    return _tmp.lengthSq();
}

/**
 * World-space indexed triangle soup for one mesh. Degenerate triangles are dropped.
 * @param {import('three').Mesh} mesh
 * @returns {{ name: string, positions: number[], indices: number[], color: number[]|null, triangleCount: number }}
 */
export function extractWorldTriangleMesh(mesh) {
    const geometry = mesh.geometry;
    const positionAttribute = geometry.getAttribute('position');
    const index = geometry.index;
    const name = meshDisplayName(mesh, 'mesh');
    const color = meshRgb(mesh);

    const vertMap = new Map();
    const positions = [];
    const indices = [];

    const addVertex = (v) => {
        const key = quantKey(v.x, v.y, v.z);
        let idx = vertMap.get(key);
        if (idx === undefined) {
            idx = positions.length / 3;
            vertMap.set(key, idx);
            positions.push(v.x, v.y, v.z);
        }
        return idx;
    };

    const writeFace = (ia, ib, ic) => {
        _va.fromBufferAttribute(positionAttribute, ia);
        _vb.fromBufferAttribute(positionAttribute, ib);
        _vc.fromBufferAttribute(positionAttribute, ic);
        if (mesh.isSkinnedMesh) {
            mesh.applyBoneTransform(ia, _va);
            mesh.applyBoneTransform(ib, _vb);
            mesh.applyBoneTransform(ic, _vc);
        }
        _va.applyMatrix4(mesh.matrixWorld);
        _vb.applyMatrix4(mesh.matrixWorld);
        _vc.applyMatrix4(mesh.matrixWorld);
        if (triangleArea2(_va, _vb, _vc) <= DEG_EPS) return;
        indices.push(addVertex(_va), addVertex(_vb), addVertex(_vc));
    };

    if (index) {
        for (let i = 0; i + 2 < index.count; i += 3) {
            writeFace(index.getX(i), index.getX(i + 1), index.getX(i + 2));
        }
    } else {
        for (let i = 0; i + 2 < positionAttribute.count; i += 3) {
            writeFace(i, i + 1, i + 2);
        }
    }

    return {
        name,
        positions,
        indices,
        color,
        triangleCount: indices.length / 3,
    };
}

/**
 * @param {import('three').Object3D} root
 * @returns {{ parts: ReturnType<typeof extractWorldTriangleMesh>[], triangleCount: number }}
 */
export function collectStepParts(root) {
    const meshes = collectStepExportMeshes(root);
    const parts = [];
    let triangleCount = 0;
    let unnamed = 0;
    for (const mesh of meshes) {
        const part = extractWorldTriangleMesh(mesh);
        if (part.triangleCount === 0) continue;
        if (!mesh.name) {
            unnamed += 1;
            part.name = `mesh_${unnamed}`;
        }
        parts.push(part);
        triangleCount += part.triangleCount;
    }
    return { parts, triangleCount };
}

function formatReal(n) {
    if (!Number.isFinite(n)) return '0.';
    const v = n === 0 ? 0 : n;
    const abs = Math.abs(v);
    if (abs !== 0 && (abs < 1e-6 || abs >= 1e7)) {
        return v.toExponential(8).replace('e+', 'E').replace('e-', 'E-').replace('e', 'E');
    }
    let s = v.toFixed(8);
    s = s.replace(/\.?0+$/, '');
    if (!s.includes('.')) s += '.';
    return s;
}

function formatString(value) {
    const t = String(value ?? '').replace(/\r?\n/g, ' ').replace(/'/g, "''");
    return `'${t.slice(0, 256)}'`;
}

function isoTimestamp(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
        + `T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
}

function unitEntities(w, modelUnit) {
    let lengthUnit;
    const u = String(modelUnit || 'mm').toLowerCase();
    if (u === 'm') {
        lengthUnit = w.raw(`#${w.nextId()} = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT($,.METRE.) );`);
    } else if (u === 'cm') {
        lengthUnit = w.raw(`#${w.nextId()} = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.CENTI.,.METRE.) );`);
    } else if (u === 'inch' || u === 'in') {
        const siMm = w.raw(`#${w.nextId()} = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );`);
        const conv = w.entity('LENGTH_MEASURE_WITH_UNIT', `LENGTH_MEASURE(25.4),#${siMm}`);
        lengthUnit = w.raw(
            `#${w.nextId()} = ( CONVERSION_BASED_UNIT('INCH',#${conv}) LENGTH_UNIT() NAMED_UNIT(*) );`,
        );
    } else {
        lengthUnit = w.raw(`#${w.nextId()} = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );`);
    }

    const angleUnit = w.raw(`#${w.nextId()} = ( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) );`);
    const solidUnit = w.raw(`#${w.nextId()} = ( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() );`);
    const uncertainty = w.entity(
        'UNCERTAINTY_MEASURE_WITH_UNIT',
        `LENGTH_MEASURE(1.E-6),#${lengthUnit},'distance_accuracy_value','confusion accuracy'`,
    );
    const context = w.raw(
        `#${w.nextId()} = ( GEOMETRIC_REPRESENTATION_CONTEXT(3)`
        + ` GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#${uncertainty}))`
        + ` GLOBAL_UNIT_ASSIGNED_CONTEXT((#${lengthUnit},#${angleUnit},#${solidUnit}))`
        + ` REPRESENTATION_CONTEXT('Context #1','3D') );`,
    );
    return { context, lengthUnit };
}

function writeOrigin(w) {
    const p = w.entity('CARTESIAN_POINT', `'Origin',(0.,0.,0.)`);
    const az = w.entity('DIRECTION', `'Z',(0.,0.,1.)`);
    const ax = w.entity('DIRECTION', `'X',(1.,0.,0.)`);
    return w.entity('AXIS2_PLACEMENT_3D', `'Origin',#${p},#${az},#${ax}`);
}

function writeProductScaffold(w, productName, applicationContextName, protocolName, protocolYear) {
    const appCtx = w.entity('APPLICATION_CONTEXT', formatString(applicationContextName));
    w.entity(
        'APPLICATION_PROTOCOL_DEFINITION',
        `${formatString('international standard')},${formatString(protocolName)},${protocolYear},#${appCtx}`,
    );
    const prodCtx = w.entity('PRODUCT_CONTEXT', `'',#${appCtx},'mechanical'`);
    const defCtx = w.entity('PRODUCT_DEFINITION_CONTEXT', `'part definition',#${appCtx},'design'`);
    const product = w.entity('PRODUCT', `${formatString(productName)},${formatString(productName)},'',(#${prodCtx})`);
    w.entity('PRODUCT_RELATED_PRODUCT_CATEGORY', `'part',$,(#${product})`);
    const pdf = w.entity('PRODUCT_DEFINITION_FORMATION', `'','',#${product}`);
    const pd = w.entity('PRODUCT_DEFINITION', `'design','',#${pdf},#${defCtx}`);
    const pds = w.entity('PRODUCT_DEFINITION_SHAPE', `'','',#${pd}`);
    return pds;
}

function writeStyledItem(w, targetId, rgb) {
    if (!rgb) return null;
    const colour = w.entity('COLOUR_RGB', `'',${formatReal(rgb[0])},${formatReal(rgb[1])},${formatReal(rgb[2])}`);
    const fillColour = w.entity('FILL_AREA_STYLE_COLOUR', `'',#${colour}`);
    const fill = w.entity('FILL_AREA_STYLE', `'',(#${fillColour})`);
    const fillArea = w.entity('SURFACE_STYLE_FILL_AREA', `#${fill}`);
    const side = w.entity('SURFACE_SIDE_STYLE', `'',(#${fillArea})`);
    const usage = w.entity('SURFACE_STYLE_USAGE', `.BOTH.,#${side}`);
    const psa = w.entity('PRESENTATION_STYLE_ASSIGNMENT', `(#${usage})`);
    return w.entity('STYLED_ITEM', `'',(#${psa}),#${targetId}`);
}

class StepWriter {
    constructor() {
        this.id = 1;
        this.lines = [];
    }

    nextId() {
        return this.id++;
    }

    entity(type, args) {
        const id = this.nextId();
        this.lines.push(`#${id} = ${type}(${args});`);
        return id;
    }

    raw(line) {
        const match = line.match(/^#(\d+)/);
        const id = match ? Number(match[1]) : this.nextId();
        this.lines.push(line);
        return id;
    }

    wrapRefList(ids, perLine = 16) {
        if (ids.length === 0) return '()';
        const chunks = [];
        for (let i = 0; i < ids.length; i += perLine) {
            const slice = ids.slice(i, i + perLine).map(id => `#${id}`).join(',');
            chunks.push(slice);
        }
        return `(${chunks.join(',')})`;
    }
}

function wrapNumericTriples(values, startParen, endParen, perLine = 8) {
    const n = values.length / 3;
    const chunks = [];
    for (let i = 0; i < n; i += perLine) {
        const end = Math.min(n, i + perLine);
        const parts = [];
        for (let k = i; k < end; k++) {
            const o = k * 3;
            parts.push(`(${formatReal(values[o])},${formatReal(values[o + 1])},${formatReal(values[o + 2])})`);
        }
        chunks.push(parts.join(','));
    }
    return `${startParen}${chunks.join(',')}${endParen}`;
}

function wrapIntTriples(indices, perLine = 12) {
    const n = indices.length / 3;
    const chunks = [];
    for (let i = 0; i < n; i += perLine) {
        const end = Math.min(n, i + perLine);
        const parts = [];
        for (let k = i; k < end; k++) {
            const o = k * 3;
            // STEP coordinates_list is 1-based
            parts.push(`(${indices[o] + 1},${indices[o + 1] + 1},${indices[o + 2] + 1})`);
        }
        chunks.push(parts.join(','));
    }
    return `(${chunks.join(',')})`;
}

function writeHeader({ filename, schema, descriptions, timestamp }) {
    const descList = descriptions.map(d => formatString(d)).join(',');
    return [
        'ISO-10303-21;',
        'HEADER;',
        `FILE_DESCRIPTION((${descList}),'2;1');`,
        `FILE_NAME(${formatString(filename)},${formatString(timestamp)},('Meshbex'),('Meshbex'),`
            + `'Meshbex CAD Explorer','Meshbex CAD Explorer','');`,
        `FILE_SCHEMA((${formatString(schema)}));`,
        'ENDSEC;',
        'DATA;',
    ];
}

/**
 * AP242 tessellated geometry – compact, suitable for large meshes.
 * @param {ReturnType<typeof extractWorldTriangleMesh>[]} parts
 * @param {{ productName?: string, filename?: string, modelUnit?: string, timestamp?: string }} options
 */
export function buildTessellatedStep(parts, options = {}) {
    const productName = options.productName || 'MeshbexExport';
    const filename = options.filename || `${productName}.stp`;
    const timestamp = options.timestamp || isoTimestamp();
    const w = new StepWriter();

    const pds = writeProductScaffold(
        w,
        productName,
        'managed model based 3d engineering',
        'ap242_managed_model_based_3d_engineering',
        2014,
    );
    const { context } = unitEntities(w, options.modelUnit);
    const origin = writeOrigin(w);

    const solidIds = [];
    const styledIds = [];
    for (const part of parts) {
        const coordsId = w.nextId();
        const npoints = part.positions.length / 3;
        w.lines.push(
            `#${coordsId} = COORDINATES_LIST(${formatString(part.name)},${npoints},`
            + `${wrapNumericTriples(part.positions, '(', ')')});`,
        );
        const faceId = w.entity(
            'TRIANGULATED_FACE',
            `${formatString(part.name)},#${coordsId},${npoints},$,$,(),${wrapIntTriples(part.indices)}`,
        );
        const solidId = w.entity('TESSELLATED_SOLID', `${formatString(part.name)},(#${faceId}),$`);
        solidIds.push(solidId);
        const styled = writeStyledItem(w, solidId, part.color);
        if (styled) styledIds.push(styled);
    }

    const tsr = w.entity(
        'TESSELLATED_SHAPE_REPRESENTATION',
        `'',(${solidIds.map(id => `#${id}`).join(',')},#${origin}),#${context}`,
    );
    w.entity('SHAPE_DEFINITION_REPRESENTATION', `#${pds},#${tsr}`);
    if (styledIds.length) {
        w.entity(
            'MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION',
            `'',${w.wrapRefList(styledIds)},#${context}`,
        );
    }

    return [
        ...writeHeader({
            filename,
            schema: 'AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LF { 1 0 10303 442 1 1 4 }',
            descriptions: [
                'AP242 tessellated geometry',
                'CAx-IF Rec.Pracs.---3D Tessellated Geometry---1.1---2019-08-22',
            ],
            timestamp,
        }),
        ...w.lines,
        'ENDSEC;',
        'END-ISO-10303-21;',
        '',
    ].join('\n');
}

function cachedDirection(w, cache, x, y, z) {
    const key = quantKey(x, y, z);
    let id = cache.get(key);
    if (id === undefined) {
        id = w.entity('DIRECTION', `'',(${formatReal(x)},${formatReal(y)},${formatReal(z)})`);
        cache.set(key, id);
    }
    return id;
}

function cachedPoint(w, cache, x, y, z) {
    const key = quantKey(x, y, z);
    let id = cache.get(key);
    if (id === undefined) {
        id = w.entity('CARTESIAN_POINT', `'',(${formatReal(x)},${formatReal(y)},${formatReal(z)})`);
        cache.set(key, id);
    }
    return id;
}

/**
 * AP214 faceted B-Rep – one planar FACE_SURFACE per triangle. Wider CAD support,
 * much larger files than tessellated AP242.
 * @param {ReturnType<typeof extractWorldTriangleMesh>[]} parts
 * @param {{ productName?: string, filename?: string, modelUnit?: string, timestamp?: string }} options
 */
export function buildFacetedStep(parts, options = {}) {
    const productName = options.productName || 'MeshbexExport';
    const filename = options.filename || `${productName}.stp`;
    const timestamp = options.timestamp || isoTimestamp();
    const w = new StepWriter();

    const pds = writeProductScaffold(
        w,
        productName,
        'core data for automotive mechanical design processes',
        'automotive_design',
        2000,
    );
    const { context } = unitEntities(w, options.modelUnit);
    const origin = writeOrigin(w);
    const dirCache = new Map();
    const pointCache = new Map();

    const brepIds = [];
    const styledIds = [];

    for (const part of parts) {
        const faceIds = [];
        const pos = part.positions;
        const idx = part.indices;
        for (let i = 0; i < idx.length; i += 3) {
            const ia = idx[i] * 3;
            const ib = idx[i + 1] * 3;
            const ic = idx[i + 2] * 3;
            _va.set(pos[ia], pos[ia + 1], pos[ia + 2]);
            _vb.set(pos[ib], pos[ib + 1], pos[ib + 2]);
            _vc.set(pos[ic], pos[ic + 1], pos[ic + 2]);
            _ab.subVectors(_vb, _va);
            _ac.subVectors(_vc, _va);
            _normal.copy(_ab).cross(_ac);
            if (_normal.lengthSq() <= DEG_EPS) continue;
            _normal.normalize();
            _ref.copy(_ab);
            if (_ref.lengthSq() <= DEG_EPS) _ref.subVectors(_vc, _va);
            _ref.normalize();
            if (Math.abs(_ref.dot(_normal)) > 0.999) {
                _ref.set(1, 0, 0);
                if (Math.abs(_ref.dot(_normal)) > 0.999) _ref.set(0, 1, 0);
                _ref.cross(_normal).normalize();
            }

            const p1 = cachedPoint(w, pointCache, _va.x, _va.y, _va.z);
            const p2 = cachedPoint(w, pointCache, _vb.x, _vb.y, _vb.z);
            const p3 = cachedPoint(w, pointCache, _vc.x, _vc.y, _vc.z);
            const loop = w.entity('POLY_LOOP', `'',(#${p1},#${p2},#${p3})`);
            const bound = w.entity('FACE_OUTER_BOUND', `'',#${loop},.T.`);
            const axisDir = cachedDirection(w, dirCache, _normal.x, _normal.y, _normal.z);
            const refDir = cachedDirection(w, dirCache, _ref.x, _ref.y, _ref.z);
            const axis = w.entity('AXIS2_PLACEMENT_3D', `'',#${p1},#${axisDir},#${refDir}`);
            const plane = w.entity('PLANE', `'',#${axis}`);
            const face = w.entity('FACE_SURFACE', `'',(#${bound}),#${plane},.T.`);
            faceIds.push(face);
        }
        if (faceIds.length === 0) continue;
        const shell = w.entity('CLOSED_SHELL', `${formatString(part.name)},${w.wrapRefList(faceIds)}`);
        const brep = w.entity('FACETED_BREP', `${formatString(part.name)},#${shell}`);
        brepIds.push(brep);
        const styled = writeStyledItem(w, brep, part.color);
        if (styled) styledIds.push(styled);
    }

    const srep = w.entity(
        'FACETED_BREP_SHAPE_REPRESENTATION',
        `'',(${brepIds.map(id => `#${id}`).join(',')},#${origin}),#${context}`,
    );
    w.entity('SHAPE_DEFINITION_REPRESENTATION', `#${pds},#${srep}`);
    if (styledIds.length) {
        w.entity(
            'MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION',
            `'',${w.wrapRefList(styledIds)},#${context}`,
        );
    }

    return [
        ...writeHeader({
            filename,
            schema: 'AUTOMOTIVE_DESIGN { 1 0 10303 214 1 1 1 1 }',
            descriptions: ['STEP AP214 faceted B-Rep'],
            timestamp,
        }),
        ...w.lines,
        'ENDSEC;',
        'END-ISO-10303-21;',
        '',
    ].join('\n');
}

/**
 * @param {import('three').Object3D} root
 * @param {{
 *   format?: 'tessellated'|'faceted',
 *   productName?: string,
 *   filename?: string,
 *   modelUnit?: string,
 *   timestamp?: string
 * }} [options]
 * @returns {{ text: string, triangleCount: number, partCount: number, format: string }}
 */
export function exportObjectToStep(root, options = {}) {
    const { parts, triangleCount } = collectStepParts(root);
    if (parts.length === 0 || triangleCount === 0) {
        throw new Error('No mesh geometry to export to STEP.');
    }
    const format = options.format === STEP_FORMAT_TESSELLATED
        ? STEP_FORMAT_TESSELLATED
        : STEP_FORMAT_FACETED;
    const text = format === STEP_FORMAT_FACETED
        ? buildFacetedStep(parts, options)
        : buildTessellatedStep(parts, options);
    return { text, triangleCount, partCount: parts.length, format };
}
