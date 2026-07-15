// toolsPanelUtils.js – Tools panel: measurement, dimension, annotation modes and settings

import { GUI } from 'lil-gui';

export const MODE_LABELS = {
    navigate: 'Navigate',
    measure: 'Add Measure',
    angle: 'Add Measure Angle',
    cadDim: 'Add Dim (Flat)',
    cadDim3d: 'Add Dim (3D)',
    annotation: 'Add Annotation (Flat)',
    annotation3d: 'Add Annotation (3D)',
    assemblyEdit: 'Assembly Edit',
};

const CIRCLE_DETECT_MODES = new Set(['measure', 'angle', 'cadDim', 'cadDim3d']);

const TOOL_BUTTONS = [
    ['measure', 'Measure'],
    ['angle', 'Angle'],
    ['cadDim', 'Dim (Flat)'],
    ['cadDim3d', 'Dim (3D)'],
    ['annotation', 'Annotation (Flat)'],
    ['annotation3d', 'Annotation (3D)'],
];

let _deps = null;
let _modeBtnCtrls = {};
let _circleDetectCtrl = null;
let _cancelBtnCtrl = null;
let _toolsGui = null;
let _lastActivatedToolId = null;

export function getToolsGui() {
    return _toolsGui;
}

export function getActiveInteractionMode(deps) {
    const { viewProp, assemblyState } = deps;
    if (assemblyState?.editMode) return 'assemblyEdit';
    if (viewProp.measureMode) return 'measure';
    if (viewProp.angleMode) return 'angle';
    if (viewProp.cadDimMode) return 'cadDim';
    if (viewProp.cadDim3dMode) return 'cadDim3d';
    if (viewProp.annotationMode) return 'annotation';
    if (viewProp.annotation3dMode) return 'annotation3d';
    return 'navigate';
}

function _clearAllToolModes(deps) {
    const { viewProp } = deps;
    if (viewProp.measureMode) {
        viewProp.measureMode = false;
        deps.setMeasureActive(false);
    }
    if (viewProp.angleMode) {
        viewProp.angleMode = false;
        deps.setAngleActive(false);
    }
    if (viewProp.cadDimMode) {
        viewProp.cadDimMode = false;
        deps.setCadDimActive(false);
        deps.orbitControls.enabled = true;
        deps.updateCadDimHintUI?.();
    }
    if (viewProp.cadDim3dMode) {
        viewProp.cadDim3dMode = false;
        deps.setCadDim3dActive(false);
        deps.orbitControls.enabled = true;
        deps.updateCadDim3dHintUI?.();
    }
    if (viewProp.annotationMode) {
        viewProp.annotationMode = false;
        deps.setAnnotationActive(false);
    }
    if (viewProp.annotation3dMode) {
        viewProp.annotation3dMode = false;
        deps.setAnnotation3dActive(false);
    }
}

function _syncAfterModeChange(deps, modeId) {
    if (!CIRCLE_DETECT_MODES.has(modeId)) {
        deps.viewProp.detectCircleCenter = false;
    }
    syncToolsPanelUI(deps);
    deps.syncLabelEditState?.();
    deps.invalidateModeIndicatorCache?.();
    deps.render?.();
}

export function deactivateTool(deps) {
    if (!deps) deps = _deps;
    if (!deps) return;

    _clearAllToolModes(deps);
    deps.viewProp.isSelectAllowed = true;
    deps.viewProp.detectCircleCenter = false;
    _syncAfterModeChange(deps, 'navigate');
}

export function activateTool(toolId, deps) {
    if (!deps) deps = _deps;
    if (!deps) return;

    const { viewProp, assemblyState } = deps;
    if (assemblyState?.editMode) return;

    _clearAllToolModes(deps);
    viewProp.isSelectAllowed = false;
    _lastActivatedToolId = toolId;

    switch (toolId) {
        case 'measure':
            viewProp.measureMode = true;
            deps.setMeasureActive(true);
            break;
        case 'angle':
            viewProp.angleMode = true;
            deps.setAngleActive(true);
            break;
        case 'cadDim':
            viewProp.cadDimMode = true;
            deps.setCadDimActive(true);
            break;
        case 'cadDim3d':
            viewProp.cadDim3dMode = true;
            deps.setCadDim3dActive(true);
            break;
        case 'annotation':
            viewProp.annotationMode = true;
            deps.setAnnotationActive(true);
            break;
        case 'annotation3d':
            viewProp.annotation3dMode = true;
            deps.setAnnotation3dActive(true);
            break;
        default:
            break;
    }

    if (document.activeElement?.blur && document.activeElement !== document.body) {
        document.activeElement.blur();
    }
    deps.focusViewport?.();

    _syncAfterModeChange(deps, toolId);
}

export function finishToolSession(deps, toolId) {
    if (!deps) deps = _deps;
    if (!deps) return;

    const repeatId = toolId || _lastActivatedToolId;
    if (deps.viewProp.repeatTool && repeatId) {
        activateTool(repeatId, deps);
    } else {
        deactivateTool(deps);
    }
}

export function setInteractionMode(modeId, deps) {
    if (!deps) deps = _deps;
    if (!deps) return;

    const { assemblyState } = deps;
    if (assemblyState?.editMode && modeId !== 'assemblyEdit') return;

    if (modeId === 'navigate') {
        deactivateTool(deps);
        return;
    }
    if (modeId === 'assemblyEdit') {
        _clearAllToolModes(deps);
        deps.viewProp.isSelectAllowed = true;
        _syncAfterModeChange(deps, modeId);
        return;
    }

    activateTool(modeId, deps);
}

export function syncToolsPanelUI(deps) {
    if (!deps) deps = _deps;
    if (!deps) return;

    const active = getActiveInteractionMode(deps);
    const assemblyEdit = !!deps.assemblyState?.editMode;
    const ptpSnap = deps.isPtpSnapActive?.() ?? false;
    const showCircleDetect = CIRCLE_DETECT_MODES.has(active) || ptpSnap;

    for (const [key, ctrl] of Object.entries(_modeBtnCtrls)) {
        if (!ctrl?.domElement) continue;
        const isActive = !assemblyEdit && key === active;
        ctrl.domElement.classList.toggle('mode-active', isActive);
        if (assemblyEdit) {
            ctrl.disable();
        } else {
            ctrl.enable();
        }
    }

    if (_circleDetectCtrl) {
        if (showCircleDetect) {
            _circleDetectCtrl.show();
            _circleDetectCtrl.enable();
        } else {
            _circleDetectCtrl.hide();
            deps.viewProp.detectCircleCenter = false;
            _circleDetectCtrl.setValue(false);
        }
    }

    if (_cancelBtnCtrl) {
        const toolActive = !assemblyEdit && active !== 'navigate';
        if (toolActive) {
            _cancelBtnCtrl.show();
            _cancelBtnCtrl.enable();
        } else {
            _cancelBtnCtrl.hide();
        }
    }
}

function _buildDimensionDefaultsFolder(parentFolder, deps) {
    const _rotOpts = { '0°': 0, '90°': Math.PI / 2, '180°': Math.PI, '270°': 3 * Math.PI / 2 };
    const _orientOpts = { 'Face camera': 'camera', 'XY plane': 'XY', 'XZ plane': 'XZ', 'YZ plane': 'YZ' };
    const dimensionFolder = parentFolder.addFolder('Dimension defaults');

    const flatDimDefaultsFolder = dimensionFolder.addFolder('Dimension (Flat) defaults');
    const _flatDimDef = deps.getFlatDimDefaults();
    flatDimDefaultsFolder.add(_flatDimDef, 'fontSize', 8, 24, 1).name('Size').listen();
    flatDimDefaultsFolder.addColor(_flatDimDef, 'textColor').name('Text color').listen();
    flatDimDefaultsFolder.addColor(_flatDimDef, 'bgColor').name('Background').listen();
    flatDimDefaultsFolder.add({ fn() { deps.applyDefaultsToAllFlatDim(deps.render); } }, 'fn').name('Apply to all existing');
    flatDimDefaultsFolder.close();

    const cadDim3dDefaultsFolder = dimensionFolder.addFolder('Dimension (3D) defaults');
    const _cadDim3dDef = deps.getCadDim3dDefaults();
    cadDim3dDefaultsFolder.add(_cadDim3dDef, 'labelScale', 0.01, 100, 0.01).name('Size').listen();
    cadDim3dDefaultsFolder.add(_cadDim3dDef, 'rotationCamera', _rotOpts).name('Rotation (Face camera)').listen();
    cadDim3dDefaultsFolder.add(_cadDim3dDef, 'rotationXY', _rotOpts).name('Rotation (XY plane)').listen();
    cadDim3dDefaultsFolder.add(_cadDim3dDef, 'rotationXZ', _rotOpts).name('Rotation (XZ plane)').listen();
    cadDim3dDefaultsFolder.add(_cadDim3dDef, 'rotationYZ', _rotOpts).name('Rotation (YZ plane)').listen();
    cadDim3dDefaultsFolder.add(_cadDim3dDef, 'orientationMode', _orientOpts).name('Orientation').listen();
    cadDim3dDefaultsFolder.addColor(_cadDim3dDef, 'textColor').name('Text color').listen();
    cadDim3dDefaultsFolder.addColor(_cadDim3dDef, 'bgColor').name('Background').listen();
    cadDim3dDefaultsFolder.add({ fn() { deps.applyDefaultsToAllCadDim3d(deps.render); } }, 'fn').name('Apply to all existing');
    cadDim3dDefaultsFolder.close();

    const dimMarkersFolder = dimensionFolder.addFolder('Dimension markers defaults');
    const _dimMarkerOpts = deps.getDimMarkerSettings();
    deps.setCadDimMarkerFixedSize(_dimMarkerOpts.fixedSize);
    deps.setCadDimMarkerFixedScreenPx(_dimMarkerOpts.fixedScreenPx);
    deps.setCadDimMarkerWorldSize(_dimMarkerOpts.worldSize);
    deps.setCadDimMarkerColor(_dimMarkerOpts.markerColor);
    dimMarkersFolder.add(_dimMarkerOpts, 'fixedSize').name('Fixed size').onChange(v => {
        deps.setDimMarkerFixedSize(v);
        deps.setCadDimMarkerFixedSize(v);
        deps.render();
    }).listen();
    dimMarkersFolder.add(_dimMarkerOpts, 'fixedScreenPx', 1, 30, 0.5).name('Size – fixed (px)').onChange(v => {
        deps.setDimMarkerFixedScreenPx(v);
        deps.setCadDimMarkerFixedScreenPx(v);
        deps.render();
    }).listen();
    dimMarkersFolder.add(_dimMarkerOpts, 'worldSize', 0.01, 100, 0.01).name('Size – free (world)').onChange(v => {
        deps.setDimMarkerWorldSize(v);
        deps.setCadDimMarkerWorldSize(v);
        deps.render();
    }).listen();
    dimMarkersFolder.addColor(_dimMarkerOpts, 'markerColor').name('Color').onChange(v => {
        deps.setDimMarkerColor(v);
        deps.setCadDimMarkerColor(v);
        deps.render();
    }).listen();
    dimMarkersFolder.close();

    dimensionFolder.add({ fn() {
        Object.assign(_flatDimDef, { textColor: '#ffffff', bgColor: '#1976d2', fontSize: 11 });
        Object.assign(_cadDim3dDef, { labelScale: 5, rotationCamera: 0, rotationXY: 0, rotationXZ: 0, rotationYZ: 0, orientationMode: 'camera', textColor: '#ffffff', bgColor: '#1976d2' });
        Object.assign(_dimMarkerOpts, { fixedSize: false, fixedScreenPx: 3, worldSize: 5, markerColor: '#22aacc' });
        deps.setDimMarkerFixedSize(_dimMarkerOpts.fixedSize);
        deps.setCadDimMarkerFixedSize(_dimMarkerOpts.fixedSize);
        deps.setDimMarkerFixedScreenPx(_dimMarkerOpts.fixedScreenPx);
        deps.setCadDimMarkerFixedScreenPx(_dimMarkerOpts.fixedScreenPx);
        deps.setDimMarkerWorldSize(_dimMarkerOpts.worldSize);
        deps.setCadDimMarkerWorldSize(_dimMarkerOpts.worldSize);
        deps.setDimMarkerColor(_dimMarkerOpts.markerColor);
        deps.setCadDimMarkerColor(_dimMarkerOpts.markerColor);
        deps.render();
    } }, 'fn').name('Set to default');
    dimensionFolder.add({ fn() {
        deps.applyDefaultsToAllFlatDim(deps.render);
        deps.applyDefaultsToAllCadDim3d(deps.render);
    } }, 'fn').name('Apply to existing');
    dimensionFolder.close();
}

function _buildAnnotationDefaultsFolder(parentFolder, deps) {
    const _rotOpts = { '0°': 0, '90°': Math.PI / 2, '180°': Math.PI, '270°': 3 * Math.PI / 2 };
    const _orientOpts = { 'Face camera': 'camera', 'XY plane': 'XY', 'XZ plane': 'XZ', 'YZ plane': 'YZ' };
    const annotationFolder = parentFolder.addFolder('Annotation defaults');

    const flatAnnDefaultsFolder = annotationFolder.addFolder('Annotation (Flat) defaults');
    const _flatAnnDef = deps.getFlatAnnDefaults();
    flatAnnDefaultsFolder.add(_flatAnnDef, 'fontSize', 8, 24, 1).name('Size').listen();
    flatAnnDefaultsFolder.addColor(_flatAnnDef, 'textColor').name('Text color').listen();
    flatAnnDefaultsFolder.addColor(_flatAnnDef, 'bgColor').name('Background').listen();
    flatAnnDefaultsFolder.add({ fn() { deps.applyDefaultsToAllFlatAnnotations(deps.render); } }, 'fn').name('Apply to all existing');
    flatAnnDefaultsFolder.close();

    const ann3dDefaultsFolder = annotationFolder.addFolder('Annotation (3D) defaults');
    const _ann3dDef = deps.getAnnotation3dDefaults();
    ann3dDefaultsFolder.add(_ann3dDef, 'labelScale', 0.01, 100, 0.01).name('Size').listen();
    ann3dDefaultsFolder.add(_ann3dDef, 'rotationCamera', _rotOpts).name('Rotation (Face camera)').listen();
    ann3dDefaultsFolder.add(_ann3dDef, 'rotationXY', _rotOpts).name('Rotation (XY plane)').listen();
    ann3dDefaultsFolder.add(_ann3dDef, 'rotationXZ', _rotOpts).name('Rotation (XZ plane)').listen();
    ann3dDefaultsFolder.add(_ann3dDef, 'rotationYZ', _rotOpts).name('Rotation (YZ plane)').listen();
    ann3dDefaultsFolder.add(_ann3dDef, 'orientationMode', _orientOpts).name('Orientation').listen();
    ann3dDefaultsFolder.addColor(_ann3dDef, 'textColor').name('Text color').listen();
    ann3dDefaultsFolder.addColor(_ann3dDef, 'bgColor').name('Background').listen();
    ann3dDefaultsFolder.add({ fn() { deps.applyDefaultsToAllAnnotations3d(deps.render); } }, 'fn').name('Apply to all existing');
    ann3dDefaultsFolder.close();

    const annMarkersFolder = annotationFolder.addFolder('Annotation markers defaults');
    const _annMarkerOpts = deps.getAnnMarkerSettings();
    deps.setAnn3dMarkerFixedSize(_annMarkerOpts.fixedSize);
    deps.setAnn3dMarkerFixedScreenPx(_annMarkerOpts.fixedScreenPx);
    deps.setAnn3dMarkerWorldSize(_annMarkerOpts.worldSize);
    deps.setAnn3dMarkerColor(_annMarkerOpts.markerColor);
    annMarkersFolder.add(_annMarkerOpts, 'fixedSize').name('Fixed size').onChange(v => {
        deps.setAnnMarkerFixedSize(v);
        deps.setAnn3dMarkerFixedSize(v);
        deps.render();
    }).listen();
    annMarkersFolder.add(_annMarkerOpts, 'fixedScreenPx', 1, 30, 0.5).name('Size – fixed (px)').onChange(v => {
        deps.setAnnMarkerFixedScreenPx(v);
        deps.setAnn3dMarkerFixedScreenPx(v);
        deps.render();
    }).listen();
    annMarkersFolder.add(_annMarkerOpts, 'worldSize', 0.01, 100, 0.01).name('Size – free (world)').onChange(v => {
        deps.setAnnMarkerWorldSize(v);
        deps.setAnn3dMarkerWorldSize(v);
        deps.render();
    }).listen();
    annMarkersFolder.addColor(_annMarkerOpts, 'markerColor').name('Color').onChange(v => {
        deps.setAnnMarkerColor(v);
        deps.setAnn3dMarkerColor(v);
        deps.render();
    }).listen();
    annMarkersFolder.close();

    annotationFolder.add({ fn() {
        Object.assign(_flatAnnDef, { textColor: '#ffffff', bgColor: '#388e3c', fontSize: 11 });
        Object.assign(_ann3dDef, { labelScale: 5, rotationCamera: 0, rotationXY: 0, rotationXZ: 0, rotationYZ: 0, orientationMode: 'camera', textColor: '#ffffff', bgColor: '#388e3c' });
        Object.assign(_annMarkerOpts, { fixedSize: false, fixedScreenPx: 3, worldSize: 5, markerColor: '#44aa44' });
        deps.setAnnMarkerFixedSize(_annMarkerOpts.fixedSize);
        deps.setAnn3dMarkerFixedSize(_annMarkerOpts.fixedSize);
        deps.setAnnMarkerFixedScreenPx(_annMarkerOpts.fixedScreenPx);
        deps.setAnn3dMarkerFixedScreenPx(_annMarkerOpts.fixedScreenPx);
        deps.setAnnMarkerWorldSize(_annMarkerOpts.worldSize);
        deps.setAnn3dMarkerWorldSize(_annMarkerOpts.worldSize);
        deps.setAnnMarkerColor(_annMarkerOpts.markerColor);
        deps.setAnn3dMarkerColor(_annMarkerOpts.markerColor);
        deps.render();
    } }, 'fn').name('Set to default');
    annotationFolder.add({ fn() {
        deps.applyDefaultsToAllFlatAnnotations(deps.render);
        deps.applyDefaultsToAllAnnotations3d(deps.render);
    } }, 'fn').name('Apply to existing');
    annotationFolder.close();
}

/**
 * @param {HTMLElement} container
 * @param {object} deps
 * @returns {import('lil-gui').GUI}
 */
export function initToolsPanel(container, deps) {
    _deps = deps;
    _modeBtnCtrls = {};

    const toolsGui = new GUI({ container, title: 'Tools' });
    _toolsGui = toolsGui;

    const toolsFolder = toolsGui.addFolder('Tools');
    for (const [toolId, label] of TOOL_BUTTONS) {
        const ctrl = toolsFolder.add({ fn() { activateTool(toolId, deps); } }, 'fn').name(label);
        _modeBtnCtrls[toolId] = ctrl;
    }
    _cancelBtnCtrl = toolsFolder.add({ fn() {
        deactivateTool(deps);
        deps.focusViewport?.();
    } }, 'fn').name('Cancel');
    _cancelBtnCtrl.domElement?.classList.add('tool-cancel-btn');
    const _cancelBtn = _cancelBtnCtrl.domElement?.querySelector('button');
    if (_cancelBtn) _cancelBtn.style.color = '#e53935';
    _cancelBtnCtrl.hide();
    toolsFolder.open();

    const optionsFolder = toolsGui.addFolder('Options');
    optionsFolder.add(deps.viewProp, 'repeatTool').name('Repeat tool');
    _circleDetectCtrl = optionsFolder.add(deps.viewProp, 'detectCircleCenter').name('Detect circle center').onChange(() => {
        deps.render();
    });
    _circleDetectCtrl.hide();
    optionsFolder.add(deps.viewProp, 'showBehindModel').name('Show behind model').onChange(value => {
        deps.setMeasurementDepthTest(!value);
        deps.setAnnotationDepthTest(!value);
        deps.setAnnotation3dDepthTest(!value);
        deps.setCadDim3dDepthTest(!value);
        deps.render();
    });
    optionsFolder.close();

    const visibilityFolder = toolsGui.addFolder('Visibility');
    visibilityFolder.add(deps.viewProp, 'showMeasurements').name('Show measurements').onChange(value => {
        deps.setMeasurementsVisible(value);
        deps.setCadDim3dVisible(value);
        deps.render();
    });
    visibilityFolder.add(deps.viewProp, 'showAnnotations').name('Show annotations').onChange(value => {
        deps.setAnnotationsVisible(value);
        deps.setAnnotations3dVisible(value);
        deps.render();
    });
    visibilityFolder.close();

    const actionsFolder = toolsGui.addFolder('Actions');
    actionsFolder.add({ fn() {
        if (!confirm('Clear all measurements/dimensions?')) return;
        deps.clearMeasurements(deps.render);
        deps.clearAngleMeasurements(deps.render);
        deps.clearCadDimMeasurements(deps.render);
        deps.clearCadDim3dMeasurements(deps.render);
    } }, 'fn').name('Clear all measurements…');
    actionsFolder.add({ fn() {
        if (!confirm('Clear all annotations?')) return;
        deps.clearAnnotations(deps.render);
        deps.clearAnnotations3d(deps.render);
    } }, 'fn').name('Clear all annotations…');
    actionsFolder.close();

    _buildDimensionDefaultsFolder(toolsGui, deps);
    _buildAnnotationDefaultsFolder(toolsGui, deps);

    syncToolsPanelUI(deps);
    return toolsGui;
}
