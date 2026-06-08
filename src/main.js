//main.js
//asdf
import * as THREE from 'three';
import gsap from 'gsap';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { ThreeMFLoader } from 'three/addons/loaders/3MFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js';

//import { GUI } from 'dat.gui';
import { GUI } from 'lil-gui';
import ZipLoader from 'zip-loader';
import { updateCrossSectionLines as updateCrossSectionLinesCore, updateSectionCrossLines as updateSectionCrossLinesCore } from './crossSectionUtils.js';
import { exportToHTML, exportToHTMLDraco, exportToHTMLObfuscated, exportToHTMLObfuscatedDraco } from './htmlExport.js';
import { initOutliner, toggleOutliner, rebuildTree, highlightObject as outlinerHighlight, updateVisibilityIcon, updateObjectLabel, isOutlinerOpen, navigateOutliner, highlightGroupObjects, clearGroupHighlights, setNavigationPosition } from './sceneOutliner.js';
import { initMeasurement, isMeasureActive, setMeasureActive, addMeasurePoint, clearMeasurements, getMeasurementCount, updateMeasurePreview, updateMarkerScales, isAngleActive, setAngleActive, addAnglePoint, updateAnglePreview, clearAngleMeasurements, isSelectDimActive, setSelectDimActive, deleteSelectedDimension, initSelectDimension, updateSelectDimensionCamera, reconstructMeasurements, stripMeasurementVisuals, setMeasurementsVisible, setMeasurementDepthTest, removeMeasurementsForOwner, isCadDimActive, setCadDimActive, getCadDimStep, getCadDimAxis, addCadDimPoint, updateCadDimPreview, updateCadDimHoverPreview, cycleCadDimAxis, placeCadDim, clearCadDimMeasurements, removeCadDimMeasurementsForOwner, getSelectedCadDim, setCadDimLabelMode, setCadDimDragMode, selectDimTouchStart, selectDimTouchMove, selectDimTouchEnd, registerLabelForSelection, getSelectedCadDim3d, getCadDimMeasurements, deleteCadDimByRef, convertCadDim3dTo2d, getFlatDimDefaults, applyDefaultsToAllFlatDim, setDimMarkerFixedSize, setDimMarkerFixedScreenPx, setDimMarkerWorldSize, setDimMarkerColor, getDimMarkerSettings } from './measurementUtils.js';
import { detectCircleCenterFromHit } from './circleDetectionUtils.js';
import { initAnnotations, isAnnotationActive, setAnnotationActive, addAnnotationPoint, getAnnotationPendingPoint, updateAnnotationPreview, updateAnnotationMarkerScales, setAnnotationsVisible, clearAnnotations, stripAnnotationVisuals, reconstructAnnotations, setAnnotationDepthTest, removeAnnotationsForOwner, getAnnotations, isAddLeaderLineActive, cancelAddLeaderLine, commitAddLeaderLine, deleteAnnotationByRef, setConvertTo3dFn, reconstructAnnotationFromRec, getFlatAnnDefaults, applyDefaultsToAllFlatAnnotations, setAnnMarkerFixedSize, setAnnMarkerFixedScreenPx, setAnnMarkerWorldSize, setAnnMarkerColor, getAnnMarkerSettings } from './annotationUtils.js';
import { initAnnotations3d, isAnnotation3dActive, setAnnotation3dActive, addAnnotation3dPoint, getAnnotation3dPendingPoint, updateAnnotation3dPreview, updateAnnotation3dMarkerScales, updateAnnotation3dOrientations, setAnnotations3dVisible, clearAnnotations3d, stripAnnotation3dVisuals, reconstructAnnotations3d, setAnnotation3dDepthTest, removeAnnotations3dForOwner, isAddLeaderLine3dActive, cancelAddLeaderLine3d, commitAddLeaderLine3d, getAnnotation3dDefaults, deleteAnnotation3dByRef, setConvertTo2dFn, reconstructAnnotation3dFromRec, applyDefaultsToAllAnnotations3d, setAnn3dMarkerFixedSize, setAnn3dMarkerFixedScreenPx, setAnn3dMarkerWorldSize, setAnn3dMarkerColor } from './annotation3dUtils.js';
import { initCadDim3d, isCadDim3dActive, getCadDim3dStep, getCadDim3dAxis, setCadDim3dActive, addCadDim3dPoint, updateCadDim3dPreview, updateCadDim3dHoverPreview, cycleCadDim3dAxis, placeCadDim3d, clearCadDim3dMeasurements, removeCadDim3dMeasurementsForOwner, setCadDim3dVisible, setCadDim3dDepthTest, updateCadDim3dOrientations, updateCadDim3dMarkerScales, reconstructCadDim3d, stripCadDim3dVisuals, setCadDim3dLabelMode, setCadDim3dDragMode, setCadDim3dOrientationMode, setCadDim3dRotate, setCadDim3dLabelScaleDialog, setCadDim3dMirrored, setCadDim3dTextColor, setCadDim3dBgColor, getCadDim3dDefaults, convertCadDimTo3d, applyDefaultsToAllCadDim3d, setCadDimMarkerFixedSize, setCadDimMarkerFixedScreenPx, setCadDimMarkerWorldSize, setCadDimMarkerColor } from './cadDim3dUtils.js';
import { computeSolidSection, clearSolidSection } from './solidSectionUtils.js';
import { initDocumentsGui, importDocumentsFromGltfScene, getDocumentsStore, flushDocumentEdits, isDocOverlayBlockingInput, setDocLabelOptions } from './documentsUtils.js';
import { initAttachmentsGui, importAttachmentsFromGltfScene, getAttachmentsStore } from './attachmentsUtils.js';
import { openHelp } from './helpUtils.js';
import { openBomDialog } from './bomUtils.js';

// Proměnné globálního rozsahu----------------------------------------------------------------------------------------
let container, stats;
let camera, cameraTarget, scene, renderer;
let css2DRenderer;
let css3DRenderer;
let viewHelper;			

const clipPlanes = [];		
let crossSectionLines = null; // Pro uchování průřezových čar
let sectionCrossSectionLines = null; // Pro uchování průřezových čar vázaných na section view

// --- Section plane gizmo (TransformControls on clip planes) ---
let sectionTransformControls = null; // Dedicated TransformControls for section gizmo
let sectionGizmoHelper = null;       // Invisible helper object whose position drives clip planes

let cameraPersp, cameraOrtho, currentCamera;
let transformControls, orbitControls;
const meshObjects = [];
const hiddenObjects = [];
let temporarilyShownObjects = [];
const loadedModels = []; // Pole pro uchování načtených GLB modelů (root scene objekty)

// ===== Assembly / Disassembly Workflow =====
const assemblyData = {
    modelFile: '',
    description: '',
    steps: []  // { id, name, description, transformations: [{ objectRef, initPosition, finalPosition, initQuaternion, finalQuaternion, initScale, finalScale }] }
};

// Map: objectRef → { position, quaternion, scale } = the fully-assembled (base) state for each object.
// Set once when an object is first introduced into any step. Used by repairChain to keep
// initPositions consistent when steps are edited or reordered.
const assemblyAnchors = new Map();

const assemblyState = {
    editMode: false,       // When true, object drags are recorded into the active edit step
    currentStepIndex: -1,  // -1 = fully assembled; N = steps[0..N] have been applied (also used as the edit target)
};

let assemblyAnimation = null;         // GSAP tween handle for step animation
let assemblyAnimationFinalize = null;  // Snaps in-flight animation to its end state
let cameraAnimation = null;            // GSAP tween handle for camera animation
let cameraAnimationFinalize = null;    // Snaps in-flight camera animation to its end state
let assemblyStepsListFolder = null; // Dynamicky přebudovávaný subfolder seznamu kroků
let _assemblyFolderRef = null;      // Reference na hlavní Assembly Workflow folder (pro rebuild)
let lightsFolder = null; // Reference na Lights folder ve View panelu

const assemblyGui = {
    stepInfo: '\u2013 no step \u2013',
    editMode: false,
    editStepInfo: '\u2013 no step \u2013',
    stepName: '',
    stepDescription: '',
    animationDuration: 1000,
    animationEase: 'power1.inOut',
    animationRepeat: 0,
    animationDelay: 100,
    animationRepeatDelay: 0,
    animationYoyo: false,
    animationStagger: 0,
    animationOverwrite: 'auto',
    animationLoop: false,
    animationCamera: true,
    zoomCoeff: 1,
};
// ============================================

// GUI toolbar (full-width top bar) + panel container (right-aligned below)
const guiToolbar = document.createElement('div');
guiToolbar.id = 'gui-toolbar';
document.body.appendChild(guiToolbar);

const guiContainer = document.createElement('div');
guiContainer.id = 'gui-container';
document.body.appendChild(guiContainer);

// Status bar (footer)
const statusBar = document.createElement('div');
statusBar.id = 'status-bar';
statusBar.innerHTML = `<span class="status-left"></span><span class="status-right"><span class="status-brand"><i>BE &amp; DO BETTER</i></span><span>info@bedobe.eu</span><span class="status-copy">&copy; 2026 Bedobe</span><span class="status-version">v${__APP_VERSION__}</span></span>`;
document.body.appendChild(statusBar);

// Mode + Selection indicator elements (in .status-left)
const statusModeLabelEl = document.createElement('span');
statusModeLabelEl.className = 'status-label';
statusModeLabelEl.textContent = 'Mode:';
const statusModeEl = document.createElement('select');
statusModeEl.className = 'status-select mode-navigate';
[
    ['navigate',     'Navigate'],
    ['measure',      'Add Measure'],
    ['angle',        'Add Measure Angle'],
    ['cadDim',       'Add Dim (Flat)'],
    ['cadDim3d',     'Add Dim (3D)'],
    ['annotation',   'Add Annotation (Flat)'],
    ['annotation3d', 'Add Annotation (3D)'],
    ['selectDim',    'Edit Labels'],
    ['assemblyEdit', 'Assembly Edit'],
].forEach(([val, label]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    if (val === 'assemblyEdit') opt.disabled = true;
    statusModeEl.appendChild(opt);
});
statusModeEl.addEventListener('change', function() {
    const val = this.value;
    if (viewProp.measureMode)         { viewProp.measureMode = false;         setMeasureActive(false); }
    if (viewProp.angleMode)           { viewProp.angleMode = false;           setAngleActive(false); }
    if (viewProp.cadDimMode)          { viewProp.cadDimMode = false;          setCadDimActive(false);   orbitControls.enabled = true; _updateCadDimHintUI(); }
    if (viewProp.cadDim3dMode)        { viewProp.cadDim3dMode = false;        setCadDim3dActive(false); orbitControls.enabled = true; _updateCadDim3dHintUI(); }
    if (viewProp.selectDimensionMode) { viewProp.selectDimensionMode = false; setSelectDimActive(false); }
    if (viewProp.annotationMode)      { viewProp.annotationMode = false;      setAnnotationActive(false); }
    if (viewProp.annotation3dMode)    { viewProp.annotation3dMode = false;    setAnnotation3dActive(false); }
    viewProp.isSelectAllowed = true;
    switch (val) {
        case 'measure':      viewProp.measureMode = true;         setMeasureActive(true);     viewProp.isSelectAllowed = false; break;
        case 'angle':        viewProp.angleMode = true;           setAngleActive(true);        viewProp.isSelectAllowed = false; break;
        case 'cadDim':       viewProp.cadDimMode = true;          setCadDimActive(true);       viewProp.isSelectAllowed = false; break;
        case 'cadDim3d':     viewProp.cadDim3dMode = true;        setCadDim3dActive(true);     viewProp.isSelectAllowed = false; break;
        case 'selectDim':    viewProp.selectDimensionMode = true; setSelectDimActive(true);    viewProp.isSelectAllowed = false; break;
        case 'annotation':   viewProp.annotationMode = true;      setAnnotationActive(true);   viewProp.isSelectAllowed = false; break;
        case 'annotation3d': viewProp.annotation3dMode = true;    setAnnotation3dActive(true); viewProp.isSelectAllowed = false; break;
    }
    const _circleDetectModes = ['measure', 'angle', 'cadDim', 'cadDim3d'];
    statusCircleDetectEl.style.display = _circleDetectModes.includes(val) ? '' : 'none';
    _syncModeBtns();
    _modeIndicatorCache = '';
    render();
});
// Detect circle center toggle (shown only for measure/angle/cadDim/cadDim3d modes)
const statusCircleDetectEl = document.createElement('label');
statusCircleDetectEl.id = 'circle-detect-btn';
statusCircleDetectEl.className = 'status-circle-detect';
statusCircleDetectEl.style.display = 'none';
const statusCircleDetectCb = document.createElement('input');
statusCircleDetectCb.type = 'checkbox';
statusCircleDetectCb.addEventListener('change', function() {
    viewProp.detectCircleCenter = this.checked;
});
statusCircleDetectEl.appendChild(statusCircleDetectCb);
statusCircleDetectEl.appendChild(document.createTextNode('Detect circle center'));
const statusSepEl = document.createElement('span');
statusSepEl.className = 'status-sep';
statusSepEl.textContent = '|';
const statusSelLabelEl = document.createElement('span');
statusSelLabelEl.className = 'status-label';
statusSelLabelEl.textContent = 'Selection:';
const statusSelEl = document.createElement('select');
statusSelEl.className = 'status-select mode-select';
[
    ['cad',      'CAD Selection'],
    ['detailed', 'Detailed Selection'],
    ['none',     'No Selection'],
].forEach(([val, label]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = label;
    statusSelEl.appendChild(opt);
});
statusSelEl.addEventListener('change', function() {
    const val = this.value;
    if (val === 'none') {
        viewProp.isSelectAllowed = false;
    } else {
        viewProp.isSelectAllowed = true;
        viewProp.cadSelection = (val === 'detailed') ? 'Detailed' : 'CAD';
    }
    _modeIndicatorCache = '';
    render();
});
const _statusLeft = statusBar.querySelector('.status-left');
_statusLeft.appendChild(statusModeLabelEl);
_statusLeft.appendChild(statusModeEl);
_statusLeft.appendChild(statusSepEl);
_statusLeft.appendChild(statusSelLabelEl);
_statusLeft.appendChild(statusSelEl);

let sectionCtrl = null; // Reference to the GUI 'Section' controller for syncing

// Fullscreen toggle button (bottom-left, next to ViewHelper gizmo)
const fsBtn = document.createElement('button');
fsBtn.id = 'fs-btn';
fsBtn.title = 'Fullscreen';
fsBtn.textContent = '⛶';
fsBtn.addEventListener('click', () => {
    viewProp.fullscreen = !viewProp.fullscreen;
    if (viewProp.fullscreen) {
        document.documentElement.requestFullscreen().then(() => {
            if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Escape']).catch(() => {});
        }).catch((err) => {
            console.warn('Fullscreen not available: ', err.message);
            viewProp.fullscreen = false;
        });
    } else {
        if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
        if (document.fullscreenElement) document.exitFullscreen();
    }
    fsBtn.classList.toggle('active', viewProp.fullscreen);
});
document.body.appendChild(fsBtn);

// Section toggle button (bottom-left, next to fs-btn)
const sectionBtn = document.createElement('button');
sectionBtn.id = 'section-btn';
sectionBtn.title = 'Section View';
sectionBtn.textContent = '✂';
sectionBtn.addEventListener('click', () => {
    viewProp.section = !viewProp.section;
    renderer.localClippingEnabled = viewProp.section;
    viewProp.sectionGizmo = viewProp.section;
    activateSectionGizmo(viewProp.section);
    updateSectionCrossLines();
    viewProp.solidSection = viewProp.section;
    if (viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render);
    else clearSolidSection(scene, render);
    render();
    sectionBtn.classList.toggle('active', viewProp.section);
    solidSectionBtn.style.display = viewProp.section ? 'block' : 'none';
    showSectionMeshBtn.style.display = viewProp.section ? 'block' : 'none';
    solidSectionBtn.classList.toggle('active', viewProp.solidSection);
    showSectionMeshBtn.classList.toggle('active', viewProp.showSectionMesh);
    if (sectionCtrl) sectionCtrl.updateDisplay();
});
document.body.appendChild(sectionBtn);

// Solid Section button (visible only when section is active)
const solidSectionBtn = document.createElement('button');
solidSectionBtn.id = 'solid-section-btn';
solidSectionBtn.title = 'Solid Section';
solidSectionBtn.textContent = '◼';
solidSectionBtn.addEventListener('click', () => {
    viewProp.solidSection = !viewProp.solidSection;
    if (viewProp.solidSection) {
        renderer.localClippingEnabled = true;
        viewProp.section = true;
        computeSolidSection(scene, meshObjects, viewProp, render);
    } else {
        clearSolidSection(scene, render);
    }
    solidSectionBtn.classList.toggle('active', viewProp.solidSection);
    render();
});
document.body.appendChild(solidSectionBtn);

// Show Section Mesh button (visible only when section is active)
const showSectionMeshBtn = document.createElement('button');
showSectionMeshBtn.id = 'show-section-mesh-btn';
showSectionMeshBtn.title = 'Show Section Mesh';
showSectionMeshBtn.textContent = '⊞';
showSectionMeshBtn.addEventListener('click', () => {
    viewProp.showSectionMesh = !viewProp.showSectionMesh;
    toggleSectionMeshAll();
    showSectionMeshBtn.classList.toggle('active', viewProp.showSectionMesh);
    render();
});
document.body.appendChild(showSectionMeshBtn);

document.body.appendChild(statusCircleDetectEl);

// Wrapper reference for hit-testing (toolbar + panels + outliner)
let outlinerPanelEl = null;
const guiWrapper = { contains(el) { return guiToolbar.contains(el) || Object.values(guiPanels).some(p => p.gui && p.gui.domElement.style.display !== 'none' && p.gui.domElement.contains(el)) || (outlinerPanelEl && outlinerPanelEl.contains(el)) || statusBar.contains(el) || statusCircleDetectEl.contains(el); } };

let guiView = null;
let guiAssembly = null;

// --- Toolbar panel switching ---
const guiPanels = {};   // { name: { gui, btn } }
let activePanel = null; // currently visible panel name (excludes 'Selected')

// Outliner toggle button (left-aligned in toolbar)
const outlinerBtn = document.createElement('button');
outlinerBtn.className = 'gui-toolbar-btn outliner-toolbar-btn';
outlinerBtn.textContent = '☰ Scene';
outlinerBtn.addEventListener('click', () => {
    const open = toggleOutliner();
    outlinerBtn.classList.toggle('active', open);
});
guiToolbar.insertBefore(outlinerBtn, guiToolbar.firstChild);

// File name input – shows the name of the imported file; used as default export name
const fileNameInput = document.createElement('input');
fileNameInput.id = 'toolbar-filename-input';
fileNameInput.type = 'text';
fileNameInput.placeholder = 'file name…';
fileNameInput.title = 'File name (default name for export)';
guiToolbar.insertBefore(fileNameInput, outlinerBtn.nextSibling);

// Pre-create all toolbar buttons in desired order: Selected, File, Edit, View, Tools, Assembly, Docs, Help
['Selected', 'File', 'Edit', 'View', 'Assembly', 'Docs', 'Files', 'Help'].forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'gui-toolbar-btn';
    btn.textContent = name;
    btn.addEventListener('click', () => showGuiPanel(name));
    guiToolbar.appendChild(btn);
    guiPanels[name] = { gui: null, btn };
    if (name === 'Selected') btn.style.display = 'none';
});

let lastSelectedObject = null;
const lastSelectedMeshes = [];
const selectionHistory = [];
let selectedFolder = null;
const xrayBackup = new Map(); // mesh → { renderOrder, depthTests: boolean[] }

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2( 1, 1 ); //udání hodnoty 1,1 je kvůli inicializaci. Jinak může vybrat objekt i když není na vybrání.
const mouseDownPos = new THREE.Vector2();
const mouseUpPos = new THREE.Vector2();
const touchStartPos = new THREE.Vector2();
const touchEndPos = new THREE.Vector2();

// --- CAD Dimension hint overlay (created in init) ---
let _cadDimHintDiv = null;
function _updateCadDimHintUI(overrideAxis) {
    if (!_cadDimHintDiv) return;
    if (viewProp.cadDimMode && isCadDimActive() && getCadDimStep() === 2) {
        const ax = (overrideAxis || getCadDimAxis()).toUpperCase();
        _cadDimHintDiv.innerHTML = 'CAD dim &nbsp;·&nbsp; Axis: <b>' + ax + '</b> &nbsp;·&nbsp; RMB: cycle X/Y/Z &nbsp;·&nbsp; LMB: place';
        _cadDimHintDiv.style.display = 'block';
    } else {
        _cadDimHintDiv.style.display = 'none';
    }
}

// --- Mode toggle button controllers (Tools panel) ---
const _modeBtnCtrls = {};
function _syncModeBtns() {
    const entries = [
        ['measure',      'measureMode'],
        ['angle',        'angleMode'],
        ['cadDim',       'cadDimMode'],
        ['cadDim3d',     'cadDim3dMode'],
        ['annotation',   'annotationMode'],
        ['annotation3d', 'annotation3dMode'],
    ];
    for (const [key, prop] of entries) {
        const ctrl = _modeBtnCtrls[key];
        if (!ctrl) continue;
        if (viewProp[prop]) {
            ctrl.domElement.classList.add('mode-active');
        } else {
            ctrl.domElement.classList.remove('mode-active');
        }
    }
}

// --- CAD Dimension 3D hint overlay (created in init) ---
let _cadDim3dHintDiv = null;
function _updateCadDim3dHintUI(overrideAxis) {
    if (!_cadDim3dHintDiv) return;
    if (viewProp.cadDim3dMode && isCadDim3dActive() && getCadDim3dStep() === 2) {
        const ax = (overrideAxis || getCadDim3dAxis()).toUpperCase();
        _cadDim3dHintDiv.innerHTML = 'CAD dim 3D &nbsp;·&nbsp; Axis: <b>' + ax + '</b> &nbsp;·&nbsp; RMB: cycle X/Y/Z &nbsp;·&nbsp; LMB: place';
        _cadDim3dHintDiv.style.display = 'block';
    } else {
        _cadDim3dHintDiv.style.display = 'none';
    }
}

// --- Face-to-face snap hint overlay (created in init) ---
let _faceSnapHintDiv = null;
function _updateFaceSnapHintUI() {
    if (!_faceSnapHintDiv) return;
    if (faceSnapMode) {
        _faceSnapHintDiv.innerHTML = faceSnapStep === 0
            ? '🎯 Face snap &nbsp;·&nbsp; Click the face of the object to move &nbsp;·&nbsp; ESC: cancel'
            : '🎯 Face snap &nbsp;·&nbsp; Click target face to align to &nbsp;·&nbsp; ESC: cancel';
        _faceSnapHintDiv.style.display = 'block';
    } else {
        _faceSnapHintDiv.style.display = 'none';
    }
}

// --- Point-to-point snap hint overlay (created in init) ---
let _ptpSnapHintDiv = null;
function _updatePtpSnapHintUI() {
    if (!_ptpSnapHintDiv) return;
    if (ptpSnapMode) {
        _ptpSnapHintDiv.innerHTML = ptpSnapStep === 0
            ? '📍 Point snap &nbsp;·&nbsp; Click source point on the object to move &nbsp;·&nbsp; ESC: cancel'
            : '📍 Point snap &nbsp;·&nbsp; Click target point to snap to &nbsp;·&nbsp; ESC: cancel';
        _ptpSnapHintDiv.style.display = 'block';
    } else {
        _ptpSnapHintDiv.style.display = 'none';
    }
}

let INTERSECTED;
let isMouseDown = false;
let isTouchDragging = false;
let suppressTouchEndOnce = false; // Prevents deselect after long-press context menu
let _suppressNextClick = false;   // Prevents object selection on the click that closes a context menu

let isTouchScreen;

let selectionHelper;
let axesHelperObject = null; // Reference na axes helper objekt ve scéně
let cameraProspHelperObject = null; // Reference na camera helper objekt ve scéně (persp)
let cameraOrthoHelperObject = null; // Reference na camera helper objekt ve scéně (ortho)
let raycastArrowHelper = null;
const sceneLights = []; // Reference na světla scény (hemisféra + 2x directional)
const lightHelperObjects = []; // LightHelper objekty // ArrowHelper pro vizualizaci raycasting paprsku
let isTransformDragging = false;
let orthoHalfSize = 500; // Polovelikost frustumu ortografické kamery v world units (dynamicky přepočítána po načtení modelu)
// --- Face-to-face snap state ---
let faceSnapMode = false;
let faceSnapStep = 0;        // 0 = picking source face, 1 = picking target face
let faceSnapSourcePoint = null;   // world-space point on source face
let faceSnapSourceNormal = null;  // world-space normal of source face
let faceSnapSourceObject = null;  // the Object3D to be moved
let faceSnapArrow = null;         // ArrowHelper visual feedback
let faceSnapHighlightMesh = null; // Single-triangle highlight overlay
// --- Point-to-point snap state ---
let ptpSnapMode = false;
let ptpSnapStep = 0;         // 0 = picking source point, 1 = picking target point
let ptpSnapSourcePoint = null;    // world-space source point
let ptpSnapSourceObject = null;   // the Object3D to be moved
let ptpSnapDotMesh = null;        // SphereGeometry preview dot
let previousTransformState = null; // Uložení předchozího stavu pro undo
let previousGroupTransformStates = []; // World positions of group objects before drag (for assembly recording)


// --- Multi-výběr ---
const selectedObjects = [];       // objekty přidané do multi-výběru (reference, ještě nejsou reparentovány)
const multiOriginalParents = [];  // původní rodiče (paralelní pole k selectedObjects)
const multiSelectionHelpers = []; // azurové BoxHelpery pro vizualizaci multi-výběru
let pivotObject = null;           // pivot pro skupinovou transformaci
let singleSelectPivot = null;           // pivot pro single-select (gizmo na středu bboxu)
let singleSelectPivotInitMatrix = null; // world matice pivotu na začátku dragu
let singleSelectObjectInitMatrix = null; // world matice objektu na začátku dragu

// --- Group History ---
const groupHistory = [];          // pole snapshotů: { name, objects[] }
let groupHistoryIndex = -1;       // index aktuálně zobrazeného záznamu (-1 = žádný)
const groupHistoryPreviewHelpers = []; // oránžové BoxHelpery pro náhled history entry
const assemblyStepHelpers = [];       // žluté BoxHelpery pro objekty aktuálního assembly kroku (edit mode)

const viewProp = {
    perspCam: false,
    section: false,
    fullscreen: false,
    isSelectAllowed: true, // Povolit / zakázat selekci objektů myší
    backgroundColor: "#867e79",
    px: 0,
    py: 0,
    pz: 0,
    showCrossSection: false,
    crossSectionPlane: 'XY', // XY, XZ, YZ
    crossSectionPos: 0,
    crossSectionColor: "#ff0000",
    showSectionMesh: false, // Toggle pro zobrazení/skrytí sectionMesh
    sectionGizmo: false, // Toggle section gizmo on/off
    sectionSnapTranslation: 1, // Snap step for section gizmo translation
    autoUpdateSectionLines: false, // Automaticky aktualizovat průřezové čáry při změnách scény
    sectionCrossLines: true, // Průřezové čáry vázané na section view clip planes
    crossSectionOnHidden: false, // Aplikovat průřezové čáry i na skryté objekty
    solidSection: false, // Solid (capped) section cut
    capColor: '#00ffff', // Color of the solid section cap faces
    transformSpace: true,  // true = world, false = local
    snapTranslation: 10,   // krok translace
    snapRotationDeg: 30,   // krok rotace ve stupních
    snapScale: 0.25,       // krok měřítka
    transformMode: 'translate', // transform mode: translate, rotate, scale
    wireframe: false,       // Wireframe přepínač
    showAxesHelper: false, // Zobrazit / skrýt axes helper
    axesHelperSize: 100,   // Velikost axes helperu
    showCameraHelper: false, // Zobrazit / skrýt camera helper (frustum perspektivní kamery)
    showCameraOrthoHelper: false, // Zobrazit / skrýt camera helper (frustum ortografické kamery)
    showLightHelper: false, // Zobrazit / skrýt light helpery (hemisféra + directional světla)
    lightHelperSize: 100,  // Velikost light helperů (0 = auto z rozsahu scény)
    showRaycastHelper: false, // Zobrazit / skrýt raycasting helper (ArrowHelper)
    raycastHelperSize: 20000,  // Délka paprsku raycasting helperu
    cadSelection: 'CAD', // CAD selection: 'CAD' = vybere pojmenovaného předka meshe, 'Detailed' = vybere mesh přímo
    multiSelectBoxPadding: 3, // Rozšíření PaddedBoxHelperu pro multiselect (world-units)
    isGroupTransformActive: false,
    historyInfo: '– žádný záznam –',
    measureMode: false, // Point-to-point measurement mode
    angleMode: false, // Angle measurement mode (4 points → 2 lines → projected angles)
    cadDimMode: false,   // CAD-style dimension (CSS2D, 2 pts + axis-aligned placement mode)
    cadDim3dMode: false, // CAD-style dimension (CSS3D label, same interaction as cadDimMode)
    selectDimensionMode: false, // Select dimension mode – click label to select, drag to move, Delete to remove
    detectCircleCenter: false, // Snap measurement points to detected circle centers
    showMeasurements: true, // Toggle visibility of all measurement visuals
    annotationMode: false,   // CSS2D annotation (note) mode
    annotation3dMode: false, // CSS3D annotation (note) mode
    showAnnotations: true, // Toggle visibility of all annotations
    showBehindModel: false, // Zobrazit kóty/poznámky i za modelem (depthTest off)
    xrayOnSelect: false, // X-ray efekt při výběru objektu (depthTest off)
    orientedSelectionBox: 'local',
};

const toolbarDefaults = {
    toolbarFontSize: 12,    // px – toolbar button font size
    toolbarHeight: 28,      // px – toolbar bar height
    fontSize: 12,           // px – font size for panels and folder titles
    rowHeight: 26,          // px – row height for panels and folder titles
    panelWidth: 300,        // px – panel width
};

const toolbarInitDefaults = { ...toolbarDefaults };

const dracoDefaults = {
    useCustomSettings: false,        // false = draco() defaults, true = use settings below
    method:           'edgebreaker', // 'edgebreaker' | 'sequential'
    encodeSpeed:      5,             // 0–10
    decodeSpeed:      5,             // 0–10
    quantizePosition: 14,            // bits
    quantizeNormal:   10,            // bits
    quantizeColor:    8,             // bits
    quantizeTexcoord: 12,            // bits
    quantizeGeneric:  12,            // bits
};
const dracoInitDefaults = { ...dracoDefaults };

const extent = {
    pn: -1000,
    pp: +1000,
    pStep: 0.1,
    rn: -3.1416,
    rp: 3.1416,
    rStep: Math.PI / 6,
    sn: 0,
    sp: 10,
    sStep: 0.1
}
    
const part = {
    color: "#888888",
    bbSize: "",
    showBBox: false,
};
let bbHelper = null; // Dedicated PaddedBoxHelper for bounding box display toggle
let bbAxesHelper = null; // AxesHelper shown together with bbHelper

// Možnost zobrazení následujících objektů v konzoli pouze v režimu "npx vite"
if (import.meta.env.DEV) {
    //OK, reference na objekty jsou dostupné v konzoli pro ladění
    window.meshObjects = meshObjects;
    window.clipPlanes = clipPlanes;
    window.loadedModels = loadedModels;
    window.assemblyData = assemblyData;
    window.assemblyState = assemblyState;
    window.getAnnotations = getAnnotations;
    window.getDocumentsStore = getDocumentsStore;

    //NOK - toto není reference
    window.transformControls = transformControls;
    window.lastSelectedObject = lastSelectedObject;
}


/**
 * PaddedBoxHelper – stejné chování jako THREE.BoxHelper, ale s nastavitelným
 * rozšířením (padding) na všech šesti stranách ohraničujícího boxu.
 *
 * @param {THREE.Object3D} object  – objekt, jehož bounding-box se zobrazuje
 * @param {number|string}  color   – barva drátového rámečku (výchozí 0xffff00)
 * @param {number}         padding – rozšíření boxu ve world-units na každé straně (výchozí 0)
 */
class PaddedBoxHelper extends THREE.LineSegments {
    constructor(object, color = 0xffff00, padding = 0) {
        const indices = new Uint16Array([0,1, 1,2, 2,3, 3,0,  4,5, 5,6, 6,7, 7,4,  0,4, 1,5, 2,6, 3,7]);
        const positions = new Float32Array(8 * 3);
        const geometry = new THREE.BufferGeometry();
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        super(geometry, new THREE.LineBasicMaterial({ color, toneMapped: false }));
        this.object  = object;
        this.padding = padding;
        this.type    = 'PaddedBoxHelper';
        this.matrixAutoUpdate = false;
        this.update();
    }

    update(object) {
        if (object !== undefined) this.object = object;
        if (this.object === undefined) return;

        const min = new THREE.Vector3(Infinity, Infinity, Infinity);
        const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
        const v = new THREE.Vector3();

        const isAnnotOrDim = (ch) => ch.userData._isMeasurement || ch.userData._isAnnotation || ch.userData._isAnnotation3d || ch.userData._isCadDim3d;

        if (viewProp.orientedSelectionBox === 'local') {
            // Compute bounding box from vertices in the object's local space (OBB)
            const invMatrix = new THREE.Matrix4().copy(this.object.matrixWorld).invert();
            this.object.traverse(child => {
                if (isAnnotOrDim(child)) return;
                if (child.geometry && child.geometry.attributes.position) {
                    const pos = child.geometry.attributes.position;
                    const toLocal = new THREE.Matrix4().multiplyMatrices(invMatrix, child.matrixWorld);
                    for (let i = 0; i < pos.count; i++) {
                        v.fromBufferAttribute(pos, i).applyMatrix4(toLocal);
                        min.min(v); max.max(v);
                    }
                }
            });
        } else {
            // World-space AABB – manual traversal to skip annotations/dimensions
            const v2 = new THREE.Vector3();
            this.object.traverse(child => {
                if (isAnnotOrDim(child)) return;
                if (child.geometry && child.geometry.attributes.position) {
                    const pos = child.geometry.attributes.position;
                    for (let i = 0; i < pos.count; i++) {
                        v2.fromBufferAttribute(pos, i).applyMatrix4(child.matrixWorld);
                        min.min(v2); max.max(v2);
                    }
                }
            });
        }

        if (min.x === Infinity) return;

        if (this.padding !== 0) {
            min.addScalar(-this.padding);
            max.addScalar(this.padding);
        }

        const arr = this.geometry.attributes.position.array;
        arr[ 0]=max.x; arr[ 1]=max.y; arr[ 2]=max.z;
        arr[ 3]=min.x; arr[ 4]=max.y; arr[ 5]=max.z;
        arr[ 6]=min.x; arr[ 7]=min.y; arr[ 8]=max.z;
        arr[ 9]=max.x; arr[10]=min.y; arr[11]=max.z;
        arr[12]=max.x; arr[13]=max.y; arr[14]=min.z;
        arr[15]=min.x; arr[16]=max.y; arr[17]=min.z;
        arr[18]=min.x; arr[19]=min.y; arr[20]=min.z;
        arr[21]=max.x; arr[22]=min.y; arr[23]=min.z;
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.computeBoundingSphere();

        // Local mode: orient helper with object; World mode: identity matrix
        if (viewProp.orientedSelectionBox === 'local') {
            this.matrix.copy(this.object.matrixWorld);
        } else {
            this.matrix.identity();
        }
    }

    setFromObject(object) {
        this.object = object;
        this.update();
        return this;
    }

    dispose() {
        this.geometry.dispose();
        this.material.dispose();
    }
}

// Inicializace--------------------------------------------------------------------------------------------------------
isTouchScreen = isTouchDevice();

init();
render();

// Initialize scene outliner
outlinerPanelEl = initOutliner({
    onSelect: (obj) => selectObject(obj),
    onGroupAdd: (obj) => toggleObjectInMultiSelect(obj),
    onGroupRemove: (obj) => { const idx = selectedObjects.indexOf(obj); if (idx !== -1) toggleObjectInMultiSelect(obj); },
    onHideOthers: (obj) => {
        // Hide all siblings; for root loadedModels hide all other roots
        const siblings = (obj.parent && obj.parent.isScene)
            ? loadedModels
            : (obj.parent ? obj.parent.children : []);
        siblings.forEach(s => {
            if (s !== obj && s.visible) { hideObject(s); updateVisibilityIcon(s); }
        });
        // Ensure the object itself is visible
        if (!obj.visible) {
            obj.visible = true;
            const hi = hiddenObjects.indexOf(obj);
            if (hi !== -1) hiddenObjects.splice(hi, 1);
            updateVisibilityIcon(obj);
        }
        render();
    },
    onShowAll: () => {
        showHiddenObjects();
    },
    onRemove: (obj) => removeModel(obj),
    onReparent: (draggedObj, targetObj, position) => {
        // Guard: prevent circular hierarchy (dropping onto own descendant)
        let cur = targetObj;
        while (cur) { if (cur === draggedObj) return; cur = cur.parent; }

        deselectObject();
        clearMultiSelect();

        const wasRoot = loadedModels.includes(draggedObj);
        const newParent = position === 'into' ? targetObj : targetObj.parent;
        if (!newParent) return;

        // Reparent while preserving world-space transform
        newParent.attach(draggedObj);

        // For before/after: splice to correct sibling position
        if (position === 'before' || position === 'after') {
            const children = newParent.children;
            const dragIdx = children.indexOf(draggedObj);
            children.splice(dragIdx, 1);
            const targetIdx = children.indexOf(targetObj);
            children.splice(position === 'before' ? targetIdx : targetIdx + 1, 0, draggedObj);
        }

        // Sync loadedModels (root = direct child of scene)
        const isNowRoot = draggedObj.parent === scene;
        if (wasRoot && !isNowRoot) {
            const idx = loadedModels.indexOf(draggedObj);
            if (idx !== -1) loadedModels.splice(idx, 1);
        } else if (!wasRoot && isNowRoot) {
            if (!loadedModels.includes(draggedObj)) loadedModels.push(draggedObj);
        }
        if (isNowRoot) {
            // Keep loadedModels order in sync with scene.children order
            loadedModels.sort((a, b) => scene.children.indexOf(a) - scene.children.indexOf(b));
        }

        rebuildTree(loadedModels, true);
        render();
    },
    onCloneObject: (obj) => {
        if (!obj.parent) return;
        const clone = obj.clone();
        clone.name = obj.name + ' (copy)';
        obj.parent.add(clone);
        // Place clone immediately after original
        const children = obj.parent.children;
        const cloneIdx = children.indexOf(clone);
        children.splice(cloneIdx, 1);
        const origIdx = children.indexOf(obj);
        children.splice(origIdx + 1, 0, clone);
        // Register all meshes of the clone for raycasting
        // Also clone materials so emissive highlight is independent from original.
        // Reset xray/emissive state that may have been baked in from a selected original.
        clone.traverse(child => {
            if (child.isMesh) {
                if (Array.isArray(child.material)) {
                    child.material = child.material.map(m => {
                        const mc = m.clone();
                        if (mc.emissive) mc.emissive.setHex(0x000000);
                        mc.depthTest = true;
                        mc.needsUpdate = true;
                        return mc;
                    });
                } else {
                    child.material = child.material.clone();
                    if (child.material.emissive) child.material.emissive.setHex(0x000000);
                    child.material.depthTest = true;
                    child.material.needsUpdate = true;
                }
                child.renderOrder = 0;
                meshObjects.push(child);
            }
        });
        // Rebuild annotations/dimensions on the clone from copied userData
        stripAnnotationVisuals(clone);
        stripAnnotation3dVisuals(clone);
        stripMeasurementVisuals(clone);
        stripCadDim3dVisuals(clone);
        reconstructAnnotations(clone, render);
        reconstructAnnotations3d(clone, render);
        reconstructMeasurements(clone, render);
        reconstructCadDim3d(clone);
        // Sync loadedModels if cloned at root level
        if (obj.parent === scene) {
            if (!loadedModels.includes(clone)) {
                const lmIdx = loadedModels.indexOf(obj);
                loadedModels.splice(lmIdx + 1, 0, clone);
            }
        }
        rebuildTree(loadedModels, true);
        render();
    },
    onSortChildren: (obj, recursive, descending) => {
        function sortNode(node) {
            node.children.sort((a, b) => descending
                ? b.name.localeCompare(a.name)
                : a.name.localeCompare(b.name));
            if (recursive) node.children.forEach(sortNode);
        }
        sortNode(obj);
        // If the sorted object is the scene root keep loadedModels in sync
        if (obj === scene) {
            loadedModels.sort((a, b) => scene.children.indexOf(a) - scene.children.indexOf(b));
        }
        rebuildTree(loadedModels, true);
        render();
    },
    onToggleVisibility: (obj) => {
        if (obj.visible) {
            hideObject(obj);
        } else {
            // Show a hidden object
            obj.visible = true;
            const hi = hiddenObjects.indexOf(obj);
            if (hi !== -1) hiddenObjects.splice(hi, 1);
            if (viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render);
            render();
        }
        updateVisibilityIcon(obj);
    }
});

//initLoad();

// Funkce----------------------------------------------------------------------------------------------------------------

function registerGuiPanel(name, guiInstance) {
    guiInstance.domElement.style.display = 'none';
    guiPanels[name].gui = guiInstance;
}

function showGuiPanel(name) {
    const panel = guiPanels[name];
    if (!panel || !panel.gui) return;

    // Selected panel is independent — toggles without affecting others
    if (name === 'Selected') {
        const isVisible = panel.gui.domElement.style.display !== 'none';
        panel.gui.domElement.style.display = isVisible ? 'none' : '';
        panel.btn.classList.toggle('active', !isVisible);
        return;
    }

    // Other panels: only one visible at a time (toggle among themselves)
    if (activePanel === name) {
        panel.gui.domElement.style.display = 'none';
        panel.btn.classList.remove('active');
        activePanel = null;
        return;
    }
    // hide all except Selected
    for (const key in guiPanels) {
        if (key === 'Selected') continue;
        if (guiPanels[key].gui) guiPanels[key].gui.domElement.style.display = 'none';
        guiPanels[key].btn.classList.remove('active');
    }
    panel.gui.domElement.style.display = '';
    panel.btn.classList.add('active');
    activePanel = name;
}

function init() {   
    //container
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    //renderer
    renderer = new THREE.WebGLRenderer( { antialias: true, stencil: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    //renderer.outputEncoding = THREE.sRGBEncoding;	Toto bylo pro starší threejs
    //renderer.shadowMap.enabled = true;
    renderer.localClippingEnabled = false;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2;
    
    // // nutno jen pro animaci
    // renderer.setAnimationLoop(() => {
    // 	// Vaše logika rotace a posunu
    // 	//model.rotation.y += 0.01;
    // 	renderer.render(scene, currentCamera);
    // });

    container.appendChild( renderer.domElement );

    // CSS2DRenderer for measurement labels
    css2DRenderer = new CSS2DRenderer();
    css2DRenderer.setSize(window.innerWidth, window.innerHeight);
    css2DRenderer.domElement.style.position = 'absolute';
    css2DRenderer.domElement.style.top = '0px';
    css2DRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(css2DRenderer.domElement);

    // CSS3DRenderer for 3D-oriented annotation labels
    css3DRenderer = new CSS3DRenderer();
    css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    css3DRenderer.domElement.style.position = 'absolute';
    css3DRenderer.domElement.style.top = '0px';
    css3DRenderer.domElement.style.pointerEvents = 'none';
    css3DRenderer.domElement.id = 'css3d-root';
    container.appendChild(css3DRenderer.domElement);
    
    //currentCamera
    const aspect = window.innerWidth / window.innerHeight;
    cameraPersp = new THREE.PerspectiveCamera( 20, aspect, 250, 20000 );
    cameraOrtho = new THREE.OrthographicCamera(
        -orthoHalfSize * aspect, orthoHalfSize * aspect,
         orthoHalfSize,         -orthoHalfSize,
        0.1, orthoHalfSize * 40
    );
    
    currentCamera = cameraOrtho;

    currentCamera.position.set( 1000, 1000, 1000 );
    currentCamera.lookAt( 0, 0, 0 );
    
    //scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(viewProp.backgroundColor);

    //lights
    const hemisLight = new THREE.HemisphereLight( 0x443333, 0x111122 );
    scene.add( hemisLight );
    sceneLights.push(hemisLight);
    sceneLights.push(addShadowedLight( 100, 100, 100, 0xffffff, 1 ));
    sceneLights.push(addShadowedLight( 50, 100, - 100, 0xffffff, 0.5 ));

    // headlight - světlo z pohledu kamery
    const headlight = new THREE.DirectionalLight(0xffffff, 1.5);
    headlight.name = 'headlight';
    //headlight.position.set(0, 100, 0); // 100 world units nad kamerou (v lokálním prostoru kamery)
    currentCamera.add(headlight); // Světlo bude svítit ze stejného místa jako oči uživatele
    sceneLights.push(headlight);
    scene.add(currentCamera); // BEZ TOHOTO ŘÁDKU SVĚTLO NEBUDE SVÍTIT
    
    //clipPlanes
    clipPlanes[0] = new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), 0 );
    clipPlanes[1] = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 );
    clipPlanes[2] = new THREE.Plane( new THREE.Vector3( 0, 0, -1 ), 0 );
    
    //newcontrols
    orbitControls = new OrbitControls( currentCamera, renderer.domElement );
    orbitControls.update();
    orbitControls.addEventListener( 'change', render ); // use if there is no animation loop

    // ViewHelper – orientation gizmo in the bottom-right corner
    viewHelper = new ViewHelper( currentCamera, renderer.domElement );
    viewHelper.center = orbitControls.target;
    viewHelper.setLabels( 'X', 'Y', 'Z' );

    transformControls = new TransformControls( currentCamera, renderer.domElement );
    transformControls.setSize( 0.5 );	
    transformControls.setSpace( 'world' ); // Default: world space (intuitivnější pro uživatele)
    applySnapSettings(); // Aplikujeme snap nastavení při inicializaci
    scene.add( transformControls.getHelper() );	//Nutno v novém three.js. Dříve bylo: scene.add( transformControls );
    transformControls.addEventListener( 'change', function() {
        // World-space manual snap: built-in setTranslationSnap works only in 'local' space.
        // In 'world' space we must snap the world-space coordinates and convert back to local.
        // isTransformDragging check: aby snap neběžel při attach() (výběru objektu), ale jen při skutečném táhnutí.
        if (isTransformDragging && transformControls.object && transformControls.getMode() === 'translate' && transformControls.space === 'world') {
            const snap = viewProp.snapTranslation;
            const obj = transformControls.object;
            // Force-update the full parent chain so matrixWorld is current
            obj.updateWorldMatrix(true, false);
            // Read snapped world position directly from matrixWorld (avoids a second updateWorldMatrix call)
            const worldPos = new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld);
            worldPos.x = Math.round(worldPos.x / snap) * snap;
            worldPos.y = Math.round(worldPos.y / snap) * snap;
            worldPos.z = Math.round(worldPos.z / snap) * snap;
            // Convert snapped world position back to parent local space
            if (obj.parent) {
                obj.parent.updateWorldMatrix(true, false);
                const invParent = new THREE.Matrix4().copy(obj.parent.matrixWorld).invert();
                worldPos.applyMatrix4(invParent);
            }
            obj.position.copy(worldPos);
        }
        if (isTransformDragging && viewProp.showCrossSection && viewProp.autoUpdateSectionLines) {
            updateCrossSectionLines();
        }
        if (isTransformDragging && viewProp.sectionCrossLines) {
            updateSectionCrossLines();
        }
        // Delta-sync: pohyb pivotu přeneseme na skutečný objekt (objekt zůstává u původního rodiče).
        // Funguje pro translate, rotate i scale – matice přesně zachovává world-space transformaci.
        if (isTransformDragging && singleSelectPivot && lastSelectedObject
                && singleSelectPivotInitMatrix && singleSelectObjectInitMatrix) {
            singleSelectPivot.updateWorldMatrix(true, false);
            const _deltaM = new THREE.Matrix4()
                .copy(singleSelectPivot.matrixWorld)
                .multiply(new THREE.Matrix4().copy(singleSelectPivotInitMatrix).invert());
            const _newObjWorld = new THREE.Matrix4()
                .copy(_deltaM)
                .multiply(singleSelectObjectInitMatrix);
            if (lastSelectedObject.parent) {
                lastSelectedObject.parent.updateWorldMatrix(true, false);
                _newObjWorld.premultiply(
                    new THREE.Matrix4().copy(lastSelectedObject.parent.matrixWorld).invert()
                );
            }
            _newObjWorld.decompose(
                lastSelectedObject.position,
                lastSelectedObject.quaternion,
                lastSelectedObject.scale
            );
        }
        render();
    } );
    transformControls.addEventListener( 'dragging-changed', function ( event ) {
        if (event.value) { // Dragování začalo
            // V edit modu zakázat posun objektu bez definovaného name
            if (assemblyState.editMode) {
                const dragObj = transformControls.object;
                const hasName = dragObj && dragObj.name && dragObj.name.trim() !== '';
                if (!hasName) {
                    transformControls.detach();
                    orbitControls.enabled = false;
                    console.warn('Assembly edit mode: cannot transform an unnamed object.');
                    alert('Object without name can not be transformed.');
                    window.addEventListener('mouseup', () => { orbitControls.enabled = true; }, { once: true });
                    return;
                }
            }
            isTransformDragging = true;
            orbitControls.enabled = false;
            // Uložíme počáteční world matice pro delta-sync single-select pivotu
            if (singleSelectPivot && lastSelectedObject && !viewProp.isGroupTransformActive) {
                singleSelectPivot.updateWorldMatrix(true, false);
                lastSelectedObject.updateWorldMatrix(true, false);
                singleSelectPivotInitMatrix = singleSelectPivot.matrixWorld.clone();
                singleSelectObjectInitMatrix = lastSelectedObject.matrixWorld.clone();
            }
            // Uložíme předchozí stav před změnou
            if (transformControls.object && !viewProp.isGroupTransformActive) {
                savePreviousTransformState();
            }
            // Pro group transform uložíme world pozice všech objektů skupiny
            if (viewProp.isGroupTransformActive) {
                savePreviousGroupTransformStates();
            }
        } else { // Dragování skončilo - setTimeout nutný, aby se onClick stihl vykonat s isTransformDragging = true
            setTimeout(() => {
                isTransformDragging = false;
                orbitControls.enabled = true;
                // Zaokrouhlení floating-point nepřesností blízkých nule
                if (transformControls.object) {
                    const obj = transformControls.object;
                    obj.position.x = roundNearZero(obj.position.x);
                    obj.position.y = roundNearZero(obj.position.y);
                    obj.position.z = roundNearZero(obj.position.z);
                    obj.rotation.x = roundNearZero(obj.rotation.x);
                    obj.rotation.y = roundNearZero(obj.rotation.y);
                    obj.rotation.z = roundNearZero(obj.rotation.z);
                }
                // Zaznamenat transformaci v assembly edit modu
                if (assemblyState.editMode && assemblyState.currentStepIndex >= 0) {
                    if (viewProp.isGroupTransformActive && previousGroupTransformStates.length > 0) {
                        recordGroupTransformations();
                    } else if (previousTransformState && transformControls.object) {
                        recordAssemblyTransformation();
                    }
                }
                // Přepočítáme BoxHelpery po dokončení skupinové transformace
                if (viewProp.isGroupTransformActive) {
                    multiSelectionHelpers.forEach((h, i) => {
                        if (selectedObjects[i]) h.setFromObject(selectedObjects[i]);
                    });
                    render();
                }
            }, 100);
        }
    } );	
    

    // --- Section plane gizmo ---
    {
        sectionGizmoHelper = new THREE.Object3D();
        sectionGizmoHelper.name = '__sectionGizmoHelper';
        scene.add(sectionGizmoHelper);

        sectionTransformControls = new TransformControls(currentCamera, renderer.domElement);
        sectionTransformControls.setSize(0.5);
        sectionTransformControls.setMode('translate');
        sectionTransformControls.setSpace('world');
        sectionTransformControls.setTranslationSnap(viewProp.sectionSnapTranslation);
        scene.add(sectionTransformControls.getHelper());

        sectionTransformControls.addEventListener('change', function () {
            if (!viewProp.sectionGizmo) return;
            const pos = sectionGizmoHelper.position;
            clipPlanes[0].constant = pos.x;
            clipPlanes[1].constant = pos.y;
            clipPlanes[2].constant = pos.z;
            viewProp.px = pos.x;
            viewProp.py = pos.y;
            viewProp.pz = pos.z;
            if (viewProp.sectionCrossLines) updateSectionCrossLines();
            if (viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render);
            render();
        });

        sectionTransformControls.addEventListener('dragging-changed', function (event) {
            orbitControls.enabled = !event.value;
        });
    }

    selectionHelper = new PaddedBoxHelper(new THREE.Mesh(), 0xffff00, 0);
    selectionHelper.visible = false;
    scene.add(selectionHelper);
    
    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'mousemove', onMouseMove, false );
    window.addEventListener( 'beforeunload', function ( event ) {
        event.preventDefault();
        event.returnValue = '';
    } );
    window.addEventListener( 'mousedown', onMouseDown, false );
    window.addEventListener( 'mouseup', onMouseUp, false );
    window.addEventListener( 'click', onClick, false );
    window.addEventListener( 'touchstart', onTouchStart, { passive: false } );
    window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
    window.addEventListener( 'touchend', onTouchEnd, { passive: false } );
    
    window.addEventListener( 'keydown', function ( event ) {
        const tag = event.target.tagName;
        if (tag === 'TEXTAREA' || tag === 'INPUT' || event.target.isContentEditable) return;
        switch ( event.key ) {
            case 'Escape':
                if (viewProp.measureMode) {
                    viewProp.measureMode = false;
                    setMeasureActive(false);
                    viewProp.isSelectAllowed = true;
                    render();
                }
                if (viewProp.angleMode) {
                    viewProp.angleMode = false;
                    setAngleActive(false);
                    viewProp.isSelectAllowed = true;
                    render();
                }
                if (viewProp.cadDimMode) {
                    viewProp.cadDimMode = false;
                    setCadDimActive(false);
                    orbitControls.enabled = true;
                    viewProp.isSelectAllowed = true;
                    _updateCadDimHintUI();
                    render();
                }
                if (viewProp.cadDim3dMode) {
                    viewProp.cadDim3dMode = false;
                    setCadDim3dActive(false);
                    orbitControls.enabled = true;
                    viewProp.isSelectAllowed = true;
                    _updateCadDim3dHintUI();
                    render();
                }
                if (viewProp.selectDimensionMode) {
                    viewProp.selectDimensionMode = false;
                    setSelectDimActive(false);
                    viewProp.isSelectAllowed = true;
                    render();
                }
                if (viewProp.annotationMode) {
                    viewProp.annotationMode = false;
                    setAnnotationActive(false);
                    viewProp.isSelectAllowed = true;
                    render();
                }
                if (viewProp.annotation3dMode) {
                    viewProp.annotation3dMode = false;
                    setAnnotation3dActive(false);
                    viewProp.isSelectAllowed = true;
                    render();
                }
                if (faceSnapMode) {
                    cancelFaceSnapMode();
                }
                if (ptpSnapMode) {
                    cancelPtpSnapMode();
                }
                _syncModeBtns();
                statusCircleDetectEl.style.display = 'none';
                cancelAddLeaderLine();
                cancelAddLeaderLine3d();
                render();
                if (viewProp.detectCircleCenter) {
                    viewProp.detectCircleCenter = false;
                    statusCircleDetectCb.checked = false;
                    render();
                }
                deselectObject();
                selectionHistory.length = 0;
                clearHistoryPreviewHelpers();
                if (selectedObjects.length > 0) {
                    addCurrentGroupToHistory();
                    clearMultiSelect();
                }
                break;
            case 'Delete':
                if (viewProp.selectDimensionMode && isSelectDimActive()) {
                    deleteSelectedDimension(render);
                } else if (lastSelectedObject) {
                    removeModel(lastSelectedObject);
                }
                break;
            case 'q':
            case 'Q':
                transformControls.setSpace( transformControls.space === 'local' ? 'world' : 'local' );
                viewProp.transformSpace = transformControls.space === 'world';
                break;



            case 'r':
            case 'R':
                transformControls.setMode( 'rotate' );
                viewProp.transformMode = 'rotate';
                break;

            case 's':
            case 'S':
                transformControls.setMode( 'scale' );
                viewProp.transformMode = 'scale';
                break;

            case 't':
            case 'T':
                transformControls.setMode( 'translate' );
                viewProp.transformMode = 'translate';
                break;

            case '/':
                if (lastSelectedObject) {
                    addCurrentToMultiSelect(); // přidat/odebrat z multi-výběru
                }
                break;

            case '*':
                if (viewProp.isGroupTransformActive) deactivateMultiSelect(); else activateMultiSelect();
                break;

            case '+':
            case '=':
                transformControls.setSize( transformControls.size + 0.1 );
                break;

            case '-':
            case '_':
                transformControls.setSize( Math.max( transformControls.size - 0.1, 0.1 ) );
                break;

            case 'x':
            case 'X':
                transformControls.showX = ! transformControls.showX;
                break;

            case 'y':
            case 'Y':
                transformControls.showY = ! transformControls.showY;
                break;

            case 'z':
            case 'Z':
                transformControls.showZ = ! transformControls.showZ;
                break;

            case ' ':
                transformControls.enabled = ! transformControls.enabled;
                break;

            case 'm':
                if (lastSelectedObject) {
                    lastSelectedObject.position.set(
                        Math.random() * 400 - 200,
                        Math.random() * 400 - 200,
                        Math.random() * 400 - 200
                    );
                }
                break;
            
            case 'ArrowUp': // move up in the outliner
                if (isOutlinerOpen()) {
                    const obj = navigateOutliner('up');
                    if (obj) {
                        if (event.ctrlKey) { toggleObjectInMultiSelect(obj); setNavigationPosition(obj); }
                        else { selectObject(obj); render(); }
                    }
                    event.preventDefault();
                }
                break;

            case 'ArrowDown': // move down in the outliner
                if (isOutlinerOpen()) {
                    const obj = navigateOutliner('down');
                    if (obj) {
                        if (event.ctrlKey) { toggleObjectInMultiSelect(obj); setNavigationPosition(obj); }
                        else { selectObject(obj); render(); }
                    }
                    event.preventDefault();
                }
                break;

            case 'ArrowLeft': // select parent in model hierarchy
                selectParent();
                break;

            case 'ArrowRight': // select previous in selection history
                selectPrevious();
                break;

            case 'PageUp':
                if (event.shiftKey) {
                    assemblyAnimateToStart();
                } else {
                    assemblyPrevStep();
                }
                event.preventDefault();
                break;

            case 'PageDown':
                if (event.shiftKey) {
                    assemblyAnimateToFinish();
                } else {
                    assemblyNextStep();
                }
                event.preventDefault();
                break;

            case 'Home':
                assemblyResetToStart();
                event.preventDefault();
                break;

            case 'End':
                assemblyResetToFinish();
                event.preventDefault();
                break;

            case 'p':
                console.log("selectionHistory.length: ", selectionHistory.length);
                selectionHistory.forEach( (obj, index) => {console.log(obj.name, index)}) ;
                break;

            case '7': // group history previous
                navigateGroupHistory(-1);
                break;

            case '8': // group history restore
                restoreGroupFromHistory();
                break;

            case '9': // group history next
                navigateGroupHistory(+1);
                break;
        }
    } );

    window.addEventListener( 'keyup', function ( event ) {
        const tag = event.target.tagName;
        if (tag === 'TEXTAREA' || tag === 'INPUT' || event.target.isContentEditable) return;
        switch ( event.key ) {
        }
    } );

    addMainGui();
    addAssemblyGui();
    addDocumentsGui();
    addAttachmentsGui();
    addHelpGui();
    applyToolbarPreferences(); // Apply initial toolbar CSS from viewProp defaults
    initMeasurement(scene);
    initSelectDimension(currentCamera, render, orbitControls);
    initAnnotations(scene, render);
    initAnnotations3d(scene, render);
    initCadDim3d(scene);

    // Register CSS2D<->CSS3D annotation converters
    setConvertTo3dFn((annotation, renderFn) => {
        const owner = annotation.ownerObject || scene;
        const def = getAnnotation3dDefaults();
        const rotMap = { camera: def.rotationCamera, XY: def.rotationXY, XZ: def.rotationXZ, YZ: def.rotationYZ };
        const rec = {
            type: 'note3d',
            text: annotation.text,
            anchors: annotation.leaderLines.map(ll => ({ x: ll.anchorLocal.x, y: ll.anchorLocal.y, z: ll.anchorLocal.z })),
            labelPos: { x: annotation.labelLocal.x, y: annotation.labelLocal.y, z: annotation.labelLocal.z },
            orientationMode: def.orientationMode,
            rotationAngle: rotMap[def.orientationMode] ?? 0,
            labelScale: def.labelScale,
            mirrored: false,
            textColor: def.textColor,
            bgColor: def.bgColor,
        };
        if (!owner.userData.annotations3d) owner.userData.annotations3d = [];
        owner.userData.annotations3d.push(rec);
        deleteAnnotationByRef(annotation, null);
        const newAnn3d = reconstructAnnotation3dFromRec(owner, rec, renderFn);
        registerLabelForSelection(newAnn3d);
        if (renderFn) renderFn();
    });
    setConvertTo2dFn((annotation, renderFn) => {
        const owner = annotation.ownerObject || scene;
        const rec = {
            type: 'note',
            text: annotation.text,
            anchors: annotation.leaderLines.map(ll => ({ x: ll.anchorLocal.x, y: ll.anchorLocal.y, z: ll.anchorLocal.z })),
            labelPos: { x: annotation.labelLocal.x, y: annotation.labelLocal.y, z: annotation.labelLocal.z },
        };
        if (!owner.userData.annotations) owner.userData.annotations = [];
        owner.userData.annotations.push(rec);
        deleteAnnotation3dByRef(annotation, null);
        const newAnn2d = reconstructAnnotationFromRec(owner, rec, renderFn);
        registerLabelForSelection(newAnn2d);
        if (renderFn) renderFn();
    });

    // CAD dim placement hint overlay (created here, referenced by module-level pointer)
    _cadDimHintDiv = document.createElement('div');
    _cadDimHintDiv.style.cssText = 'position:fixed;bottom:46px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.75);color:#fff;padding:5px 14px;border-radius:5px;font-size:12px;pointer-events:none;display:none;z-index:1000;white-space:nowrap;';
    document.body.appendChild(_cadDimHintDiv);

    _cadDim3dHintDiv = document.createElement('div');
    _cadDim3dHintDiv.style.cssText = 'position:fixed;bottom:68px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.75);color:#fff;padding:5px 14px;border-radius:5px;font-size:12px;pointer-events:none;display:none;z-index:1000;white-space:nowrap;';
    document.body.appendChild(_cadDim3dHintDiv);

    _faceSnapHintDiv = document.createElement('div');
    _faceSnapHintDiv.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(0,80,160,0.88);color:#fff;padding:5px 14px;border-radius:5px;font-size:12px;pointer-events:none;display:none;z-index:1000;white-space:nowrap;';
    document.body.appendChild(_faceSnapHintDiv);

    _ptpSnapHintDiv = document.createElement('div');
    _ptpSnapHintDiv.style.cssText = 'position:fixed;bottom:112px;left:50%;transform:translateX(-50%);background:rgba(0,120,60,0.88);color:#fff;padding:5px 14px;border-radius:5px;font-size:12px;pointer-events:none;display:none;z-index:1000;white-space:nowrap;';
    document.body.appendChild(_ptpSnapHintDiv);
} //End init 

// Přepočítá frustum ortografické kamery podle aktuálního obsahu meshObjects.
// Volat po každém načtení modelu.
function recalibrateOrthoCamera() {
    const box = new THREE.Box3();
    meshObjects.forEach(obj => box.expandByObject(obj));
    if (box.isEmpty()) return;

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    orthoHalfSize = maxDim * 1.5; // 50% rezerva kolem modelu

    const aspect = window.innerWidth / window.innerHeight;
    cameraOrtho.left   = -orthoHalfSize * aspect;
    cameraOrtho.right  =  orthoHalfSize * aspect;
    cameraOrtho.top    =  orthoHalfSize;
    cameraOrtho.bottom = -orthoHalfSize;
    // Kamera sedí ve fitView na ~maxDim*2.6 od středu scény.
    // near: musí být < (vzdálenost kamery - poloměr modelu) = maxDim*2.6 - maxDim*0.5 ≈ maxDim*2.
    //       Volíme konzervativních 1 world unit (případně maxDim*0.01), aby šel i zoom dovnitř.
    // far:  musí přesáhnout (vzdálenost kamery + průměr scény) = maxDim*2.6 + maxDim*1.5 ≈ maxDim*4.2.
    //       Volíme maxDim*10 jako rozumnou rezervu pro orbit/pan.
    cameraOrtho.near   =  Math.min(1, maxDim * 0.01);
    cameraOrtho.far    =  maxDim * 10;
    cameraOrtho.zoom   =  1;
    cameraOrtho.updateProjectionMatrix();

    console.log(`[recalibrateOrthoCamera] maxDim=${maxDim.toFixed(1)}, orthoHalfSize=${orthoHalfSize.toFixed(1)}, near=${cameraOrtho.near.toFixed(2)}, far=${cameraOrtho.far.toFixed(1)}`);
}

// Přepočítá near/far perspektivní kamery podle aktuálního obsahu meshObjects.
function recalibratePerspCamera() {
    const box = new THREE.Box3();
    meshObjects.forEach(obj => box.expandByObject(obj));
    if (box.isEmpty()) return;

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // near: dostatečně malý pro zoom dovnitř, ale ne nula (z-fighting)
    cameraPersp.near = Math.max(0.1, maxDim * 0.01);
    // far: vzdálenost kamery od středu je ~maxDim*4.3 (FOV 20°), plus průměr scény
    cameraPersp.far  = maxDim * 20;
    cameraPersp.updateProjectionMatrix();

    console.log(`[recalibratePerspCamera] maxDim=${maxDim.toFixed(1)}, near=${cameraPersp.near.toFixed(2)}, far=${cameraPersp.far.toFixed(1)}`);
}

function applyToolbarPreferences() {
    // GUI panels – lil-gui CSS custom properties applied to ALL .lil-gui elements
    // (nested folders re-declare variables, so we must set on every level)
    document.querySelectorAll('#gui-container .lil-gui').forEach(el => {
        el.style.setProperty('--font-size', toolbarDefaults.fontSize + 'px');
        el.style.setProperty('--input-font-size', toolbarDefaults.fontSize + 'px');
        el.style.setProperty('--widget-height', toolbarDefaults.rowHeight + 'px');
        el.style.setProperty('--title-height', toolbarDefaults.rowHeight + 'px');
        el.style.setProperty('--padding', Math.round(toolbarDefaults.rowHeight * 0.23) + 'px');
    });
    // Root panels: width
    document.querySelectorAll('#gui-container > .lil-gui').forEach(el => {
        el.style.setProperty('width', toolbarDefaults.panelWidth + 'px', 'important');
    });
    // Sub-folder titles font size
    document.querySelectorAll('#gui-container .lil-gui .lil-gui > .lil-title').forEach(el => {
        el.style.fontSize = toolbarDefaults.fontSize + 'px';
    });
    // Toolbar buttons
    document.querySelectorAll('.gui-toolbar-btn').forEach(el => {
        el.style.fontSize = toolbarDefaults.toolbarFontSize + 'px';
        el.style.height = toolbarDefaults.toolbarHeight + 'px';
        el.style.lineHeight = toolbarDefaults.toolbarHeight + 'px';
    });
    // Toolbar bar itself
    const tb = document.getElementById('gui-toolbar');
    if (tb) tb.style.height = toolbarDefaults.toolbarHeight + 'px';
    // Panel container offset below toolbar
    const gc = document.getElementById('gui-container');
    if (gc) gc.style.top = toolbarDefaults.toolbarHeight + 'px';
}

function applySnapSettings() {
    transformControls.setTranslationSnap( viewProp.snapTranslation );
    transformControls.setRotationSnap( THREE.MathUtils.degToRad( viewProp.snapRotationDeg ) );
    transformControls.setScaleSnap( viewProp.snapScale );
}

function toggleWireframeAll(value) {
    meshObjects.forEach(mesh => {
        if (mesh.isMesh) {
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach(mat => { mat.wireframe = value; });
        }
    });
    render();
}

//GUI----------------------------------------------------------------------------------------------------------------
function addMainGui() {
    //View
    const folderProp = new GUI({ container: guiContainer, title: 'View' });
    guiView = folderProp;
        folderProp.add({ fn: fitView }, 'fn').name('Fit View');
        folderProp.add({ fn: showHiddenObjects }, 'fn').name('Show hidden objects');
        folderProp.add({ fn: toggleHiddenObjects }, 'fn').name('Switch hidden objects');
        folderProp.add(viewProp, 'wireframe').name('Wireframe').onChange(function(value){ toggleWireframeAll(value); }).listen();
        folderProp.add(viewProp, 'xrayOnSelect').name('X-ray on select').onChange(function(value) {
            if (!value) {
                lastSelectedMeshes.forEach(child => { clearXray(child); });
                selectedObjects.forEach(obj => obj.traverse(child => { if (child.isMesh) clearXray(child); }));
                render();
            } else {
                lastSelectedMeshes.forEach(child => { applyXray(child); });
                selectedObjects.forEach(obj => obj.traverse(child => { if (child.isMesh) applyXray(child); }));
                render();
            }
        }).listen();
        folderProp.add(viewProp, 'orientedSelectionBox', ['local', 'world']).name('Selection box').onChange(function(){ render(); }).listen();
        folderProp.addColor(viewProp, 'backgroundColor').name('Background').onChange(function(value){ scene.background = new THREE.Color(value); render(); });
        folderProp.add(viewProp, 'perspCam').name('Persp. camera').onChange(function(value){setCamera(); render(); });
        folderProp.add(viewProp, 'showMeasurements').name('Show measurements').onChange(function(value) {
            setMeasurementsVisible(value);
            setCadDim3dVisible(value);
            render();
        });
        folderProp.add(viewProp, 'showAnnotations').name('Show annotations').onChange(function(value) {
            setAnnotationsVisible(value);
            setAnnotations3dVisible(value);
            render();
        });
        folderProp.add(viewProp, 'showBehindModel').name('Show behind model').onChange(function(value) {
            setMeasurementDepthTest(!value);
            setAnnotationDepthTest(!value);
            setAnnotation3dDepthTest(!value);
            setCadDim3dDepthTest(!value);
            render();
        });
        const sectionFolder = folderProp.addFolder("Section view");   
            sectionCtrl = sectionFolder.add(viewProp, 'section').name('Section').onChange(function(value){renderer.localClippingEnabled = value; viewProp.sectionGizmo = value; activateSectionGizmo(value); updateSectionCrossLines(); viewProp.solidSection = value; if (value) computeSolidSection(scene, meshObjects, viewProp, render); else clearSolidSection(scene, render); render(); sectionBtn.classList.toggle('active', value); solidSectionBtn.style.display = value ? 'block' : 'none'; showSectionMeshBtn.style.display = value ? 'block' : 'none'; solidSectionBtn.classList.toggle('active', viewProp.solidSection); showSectionMeshBtn.classList.toggle('active', viewProp.showSectionMesh); }).listen();
            sectionFolder.add(viewProp, 'sectionCrossLines').name('Cross Section Lines').onChange(function(value){updateSectionCrossLines(); render(); });
            sectionFolder.addColor(viewProp, 'crossSectionColor').name('Cross Lines Color').onChange(function(value){ if(viewProp.sectionCrossLines) { updateSectionCrossLines(); render(); } });
            sectionFolder.add(viewProp, 'crossSectionOnHidden').name('Apply to hidden').onChange(function(value){ if(viewProp.sectionCrossLines) updateSectionCrossLines(); if(viewProp.showCrossSection) updateCrossSectionLines(); render(); });
            sectionFolder.add(viewProp, 'solidSection').name('Solid Section').onChange(function(value) {
                if (value) {
                    renderer.localClippingEnabled = true;
                    viewProp.section = true;
                    computeSolidSection(scene, meshObjects, viewProp, render);
                } else {
                    clearSolidSection(scene, render);
                }
            }).listen();
            sectionFolder.addColor(viewProp, 'capColor').name('Cap Color').onChange(function() {
                if (viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render);
            });
            sectionFolder.add(viewProp, 'showSectionMesh').name('Show Section Mesh').onChange(function(value){toggleSectionMeshAll(); });
            sectionFolder.add(viewProp, 'sectionGizmo').name('Gizmo').onChange(function(value){ activateSectionGizmo(value); }).listen();
            sectionFolder.add(viewProp, 'sectionSnapTranslation', 0.1, 100, 0.1).name('Snap translation').onChange(function(value){ sectionTransformControls.setTranslationSnap(value); }).listen();
            sectionFolder.add(viewProp, 'px', extent.pn, extent.pp, extent.pStep).name('Pos. x').onChange(function(value){clipPlanes[0].constant=value; syncSectionGizmoPosition(); if(viewProp.sectionCrossLines) updateSectionCrossLines(); if(viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render); render(); }).listen();
            sectionFolder.add(viewProp, 'py', extent.pn, extent.pp, extent.pStep).name('Pos. y').onChange(function(value){clipPlanes[1].constant=value; syncSectionGizmoPosition(); if(viewProp.sectionCrossLines) updateSectionCrossLines(); if(viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render); render(); }).listen();
            sectionFolder.add(viewProp, 'pz', extent.pn, extent.pp, extent.pStep).name('Pos. z').onChange(function(value){clipPlanes[2].constant=value; syncSectionGizmoPosition(); if(viewProp.sectionCrossLines) updateSectionCrossLines(); if(viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render); render(); }).listen();
            sectionFolder.add({ fn: resetSection }, 'fn').name('Reset section');

            const crossSectionFolder = sectionFolder.addFolder("Cross Section Lines");
            crossSectionFolder.add(viewProp, 'showCrossSection').name('Show Lines').onChange(function(value){updateCrossSectionLines(); render(); });
            crossSectionFolder.add(viewProp, 'crossSectionOnHidden').name('Apply to hidden').onChange(function(value){ if(viewProp.showCrossSection) { updateCrossSectionLines(); render(); } }).listen();
            crossSectionFolder.add(viewProp, 'autoUpdateSectionLines').name('Update Section Lines');
            crossSectionFolder.add(viewProp, 'crossSectionPlane', ['XY', 'XZ', 'YZ']).name('Plane').onChange(function(value){if(viewProp.showCrossSection){updateCrossSectionLines(); render();}});
            crossSectionFolder.add(viewProp, 'crossSectionPos', extent.pn, extent.pp, extent.pStep).name('Position').onChange(function(value){if(viewProp.showCrossSection){updateCrossSectionLines(); render();}}).listen();
            crossSectionFolder.addColor(viewProp, 'crossSectionColor').name('Color').onChange(function(value){if(crossSectionLines){crossSectionLines.material.color.set(value); render();}});
            crossSectionFolder.close();
            
            sectionFolder.close();
        const helpersFolder = folderProp.addFolder("Helpers");
            helpersFolder.add(viewProp, 'showAxesHelper').name('axes').onChange(function() { updateAxesHelper(); }).listen();
            helpersFolder.add(viewProp, 'axesHelperSize', 1, 2000, 1).name('axes size').onChange(function() { updateAxesHelper(); }).listen();
            helpersFolder.add(viewProp, 'showCameraHelper').name('camera persp').onChange(function() { updateCameraHelper(); }).listen();
            helpersFolder.add(viewProp, 'showCameraOrthoHelper').name('camera ortho').onChange(function() { updateCameraHelper(); }).listen();
            helpersFolder.add(viewProp, 'showLightHelper').name('lights').onChange(function() { updateLightHelper(); }).listen();
            helpersFolder.add(viewProp, 'lightHelperSize', 1, 5000, 1).name('lights size').onChange(function() { updateLightHelper(); }).listen();
            helpersFolder.add(viewProp, 'showRaycastHelper').name('raycast').onChange(function() { if (!viewProp.showRaycastHelper && raycastArrowHelper) { scene.remove(raycastArrowHelper); raycastArrowHelper = null; render(); } }).listen();
            helpersFolder.add(viewProp, 'raycastHelperSize', 100, 100000, 100).name('raycast size').listen();
            helpersFolder.close();
        lightsFolder = folderProp.addFolder(`Lights (${sceneLights.length})`);
            rebuildLightsFolder();
            lightsFolder.close();
        const multiFolder = folderProp.addFolder("Group Selection");
            multiFolder.add(viewProp, 'multiSelectBoxPadding', 0, 200, 1).name('Box padding').listen();
            multiFolder.add({ fn: addCurrentToMultiSelect }, 'fn').name('Add/remove selected (/)');
            multiFolder.add({ fn: clearMultiSelect }, 'fn').name('Clear group');
            multiFolder.add({ fn: addCurrentGroupToHistory }, 'fn').name('Add to history');
            multiFolder.close();
        const historyFolder = folderProp.addFolder('Group History');
            historyFolder.add(viewProp, 'historyInfo').name('Entry').listen().disable();
            historyFolder.add({ fn() { navigateGroupHistory(-1); } }, 'fn').name('← Previous  [7]');
            historyFolder.add({ fn() { navigateGroupHistory(+1); } }, 'fn').name('→ Next  [9]');
            historyFolder.add({ fn: restoreGroupFromHistory }, 'fn').name('Restore  [8]');
            historyFolder.add({ fn: removeFromGroupHistory }, 'fn').name('Remove from history');
            historyFolder.close();
        const preferencesFolder = folderProp.addFolder('Preferences');
            const toolbarPrefFolder = preferencesFolder.addFolder('Toolbar Preferences');
                toolbarPrefFolder.add(toolbarDefaults, 'toolbarFontSize', 9, 18, 1).name('Toolbar font size').onChange(applyToolbarPreferences).listen();
                toolbarPrefFolder.add(toolbarDefaults, 'toolbarHeight', 20, 50, 1).name('Toolbar height').onChange(applyToolbarPreferences).listen();
                toolbarPrefFolder.add(toolbarDefaults, 'fontSize', 9, 18, 1).name('Font size').onChange(applyToolbarPreferences).listen();
                toolbarPrefFolder.add(toolbarDefaults, 'rowHeight', 14, 44, 1).name('Row height').onChange(applyToolbarPreferences).listen();
                toolbarPrefFolder.add(toolbarDefaults, 'panelWidth', 200, 500, 10).name('Panel width').onChange(applyToolbarPreferences).listen();
                toolbarPrefFolder.add({ fn() {
                    Object.assign(toolbarDefaults, toolbarInitDefaults);
                    applyToolbarPreferences();
                } }, 'fn').name('Set to default');
                toolbarPrefFolder.close();
            const _rotOpts = { '0°': 0, '90°': Math.PI / 2, '180°': Math.PI, '270°': 3 * Math.PI / 2 };
            const _orientOpts = { 'Face camera': 'camera', 'XY plane': 'XY', 'XZ plane': 'XZ', 'YZ plane': 'YZ' };
            const dimensionFolder = preferencesFolder.addFolder('Dimension');
                const flatDimDefaultsFolder = dimensionFolder.addFolder('Dimension (Flat) defaults');
                    const _flatDimDef = getFlatDimDefaults();
                    flatDimDefaultsFolder.add(_flatDimDef, 'fontSize', 8, 24, 1).name('Size').listen();
                    flatDimDefaultsFolder.addColor(_flatDimDef, 'textColor').name('Text color').listen();
                    flatDimDefaultsFolder.addColor(_flatDimDef, 'bgColor').name('Background').listen();
                    flatDimDefaultsFolder.add({ fn() { applyDefaultsToAllFlatDim(render); } }, 'fn').name('Apply to all existing');
                    flatDimDefaultsFolder.close();
                const cadDim3dDefaultsFolder = dimensionFolder.addFolder('Dimension (3D) defaults');
                    const _cadDim3dDef = getCadDim3dDefaults();
                    cadDim3dDefaultsFolder.add(_cadDim3dDef, 'labelScale', 0.01, 100, 0.01).name('Size').listen();
                    cadDim3dDefaultsFolder.add(_cadDim3dDef, 'rotationCamera', _rotOpts).name('Rotation (Face camera)').listen();
                    cadDim3dDefaultsFolder.add(_cadDim3dDef, 'rotationXY',     _rotOpts).name('Rotation (XY plane)').listen();
                    cadDim3dDefaultsFolder.add(_cadDim3dDef, 'rotationXZ',     _rotOpts).name('Rotation (XZ plane)').listen();
                    cadDim3dDefaultsFolder.add(_cadDim3dDef, 'rotationYZ',     _rotOpts).name('Rotation (YZ plane)').listen();
                    cadDim3dDefaultsFolder.add(_cadDim3dDef, 'orientationMode', _orientOpts).name('Orientation').listen();
                    cadDim3dDefaultsFolder.addColor(_cadDim3dDef, 'textColor').name('Text color').listen();
                    cadDim3dDefaultsFolder.addColor(_cadDim3dDef, 'bgColor').name('Background').listen();
                    cadDim3dDefaultsFolder.add({ fn() { applyDefaultsToAllCadDim3d(render); } }, 'fn').name('Apply to all existing');
                    cadDim3dDefaultsFolder.close();
                const dimMarkersFolder = dimensionFolder.addFolder('Dimension markers defaults');
                    const _dimMarkerOpts = getDimMarkerSettings();
                    // Sync cadDim3d to current settings (avoid mismatch between modules on first use)
                    setCadDimMarkerFixedSize(_dimMarkerOpts.fixedSize);
                    setCadDimMarkerFixedScreenPx(_dimMarkerOpts.fixedScreenPx);
                    setCadDimMarkerWorldSize(_dimMarkerOpts.worldSize);
                    setCadDimMarkerColor(_dimMarkerOpts.markerColor);
                    dimMarkersFolder.add(_dimMarkerOpts, 'fixedSize').name('Fixed size').onChange(v => {
                        setDimMarkerFixedSize(v);
                        setCadDimMarkerFixedSize(v);
                        render();
                    }).listen();
                    dimMarkersFolder.add(_dimMarkerOpts, 'fixedScreenPx', 1, 30, 0.5).name('Size – fixed (px)').onChange(v => {
                        setDimMarkerFixedScreenPx(v);
                        setCadDimMarkerFixedScreenPx(v);
                        render();
                    }).listen();
                    dimMarkersFolder.add(_dimMarkerOpts, 'worldSize', 0.01, 100, 0.01).name('Size – free (world)').onChange(v => {
                        setDimMarkerWorldSize(v);
                        setCadDimMarkerWorldSize(v);
                        render();
                    }).listen();
                    dimMarkersFolder.addColor(_dimMarkerOpts, 'markerColor').name('Color').onChange(v => {
                        setDimMarkerColor(v);
                        setCadDimMarkerColor(v);
                        render();
                    }).listen();
                    dimMarkersFolder.close();
                dimensionFolder.add({ fn() {
                    Object.assign(_flatDimDef, { textColor: '#ffffff', bgColor: '#1976d2', fontSize: 11 });
                    Object.assign(_cadDim3dDef, { labelScale: 5, rotationCamera: 0, rotationXY: 0, rotationXZ: 0, rotationYZ: 0, orientationMode: 'camera', textColor: '#ffffff', bgColor: '#1976d2' });
                    Object.assign(_dimMarkerOpts, { fixedSize: false, fixedScreenPx: 3, worldSize: 5, markerColor: '#22aacc' });
                    setDimMarkerFixedSize(_dimMarkerOpts.fixedSize);     setCadDimMarkerFixedSize(_dimMarkerOpts.fixedSize);
                    setDimMarkerFixedScreenPx(_dimMarkerOpts.fixedScreenPx); setCadDimMarkerFixedScreenPx(_dimMarkerOpts.fixedScreenPx);
                    setDimMarkerWorldSize(_dimMarkerOpts.worldSize);     setCadDimMarkerWorldSize(_dimMarkerOpts.worldSize);
                    setDimMarkerColor(_dimMarkerOpts.markerColor);       setCadDimMarkerColor(_dimMarkerOpts.markerColor);
                    render();
                } }, 'fn').name('Set to default');
                dimensionFolder.add({ fn() {
                    applyDefaultsToAllFlatDim(render);
                    applyDefaultsToAllCadDim3d(render);
                } }, 'fn').name('Apply to existing');
                dimensionFolder.close();
            const annotationFolder = preferencesFolder.addFolder('Annotation');
                const flatAnnDefaultsFolder = annotationFolder.addFolder('Annotation (Flat) defaults');
                    const _flatAnnDef = getFlatAnnDefaults();
                    flatAnnDefaultsFolder.add(_flatAnnDef, 'fontSize', 8, 24, 1).name('Size').listen();
                    flatAnnDefaultsFolder.addColor(_flatAnnDef, 'textColor').name('Text color').listen();
                    flatAnnDefaultsFolder.addColor(_flatAnnDef, 'bgColor').name('Background').listen();
                    flatAnnDefaultsFolder.add({ fn() { applyDefaultsToAllFlatAnnotations(render); } }, 'fn').name('Apply to all existing');
                    flatAnnDefaultsFolder.close();
                const ann3dDefaultsFolder = annotationFolder.addFolder('Annotation (3D) defaults');
                    const _ann3dDef = getAnnotation3dDefaults();
                    ann3dDefaultsFolder.add(_ann3dDef, 'labelScale', 0.01, 100, 0.01).name('Size').listen();
                    ann3dDefaultsFolder.add(_ann3dDef, 'rotationCamera', _rotOpts).name('Rotation (Face camera)').listen();
                    ann3dDefaultsFolder.add(_ann3dDef, 'rotationXY',     _rotOpts).name('Rotation (XY plane)').listen();
                    ann3dDefaultsFolder.add(_ann3dDef, 'rotationXZ',     _rotOpts).name('Rotation (XZ plane)').listen();
                    ann3dDefaultsFolder.add(_ann3dDef, 'rotationYZ',     _rotOpts).name('Rotation (YZ plane)').listen();
                    ann3dDefaultsFolder.add(_ann3dDef, 'orientationMode', _orientOpts).name('Orientation').listen();
                    ann3dDefaultsFolder.addColor(_ann3dDef, 'textColor').name('Text color').listen();
                    ann3dDefaultsFolder.addColor(_ann3dDef, 'bgColor').name('Background').listen();
                    ann3dDefaultsFolder.add({ fn() { applyDefaultsToAllAnnotations3d(render); } }, 'fn').name('Apply to all existing');
                    ann3dDefaultsFolder.close();
                const annMarkersFolder = annotationFolder.addFolder('Annotation markers defaults');
                    const _annMarkerOpts = getAnnMarkerSettings();
                    // Sync annotation3d to current settings (avoid mismatch between modules on first use)
                    setAnn3dMarkerFixedSize(_annMarkerOpts.fixedSize);
                    setAnn3dMarkerFixedScreenPx(_annMarkerOpts.fixedScreenPx);
                    setAnn3dMarkerWorldSize(_annMarkerOpts.worldSize);
                    setAnn3dMarkerColor(_annMarkerOpts.markerColor);
                    annMarkersFolder.add(_annMarkerOpts, 'fixedSize').name('Fixed size').onChange(v => {
                        setAnnMarkerFixedSize(v);
                        setAnn3dMarkerFixedSize(v);
                        render();
                    }).listen();
                    annMarkersFolder.add(_annMarkerOpts, 'fixedScreenPx', 1, 30, 0.5).name('Size \u2013 fixed (px)').onChange(v => {
                        setAnnMarkerFixedScreenPx(v);
                        setAnn3dMarkerFixedScreenPx(v);
                        render();
                    }).listen();
                    annMarkersFolder.add(_annMarkerOpts, 'worldSize', 0.01, 100, 0.01).name('Size \u2013 free (world)').onChange(v => {
                        setAnnMarkerWorldSize(v);
                        setAnn3dMarkerWorldSize(v);
                        render();
                    }).listen();
                    annMarkersFolder.addColor(_annMarkerOpts, 'markerColor').name('Color').onChange(v => {
                        setAnnMarkerColor(v);
                        setAnn3dMarkerColor(v);
                        render();
                    }).listen();
                    annMarkersFolder.close();
                annotationFolder.add({ fn() {
                    Object.assign(_flatAnnDef, { textColor: '#ffffff', bgColor: '#388e3c', fontSize: 11 });
                    Object.assign(_ann3dDef, { labelScale: 5, rotationCamera: 0, rotationXY: 0, rotationXZ: 0, rotationYZ: 0, orientationMode: 'camera', textColor: '#ffffff', bgColor: '#388e3c' });
                    Object.assign(_annMarkerOpts, { fixedSize: false, fixedScreenPx: 3, worldSize: 5, markerColor: '#44aa44' });
                    setAnnMarkerFixedSize(_annMarkerOpts.fixedSize);     setAnn3dMarkerFixedSize(_annMarkerOpts.fixedSize);
                    setAnnMarkerFixedScreenPx(_annMarkerOpts.fixedScreenPx); setAnn3dMarkerFixedScreenPx(_annMarkerOpts.fixedScreenPx);
                    setAnnMarkerWorldSize(_annMarkerOpts.worldSize);     setAnn3dMarkerWorldSize(_annMarkerOpts.worldSize);
                    setAnnMarkerColor(_annMarkerOpts.markerColor);       setAnn3dMarkerColor(_annMarkerOpts.markerColor);
                    render();
                } }, 'fn').name('Set to default');
                annotationFolder.add({ fn() {
                    applyDefaultsToAllFlatAnnotations(render);
                    applyDefaultsToAllAnnotations3d(render);
                } }, 'fn').name('Apply to existing');
                annotationFolder.close();
            const docNameFolder = preferencesFolder.addFolder('Document name');
                const _docLabelOpts = { showLastEditDate: true, showImportDate: false };
                docNameFolder.add(_docLabelOpts, 'showLastEditDate').name('Show last edit date').onChange(v => setDocLabelOptions({ showLastEditDate: v }));
                docNameFolder.add(_docLabelOpts, 'showImportDate').name('Show import date').onChange(v => setDocLabelOptions({ showImportDate: v }));
                docNameFolder.close();
            const dracoCompFolder = preferencesFolder.addFolder('Export Compression');
                const _dracoMethodOpts = { 'Edgebreaker': 'edgebreaker', 'Sequential': 'sequential' };
                dracoCompFolder.add(dracoDefaults, 'useCustomSettings').name('Use custom settings').listen();
                dracoCompFolder.add(dracoDefaults, 'method', _dracoMethodOpts).name('Method').listen();
                dracoCompFolder.add(dracoDefaults, 'encodeSpeed', 0, 10, 1).name('Encode speed (0=best)').listen();
                dracoCompFolder.add(dracoDefaults, 'decodeSpeed', 0, 10, 1).name('Decode speed (0=best)').listen();
                dracoCompFolder.add(dracoDefaults, 'quantizePosition', 1, 16, 1).name('Quantize position (bits)').listen();
                dracoCompFolder.add(dracoDefaults, 'quantizeNormal', 1, 16, 1).name('Quantize normal (bits)').listen();
                dracoCompFolder.add(dracoDefaults, 'quantizeColor', 1, 16, 1).name('Quantize color (bits)').listen();
                dracoCompFolder.add(dracoDefaults, 'quantizeTexcoord', 1, 16, 1).name('Quantize texcoord (bits)').listen();
                dracoCompFolder.add(dracoDefaults, 'quantizeGeneric', 1, 16, 1).name('Quantize generic (bits)').listen();
                dracoCompFolder.add({ fn() { Object.assign(dracoDefaults, dracoInitDefaults); } }, 'fn').name('Set to default');
                dracoCompFolder.close();
            preferencesFolder.close();

    // Sync toggle when fullscreen is exited externally (e.g. F11)
    document.addEventListener('fullscreenchange', function() {
        viewProp.fullscreen = !!document.fullscreenElement;
        if (!document.fullscreenElement && navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
        fsBtn.classList.toggle('active', viewProp.fullscreen);
    });

    registerGuiPanel('View', folderProp);

    // --- File panel (Export / Import) ---
    const fileGui = new GUI({ container: guiContainer, title: 'File' });
    fileGui.add({ fn: importGlbFile }, 'fn').name('Import GLB…');
    fileGui.add({ fn: exportAllModelsDraco }, 'fn').name('Export all to GLB (Compression)');
    fileGui.add({ fn: exportSelectedObjectDraco }, 'fn').name('Export selected to GLB (Compression)');
    const importOtherFolder = fileGui.addFolder('Import other formats');
    importOtherFolder.add({ fn: importGltfFile }, 'fn').name('Import GLTF (folder)…');
    importOtherFolder.add({ fn: importObjFile }, 'fn').name('Import OBJ (folder)…');
    importOtherFolder.add({ fn: import3mfFile }, 'fn').name('Import 3MF…');
    importOtherFolder.add({ fn: importFbxFile }, 'fn').name('Import FBX (folder)…');
    importOtherFolder.add({ fn: importStlFile }, 'fn').name('Import STL…');
    importOtherFolder.add({ fn: importStpFile }, 'fn').name('Import STP/STEP…');
    importOtherFolder.add({ fn: importIgesFile }, 'fn').name('Import IGS/IGES…');
    importOtherFolder.close();
    const demoFolder = fileGui.addFolder('Import demo');
    demoFolder.close();
    demoFolder.add({ fn() {
        loadGlbModel('./models/motor.glb', 'motor.glb', 0.001, true).then(() => {
            fitView();
        });
    } }, 'fn').name('Motor');
    demoFolder.add({ fn() {
        loadGlbModel('./models/forklift.glb', 'forklift.glb', 0.001, true).then(() => {
            fitView();
        });
    } }, 'fn').name('Forklift');
    demoFolder.add({ fn() {
        loadGlbModel('./models/cnc.glb', 'cnc.glb', 0.001, true).then(() => {
            fitView();
        });
    } }, 'fn').name('CNC');
    demoFolder.add({ fn() {
        loadGlbModel('./models/drilling_machine.glb', 'drilling_machine.glb', 0.001, true).then(() => {
            fitView();
        });
    } }, 'fn').name('drilling machine');
    demoFolder.add({ fn() {
        loadGlbModel('./models/DJI_drone.glb', 'DJI_drone.glb', 0.001, true).then(() => {
            fitView();
        });
    } }, 'fn').name('DJI_drone');
    const exportNoCompFolder = fileGui.addFolder('Export to GLB without compression');
    exportNoCompFolder.add({ fn: exportAllModels }, 'fn').name('Export all to GLB');
    exportNoCompFolder.add({ fn: exportSelectedObject }, 'fn').name('Export selected to GLB');
    exportNoCompFolder.close();
    const exportStlFolder = fileGui.addFolder('Export to STL');
    exportStlFolder.add({ fn: exportAllModelsStl }, 'fn').name('Export all to STL…');
    exportStlFolder.add({ fn: exportSelectedObjectStl }, 'fn').name('Export selected to STL…');
    exportStlFolder.close();
    const exportHtmlFolder = fileGui.addFolder('Export self-contained HTML');
    exportHtmlFolder.close();
    exportHtmlFolder.add({ fn() { exportToHTML(loadedModels, assemblyGui, viewProp, assemblyWriteToUserData, assemblyClearUserData); } }, 'fn').name('Export to HTML');
    exportHtmlFolder.add({ fn() { exportToHTMLDraco(loadedModels, assemblyGui, viewProp, assemblyWriteToUserData, assemblyClearUserData); } }, 'fn').name('Export to HTML (Compression)');
    exportHtmlFolder.add({ fn() { exportToHTMLObfuscated(loadedModels, assemblyGui, viewProp, assemblyWriteToUserData, assemblyClearUserData); } }, 'fn').name('Export to HTML obfuscated');
    exportHtmlFolder.add({ fn() { exportToHTMLObfuscatedDraco(loadedModels, assemblyGui, viewProp, assemblyWriteToUserData, assemblyClearUserData); } }, 'fn').name('Export to HTML obfuscated (Compression)');
    registerGuiPanel('File', fileGui);

    // --- Edit panel ---
    const editGui = new GUI({ container: guiContainer, title: 'Edit' });
    editGui.add({ fn: clearSceneKeepDocs }, 'fn').name('Clear scene. Keep docs + files');
    editGui.add({ fn: resetWholeModel }, 'fn').name('Reset whole model');
    editGui.add({ fn: cleanupModel }, 'fn').name('Cleanup (flatten unnamed nodes)');
    editGui.add({ fn() {
        const mesh = lastSelectedObject;
        if (!mesh || !mesh.geometry) { alert('No mesh selected.'); return; }
        const groups = mesh.geometry.groups;
        if (!groups || groups.length < 2) { alert('Selected mesh has no multiple groups – nothing to separate.'); return; }
        if (!confirm(`Separate "${mesh.name || 'mesh'}" into ${groups.length} parts?`)) return;
        separateMesh(mesh);
    } }, 'fn').name('Separate Mesh (split groups)');
    editGui.add({ fn() {
        const toRename = [];
        loadedModels.forEach(root => root.traverse(obj => {
            if (obj.name && /_\d+$/.test(obj.name)) toRename.push(obj);
        }));
        if (toRename.length === 0) { alert('Žádné objekty s číselnou příponou nenalezeny.'); return; }
        if (!confirm(`Odstranit číselnou příponu (_číslo) z ${toRename.length} objektů?`)) return;
        toRename.forEach(obj => {
            obj.name = obj.name.replace(/_\d+$/, '');
            updateObjectLabel(obj);
        });
    } }, 'fn').name('Remove numeric suffix (_1, _2…)');
    editGui.add({ fn() {
        if (!confirm('Clear all measurements/dimensions?')) return;
        clearMeasurements(render);
        clearCadDim3dMeasurements(render);
    } }, 'fn').name('Clear measurements');
    editGui.add({ fn() {
        if (!confirm('Clear all annotations?')) return;
        clearAnnotations(render);
        clearAnnotations3d(render);
    } }, 'fn').name('Clear annotations');
    editGui.add(viewProp, 'transformSpace').name('Transform: World space').onChange(function(value) {
        transformControls.setSpace( value ? 'world' : 'local' );
    }).listen();
    const materialFolder = editGui.addFolder('Material operations');
    materialFolder.add({ fn() {
        const { count, affected } = countLegacyMaterials(loadedModels, ['basic']);
        if (count === 0) {
            alert('Žádné materiály typu MeshBasicMaterial nenalezeny.');
            return;
        }
        if (confirm(`Nalezeno ${count} materiál(ů) typu MeshBasicMaterial.\nPřevést na MeshStandardMaterial?`)) {
            applyLegacyMaterialConversion(affected);
        }
    } }, 'fn').name('Check/Convert MeshBasicMaterial');
    materialFolder.add({ fn() {
        const { count, affected } = countLegacyMaterials(loadedModels, ['phong']);
        if (count === 0) {
            alert('Žádné materiály typu MeshPhongMaterial nenalezeny.');
            return;
        }
        if (confirm(`Nalezeno ${count} materiál(ů) typu MeshPhongMaterial.\nPřevést na MeshStandardMaterial?`)) {
            applyLegacyMaterialConversion(affected);
        }
    } }, 'fn').name('Check/Convert MeshPhongMaterial');
    materialFolder.add({ fn() {
        const { count, affected } = countLegacyMaterials(loadedModels, ['lambert']);
        if (count === 0) {
            alert('Žádné materiály typu MeshLambertMaterial nenalezeny.');
            return;
        }
        if (confirm(`Nalezeno ${count} materiál(ů) typu MeshLambertMaterial.\nPřevést na MeshStandardMaterial?`)) {
            applyLegacyMaterialConversion(affected);
        }
    } }, 'fn').name('Check/Convert MeshLambertMaterial');
    materialFolder.add({ fn() {
        if (loadedModels.length === 0) { alert('Žádné načtené modely.'); return; }
        const typeCounts = new Map();
        loadedModels.forEach(root => {
            root.traverse(child => {
                if (!child.isMesh) return;
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(mat => {
                    const type = mat.type || 'Unknown';
                    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
                });
            });
        });
        if (typeCounts.size === 0) { alert('Žádné materiály nenalezeny.'); return; }
        const lines = [...typeCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => `  ${type}: ${count}x`);
        alert(`Nalezené typy materiálů (${[...typeCounts.values()].reduce((a, b) => a + b, 0)} celkem):\n\n${lines.join('\n')}`);
    } }, 'fn').name('List All Material Types');
    materialFolder.add({ fn() {
        if (loadedModels.length === 0) { alert('Žádné načtené modely.'); return; }
        const textures = new Set();
        const textureSlots = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap',
            'aoMap', 'alphaMap', 'bumpMap', 'displacementMap', 'lightMap',
            'envMap', 'specularMap', 'gradientMap', 'clearcoatMap', 'clearcoatNormalMap',
            'clearcoatRoughnessMap', 'transmissionMap', 'thicknessMap', 'sheenColorMap',
            'sheenRoughnessMap', 'specularIntensityMap', 'specularColorMap', 'iridescenceMap',
            'iridescenceThicknessMap', 'anisotropyMap'];
        loadedModels.forEach(root => {
            root.traverse(child => {
                if (!child.isMesh) return;
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(mat => {
                    textureSlots.forEach(slot => {
                        if (mat[slot]) textures.add(mat[slot]);
                    });
                });
            });
        });
        if (textures.size === 0) { alert('Žádné textury nenalezeny.'); return; }
        if (!confirm(`Nalezeno ${textures.size} textur(a).\nOdstranit všechny textury ze všech materiálů?`)) return;
        loadedModels.forEach(root => {
            root.traverse(child => {
                if (!child.isMesh) return;
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(mat => {
                    textureSlots.forEach(slot => {
                        if (mat[slot]) {
                            mat[slot].dispose();
                            mat[slot] = null;
                        }
                    });
                    mat.needsUpdate = true;
                });
            });
        });
        textures.forEach(t => t.dispose());
        render();
        alert(`Odstraněno ${textures.size} textur(a).`);
    } }, 'fn').name('Check/Remove textures');
    materialFolder.close();
        const rotationFolder = editGui.addFolder("Whole Model Rotation");
            rotationFolder.add({ fn() { rotateAllModels('x', Math.PI / 2); } }, 'fn').name('Rotate X +90°');
            rotationFolder.add({ fn() { rotateAllModels('x', -Math.PI / 2); } }, 'fn').name('Rotate X -90°');
            rotationFolder.add({ fn() { rotateAllModels('y', Math.PI / 2); } }, 'fn').name('Rotate Y +90°');
            rotationFolder.add({ fn() { rotateAllModels('y', -Math.PI / 2); } }, 'fn').name('Rotate Y -90°');
            rotationFolder.add({ fn() { rotateAllModels('z', Math.PI / 2); } }, 'fn').name('Rotate Z +90°');
            rotationFolder.add({ fn() { rotateAllModels('z', -Math.PI / 2); } }, 'fn').name('Rotate Z -90°');
            rotationFolder.add({ fn: bakeWholeModelRotation }, 'fn').name('Bake rotation');
            rotationFolder.close();
        const snapFolder = editGui.addFolder("Snap");
            snapFolder.add(viewProp, 'transformMode', ['translate', 'rotate', 'scale']).name('Mode').onChange(function(value) { transformControls.setMode(value); }).listen();
            snapFolder.add(viewProp, 'snapTranslation', 1, 1000, 1).name('Translation').onChange(function() { applySnapSettings(); }).listen();
            snapFolder.add(viewProp, 'snapRotationDeg', 1, 90, 1).name('Rotation (°)').onChange(function() { applySnapSettings(); }).listen();
            snapFolder.add(viewProp, 'snapScale', 0.01, 2, 0.01).name('Scale').onChange(function() { applySnapSettings(); }).listen();
            snapFolder.close();
    registerGuiPanel('Edit', editGui);
}

/** Compute bounding box dimensions of obj respecting orientedSelectionBox setting and update part.bbSize */
function updateBBoxSize(obj) {
    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    const v = new THREE.Vector3();

    if (viewProp.orientedSelectionBox === 'local') {
        const invMatrix = new THREE.Matrix4().copy(obj.matrixWorld).invert();
        obj.traverse(child => {
            if (child.geometry && child.geometry.attributes.position) {
                const pos = child.geometry.attributes.position;
                const toLocal = new THREE.Matrix4().multiplyMatrices(invMatrix, child.matrixWorld);
                for (let i = 0; i < pos.count; i++) {
                    v.fromBufferAttribute(pos, i).applyMatrix4(toLocal);
                    min.min(v); max.max(v);
                }
            }
        });
    } else {
        const box = new THREE.Box3().setFromObject(obj);
        min.copy(box.min); max.copy(box.max);
    }

    if (min.x === Infinity) {
        part.bbSize = '–';
        return;
    }
    const size = new THREE.Vector3().subVectors(max, min);
    part.bbSize = size.x.toFixed(2) + ' × ' + size.y.toFixed(2) + ' × ' + size.z.toFixed(2);
}

function refreshSelectedObjGui(obj) {
    if (selectedFolder) {
        selectedFolder.destroy();
        selectedFolder = null;
    }
    _materialFolder = null;
    _materialFolderAll = null;

    // Write selected material color into GUI: Specif. color
    (function syncPartColor(o) {
        let mat = null;
        if (o.material) {
            mat = Array.isArray(o.material) ? o.material[0] : o.material;
        }
        if (!mat) {
            o.traverse((child) => {
                if (!mat && child.isMesh && child.material) {
                    mat = Array.isArray(child.material) ? child.material[0] : child.material;
                }
            });
        }
        if (mat && mat.color) {
            part.color = '#' + mat.color.getHexString();
        }
    })(obj);
                
    selectedFolder = new GUI({ container: guiContainer, title: 'Selected part: ' + (obj.name || 'Unnamed') });
    // Link to permanent toolbar button and auto-show
    guiPanels['Selected'].gui = selectedFolder;
    guiPanels['Selected'].btn.style.display = '';
    selectedFolder.domElement.style.display = '';
    guiPanels['Selected'].btn.classList.add('active');
    applyToolbarPreferences(); // Apply current toolbar CSS to the new Selected panel
    selectedFolder.add(obj, 'name').name('Name').onChange(() => updateObjectLabel(obj)).listen();
    selectedFolder.addColor(part, 'color').name('Specif. color').onChange(function(value){ changeColor(obj, value); });

    // Roughness / Metalness – read initial value from first material found, apply to all
    const _matProxy = { roughness: 0.5, metalness: 0 };
    let _matFirst = false;
    obj.traverse(child => {
        if (!_matFirst && child.isMesh && child.material) {
            const m = Array.isArray(child.material) ? child.material[0] : child.material;
            if (m.roughness !== undefined) _matProxy.roughness = m.roughness;
            if (m.metalness !== undefined) _matProxy.metalness = m.metalness;
            _matFirst = true;
        }
    });
    selectedFolder.add(_matProxy, 'roughness', 0, 1, 0.01).name('Roughness').onChange(function(value) {
        obj.traverse(child => {
            if (child.isMesh) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(m => { if (m.roughness !== undefined) { m.roughness = value; m.needsUpdate = true; } });
            }
        });
        render();
    });
    selectedFolder.add(_matProxy, 'metalness', 0, 1, 0.01).name('Metalness').onChange(function(value) {
        obj.traverse(child => {
            if (child.isMesh) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(m => { if (m.metalness !== undefined) { m.metalness = value; m.needsUpdate = true; } });
            }
        });
        render();
    });

    // Bounding box dimensions text
    updateBBoxSize(obj);
    selectedFolder.add(part, 'bbSize').name('Bounding box').disable().listen();

    // Toggle to show/hide bounding box wireframe
    part.showBBox = false;
    selectedFolder.add(part, 'showBBox').name('Show BBox').onChange(function(value) {
        if (value && lastSelectedObject) {
            if (!bbHelper) {
                bbHelper = new PaddedBoxHelper(lastSelectedObject, 0x00ff00, 0);
                scene.add(bbHelper);
            } else {
                bbHelper.setFromObject(lastSelectedObject);
            }
            bbHelper.visible = true;

            // Compute bbox size to determine axes helper length
            const bMin = new THREE.Vector3(Infinity, Infinity, Infinity);
            const bMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
            const bv = new THREE.Vector3();
            const isAnnotOrDim2 = (ch) => ch.userData._isMeasurement || ch.userData._isAnnotation || ch.userData._isAnnotation3d || ch.userData._isCadDim3d;
            if (viewProp.orientedSelectionBox === 'local') {
                const inv = new THREE.Matrix4().copy(lastSelectedObject.matrixWorld).invert();
                lastSelectedObject.traverse(ch => {
                    if (isAnnotOrDim2(ch)) return;
                    if (ch.geometry && ch.geometry.attributes.position) {
                        const pos = ch.geometry.attributes.position;
                        const toL = new THREE.Matrix4().multiplyMatrices(inv, ch.matrixWorld);
                        for (let i = 0; i < pos.count; i++) { bv.fromBufferAttribute(pos, i).applyMatrix4(toL); bMin.min(bv); bMax.max(bv); }
                    }
                });
            } else {
                const bv2 = new THREE.Vector3();
                lastSelectedObject.traverse(ch => {
                    if (isAnnotOrDim2(ch)) return;
                    if (ch.geometry && ch.geometry.attributes.position) {
                        const pos = ch.geometry.attributes.position;
                        for (let i = 0; i < pos.count; i++) { bv2.fromBufferAttribute(pos, i).applyMatrix4(ch.matrixWorld); bMin.min(bv2); bMax.max(bv2); }
                    }
                });
            }
            const bSize = new THREE.Vector3().subVectors(bMax, bMin);
            const axLen = Math.max(bSize.x, bSize.y, bSize.z) * 0.5;
            const axOffset = new THREE.Vector3(
                -bSize.x * 0.1,
                -bSize.y * 0.1,
                -bSize.z * 0.1
            );
            const axOrigin = new THREE.Vector3().copy(bMin).add(axOffset);

            // Remove old axes helper
            if (bbAxesHelper) { scene.remove(bbAxesHelper); bbAxesHelper.dispose(); bbAxesHelper = null; }
            bbAxesHelper = new THREE.AxesHelper(axLen);
            if (viewProp.orientedSelectionBox === 'local') {
                // Position offset outside bbox min in object's local space, then apply object's world matrix
                bbAxesHelper.matrixAutoUpdate = false;
                const m = new THREE.Matrix4().makeTranslation(axOrigin.x, axOrigin.y, axOrigin.z);
                bbAxesHelper.matrix.multiplyMatrices(lastSelectedObject.matrixWorld, m);
            } else {
                bbAxesHelper.position.copy(axOrigin);
            }
            scene.add(bbAxesHelper);
            bbAxesHelper.visible = true;
        } else {
            if (bbHelper) bbHelper.visible = false;
            if (bbAxesHelper) { bbAxesHelper.visible = false; }
        }
        render();
    });

    selectedFolder.add({ fn() { if (lastSelectedObject) changeColor(lastSelectedObject); } }, 'fn').name('Random color');
    selectedFolder.add({ fn() { removeModel(lastSelectedObject); } }, 'fn').name('Remove Object');
    selectedFolder.add({ fn() { if (lastSelectedObject) flattenHierarchy(lastSelectedObject); } }, 'fn').name('Flatten (remove node, keep children)');
    selectedFolder.add({ fn() { if (lastSelectedObject) hideObject(lastSelectedObject); } }, 'fn').name('Hide Object');
    selectedFolder.add({ fn() { if (lastSelectedObject) { lastSelectedMeshes.forEach(child => applyEmissive(child, 0x000000)); render(); toggleCadStyle(lastSelectedObject, false); } } }, 'fn').name('CAD Style (original colors)');
    selectedFolder.add({ fn() { if (lastSelectedObject) { lastSelectedMeshes.forEach(child => applyEmissive(child, 0x000000)); render(); toggleCadStyle(lastSelectedObject, true); } } }, 'fn').name('CAD Style (random colors)');
    selectedFolder.add({ fn() { openBomDialog(lastSelectedObject); } }, 'fn').name('BOM…');

    // Material inspector – only for Mesh objects
    if (obj.isMesh && obj.material) {
        const matBtn = { showMaterial: function() { lastSelectedMeshes.forEach(child => applyEmissive(child, 0x000000)); render(); buildMaterialFolder(obj, selectedFolder); } };
        selectedFolder.add(matBtn, 'showMaterial').name('Show Material Properties');
        const matBtnAll = { showAllMaterial: function() { lastSelectedMeshes.forEach(child => applyEmissive(child, 0x000000)); render(); buildMaterialFolderAll(obj, selectedFolder); } };
        selectedFolder.add(matBtnAll, 'showAllMaterial').name('Show ALL Material Properties');
    }

    const folder2 = selectedFolder.addFolder("Location");
        folder2.add({ fn() { if (lastSelectedObject) setDefPosRotScale(lastSelectedObject); } }, 'fn').name('Reset init. location');
        folder2.add({ fn() { if (lastSelectedObject && previousTransformState) undoLastTransform(lastSelectedObject); } }, 'fn').name('Undo last transform');

        // Capture "before" state when the object is selected (TransformControl is already attached).
        savePreviousTransformState();

        // Called by every Location slider after the user releases.
        function _onGuiLocationFinish() {
            if (assemblyState.editMode && assemblyState.currentStepIndex >= 0) {
                recordAssemblyTransformation();
            }
            // Refresh baseline so the next slider interaction has a correct "before".
            savePreviousTransformState();
        }

        folder2.add(obj.position, 'x', extent.pn, extent.pp, extent.pStep)
            .name('Px')
            .onChange(function(value){obj.position.x=value; render(); })
            .onFinishChange(_onGuiLocationFinish)
            .listen();
        folder2.add(obj.position, 'y', extent.pn, extent.pp, extent.pStep)
            .name('Py')
            .onChange(function(value){obj.position.y=value; render(); })
            .onFinishChange(_onGuiLocationFinish)
            .listen();
        folder2.add(obj.position, 'z', extent.pn, extent.pp, extent.pStep)
            .name('Pz')
            .onChange(function(value){obj.position.z=value; render(); })
            .onFinishChange(_onGuiLocationFinish)
            .listen();
        folder2.add(obj.rotation, 'x', extent.rn, extent.rp, extent.rStep)
            .name('Rx')
            .onChange(function(value){obj.rotation.x=value; render(); })
            .onFinishChange(_onGuiLocationFinish)
            .listen();
        folder2.add(obj.rotation, 'y', extent.rn, extent.rp, extent.rStep)
            .name('Ry')
            .onChange(function(value){obj.rotation.y=value; render(); })
            .onFinishChange(_onGuiLocationFinish)
            .listen();
        folder2.add(obj.rotation, 'z', extent.rn, extent.rp, extent.rStep)
            .name('Rz')
            .onChange(function(value){obj.rotation.z=value; render(); })
            .onFinishChange(_onGuiLocationFinish)
            .listen();
        folder2.add(obj.scale, 'x', extent.sn, extent.sp, extent.sStep)
            .name('Scale')
            .onChange(function(value){obj.scale.x=value; obj.scale.y=value; obj.scale.z=value; render(); })
            .onFinishChange(_onGuiLocationFinish)
            .listen();
        folder2.add({ fn: bakeSelectedObjectLocation }, 'fn').name('Bake location');
        folder2.close();
    
    // if (obj.children[0]) {   
    //     const folder3 = selectedFolder.addFolder("Section view");
    //     folder3.add(obj.children[0], 'visible').name('Fullfiled section').onChange(function(value){obj.children[0].visible = value; render(); });
    //     folder3.add(obj.children[0].material[0], 'polygonOffsetFactor', -4, 0, 0.1)
    //         .name('OffsetFactor')
    //         .onChange(function(value){setPolygonOffsetFactor(obj, value);render(); });
    // }

    // Navigation buttons: Arrow Up / Arrow Down
    const navFolder = selectedFolder.addFolder("Navigation");
        navFolder.add({ fn: selectParent }, 'fn').name('Select parent (Arrow Up)');
        navFolder.add({ fn: selectPrevious }, 'fn').name('Select previous (Arrow Down)');
        navFolder.open();

    selectedFolder.open();
}

// GUI panel for an active group selection (multi-select pivot).
// Shows the first object's name, operations applied to all selectedObjects,
// and Location sliders bound directly to the pivotObject.
function refreshGroupGui() {
    if (selectedFolder) {
        selectedFolder.destroy();
        selectedFolder = null;
    }

    const n = selectedObjects.length;
    selectedFolder = new GUI({ container: guiContainer, title: `Group (${n} objects)` });
    guiPanels['Selected'].gui = selectedFolder;
    guiPanels['Selected'].btn.style.display = '';
    selectedFolder.domElement.style.display = '';
    guiPanels['Selected'].btn.classList.add('active');
    applyToolbarPreferences();

    // Read-only list of object names
    const namesStr = selectedObjects.map(o => o.name || 'Unnamed').join(', ');
    selectedFolder.add({ names: namesStr }, 'names').name('Objects').disable();

    // Color picker – applies to ALL objects in the group
    const groupColor = { color: '#888888' };
    // Read actual color from first mesh material found
    let _colorFound = false;
    selectedObjects.forEach(o => {
        if (!_colorFound) o.traverse(child => {
            if (!_colorFound && child.isMesh && child.material) {
                const m = Array.isArray(child.material) ? child.material[0] : child.material;
                if (m && m.color) { groupColor.color = '#' + m.color.getHexString(); _colorFound = true; }
            }
        });
    });
    selectedFolder.addColor(groupColor, 'color').name('Specif. color (all)').onChange(function(value) {
        selectedObjects.forEach(obj => changeColor(obj, value));
    });

    // Roughness / Metalness – read initial value from first material found, apply to all objects
    const _grpMatProxy = { roughness: 0.5, metalness: 0 };
    let _grpMatFirst = false;
    selectedObjects.forEach(o => {
        if (!_grpMatFirst) o.traverse(child => {
            if (!_grpMatFirst && child.isMesh && child.material) {
                const m = Array.isArray(child.material) ? child.material[0] : child.material;
                if (m.roughness !== undefined) _grpMatProxy.roughness = m.roughness;
                if (m.metalness !== undefined) _grpMatProxy.metalness = m.metalness;
                _grpMatFirst = true;
            }
        });
    });
    selectedFolder.add(_grpMatProxy, 'roughness', 0, 1, 0.01).name('Roughness (all)').onChange(function(value) {
        selectedObjects.forEach(o => o.traverse(child => {
            if (child.isMesh) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(m => { if (m.roughness !== undefined) { m.roughness = value; m.needsUpdate = true; } });
            }
        }));
        render();
    });
    selectedFolder.add(_grpMatProxy, 'metalness', 0, 1, 0.01).name('Metalness (all)').onChange(function(value) {
        selectedObjects.forEach(o => o.traverse(child => {
            if (child.isMesh) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(m => { if (m.metalness !== undefined) { m.metalness = value; m.needsUpdate = true; } });
            }
        }));
        render();
    });

    // --- Operations (all objects) ---
    selectedFolder.add({ fn() { selectedObjects.forEach(obj => changeColor(obj)); } }, 'fn').name('Random color (all)');

    // Hide all – inline to avoid deselectObject() firing per-object
    selectedFolder.add({ fn() {
        selectedObjects.forEach(obj => {
            obj.visible = false;
            if (!hiddenObjects.includes(obj)) hiddenObjects.push(obj);
            updateVisibilityIcon(obj);
        });
        render();
    } }, 'fn').name('Hide all');

    selectedFolder.add({ fn() {
        selectedObjects.forEach(obj => {
            obj.traverse(child => { if (child.isMesh) applyEmissive(child, 0x000000); });
            toggleCadStyle(obj, false);
        });
        render();
    } }, 'fn').name('CAD Style (original colors)');

    selectedFolder.add({ fn() {
        selectedObjects.forEach(obj => {
            obj.traverse(child => { if (child.isMesh) applyEmissive(child, 0x000000); });
            toggleCadStyle(obj, true);
        });
        render();
    } }, 'fn').name('CAD Style (random colors)');

    // --- Location: sliders bound to pivotObject ---
    if (pivotObject) {
        const folder2 = selectedFolder.addFolder("Location (pivot)");

        folder2.add({ fn() {
            // Objects are currently children of pivotObject, so their local coords are
            // relative to the pivot, not to their original parents where initPosition was saved.
            // Deactivate → reset in original parent space → reactivate.
            const saved = [...selectedObjects];
            deactivateMultiSelect();
            saved.forEach(obj => setDefPosRotScale(obj));
            activateMultiSelect();
        } }, 'fn').name('Reset init. location (all)');
        folder2.add({ fn() { undoLastTransform(pivotObject); } }, 'fn').name('Undo last transform');

        // Save pivot's current state as the "before" baseline for undo.
        savePreviousTransformState();

        function _onGroupGuiLocationFinish() {
            if (assemblyState.editMode && assemblyState.currentStepIndex >= 0) {
                recordGroupTransformations();
            }
            savePreviousTransformState();
        }

        folder2.add(pivotObject.position, 'x', extent.pn, extent.pp, extent.pStep)
            .name('Px').onChange(() => render()).onFinishChange(_onGroupGuiLocationFinish).listen();
        folder2.add(pivotObject.position, 'y', extent.pn, extent.pp, extent.pStep)
            .name('Py').onChange(() => render()).onFinishChange(_onGroupGuiLocationFinish).listen();
        folder2.add(pivotObject.position, 'z', extent.pn, extent.pp, extent.pStep)
            .name('Pz').onChange(() => render()).onFinishChange(_onGroupGuiLocationFinish).listen();
        folder2.add(pivotObject.rotation, 'x', extent.rn, extent.rp, extent.rStep)
            .name('Rx').onChange(() => render()).onFinishChange(_onGroupGuiLocationFinish).listen();
        folder2.add(pivotObject.rotation, 'y', extent.rn, extent.rp, extent.rStep)
            .name('Ry').onChange(() => render()).onFinishChange(_onGroupGuiLocationFinish).listen();
        folder2.add(pivotObject.rotation, 'z', extent.rn, extent.rp, extent.rStep)
            .name('Rz').onChange(() => render()).onFinishChange(_onGroupGuiLocationFinish).listen();
        folder2.add(pivotObject.scale, 'x', extent.sn, extent.sp, extent.sStep)
            .name('Scale').onChange(function(value) { pivotObject.scale.set(value, value, value); render(); })
            .onFinishChange(_onGroupGuiLocationFinish).listen();
        folder2.close();
    }

    highlightGroupObjects(selectedObjects);
    selectedFolder.open();
}

// Builds a lil-gui folder with all editable material properties for a Mesh.
// If the folder already exists it is removed and recreated (toggle behaviour).
let _materialFolder = null;
function buildMaterialFolder(meshObj, parentFolder) {
    // Toggle – if already open, remove it
    if (_materialFolder) {
        _materialFolder.destroy();
        _materialFolder = null;
        return;
    }

    const materials = Array.isArray(meshObj.material) ? meshObj.material : [meshObj.material];

    materials.forEach((mat, idx) => {
        const label = materials.length > 1 ? `Material [${idx}]: ${mat.type}` : `Material: ${mat.type}`;
        const mf = parentFolder.addFolder(label);

        // --- Color properties (THREE.Color) ---
        const colorProps = ['color', 'emissive', 'specular', 'sheenColor', 'attenuationColor'];
        colorProps.forEach(prop => {
            if (mat[prop] && mat[prop].isColor) {
                const proxy = { [prop]: '#' + mat[prop].getHexString() };
                mf.addColor(proxy, prop).name(prop).onChange(v => { mat[prop].set(v); mat.needsUpdate = true; render(); });
            }
        });

        // --- Numeric properties (0–1 range) ---
        const zeroOneProps = ['opacity', 'roughness', 'metalness', 'clearcoat', 'clearcoatRoughness',
            'transmission', 'ior', 'sheen', 'sheenRoughness', 'reflectivity',
            'alphaTest', 'displacementScale', 'displacementBias', 'envMapIntensity',
            'lightMapIntensity', 'aoMapIntensity', 'bumpScale', 'normalScale',
            'emissiveIntensity', 'thickness', 'attenuationDistance', 'specularIntensity'];
        zeroOneProps.forEach(prop => {
            if (mat[prop] !== undefined && typeof mat[prop] === 'number') {
                const lo = (prop === 'ior') ? 1 : (prop === 'attenuationDistance' ? 0 : 0);
                const hi = (prop === 'ior') ? 2.333 : (prop === 'attenuationDistance' ? 1000 : (['envMapIntensity', 'lightMapIntensity', 'aoMapIntensity', 'emissiveIntensity', 'thickness'].includes(prop) ? 10 : 1));
                const step = (hi - lo) > 100 ? 1 : 0.01;
                mf.add(mat, prop, lo, hi, step).name(prop).onChange(() => { mat.needsUpdate = true; render(); }).listen();
            }
        });

        // --- Boolean properties ---
        const boolProps = ['transparent', 'wireframe', 'flatShading', 'visible', 'fog',
            'depthTest', 'depthWrite', 'colorWrite', 'stencilWrite',
            'polygonOffset', 'alphaToCoverage', 'premultipliedAlpha', 'dithering',
            'toneMapped', 'vertexColors'];
        boolProps.forEach(prop => {
            if (mat[prop] !== undefined && typeof mat[prop] === 'boolean') {
                mf.add(mat, prop).name(prop).onChange(() => { mat.needsUpdate = true; render(); }).listen();
            }
        });

        // --- Enum / select properties ---
        const sideOptions = { FrontSide: THREE.FrontSide, BackSide: THREE.BackSide, DoubleSide: THREE.DoubleSide };
        if (mat.side !== undefined) {
            mf.add(mat, 'side', sideOptions).name('side').onChange(() => { mat.needsUpdate = true; render(); }).listen();
        }

        const blendingOptions = { No: THREE.NoBlending, Normal: THREE.NormalBlending, Additive: THREE.AdditiveBlending, Subtractive: THREE.SubtractiveBlending, Multiply: THREE.MultiplyBlending, Custom: THREE.CustomBlending };
        if (mat.blending !== undefined) {
            mf.add(mat, 'blending', blendingOptions).name('blending').onChange(() => { mat.needsUpdate = true; render(); }).listen();
        }

        // polygonOffset numeric params
        if (mat.polygonOffset) {
            if (mat.polygonOffsetFactor !== undefined) mf.add(mat, 'polygonOffsetFactor', -10, 10, 0.1).name('polygonOffsetFactor').onChange(() => { mat.needsUpdate = true; render(); }).listen();
            if (mat.polygonOffsetUnits !== undefined) mf.add(mat, 'polygonOffsetUnits', -10, 10, 0.1).name('polygonOffsetUnits').onChange(() => { mat.needsUpdate = true; render(); }).listen();
        }

        // --- Texture maps (show info + individual remove button) ---
        const mapProps = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap',
            'emissiveMap', 'bumpMap', 'displacementMap', 'alphaMap', 'envMap',
            'lightMap', 'specularMap', 'clearcoatMap', 'clearcoatNormalMap',
            'clearcoatRoughnessMap', 'sheenColorMap', 'sheenRoughnessMap',
            'transmissionMap', 'thicknessMap', 'iridescenceMap', 'iridescenceThicknessMap',
            'anisotropyMap', 'specularIntensityMap', 'specularColorMap'];
        mapProps.forEach(prop => {
            if (mat[prop] && mat[prop].isTexture) {
                const texInfo = { [prop]: mat[prop].name || mat[prop].uuid || '(texture)' };
                mf.add(texInfo, prop).name(prop).disable();
                const viewBtn = { fn: function() {
                    const tex = mat[prop];
                    if (!tex || !tex.image) return;
                    const canvas = document.createElement('canvas');
                    canvas.width = tex.image.width;
                    canvas.height = tex.image.height;
                    canvas.getContext('2d').drawImage(tex.image, 0, 0);
                    const mimeType = (tex.userData && tex.userData.mimeType) || 'image/png';
                    const win = window.open('', '_blank');
                    if (win) win.document.write(`<html><body style="margin:0;background:#222"><img src="${canvas.toDataURL(mimeType)}" style="max-width:100%;display:block"></body></html>`);
                }};
                mf.add(viewBtn, 'fn').name('👁 view ' + prop);
                const dlBtn = { fn: function() {
                    const tex = mat[prop];
                    if (!tex || !tex.image) return;
                    const canvas = document.createElement('canvas');
                    canvas.width = tex.image.width;
                    canvas.height = tex.image.height;
                    canvas.getContext('2d').drawImage(tex.image, 0, 0);
                    const mimeType = (tex.userData && tex.userData.mimeType) || 'image/png';
                    const ext = mimeType.split('/')[1] || 'png';
                    const a = document.createElement('a');
                    a.href = canvas.toDataURL(mimeType);
                    a.download = (tex.name || prop) + '.' + ext;
                    a.click();
                }};
                mf.add(dlBtn, 'fn').name('⬇ download ' + prop);
                const removeBtn = { fn: function() {
                    mat[prop] = null;
                    mat.needsUpdate = true;
                    render();
                    // Rebuild folder to reflect change
                    buildMaterialFolder(meshObj, parentFolder);
                    buildMaterialFolder(meshObj, parentFolder);
                }};
                mf.add(removeBtn, 'fn').name('✕ remove ' + prop);
                const uploadBtn = { fn: function() {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = function(e) {
                        const file = e.target.files[0];
                        if (!file) return;
                        const url = URL.createObjectURL(file);
                        const loader = new THREE.TextureLoader();
                        loader.load(url, function(newTex) {
                            URL.revokeObjectURL(url);
                            newTex.name = file.name;
                            newTex.userData.mimeType = file.type;
                            const oldTex = mat[prop];
                            if (oldTex) {
                                newTex.colorSpace = oldTex.colorSpace;
                                newTex.wrapS = oldTex.wrapS;
                                newTex.wrapT = oldTex.wrapT;
                                newTex.flipY = oldTex.flipY;
                            }
                            mat[prop] = newTex;
                            mat.needsUpdate = true;
                            render();
                            buildMaterialFolder(meshObj, parentFolder);
                            buildMaterialFolder(meshObj, parentFolder);
                        });
                    };
                    input.click();
                }};
                mf.add(uploadBtn, 'fn').name('📂 upload ' + prop);
            }
        });

        // --- Remove ALL textures at once ---
        const hasAnyMap = mapProps.some(prop => mat[prop] && mat[prop].isTexture);
        if (hasAnyMap) {
            const removeAllBtn = { fn: function() {
                mapProps.forEach(prop => {
                    if (mat[prop] && mat[prop].isTexture) {
                        mat[prop] = null;
                    }
                });
                mat.needsUpdate = true;
                render();
                // Rebuild folder to reflect changes
                buildMaterialFolder(meshObj, parentFolder);
                buildMaterialFolder(meshObj, parentFolder);
            }};
            mf.add(removeAllBtn, 'fn').name('✕ Remove ALL textures');
        }

        mf.open();
        if (idx === 0) _materialFolder = mf; else _materialFolder = _materialFolder || mf;
    });

    // Store reference so we can toggle / destroy later
    if (materials.length > 1) {
        // When multiple materials exist, each has its own folder – wrap in a parent
        // _materialFolder already points to the first one; that's sufficient for toggle
    }
}

// Shows ALL material properties including null values – flat list like console.log.
let _materialFolderAll = null;
function buildMaterialFolderAll(meshObj, parentFolder) {
    if (_materialFolderAll) {
        _materialFolderAll.destroy();
        _materialFolderAll = null;
        return;
    }

    const materials = Array.isArray(meshObj.material) ? meshObj.material : [meshObj.material];

    const enumMaps = {
        side: { FrontSide: THREE.FrontSide, BackSide: THREE.BackSide, DoubleSide: THREE.DoubleSide },
        blending: { No: THREE.NoBlending, Normal: THREE.NormalBlending, Additive: THREE.AdditiveBlending, Subtractive: THREE.SubtractiveBlending, Multiply: THREE.MultiplyBlending, Custom: THREE.CustomBlending },
        depthFunc: { Never: THREE.NeverDepth, Always: THREE.AlwaysDepth, Less: THREE.LessDepth, LessEqual: THREE.LessEqualDepth, Equal: THREE.EqualDepth, GreaterEqual: THREE.GreaterEqualDepth, Greater: THREE.GreaterDepth, NotEqual: THREE.NotEqualDepth },
        stencilFunc: { Never: THREE.NeverStencilFunc, Always: THREE.AlwaysStencilFunc, Less: THREE.LessStencilFunc, LessEqual: THREE.LessEqualStencilFunc, Equal: THREE.EqualStencilFunc, GreaterEqual: THREE.GreaterEqualStencilFunc, Greater: THREE.GreaterStencilFunc, NotEqual: THREE.NotEqualStencilFunc },
        stencilFail: { Zero: THREE.ZeroStencilOp, Keep: THREE.KeepStencilOp, Replace: THREE.ReplaceStencilOp, Incr: THREE.IncrementStencilOp, Decr: THREE.DecrementStencilOp, IncrWrap: THREE.IncrementWrapStencilOp, DecrWrap: THREE.DecrementWrapStencilOp, Invert: THREE.InvertStencilOp },
        stencilZFail: { Zero: THREE.ZeroStencilOp, Keep: THREE.KeepStencilOp, Replace: THREE.ReplaceStencilOp, Incr: THREE.IncrementStencilOp, Decr: THREE.DecrementStencilOp, IncrWrap: THREE.IncrementWrapStencilOp, DecrWrap: THREE.DecrementWrapStencilOp, Invert: THREE.InvertStencilOp },
        stencilZPass: { Zero: THREE.ZeroStencilOp, Keep: THREE.KeepStencilOp, Replace: THREE.ReplaceStencilOp, Incr: THREE.IncrementStencilOp, Decr: THREE.DecrementStencilOp, IncrWrap: THREE.IncrementWrapStencilOp, DecrWrap: THREE.DecrementWrapStencilOp, Invert: THREE.InvertStencilOp },
        combine: { Multiply: THREE.MultiplyOperation, Mix: THREE.MixOperation, Add: THREE.AddOperation },
    };

    materials.forEach((mat, idx) => {
        const label = materials.length > 1 ? `ALL [${idx}]: ${mat.type}` : `ALL: ${mat.type}`;
        const mf = parentFolder.addFolder(label);

        // Collect all own + prototype properties (getters)
        const allKeys = new Set();
        for (const key of Object.keys(mat)) allKeys.add(key);
        let proto = Object.getPrototypeOf(mat);
        while (proto && proto !== Object.prototype) {
            for (const key of Object.getOwnPropertyNames(proto)) {
                const desc = Object.getOwnPropertyDescriptor(proto, key);
                if (desc && desc.get) allKeys.add(key);
            }
            proto = Object.getPrototypeOf(proto);
        }

        const sorted = [...allKeys].sort();

        for (const key of sorted) {
            if (key.startsWith('_')) continue;

            let val;
            try { val = mat[key]; } catch (e) { continue; }
            if (typeof val === 'function') continue;

            // Enum dropdown
            if (enumMaps[key] !== undefined) {
                try { mf.add(mat, key, enumMaps[key]).name(key).onChange(() => { mat.needsUpdate = true; render(); }).listen(); } catch(e) {}
                continue;
            }

            // THREE.Color
            if (val && val.isColor) {
                const proxy = { [key]: '#' + val.getHexString() };
                try { mf.addColor(proxy, key).name(key).onChange(v => { mat[key].set(v); mat.needsUpdate = true; render(); }); } catch(e) {}
                continue;
            }

            // THREE.Vector2
            if (val && val.isVector2) {
                const vf = mf.addFolder(key);
                try { vf.add(val, 'x').name('x').onChange(() => { mat.needsUpdate = true; render(); }).listen(); } catch(e) {}
                try { vf.add(val, 'y').name('y').onChange(() => { mat.needsUpdate = true; render(); }).listen(); } catch(e) {}
                vf.close();
                continue;
            }

            // THREE.Vector3
            if (val && val.isVector3) {
                const vf = mf.addFolder(key);
                try { vf.add(val, 'x').name('x').onChange(() => { mat.needsUpdate = true; render(); }).listen(); } catch(e) {}
                try { vf.add(val, 'y').name('y').onChange(() => { mat.needsUpdate = true; render(); }).listen(); } catch(e) {}
                try { vf.add(val, 'z').name('z').onChange(() => { mat.needsUpdate = true; render(); }).listen(); } catch(e) {}
                vf.close();
                continue;
            }

            // THREE.Texture
            if (val && val.isTexture) {
                const texInfo = { [key]: val.name || val.uuid || '(texture)' };
                try { mf.add(texInfo, key).name(key).disable(); } catch(e) {}
                continue;
            }

            // Boolean
            if (typeof val === 'boolean') {
                try { mf.add(mat, key).name(key).onChange(() => { mat.needsUpdate = true; render(); }).listen(); } catch(e) {}
                continue;
            }

            // Number
            if (typeof val === 'number') {
                try { mf.add(mat, key).name(key).onChange(() => { mat.needsUpdate = true; render(); }).listen(); } catch(e) {}
                continue;
            }

            // String
            if (typeof val === 'string') {
                try { mf.add(mat, key).name(key).onChange(() => { mat.needsUpdate = true; render(); }).listen(); } catch(e) {}
                continue;
            }

            // null / undefined
            if (val === null || val === undefined) {
                const proxy = { [key]: 'null' };
                try { mf.add(proxy, key).name(key).disable(); } catch(e) {}
                continue;
            }

            // Object/Array
            if (typeof val === 'object') {
                let str;
                try { str = JSON.stringify(val); } catch(e) { str = String(val); }
                if (str && str.length > 200) str = str.substring(0, 200) + '…';
                const proxy = { [key]: str };
                try { mf.add(proxy, key).name(key).disable(); } catch(e) {}
                continue;
            }
        }

        mf.open();
        if (idx === 0) _materialFolderAll = mf;
    });
}

function initLoad() {		    
    // Načtení modelu z URL parametru---------------------------------------------------------
    // 1. Získání celého řetězce dotazu (query string) z aktuální URL
    // Např. získá '?model=https%3A%2F%2Ffirebase.zip&name=muj_dil.zip'
    const urlParams = new URLSearchParams(window.location.search);

    // 2. Získání hodnoty parametru s názvem 'model' (URL k modelu) a 'name' (původní název souboru)
    // Např. pro 'model' získá 'https%3A%2F%2Ffirebase.zip' a pro 'name' získá 'muj_dil.zip'
    const fileUrl = urlParams.get('model'); 
    const fileName = urlParams.get('name'); 
    const fileExtension = fileName ? fileName.split('.').pop().toLowerCase() : null;

    // 3. Načtení modelu
    if (fileUrl && fileName) {
        console.log(`fileUrl: ${fileUrl}`);
        console.log(`fileName: ${fileName}`);

        document.getElementById('fileNameLabel').textContent = fileName;
        document.getElementById('pageTitle').textContent = fileName;
        if (!fileNameInput.value) fileNameInput.value = fileName.replace(/\.[^.]+$/, '');

        switch ( fileExtension ) {
            case 'zip':      
                loadStlModel(fileUrl, fileName, 0.001, true).then( (result) => {
                    fitView();
                    console.log(`Model ${fileName} loaded successfully.`);
                }).catch((error) => {
                    console.error(`Chyba při načítání modelu ${fileName}:`, error);
                });
                break;

            case 'glb': 
                loadGlbModel(fileUrl, fileName, 0.001, true).then( (result) => {
                    fitView();
                    console.log(`Model ${fileName} loaded successfully.`);   
                }).catch((error) => {
                    console.error(`Chyba při načítání modelu ${fileName}:`, error);
                });
                break;
        
            default:
                console.error(`Chyba: Nepodporovaný formát souboru ${fileExtension}.`);
        }

    } else {
        //console.error("Chyba: Nebyl nalezen žádný model k načtení.");
        //loadStlModel('./models/1011364_c.zip','1011364_c.zip', 0.001, true).then( (result)=>{} );	
        
        //loadGlbModel('/models/1012053_l.glb','1012053_l.glb', 0.001, true).then( (result)=>{meshObjects.push( result )} );
        loadGlbModel('./models/1012053_l.glb','1012053_l.glb', 0.001, true).then( (result)=>{
            fitView();
        });
    }
}


function setPolygonOffsetFactor(obj, value) {
    if (!obj || !obj.material) return;
    for (let i = 0; i < obj.material.length; i++) {
        // Kontrola, zda existuje potomek (sectionMesh), kterému se offset nastavuje
        if (obj.children[0] && obj.children[0].material[i]) {
            obj.children[0].material[i].polygonOffsetFactor = value;
        }
    }
}

// Seznam všech texture map vlastností, které se mají odstranit pro CAD styl
const _textureMapProps = [
    'map', 'normalMap', 'bumpMap', 'roughnessMap', 'metalnessMap',
    'aoMap', 'emissiveMap', 'alphaMap', 'lightMap', 'envMap',
    'displacementMap', 'specularMap', 'clearcoatMap', 'clearcoatNormalMap',
    'clearcoatRoughnessMap', 'sheenColorMap', 'sheenRoughnessMap',
    'transmissionMap', 'thicknessMap'
];

function applyCadStyle(obj, randomColors = false) {
    if (!obj) return;

    const isWhite = (color) => {
        return color.r > 0.9 && color.g > 0.9 && color.b > 0.9;
    };

    const applyToMaterial = (mat) => {
        if (!mat) return;

        // Uložení původních hodnot pro možnost revertu
        if (!mat.userData) mat.userData = {};
        if (!mat.userData._cadStyleBackup) {
            const backup = {};
            _textureMapProps.forEach(prop => {
                if (mat[prop] !== undefined) backup[prop] = mat[prop];
            });
            backup.roughness = mat.roughness;
            backup.metalness = mat.metalness;
            if (mat.color) backup.color = mat.color.clone();
            mat.userData._cadStyleBackup = backup;
        }

        // Odstranit všechny texture mapy
        _textureMapProps.forEach(prop => {
            if (mat[prop]) mat[prop] = null;
        });

        // Nastavit PBR vlastnosti
        if (mat.roughness !== undefined) mat.roughness = 0.4;
        if (mat.metalness !== undefined) mat.metalness = 0.6;

        // Barva: náhodná pro každý mesh, nebo původní (bílou nahradit náhodnou)
        if (mat.color) {
            if (randomColors) {
                mat.color.setHSL(Math.random(), 1.0, 0.5);
            } else if (isWhite(mat.color)) {
                mat.color.setHSL(Math.random(), 1.0, 0.5);
            }
        }

        mat.needsUpdate = true;
    };

    obj.traverse((child) => {
        if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(applyToMaterial);
            } else {
                applyToMaterial(child.material);
            }
        }
    });

    render();
}

function revertCadStyle(obj) {
    if (!obj) return;

    const revertMaterial = (mat) => {
        if (!mat || !mat.userData || !mat.userData._cadStyleBackup) return;
        const backup = mat.userData._cadStyleBackup;

        _textureMapProps.forEach(prop => {
            if (prop in backup) mat[prop] = backup[prop];
        });

        if (backup.roughness !== undefined) mat.roughness = backup.roughness;
        if (backup.metalness !== undefined) mat.metalness = backup.metalness;
        if (backup.color) mat.color.copy(backup.color);

        delete mat.userData._cadStyleBackup;
        mat.needsUpdate = true;
    };

    obj.traverse((child) => {
        if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(revertMaterial);
            } else {
                revertMaterial(child.material);
            }
        }
    });

    render();
}

function hasCadStyle(obj) {
    let found = false;
    if (!obj) return false;
    obj.traverse((child) => {
        if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(mat => {
                if (mat.userData && mat.userData._cadStyleBackup) found = true;
            });
        }
    });
    return found;
}

function toggleCadStyle(obj, randomColors = false) {
    if (!obj) return;
    if (hasCadStyle(obj)) {
        revertCadStyle(obj);
    } else {
        applyCadStyle(obj, randomColors);
    }
}

function changeColor(obj, color) {
    if (!obj) return;

    const newColor = color ? new THREE.Color(color) : new THREE.Color(Math.random() * 0xffffff);
    //newColor = new THREE.Color();
    //newColor.setHSL(Math.random(), 0.6, 0.5); // Náhodný odstín, daná sytost i jas

    const applyToMaterial = (mat) => {
        if (!mat) return;
        if (mat.color) mat.color.copy(newColor);
        if (mat.emissive) mat.emissive.setHex(0x000000);
        mat.needsUpdate = true;
    };

    // If the object itself has material(s)
    if (obj.material) {
        if (Array.isArray(obj.material)) {
            obj.material.forEach(applyToMaterial);
        } else {
            applyToMaterial(obj.material);
        }
    }

    // Also apply to any child meshes (covers GLB scene/group cases and section meshes)
    obj.traverse((child) => {
        if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(applyToMaterial);
            } else {
                applyToMaterial(child.material);
            }
        }
    });

    render();
}

function setDefPosRotScale(obj) {
    if (!obj) return;
    obj.position.set(obj.userData.initPosition.x, obj.userData.initPosition.y, obj.userData.initPosition.z);
    obj.rotation.set(obj.userData.initRotation.x, obj.userData.initRotation.y, obj.userData.initRotation.z);
    obj.scale.set(obj.userData.initScale.x, obj.userData.initScale.y, obj.userData.initScale.z);
    render();
}

function resetWholeModel() {
    if (!confirm('Reset whole model to initial positions?')) return;
    scene.traverse(function(child) {
        if (child.userData.initPosition && child.userData.initRotation && child.userData.initScale) {
            child.position.copy(child.userData.initPosition);
            child.rotation.copy(child.userData.initRotation);
            child.scale.copy(child.userData.initScale);
        }
    });
    
    // Aktualizace průřezových čar
    if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) {
        updateCrossSectionLines();
    }
    
    render();
}

function bakeSelectedObjectLocation() {
    const obj = lastSelectedObject;
    if (!obj) return;

    // Helper: apply a Matrix4 in-place to a plain {x,y,z} record
    function _xyzApply(xyz, mat) {
        if (!xyz) return;
        const v = new THREE.Vector3(xyz.x, xyz.y, xyz.z).applyMatrix4(mat);
        xyz.x = v.x; xyz.y = v.y; xyz.z = v.z;
    }

    // 1. Update all world matrices BEFORE any change
    obj.updateMatrixWorld(true);

    // 2. Store old world matrices for EVERY node (including non-mesh owners of measurements)
    const oldWorldMatrices = new Map();
    obj.traverse(function(node) {
        node.updateWorldMatrix(true, false);
        oldWorldMatrices.set(node, node.matrixWorld.clone());
    });

    // 3. Zero the object's local position, rotation and scale, then recompute world matrices
    obj.position.set(0, 0, 0);
    obj.rotation.set(0, 0, 0);
    obj.scale.set(1, 1, 1);
    obj.updateMatrix();
    obj.updateMatrixWorld(true);

    // 4. For each real mesh (skip measurement/annotation markers): bake full transform into geometry.
    //    geomTransform = newMeshWorld⁻¹ * oldMeshWorld keeps world positions unchanged.
    obj.traverse(function(node) {
        if (!node.isMesh || !node.geometry) return;
        if (node.userData._isMeasurement || node.userData._isAnnotation || node.userData._isCadDim3d) return;
        const oldMeshWorld = oldWorldMatrices.get(node);
        if (!oldMeshWorld) return;
        node.updateWorldMatrix(true, false);
        const newMeshWorld = node.matrixWorld.clone();

        const geomTransform = new THREE.Matrix4().multiplyMatrices(
            newMeshWorld.clone().invert(),
            oldMeshWorld
        );

        node.geometry = node.geometry.clone();
        node.geometry.applyMatrix4(geomTransform);
        node.geometry.computeBoundingSphere();
        node.geometry.computeBoundingBox();
    });

    // 5. Transform stored userData positions so measurements/annotations stay at the same world positions.
    //    nodeTransform = newNodeWorld⁻¹ * oldNodeWorld (same formula as geomTransform, per owner node).
    obj.traverse(function(node) {
        const oldNW = oldWorldMatrices.get(node);
        if (!oldNW) return;
        node.updateWorldMatrix(true, false);
        const nodeT = new THREE.Matrix4().multiplyMatrices(node.matrixWorld.clone().invert(), oldNW);

        if (Array.isArray(node.userData.measurements)) {
            for (const rec of node.userData.measurements) {
                _xyzApply(rec.p1, nodeT); _xyzApply(rec.p2, nodeT); _xyzApply(rec.labelPos, nodeT);
                if (Array.isArray(rec.points)) rec.points.forEach(p => _xyzApply(p, nodeT));
            }
        }
        if (Array.isArray(node.userData.measurements3d)) {
            for (const rec of node.userData.measurements3d) {
                _xyzApply(rec.p1, nodeT); _xyzApply(rec.p2, nodeT);
                _xyzApply(rec.foot1, nodeT); _xyzApply(rec.foot2, nodeT);
                _xyzApply(rec.labelPos, nodeT);
            }
        }
        if (Array.isArray(node.userData.annotations)) {
            for (const rec of node.userData.annotations) {
                _xyzApply(rec.labelPos, nodeT);
                if (rec.anchor) _xyzApply(rec.anchor, nodeT);
                if (Array.isArray(rec.anchors)) rec.anchors.forEach(a => _xyzApply(a, nodeT));
            }
        }
        if (Array.isArray(node.userData.annotations3d)) {
            for (const rec of node.userData.annotations3d) {
                _xyzApply(rec.labelPos, nodeT);
                if (Array.isArray(rec.anchors)) rec.anchors.forEach(a => _xyzApply(a, nodeT));
            }
        }
    });

    // 6. Remove old measurement/annotation visuals from the scene graph and internal records,
    //    then reconstruct them from the freshly-updated userData.
    stripMeasurementVisuals(obj);    removeMeasurementsForOwner(obj);
    stripAnnotationVisuals(obj);     removeAnnotationsForOwner(obj);
    stripAnnotation3dVisuals(obj);   removeAnnotations3dForOwner(obj);
    stripCadDim3dVisuals(obj);       removeCadDim3dMeasurementsForOwner(obj);

    reconstructMeasurements(obj, render);
    reconstructAnnotations(obj, render);
    reconstructAnnotations3d(obj, render);
    reconstructCadDim3d(obj);

    render();
}

function bakeWholeModelRotation() {
    loadedModels.forEach(function(model) {
        if (!model) return;

        // 1. Aktualizujeme world matice PŘED jakoukoliv změnou
        model.updateMatrixWorld(true);

        // 2. Sestavíme novou "modelWorld bez rotace" (stejná pozice a scale, nulová rotace)
        const posQ = new THREE.Quaternion();
        const posV = new THREE.Vector3();
        const posS = new THREE.Vector3();
        model.matrixWorld.decompose(posV, posQ, posS);

        const modelWorldNoRot = new THREE.Matrix4().compose(posV, new THREE.Quaternion(), posS);
        const modelWorldInv = model.matrixWorld.clone().invert();

        // 3. Pro každý mesh: zapečeme rotaci přímo do geometrie
        //    Vertex nesmí vizuálně změnit svoji world-space polohu.
        //    newMeshWorld * new_vertex = oldMeshWorld * old_vertex
        //    → geomTransform = newMeshWorld⁻¹ * oldMeshWorld
        model.traverse(function(node) {
            if (!node.isMesh || !node.geometry) return;

            node.updateWorldMatrix(true, false);
            const oldMeshWorld = node.matrixWorld.clone();

            // Lokální řetěz od modelu k tomuto meshi (nezávislý na rotaci modelu)
            const localChain = new THREE.Matrix4().multiplyMatrices(modelWorldInv, oldMeshWorld);

            // World matice meshe po vynulování rotace modelu
            const newMeshWorld = new THREE.Matrix4().multiplyMatrices(modelWorldNoRot, localChain);

            // Transformace geometrie: přemapuje old local vertex → new local vertex
            const geomTransform = new THREE.Matrix4().multiplyMatrices(
                newMeshWorld.clone().invert(),
                oldMeshWorld
            );

            node.geometry = node.geometry.clone(); // nesdílet geometrii s ostatními meshy
            node.geometry.applyMatrix4(geomTransform);
            node.geometry.computeBoundingSphere();
            node.geometry.computeBoundingBox();
        });

        // 4. Teprve nyní vynulujeme rotaci modelu
        //    Lokální transformy všech objektů v hierarchii zůstávají beze změny.
        model.rotation.set(0, 0, 0);
        model.updateMatrixWorld(true);
    });
    render();
}

function rotateAllModels(axis, angle) {
    loadedModels.forEach(function(model) {
        if (model && model.rotation) {
            switch(axis) {
                case 'x':
                    model.rotation.x += angle;
                    break;
                case 'y':
                    model.rotation.y += angle;
                    break;
                case 'z':
                    model.rotation.z += angle;
                    break;
            }
        }
    });
    
    // Aktualizace průřezových čar
    if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) {
        updateCrossSectionLines();
    }
    
    render();
}

function roundNearZero(value, epsilon = 1e-10) {
    return Math.abs(value) < epsilon ? 0 : value;
}

function savePreviousTransformState() {
    // Pokud je aktivní single-select pivot, ukládáme stav skutečného objektu (ne pivotu).
    // Pivot je jen gizmo helper – GUI sliders a undo musí pracovat s originálem.
    const obj = (singleSelectPivot && lastSelectedObject) ? lastSelectedObject : transformControls.object;
    if (!obj) return;
    previousTransformState = {
        object: obj,
        position: obj.position.clone(),
        rotation: obj.rotation.clone(),
        scale: obj.scale.clone()
    };
}

// Analogous to savePreviousTransformState(), but for all objects in the active group.
// Saves the full world-space matrix (needed because objects are reparented into the pivot).
function savePreviousGroupTransformStates() {
    previousGroupTransformStates = selectedObjects.map((obj) => {
        obj.updateWorldMatrix(true, false);
        return { object: obj, worldMatrix: obj.matrixWorld.clone() };
    });
}

function undoLastTransform(obj) {
    if (!obj || !previousTransformState || previousTransformState.object !== obj) {
        console.log("Nothing to undo.");
        return;
    }
    
    obj.position.copy(previousTransformState.position);
    obj.rotation.copy(previousTransformState.rotation);
    obj.scale.copy(previousTransformState.scale);
    
    console.log("Transformation undone.");
    previousTransformState = null; // Vymažeme uložený stav
    render();
}

function createSectionMesh(mesh) {
    // Kontrola, zda již mesh nemá sectionMesh
    if (mesh.children.some(child => child.isSectionMesh)) {
        return; // SectionMesh již existuje
    }
    
    // Klonujeme BEZ children (false) - jinak by se kopíroval i již existující sectionMesh
    const sectionMesh = mesh.clone(false);	

    // Zpracování materiálu - může být pole nebo jednotlivý objekt
    const materials = Array.isArray(sectionMesh.material) 
        ? sectionMesh.material 
        : [sectionMesh.material];
    
    const newMaterials = materials.map(mat => {
        const parentMaterialColor = mat.color;
        return new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            clippingPlanes: clipPlanes,
            clipIntersection: true,								
            color: parentMaterialColor,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            wireframe: false
        });
    });
    
    // Nastavíme zpět podle původního formátu
    sectionMesh.material = Array.isArray(sectionMesh.material) 
        ? newMaterials 
        : newMaterials[0];

    sectionMesh.position.set( 0, 0, 0);
    sectionMesh.rotation.set( 0, 0, 0);							
    sectionMesh.scale.set( 1, 1, 1 );
    
    // Označení, že jde o sectionMesh
    sectionMesh.isSectionMesh = true;
            
    mesh.add(sectionMesh);			
}

function toggleSectionMeshAll() {
    if (viewProp.showSectionMesh) {
        // Vytvoření sectionMesh pro všechny meshe
        meshObjects.forEach(mesh => {
            if (mesh.isMesh) {
                createSectionMesh(mesh);
            }
        });
    } else {
        // Odstranění všech sectionMesh
        meshObjects.forEach(mesh => {
            if (mesh.isMesh) {
                // Projdeme children a najdeme ty, které jsou sectionMesh
                mesh.children.forEach(child => {
                    if (child.isSectionMesh) {
                        mesh.remove(child);
                        // Uvolníme paměť
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => mat.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                    }
                });
            }
        });
    }
    render();
}	

// Navigation functions used by keyboard and GUI
function selectParent() {
    if (lastSelectedObject) {
        const parentObject = lastSelectedObject.parent;
        if (parentObject && parentObject !== scene) {
            selectObject(parentObject); //Tj. lastSelectedObject = parentObject; + další
            render();
        }
    }
}

function selectFirstChild() {
    if (lastSelectedObject && lastSelectedObject.children.length > 0) {
        selectObject(lastSelectedObject.children[0]);
        render();
    }
}

function selectPrevious() {
    // Potřebujeme alespoň 2 objekty v historii (aktuální + předchozí)
    if (selectionHistory.length < 2) {
        return;
    }
    
    // Získáme předposlední objekt (ten před aktuálně vybraným)
    const previousObject = selectionHistory[selectionHistory.length - 2];
    
    if (previousObject) {
        selectionHistory.length -= 2;// Odstraníme poslední 2 prvky najednou (aktuální + předchozí)
        selectObject(previousObject);// selectObject automaticky přidá previousObject na konec historie
        render();
    }
}


// --- Section gizmo activation/deactivation ---
function activateSectionGizmo(enabled) {
    if (enabled) {
        // Sync gizmo position from current clip plane constants
        sectionGizmoHelper.position.set(viewProp.px, viewProp.py, viewProp.pz);
        sectionTransformControls.attach(sectionGizmoHelper);
        render();
    } else {
        deactivateSectionGizmo();
    }
}

function deactivateSectionGizmo() {
    sectionTransformControls.detach();
    render();
}

function syncSectionGizmoPosition() {
    if (!viewProp.sectionGizmo) return;
    sectionGizmoHelper.position.set(viewProp.px, viewProp.py, viewProp.pz);
}


function resetSection() {					
    viewProp.px = 0;
    viewProp.py = 0;
    viewProp.pz = 0;
    viewProp.crossSectionPos = 0;
    updateSection();
    syncSectionGizmoPosition();
    if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) {
        updateCrossSectionLines();
    }
    if (viewProp.sectionCrossLines) {
        updateSectionCrossLines();
    }
}

// Wrapper funkce pro aktualizaci průřezových čar
function updateCrossSectionLines() {
    crossSectionLines = updateCrossSectionLinesCore(scene, crossSectionLines, viewProp, meshObjects);
}

// Wrapper funkce pro aktualizaci průřezových čar vázaných na section view
function updateSectionCrossLines() {
    sectionCrossSectionLines = updateSectionCrossLinesCore(scene, sectionCrossSectionLines, viewProp, meshObjects, clipPlanes);
}
    
function viewFromPoint(x, y, z) {
    // Vypočítáme střed všech objektů ve scéně
    let box = new THREE.Box3();
    meshObjects.forEach(obj => {
        box.expandByObject(obj);
    });
    
    const center = box.isEmpty() ? new THREE.Vector3(0, 0, 0) : box.getCenter(new THREE.Vector3());
    
    // Nastavíme cíl orbitu na střed modelu
    orbitControls.target.copy(center);
    
    // Nastavíme pozici kamery - offset od centra
    const offset = new THREE.Vector3(x, y, z);
    currentCamera.position.copy(center).add(offset);	
    currentCamera.lookAt(center.x, center.y, center.z);					
    orbitControls.update();
}

function fitView() {
    // Přepočítáme frustum aktivní kamery (near/far) podle aktuální velikosti modelu
        recalibrateOrthoCamera();
        recalibratePerspCamera();

    // Výpočet ohraničujícího boxu všech viditelných objektů ve scéně
    let box = new THREE.Box3();

    meshObjects.forEach(obj => {
        // Přeskočíme objekty, které jsou skryté nebo mají skrytého předka
        let visible = true;
        let cur = obj;
        while (cur) { if (!cur.visible) { visible = false; break; } cur = cur.parent; }
        if (visible) box.expandByObject(obj);
    });

    // Pokud je box prázdný, použijeme výchozí pozici
    if (!box.isEmpty()) {
        // Získáme střed a velikost boxu
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Nastavíme cíl orbitu na střed modelu
        orbitControls.target.copy(center);
        
        // Výpočet vzdálenosti kamery od objektu
        const maxDim = Math.max(size.x, size.y, size.z);
        
        let cameraDistance;
        if (currentCamera.isPerspectiveCamera) {
            // Pro perspektivní kameru
            const fov = currentCamera.fov * (Math.PI / 180); // Převod na radiány
            cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
        } else {
            // Pro ortografickou kameru - nastavíme zoom
            cameraDistance = maxDim * 1.5;
            // zoom je bezrozměrný faktor frustumu: zoom=1 → viditelná výška = 2×orthoHalfSize world units.
            // Pixel-based výpočet (pixels/frameSize) je špatně – používáme poloměr ohraničující koule,
            // aby model vždy vyplnil pohled i z isometrického směru.
            const sphereRadius = Math.sqrt(size.x * size.x + size.y * size.y + size.z * size.z) / 2;
            const aspect = window.innerWidth / window.innerHeight;
            currentCamera.zoom = Math.min(
                orthoHalfSize * aspect / (sphereRadius * 1.05),
                orthoHalfSize           / (sphereRadius * 1.05)
            );
            currentCamera.updateProjectionMatrix();
        }
        
        // Nastavíme kameru do isometrické polohy (45 stupňů)
        const angle = Math.PI / 4; // 45 stupňů
        currentCamera.position.set(
            center.x + cameraDistance * Math.cos(angle),
            center.y + cameraDistance * Math.sin(angle),
            center.z + cameraDistance * Math.cos(angle)
        );
        
        // Aktualizujeme kameru
        currentCamera.lookAt(center);
        orbitControls.update();
        
        // Debug funkce pro výpis parametrů zobrazení
        const debugViewParams = (params = {}) => {
            console.log('=== FitView Debug ===');
            
            // Parametry frustum kamery
            console.log('--- Camera Frustum ---');
            if (currentCamera.isPerspectiveCamera) {
                console.log('Camera type: Perspective');
                console.log('FOV:', currentCamera.fov);
                console.log('Aspect:', currentCamera.aspect.toFixed(4));
                console.log('Near:', currentCamera.near);
                console.log('Far:', currentCamera.far);
            } else {
                console.log('Camera type: Orthographic');
                console.log('Left:', currentCamera.left.toFixed(2));
                console.log('Right:', currentCamera.right.toFixed(2));
                console.log('Top:', currentCamera.top.toFixed(2));
                console.log('Bottom:', currentCamera.bottom.toFixed(2));
                console.log('Near:', currentCamera.near);
                console.log('Far:', currentCamera.far);
                console.log('Zoom:', currentCamera.zoom.toFixed(4));
            }
            
            // Parametry modelu a kamery
            console.log('--- Model & Camera ---');
            console.log('Box center:', `x: ${center.x.toFixed(2)}, y: ${center.y.toFixed(2)}, z: ${center.z.toFixed(2)}`);
            console.log('Box size:', `x: ${size.x.toFixed(2)}, y: ${size.y.toFixed(2)}, z: ${size.z.toFixed(2)}`);
            
            if (params.maxDim !== undefined) {
                console.log('Max dimension:', params.maxDim.toFixed(2));
            }
            if (params.cameraDistance !== undefined) {
                console.log('Camera distance:', params.cameraDistance.toFixed(2));
            }
            if (params.cameraPosition) {
                const pos = params.cameraPosition;
                console.log('Camera position:', `x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)}`);
                
                // Vypočítáme skutečnou vzdálenost kamery od středu
                const actualDistance = Math.sqrt(
                    Math.pow(pos.x - center.x, 2) +
                    Math.pow(pos.y - center.y, 2) +
                    Math.pow(pos.z - center.z, 2)
                );
                console.log('Actual distance from center:', actualDistance.toFixed(2));
            }
            
            console.log('====================');
        };
        
        // Zavoláme debug funkci s vypočítanými parametry
        debugViewParams({
            maxDim: maxDim,
            cameraDistance: cameraDistance,
            cameraPosition: currentCamera.position
        });
    }
    
    render();
}
    
function updateSection() {
    clipPlanes[0].constant=viewProp.px;
    clipPlanes[1].constant=viewProp.py;
    clipPlanes[2].constant=viewProp.pz;
    render();
}				
    
function setCamera() {					
    const position = currentCamera.position.clone();

    currentCamera = currentCamera.isPerspectiveCamera ? cameraOrtho : cameraPersp;
    currentCamera.position.copy( position );

    orbitControls.object = currentCamera;
    transformControls.camera = currentCamera;
    sectionTransformControls.camera = currentCamera;

    currentCamera.lookAt( orbitControls.target.x, orbitControls.target.y, orbitControls.target.z );
    updateSelectDimensionCamera(currentCamera);
    onWindowResize();
}	
//GUI----------------------------------------------------------------------------------------------------------------
function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

function addShadowedLight( x, y, z, color, intensity ) {
    const directionalLight = new THREE.DirectionalLight( color, intensity );
    directionalLight.position.set( x, y, z );
    scene.add( directionalLight );
    directionalLight.castShadow = true;
    return directionalLight;
}

function addAxesHelper(axesSize) {
    // Zpětná kompatibilita - nastaví velikost a zobrazí helper
    if (axesSize !== undefined) viewProp.axesHelperSize = axesSize;
    viewProp.showAxesHelper = true;
    updateAxesHelper();
}

function updateAxesHelper() {
    // Odebereme stávající objekt ze scény
    if (axesHelperObject) {
        scene.remove(axesHelperObject);
        axesHelperObject.dispose?.();
        axesHelperObject = null;
    }
    
    if (!viewProp.showAxesHelper) {
        render();
        return;
    }
    
    // Pokud je velikost 0 nebo nebyla nastavena, dopočítáme ji z modelu
    let size = viewProp.axesHelperSize;
    if (!size || size <= 0) {
        const box = new THREE.Box3();
        meshObjects.forEach(obj => box.expandByObject(obj));
        if (!box.isEmpty()) {
            const boxSize = box.getSize(new THREE.Vector3());
            size = Math.max(boxSize.x, boxSize.y, boxSize.z) * 0.5;
            viewProp.axesHelperSize = Math.round(size);
        } else {
            return;
        }
    }
    
    axesHelperObject = new THREE.AxesHelper(size);
    scene.add(axesHelperObject);
    render();
}

function updateCameraHelper() {
    if (cameraProspHelperObject) {
        scene.remove(cameraProspHelperObject);
        cameraProspHelperObject.dispose();
        cameraProspHelperObject = null;
    }
    if (viewProp.showCameraHelper) {
        cameraProspHelperObject = new THREE.CameraHelper(cameraPersp);
        cameraProspHelperObject.frustumCulled = false; // Zabránit předčasnému ořezu frustum cullingem
        scene.add(cameraProspHelperObject);
    }
    if (cameraOrthoHelperObject) {
        scene.remove(cameraOrthoHelperObject);
        cameraOrthoHelperObject.dispose();
        cameraOrthoHelperObject = null;
    }
    if (viewProp.showCameraOrthoHelper) {
        cameraOrthoHelperObject = new THREE.CameraHelper(cameraOrtho);
        cameraOrthoHelperObject.frustumCulled = false; // Zabránit předčasnému ořezu frustum cullingem
        scene.add(cameraOrthoHelperObject);
    }
    // Rozšířit far aktivní kamery, aby frustum helper druhé kamery nebyl oříznutý
    ensureCameraFarCoversHelpers();
    render();
}

// Pokud je zapnutý camera helper, rozšíří far aktivní kamery tak, aby pokryl celý frustum helperu.
function ensureCameraFarCoversHelpers() {
    const helperCameras = [];
    if (viewProp.showCameraHelper) helperCameras.push(cameraPersp);
    if (viewProp.showCameraOrthoHelper) helperCameras.push(cameraOrtho);
    if (helperCameras.length === 0) return;

    // Najdeme maximální vzdálenost far-bodu helperu od aktivní kamery
    let maxDistSq = 0;
    const camPos = currentCamera.position;
    helperCameras.forEach(hCam => {
        // Far body frustumu: pozice helperové kamery + směr * far
        hCam.updateMatrixWorld(true);
        const hPos = new THREE.Vector3().setFromMatrixPosition(hCam.matrixWorld);
        const hDir = new THREE.Vector3(0, 0, -1).applyQuaternion(hCam.quaternion);
        const farPoint = hPos.clone().add(hDir.multiplyScalar(hCam.far));
        maxDistSq = Math.max(maxDistSq, camPos.distanceToSquared(farPoint));
        // Také zkontrolujeme samotnou pozici helperové kamery
        maxDistSq = Math.max(maxDistSq, camPos.distanceToSquared(hPos));
    });

    const neededFar = Math.sqrt(maxDistSq) * 1.1; // 10% rezerva
    if (currentCamera.far < neededFar) {
        currentCamera.far = neededFar;
        currentCamera.updateProjectionMatrix();
    }
}

function rebuildLightsFolder() {
    if (!lightsFolder) return;
    while (lightsFolder.children.length) {
        lightsFolder.children[0].destroy();
    }
    lightsFolder.title(`Lights (${sceneLights.length})`);

    sceneLights.forEach((light, i) => {
        const displayName = light.name || `${light.type} #${i}`;
        const lf = lightsFolder.addFolder(displayName);

        const proxy = {
            color: '#' + light.color.getHexString(),
            intensity: light.intensity,
            posX: light.position.x,
            posY: light.position.y,
            posZ: light.position.z,
        };

        lf.addColor(proxy, 'color').name('Color').onChange(v => {
            light.color.set(v);
            updateLightHelper();
            render();
        });

        lf.add(proxy, 'intensity', 0, 10, 0.01).name('Intensity').onChange(v => {
            light.intensity = v;
            render();
        });

        if (light.isHemisphereLight) {
            proxy.groundColor = '#' + light.groundColor.getHexString();
            lf.addColor(proxy, 'groundColor').name('Ground Color').onChange(v => {
                light.groundColor.set(v);
                render();
            });
        }

        if (!light.isAmbientLight && !light.isHemisphereLight) {
            lf.add(proxy, 'posX', -1000, 1000, 1).name('Pos X').onChange(v => {
                light.position.x = v;
                updateLightHelper();
                render();
            });
            lf.add(proxy, 'posY', -1000, 1000, 1).name('Pos Y').onChange(v => {
                light.position.y = v;
                updateLightHelper();
                render();
            });
            lf.add(proxy, 'posZ', -1000, 1000, 1).name('Pos Z').onChange(v => {
                light.position.z = v;
                updateLightHelper();
                render();
            });
        }

        if (light.isSpotLight) {
            proxy.angle = THREE.MathUtils.radToDeg(light.angle);
            proxy.penumbra = light.penumbra;
            lf.add(proxy, 'angle', 1, 90, 1).name('Angle (°)').onChange(v => {
                light.angle = THREE.MathUtils.degToRad(v);
                updateLightHelper();
                render();
            });
            lf.add(proxy, 'penumbra', 0, 1, 0.01).name('Penumbra').onChange(v => {
                light.penumbra = v;
                render();
            });
        }

        if (light.isPointLight || light.isSpotLight) {
            proxy.distance = light.distance;
            proxy.decay = light.decay;
            lf.add(proxy, 'distance', 0, 10000, 1).name('Distance').onChange(v => {
                light.distance = v;
                render();
            });
            lf.add(proxy, 'decay', 0, 5, 0.01).name('Decay').onChange(v => {
                light.decay = v;
                render();
            });
        }

        lf.add({ fn() {
            if (light.parent) light.parent.remove(light);
            sceneLights.splice(sceneLights.indexOf(light), 1);
            rebuildLightsFolder();
            updateLightHelper();
            render();
        }}, 'fn').name('🗑 Remove');

        lf.close();
    });

    const addLightOpts = { type: 'DirectionalLight' };
    lightsFolder.add(addLightOpts, 'type', ['DirectionalLight', 'PointLight', 'SpotLight', 'AmbientLight', 'HemisphereLight']).name('New type');
    lightsFolder.add({ fn() {
        let newLight;
        switch (addLightOpts.type) {
            case 'DirectionalLight':
                newLight = new THREE.DirectionalLight(0xffffff, 1);
                newLight.position.set(100, 100, 100);
                break;
            case 'PointLight':
                newLight = new THREE.PointLight(0xffffff, 1, 0);
                newLight.position.set(0, 100, 0);
                break;
            case 'SpotLight':
                newLight = new THREE.SpotLight(0xffffff, 1);
                newLight.position.set(0, 100, 0);
                break;
            case 'AmbientLight':
                newLight = new THREE.AmbientLight(0x404040, 1);
                break;
            case 'HemisphereLight':
                newLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
                break;
        }
        newLight.name = addLightOpts.type;
        scene.add(newLight);
        sceneLights.push(newLight);
        rebuildLightsFolder();
        updateLightHelper();
        render();
    }}, 'fn').name('➕ Add Light');
}

function updateLightHelper() {
    lightHelperObjects.forEach(h => { scene.remove(h); h.dispose(); });
    lightHelperObjects.length = 0;
    if (viewProp.showLightHelper) {
        // Automaticky dopočítáme velikost z bounding boxu modelů, pokud je size <= 0
        let size = viewProp.lightHelperSize;
        if (!size || size <= 0) {
            const box = new THREE.Box3();
            meshObjects.forEach(obj => box.expandByObject(obj));
            size = !box.isEmpty() ? Math.max(...box.getSize(new THREE.Vector3()).toArray()) * 0.3 : 100;
            viewProp.lightHelperSize = Math.round(size);
        }
        console.group('💡 Scene lights');
        sceneLights.forEach((light, i) => {
            const type = light.type;
            const pos = light.position;
            const base = {
                index: i,
                type,
                intensity: light.intensity,
                color: '#' + light.color.getHexString(),
                position: `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`,
            };
            if (light.isHemisphereLight) {
                console.log({ ...base, groundColor: '#' + light.groundColor.getHexString() });
            } else if (light.isDirectionalLight) {
                const t = light.target.position;
                console.log({ ...base, target: `(${t.x.toFixed(2)}, ${t.y.toFixed(2)}, ${t.z.toFixed(2)})`, castShadow: light.castShadow });
            } else {
                console.log(base);
            }
        });
        console.groupEnd();

        sceneLights.forEach(light => {
            let h;
            if (light.isHemisphereLight) {
                h = new THREE.HemisphereLightHelper(light, size);
            } else if (light.isDirectionalLight) {
                h = new THREE.DirectionalLightHelper(light, size);
            }
            if (h) { scene.add(h); lightHelperObjects.push(h); }
        });
    }
    render();
}

// --- Multi-výběr: funkce ---

// Přidá / odebere konkrétní objekt do/z skupiny.
// Skupina se aktivuje automaticky při přidání prvního objektu
// a zaniká, když je seznam prázdný – bez nutnosti ručního activate/deactivate.
function toggleObjectInMultiSelect(obj) {
    if (!obj) return;
    const idx = selectedObjects.indexOf(obj);
    if (idx !== -1) {
        // --- Odebrat ---
        const originalParent = multiOriginalParents[idx] || scene;
        originalParent.attach(obj);                  // vrátit do původního rodiče
        selectedObjects.splice(idx, 1);
        multiOriginalParents.splice(idx, 1);
        obj.traverse(child => { if (child.isMesh) { applyEmissive(child, 0x000000); clearXray(child); } });
        scene.remove(multiSelectionHelpers[idx]);
        multiSelectionHelpers.splice(idx, 1);
        console.log(`Multi-selection: removed "${obj.name}", remaining: ${selectedObjects.length}`);

        if (selectedObjects.length === 0) {
            // Poslední objekt odebrán – zničit pivot a group GUI
            if (transformControls.object === pivotObject) transformControls.detach();
            if (pivotObject) { scene.remove(pivotObject); pivotObject = null; }
            viewProp.isGroupTransformActive = false;
            clearGroupHighlights();
            if (selectedFolder) {
                selectedFolder.destroy();
                selectedFolder = null;
                guiPanels['Selected'].gui = null;
                guiPanels['Selected'].btn.classList.remove('active');
                guiPanels['Selected'].btn.style.display = 'none';
            }
        } else {
            refreshGroupGui();
        }
    } else {
        // --- Přidat ---
        if (!pivotObject) {
            // První objekt – vytvořit pivot na jeho world pozici
            deselectObject();   // odpojit případný single-select TC
            obj.updateWorldMatrix(true, false);
            const center = new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld);
            pivotObject = new THREE.Object3D();
            pivotObject.name = '__multiSelectPivot__';
            pivotObject.position.copy(center);
            scene.add(pivotObject);
            transformControls.attach(pivotObject);
            viewProp.isGroupTransformActive = true;
        }
        selectedObjects.push(obj);
        multiOriginalParents.push(obj.parent);   // uložit před attach
        setNavigationPosition(obj);              // před attach – parent chain ještě odpovídá DOM
        pivotObject.attach(obj);
        obj.traverse(child => { if (child.isMesh) { applyEmissive(child, 0xff0000); if (viewProp.xrayOnSelect) applyXray(child); } });
        const h = new PaddedBoxHelper(obj, 0x00ccff, viewProp.multiSelectBoxPadding);
        scene.add(h);
        multiSelectionHelpers.push(h);
        console.log(`Multi-selection: added "${obj.name}", total: ${selectedObjects.length}`);
        refreshGroupGui();
    }
    render();
}

// Přidá / odebere lastSelectedObject do/z skupiny. Volá se klávesou "/".
function addCurrentToMultiSelect() {
    if (!lastSelectedObject) return;
    // Vyčistíme emissivní zvýraznění před přidáním do skupiny
    lastSelectedMeshes.forEach(child => { applyEmissive(child, 0x000000); clearXray(child); });
    lastSelectedMeshes.length = 0;
    toggleObjectInMultiSelect(lastSelectedObject);
}

// Aktivuje skupinovou transformaci: reparentuje objekty do pivotu, TC se přepne na pivot.
function activateMultiSelect() {
    if (selectedObjects.length < 1) {
        console.log('Multi-selection: at least 1 object required.');
        return;
    }
    if (viewProp.isGroupTransformActive) return;

    // Zrušíme single-select, aby TC nebyl připojen k jinému objektu
    deselectObject();

    // Střed skupiny (centroid)
    const center = new THREE.Vector3();
    selectedObjects.forEach(obj => {
        obj.updateWorldMatrix(true, false);
        center.add(new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld));
    });
    center.divideScalar(selectedObjects.length);

    // Vytvoříme pivot na centroidu
    pivotObject = new THREE.Object3D();
    pivotObject.name = '__multiSelectPivot__';
    pivotObject.position.copy(center);
    scene.add(pivotObject);

    // Reparentujeme objekty do pivotu (Three.js zachová world-space pozici)
    selectedObjects.forEach(obj => pivotObject.attach(obj));

    // Aktualizujeme BoxHelpery na aktuální pozice objektů
    multiSelectionHelpers.forEach((h, i) => { if (selectedObjects[i]) h.setFromObject(selectedObjects[i]); });

    // Připojíme TC k pivotu
    transformControls.attach(pivotObject);
    viewProp.isGroupTransformActive = true;
    console.log(`Multi-selection activated, ${selectedObjects.length} objects.`);
    refreshGroupGui();
    render();
}

// Deaktivuje skupinovou transformaci: vrátí objekty původním rodičům, TC se odpojí.
// Seznam selectedObjects zůstane zachován – lze skupinu znovu aktivovat.
function deactivateMultiSelect() {
    if (!viewProp.isGroupTransformActive) return;

    // Vyčistíme emissivní zvýraznění (z group-mode kliku)
    lastSelectedMeshes.forEach(child => { applyEmissive(child, 0x000000); clearXray(child); });
    lastSelectedMeshes.length = 0;
    // Vyčistíme emissivní zvýraznění group objektů
    selectedObjects.forEach(obj => obj.traverse(child => { if (child.isMesh) { applyEmissive(child, 0x000000); clearXray(child); } }));

    clearGroupHighlights();

    if (transformControls.object === pivotObject) transformControls.detach();

    // Zrušíme group GUI
    if (selectedFolder) {
        selectedFolder.destroy();
        selectedFolder = null;
        guiPanels['Selected'].gui = null;
        guiPanels['Selected'].btn.classList.remove('active');
        guiPanels['Selected'].btn.style.display = 'none';
    }

    // Vrátíme objekty zpět jejich původním rodičům (zachová se world-space pozice)
    selectedObjects.forEach((obj, i) => {
        const parent = multiOriginalParents[i] || scene;
        parent.attach(obj);
    });

    // Odstraníme pivot ze scény
    scene.remove(pivotObject);
    pivotObject = null;
    viewProp.isGroupTransformActive = false;

    // Aktualizujeme BoxHelpery (objekty se vrátily, ale pozice se nezměnila)
    multiSelectionHelpers.forEach((h, i) => {
        if (selectedObjects[i]) h.setFromObject(selectedObjects[i]);
    });
    console.log('Multi-selection deactivated. Object list preserved.');
    render();
}

// Zruší multi-výběr úplně: deaktivuje skupinu a vymaže celý seznam.
function clearMultiSelect() {
    deactivateMultiSelect();
    multiSelectionHelpers.forEach(h => scene.remove(h));
    multiSelectionHelpers.length = 0;
    selectedObjects.length = 0;
    multiOriginalParents.length = 0;
    console.log('Multi-selection cleared.');
    render();
}

// --- Group History ---

// Uloží aktuální selectedObjects do groupHistory jako pojmenovaný snapshot.
function addCurrentGroupToHistory() {
    if (selectedObjects.length === 0) {
        console.log('Group History: list is empty, cannot save.');
        return;
    }
    const names = selectedObjects.map(o => o.name || 'Unnamed').join(', ');
    const snapshot = {
        name: `[${groupHistory.length + 1}] ${names}`,
        objects: [...selectedObjects]          // kopie referencí
    };
    groupHistory.push(snapshot);
    groupHistoryIndex = groupHistory.length - 1;
    updateHistoryInfo();
    console.log(`Group History: snapshot "${snapshot.name}" saved.`);
}

// Přejde v historii o dir kroků (-1 = předchozí, +1 = následující).
function navigateGroupHistory(dir) {
    if (groupHistory.length === 0) {
        console.log('Group History: history is empty.');
        return;
    }
    groupHistoryIndex = Math.max(0, Math.min(groupHistory.length - 1, groupHistoryIndex + dir));
    updateHistoryInfo();

    // Zobrazíme oránžové preview-helpery pro objekty aktuálního záznamu
    clearHistoryPreviewHelpers();
    groupHistory[groupHistoryIndex].objects.forEach(obj => {
        if (!obj || !obj.parent) return;
        const h = new PaddedBoxHelper(obj, 0xff8800, viewProp.multiSelectBoxPadding);
        scene.add(h);
        groupHistoryPreviewHelpers.push(h);
    });

    console.log(`Group History: index ${groupHistoryIndex} – "${groupHistory[groupHistoryIndex].name}"`);
    render();
}

// Přidá všechny objekty aktuálního assembly kroku do group selection.
function assemblySelectStepObjects() {
    const ci = assemblyState.currentStepIndex;
    if (ci < 0 || ci >= assemblyData.steps.length) return;
    const step = assemblyData.steps[ci];
    const objs = step.transformations
        .map(t => t.objectRef)
        .filter(o => o && o.parent);
    if (objs.length === 0) return;

    // Clear existing multi-select
    deactivateMultiSelect();
    multiSelectionHelpers.forEach(h => scene.remove(h));
    multiSelectionHelpers.length = 0;
    selectedObjects.length = 0;
    multiOriginalParents.length = 0;

    // Add each step object to the selection
    objs.forEach(obj => {
        selectedObjects.push(obj);
        multiOriginalParents.push(obj.parent);
        const h = new PaddedBoxHelper(obj, 0x00ccff, viewProp.multiSelectBoxPadding);
        scene.add(h);
        multiSelectionHelpers.push(h);
        obj.traverse(child => { if (child.isMesh) { applyEmissive(child, 0xff0000); if (viewProp.xrayOnSelect) applyXray(child); } });
    });

    activateMultiSelect();
    render();
}

// Zobrazí PaddedBoxHelpery kolem objektů aktuálního assembly kroku, pokud je aktivní edit mode.
// Volá se z updateAssemblyGuiInfo() a při přepnutí editMode.
function updateAssemblyStepHelpers(stepOverride = null) {
    // Odstraníme staré helpery
    assemblyStepHelpers.forEach(h => scene.remove(h));
    assemblyStepHelpers.length = 0;

    if (!assemblyState.editMode) { render(); return; }
    const ci = assemblyState.currentStepIndex;

    const step = stepOverride ?? (ci >= 0 && ci < assemblyData.steps.length ? assemblyData.steps[ci] : null);
    if (!step) { render(); return; }

    step.transformations.forEach(t => {
        if (!t.objectRef || !t.objectRef.parent) return;
        const h = new PaddedBoxHelper(t.objectRef, 0xffee00, viewProp.multiSelectBoxPadding);
        scene.add(h);
        assemblyStepHelpers.push(h);
    });
    render();
}

// Odstrání preview-helpery ze scény.
function clearHistoryPreviewHelpers() {
    groupHistoryPreviewHelpers.forEach(h => scene.remove(h));
    groupHistoryPreviewHelpers.length = 0;
    render();
}

// Obnoví selectedObjects ze záznamu na groupHistoryIndex.
function restoreGroupFromHistory() {
    if (groupHistoryIndex < 0 || groupHistoryIndex >= groupHistory.length) {
        console.log('Group History: no record to restore.');
        return;
    }

    // Odstráníme preview-helpery – objekty dostanou cyan helpery ze standardního seznamu
    clearHistoryPreviewHelpers();
    const snapshot = groupHistory[groupHistoryIndex];

    // Nejprve vyčistíme aktuální skupinu (bez mazání historie)
    deactivateMultiSelect();
    multiSelectionHelpers.forEach(h => scene.remove(h));
    multiSelectionHelpers.length = 0;
    selectedObjects.length = 0;
    multiOriginalParents.length = 0;

    // Obnovíme objekty ze snapshotu
    snapshot.objects.forEach(obj => {
        // Objekt může být mezidobí smazán – bezpečnostní kontrola
        if (!obj || !obj.parent) return;
        selectedObjects.push(obj);
        multiOriginalParents.push(obj.parent);
        const h = new PaddedBoxHelper(obj, 0x00ccff, viewProp.multiSelectBoxPadding);
        scene.add(h);
        multiSelectionHelpers.push(h);
        obj.traverse(child => { if (child.isMesh) { applyEmissive(child, 0xff0000); if (viewProp.xrayOnSelect) applyXray(child); } });
    });

    console.log(`Group History: group "${snapshot.name}" restored (${selectedObjects.length} objects).`);
    activateMultiSelect();
    render();
}

// Odstraní aktuální záznam z groupHistory.
function removeFromGroupHistory() {
    if (groupHistoryIndex < 0 || groupHistoryIndex >= groupHistory.length) {
        console.log('Group History: no record to delete.');
        return;
    }
    clearHistoryPreviewHelpers();
    const removed = groupHistory.splice(groupHistoryIndex, 1)[0];
    // Upravíme index: po smazání posledního záznamu posuneme dozadu
    if (groupHistoryIndex >= groupHistory.length) {
        groupHistoryIndex = groupHistory.length - 1;
    }
    updateHistoryInfo();
    // Pokud zbývají záznamy, zobrazíme preview nového aktuálního
    if (groupHistoryIndex >= 0) {
        groupHistory[groupHistoryIndex].objects.forEach(obj => {
            if (!obj || !obj.parent) return;
            const h = new PaddedBoxHelper(obj, 0xff8800, viewProp.multiSelectBoxPadding);
            scene.add(h);
            groupHistoryPreviewHelpers.push(h);
        });
        render();
    }
    console.log(`Group History: record "${removed.name}" deleted, remaining: ${groupHistory.length}`);
}

// Aktualizuje zobrazovaný text v GUI.
function updateHistoryInfo() {
    if (groupHistoryIndex < 0 || groupHistory.length === 0) {
        viewProp.historyInfo = '– žádný záznam –';
    } else {
        const snap = groupHistory[groupHistoryIndex];
        viewProp.historyInfo = `${groupHistoryIndex + 1}/${groupHistory.length}: ${snap.name}`;
    }
}

//https://www.reddit.com/r/learnjavascript/comments/9jovpn/how_can_i_load_a_3d_model_asynchronously_in/	
//https://javascript.info/promise-basics
function loadStlModel(model, name, scale, colored) {
    return new Promise( (resolve, reject) => {

        function loadFromStlUrl(url) {
            const loader = new STLLoader();
            loader.load( url, function ( geometry ) {												

                const nGeometryGroups = geometry.groups.length;
                console.log("nGeometryGroups: ", nGeometryGroups);

                const makeMaterial = () => new THREE.MeshPhongMaterial({
                    side: THREE.DoubleSide,
                    clippingPlanes: clipPlanes,
                    clipIntersection: true,
                    color: Math.random() * 0xffffff,
                    wireframe: false,
                    polygonOffset: true,
                    polygonOffsetFactor: 1
                });

                let meshMaterial;
                if (nGeometryGroups > 0) {
                    meshMaterial = [];
                    for (let i = 0; i < nGeometryGroups; i++) {
                        meshMaterial.push(makeMaterial());
                    }
                } else {
                    meshMaterial = makeMaterial();
                }
                const mesh = new THREE.Mesh(geometry, meshMaterial);					
                
                // Definice výchozích hodnot v userData (Three.js best practice)
                mesh.userData.initPosition = { x: 0, y: 0, z: 0 };
                mesh.userData.initRotation = { x: -Math.PI/2, y: 0, z: 0 };
                mesh.userData.initScale = { x: 1, y: 1, z: 1 };
                mesh.name = fileNameWithoutExtension(name || model);
                mesh.userData.fileName = name || fileNameWithoutExtension(model);
                scene.add( mesh );	
                console.log(mesh);
                meshObjects.push(mesh);
                loadedModels.push(mesh);
                rebuildTree(loadedModels);
                render();
                resolve(mesh);	

                lastSelectedObject=mesh;  
            } );
        }

        if (name.toLowerCase().endsWith('.zip')) {
            const zipLoader = new ZipLoader( model );
            zipLoader.load().then( function() {
                const url = zipLoader.extractAsBlobUrl( fileNameWithoutExtension(name) + '.txt');
                loadFromStlUrl(url);
            });
        } else {
            loadFromStlUrl(model);
        }
    });
}

function loadGlbModel(model, name, scale, colored) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('./draco/');
        loader.setDRACOLoader(dracoLoader);
        //loader.load('./models/1012053_l.glb', function (gltf) {
        loader.load(model, function (gltf) {
            // Oprava extrémních scale hodnot způsobených exportem (např. 0.001 nebo 0.01 z CAD → Blender → GLB)
            // Povolený rozsah: [0.1, 10] — vše mimo se považuje za artefakt exportu a resetuje se na 1
            gltf.scene.traverse(function (child) {
                const s = child.scale;
                if (Math.abs(s.x) < 0.1 || Math.abs(s.x) > 10 ||
                    Math.abs(s.y) < 0.1 || Math.abs(s.y) > 10 ||
                    Math.abs(s.z) < 0.1 || Math.abs(s.z) > 10) {
                    child.scale.set(1, 1, 1);
                }
            });
            // Rotace byla odstraněna - lze nyní nastavit pomocí GUI tlačítek

            // ---- Detect app export root wrapper ----
            // When this app exports, it wraps all models in a single unnamed Group tagged
            // with _appExportRoot=true. GLTFLoader then wraps that again in gltf.scene,
            // producing 2 extra anonymous layers per export/import cycle.
            // If we detect the tag, we unwrap and add each original model directly.
            const wrapperChild = gltf.scene.children[0];
            const isAppExport = wrapperChild && wrapperChild.userData._appExportRoot === true;

            if (isAppExport) {
                // Move app-level userData (documents, settings, …) up to gltf.scene
                // so the import utility functions (which traverse from gltf.scene) find them.
                Object.assign(gltf.scene.userData, wrapperChild.userData);
                delete gltf.scene.userData._appExportRoot;

                // Collect the actual models before detaching them from the wrapper
                const extractedModels = [...wrapperChild.children];

                // Import app-level data (traverses gltf.scene, finds data in userData)
                importAssemblyFromGltfScene(gltf.scene);
                importDocumentsFromGltfScene(gltf.scene);
                importAttachmentsFromGltfScene(gltf.scene);
                importSettingsFromGltfScene(gltf.scene);

                const fallbackName = name || fileNameWithoutExtension(model);
                for (const mdl of extractedModels) {
                    // Preserve the original model name; fall back to file name only when absent
                    if (!mdl.userData.fileName) mdl.userData.fileName = fallbackName;

                    scene.add(mdl);
                    loadedModels.push(mdl);

                    mdl.traverse(function (child) {
                        child.userData.initPosition = child.position.clone();
                        child.userData.initRotation = child.rotation.clone();
                        child.userData.initScale = child.scale.clone();

                        if (child.isMesh && child.material) {
                            child.material = child.material.clone();
                            child.material.clippingPlanes = clipPlanes;
                            child.material.clipIntersection = true;
                            child.material.side = THREE.DoubleSide;
                            child.material.polygonOffset = true;
                            child.material.polygonOffsetFactor = 1;
                            meshObjects.push(child);
                        }
                    });

                    reconstructMeasurements(mdl, render);
                    reconstructAnnotations(mdl, render);
                    reconstructAnnotations3d(mdl, render);
                    reconstructCadDim3d(mdl);
                }

                rebuildTree(loadedModels);
                render();
                resolve(extractedModels[0] || gltf.scene);
            } else {
                // ---- Standard loading path (external GLB or legacy file) ----
                scene.add(gltf.scene);
                gltf.scene.userData.fileName = name || fileNameWithoutExtension(model);
                loadedModels.push(gltf.scene); // Uložení reference na načtený model
                console.log(gltf.scene);

                const meshes = [];
                gltf.scene.traverse(function (child) {
                    // Uložení počátečních hodnot v userData pro všechny objekty (Group, Object3D, Mesh)
                    child.userData.initPosition = child.position.clone();
                    child.userData.initRotation = child.rotation.clone();
                    child.userData.initScale = child.scale.clone();
                    
                    if (child.isMesh) {
                        if (child.material) {
                            child.material = child.material.clone();// Naklonujeme materiál, aby byl unikátní. Jinak jeden typ materiálu pro více častí stejné barvy.
                            child.material.clippingPlanes = clipPlanes;
                            child.material.clipIntersection = true;
                            child.material.side = THREE.DoubleSide;
                            child.material.polygonOffset = true;
                            child.material.polygonOffsetFactor = 1;    
                        }                    
                        meshes.push(child);
                        meshObjects.push(child);
                    }
                });
                
                // Import assembly workflow stored in userData (if any)
                importAssemblyFromGltfScene(gltf.scene);
                
                // Import documents stored in userData (if any)
                importDocumentsFromGltfScene(gltf.scene);

                // Import attachments stored in userData (if any)
                importAttachmentsFromGltfScene(gltf.scene);

                // Import 3D dimension defaults, 3D annotation defaults, section settings
                importSettingsFromGltfScene(gltf.scene);
                
                // Reconstruct measurements stored in userData
                reconstructMeasurements(gltf.scene, render);
                reconstructAnnotations(gltf.scene, render);
                reconstructAnnotations3d(gltf.scene, render);
                reconstructCadDim3d(gltf.scene);
                
                rebuildTree(loadedModels);
                render();
                resolve(gltf.scene);
            }
        }, undefined, function (error) {
            reject(error); // Doporučuji přidat i error handling
        });
    });
}				

function fileNameWithoutExtension(path) {
    const myArr = path.split('/');
    const myStr = myArr[ myArr.length-1 ];
    const nameParts = myStr.split('.');
    return nameParts[0];			
}

function cleanupModel() {
    if (!confirm('Flatten all unnamed nodes in the model?')) return;
    // Detach TransformControls and clear GUI before restructuring the scene graph
    deselectObject();

    // Collect all unnamed Object3D nodes (skip scene root, meshes, lights, cameras)
    // Traverse only loadedModels subtrees – this naturally avoids TransformControls,
    // helpers and other scene-level objects that don't belong to user content.
    const toProcess = [];
    loadedModels.forEach(function(root) {
        if (!root) return;
        root.traverse(function(node) {
            if (node.isMesh || node.isLight || node.isCamera) return;
            if (node.userData._isMeasurement || node.userData._isAnnotation || node.userData._isAnnotation3d || node.userData._isCadDim3d) return;
            if (!node.name || node.name.trim() === '') {
                toProcess.push(node);
            }
        });
    });

    if (toProcess.length === 0) {
        console.log('cleanupModel: no unnamed nodes found.');
        return;
    }

    // Reverse pre-order → post-order: children are processed before their parents.
    // This correctly handles nested unnamed nodes.
    toProcess.reverse();

    let count = 0;
    for (const node of toProcess) {
        if (!node.parent) continue; // already detached by an earlier iteration

        const parent = node.parent;
        const children = [...node.children];

        // Move all children to grandparent, preserving world-space transform
        for (const child of children) {
            parent.attach(child);
        }

        // Remove the now-empty (or childless) unnamed node
        parent.remove(node);

        // Remove from meshObjects if tracked
        const idx = meshObjects.indexOf(node);
        if (idx !== -1) meshObjects.splice(idx, 1);

        // If it was a root model, replace its entry in loadedModels with its promoted children
        const lmIdx = loadedModels.indexOf(node);
        if (lmIdx !== -1) {
            loadedModels.splice(lmIdx, 1, ...children);
        }

        count++;
    }

    console.log(`cleanupModel: removed ${count} unnamed node(s).`);

    if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) {
        updateCrossSectionLines();
    }
    rebuildTree(loadedModels);
    render();
}

function flattenHierarchy(obj) {
    if (!obj) return;
    if (!confirm('Remove this node and move its children to the parent?')) return;
    const parent = obj.parent;
    if (!parent) {
        console.warn('flattenHierarchy: object has no parent, cannot flatten.');
        return;
    }

    // Collect children snapshot (iterate copy because attach() modifies children array)
    const children = [...obj.children];

    if (children.length === 0) {
        console.warn('flattenHierarchy: object has no children, use Remove Object instead.');
        return;
    }

    deselectObject();

    // Re-parent each child to grandparent while preserving world transform
    for (const child of children) {
        parent.attach(child);
    }

    // Remove the now-empty node
    parent.remove(obj);

    // Remove from meshObjects if it was tracked (usually only meshes are tracked)
    const idx = meshObjects.indexOf(obj);
    if (idx !== -1) meshObjects.splice(idx, 1);

    // If obj was a root model (directly under scene), replace it in loadedModels with its children
    const lmIdx = loadedModels.indexOf(obj);
    if (lmIdx !== -1) {
        loadedModels.splice(lmIdx, 1, ...children);
    }

    // Update cross-section lines if needed
    if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) {
        updateCrossSectionLines();
    }

    rebuildTree(loadedModels);
    render();
}

function clearSceneKeepDocs() {
    if (!confirm('Clear scene? Documents and files will be kept.')) return;
    try {
        deselectObject();
        clearHistoryPreviewHelpers();

        // Remove per-model overlays (measurements, annotations, etc.)
        const modelsCopy = loadedModels.slice();
        modelsCopy.forEach(part => {
            removeMeasurementsForOwner(part);
            removeAnnotationsForOwner(part);
            removeAnnotations3dForOwner(part);
            removeCadDim3dMeasurementsForOwner(part);
        });

        // Clear all mesh / hidden tracking arrays
        meshObjects.length = 0;
        hiddenObjects.length = 0;
        temporarilyShownObjects = [];

        // Reset assembly data
        assemblyData.steps.length = 0;
        assemblyAnchors.clear();
        assemblyState.currentStepIndex = -1;

        // Remove all root models from the scene
        modelsCopy.forEach(part => {
            if (part.parent) part.parent.remove(part);
            else scene.remove(part);
        });
        loadedModels.length = 0;

        // Update dependent GUI / scene state
        if (_assemblyFolderRef) updateAssemblyGuiInfo();
        if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) updateCrossSectionLines();
        if (viewProp.sectionCrossLines) updateSectionCrossLines();
        if (viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render);

        rebuildTree(loadedModels);
        render();
    } catch(err) {
        console.log('Error: clearSceneKeepDocs ' + err.message);
    }
}

function removeModel(part) {
    if (!confirm('Do you really want to permanently remove object?')) return;
    try {				
        deselectObject();

        removeMeasurementsForOwner(part);
        removeAnnotationsForOwner(part);
        removeAnnotations3dForOwner(part);
        removeCadDim3dMeasurementsForOwner(part);

        // Odstraníme part i všechny jeho potomky z meshObjects a hiddenObjects.
        // V GLB hierarchii jsou v meshObjects pouze leaf-meshe, nikoli skupiny –
        // pouhý indexOf(part) by neostranil potomky, kteří by pak zůstali aktivní
        // v raycastu i po odebrání rodiče ze scény.
        const removedObjects = new Set();
        part.traverse(obj => {
            removedObjects.add(obj);
            const mi = meshObjects.indexOf(obj);
            if (mi !== -1) meshObjects.splice(mi, 1);
            const hi = hiddenObjects.indexOf(obj);
            if (hi !== -1) hiddenObjects.splice(hi, 1);
        });

        // Vyčistíme assemblyData — odstraníme transformace odkazující na odebrané objekty.
        // Poté odebereme kroky, které nemají žádné transformace, a opravíme chain.
        const affectedChainObjects = new Set();
        assemblyData.steps.forEach(step => {
            const before = step.transformations.length;
            step.transformations = step.transformations.filter(t => {
                if (removedObjects.has(t.objectRef)) {
                    return false;
                }
                return true;
            });
            if (step.transformations.length !== before) {
                // Žádné chain objekty k opravě — odebrané objekty již neexistují.
                // Ale zbývající objekty ve stejném kroku mohou mít správné init díky chain.
            }
        });

        // Odstraníme kroky, které jsou nyní zcela prázdné.
        const nonEmptySteps = assemblyData.steps.filter(s => s.transformations.length > 0);
        if (nonEmptySteps.length !== assemblyData.steps.length) {
            assemblyData.steps.length = 0;
            nonEmptySteps.forEach((s, i) => { s.id = i + 1; assemblyData.steps.push(s); });
            if (assemblyState.currentStepIndex >= assemblyData.steps.length) {
                assemblyState.currentStepIndex = assemblyData.steps.length - 1;
            }
        }

        // Odstraníme z assemblyAnchors
        removedObjects.forEach(obj => assemblyAnchors.delete(obj));

        // Pokud je součástí skupiny (např. z GLB modelu), odstraníme z rodiče
        if (part.parent) {
            part.parent.remove( part );
        } else {
            // Jinak odstraníme ze scény
            scene.remove( part );
        }

        // Pokud šlo o kořenový model, odebereme i z loadedModels
        const lmIdx = loadedModels.indexOf(part);
        if (lmIdx !== -1) loadedModels.splice(lmIdx, 1);

        // Aktualizujeme GUI assembly po vyčištění dat
        if (_assemblyFolderRef) updateAssemblyGuiInfo();

        // Aktualizace průřezových čar
        if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) {
            updateCrossSectionLines();
        }

        // Aktualizace section cross lines (vázaných na clip planes)
        if (viewProp.sectionCrossLines) {
            updateSectionCrossLines();
        }

        // Aktualizace solid section (odebraný objekt nesmí figurovat ve stencilu)
        if (viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render);

        rebuildTree(loadedModels);
        render();
    } catch(err) {
        console.log("Error: removeModel " + err.message);
    }
}

function hideObject(part) {
    try {
        // Skryjeme objekt nastavením visibility na false
        part.visible = false;
        
        // Pokud se objekt nachází v temporarilyShownObjects, odstraníme ho odtud
        // Objekt může být pouze v jednom z těchto dvou polí
        const tempIndex = temporarilyShownObjects.indexOf(part);
        if (tempIndex !== -1) {
            temporarilyShownObjects.splice(tempIndex, 1);
            console.log(`Object ${part.name || 'Unnamed'} removed from temporarilyShownObjects.`);
        }
        
        // Přidáme objekt do pole skrytých objektů, pokud tam ještě není
        if (!hiddenObjects.includes(part)) {
            hiddenObjects.push(part);
            console.log(`Object ${part.name || 'Unnamed'} hidden.`);
        }
        
        // Zrušíme selekci skrytého objektu
        deselectObject();
        
        // Aktualizace ikony v outlineru
        updateVisibilityIcon(part);
        
        // Aktualizace průřezových čar
        if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) {
            updateCrossSectionLines();
        }

        // Aktualizace solid section (skrytý objekt nesmí figurovat ve stencilu)
        if (viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render);

        render();
    } catch(err) {
        console.log("Error: hideObject " + err.message);
    }
}

function showHiddenObjects() {
    try {
        // Projdeme všechny skryté objekty a zobrazíme je
        hiddenObjects.forEach(obj => {
            obj.visible = true;
            updateVisibilityIcon(obj);
            console.log(`Object ${obj.name || 'Unnamed'} shown.`);
        });
        
        // Vyprázdníme pole skrytých objektů
        hiddenObjects.length = 0;
        
        // Aktualizace průřezových čar
        if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) {
            updateCrossSectionLines();
        }

        // Aktualizace solid section
        if (viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render);

        render();
    } catch(err) {
        console.log("Error: showHiddenObjects " + err.message);
    }
}

function toggleHiddenObjects() {
    try {
        // Prohodíme pole hiddenObjects a temporarilyShownObjects
        const temp = [...hiddenObjects];
        hiddenObjects.length = 0;
        hiddenObjects.push(...temporarilyShownObjects);
        temporarilyShownObjects = temp;
        
        // Všechny objekty v hiddenObjects nastavíme jako neviditelné
        hiddenObjects.forEach(obj => {
            obj.visible = false;
            updateVisibilityIcon(obj);
            console.log(`Object ${obj.name || 'Unnamed'} is hidden.`);
        });
        
        // Všechny objekty v temporarilyShownObjects nastavíme jako viditelné
        temporarilyShownObjects.forEach(obj => {
            obj.visible = true;
            updateVisibilityIcon(obj);
            console.log(`Object ${obj.name || 'Unnamed'} is visible.`);
        });
        
        // Aktualizace průřezových čar
        if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) {
            updateCrossSectionLines();
        }

        // Aktualizace solid section
        if (viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render);

        render();
    } catch(err) {
        console.log("Error: toggleHiddenObjects " + err.message);
    }
}

function separateGroups( bufGeom ) {
    const outGeometries = [];
    const groups = bufGeom.groups;                    
    const origPositions = bufGeom.getAttribute( 'position' ).array;
    const origNormals = bufGeom.getAttribute( 'normal' ).array;
    
    for ( let ig = 0, ng = groups.length; ig < ng; ig ++ ) {                
        const group = groups[ ig ];
        const destNumVerts = group.count;
        const newBufGeom = new THREE.BufferGeometry();
        const newPositions = new Float32Array( destNumVerts * 3 );
        const newNormals = new Float32Array( destNumVerts * 3 );
        for ( let iv = 0; iv < destNumVerts; iv ++ ) {                    
            const indexOrig = 3 * ( group.start + iv );
            const indexDest = 3 * iv;                        
            newPositions[ indexDest + 0 ] = origPositions[ indexOrig + 0 ];
            newPositions[ indexDest + 1 ] = origPositions[ indexOrig + 1 ];
            newPositions[ indexDest + 2 ] = origPositions[ indexOrig + 2 ];
            newNormals[ indexDest + 0 ] = origNormals[ indexOrig + 0 ];
            newNormals[ indexDest + 1 ] = origNormals[ indexOrig + 1 ];
            newNormals[ indexDest + 2 ] = origNormals[ indexOrig + 2 ];                
        }                        
        newBufGeom.setAttribute( 'position', new THREE.BufferAttribute( newPositions, 3 ) );
        newBufGeom.setAttribute( 'normal', new THREE.BufferAttribute( newNormals, 3 ) );
        newBufGeom.addGroup(0, destNumVerts, 0);

        outGeometries.push( newBufGeom );
    }
    return outGeometries;
}

function onWindowResize() {
    const aspect = window.innerWidth / window.innerHeight;

    if (currentCamera == cameraPersp) {
        currentCamera.aspect = aspect;
    }
    
    if (currentCamera == cameraOrtho) {
        currentCamera.left   = -orthoHalfSize * aspect;
        currentCamera.right  =  orthoHalfSize * aspect;
        currentCamera.top    =  orthoHalfSize;
        currentCamera.bottom = -orthoHalfSize;
    }
    
    currentCamera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    if (css2DRenderer) css2DRenderer.setSize(window.innerWidth, window.innerHeight);
    if (css3DRenderer) css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function applyEmissive(object, color = 0xff0000) {
    if (!object || !object.material) return;

    if (Array.isArray(object.material)) {
        object.material.forEach(mat => {
            if (mat.emissive) mat.emissive.setHex(color);
        });
    } else {
        if (object.material.emissive) {
            object.material.emissive.setHex(color);
        }
    }
}

function applyXray(mesh) {
    if (!mesh || !mesh.material) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    xrayBackup.set(mesh, {
        renderOrder: mesh.renderOrder,
        depthTests: mats.map(m => m.depthTest)
    });
    mesh.renderOrder = 999;
    mats.forEach(m => { m.depthTest = false; m.needsUpdate = true; });
}

function clearXray(mesh) {
    if (!mesh || !mesh.material) return;
    const backup = xrayBackup.get(mesh);
    if (!backup) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mesh.renderOrder = backup.renderOrder;
    mats.forEach((m, i) => { m.depthTest = backup.depthTests[i] ?? true; m.needsUpdate = true; });
    xrayBackup.delete(mesh);
}

function highlightObject(object) {
    if (!object) return;

    // 1. Nastavení emisivity
    // applyEmissive(object, 0xff0000);

    // 2. Nastavení BoxHelperu (žlutý rámeček)
    if (selectionHelper) {
        selectionHelper.setFromObject(object);
        selectionHelper.visible = true;
    }
}

// Pokud je cadSelection zapnutý, vrátí nejbližšího pojmenovaného předka (nebo mesh samotný, pokud žádný není).
// Pokud je cadSelection vypnutý, vrátí objekt beze změny.
function resolveCADSelection(object) {
    if (viewProp.cadSelection !== 'CAD') return object;
    // Začínáme od rodiče meshe
    let candidate = object.parent;
    while (candidate) {
        // Konec hierarchie – vraťme naposledy nalezeného pojmenovaného nebo samotný mesh
        if (!candidate.parent) break;
        if (candidate.name && candidate.name.trim() !== '') return candidate;
        candidate = candidate.parent;
    }
    // Žádný pojmenovaný předek nenalezen – vrátíme původní mesh
    return object;
}

// Funkce pro vypnutí zvýraznění (Černá barva + Schování helperu)
function clearHighlight() {
    if (!INTERSECTED) return;

    // 1. Vypnutí emisivity (použijeme naši univerzální funkci s černou barvou)
    // applyEmissive(INTERSECTED, 0x000000);

    // 2. Schování BoxHelperu
    if (selectionHelper) {
        selectionHelper.visible = false;
    }
}

function selectObject(object) {
    if (lastSelectedObject) {// Pokud už je něco vybraného, nejdřív to "uklidíme"
        deselectObject();
    }

    if (object) {        
        lastSelectedObject = object;// Nastavíme nové reference

        // V assembly edit modu připojíme TC přímo na objekt (assembly tracking potřebuje
        // obj.position v local space, pivot by způsobil chybné záznamy).
        // Jinak vytvoříme pivot na středu bboxu, aby gizmo bylo vždy ve středu objektu.
        if (assemblyState.editMode) {
            transformControls.attach(object);// Připojíme TransformControls
        } else {
            object.updateWorldMatrix(true, true);
            const bbox = new THREE.Box3().setFromObject(object);
            const bboxCenter = new THREE.Vector3();
            bbox.getCenter(bboxCenter);
            // Zarovnáme pivot na snap grid – snap handler v change eventu snapuje
            // pivot.position, takže pokud pivot startuje na gridovém bodě,
            // delta bude vždy násobek snap kroku a sousední osy se nepohnou.
            {
                const snap = viewProp.snapTranslation;
                bboxCenter.x = Math.round(bboxCenter.x / snap) * snap;
                bboxCenter.y = Math.round(bboxCenter.y / snap) * snap;
                bboxCenter.z = Math.round(bboxCenter.z / snap) * snap;
            }
            singleSelectPivot = new THREE.Object3D();
            singleSelectPivot.name = '__singleSelectPivot__';
            singleSelectPivot.position.copy(bboxCenter);
            scene.add(singleSelectPivot);
            // Objekt NENÍ reparentován – zůstává u původního rodiče.
            // Pohyb pivotu se v change eventu aplikuje jako delta matice na objekt.
            transformControls.attach(singleSelectPivot);// Připojíme TransformControls na pivot
        }
        outlinerHighlight(object);// Zvýraznění uzlu v scene outlineru   
             
        selectionHistory.push(object); // Přidáme do historie vybraných objektů
        if (selectionHistory.length > 30) { // Omezíme velikost historie (např. 30 záznamů), aby nezabírala paměť
            selectionHistory.shift();
        }

        refreshSelectedObjGui(object);// Aktualizujeme GUI      

        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                lastSelectedMeshes.push( child );
            }
        } );
        lastSelectedMeshes.forEach( child => {
            applyEmissive(child, 0xff0000);
            if (viewProp.xrayOnSelect) applyXray(child);
        });
        console.log("selected object: ", lastSelectedObject);

    }    
    render();
}

function deselectObject() {
    if (!lastSelectedObject) return;

    // Vypneme vizuální prvky pro hlavní vybraný objekt
    clearHighlight();
    // Odpojíme transformační prvky od objektu
    if (transformControls.object) {
        transformControls.detach();
    }
    // Zničíme pivot pro single-select (objekt zůstal u původního rodiče po celou dobu)
    if (singleSelectPivot) {
        scene.remove(singleSelectPivot);
        singleSelectPivot = null;
        singleSelectPivotInitMatrix = null;
        singleSelectObjectInitMatrix = null;
    }                
    // Zničíme složku v lil-gui, pokud existuje
    if (selectedFolder) {
        selectedFolder.destroy();
        selectedFolder = null;
        guiPanels['Selected'].gui = null;
        guiPanels['Selected'].btn.classList.remove('active');
        guiPanels['Selected'].btn.style.display = 'none';
    }                
    // Volitelné: vynulování pomocných proměnných
    lastSelectedMeshes.forEach(child => { applyEmissive(child, 0x000000); clearXray(child); });

    lastSelectedMeshes.length = 0; // empty the array

    // Hide bounding box helper on deselect
    part.showBBox = false;
    if (bbHelper) {
        bbHelper.visible = false;
    }
    if (bbAxesHelper) {
        bbAxesHelper.visible = false;
    }

    lastSelectedObject = null;
    highlightObject(null); // Zrušení zvýraznění v outlineru
    outlinerHighlight(null); // Zrušení zvýraznění uzlu v scene outlineru

    setTimeout(() => { //render uvnitř setTimeout, pro deselekci objektu, kdy je nějaký objekt pod kurzorem.
        render();
    }, 100);

}

// --- Mode + Selection indicator (status bar) ---
var _modeIndicatorCache = '';
function updateModeIndicator() {
    const vp = viewProp;

    // --- Mode ---
    let modeVal, modeCls;
    if (assemblyState.editMode)      { modeVal = 'assemblyEdit'; modeCls = 'mode-assembly'; }
    else if (vp.measureMode)         { modeVal = 'measure';      modeCls = 'mode-active'; }
    else if (vp.angleMode)           { modeVal = 'angle';        modeCls = 'mode-active'; }
    else if (vp.cadDimMode)          { modeVal = 'cadDim';       modeCls = 'mode-active'; }
    else if (vp.cadDim3dMode)        { modeVal = 'cadDim3d';     modeCls = 'mode-active'; }
    else if (vp.selectDimensionMode) { modeVal = 'selectDim';    modeCls = 'mode-active'; }
    else if (vp.annotationMode)      { modeVal = 'annotation';   modeCls = 'mode-active'; }
    else if (vp.annotation3dMode)    { modeVal = 'annotation3d'; modeCls = 'mode-active'; }
    else                             { modeVal = 'navigate';     modeCls = 'mode-navigate'; }

    // --- Selection ---
    let selVal, selCls;
    if (!vp.isSelectAllowed)             { selVal = 'none';     selCls = 'mode-noselect'; }
    else if (vp.cadSelection === 'Detailed') { selVal = 'detailed'; selCls = 'mode-select'; }
    else                                     { selVal = 'cad';      selCls = 'mode-select'; }

    const key = modeVal + '|' + selVal;
    if (key === _modeIndicatorCache) return;
    _modeIndicatorCache = key;

    statusModeEl.value = modeVal;
    statusModeEl.className = 'status-select ' + modeCls;
    statusModeEl.disabled = assemblyState.editMode;
    statusSelEl.value = selVal;
    statusSelEl.className = 'status-select ' + selCls;
}

function render() {   
    updateModeIndicator();
    //console.log("viewProp.isSelectAllowed: ", viewProp.isSelectAllowed);
    // isMouseOverGui - pokud kurzor nad GUI a současně nad objektem, pak má přednost GUI.
    const _guiHitEl = document.elementFromPoint(mouse.x * window.innerWidth / 2 + window.innerWidth / 2,
                                                -mouse.y * window.innerHeight / 2 + window.innerHeight / 2);
    const isMouseOverGui = _guiHitEl && (guiWrapper.contains(_guiHitEl) || _guiHitEl.closest('.lil-gui') || _guiHitEl.closest('.ctx-menu'));
    
    // Nezvýrazňujeme objekty při dragování (rotaci/posouvání) nebo při transformaci
    if (!isTransformDragging && !isMouseOverGui && !isMouseDown && !isTouchDragging && viewProp.isSelectAllowed && !isDocOverlayBlockingInput()) {      
        raycaster.setFromCamera(mouse, currentCamera);
        // Raycasting ArrowHelper – vizualizace paprsku pro ladění
        if (viewProp.showRaycastHelper) {
            if (raycastArrowHelper) scene.remove(raycastArrowHelper);
            raycastArrowHelper = new THREE.ArrowHelper(
                raycaster.ray.direction,
                raycaster.ray.origin,
                viewProp.raycastHelperSize, // délka paprsku
                0xff0000, // červená barva
                20,      // délka šipky
                10     // šířka šipky
            );
            scene.add(raycastArrowHelper);
        }
        const intersects = raycaster.intersectObjects(meshObjects);

        // Pomocná funkce: vrací true, jen pokud je objekt i všichni jeho předci viditelní.
        const isFullyVisible = (obj) => {
            let o = obj;
            while (o) { if (!o.visible) return false; o = o.parent; }
            return true;
        };

        // Filtrujeme průsečíky, které leží na ořezané (neviditelné) straně clippingPlanes.
        // Materiály používají clipIntersection: true → fragment je NEVIDITELNÝ jen pokud leží
        // vně VŠECH rovin zároveň. Bod je tedy VIDITELNÝ pokud leží uvnitř alespoň jedné roviny
        // (distanceToPoint >= 0 pro alespoň jednu rovinu).
        // Zároveň přeskakujeme skryté objekty (visible = false).
        const visibleIntersects = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? intersects.filter(hit => isFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
            : intersects.filter(hit => isFullyVisible(hit.object));

        if (visibleIntersects.length > 0) { // Myš je nad viditelnou částí objektu
            if (INTERSECTED != visibleIntersects[0].object) { 
                // 1. Předchozímu objektu vypneme záři a helper
                if (INTERSECTED) {
                    clearHighlight();
                }   
                // 2. Nastavíme nový objekt
                INTERSECTED = visibleIntersects[0].object;
                // 3. Novému objektu zapneme záři a helper
                highlightObject(INTERSECTED);
            }
        } else { 
            // Přechod z vybraného objektu na prázdné místo
            if (INTERSECTED) {
                clearHighlight();
                INTERSECTED = null;
            }
        }
    } else if ((isMouseOverGui || isMouseDown || isTouchDragging) && INTERSECTED) {
        // Pokud je kurzor nad GUI nebo probíhá dragování, vypneme highlight
        clearHighlight();
        INTERSECTED = null;
    }

    // Pokud je selekce zakázána nebo je aktivní skupinová transformace nebo doc overlay blokuje vstup, zajistíme že nebude nic zvýrazněno
    if ((!viewProp.isSelectAllowed || isDocOverlayBlockingInput()) && INTERSECTED) {
        clearHighlight();
        INTERSECTED = null;
    }

    // Measurement hover preview – raycast for point preview when in measure mode
    // Face snap highlight – show hovered triangle during face-to-face snap mode
    if (faceSnapMode && !isMouseOverGui && !isMouseDown) {
        updateFaceSnapHighlight();
    } else if (!faceSnapMode && faceSnapHighlightMesh) {
        clearFaceSnapHighlight();
    }

    // Point-to-point snap – show hover dot preview
    if (ptpSnapMode && !isMouseOverGui && !isMouseDown) {
        raycaster.setFromCamera(mouse, currentCamera);
        const ptpIntersects = raycaster.intersectObjects(meshObjects);
        const ptpIsVis = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
        const ptpVisible = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? ptpIntersects.filter(h => ptpIsVis(h.object) && clipPlanes.some(p => p.distanceToPoint(h.point) >= 0))
            : ptpIntersects.filter(h => ptpIsVis(h.object));
        if (ptpVisible.length > 0) {
            let previewPt = ptpVisible[0].point.clone();
            if (viewProp.detectCircleCenter) {
                const c = detectCircleCenterFromHit(ptpVisible[0]);
                if (c) previewPt = c;
            }
            // Size dot relative to the hit object's bounding sphere radius
            const bsR = ptpVisible[0].object.geometry?.boundingSphere?.radius ?? 1;
            const dotR = Math.max(bsR * 0.012, 0.5);
            if (!ptpSnapDotMesh) {
                ptpSnapDotMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(1, 10, 10),
                    new THREE.MeshBasicMaterial({ color: 0x00dd44, depthTest: false })
                );
                ptpSnapDotMesh.renderOrder = 999;
                scene.add(ptpSnapDotMesh);
            }
            ptpSnapDotMesh.scale.setScalar(dotR);
            ptpSnapDotMesh.position.copy(previewPt);
            ptpSnapDotMesh.visible = true;
        } else if (ptpSnapDotMesh) {
            ptpSnapDotMesh.visible = false;
        }
    } else if (!ptpSnapMode && ptpSnapDotMesh) {
        clearPtpSnapDot();
    }

    if (viewProp.measureMode && isMeasureActive() && !isMouseOverGui && !isMouseDown) {
        raycaster.setFromCamera(mouse, currentCamera);
        const mIntersects = raycaster.intersectObjects(meshObjects);
        const mIsFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
        const mVisible = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? mIntersects.filter(hit => mIsFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
            : mIntersects.filter(hit => mIsFullyVisible(hit.object));
        if (mVisible.length > 0) {
            let previewPoint = mVisible[0].point;
            if (viewProp.detectCircleCenter) {
                const center = detectCircleCenterFromHit(mVisible[0]);
                if (center) previewPoint = center;
            }
            updateMeasurePreview(previewPoint);
        } else {
            updateMeasurePreview(null);
        }
    } else {
        updateMeasurePreview(null);
    }

    // Angle measurement hover preview
    if (viewProp.angleMode && isAngleActive() && !isMouseOverGui && !isMouseDown) {
        raycaster.setFromCamera(mouse, currentCamera);
        const aIntersects = raycaster.intersectObjects(meshObjects);
        const aIsFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
        const aVisible = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? aIntersects.filter(hit => aIsFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
            : aIntersects.filter(hit => aIsFullyVisible(hit.object));
        if (aVisible.length > 0) {
            let previewPoint = aVisible[0].point;
            if (viewProp.detectCircleCenter) {
                const center = detectCircleCenterFromHit(aVisible[0]);
                if (center) previewPoint = center;
            }
            updateAnglePreview(previewPoint);
        } else {
            updateAnglePreview(null);
        }
    } else {
        updateAnglePreview(null);
    }

    // CAD dimension preview
    if (viewProp.cadDimMode && isCadDimActive() && !isMouseOverGui) {
        const cdStep = getCadDimStep();
        if (cdStep < 2) {
            // Phases 0 & 1: surface hover marker + dashed line from p1
            if (!isMouseDown) {
                raycaster.setFromCamera(mouse, currentCamera);
                const cdIntersects = raycaster.intersectObjects(meshObjects);
                const cdIsFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
                const cdVisible = (renderer.localClippingEnabled && clipPlanes.length > 0)
                    ? cdIntersects.filter(hit => cdIsFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
                    : cdIntersects.filter(hit => cdIsFullyVisible(hit.object));
                if (cdVisible.length > 0) {
                    let pt = cdVisible[0].point;
                    if (viewProp.detectCircleCenter) {
                        const center = detectCircleCenterFromHit(cdVisible[0]);
                        if (center) pt = center;
                    }
                    updateCadDimHoverPreview(pt);
                } else {
                    updateCadDimHoverPreview(null);
                }
            }
        } else {
            // Phase 2: placement preview driven by mouse position
            updateCadDimPreview(mouse, currentCamera);
        }
    } else {
        updateCadDimHoverPreview(null);
    }
    _updateCadDimHintUI();

    // CAD dimension 3D preview
    if (viewProp.cadDim3dMode && isCadDim3dActive() && !isMouseOverGui) {
        const cdStep3d = getCadDim3dStep();
        if (cdStep3d < 2) {
            if (!isMouseDown) {
                raycaster.setFromCamera(mouse, currentCamera);
                const cd3dIntersects = raycaster.intersectObjects(meshObjects);
                const cd3dIsFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
                const cd3dVisible = (renderer.localClippingEnabled && clipPlanes.length > 0)
                    ? cd3dIntersects.filter(hit => cd3dIsFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
                    : cd3dIntersects.filter(hit => cd3dIsFullyVisible(hit.object));
                if (cd3dVisible.length > 0) {
                    let pt3d = cd3dVisible[0].point;
                    if (viewProp.detectCircleCenter) {
                        const center = detectCircleCenterFromHit(cd3dVisible[0]);
                        if (center) pt3d = center;
                    }
                    updateCadDim3dHoverPreview(pt3d);
                } else {
                    updateCadDim3dHoverPreview(null);
                }
            }
        } else {
            updateCadDim3dPreview(mouse, currentCamera);
        }
    } else {
        updateCadDim3dHoverPreview(null);
    }
    _updateCadDim3dHintUI();

    // Annotation hover preview – CSS2D (regular mode or add-leader mode)
    if ((viewProp.annotationMode && isAnnotationActive() || isAddLeaderLineActive()) && !isMouseOverGui && !isMouseDown) {
        raycaster.setFromCamera(mouse, currentCamera);
        const nIntersects = raycaster.intersectObjects(meshObjects);
        const nIsFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
        const nVisible = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? nIntersects.filter(hit => nIsFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
            : nIntersects.filter(hit => nIsFullyVisible(hit.object));
        if (nVisible.length > 0) {
            updateAnnotationPreview(nVisible[0].point);
        } else {
            // When pending anchor exists, show preview in empty space at same depth
            const pending = getAnnotationPendingPoint();
            if (pending) {
                const pendingNDC = pending.clone().project(currentCamera);
                const cursorNDC = new THREE.Vector3(mouse.x, mouse.y, pendingNDC.z);
                updateAnnotationPreview(cursorNDC.unproject(currentCamera));
            } else {
                updateAnnotationPreview(null);
            }
        }
    } else {
        updateAnnotationPreview(null);
    }

    // Annotation hover preview – CSS3D (regular mode or add-leader mode)
    if ((viewProp.annotation3dMode && isAnnotation3dActive() || isAddLeaderLine3dActive()) && !isMouseOverGui && !isMouseDown) {
        raycaster.setFromCamera(mouse, currentCamera);
        const n3Intersects = raycaster.intersectObjects(meshObjects);
        const n3IsFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
        const n3Visible = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? n3Intersects.filter(hit => n3IsFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
            : n3Intersects.filter(hit => n3IsFullyVisible(hit.object));
        if (n3Visible.length > 0) {
            updateAnnotation3dPreview(n3Visible[0].point);
        } else {
            const pending3 = getAnnotation3dPendingPoint();
            if (pending3) {
                const pendingNDC3 = pending3.clone().project(currentCamera);
                const cursorNDC3 = new THREE.Vector3(mouse.x, mouse.y, pendingNDC3.z);
                updateAnnotation3dPreview(cursorNDC3.unproject(currentCamera));
            } else {
                updateAnnotation3dPreview(null);
            }
        }
    } else {
        updateAnnotation3dPreview(null);
    }
    
    // Pokud se objekty ve scéně hýbou, odkomentuj řádek níže pro plynulý rámeček:
    // if (selectionHelper && selectionHelper.visible) selectionHelper.update();

    updateMarkerScales(currentCamera);
    updateAnnotationMarkerScales(currentCamera);
    updateAnnotation3dMarkerScales(currentCamera);
    updateAnnotation3dOrientations(currentCamera);
    updateCadDim3dMarkerScales(currentCamera);
    updateCadDim3dOrientations(currentCamera);

    if (cameraProspHelperObject) cameraProspHelperObject.update();
    if (cameraOrthoHelperObject) cameraOrthoHelperObject.update();
    lightHelperObjects.forEach(h => h.update());

    // Dynamicky rozšíří far aktivní kamery, pokud helper druhé kamery přesahuje frustum
    if (cameraProspHelperObject || cameraOrthoHelperObject) ensureCameraFarCoversHelpers();

    renderer.render(scene, currentCamera);
    if (viewHelper) {
        renderer.autoClear = false;
        viewHelper.render(renderer);
        renderer.autoClear = true;
    }
    if (css2DRenderer) css2DRenderer.render(scene, currentCamera);
    if (css3DRenderer) css3DRenderer.render(scene, currentCamera);
}

// ViewHelper animation loop (runs only while the gizmo is animating a view transition)
const _vhClock = new THREE.Clock();
function viewHelperAnimate() {
    if (!viewHelper || !viewHelper.animating) return;
    requestAnimationFrame(viewHelperAnimate);
    viewHelper.update(_vhClock.getDelta());
    render();
}


function onMouseMove( event ) {	
    event.preventDefault();			
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components				
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;				
    render();
}

function onMouseDown( event ) {
    // Uložíme pozici myši při stisku tlačítka
    mouseDownPos.x = event.clientX;
    mouseDownPos.y = event.clientY;
    isMouseDown = true;
}

function clearFaceSnapHighlight() {
    if (faceSnapHighlightMesh) {
        scene.remove(faceSnapHighlightMesh);
        faceSnapHighlightMesh.geometry.dispose();
        faceSnapHighlightMesh = null;
    }
}

function updateFaceSnapHighlight() {
    if (!faceSnapMode) { clearFaceSnapHighlight(); return; }

    raycaster.setFromCamera(mouse, currentCamera);
    const fsIntersects = raycaster.intersectObjects(meshObjects);
    const fsIsFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
    const fsVisible = (renderer.localClippingEnabled && clipPlanes.length > 0)
        ? fsIntersects.filter(hit => fsIsFullyVisible(hit.object) && clipPlanes.some(p => p.distanceToPoint(hit.point) >= 0))
        : fsIntersects.filter(hit => fsIsFullyVisible(hit.object));

    if (!fsVisible.length || !fsVisible[0].face) { clearFaceSnapHighlight(); return; }

    const hit = fsVisible[0];
    const geom = hit.object.geometry;
    if (!geom || !geom.attributes.position) { clearFaceSnapHighlight(); return; }

    const posAttr = geom.attributes.position;
    const face = hit.face;

    // Get the 3 vertices in world space
    const va = new THREE.Vector3().fromBufferAttribute(posAttr, face.a).applyMatrix4(hit.object.matrixWorld);
    const vb = new THREE.Vector3().fromBufferAttribute(posAttr, face.b).applyMatrix4(hit.object.matrixWorld);
    const vc = new THREE.Vector3().fromBufferAttribute(posAttr, face.c).applyMatrix4(hit.object.matrixWorld);

    // Offset slightly along world-space face normal to prevent z-fighting
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
    const worldNormal = face.normal.clone().applyMatrix3(normalMatrix).normalize();
    const offset = worldNormal.multiplyScalar(0.002 * Math.max(
        va.distanceTo(vb), vb.distanceTo(vc), vc.distanceTo(va)
    ));
    va.add(offset); vb.add(offset); vc.add(offset);

    // Reuse or create highlight mesh
    if (!faceSnapHighlightMesh) {
        const triGeo = new THREE.BufferGeometry();
        triGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(9), 3));
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffdd00, transparent: true, opacity: 0.55,
            side: THREE.DoubleSide, depthTest: false
        });
        faceSnapHighlightMesh = new THREE.Mesh(triGeo, mat);
        faceSnapHighlightMesh.renderOrder = 999;
        scene.add(faceSnapHighlightMesh);
    }

    const positions = faceSnapHighlightMesh.geometry.attributes.position;
    positions.setXYZ(0, va.x, va.y, va.z);
    positions.setXYZ(1, vb.x, vb.y, vb.z);
    positions.setXYZ(2, vc.x, vc.y, vc.z);
    positions.needsUpdate = true;
    faceSnapHighlightMesh.geometry.computeBoundingSphere();
}

function startFaceSnapMode() {    faceSnapMode = true;
    faceSnapStep = 0;
    faceSnapSourcePoint = null;
    faceSnapSourceNormal = null;
    faceSnapSourceObject = null;
    if (faceSnapArrow) { scene.remove(faceSnapArrow); faceSnapArrow = null; }
    clearFaceSnapHighlight();
    _updateFaceSnapHintUI();
    render();
}

function cancelFaceSnapMode() {
    faceSnapMode = false;
    faceSnapStep = 0;
    faceSnapSourcePoint = null;
    faceSnapSourceNormal = null;
    faceSnapSourceObject = null;
    if (faceSnapArrow) { scene.remove(faceSnapArrow); faceSnapArrow = null; }
    clearFaceSnapHighlight();
    _updateFaceSnapHintUI();
    render();
}

function clearPtpSnapDot() {
    if (ptpSnapDotMesh) {
        scene.remove(ptpSnapDotMesh);
        ptpSnapDotMesh.geometry.dispose();
        ptpSnapDotMesh = null;
    }
}

function startPtpSnapMode() {
    ptpSnapMode = true;
    ptpSnapStep = 0;
    ptpSnapSourcePoint = null;
    ptpSnapSourceObject = null;
    clearPtpSnapDot();
    statusCircleDetectEl.style.display = '';
    _updatePtpSnapHintUI();
    render();
}

function cancelPtpSnapMode() {
    ptpSnapMode = false;
    ptpSnapStep = 0;
    ptpSnapSourcePoint = null;
    ptpSnapSourceObject = null;
    clearPtpSnapDot();
    statusCircleDetectEl.style.display = 'none';
    viewProp.detectCircleCenter = false;
    statusCircleDetectCb.checked = false;
    _updatePtpSnapHintUI();
    render();
}

function onMouseUp( event ) {
    isMouseDown = false;
}

function onClick( event ) {		
    // ViewHelper – intercept clicks on the orientation gizmo
    if (viewHelper && viewHelper.handleClick(event)) {
        viewHelperAnimate();
        return;
    }

    // Pokud je kliknuto na GUI prvek, ignorujeme raycast pro selekci
    if (isMouseOnGUI(event)) {
        return;
    }
    // Pokud je kliknuto na kontextové menu, ignorujeme selekci
    const elAtClick = document.elementFromPoint(event.clientX, event.clientY);
    if (elAtClick && elAtClick.closest('.ctx-menu')) {
        return;
    }
    // Příznak nastavený při kliknutí na položku kontextového menu (menu je v okamžiku onClick již skryté)
    if (_suppressNextClick) {
        _suppressNextClick = false;
        return;
    }

    // --- Measurement mode ---
    if (viewProp.measureMode && isMeasureActive()) {
        // Umožníme drag-detekci i v měřicím režimu
        mouseUpPos.x = event.clientX;
        mouseUpPos.y = event.clientY;
        const dragDistance = mouseDownPos.distanceTo(mouseUpPos);
        if (dragDistance > 3) return;

        raycaster.setFromCamera(mouse, currentCamera);
        const intersects = raycaster.intersectObjects(meshObjects);
        const isFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
        const visibleIntersects = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? intersects.filter(hit => isFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
            : intersects.filter(hit => isFullyVisible(hit.object));
        if (visibleIntersects.length > 0) {
            let point = visibleIntersects[0].point;
            if (viewProp.detectCircleCenter) {
                const center = detectCircleCenterFromHit(visibleIntersects[0]);
                if (center) point = center;
            }
            const hitOwner = resolveCADSelection(visibleIntersects[0].object);
            addMeasurePoint(point, hitOwner, render);
        }
        return;
    }

    // --- Angle measurement mode ---
    if (viewProp.angleMode && isAngleActive()) {
        mouseUpPos.x = event.clientX;
        mouseUpPos.y = event.clientY;
        const dragDistance = mouseDownPos.distanceTo(mouseUpPos);
        if (dragDistance > 3) return;

        raycaster.setFromCamera(mouse, currentCamera);
        const intersects = raycaster.intersectObjects(meshObjects);
        const isFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
        const visibleIntersects = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? intersects.filter(hit => isFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
            : intersects.filter(hit => isFullyVisible(hit.object));
        if (visibleIntersects.length > 0) {
            let point = visibleIntersects[0].point;
            if (viewProp.detectCircleCenter) {
                const center = detectCircleCenterFromHit(visibleIntersects[0]);
                if (center) point = center;
            }
            const hitOwner = resolveCADSelection(visibleIntersects[0].object);
            addAnglePoint(point, hitOwner, render);
        }
        return;
    }

    // --- CAD Dimension mode ---
    if (viewProp.cadDimMode && isCadDimActive()) {
        mouseUpPos.x = event.clientX;
        mouseUpPos.y = event.clientY;
        const dragDistance = mouseDownPos.distanceTo(mouseUpPos);
        if (dragDistance > 3) return;

        const step = getCadDimStep();
        if (step < 2) {
            // Phases 0 & 1: raycast surface to pick measurement points
            raycaster.setFromCamera(mouse, currentCamera);
            const intersects = raycaster.intersectObjects(meshObjects);
            const isFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
            const visibleIntersects = (renderer.localClippingEnabled && clipPlanes.length > 0)
                ? intersects.filter(hit => isFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
                : intersects.filter(hit => isFullyVisible(hit.object));
            if (visibleIntersects.length > 0) {
                let point = visibleIntersects[0].point;
                if (viewProp.detectCircleCenter) {
                    const center = detectCircleCenterFromHit(visibleIntersects[0]);
                    if (center) point = center;
                }
                const hitOwner = resolveCADSelection(visibleIntersects[0].object);
                addCadDimPoint(point, hitOwner, render);
                // If we just entered phase 2, show hint (orbit stays enabled)
                if (getCadDimStep() === 2) {
                    _updateCadDimHintUI();
                }
            }
        } else {
            // Phase 2: place the dimension at the current mouse position
            placeCadDim(render);
            orbitControls.enabled = true;
            _updateCadDimHintUI();
        }
        return;
    }

    // --- CAD Dimension 3D mode ---
    if (viewProp.cadDim3dMode && isCadDim3dActive()) {
        mouseUpPos.x = event.clientX;
        mouseUpPos.y = event.clientY;
        const dragDistance = mouseDownPos.distanceTo(mouseUpPos);
        if (dragDistance > 3) return;

        const step3d = getCadDim3dStep();
        if (step3d < 2) {
            raycaster.setFromCamera(mouse, currentCamera);
            const cd3dIntersects = raycaster.intersectObjects(meshObjects);
            const cd3dIsFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
            const cd3dVisible = (renderer.localClippingEnabled && clipPlanes.length > 0)
                ? cd3dIntersects.filter(hit => cd3dIsFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
                : cd3dIntersects.filter(hit => cd3dIsFullyVisible(hit.object));
            if (cd3dVisible.length > 0) {
                let point3d = cd3dVisible[0].point;
                if (viewProp.detectCircleCenter) {
                    const center = detectCircleCenterFromHit(cd3dVisible[0]);
                    if (center) point3d = center;
                }
                const hitOwner3d = resolveCADSelection(cd3dVisible[0].object);
                addCadDim3dPoint(point3d, hitOwner3d, render);
                if (getCadDim3dStep() === 2) {
                    _updateCadDim3dHintUI();
                }
            }
        } else {
            placeCadDim3d(render);
            orbitControls.enabled = true;
            _updateCadDim3dHintUI();
        }
        return;
    }
    if (isAddLeaderLineActive()) {
        mouseUpPos.x = event.clientX;
        mouseUpPos.y = event.clientY;
        if (mouseDownPos.distanceTo(mouseUpPos) > 3) return;
        raycaster.setFromCamera(mouse, currentCamera);
        const _llIntersects = raycaster.intersectObjects(meshObjects);
        const _llVisible = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? _llIntersects.filter(h => { let o = h.object; while (o) { if (!o.visible) return false; o = o.parent; } return clipPlanes.some(p => p.distanceToPoint(h.point) >= 0); })
            : _llIntersects.filter(h => { let o = h.object; while (o) { if (!o.visible) return false; o = o.parent; } return true; });
        if (_llVisible.length > 0) {
            commitAddLeaderLine(_llVisible[0].point, _llVisible[0].object, render);
        }
        return;
    }

    // --- Add leader line mode – CSS3D (from context menu) ---
    if (isAddLeaderLine3dActive()) {
        mouseUpPos.x = event.clientX;
        mouseUpPos.y = event.clientY;
        if (mouseDownPos.distanceTo(mouseUpPos) > 3) return;
        raycaster.setFromCamera(mouse, currentCamera);
        const _ll3Intersects = raycaster.intersectObjects(meshObjects);
        const _ll3Visible = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? _ll3Intersects.filter(h => { let o = h.object; while (o) { if (!o.visible) return false; o = o.parent; } return clipPlanes.some(p => p.distanceToPoint(h.point) >= 0); })
            : _ll3Intersects.filter(h => { let o = h.object; while (o) { if (!o.visible) return false; o = o.parent; } return true; });
        if (_ll3Visible.length > 0) {
            commitAddLeaderLine3d(_ll3Visible[0].point, _ll3Visible[0].object, render);
        }
        return;
    }

    // --- Annotation mode – CSS2D ---
    if (viewProp.annotationMode && isAnnotationActive()) {
        mouseUpPos.x = event.clientX;
        mouseUpPos.y = event.clientY;
        const dragDistance = mouseDownPos.distanceTo(mouseUpPos);
        if (dragDistance > 3) return;

        raycaster.setFromCamera(mouse, currentCamera);
        const intersects = raycaster.intersectObjects(meshObjects);
        const isFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
        const visibleIntersects = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? intersects.filter(hit => isFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
            : intersects.filter(hit => isFullyVisible(hit.object));
        if (visibleIntersects.length > 0) {
            const point = visibleIntersects[0].point;
            const hitOwner = resolveCADSelection(visibleIntersects[0].object);
            addAnnotationPoint(point, hitOwner, render);
        } else {
            // Second click: allow placing label in empty space (project mouse to same depth as anchor)
            const pending = getAnnotationPendingPoint();
            if (pending) {
                const pendingNDC = pending.clone().project(currentCamera);
                const clickNDC = new THREE.Vector3(mouse.x, mouse.y, pendingNDC.z);
                const worldPoint = clickNDC.unproject(currentCamera);
                addAnnotationPoint(worldPoint, null, render);
            }
        }
        return;
    }

    // --- Annotation mode – CSS3D ---
    if (viewProp.annotation3dMode && isAnnotation3dActive()) {
        mouseUpPos.x = event.clientX;
        mouseUpPos.y = event.clientY;
        const dragDistance = mouseDownPos.distanceTo(mouseUpPos);
        if (dragDistance > 3) return;

        raycaster.setFromCamera(mouse, currentCamera);
        const intersects3d = raycaster.intersectObjects(meshObjects);
        const isFullyVisible3d = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
        const visibleIntersects3d = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? intersects3d.filter(hit => isFullyVisible3d(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
            : intersects3d.filter(hit => isFullyVisible3d(hit.object));
        if (visibleIntersects3d.length > 0) {
            const point = visibleIntersects3d[0].point;
            const hitOwner = resolveCADSelection(visibleIntersects3d[0].object);
            addAnnotation3dPoint(point, hitOwner, render);
        } else {
            // Second click: allow placing label in empty space
            const pending3d = getAnnotation3dPendingPoint();
            if (pending3d) {
                const pendingNDC3d = pending3d.clone().project(currentCamera);
                const clickNDC3d = new THREE.Vector3(mouse.x, mouse.y, pendingNDC3d.z);
                const worldPoint3d = clickNDC3d.unproject(currentCamera);
                addAnnotation3dPoint(worldPoint3d, null, render);
            }
        }
        return;
    }

    // --- Face-to-face snap mode ---
    if (faceSnapMode) {
        mouseUpPos.x = event.clientX;
        mouseUpPos.y = event.clientY;
        if (mouseDownPos.distanceTo(mouseUpPos) > 3) return;

        raycaster.setFromCamera(mouse, currentCamera);
        const fsIntersects = raycaster.intersectObjects(meshObjects);
        const fsIsFullyVisible = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
        const fsVisible = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? fsIntersects.filter(hit => fsIsFullyVisible(hit.object) && clipPlanes.some(p => p.distanceToPoint(hit.point) >= 0))
            : fsIntersects.filter(hit => fsIsFullyVisible(hit.object));

        if (fsVisible.length === 0 || !fsVisible[0].face) {
            if (faceSnapStep === 0) alert('First select the object to move.');
            return;
        }
        const hit = fsVisible[0];

        if (faceSnapStep === 0) {
            // Step 0: pick source face + set source object from hit
            // Use currently selected object (may be a group), fall back to hit resolution
            faceSnapSourceObject = lastSelectedObject || resolveCADSelection(hit.object);
            faceSnapSourcePoint = hit.point.clone();
            const normalMatrix0 = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
            faceSnapSourceNormal = hit.face.normal.clone().applyMatrix3(normalMatrix0).normalize();

            // Visual: blue arrow along source face normal
            if (faceSnapArrow) scene.remove(faceSnapArrow);
            const box3 = new THREE.Box3().setFromObject(faceSnapSourceObject);
            const arrowLen = Math.max(box3.getSize(new THREE.Vector3()).length() * 0.15, 1);
            faceSnapArrow = new THREE.ArrowHelper(faceSnapSourceNormal, faceSnapSourcePoint, arrowLen, 0x1188ff, arrowLen * 0.25, arrowLen * 0.15);
            scene.add(faceSnapArrow);

            faceSnapStep = 1;
            clearFaceSnapHighlight();
            _updateFaceSnapHintUI();
            render();
        } else {
            // Step 1: pick target face – compute & apply translation
            const targetPoint = hit.point.clone();
            const normalMatrix1 = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
            const targetNormal = hit.face.normal.clone().applyMatrix3(normalMatrix1).normalize();

            // Project (targetPoint − sourcePoint) onto target normal to get flush offset
            const diff = new THREE.Vector3().subVectors(targetPoint, faceSnapSourcePoint);
            const offset = diff.dot(targetNormal);
            const worldTranslation = targetNormal.clone().multiplyScalar(offset);

            // Apply translation in world space, then convert back to parent-local space
            const obj = faceSnapSourceObject;
            savePreviousTransformState(); // for undo
            obj.updateWorldMatrix(true, false);
            const worldPos = new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld);
            worldPos.add(worldTranslation);
            if (obj.parent) {
                obj.parent.updateWorldMatrix(true, false);
                const invParent = new THREE.Matrix4().copy(obj.parent.matrixWorld).invert();
                worldPos.applyMatrix4(invParent);
            }
            obj.position.copy(worldPos);
            obj.updateWorldMatrix(false, true); // force update before section line recompute

            // Refresh section lines after move
            if (viewProp.showCrossSection) updateCrossSectionLines();
            if (viewProp.sectionCrossLines) updateSectionCrossLines();

            // Record in assembly edit mode
            if (assemblyState.editMode && assemblyState.currentStepIndex >= 0 && previousTransformState) {
                recordAssemblyTransformation();
            }

            cancelFaceSnapMode();
        }
        return;
    }

    // --- Point-to-point snap mode ---
    if (ptpSnapMode) {
        mouseUpPos.x = event.clientX;
        mouseUpPos.y = event.clientY;
        if (mouseDownPos.distanceTo(mouseUpPos) > 3) return;

        raycaster.setFromCamera(mouse, currentCamera);
        const ptpIntersects = raycaster.intersectObjects(meshObjects);
        const ptpIsVis = (obj) => { let o = obj; while (o) { if (!o.visible) return false; o = o.parent; } return true; };
        const ptpVisible = (renderer.localClippingEnabled && clipPlanes.length > 0)
            ? ptpIntersects.filter(h => ptpIsVis(h.object) && clipPlanes.some(p => p.distanceToPoint(h.point) >= 0))
            : ptpIntersects.filter(h => ptpIsVis(h.object));

        if (ptpVisible.length === 0) {
            if (ptpSnapStep === 0) alert('First click the source point on the object to move.');
            return;
        }
        const ptpHit = ptpVisible[0];
        let ptpPoint = ptpHit.point.clone();
        if (viewProp.detectCircleCenter) {
            const c = detectCircleCenterFromHit(ptpHit);
            if (c) ptpPoint = c;
        }

        if (ptpSnapStep === 0) {
            // Step 0: record source object + point; show green dot anchor
            // Use the currently selected object (may be a group), fall back to hit resolution
            ptpSnapSourceObject = lastSelectedObject || resolveCADSelection(ptpHit.object);
            ptpSnapSourcePoint = ptpPoint;

            // Leave the dot visible as anchor marker
            clearPtpSnapDot();
            const bsR = ptpHit.object.geometry?.boundingSphere?.radius ?? 1;
            const dotR = Math.max(bsR * 0.012, 0.5);
            ptpSnapDotMesh = new THREE.Mesh(
                new THREE.SphereGeometry(1, 10, 10),
                new THREE.MeshBasicMaterial({ color: 0x00dd44, depthTest: false })
            );
            ptpSnapDotMesh.renderOrder = 999;
            ptpSnapDotMesh.scale.setScalar(dotR);
            ptpSnapDotMesh.position.copy(ptpSnapSourcePoint);
            scene.add(ptpSnapDotMesh);

            ptpSnapStep = 1;
            _updatePtpSnapHintUI();
            render();
        } else {
            // Step 1: compute full 3D translation (target – source) and apply
            const targetPoint = ptpPoint;
            const worldTranslation = new THREE.Vector3().subVectors(targetPoint, ptpSnapSourcePoint);

            const obj = ptpSnapSourceObject;
            savePreviousTransformState();
            obj.updateWorldMatrix(true, false);
            const worldPos = new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld);
            worldPos.add(worldTranslation);
            if (obj.parent) {
                obj.parent.updateWorldMatrix(true, false);
                const invParent = new THREE.Matrix4().copy(obj.parent.matrixWorld).invert();
                worldPos.applyMatrix4(invParent);
            }
            obj.position.copy(worldPos);
            obj.updateWorldMatrix(false, true); // force update before section line recompute

            // Refresh section lines after move
            if (viewProp.showCrossSection) updateCrossSectionLines();
            if (viewProp.sectionCrossLines) updateSectionCrossLines();

            if (assemblyState.editMode && assemblyState.currentStepIndex >= 0 && previousTransformState) {
                recordAssemblyTransformation();
            }

            cancelPtpSnapMode();
        }
        return;
    }

    // Pokud je selekce zakázána v GUI, ignorujeme click
    if (!viewProp.isSelectAllowed) return;
    if (isDocOverlayBlockingInput()) return;

    // Pokud právě probíhá drag transformací, ignorujeme click
    if (isTransformDragging) return;

    // Uložíme pozici myši při uvolnění tlačítka
    mouseUpPos.x = event.clientX;
    mouseUpPos.y = event.clientY;

    // Vypočítáme vzdálenost mezi pozicí při stisku a uvolnění
    const dragDistance = mouseDownPos.distanceTo(mouseUpPos);

    // Pokud byla myš posunuta více než 3 pixely, považujeme to za drag (ne click)
    if (dragDistance > 3) {
        return; // Ignorujeme selekci při dragování
    }

    // Čerstvý raycast – INTERSECTED mohl být smazán během mousedown (isMouseDown=true blokuje render highlight)
    const clickTarget = getFreshRaycastTarget();

    // Ctrl+click: přidat / odebrat objekt do/z skupiny
    if (event.ctrlKey && clickTarget) {
        toggleObjectInMultiSelect(resolveCADSelection(clickTarget));
        return;
    }

    // Normální selekce – zakázaná, pokud je skupina aktivní
    if (viewProp.isGroupTransformActive) {
        if (clickTarget) {
            // Vyčistíme předchozí emissivní zvýraznění
            lastSelectedMeshes.forEach(child => { applyEmissive(child, 0x000000); clearXray(child); });
            lastSelectedMeshes.length = 0;
            lastSelectedObject = resolveCADSelection(clickTarget);
            // Aplikujeme emissivní zvýraznění na nový objekt
            lastSelectedObject.traverse(child => { if (child.isMesh) lastSelectedMeshes.push(child); });
            lastSelectedMeshes.forEach(child => { applyEmissive(child, 0xff0000); if (viewProp.xrayOnSelect) applyXray(child); });
            outlinerHighlight(lastSelectedObject);
            render();
        } else {
            // Prázdné místo – zruš vybraný objekt, group ponech
            lastSelectedMeshes.forEach(child => { applyEmissive(child, 0x000000); clearXray(child); });
            lastSelectedMeshes.length = 0;
            lastSelectedObject = null;
            outlinerHighlight(null);
            render();
        }
        return;
    }

    if (clickTarget) {
        INTERSECTED = clickTarget;
        selectObject(resolveCADSelection(clickTarget));
    } else {
        INTERSECTED = null;
        deselectObject();
        selectionHistory.length = 0;
        clearHistoryPreviewHelpers();
        if (selectedObjects.length > 0) {
            addCurrentGroupToHistory();
            clearMultiSelect();
        }
    }
}

function onTouchStart( event ) {
    if (event.touches.length === 1) {
        // Single touch - simulujeme mousemove a uložíme pozici
        const touch = event.touches[0];
        touchStartPos.x = touch.clientX;
        touchStartPos.y = touch.clientY;
        isTouchDragging = false;
        mouse.x = ( touch.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( touch.clientY / window.innerHeight ) * 2 + 1;

        // Edit Labels touch drag
        if (viewProp.selectDimensionMode && isSelectDimActive()) {
            selectDimTouchStart(touch.clientX, touch.clientY);
        }

        render();
    }
}

function onTouchMove( event ) {
    if (event.touches.length === 1) {
        // Single touch move - simulujeme mousemove
        const touch = event.touches[0];
        
        // Zjistíme, zda dochází k dragování
        const currentPos = new THREE.Vector2(touch.clientX, touch.clientY);
        const distance = touchStartPos.distanceTo(currentPos);
        if (distance > 3) {
            isTouchDragging = true;
        }
        
        mouse.x = ( touch.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( touch.clientY / window.innerHeight ) * 2 + 1;

        // Edit Labels touch drag
        if (viewProp.selectDimensionMode && isSelectDimActive()) {
            if (selectDimTouchMove(touch.clientX, touch.clientY)) {
                event.preventDefault(); // prevent scroll while dragging a dim label
            }
        }

        render();
    }
}

function isMouseOnGUI(event) { // return: true/false
    const element = document.elementFromPoint(event.clientX, event.clientY);
    return guiWrapper.contains(element);
}

// Provádí čerstvý raycast a vrací nejblíže ležící viditelný mesh pod kurzorem, nebo null.
function getFreshRaycastTarget() {
    raycaster.setFromCamera(mouse, currentCamera);
    const intersects = raycaster.intersectObjects(meshObjects);
    const isFullyVisible = (obj) => {
        let o = obj;
        while (o) { if (!o.visible) return false; o = o.parent; }
        return true;
    };
    const visible = (renderer.localClippingEnabled && clipPlanes.length > 0)
        ? intersects.filter(hit => isFullyVisible(hit.object) && clipPlanes.some(plane => plane.distanceToPoint(hit.point) >= 0))
        : intersects.filter(hit => isFullyVisible(hit.object));
    return visible.length > 0 ? visible[0].object : null;
}

function isTouchOnGUI(event) { // return: true/false
    if (event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const elementAtTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        return guiWrapper.contains(elementAtTouch);
    }
    return false;
}

function onTouchEnd( event ) {
    if (event.changedTouches.length > 0) {
        // Uložíme pozici dotyku při ukončení
        const touch = event.changedTouches[0];
        touchEndPos.x = touch.clientX;
        touchEndPos.y = touch.clientY;

        // Vypočítáme vzdálenost mezi počáteční a koncovou pozicí
        const dragDistance = touchStartPos.distanceTo(touchEndPos);

        // End any active Edit Labels drag regardless of distance
        if (viewProp.selectDimensionMode && isSelectDimActive()) {
            selectDimTouchEnd();
        }

        // Selekce pouze pokud nedocházelo k dragování (vzdálenost < 10 pixelů)
        if (dragDistance > 10 || isTouchDragging) {
            isTouchDragging = false;
            return; // Ignorujeme selekci při dragování
        }

        // All touches ended - simulujeme click pro selekci
        if (!viewProp.isSelectAllowed) return;
        if (viewProp.isGroupTransformActive) return;
        if (isDocOverlayBlockingInput()) return;
        if (isTransformDragging) return;

        // Pokud je dotykem stisknuto na GUI prvek, ignorujeme raycast pro selekci
        if (isTouchOnGUI(event)) {
            return;
        }

        if (suppressTouchEndOnce) {
            suppressTouchEndOnce = false;
            isTouchDragging = false;
            return;
        }

        // Pokud se dotyk ukončil na kontextovém menu, neměníme selekci (click se teprve spustí)
        const elAtTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        if (elAtTouch && elAtTouch.closest('.ctx-menu')) {
            isTouchDragging = false;
            return;
        }

        // Čerstvý raycast – stejný důvod jako u onClick (INTERSECTED mohl být smazán)
        const touchTarget = getFreshRaycastTarget();
        if (touchTarget) {
            INTERSECTED = touchTarget;
            selectObject(resolveCADSelection(touchTarget));
            // Po výběru objektu se může GUI panel "Selected" zobrazit přesně na místě dotyku.
            // Prohlížeč po touchend vygeneruje syntetický click na prvku na té pozici – zachytíme
            // ho v capture fázi a potlačíme, pokud míří na guiContainer (button { pointer-events: auto }
            // by jinak přebil pointer-events: none na kontejneru).
            const blockUntil = Date.now() + 400;
            const blockGuiClick = (e) => {
                if (guiContainer.contains(e.target)) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                if (Date.now() >= blockUntil) {
                    document.removeEventListener('click', blockGuiClick, true);
                }
            };
            document.addEventListener('click', blockGuiClick, true);
            setTimeout(() => document.removeEventListener('click', blockGuiClick, true), 400);
        } else {
            INTERSECTED = null;
            deselectObject();
            selectionHistory.length = 0;
            clearHistoryPreviewHelpers();
            if (selectedObjects.length > 0) {
                addCurrentGroupToHistory();
                clearMultiSelect();
            }
        }
        
        isTouchDragging = false;
    }
}


function saveArrayBuffer(buffer, filename) {
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

function exportAllModelsStl() {
    if (loadedModels.length === 0) {
        console.warn('Žádné modely k exportu.');
        return;
    }
    const baseName = fileNameInput.value.trim() || (loadedModels[0]?.userData?.fileName?.replace(/\.[^.]+$/, '') ?? 'export_all');
    const input = window.prompt('File name (.stl will be added):', baseName);
    if (input === null) return;
    const finalName = (input.trim() || baseName).replace(/\.stl$/i, '') + '.stl';
    const fmt = window.prompt('Export format:\n  b = binary\n  a = ASCII', 'b');
    if (fmt === null) return;
    const binary = fmt.trim().toLowerCase() !== 'a';

    const exporter = new STLExporter();
    const group = new THREE.Group();
    loadedModels.forEach(model => group.add(model.clone(true)));

    const result = exporter.parse(group, { binary });
    if (binary) {
        saveArrayBuffer(result, finalName);
    } else {
        const blob = new Blob([result], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = finalName;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    console.log(`[STL Export] "${finalName}" (${binary ? 'binary' : 'ASCII'}) hotovo.`);
}

function exportSelectedObjectStl() {
    // --- Multi-select group case ---
    if (!lastSelectedObject && selectedObjects.length > 0) {
        const defaultName = selectedObjects[0].name || 'group';
        const input = window.prompt('File name (.stl will be added):', defaultName);
        if (input === null) return;
        const finalName = (input.trim() || defaultName).replace(/\.stl$/i, '') + '.stl';
        const fmt = window.prompt('Export format:\n  b = binary\n  a = ASCII', 'b');
        if (fmt === null) return;
        const binary = fmt.trim().toLowerCase() !== 'a';

        const exporter = new STLExporter();
        const group = new THREE.Group();
        selectedObjects.forEach(obj => {
            const clone = obj.clone(true);
            obj.updateWorldMatrix(true, false);
            const worldPos = new THREE.Vector3();
            const worldQuat = new THREE.Quaternion();
            const worldScale = new THREE.Vector3();
            obj.matrixWorld.decompose(worldPos, worldQuat, worldScale);
            clone.position.copy(worldPos);
            clone.quaternion.copy(worldQuat);
            clone.scale.copy(worldScale);
            group.add(clone);
        });

        const result = exporter.parse(group, { binary });
        if (binary) {
            saveArrayBuffer(result, finalName);
        } else {
            const blob = new Blob([result], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = finalName;
            link.click();
            URL.revokeObjectURL(link.href);
        }
        console.log(`[STL Export] "${finalName}" (${binary ? 'binary' : 'ASCII'}) group hotovo.`);
        return;
    }

    if (!lastSelectedObject) {
        console.warn('Žádný objekt není vybrán.');
        return;
    }
    const defaultName = lastSelectedObject.name || 'selected';
    const input = window.prompt('File name (.stl will be added):', defaultName);
    if (input === null) return;
    const finalName = (input.trim() || defaultName).replace(/\.stl$/i, '') + '.stl';
    const fmt = window.prompt('Export format:\n  b = binary\n  a = ASCII', 'b');
    if (fmt === null) return;
    const binary = fmt.trim().toLowerCase() !== 'a';

    const exporter = new STLExporter();
    const clone = lastSelectedObject.clone(true);

    const result = exporter.parse(clone, { binary });
    if (binary) {
        saveArrayBuffer(result, finalName);
    } else {
        const blob = new Blob([result], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = finalName;
        link.click();
        URL.revokeObjectURL(link.href);
    }
    console.log(`[STL Export] "${finalName}" (${binary ? 'binary' : 'ASCII'}) hotovo.`);
}

// Open a file-picker dialog and load the chosen GLB file.
function importStlFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.stl,.STL';
    input.addEventListener('change', function() {
        const file = input.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        loadStlModel(url, file.name, 0.001, true).then(() => {
            URL.revokeObjectURL(url);
            if (!fileNameInput.value) fileNameInput.value = file.name.replace(/\.[^.]+$/, '');
            fitView();
            console.log(`[Import] STL "${file.name}" loaded successfully.`);
        }).catch(err => {
            URL.revokeObjectURL(url);
            console.error(`[Import] Failed to load "${file.name}":`, err);
        });
    });
    input.click();
}

function importGlbFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glb';
    input.addEventListener('change', function() {
        const file = input.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        loadGlbModel(url, file.name, 0.001, true).then(() => {
            URL.revokeObjectURL(url);
            if (!fileNameInput.value) fileNameInput.value = file.name.replace(/\.[^.]+$/, '');
            fitView();
            console.log(`[Import] GLB "${file.name}" loaded successfully.`);
        }).catch(err => {
            URL.revokeObjectURL(url);
            console.error(`[Import] Failed to load "${file.name}":`, err);
        });
    });
    input.click();
}

function importGltfFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.addEventListener('change', async function() {
        const files = Array.from(input.files);
        if (!files.length) return;

        // Find the .gltf file in the selected folder
        const gltfFile = files.find(f => f.name.toLowerCase().endsWith('.gltf'));
        if (!gltfFile) {
            console.error('[Import] No .gltf file found in the selected folder.');
            alert('No .gltf file found in the selected folder.');
            return;
        }

        // Build map: webkitRelativePath → blob URL (for all dependency files)
        const filePathMap = new Map(); // webkitRelativePath → blobURL
        const createdUrls = [];
        for (const file of files) {
            if (file === gltfFile) continue;
            const url = URL.createObjectURL(file);
            filePathMap.set(file.webkitRelativePath, url);
            createdUrls.push(url);
        }

        // Base directory of .gltf file (e.g. "model/" for "model/scene.gltf")
        const gltfRelPath = gltfFile.webkitRelativePath;
        const gltfBaseDir = gltfRelPath.substring(0, gltfRelPath.lastIndexOf('/') + 1);

        // Read and patch the .gltf JSON: replace URI references with blob URLs
        let gltfJson;
        try {
            gltfJson = JSON.parse(await gltfFile.text());
        } catch (e) {
            console.error('[Import] Failed to parse .gltf JSON:', e);
            createdUrls.forEach(u => URL.revokeObjectURL(u));
            return;
        }

        const replaceUri = (uri) => {
            if (!uri || uri.startsWith('data:') || uri.startsWith('blob:') || uri.startsWith('http')) return uri;
            const fullPath = gltfBaseDir + uri;
            return filePathMap.get(fullPath) || uri;
        };

        if (gltfJson.buffers) gltfJson.buffers.forEach(b => { if (b.uri) b.uri = replaceUri(b.uri); });
        if (gltfJson.images) gltfJson.images.forEach(img => { if (img.uri) img.uri = replaceUri(img.uri); });

        // Create patched .gltf as blob URL and load it via the existing loader
        const patchedBlob = new Blob([JSON.stringify(gltfJson)], { type: 'model/gltf+json' });
        const gltfBlobUrl = URL.createObjectURL(patchedBlob);
        createdUrls.push(gltfBlobUrl);

        loadGlbModel(gltfBlobUrl, gltfFile.name, 0.001, true).then(() => {
            createdUrls.forEach(u => URL.revokeObjectURL(u));
            if (!fileNameInput.value) fileNameInput.value = gltfFile.name.replace(/\.[^.]+$/, '');
            fitView();
            console.log(`[Import] GLTF "${gltfFile.name}" loaded successfully.`);
        }).catch(err => {
            createdUrls.forEach(u => URL.revokeObjectURL(u));
            console.error(`[Import] Failed to load "${gltfFile.name}":`, err);
        });
    });
    input.click();
}

function importObjFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.addEventListener('change', async function() {
        const files = Array.from(input.files);
        if (!files.length) return;

        const objFile = files.find(f => f.name.toLowerCase().endsWith('.obj'));
        if (!objFile) {
            console.error('[Import] No .obj file found in the selected folder.');
            alert('No .obj file found in the selected folder.');
            return;
        }

        // Root folder name (first component of webkitRelativePath)
        const rootFolder = objFile.webkitRelativePath.split('/')[0];

        // Build maps: basename → blobURL, path-without-root → blobURL
        const fileNameMap = new Map();  // "diffuse.jpg" → blobURL
        const relPathMap  = new Map();  // "textures/diffuse.jpg" → blobURL
        const createdUrls = [];
        for (const file of files) {
            const url = URL.createObjectURL(file);
            fileNameMap.set(file.name.toLowerCase(), url);
            const pathWithoutRoot = file.webkitRelativePath.substring(rootFolder.length + 1);
            relPathMap.set(pathWithoutRoot, url);
            createdUrls.push(url);
        }

        const cleanup = () => createdUrls.forEach(u => URL.revokeObjectURL(u));

        // LoadingManager: redirect blob-resolved URLs back to our blob URLs
        const manager = new THREE.LoadingManager();
        manager.setURLModifier(url => {
            // Blob URL → extract path component: "blob:http://host/textures/diffuse.jpg" → "textures/diffuse.jpg"
            const blobPathMatch = url.match(/^blob:https?:\/\/[^/]+\/(.+)$/);
            if (blobPathMatch) {
                const pathPart = decodeURIComponent(blobPathMatch[1]);
                if (relPathMap.has(pathPart)) return relPathMap.get(pathPart);
            }
            // Fallback: match by filename only
            const basename = url.split('/').pop().split('?')[0].toLowerCase();
            if (fileNameMap.has(basename)) return fileNameMap.get(basename);
            return url;
        });

        try {
            // Load MTL if present, then load textures
            let materials = null;
            const mtlFile = files.find(f => f.name.toLowerCase().endsWith('.mtl'));
            if (mtlFile) {
                const mtlLoader = new MTLLoader(manager);
                const mtlBlobUrl = fileNameMap.get(mtlFile.name.toLowerCase());
                materials = await new Promise((resolve, reject) => {
                    mtlLoader.load(mtlBlobUrl, resolve, undefined, reject);
                });
                materials.preload();
            }

            // Load OBJ
            const objLoader = new OBJLoader(manager);
            if (materials) objLoader.setMaterials(materials);

            const objBlobUrl = fileNameMap.get(objFile.name.toLowerCase());
            const object = await new Promise((resolve, reject) => {
                objLoader.load(objBlobUrl, resolve, undefined, reject);
            });

            // Integrate into scene
            object.name = objFile.name.replace(/\.[^.]+$/, '');
            object.userData.fileName = objFile.name;
            object.traverse(child => {
                child.userData.initPosition = child.position.clone();
                child.userData.initRotation = child.rotation.clone();
                child.userData.initScale    = child.scale.clone();
                if (child.isMesh) {
                    if (!child.material) {
                        child.material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
                    }
                    const mats = Array.isArray(child.material)
                        ? child.material.map(m => m.clone())
                        : child.material.clone();
                    child.material = mats;
                    const matsArr = Array.isArray(mats) ? mats : [mats];
                    matsArr.forEach(mat => {
                        mat.clippingPlanes    = clipPlanes;
                        mat.clipIntersection  = true;
                        mat.side              = THREE.DoubleSide;
                        mat.polygonOffset     = true;
                        mat.polygonOffsetFactor = 1;
                    });
                    meshObjects.push(child);
                }
            });

            scene.add(object);
            loadedModels.push(object);
            rebuildTree(loadedModels);
            if (!fileNameInput.value) fileNameInput.value = object.name;
            fitView();
            render();
            cleanup();
            console.log(`[Import] OBJ "${objFile.name}" loaded successfully.`);
        } catch (err) {
            cleanup();
            console.error('[Import] Failed to load OBJ:', err);
            alert(`Failed to load OBJ: ${err.message}`);
        }
    });
    input.click();
}

function import3mfFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.3mf';
    input.addEventListener('change', function() {
        const file = input.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const loader = new ThreeMFLoader();
        loader.load(url, function(object) {
            URL.revokeObjectURL(url);

            object.name = file.name.replace(/\.[^.]+$/, '');
            object.userData.fileName = file.name;
            object.traverse(child => {
                child.userData.initPosition = child.position.clone();
                child.userData.initRotation = child.rotation.clone();
                child.userData.initScale    = child.scale.clone();
                if (child.isMesh) {
                    const mats = Array.isArray(child.material)
                        ? child.material.map(m => m.clone())
                        : child.material.clone();
                    child.material = mats;
                    const matsArr = Array.isArray(mats) ? mats : [mats];
                    matsArr.forEach(mat => {
                        mat.clippingPlanes      = clipPlanes;
                        mat.clipIntersection    = true;
                        mat.side                = THREE.DoubleSide;
                        mat.polygonOffset       = true;
                        mat.polygonOffsetFactor = 1;
                    });
                    meshObjects.push(child);
                }
            });

            scene.add(object);
            loadedModels.push(object);
            rebuildTree(loadedModels);
            if (!fileNameInput.value) fileNameInput.value = object.name;
            fitView();
            render();
            console.log(`[Import] 3MF "${file.name}" loaded successfully.`);
        }, undefined, function(err) {
            URL.revokeObjectURL(url);
            console.error('[Import] Failed to load 3MF:', err);
            alert(`Failed to load 3MF: ${err.message}`);
        });
    });
    input.click();
}

// --- Legacy material helpers ---

function convertToStandardMaterial(mat) {
    const std = new THREE.MeshStandardMaterial({
        color:              mat.color        ? mat.color.clone()     : new THREE.Color(0x888888),
        map:                mat.map          || null,
        emissive:           mat.emissive     ? mat.emissive.clone()  : new THREE.Color(0x000000),
        emissiveMap:        mat.emissiveMap  || null,
        normalMap:          mat.normalMap    || null,
        alphaMap:           mat.alphaMap     || null,
        aoMap:              mat.aoMap        || null,
        opacity:            mat.opacity      ?? 1,
        transparent:        mat.transparent  ?? false,
        side:               mat.side,
        wireframe:          mat.wireframe    ?? false,
        vertexColors:       mat.vertexColors ?? false,
        clippingPlanes:     mat.clippingPlanes,
        clipIntersection:   mat.clipIntersection,
        polygonOffset:      mat.polygonOffset,
        polygonOffsetFactor:mat.polygonOffsetFactor,
        depthTest:          mat.depthTest    ?? true,
        depthWrite:         mat.depthWrite   ?? true,
    });
    mat.dispose();
    return std;
}

function countLegacyMaterials(objects, typeFilter = ['basic', 'phong', 'lambert']) {
    let count = 0;
    const affected = [];
    objects.forEach(root => {
        root.traverse(child => {
            if (!child.isMesh) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            const indices = [];
            mats.forEach((mat, i) => {
                const isBasic = typeFilter.includes('basic') && mat.isMeshBasicMaterial;
                const isPhong = typeFilter.includes('phong') && mat.isMeshPhongMaterial;
                const isLambert = typeFilter.includes('lambert') && mat.isMeshLambertMaterial;
                if (isBasic || isPhong || isLambert) {
                    count++;
                    indices.push(i);
                }
            });
            if (indices.length > 0) affected.push({ mesh: child, indices });
        });
    });
    return { count, affected };
}

function applyLegacyMaterialConversion(affected) {
    affected.forEach(({ mesh, indices }) => {
        if (Array.isArray(mesh.material)) {
            indices.forEach(i => {
                mesh.material[i] = convertToStandardMaterial(mesh.material[i]);
            });
        } else {
            mesh.material = convertToStandardMaterial(mesh.material);
        }
    });
    render();
}

function importFbxFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.addEventListener('change', async function() {
        const files = Array.from(input.files);
        if (!files.length) return;

        const fbxFile = files.find(f => f.name.toLowerCase().endsWith('.fbx'));
        if (!fbxFile) {
            console.error('[Import] No .fbx file found in the selected folder.');
            alert('No .fbx file found in the selected folder.');
            return;
        }

        // Root folder name (first component of webkitRelativePath)
        const rootFolder = fbxFile.webkitRelativePath.split('/')[0];

        // Build maps for external texture resolution
        const fileNameMap = new Map();  // "diffuse.jpg" → blobURL
        const relPathMap  = new Map();  // "textures/diffuse.jpg" → blobURL
        const createdUrls = [];
        for (const file of files) {
            const url = URL.createObjectURL(file);
            fileNameMap.set(file.name.toLowerCase(), url);
            const pathWithoutRoot = file.webkitRelativePath.substring(rootFolder.length + 1);
            relPathMap.set(pathWithoutRoot, url);
            createdUrls.push(url);
        }

        const cleanup = () => createdUrls.forEach(u => URL.revokeObjectURL(u));

        // LoadingManager: redirect external texture requests to blob URLs
        const manager = new THREE.LoadingManager();
        manager.setURLModifier(url => {
            const blobPathMatch = url.match(/^blob:https?:\/\/[^/]+\/(.+)$/);
            if (blobPathMatch) {
                const pathPart = decodeURIComponent(blobPathMatch[1]);
                if (relPathMap.has(pathPart)) return relPathMap.get(pathPart);
            }
            const basename = url.split('/').pop().split('?')[0].toLowerCase();
            if (fileNameMap.has(basename)) return fileNameMap.get(basename);
            return url;
        });

        try {
            const fbxBlobUrl = fileNameMap.get(fbxFile.name.toLowerCase());
            const loader = new FBXLoader(manager);
            const object = await new Promise((resolve, reject) => {
                loader.load(fbxBlobUrl, resolve, undefined, reject);
            });

            object.name = fbxFile.name.replace(/\.[^.]+$/, '');
            object.userData.fileName = fbxFile.name;
            object.traverse(child => {
                child.userData.initPosition = child.position.clone();
                child.userData.initRotation = child.rotation.clone();
                child.userData.initScale    = child.scale.clone();
                if (child.isMesh) {
                    const mats = Array.isArray(child.material)
                        ? child.material.map(m => m.clone())
                        : child.material.clone();
                    const matsArr = Array.isArray(mats) ? mats : [mats];
                    child.material = mats;
                    matsArr.forEach(mat => {
                        mat.clippingPlanes      = clipPlanes;
                        mat.clipIntersection    = true;
                        mat.side                = THREE.DoubleSide;
                        mat.polygonOffset       = true;
                        mat.polygonOffsetFactor = 1;
                    });
                    meshObjects.push(child);
                }
            });

            scene.add(object);
            loadedModels.push(object);
            rebuildTree(loadedModels);
            if (!fileNameInput.value) fileNameInput.value = object.name;
            fitView();
            render();
            cleanup();
            console.log(`[Import] FBX "${fbxFile.name}" loaded successfully.`);

            // Check for legacy materials after import
            const { count, affected } = countLegacyMaterials([object]);
            if (count > 0) {
                if (confirm(
                    `Loaded FBX contains ${count} material(s) of type MeshBasicMaterial, MeshPhongMaterial or MeshLambertMaterial.\n` +
                    `Convert to MeshStandardMaterial now for better rendering and selection highlight?\n\n` +
                    `(You can also convert later via Edit → Check/Convert MeshBasicMaterial / MeshPhongMaterial / MeshLambertMaterial.)`
                )) {
                    applyLegacyMaterialConversion(affected);
                }
            }
        } catch (err) {
            cleanup();
            console.error('[Import] Failed to load FBX:', err);
            alert(`Failed to load FBX: ${err.message}`);
        }
    });
    input.click();
}

function importStpFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.stp,.step,.STP,.STEP';
    input.addEventListener('change', async function() {
        const file = input.files[0];
        if (!file) return;

        // Loading toast
        let toast = document.getElementById('stp-loading');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'stp-loading';
            toast.innerHTML = '<div class="stp-spinner"></div><span id="stp-loading-msg">Loading STP…</span>';
            document.body.appendChild(toast);
        }
        const msg = toast.querySelector('#stp-loading-msg');
        const showToast = (text) => { msg.textContent = text; toast.classList.add('visible'); };
        const hideToast = () => toast.classList.remove('visible');

        try {
            showToast('Initializing OCCT…');
            if (!window.occtimportjs) {
                await new Promise((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = 'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.23/dist/occt-import-js.js';
                    s.onload = resolve;
                    s.onerror = () => reject(new Error('Failed to load occt-import-js from CDN'));
                    document.head.appendChild(s);
                });
            }
            const occt = await window.occtimportjs({
                locateFile: () => 'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.23/dist/occt-import-js.wasm'
            });
            showToast(`Parsing "${file.name}"…`);
            const buffer = await file.arrayBuffer();
            const result = occt.ReadStepFile(new Uint8Array(buffer), null);
            if (!result.success) {
                hideToast();
                console.error(`[Import] STP parsing failed for "${file.name}"`);
                return;
            }
            showToast(`Building scene (${result.meshes.length} meshes)…`);
            const root = new THREE.Group();
            root.name = file.name.replace(/\.[^.]+$/, '');
            root.userData.fileName = file.name;

            // Build a Three.js mesh from a flat result.meshes entry
            function buildThreeMesh(meshData, fallbackName) {
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(meshData.attributes.position.array, 3));
                if (meshData.attributes.normal) {
                    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(meshData.attributes.normal.array, 3));
                } else {
                    geometry.computeVertexNormals();
                }
                if (meshData.index) {
                    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(meshData.index.array), 1));
                }
                const color = (meshData.color != null)
                    ? new THREE.Color(meshData.color[0], meshData.color[1], meshData.color[2])
                    : new THREE.Color(0x888888);
                const material = new THREE.MeshPhongMaterial({
                    color,
                    side: THREE.DoubleSide,
                    clippingPlanes: clipPlanes,
                    clipIntersection: true,
                    polygonOffset: true,
                    polygonOffsetFactor: 1,
                });
                const m = new THREE.Mesh(geometry, material);
                m.name = meshData.name || fallbackName || 'mesh';
                return m;
            }

            // Recursively build Three.js hierarchy from occt result.root tree
            function buildNode(node, parent) {
                // If this node has meshes, wrap them in a Group named after the node
                // (or add directly if only one mesh and no children)
                const hasMeshes = node.meshes && node.meshes.length > 0;
                const hasChildren = node.children && node.children.length > 0;

                let container;
                if (hasMeshes && !hasChildren && node.meshes.length === 1) {
                    // Single mesh, no children → create Mesh directly under parent
                    const m = buildThreeMesh(result.meshes[node.meshes[0]], node.name);
                    if (node.name) m.name = node.name;
                    parent.add(m);
                    return;
                }

                if (hasMeshes || hasChildren) {
                    container = new THREE.Group();
                    container.name = node.name || '';
                    parent.add(container);
                } else {
                    container = parent;
                }

                if (hasMeshes) {
                    for (const meshIdx of node.meshes) {
                        const m = buildThreeMesh(result.meshes[meshIdx], node.name);
                        container.add(m);
                    }
                }
                if (hasChildren) {
                    for (const child of node.children) {
                        buildNode(child, container);
                    }
                }
            }

            buildNode(result.root, root);
            root.traverse(child => {
                child.userData.initPosition = child.position.clone();
                child.userData.initRotation = child.rotation.clone();
                child.userData.initScale = child.scale.clone();
                if (child.isMesh) meshObjects.push(child);
            });
            scene.add(root);
            loadedModels.push(root);
            rebuildTree(loadedModels);
            if (!fileNameInput.value) fileNameInput.value = root.name;
            fitView();
            render();
            hideToast();
            console.log(`[Import] STP "${file.name}" loaded successfully (${result.meshes.length} meshes).`);
        } catch (err) {
            hideToast();
            console.error(`[Import] Failed to load STP "${file.name}":`, err);
        }
    });
    input.click();
}

function importIgesFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.igs,.iges,.IGS,.IGES';
    input.addEventListener('change', async function() {
        const file = input.files[0];
        if (!file) return;

        let toast = document.getElementById('stp-loading');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'stp-loading';
            toast.innerHTML = '<div class="stp-spinner"></div><span id="stp-loading-msg">Loading IGES…</span>';
            document.body.appendChild(toast);
        }
        const msg = toast.querySelector('#stp-loading-msg');
        const showToast = (text) => { msg.textContent = text; toast.classList.add('visible'); };
        const hideToast = () => toast.classList.remove('visible');

        try {
            showToast('Initializing OCCT…');
            if (!window.occtimportjs) {
                await new Promise((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = 'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.23/dist/occt-import-js.js';
                    s.onload = resolve;
                    s.onerror = () => reject(new Error('Failed to load occt-import-js from CDN'));
                    document.head.appendChild(s);
                });
            }
            const occt = await window.occtimportjs({
                locateFile: () => 'https://cdn.jsdelivr.net/npm/occt-import-js@0.0.23/dist/occt-import-js.wasm'
            });
            showToast(`Parsing "${file.name}"…`);
            const buffer = await file.arrayBuffer();
            const result = occt.ReadIgesFile(new Uint8Array(buffer), null);
            if (!result.success) {
                hideToast();
                console.error(`[Import] IGES parsing failed for "${file.name}"`);
                return;
            }
            showToast(`Building scene (${result.meshes.length} meshes)…`);
            const root = new THREE.Group();
            root.name = file.name.replace(/\.[^.]+$/, '');
            root.userData.fileName = file.name;

            function buildThreeMesh(meshData, fallbackName) {
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(meshData.attributes.position.array, 3));
                if (meshData.attributes.normal) {
                    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(meshData.attributes.normal.array, 3));
                } else {
                    geometry.computeVertexNormals();
                }
                if (meshData.index) {
                    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(meshData.index.array), 1));
                }
                const color = (meshData.color != null)
                    ? new THREE.Color(meshData.color[0], meshData.color[1], meshData.color[2])
                    : new THREE.Color(0x888888);
                const material = new THREE.MeshPhongMaterial({
                    color,
                    side: THREE.DoubleSide,
                    clippingPlanes: clipPlanes,
                    clipIntersection: true,
                    polygonOffset: true,
                    polygonOffsetFactor: 1,
                });
                const m = new THREE.Mesh(geometry, material);
                m.name = meshData.name || fallbackName || 'mesh';
                return m;
            }

            function buildNode(node, parent) {
                const hasMeshes = node.meshes && node.meshes.length > 0;
                const hasChildren = node.children && node.children.length > 0;

                let container;
                if (hasMeshes && !hasChildren && node.meshes.length === 1) {
                    const m = buildThreeMesh(result.meshes[node.meshes[0]], node.name);
                    if (node.name) m.name = node.name;
                    parent.add(m);
                    return;
                }

                if (hasMeshes || hasChildren) {
                    container = new THREE.Group();
                    container.name = node.name || '';
                    parent.add(container);
                } else {
                    container = parent;
                }

                if (hasMeshes) {
                    for (const meshIdx of node.meshes) {
                        const m = buildThreeMesh(result.meshes[meshIdx], node.name);
                        container.add(m);
                    }
                }
                if (hasChildren) {
                    for (const child of node.children) {
                        buildNode(child, container);
                    }
                }
            }

            buildNode(result.root, root);
            root.traverse(child => {
                child.userData.initPosition = child.position.clone();
                child.userData.initRotation = child.rotation.clone();
                child.userData.initScale = child.scale.clone();
                if (child.isMesh) meshObjects.push(child);
            });
            scene.add(root);
            loadedModels.push(root);
            rebuildTree(loadedModels);
            if (!fileNameInput.value) fileNameInput.value = root.name;
            fitView();
            render();
            hideToast();
            console.log(`[Import] IGES "${file.name}" loaded successfully (${result.meshes.length} meshes).`);
        } catch (err) {
            hideToast();
            console.error(`[Import] Failed to load IGES "${file.name}":`, err);
        }
    });
    input.click();
}

// ===== Settings Import from GLB ===============================================================

// Apply 3D dimension defaults, 3D annotation defaults, and section settings
// stored in a node's userData during a previous GLB export.
// GLTFLoader wraps the exported group as a child of gltf.scene, so we traverse.
function importSettingsFromGltfScene(gltfScene) {
    let cadDim3dDef = null;
    let ann3dDef = null;
    let sectionSett = null;
    let dimMarkerSett = null;
    let annMarkerSett = null;

    gltfScene.traverse(node => {
        if (!cadDim3dDef && node.userData.cadDim3dDefaults) {
            cadDim3dDef = node.userData.cadDim3dDefaults;
            delete node.userData.cadDim3dDefaults;
        }
        if (!ann3dDef && node.userData.annotation3dDefaults) {
            ann3dDef = node.userData.annotation3dDefaults;
            delete node.userData.annotation3dDefaults;
        }
        if (!sectionSett && node.userData.sectionSettings) {
            sectionSett = node.userData.sectionSettings;
            delete node.userData.sectionSettings;
        }
        if (!dimMarkerSett && node.userData.dimMarkerSettings) {
            dimMarkerSett = node.userData.dimMarkerSettings;
            delete node.userData.dimMarkerSettings;
        }
        if (!annMarkerSett && node.userData.annMarkerSettings) {
            annMarkerSett = node.userData.annMarkerSettings;
            delete node.userData.annMarkerSettings;
        }
    });

    if (cadDim3dDef) {
        Object.assign(getCadDim3dDefaults(), cadDim3dDef);
    }

    if (ann3dDef) {
        Object.assign(getAnnotation3dDefaults(), ann3dDef);
    }

    if (dimMarkerSett) {
        const s = dimMarkerSett;
        if (s.fixedSize    !== undefined) { setDimMarkerFixedSize(s.fixedSize);          setCadDimMarkerFixedSize(s.fixedSize); }
        if (s.fixedScreenPx !== undefined){ setDimMarkerFixedScreenPx(s.fixedScreenPx);  setCadDimMarkerFixedScreenPx(s.fixedScreenPx); }
        if (s.worldSize    !== undefined) { setDimMarkerWorldSize(s.worldSize);           setCadDimMarkerWorldSize(s.worldSize); }
        if (s.markerColor  !== undefined) { setDimMarkerColor(s.markerColor);             setCadDimMarkerColor(s.markerColor); }
    }

    if (annMarkerSett) {
        const s = annMarkerSett;
        if (s.fixedSize    !== undefined) { setAnnMarkerFixedSize(s.fixedSize);          setAnn3dMarkerFixedSize(s.fixedSize); }
        if (s.fixedScreenPx !== undefined){ setAnnMarkerFixedScreenPx(s.fixedScreenPx);  setAnn3dMarkerFixedScreenPx(s.fixedScreenPx); }
        if (s.worldSize    !== undefined) { setAnnMarkerWorldSize(s.worldSize);           setAnn3dMarkerWorldSize(s.worldSize); }
        if (s.markerColor  !== undefined) { setAnnMarkerColor(s.markerColor);             setAnn3dMarkerColor(s.markerColor); }
    }

    if (sectionSett) {
        const s = sectionSett;
        const scalarKeys = ['px', 'py', 'pz', 'sectionCrossLines', 'crossSectionColor', 'solidSection', 'capColor', 'showSectionMesh'];
        scalarKeys.forEach(k => { if (s[k] !== undefined) viewProp[k] = s[k]; });

        // Apply clip plane positions
        clipPlanes[0].constant = viewProp.px;
        clipPlanes[1].constant = viewProp.py;
        clipPlanes[2].constant = viewProp.pz;

        // Apply section on/off
        if (s.section !== undefined) {
            viewProp.section = s.section;
            renderer.localClippingEnabled = s.section;
            if (s.section) {
                viewProp.sectionGizmo = true;
                activateSectionGizmo(true);
            }
        }

        if (viewProp.sectionCrossLines) updateSectionCrossLines();
        if (viewProp.solidSection) computeSolidSection(scene, meshObjects, viewProp, render);
        if (viewProp.showSectionMesh) toggleSectionMeshAll();
    }
}

// ===== Assembly Workflow Export/Import Helpers =================================================

// Write assemblyData.steps into each objectRef's userData.assemblyTransformations
// so the data survives GLB export/import. Call immediately before cloning for export.
function assemblyWriteToUserData() {
    // Reset assembly arrays on all referenced objects
    const allObjects = new Set();
    assemblyData.steps.forEach(step => {
        step.transformations.forEach(t => allObjects.add(t.objectRef));
    });
    allObjects.forEach(obj => { obj.userData.assemblyTransformations = []; });

    // Populate per-object arrays indexed by step
    assemblyData.steps.forEach(step => {
        step.transformations.forEach(t => {
            t.objectRef.userData.assemblyTransformations.push({
                step_id:          step.id,
                step_name:        step.name,
                step_description: step.description,
                step_camera:      step.camera ? { ...step.camera } : null,
                initPosition:     { ...t.initPosition },
                finalPosition:    { ...t.finalPosition },
                initQuaternion:   t.initQuaternion  ? { ...t.initQuaternion }  : null,
                finalQuaternion:  t.finalQuaternion ? { ...t.finalQuaternion } : null,
                initScale:        t.initScale       ? { ...t.initScale }       : null,
                finalScale:       t.finalScale      ? { ...t.finalScale }      : null,
            });
        });
    });
}

// Remove assemblyTransformations from userData of all objects referenced in assemblyData.
// Call on originals immediately after cloning — clones already carry the data.
function assemblyClearUserData() {
    assemblyData.steps.forEach(step => {
        step.transformations.forEach(t => {
            delete t.objectRef.userData.assemblyTransformations;
        });
    });
}

// Read userData.assemblyTransformations from an imported GLTF scene and
// integrate the resulting steps into assemblyData according to user choice.
function importAssemblyFromGltfScene(gltfScene) {
    // Collect per-object assembly records from userData
    const importedSteps = new Map(); // step_id → step object
    gltfScene.traverse(function(child) {
        const arr = child.userData.assemblyTransformations;
        if (!Array.isArray(arr) || arr.length === 0) return;

        arr.forEach(entry => {
            if (!importedSteps.has(entry.step_id)) {
                importedSteps.set(entry.step_id, {
                    id:          entry.step_id,
                    name:        entry.step_name        || `Step ${entry.step_id}`,
                    description: entry.step_description || '',
                    camera:      entry.step_camera       || null,
                    transformations: [],
                });
            }
            importedSteps.get(entry.step_id).transformations.push({
                objectRef:       child,
                initPosition:    entry.initPosition,
                finalPosition:   entry.finalPosition,
                initQuaternion:  entry.initQuaternion  || null,
                finalQuaternion: entry.finalQuaternion || null,
                initScale:       entry.initScale       || null,
                finalScale:      entry.finalScale      || null,
            });
        });

        // Remove from userData — no longer needed at runtime
        delete child.userData.assemblyTransformations;
    });

    const sortedImportedSteps = [...importedSteps.values()].sort((a, b) => a.id - b.id);
    if (sortedImportedSteps.length === 0) return;

    if (assemblyData.steps.length === 0) {
        // No conflict — load directly
        assemblyData.steps.push(...sortedImportedSteps);
        repairChain();
        console.log(`[Assembly] Imported ${sortedImportedSteps.length} step(s) from GLB.`);
        updateAssemblyGuiInfo();
        return;
    }

    // Existing workflow — ask user how to handle the conflict
    const existingCount = assemblyData.steps.length;
    const importedCount = sortedImportedSteps.length;
    const choice = window.prompt(
        `Imported model contains Assembly Workflow (${importedCount} step(s)).\n` +
        `Existing workflow: ${existingCount} step(s).\n\n` +
        `Choose action:\n` +
        `  1 — Merge   (combine transformations of steps with matching IDs; keep existing step names)\n` +
        `  2 — Append  (add imported steps after existing steps)\n` +
        `  3 — Replace (overwrite existing workflow with imported)\n` +
        `  4 — Ignore  (discard imported workflow)`,
        '1'
    );

    const action = choice !== null ? choice.trim() : '4';

    if (action === '1') {
        // Merge by step_id — existing step metadata (name/description) is preserved
        sortedImportedSteps.forEach(importedStep => {
            const existing = assemblyData.steps.find(s => s.id === importedStep.id);
            if (existing) {
                existing.transformations.push(...importedStep.transformations);
                console.log(`[Assembly] Merge: added ${importedStep.transformations.length} transformation(s) to step ${importedStep.id} "${existing.name}".`);
            } else {
                assemblyData.steps.push(importedStep);
                assemblyData.steps.sort((a, b) => a.id - b.id);
                console.log(`[Assembly] Merge: new step ${importedStep.id} "${importedStep.name}" inserted.`);
            }
        });
        repairChain();
    } else if (action === '2') {
        // Append — remap step IDs to continue after existing ones
        const maxId = Math.max(...assemblyData.steps.map(s => s.id));
        sortedImportedSteps.forEach((step, i) => {
            step.id = maxId + i + 1;
            assemblyData.steps.push(step);
        });
        repairChain();
        console.log(`[Assembly] Append: ${sortedImportedSteps.length} step(s) added (IDs ${maxId + 1}–${maxId + sortedImportedSteps.length}).`);
    } else if (action === '3') {
        // Replace — overwrite entirely
        assemblyData.steps.length = 0;
        assemblyData.steps.push(...sortedImportedSteps);
        assemblyAnchors.clear();
        repairChain();
        console.log(`[Assembly] Replace: workflow replaced with ${sortedImportedSteps.length} imported step(s).`);
    } else {
        // action === '4' or dialog cancelled — ignore
        console.log('[Assembly] Import: workflow ignored.');
    }

    updateAssemblyGuiInfo();
}

// ================================================================================================

function exportAllModels() {
    if (loadedModels.length === 0) {
        console.warn('Žádné modely k exportu.');
        return;
    }
    const baseName = fileNameInput.value.trim() || (loadedModels[0]?.userData?.fileName?.replace(/\.[^.]+$/, '') ?? 'export_all');
    const input = window.prompt('File name (.glb will be added):', baseName);
    if (input === null) return; // uživatel stiskl Cancel
    const finalName = (input.trim() || baseName).replace(/\.glb$/i, '') + '.glb';

    // Write assembly workflow into userData before cloning
    assemblyWriteToUserData();

    // Flush any unsaved document editor changes
    flushDocumentEdits();

    const exporter = new GLTFExporter();
    const group = new THREE.Group();
    loadedModels.forEach((model) => {
        const clone = model.clone(true);
        clone.userData.fileName = finalName;
        group.add(clone);
    });

    // Mark as app export root so import can unwrap the extra wrapper layer
    group.userData._appExportRoot = true;

    // Embed documents into export
    group.userData.documents = getDocumentsStore().map(d => ({ ...d }));

    // Embed attachments into export
    group.userData.attachments = getAttachmentsStore().map(a => ({ ...a }));

    // Embed 3D dimension defaults, 3D annotation defaults, section settings
    group.userData.cadDim3dDefaults = { ...getCadDim3dDefaults() };
    group.userData.annotation3dDefaults = { ...getAnnotation3dDefaults() };
    group.userData.dimMarkerSettings = { ...getDimMarkerSettings() };
    group.userData.annMarkerSettings = { ...getAnnMarkerSettings() };
    group.userData.sectionSettings = {
        section:           viewProp.section,
        px:                viewProp.px,
        py:                viewProp.py,
        pz:                viewProp.pz,
        sectionCrossLines: viewProp.sectionCrossLines,
        crossSectionColor: viewProp.crossSectionColor,
        solidSection:      viewProp.solidSection,
        capColor:          viewProp.capColor,
        showSectionMesh:   viewProp.showSectionMesh,
    };

    // Clean up originals — clones already carry the assembly data
    assemblyClearUserData();

    // Strip measurement visuals from clones (userData.measurements stays for reconstruction)
    stripMeasurementVisuals(group);
    stripAnnotationVisuals(group);
    stripAnnotation3dVisuals(group);
    stripCadDim3dVisuals(group);

    exporter.parse(group, function(result) {
        saveArrayBuffer(result, finalName);
        console.log('Export all: hotovo.');
    }, function(error) {
        console.error('Chyba při exportu:', error);
    }, { binary: true, onlyVisible: false });
}

async function exportAllModelsDraco() {
    if (loadedModels.length === 0) {
        console.warn('Žádné modely k exportu.');
        return;
    }
    const baseName = fileNameInput.value.trim() || (loadedModels[0]?.userData?.fileName?.replace(/\.[^.]+$/, '') ?? 'export_all_draco');
    const input = window.prompt('File name (.glb will be added):', baseName);
    if (input === null) return;
    const finalName = (input.trim() || baseName).replace(/\.glb$/i, '') + '.glb';

    // Zobrazíme overlay
    let overlay = document.getElementById('dracoOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'dracoOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;color:#fff;font-size:22px;font-family:sans-serif;';
        overlay.textContent = 'Draco compressing… please wait';
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';

    assemblyWriteToUserData();

    // Flush any unsaved document editor changes
    flushDocumentEdits();

    const exporter = new GLTFExporter();
    const group = new THREE.Group();
    loadedModels.forEach((model) => {
        const clone = model.clone(true);
        clone.userData.fileName = finalName;
        group.add(clone);
    });

    // Mark as app export root so import can unwrap the extra wrapper layer
    group.userData._appExportRoot = true;

    // Embed documents into export
    group.userData.documents = getDocumentsStore().map(d => ({ ...d }));

    // Embed attachments into export
    group.userData.attachments = getAttachmentsStore().map(a => ({ ...a }));

    // Embed 3D dimension defaults, 3D annotation defaults, section settings
    group.userData.cadDim3dDefaults = { ...getCadDim3dDefaults() };
    group.userData.annotation3dDefaults = { ...getAnnotation3dDefaults() };
    group.userData.dimMarkerSettings = { ...getDimMarkerSettings() };
    group.userData.annMarkerSettings = { ...getAnnMarkerSettings() };
    group.userData.sectionSettings = {
        section:           viewProp.section,
        px:                viewProp.px,
        py:                viewProp.py,
        pz:                viewProp.pz,
        sectionCrossLines: viewProp.sectionCrossLines,
        crossSectionColor: viewProp.crossSectionColor,
        solidSection:      viewProp.solidSection,
        capColor:          viewProp.capColor,
        showSectionMesh:   viewProp.showSectionMesh,
    };

    assemblyClearUserData();

    // Strip measurement visuals from clones (userData.measurements stays for reconstruction)
    stripMeasurementVisuals(group);
    stripAnnotationVisuals(group);
    stripAnnotation3dVisuals(group);
    stripCadDim3dVisuals(group);

    exporter.parse(group, function(result) {
        // setTimeout dá prohlížeči čas vykreslit overlay
        setTimeout(async () => {
            try {
                const { WebIO } = await import('@gltf-transform/core');
                const { KHRDracoMeshCompression } = await import('@gltf-transform/extensions');
                const { draco } = await import('@gltf-transform/functions');

                // Dynamicky načteme Draco encoder/decoder z public/draco/
                const loadDracoScript = (url) => new Promise((resolve, reject) => {
                    const id = url.includes('encoder') ? 'DracoEncoderModule' : 'DracoDecoderModule';
                    if (window[id]) { resolve(); return; }
                    const s = document.createElement('script');
                    s.src = url;
                    s.onload = resolve;
                    s.onerror = () => reject(new Error('Failed to load ' + url));
                    document.head.appendChild(s);
                });

                await loadDracoScript('./draco/draco_encoder_wasm.js');
                await loadDracoScript('./draco/draco_decoder_wasm.js');

                const encoder = await window.DracoEncoderModule();
                const decoder = await window.DracoDecoderModule();

                const io = new WebIO()
                    .registerExtensions([KHRDracoMeshCompression])
                    .registerDependencies({
                        'draco3d.decoder': decoder,
                        'draco3d.encoder': encoder,
                    });

                const gltfDoc = await io.readBinary(new Uint8Array(result));
                // Draco compression settings (defaults shown):
                // await gltfDoc.transform(draco({
                //     method: 'edgebreaker',   // 'edgebreaker' | 'sequential'
                //     encodeSpeed: 5,           // 0–10 (higher = faster, worse compression)
                //     decodeSpeed: 5,           // 0–10 (higher = faster decode)
                //     quantizePosition: 14,     // bits for vertex positions
                //     quantizeNormal: 10,       // bits for normals
                //     quantizeColor: 8,         // bits for vertex colors
                //     quantizeTexcoord: 12,     // bits for UV coordinates
                //     quantizeGeneric: 12,      // bits for other attributes
                // }));
                await gltfDoc.transform(dracoDefaults.useCustomSettings ? draco({ ...dracoDefaults }) : draco());
                const compressedGlb = await io.writeBinary(gltfDoc);

                saveArrayBuffer(compressedGlb, finalName);
                console.log('Export all (Draco): hotovo.');
            } catch (err) {
                console.error('Chyba při Draco kompresi:', err);
                saveArrayBuffer(result, finalName);
                console.warn('Uloženo bez Draco komprese (fallback).');
            } finally {
                overlay.style.display = 'none';
            }
        }, 50);
    }, function(error) {
        overlay.style.display = 'none';
        console.error('Chyba při exportu:', error);
    }, { binary: true, onlyVisible: false });
}

function exportSelectedObject() {
    // --- Multi-select group case ---
    if (!lastSelectedObject && selectedObjects.length > 0) {
        const defaultName = `${selectedObjects[0].name || 'group'}.glb`;
        const input = window.prompt('File name (.glb will be added):', defaultName.replace(/\.glb$/i, ''));
        if (input === null) return;
        const finalName = (input.trim() || defaultName.replace(/\.glb$/i, '')).replace(/\.glb$/i, '') + '.glb';

        selectedObjects.forEach(obj => obj.traverse(child => {
            if (child.isMesh && child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(mat => { if (mat.emissive) mat.emissive.setHex(0x000000); });
            }
        }));

        assemblyWriteToUserData();

        const exporter = new GLTFExporter();
        const group = new THREE.Group();
        group.userData._appExportRoot = true;
        group.userData.cadDim3dDefaults = { ...getCadDim3dDefaults() };
        group.userData.annotation3dDefaults = { ...getAnnotation3dDefaults() };
        group.userData.sectionSettings = {
            section:           viewProp.section,
            px:                viewProp.px,
            py:                viewProp.py,
            pz:                viewProp.pz,
            sectionCrossLines: viewProp.sectionCrossLines,
            crossSectionColor: viewProp.crossSectionColor,
            solidSection:      viewProp.solidSection,
            capColor:          viewProp.capColor,
            showSectionMesh:   viewProp.showSectionMesh,
        };

        selectedObjects.forEach(obj => {
            const clone = obj.clone(true);
            obj.updateWorldMatrix(true, false);
            const worldPos = new THREE.Vector3();
            const worldQuat = new THREE.Quaternion();
            const worldScale = new THREE.Vector3();
            obj.matrixWorld.decompose(worldPos, worldQuat, worldScale);
            clone.position.copy(worldPos);
            clone.quaternion.copy(worldQuat);
            clone.scale.copy(worldScale);
            clone.userData.fileName = finalName;
            group.add(clone);
        });

        assemblyClearUserData();

        stripMeasurementVisuals(group);
        stripAnnotationVisuals(group);
        stripAnnotation3dVisuals(group);
        stripCadDim3dVisuals(group);

        exporter.parse(group, function(result) {
            saveArrayBuffer(result, finalName);
            console.log('Export selected (group): hotovo.');
        }, function(error) {
            console.error('Chyba při exportu:', error);
        }, { binary: true, onlyVisible: false });
        return;
    }

    if (!lastSelectedObject) {
        console.warn('Žádný objekt není vybrán.');
        return;
    }
    const defaultName = `${lastSelectedObject.name || 'selected'}.glb`;
    const input = window.prompt('File name (.glb will be added):', defaultName.replace(/\.glb$/i, ''));
    if (input === null) return; // uživatel stiskl Cancel
    const finalName = (input.trim() || defaultName.replace(/\.glb$/i, '')).replace(/\.glb$/i, '') + '.glb';
    // Vypneme emissive (zvýraznění výběru) před exportem
    lastSelectedObject.traverse((child) => {
        if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(mat => { if (mat.emissive) mat.emissive.setHex(0x000000); });
        }
    });

    // Write assembly workflow into userData before cloning
    assemblyWriteToUserData();

    const exporter = new GLTFExporter();
    const clone = lastSelectedObject.clone(true);

    // Embed 3D dimension defaults, 3D annotation defaults, section settings
    clone.userData.cadDim3dDefaults = { ...getCadDim3dDefaults() };
    clone.userData.annotation3dDefaults = { ...getAnnotation3dDefaults() };
    clone.userData.sectionSettings = {
        section:           viewProp.section,
        px:                viewProp.px,
        py:                viewProp.py,
        pz:                viewProp.pz,
        sectionCrossLines: viewProp.sectionCrossLines,
        crossSectionColor: viewProp.crossSectionColor,
        solidSection:      viewProp.solidSection,
        capColor:          viewProp.capColor,
        showSectionMesh:   viewProp.showSectionMesh,
    };

    // Clean up originals — clone already carries the assembly data
    assemblyClearUserData();

    // Strip measurement visuals from clone (userData.measurements stays for reconstruction)
    stripMeasurementVisuals(clone);
    stripAnnotationVisuals(clone);
    stripAnnotation3dVisuals(clone);
    stripCadDim3dVisuals(clone);

    // Apply world transform to the clone so it appears in the same position after re-import
    // Aplikujeme world transform na klon, aby se po importu zobrazil ve stejné pozici
    // jako originál (i když je originál child otočeného/posunutého parenta)
    lastSelectedObject.updateWorldMatrix(true, false);// Aktualizujeme world matici, aby obsahovala aktuální pozici, rotaci a měřítko včetně rodičů. true pro update pozice rodičů, false pro neupdate pozice dětí (nechceme měnit pozici klonu)
    const worldPos = new THREE.Vector3();// Pro dekompozici world matice potřebujeme vytvořit proměnné pro pozici, rotaci a měřítko
    const worldQuat = new THREE.Quaternion();
    const worldScale = new THREE.Vector3();
    lastSelectedObject.matrixWorld.decompose(worldPos, worldQuat, worldScale);// Dekomponujeme world matici na pozici, rotaci a měřítko
    clone.position.copy(worldPos);
    clone.quaternion.copy(worldQuat);
    clone.scale.copy(worldScale);

    const group = new THREE.Group();
    group.userData._appExportRoot = true;
    clone.userData.fileName = finalName;
    group.add(clone);

    exporter.parse(group, function(result) {
        saveArrayBuffer(result, finalName);
        console.log(`Export selected: hotovo.`);
    }, function(error) {
        console.error('Chyba při exportu:', error);
    }, { binary: true, onlyVisible: false });
}

async function exportSelectedObjectDraco() {
    // --- Multi-select group case ---
    if (!lastSelectedObject && selectedObjects.length > 0) {
        const defaultName = `${selectedObjects[0].name || 'group'}.glb`;
        const input = window.prompt('File name (.glb will be added):', defaultName.replace(/\.glb$/i, ''));
        if (input === null) return;
        const finalName = (input.trim() || defaultName.replace(/\.glb$/i, '')).replace(/\.glb$/i, '') + '.glb';

        let overlay = document.getElementById('dracoOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'dracoOverlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;color:#fff;font-size:22px;font-family:sans-serif;';
            overlay.textContent = 'Draco compressing… please wait';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';

        selectedObjects.forEach(obj => obj.traverse(child => {
            if (child.isMesh && child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach(mat => { if (mat.emissive) mat.emissive.setHex(0x000000); });
            }
        }));

        assemblyWriteToUserData();
        flushDocumentEdits();

        const exporter = new GLTFExporter();
        const groupDraco = new THREE.Group();
        groupDraco.userData._appExportRoot = true;
        groupDraco.userData.cadDim3dDefaults = { ...getCadDim3dDefaults() };
        groupDraco.userData.annotation3dDefaults = { ...getAnnotation3dDefaults() };
        groupDraco.userData.sectionSettings = {
            section:           viewProp.section,
            px:                viewProp.px,
            py:                viewProp.py,
            pz:                viewProp.pz,
            sectionCrossLines: viewProp.sectionCrossLines,
            crossSectionColor: viewProp.crossSectionColor,
            solidSection:      viewProp.solidSection,
            capColor:          viewProp.capColor,
            showSectionMesh:   viewProp.showSectionMesh,
        };

        selectedObjects.forEach(obj => {
            const clone = obj.clone(true);
            obj.updateWorldMatrix(true, false);
            const worldPos = new THREE.Vector3();
            const worldQuat = new THREE.Quaternion();
            const worldScale = new THREE.Vector3();
            obj.matrixWorld.decompose(worldPos, worldQuat, worldScale);
            clone.position.copy(worldPos);
            clone.quaternion.copy(worldQuat);
            clone.scale.copy(worldScale);
            clone.userData.fileName = finalName;
            groupDraco.add(clone);
        });

        assemblyClearUserData();

        stripMeasurementVisuals(groupDraco);
        stripAnnotationVisuals(groupDraco);
        stripAnnotation3dVisuals(groupDraco);
        stripCadDim3dVisuals(groupDraco);

        exporter.parse(groupDraco, function(result) {
            setTimeout(async () => {
                try {
                    const { WebIO } = await import('@gltf-transform/core');
                    const { KHRDracoMeshCompression } = await import('@gltf-transform/extensions');
                    const { draco } = await import('@gltf-transform/functions');

                    const loadDracoScript = (url) => new Promise((resolve, reject) => {
                        const id = url.includes('encoder') ? 'DracoEncoderModule' : 'DracoDecoderModule';
                        if (window[id]) { resolve(); return; }
                        const s = document.createElement('script');
                        s.src = url;
                        s.onload = resolve;
                        s.onerror = () => reject(new Error('Failed to load ' + url));
                        document.head.appendChild(s);
                    });

                    await loadDracoScript('./draco/draco_encoder_wasm.js');
                    await loadDracoScript('./draco/draco_decoder_wasm.js');

                    const encoder = await window.DracoEncoderModule();
                    const decoder = await window.DracoDecoderModule();

                    const io = new WebIO()
                        .registerExtensions([KHRDracoMeshCompression])
                        .registerDependencies({
                            'draco3d.decoder': decoder,
                            'draco3d.encoder': encoder,
                        });

                    const gltfDoc = await io.readBinary(new Uint8Array(result));
                    await gltfDoc.transform(dracoDefaults.useCustomSettings ? draco({ ...dracoDefaults }) : draco());
                    const compressedGlb = await io.writeBinary(gltfDoc);

                    saveArrayBuffer(compressedGlb, finalName);
                    console.log('Export selected group (Draco): hotovo.');
                } catch (err) {
                    console.error('Chyba při Draco kompresi:', err);
                    saveArrayBuffer(result, finalName);
                    console.warn('Uloženo bez Draco komprese (fallback).');
                } finally {
                    overlay.style.display = 'none';
                }
            }, 50);
        }, function(error) {
            overlay.style.display = 'none';
            console.error('Chyba při exportu:', error);
        }, { binary: true, onlyVisible: false });
        return;
    }

    if (!lastSelectedObject) {
        console.warn('Žádný objekt není vybrán.');
        return;
    }
    const defaultName = `${lastSelectedObject.name || 'selected'}.glb`;
    const input = window.prompt('File name (.glb will be added):', defaultName.replace(/\.glb$/i, ''));
    if (input === null) return;
    const finalName = (input.trim() || defaultName.replace(/\.glb$/i, '')).replace(/\.glb$/i, '') + '.glb';

    // Zobrazíme overlay
    let overlay = document.getElementById('dracoOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'dracoOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;color:#fff;font-size:22px;font-family:sans-serif;';
        overlay.textContent = 'Draco compressing… please wait';
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';

    // Vypneme emissive (zvýraznění výběru) před exportem
    lastSelectedObject.traverse((child) => {
        if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(mat => { if (mat.emissive) mat.emissive.setHex(0x000000); });
        }
    });

    assemblyWriteToUserData();
    flushDocumentEdits();

    const exporter = new GLTFExporter();
    const clone = lastSelectedObject.clone(true);

    clone.userData.cadDim3dDefaults = { ...getCadDim3dDefaults() };
    clone.userData.annotation3dDefaults = { ...getAnnotation3dDefaults() };
    clone.userData.sectionSettings = {
        section:           viewProp.section,
        px:                viewProp.px,
        py:                viewProp.py,
        pz:                viewProp.pz,
        sectionCrossLines: viewProp.sectionCrossLines,
        crossSectionColor: viewProp.crossSectionColor,
        solidSection:      viewProp.solidSection,
        capColor:          viewProp.capColor,
        showSectionMesh:   viewProp.showSectionMesh,
    };

    assemblyClearUserData();

    stripMeasurementVisuals(clone);
    stripAnnotationVisuals(clone);
    stripAnnotation3dVisuals(clone);
    stripCadDim3dVisuals(clone);

    lastSelectedObject.updateWorldMatrix(true, false);
    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    const worldScale = new THREE.Vector3();
    lastSelectedObject.matrixWorld.decompose(worldPos, worldQuat, worldScale);
    clone.position.copy(worldPos);
    clone.quaternion.copy(worldQuat);
    clone.scale.copy(worldScale);

    const groupDraco = new THREE.Group();
    groupDraco.userData._appExportRoot = true;
    clone.userData.fileName = finalName;
    groupDraco.add(clone);

    exporter.parse(groupDraco, function(result) {
        setTimeout(async () => {
            try {
                const { WebIO } = await import('@gltf-transform/core');
                const { KHRDracoMeshCompression } = await import('@gltf-transform/extensions');
                const { draco } = await import('@gltf-transform/functions');

                const loadDracoScript = (url) => new Promise((resolve, reject) => {
                    const id = url.includes('encoder') ? 'DracoEncoderModule' : 'DracoDecoderModule';
                    if (window[id]) { resolve(); return; }
                    const s = document.createElement('script');
                    s.src = url;
                    s.onload = resolve;
                    s.onerror = () => reject(new Error('Failed to load ' + url));
                    document.head.appendChild(s);
                });

                await loadDracoScript('./draco/draco_encoder_wasm.js');
                await loadDracoScript('./draco/draco_decoder_wasm.js');

                const encoder = await window.DracoEncoderModule();
                const decoder = await window.DracoDecoderModule();

                const io = new WebIO()
                    .registerExtensions([KHRDracoMeshCompression])
                    .registerDependencies({
                        'draco3d.decoder': decoder,
                        'draco3d.encoder': encoder,
                    });

                const gltfDoc = await io.readBinary(new Uint8Array(result));
                await gltfDoc.transform(dracoDefaults.useCustomSettings ? draco({ ...dracoDefaults }) : draco());
                const compressedGlb = await io.writeBinary(gltfDoc);

                saveArrayBuffer(compressedGlb, finalName);
                console.log('Export selected (Draco): hotovo.');
            } catch (err) {
                console.error('Chyba při Draco kompresi:', err);
                saveArrayBuffer(result, finalName);
                console.warn('Uloženo bez Draco komprese (fallback).');
            } finally {
                overlay.style.display = 'none';
            }
        }, 50);
    }, function(error) {
        overlay.style.display = 'none';
        console.error('Chyba při exportu:', error);
    }, { binary: true, onlyVisible: false });
}

function separateMesh(meshToSeparate) {
    if (!meshToSeparate || !meshToSeparate.geometry) return;

    // 1. Získání nových geometrií
    const geometries = separateGroups(meshToSeparate.geometry);
    if (geometries.length === 0) return;

    // Uložení potřebných dat před odstraněním meshe
    const origName     = meshToSeparate.name || 'sep';
    const origMaterial = meshToSeparate.material;
    const origPosition = meshToSeparate.position.clone();
    const origRotation = meshToSeparate.rotation.clone();
    const origScale    = meshToSeparate.scale.clone();

    // 2. Odstranění původního meshe bez vlastního confirm dialogu removeModel()
    deselectObject();
    removeMeasurementsForOwner(meshToSeparate);
    removeAnnotationsForOwner(meshToSeparate);
    removeAnnotations3dForOwner(meshToSeparate);
    removeCadDim3dMeasurementsForOwner(meshToSeparate);

    meshToSeparate.traverse(obj => {
        const mi = meshObjects.indexOf(obj);
        if (mi !== -1) meshObjects.splice(mi, 1);
        const hi = hiddenObjects.indexOf(obj);
        if (hi !== -1) hiddenObjects.splice(hi, 1);
    });

    if (meshToSeparate.parent) {
        meshToSeparate.parent.remove(meshToSeparate);
    } else {
        scene.remove(meshToSeparate);
    }

    const lmIdx = loadedModels.indexOf(meshToSeparate);
    if (lmIdx !== -1) loadedModels.splice(lmIdx, 1);

    // 3. Vytvoření skupiny se stejným názvem jako původní mesh — nahradí ho v hierarchii
    const group = new THREE.Group();
    group.name = origName;
    group.position.copy(origPosition);
    group.rotation.copy(origRotation);
    group.scale.copy(origScale);
    group.userData.initPosition = origPosition.clone();
    group.userData.initRotation = origRotation.clone();
    group.userData.initScale    = origScale.clone();

    scene.add(group);

    // Nové díly jako potomci skupiny — v lokálních souřadnicích skupiny (origin = 0)
    geometries.forEach((geom, i) => {
        const mat = Array.isArray(origMaterial) ? origMaterial[i] : origMaterial.clone();
        const newMesh = new THREE.Mesh(geom, mat);
        newMesh.name = `Part_${i}_${origName}`;
        newMesh.userData.initPosition = new THREE.Vector3(0, 0, 0);
        newMesh.userData.initRotation = new THREE.Euler(0, 0, 0);
        newMesh.userData.initScale    = new THREE.Vector3(1, 1, 1);
        group.add(newMesh);
        meshObjects.push(newMesh);
    });

    loadedModels.push(group);

    rebuildTree(loadedModels);
    if (_assemblyFolderRef) updateAssemblyGuiInfo();
    render();
}


// ===== Assembly / Disassembly Functions =========================================================

function addAssemblyGui() {
    const assemblyFolder = new GUI({ container: guiContainer, title: 'Assembly Workflow' });
    guiAssembly = assemblyFolder;
    _assemblyFolderRef = assemblyFolder;

    // --- Playback ---
    const playbackFolder = assemblyFolder.addFolder('Playback');
    playbackFolder.add(assemblyGui, 'stepInfo').name('Status').disable().listen();
    playbackFolder.add(assemblyGui, 'animationLoop').name('Loop  ∞  (start ↔ finish)').listen();
    playbackFolder.add(assemblyGui, 'animationCamera').name('Camera  🎥  (animate camera)').listen();
    playbackFolder.add(assemblyGui, 'zoomCoeff', 0.1, 5.0, 0.05).name('Zoom coeff  🔍  (ortho only)').listen();
    playbackFolder.add({ fn: assemblyResetToStart }, 'fn').name('⏮  Reset to start  [Home]');
    playbackFolder.add({ fn: assemblyAnimateToStart }, 'fn').name('◀◀  Animate to start  [Shift+PgUp]');
    playbackFolder.add({ fn: assemblyPrevStep }, 'fn').name('◀  Previous step  [PageUp]');
    playbackFolder.add({ fn: assemblyNextStep }, 'fn').name('Next step  ▶  [PageDown]');
    playbackFolder.add({ fn: assemblyAnimateToFinish }, 'fn').name('Animate to finish  ▶▶  [Shift+PgDn]');
    playbackFolder.add({ fn: assemblyResetToFinish }, 'fn').name('Reset to finish  ⏭  [End]');

    // --- Animation Settings ---
    const gsapFolder = playbackFolder.addFolder('Animation Settings');
    gsapFolder.close();
    gsapFolder.add(assemblyGui, 'animationDuration', 0, 2000, 50).name('Duration (ms)');
    gsapFolder.add(assemblyGui, 'animationEase', [
        'none',
        'power1.in', 'power1.out', 'power1.inOut',
        'power2.in', 'power2.out', 'power2.inOut',
        'power3.in', 'power3.out', 'power3.inOut',
        'power4.in', 'power4.out', 'power4.inOut',
        'back.in', 'back.out', 'back.inOut',
        'bounce.in', 'bounce.out', 'bounce.inOut',
        'elastic.in', 'elastic.out', 'elastic.inOut',
        'circ.in', 'circ.out', 'circ.inOut',
        'expo.in', 'expo.out', 'expo.inOut',
        'sine.in', 'sine.out', 'sine.inOut',
    ]).name('Ease');
    gsapFolder.add(assemblyGui, 'animationRepeat', -1, 10, 1).name('Repeat (-1=∞)');
    gsapFolder.add(assemblyGui, 'animationDelay', 0, 2000, 50).name('Delay (ms)');
    gsapFolder.add(assemblyGui, 'animationRepeatDelay', 0, 2000, 50).name('Repeat delay (ms)');
    gsapFolder.add(assemblyGui, 'animationYoyo').name('Yoyo');
    gsapFolder.add(assemblyGui, 'animationStagger', 0, 1000, 10).name('Stagger (ms)');
    gsapFolder.add(assemblyGui, 'animationOverwrite', ['auto', 'true', 'false']).name('Overwrite');

    playbackFolder.close();

    // --- Edit ---
    const editFolder = assemblyFolder.addFolder('Edit');
    editFolder.add(assemblyGui, 'editMode').name('Edit mode').onChange(function(value) {
        assemblyState.editMode = value;
        editControls.forEach(c => value ? c.enable() : c.disable());
        updateAssemblyStepHelpers();
        console.log(`[Assembly] Edit mode: ${value}`);
    }).listen();
    editFolder.add(assemblyGui, 'editStepInfo').name('Active step').disable().listen();

    // Controls that are enabled only in edit mode
    const editControls = [];
    editControls.push( editFolder.add(assemblyGui, 'stepName').name('Step name').onFinishChange(function(value) {
        const ci = assemblyState.currentStepIndex;
        if (ci >= 0 && ci < assemblyData.steps.length) {
            assemblyData.steps[ci].name = value;
            updateAssemblyGuiInfo();
        }
    }).listen() );
    editControls.push( editFolder.add(assemblyGui, 'stepDescription').name('Description').onFinishChange(function(value) {
        const ci = assemblyState.currentStepIndex;
        if (ci >= 0 && ci < assemblyData.steps.length) {
            assemblyData.steps[ci].description = value;
        }
    }).listen() );
    editControls.push( editFolder.add({ fn: assemblyNewStep }, 'fn').name('+ New step') );
    editControls.push( editFolder.add({ fn: assemblyDeleteStep }, 'fn').name('✕  Delete step') );
    editControls.push( editFolder.add({ fn: assemblyMoveStepUp }, 'fn').name('↑  Move step up') );
    editControls.push( editFolder.add({ fn: assemblyMoveStepDown }, 'fn').name('↓  Move step down') );
    editControls.push( editFolder.add({ fn: assemblyRemoveObjectFromStep }, 'fn').name('✕  Remove object from step') );
    editControls.push( editFolder.add({ fn: assemblySelectStepObjects }, 'fn').name('☑  Select step objects') );
    editControls.push( editFolder.add({ fn: assemblySaveCameraView }, 'fn').name('📷  Save camera view') );
    editControls.push( editFolder.add({ fn: assemblyClearCameraView }, 'fn').name('✕  Clear camera view') );

    // Start disabled (editMode defaults to false)
    editControls.forEach(c => c.disable());

    editFolder.close();

    registerGuiPanel('Assembly', assemblyFolder);
    updateAssemblyGuiInfo();
}

function addDocumentsGui() {
    const docsGui = new GUI({ container: guiContainer, title: 'Documents' });
    initDocumentsGui(docsGui);
    registerGuiPanel('Docs', docsGui);
}

function addAttachmentsGui() {
    const attGui = new GUI({ container: guiContainer, title: 'Files' });
    initAttachmentsGui(attGui);
    registerGuiPanel('Files', attGui);
}

function addHelpGui() {
        // Create <dialog> element once
    const aboutDialog = document.createElement('dialog');
    aboutDialog.id = 'about-dialog';
    aboutDialog.innerHTML = `
        <h2>BEDOBE</h2>
        <p>CAD Explorer</p>
        <p><strong>Created by International CAD developers community</strong></p>
        <p>BEDOBE is a web-based CAD Explorer, assembly workflow editor, and document editor built with Three.js. It allows you to load various 3D models, explore their structure, create documentation, create step-by-step assembly instructions with smooth animations and much much more.</p>
        <p><a href="mailto:info@bedobe.eu">info@bedobe.eu</a></p>
        <p>The goal of the project is to provide a publicly available <strong>CAD explorer</strong> for everyone.</p>
        <form method="dialog"><button>OK</button></form>
    `;
    aboutDialog.addEventListener('click', e => { if (e.target === aboutDialog) aboutDialog.close(); });
    document.body.appendChild(aboutDialog);

    const helpGui = new GUI({ container: guiContainer, title: 'Help' });
    helpGui.add({ fn() { openHelp('/help/guide-for-beginners.json'); } }, 'fn').name('📖 Guide for beginners');
    helpGui.add({ fn() { openHelp('/help/screen-layout.json'); } }, 'fn').name('🖥️ Screen layout');
    helpGui.add({ fn() { openHelp('/help/supported-file-formats.json'); } }, 'fn').name('📂 Supported File Formats');
    helpGui.add({ fn() { openHelp('/help/pwa-install.json'); } }, 'fn').name('📲 Install as Local App (PWA)');
    const panelHelpFolder = helpGui.addFolder('Panels');
    panelHelpFolder.add({ fn() { openHelp('/help/panel-edit.json'); } }, 'fn').name('✏️ Edit');
    panelHelpFolder.add({ fn() { openHelp('/help/panel-view.json'); } }, 'fn').name('🔭 View');
    panelHelpFolder.add({ fn() { openHelp('/help/panel-assembly.json'); } }, 'fn').name('🔩 Assembly');
    panelHelpFolder.add({ fn() { openHelp('/help/panel-docs.json'); } }, 'fn').name('📄 Docs');
    panelHelpFolder.add({ fn() { openHelp('/help/panel-files.json'); } }, 'fn').name('📎 Files');
    helpGui.add({ fn() { aboutDialog.showModal(); } }, 'fn').name('About');
    registerGuiPanel('Help', helpGui);
}

function updateAssemblyGuiInfo() {
    const n = assemblyData.steps.length;

    // Playback status
    if (assemblyState.currentStepIndex < 0) {
        assemblyGui.stepInfo = `Assembled (${n} step${n === 1 ? '' : 's'})`;
    } else {
        const step = assemblyData.steps[assemblyState.currentStepIndex];
        assemblyGui.stepInfo = `${assemblyState.currentStepIndex + 1}/${n}: ${step.name}`;
    }

    // Edit status — mirrors current playback step
    const ei = assemblyState.currentStepIndex;
    if (ei >= 0 && ei < n) {
        const es = assemblyData.steps[ei];    
        assemblyGui.editStepInfo = `${ei + 1}/${n}: (${es.transformations.length} move${es.transformations.length === 1 ? '' : 's'})${es.camera ? ' 📷' : ''}`;
        assemblyGui.stepName = es.name;
        assemblyGui.stepDescription = es.description;
    } else {
        assemblyGui.editStepInfo = 'Assembled';
        assemblyGui.stepName = '';
        assemblyGui.stepDescription = '';
    }

    updateAssemblyStepHelpers();
    rebuildAssemblyStepsList();
}

// Rebuild the "Steps" subfolder with one button per step.
function rebuildAssemblyStepsList() {
    // Remove old subfolder
    if (assemblyStepsListFolder) {
        assemblyStepsListFolder.destroy();
        assemblyStepsListFolder = null;
    }
    if (!_assemblyFolderRef) return;

    const n = assemblyData.steps.length;
    const folderTitle = n === 0 ? 'Steps (empty)' : `Steps (${n})`;
    assemblyStepsListFolder = _assemblyFolderRef.addFolder(folderTitle);

    if (n === 0) {
        assemblyStepsListFolder.close();
        return;
    }

    // Button 0: assembled (base) state
    const isAssembled = assemblyState.currentStepIndex === -1;
    const assembledBtn = { go: function() { assemblyGoToAssembled(); } };
    assemblyStepsListFolder.add(assembledBtn, 'go').name(`${isAssembled ? '▶ ' : '   '}0:  Assembled`);

    assemblyData.steps.forEach((step, i) => {
        const isActive = i === assemblyState.currentStepIndex;
        const camIcon  = step.camera ? '  📷' : '';
        const label = `${isActive ? '▶ ' : '   '}${i + 1}:  ${step.name}${camIcon}`;
        const btn = { go: function() { assemblyGoToStep(i); } };
        const ctrl = assemblyStepsListFolder.add(btn, 'go').name(label);
        if (step.camera) {
            const btnEl = ctrl.domElement.querySelector('button');
            if (btnEl) {
                btnEl.style.color = '#f0c040';
                btnEl.style.fontWeight = 'bold';
            }
        }
    });

    assemblyStepsListFolder.open();
}

// Animate to the fully assembled state (step 0 plays backward, final → init).
// Snap scene to the state just before step at snapIndex (all steps 0..snapIndex applied),
// then delegate to assemblyPrevStep() or assemblyNextStep() for the animated boundary move.
function _snapAndAnimate(snapIndex, goingForward) {
    // Reset all objects to assembled (init) positions
    [...assemblyData.steps].reverse().forEach(step => {
        step.transformations.forEach(t => {
            t.objectRef.position.set(t.initPosition.x, t.initPosition.y, t.initPosition.z);
        });
    });
    // Apply steps 0..snapIndex instantly
    for (let i = 0; i <= snapIndex; i++) {
        assemblyData.steps[i].transformations.forEach(t => {
            t.objectRef.position.set(t.finalPosition.x, t.finalPosition.y, t.finalPosition.z);
        });
    }
    assemblyState.currentStepIndex = snapIndex;
    render();
    goingForward ? assemblyNextStep() : assemblyPrevStep();
}

// Animate to the fully assembled state (step 0 plays backward).
function assemblyGoToAssembled() {
    if (assemblyState.currentStepIndex === -1) return;
    _snapAndAnimate(0, false);
}

// Jump directly to a given step index (0-based), animating only the boundary move.
function assemblyGoToStep(targetIndex) {
    if (targetIndex < 0 || targetIndex >= assemblyData.steps.length) return;
    if (targetIndex === assemblyState.currentStepIndex) return;

    if (assemblyAnimation) { assemblyAnimation.kill(); assemblyAnimation = null; }

    if (targetIndex > assemblyState.currentStepIndex) {
        // Forward: snap to targetIndex-1, animate targetIndex forward
        _snapAndAnimate(targetIndex - 1, true);
    } else {
        // Backward: snap to targetIndex+1, animate targetIndex+1 backward
        _snapAndAnimate(targetIndex + 1, false);
    }
}

// Records assembly transformations for all objects in an active group selection.
// Positions are computed in each object's original-parent local space to survive deactivation.
function recordGroupTransformations() {
    const step = assemblyData.steps[assemblyState.currentStepIndex];
    if (!step) return;

    previousGroupTransformStates.forEach((state, i) => {
        const obj = state.object;
        // Get current world matrix (object is still parented to pivot)
        obj.updateWorldMatrix(true, false);
        const finalWorldMatrix = obj.matrixWorld.clone();
        const initWorldMatrix = state.worldMatrix;

        // Convert both world matrices to original parent's local space
        const originalParent = multiOriginalParents[i];
        let initLocalMatrix = initWorldMatrix.clone();
        let finalLocalMatrix = finalWorldMatrix.clone();
        if (originalParent) {
            originalParent.updateWorldMatrix(true, false);
            const invParent = new THREE.Matrix4().copy(originalParent.matrixWorld).invert();
            initLocalMatrix.premultiply(invParent);
            finalLocalMatrix.premultiply(invParent);
        }

        // Decompose both matrices
        const initPos = new THREE.Vector3(), initQuat = new THREE.Quaternion(), initScale = new THREE.Vector3();
        const finalPos = new THREE.Vector3(), finalQuat = new THREE.Quaternion(), finalScale = new THREE.Vector3();
        initLocalMatrix.decompose(initPos, initQuat, initScale);
        finalLocalMatrix.decompose(finalPos, finalQuat, finalScale);

        // Ignore trivial zero-moves/rotations/scales
        const posDelta = finalPos.distanceTo(initPos);
        const rotDelta = initQuat.angleTo(finalQuat);
        const scaleDelta = finalScale.distanceTo(initScale);
        if (posDelta < 0.0001 && rotDelta < 0.0001 && scaleDelta < 0.0001) return;

        const existing = step.transformations.find(t => t.objectRef === obj);
        if (existing) {
            existing.finalPosition  = { x: finalPos.x,  y: finalPos.y,  z: finalPos.z };
            existing.finalQuaternion = { x: finalQuat.x, y: finalQuat.y, z: finalQuat.z, w: finalQuat.w };
            existing.finalScale     = { x: finalScale.x, y: finalScale.y, z: finalScale.z };
        } else {
            // Store the assembled base state the first time this object enters any step
            if (!assemblyAnchors.has(obj)) {
                assemblyAnchors.set(obj, {
                    position:   { x: initPos.x,  y: initPos.y,  z: initPos.z },
                    quaternion: { x: initQuat.x, y: initQuat.y, z: initQuat.z, w: initQuat.w },
                    scale:      { x: initScale.x, y: initScale.y, z: initScale.z },
                });
            }
            step.transformations.push({
                objectRef: obj,
                initPosition:   { x: initPos.x,  y: initPos.y,  z: initPos.z },
                finalPosition:  { x: finalPos.x,  y: finalPos.y,  z: finalPos.z },
                initQuaternion:  { x: initQuat.x, y: initQuat.y, z: initQuat.z, w: initQuat.w },
                finalQuaternion: { x: finalQuat.x, y: finalQuat.y, z: finalQuat.z, w: finalQuat.w },
                initScale:  { x: initScale.x, y: initScale.y, z: initScale.z },
                finalScale: { x: finalScale.x, y: finalScale.y, z: finalScale.z },
            });
        }
        repairChainForObject(obj);
        console.log(`[Assembly] Step ${step.id} "${step.name}": recorded transform of object "${obj.name}" (group)`);
    });

    previousGroupTransformStates = [];
    updateAssemblyGuiInfo();
}

// Called at end of a TransformControls drag when editMode is active.
function recordAssemblyTransformation() {
    const obj = previousTransformState?.object;
    if (!obj || !previousTransformState) return;
    const step = assemblyData.steps[assemblyState.currentStepIndex];
    if (!step) return;

    const prevPos   = previousTransformState.position;   // THREE.Vector3
    const prevRot   = previousTransformState.rotation;   // THREE.Euler
    const prevScale = previousTransformState.scale;      // THREE.Vector3

    const prevQuat = new THREE.Quaternion().setFromEuler(prevRot);
    const curQuat  = new THREE.Quaternion().setFromEuler(obj.rotation);

    // Ignore trivial no-ops
    const posDelta   = obj.position.distanceTo(prevPos);
    const rotDelta   = prevQuat.angleTo(curQuat);
    const scaleDelta = obj.scale.distanceTo(prevScale);
    if (posDelta < 0.0001 && rotDelta < 0.0001 && scaleDelta < 0.0001) return;

    // Check if this object is already tracked in this step
    const existing = step.transformations.find(t => t.objectRef === obj);
    if (existing) {
        // Keep original init values, only update the final destinations
        existing.finalPosition   = { x: obj.position.x, y: obj.position.y, z: obj.position.z };
        existing.finalQuaternion = { x: curQuat.x, y: curQuat.y, z: curQuat.z, w: curQuat.w };
        existing.finalScale      = { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z };
    } else {
        // Store the assembled base state the first time this object enters any step
        if (!assemblyAnchors.has(obj)) {
            assemblyAnchors.set(obj, {
                position:   { x: prevPos.x, y: prevPos.y, z: prevPos.z },
                quaternion: { x: prevQuat.x, y: prevQuat.y, z: prevQuat.z, w: prevQuat.w },
                scale:      { x: prevScale.x, y: prevScale.y, z: prevScale.z },
            });
        }
        step.transformations.push({
            objectRef: obj,
            initPosition:   { x: prevPos.x, y: prevPos.y, z: prevPos.z },
            finalPosition:  { x: obj.position.x, y: obj.position.y, z: obj.position.z },
            initQuaternion:  { x: prevQuat.x, y: prevQuat.y, z: prevQuat.z, w: prevQuat.w },
            finalQuaternion: { x: curQuat.x, y: curQuat.y, z: curQuat.z, w: curQuat.w },
            initScale:  { x: prevScale.x, y: prevScale.y, z: prevScale.z },
            finalScale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
        });
    }

    repairChainForObject(obj);
    console.log(`[Assembly] Step ${step.id} "${step.name}": recorded transform of object "${obj.name}"`);
    updateAssemblyGuiInfo();
}

// Propagate finalPosition of each step as initPosition of the next step for the same object.
// Uses assemblyAnchors as the stable base state so results are order-independent.
function repairChainForObject(objectRef) {
    const anchor = assemblyAnchors.get(objectRef);
    let lastPos   = anchor ? anchor.position   : null;
    let lastQuat  = anchor ? anchor.quaternion : null;
    let lastScale = anchor ? anchor.scale      : null;

    for (const step of assemblyData.steps) {
        const t = step.transformations.find(tr => tr.objectRef === objectRef);
        if (!t) continue;

        if (lastPos !== null) {
            t.initPosition   = { ...lastPos };
            if (lastQuat)  t.initQuaternion  = { ...lastQuat };
            if (lastScale) t.initScale       = { ...lastScale };
        }

        lastPos   = t.finalPosition;
        lastQuat  = t.finalQuaternion;
        lastScale = t.finalScale;
    }
}

// Repair the full step chain for every object that appears in any step.
// Not called in the normal edit flow (targeted repairChainForObject is used instead).
// Reserved for bulk repairs, e.g. after import or future batch operations.
function repairChain() {
    const allObjects = new Set();
    assemblyData.steps.forEach(step => {
        step.transformations.forEach(t => allObjects.add(t.objectRef));
    });
    allObjects.forEach(obj => repairChainForObject(obj));
    console.log('[Assembly] Chain repaired.');
}

// Animate all transformations in a step forward (disassembly) or backward (assembly).
function animateAssemblyStep(transformations, forward, onComplete) {
    if (assemblyAnimation) {
        assemblyAnimation.kill();
        assemblyAnimation = null;
    }
    assemblyAnimationFinalize = null;

    const duration = assemblyGui.animationDuration;

    // Helper: apply all transform components at a given interpolation alpha
    function applyTransforms(tList, startStates, alpha) {
        tList.forEach((tr, i) => {
            const s = startStates[i];
            tr.objectRef.position.lerpVectors(s.pos, s.targetPos, alpha);
            if (s.hasRot)   tr.objectRef.quaternion.slerpQuaternions(s.quat, s.targetQuat, alpha);
            if (s.hasScale) tr.objectRef.scale.lerpVectors(s.scale, s.targetScale, alpha);
        });
    }

    // Build start+target state for each transformation
    const startStates = transformations.map(tr => {
        const tgtP = forward ? tr.finalPosition  : tr.initPosition;
        const tgtQ = forward ? tr.finalQuaternion : tr.initQuaternion;
        const tgtS = forward ? tr.finalScale     : tr.initScale;
        const hasRot   = !!(tr.initQuaternion && tr.finalQuaternion);
        const hasScale = !!(tr.initScale && tr.finalScale);
        return {
            pos:       tr.objectRef.position.clone(),
            targetPos: new THREE.Vector3(tgtP.x, tgtP.y, tgtP.z),
            quat:       tr.objectRef.quaternion.clone(),
            targetQuat: hasRot   ? new THREE.Quaternion(tgtQ.x, tgtQ.y, tgtQ.z, tgtQ.w) : null,
            scale:       tr.objectRef.scale.clone(),
            targetScale: hasScale ? new THREE.Vector3(tgtS.x, tgtS.y, tgtS.z) : null,
            hasRot,
            hasScale,
        };
    });

    // Store finalizer: call to snap objects to their target positions (useful when interrupting).
    // Nemůže být definovaná jako globální. Neměla by přístup k ""
    assemblyAnimationFinalize = () => {
        if (assemblyAnimation) {
            assemblyAnimation.kill();
            assemblyAnimation = null;
        }
        applyTransforms(transformations, startStates, 1);
        if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) updateCrossSectionLines();
        if (viewProp.sectionCrossLines) updateSectionCrossLines();
        render();
        assemblyAnimationFinalize = null;
    };

    // Instant move when duration === 0
    if (duration <= 0) {
        applyTransforms(transformations, startStates, 1);
        if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) updateCrossSectionLines();
        if (viewProp.sectionCrossLines) updateSectionCrossLines();
        render();
        assemblyAnimationFinalize = null;
        if (onComplete) onComplete();
        return;
    }

    // GSAP tween: animate a progress proxy from 0 → 1 and apply transforms in onUpdate
    const overwriteVal = assemblyGui.animationOverwrite === 'true'  ? true
                       : assemblyGui.animationOverwrite === 'false' ? false
                       : 'auto';
    const durationSec     = duration / 1000;
    const delaySec        = assemblyGui.animationDelay / 1000;
    const repeatDelaySec  = assemblyGui.animationRepeatDelay / 1000;
    const staggerSec      = assemblyGui.animationStagger / 1000;

    const sharedCfg = {
        duration:     durationSec,
        ease:         assemblyGui.animationEase,
        repeat:       assemblyGui.animationRepeat,
        repeatDelay:  repeatDelaySec,
        yoyo:         assemblyGui.animationYoyo,
        overwrite:    overwriteVal,
    };

    if (staggerSec <= 0) {
        // Single proxy – all objects animate in lock-step
        const proxy = { t: 0 };
        assemblyAnimation = gsap.to(proxy, {
            ...sharedCfg,
            t: 1,
            delay: delaySec,
            onUpdate() {
                applyTransforms(transformations, startStates, proxy.t);
                assemblyStepHelpers.forEach(h => h.update());
                if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) updateCrossSectionLines();
                if (viewProp.sectionCrossLines) updateSectionCrossLines();
                render();
            },
            onComplete() {
                assemblyAnimation = null;
                assemblyAnimationFinalize = null;
                if (viewProp.sectionCrossLines) { updateSectionCrossLines(); render(); }
                if (onComplete) onComplete();
            },
        });
    } else {
        // Timeline – each object animates with a stagger offset
        const tl = gsap.timeline({
            delay: delaySec,
            onComplete() {
                assemblyAnimation = null;
                assemblyAnimationFinalize = null;
                if (viewProp.sectionCrossLines) { updateSectionCrossLines(); render(); }
                if (onComplete) onComplete();
            },
        });
        transformations.forEach((tr, i) => {
            const proxy = { t: 0 };
            const s = startStates[i];
            tl.to(proxy, {
                ...sharedCfg,
                t: 1,
                onUpdate() {
                    tr.objectRef.position.lerpVectors(s.pos, s.targetPos, proxy.t);
                    if (s.hasRot)   tr.objectRef.quaternion.slerpQuaternions(s.quat, s.targetQuat, proxy.t);
                    if (s.hasScale) tr.objectRef.scale.lerpVectors(s.scale, s.targetScale, proxy.t);
                    assemblyStepHelpers.forEach(h => h.update());
                    if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) updateCrossSectionLines();
                    if (viewProp.sectionCrossLines) updateSectionCrossLines();
                    render();
                },
            }, i * staggerSec);
        });
        assemblyAnimation = tl;
    }
}

// Reset to the fully disassembled state (all steps applied).
function assemblyResetToFinish() {
    if (assemblyAnimation) {
        assemblyAnimation.kill();
        assemblyAnimation = null;
    }
    if (assemblyData.steps.length === 0) return;

    // Apply every step's final transforms instantly
    assemblyData.steps.forEach(step => {
        step.transformations.forEach(t => {
            t.objectRef.position.set(t.finalPosition.x, t.finalPosition.y, t.finalPosition.z);
            if (t.finalQuaternion) t.objectRef.quaternion.set(t.finalQuaternion.x, t.finalQuaternion.y, t.finalQuaternion.z, t.finalQuaternion.w);
            if (t.finalScale)      t.objectRef.scale.set(t.finalScale.x, t.finalScale.y, t.finalScale.z);
        });
    });

    assemblyState.currentStepIndex = assemblyData.steps.length - 1;
    updateAssemblyGuiInfo();
    if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) updateCrossSectionLines();
    if (viewProp.sectionCrossLines) updateSectionCrossLines();
    render();
}

// Reset every object to its original loaded position (fully assembled state).
function assemblyResetToStart() {
    if (assemblyAnimation) {
        assemblyAnimation.kill();
        assemblyAnimation = null;
    }

    // Return all objects to their initial transforms by reversing all transformations.
    // Iterate in reverse so that the first step's init values (the true original state)
    // are applied last and win for objects that appear in multiple steps.
    [...assemblyData.steps].reverse().forEach(step => {
        step.transformations.forEach(t => {
            t.objectRef.position.set(t.initPosition.x, t.initPosition.y, t.initPosition.z);
            if (t.initQuaternion) t.objectRef.quaternion.set(t.initQuaternion.x, t.initQuaternion.y, t.initQuaternion.z, t.initQuaternion.w);
            if (t.initScale)      t.objectRef.scale.set(t.initScale.x, t.initScale.y, t.initScale.z);
        });
    });

    assemblyState.currentStepIndex = -1;
    updateAssemblyGuiInfo();
    if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) updateCrossSectionLines();
    if (viewProp.sectionCrossLines) updateSectionCrossLines();
    render();
}

// Animate all remaining steps forward from current position to the last step.
function assemblyAnimateToFinish() {
    const totalSteps = assemblyData.steps.length;
    if (totalSteps === 0 || assemblyState.currentStepIndex >= totalSteps - 1) return;

    let cancelled = false;

    function animateNext() {
        if (cancelled) return;
        const nextIndex = assemblyState.currentStepIndex + 1;
        if (nextIndex >= totalSteps) {
            // Reached finish — if loop enabled, bounce back to start
            if (assemblyGui.animationLoop) {
                assemblyAnimateToStart();
            }
            return;
        }

        const step = assemblyData.steps[nextIndex];
        assemblyState.currentStepIndex = nextIndex;
        updateAssemblyGuiInfo();

        const useCamera = step.camera && assemblyGui.animationCamera;

        if (step.transformations.length === 0) {
            if (useCamera) {
                animateCameraToView(step.camera, () => animateNext());
            } else {
                animateNext();
            }
            return;
        }

        if (useCamera) {
            // Camera animates first, then parts move.
            animateCameraToView(step.camera, () => {
                animateAssemblyStep(step.transformations, true, () => animateNext());
            });
        } else {
            animateAssemblyStep(step.transformations, true, () => animateNext());
        }
    }

    animateNext();
}

// Animate all remaining steps backward from current position to the assembled state.
function assemblyAnimateToStart() {
    if (assemblyState.currentStepIndex < 0) return;

    function animatePrev() {
        if (assemblyState.currentStepIndex < 0) {
            // Reached start — if loop enabled, bounce forward to finish
            if (assemblyGui.animationLoop) {
                assemblyAnimateToFinish();
            }
            return;
        }

        const step = assemblyData.steps[assemblyState.currentStepIndex];

        const afterTransforms = () => {
            assemblyState.currentStepIndex--;
            updateAssemblyGuiInfo();
            animatePrev();
        };

        const useCamera = step.camera && assemblyGui.animationCamera;

        if (step.transformations.length === 0) {
            if (useCamera) {
                animateCameraToView(step.camera, () => afterTransforms());
            } else {
                afterTransforms();
            }
            return;
        }

        if (useCamera) {
            // Camera animates first, then parts move back.
            animateCameraToView(step.camera, () => {
                animateAssemblyStep(step.transformations, false, () => afterTransforms());
            });
        } else {
            animateAssemblyStep(step.transformations, false, () => afterTransforms());
        }
    }

    animatePrev();
}

// Apply the next disassembly step (move objects to finalPosition).
function assemblyNextStep() {
    // Snap any in-flight animations to their end state before advancing to the next step.
    // Camera first: its finalizer calls onComplete which may start the assembly animation.
    cameraAnimationFinalize?.();
    cameraAnimationFinalize = null;
    // Then snap any (possibly just-started) assembly animation.
    assemblyAnimationFinalize?.();
    assemblyAnimationFinalize = null;

    const nextIndex = assemblyState.currentStepIndex + 1;
    if (nextIndex >= assemblyData.steps.length) {
        console.log('[Assembly] No more steps – end of disassembly.');
        return;
    }

    const step = assemblyData.steps[nextIndex];
    const useCamera = step.camera && assemblyGui.animationCamera;
    if (step.transformations.length === 0) {
        assemblyState.currentStepIndex = nextIndex;
        updateAssemblyGuiInfo();
        if (useCamera) animateCameraToView(step.camera);
        console.log(`[Assembly] → Step ${nextIndex + 1}: "${step.name}" (no moves)`);
        return;
    }

    // Commit state before animating so mid-animation reversals always have correct currentStepIndex.
    assemblyState.currentStepIndex = nextIndex;
    updateAssemblyGuiInfo();
    if (useCamera) {
        // Camera animates first, then parts move.
        animateCameraToView(step.camera, () => {
            animateAssemblyStep(step.transformations, true, () => {
                console.log(`[Assembly] → Step ${nextIndex + 1}/${assemblyData.steps.length}: "${step.name}"`);
            });
        });
    } else {
        animateAssemblyStep(step.transformations, true, () => {
            console.log(`[Assembly] → Step ${nextIndex + 1}/${assemblyData.steps.length}: "${step.name}"`);
        });
    }
}

// Undo the current disassembly step (move objects back to initPosition).
function assemblyPrevStep() {
    // Snap any in-flight animations to their end state before reversing to the previous step.
    // Camera first: its finalizer calls onComplete which may start the assembly animation.
    cameraAnimationFinalize?.();
    cameraAnimationFinalize = null;
    // Then snap any (possibly just-started) assembly animation.
    assemblyAnimationFinalize?.();
    assemblyAnimationFinalize = null;

    if (assemblyState.currentStepIndex < 0) {
        console.log('[Assembly] Already at the start.');
        return;
    }

    const step = assemblyData.steps[assemblyState.currentStepIndex];
    const useCamera = step.camera && assemblyGui.animationCamera;
    if (step.transformations.length === 0) {
        assemblyState.currentStepIndex--;
        updateAssemblyGuiInfo();
        if (useCamera) animateCameraToView(step.camera);
        return;
    }

    // Commit state before animating so mid-animation reversals always have correct currentStepIndex.
    assemblyState.currentStepIndex--;
    updateAssemblyGuiInfo();
    // Fix: override helpers to track the step being reversed (not the decremented index).
    if (assemblyState.editMode) updateAssemblyStepHelpers(step);
    const logBack = () => {
        const label = assemblyState.currentStepIndex < 0
            ? 'Assembled'
            : `Step ${assemblyState.currentStepIndex + 1}: "${assemblyData.steps[assemblyState.currentStepIndex].name}"`;
        console.log(`[Assembly] ← Back → ${label}`);
        updateAssemblyStepHelpers(); // switch helpers to new current step after animation
    };
    if (useCamera) {
        // Camera animates first, then parts move back.
        animateCameraToView(step.camera, () => {
            animateAssemblyStep(step.transformations, false, logBack);
        });
    } else {
        animateAssemblyStep(step.transformations, false, logBack);
    }
}

// Save the current camera position + orbit target into the active step.
function assemblySaveCameraView() {
    const ci = assemblyState.currentStepIndex;
    if (ci < 0 || ci >= assemblyData.steps.length) {
        console.log('[Assembly] No step selected – select a step first.');
        return;
    }
    const step = assemblyData.steps[ci];
    step.camera = {
        position: { x: currentCamera.position.x, y: currentCamera.position.y, z: currentCamera.position.z },
        target:   { x: orbitControls.target.x,   y: orbitControls.target.y,   z: orbitControls.target.z   },
        zoom:     currentCamera.zoom,
    };
    updateAssemblyGuiInfo();
    console.log(`[Assembly] Camera view saved to step "${step.name}".`);
}

// Remove the saved camera view from the active step.
function assemblyClearCameraView() {
    const ci = assemblyState.currentStepIndex;
    if (ci < 0 || ci >= assemblyData.steps.length) return;
    const step = assemblyData.steps[ci];
    delete step.camera;
    updateAssemblyGuiInfo();
    console.log(`[Assembly] Camera view cleared from step "${step.name}".`);
}

// Animate (or snap) the camera to a saved camera view { position, target, zoom }.
// onComplete is called when the animation finishes (or immediately when duration === 0).
function animateCameraToView(camData, onComplete) {
    if (!camData) { onComplete?.(); return; }
    if (cameraAnimation) {
        cameraAnimation.kill();
        cameraAnimation = null;
    }
    cameraAnimationFinalize = null;
    const duration = assemblyGui.animationDuration;
    const startPos    = currentCamera.position.clone();
    const startTarget = orbitControls.target.clone();
    const endPos    = new THREE.Vector3(camData.position.x, camData.position.y, camData.position.z);
    const endTarget = new THREE.Vector3(camData.target.x,   camData.target.y,   camData.target.z);

    const startZoom = currentCamera.zoom;
    const zoomCoeff = (currentCamera === cameraOrtho && camData.zoom != null) ? assemblyGui.zoomCoeff : 1;
    const endZoom   = (camData.zoom != null) ? camData.zoom * zoomCoeff : startZoom;

    // Skip animation if camera is already at the target view.
    const EPS = 1e-6;
    if (
        startPos.distanceToSquared(endPos)       < EPS &&
        startTarget.distanceToSquared(endTarget) < EPS &&
        Math.abs(startZoom - endZoom)            < EPS
    ) {
        onComplete?.();
        return;
    }

    // Store finalizer: snap camera to its target state and call onComplete (useful when interrupting).
    cameraAnimationFinalize = () => {
        if (cameraAnimation) {
            cameraAnimation.kill();
            cameraAnimation = null;
        }
        currentCamera.position.copy(endPos);
        orbitControls.target.copy(endTarget);
        currentCamera.zoom = endZoom;
        currentCamera.updateProjectionMatrix();
        orbitControls.update();
        render();
        cameraAnimationFinalize = null;
        onComplete?.();
    };

    if (duration <= 0) {
        currentCamera.position.copy(endPos);
        orbitControls.target.copy(endTarget);
        currentCamera.zoom = endZoom;
        currentCamera.updateProjectionMatrix();
        orbitControls.update();
        render();
        cameraAnimationFinalize = null;
        onComplete?.();
        return;
    }

    const proxy = { t: 0 };
    cameraAnimation = gsap.to(proxy, {
        t: 1,
        duration: duration / 1000,
        ease: assemblyGui.animationEase,
        onUpdate() {
            currentCamera.position.lerpVectors(startPos, endPos, proxy.t);
            orbitControls.target.lerpVectors(startTarget, endTarget, proxy.t);
            currentCamera.zoom = startZoom + (endZoom - startZoom) * proxy.t;
            currentCamera.updateProjectionMatrix();
            orbitControls.update();
            render();
        },
        onComplete() {
            cameraAnimation = null;
            cameraAnimationFinalize = null;
            onComplete?.();
        },
    });
}

// Create a new empty step and make it the active edit step.
function assemblyNewStep() {
    const id = assemblyData.steps.length + 1;
    assemblyData.steps.push({
        id: id,
        name: `Step ${id}`,
        description: '',
        transformations: [],
    });
    // New step becomes the active playback/edit step
    assemblyState.currentStepIndex = assemblyData.steps.length - 1;
    updateAssemblyGuiInfo();
    console.log(`[Assembly] New step ${id} created.`);
}

// Remove the currently selected object from the current step's transformations.
function assemblyRemoveObjectFromStep() {
    const ci = assemblyState.currentStepIndex;
    if (ci < 0 || ci >= assemblyData.steps.length) {
        console.log('[Assembly] No step selected – select a step using the playback controls.');
        return;
    }
    if (!lastSelectedObject) {
        console.log('[Assembly] No object selected.');
        return;
    }
    const step = assemblyData.steps[ci];
    const before = step.transformations.length;

    // Check the object is actually in this step before asking
    const isInStep = step.transformations.some(t => t.objectRef === lastSelectedObject);
    if (!isInStep) {
        console.log(`[Assembly] Object "${lastSelectedObject.name}" not found in step "${step.name}".`);
        return;
    }

    if (!confirm(`Remove "${lastSelectedObject.name}" from step "${step.name}"?`)) return;

    step.transformations = step.transformations.filter(t => t.objectRef !== lastSelectedObject);
    const removed = before - step.transformations.length;
    if (removed > 0) {
        // Repair the chain so following steps get correct init values
        repairChainForObject(lastSelectedObject);
        console.log(`[Assembly] Object "${lastSelectedObject.name}" removed from step "${step.name}".`);
    }
    updateAssemblyGuiInfo();
}

// Delete the currently selected edit step.
function assemblyDeleteStep() {
    const ei = assemblyState.currentStepIndex;
    if (ei < 0 || ei >= assemblyData.steps.length) {
        console.log('[Assembly] No step to delete – select a step using the playback controls.');
        return;
    }
    const step = assemblyData.steps[ei];
    if (!confirm(`Delete step "${step.name}"?`)) return;

    // Collect affected objects before removal (needed for chain repair below)
    const affectedObjects = step.transformations.map(t => t.objectRef);

    // Reset objects in this step to their init transforms before removing the step
    step.transformations.forEach(t => {
        t.objectRef.position.set(t.initPosition.x, t.initPosition.y, t.initPosition.z);
        if (t.initQuaternion) t.objectRef.quaternion.set(t.initQuaternion.x, t.initQuaternion.y, t.initQuaternion.z, t.initQuaternion.w);
        if (t.initScale)      t.objectRef.scale.set(t.initScale.x, t.initScale.y, t.initScale.z);
    });

    assemblyData.steps.splice(ei, 1);
    assemblyData.steps.forEach((s, i) => { s.id = i + 1; });
    if (assemblyState.currentStepIndex >= assemblyData.steps.length) {
        assemblyState.currentStepIndex = assemblyData.steps.length - 1;
    }

    // Repair the step chain for all affected objects so the following step's
    // initPosition/Quaternion/Scale reflects the deleted step's absence.
    affectedObjects.forEach(obj => repairChainForObject(obj));

    updateAssemblyGuiInfo();
    render();
    console.log(`[Assembly] Step "${step.name}" deleted, objects reset to init positions.`);
}

// Move the edit step one position up (earlier) in the sequence.
function assemblyMoveStepUp() {
    const ei = assemblyState.currentStepIndex;
    if (ei <= 0) return;
    [assemblyData.steps[ei], assemblyData.steps[ei - 1]] = [assemblyData.steps[ei - 1], assemblyData.steps[ei]];
    assemblyData.steps.forEach((s, i) => { s.id = i + 1; });
    assemblyState.currentStepIndex = ei - 1;
    // Only repair objects that appear in the two swapped steps
    const affectedUp = new Set([
        ...assemblyData.steps[ei - 1].transformations.map(t => t.objectRef),
        ...assemblyData.steps[ei].transformations.map(t => t.objectRef),
    ]);
    affectedUp.forEach(obj => repairChainForObject(obj));
    updateAssemblyGuiInfo();
    console.log(`[Assembly] Step moved up → position ${assemblyState.currentStepIndex + 1}.`);
}

// Move the edit step one position down (later) in the sequence.
function assemblyMoveStepDown() {
    const ei = assemblyState.currentStepIndex;
    if (ei < 0 || ei >= assemblyData.steps.length - 1) return;
    [assemblyData.steps[ei], assemblyData.steps[ei + 1]] = [assemblyData.steps[ei + 1], assemblyData.steps[ei]];
    assemblyData.steps.forEach((s, i) => { s.id = i + 1; });
    assemblyState.currentStepIndex = ei + 1;
    // Only repair objects that appear in the two swapped steps
    const affectedDown = new Set([
        ...assemblyData.steps[ei].transformations.map(t => t.objectRef),
        ...assemblyData.steps[ei + 1].transformations.map(t => t.objectRef),
    ]);
    affectedDown.forEach(obj => repairChainForObject(obj));
    updateAssemblyGuiInfo();
    console.log(`[Assembly] Step moved down → position ${assemblyState.currentStepIndex + 1}.`);
}

// ---- Context menus (RMB) -----------------------------------------------------------------------
(function initContextMenus() {

    // --- Helpers ---
    function separator() {
        const s = document.createElement('div');
        s.className = 'ctx-separator';
        return s;
    }

    function simpleItem(text, fn) {
        const it = document.createElement('div');
        it.className = 'ctx-item';
        it.textContent = text;
        it.addEventListener('click', fn);
        return it;
    }

    // --- Build empty-space menu ---
    function createEmptyMenu() {
        const m = document.createElement('div');
        m.className = 'ctx-menu hidden';

        const lbl = document.createElement('div');
        lbl.className = 'ctx-label';
        lbl.textContent = 'Scene';
        m.appendChild(lbl);

        // Allow selection (checkbox)
        const itemSel = document.createElement('div');
        itemSel.className = 'ctx-item';
        const chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.id = 'ctx-chk-select';
        const chkLbl = document.createElement('label');
        chkLbl.htmlFor = 'ctx-chk-select';
        chkLbl.textContent = 'Allow selection';
        chkLbl.style.cursor = 'pointer';
        itemSel.appendChild(chk);
        itemSel.appendChild(chkLbl);
        itemSel.addEventListener('click', (e) => {
            e.stopPropagation();
            viewProp.isSelectAllowed = !viewProp.isSelectAllowed;
            chk.checked = viewProp.isSelectAllowed;
            hideAll();
        });
        m.appendChild(itemSel);

        m.appendChild(separator());

        m.appendChild(simpleItem('Fit view', () => { fitView(); hideAll(); }));

        m.appendChild(separator());

        m.appendChild(simpleItem('Show hidden objects', () => { showHiddenObjects(); hideAll(); }));
        m.appendChild(simpleItem('Switch hidden objects', () => { toggleHiddenObjects(); hideAll(); }));

        m.appendChild(separator());

        // View orientation (submenu)
        const itemView = document.createElement('div');
        itemView.className = 'ctx-item has-sub';
        itemView.innerHTML = 'View orientation';
        const subView = document.createElement('div');
        subView.className = 'ctx-submenu';
        [
            ['View from X', () => viewFromPoint(1000, 0, 0)],
            ['View from Y', () => viewFromPoint(0, 1000, 0)],
            ['View from Z', () => viewFromPoint(0, 0, 1000)],
        ].forEach(([name, fn]) => {
            subView.appendChild(simpleItem(name, () => { fn(); hideAll(); }));
        });
        itemView.appendChild(subView);
        m.appendChild(itemView);

        return m;
    }

    // --- Build object menu ---
    function createObjectMenu() {
        const m = document.createElement('div');
        m.className = 'ctx-menu hidden';

        const lbl = document.createElement('div');
        lbl.className = 'ctx-label';
        lbl.id = 'ctx-obj-label';
        lbl.textContent = 'Object';
        m.appendChild(lbl);

        // Hide object
        m.appendChild(simpleItem('Hide object', () => {
            if (lastSelectedObject) hideObject(lastSelectedObject);
            hideAll();
        }));

        m.appendChild(separator());

        // Face-to-face snap
        m.appendChild(simpleItem('🎯 Face-to-face snap', () => {
            _suppressNextClick = true;
            hideAll();
            setTimeout(() => startFaceSnapMode(), 0);
        }));

        // Point-to-point snap
        m.appendChild(simpleItem('📍 Point-to-point snap', () => {
            _suppressNextClick = true;
            hideAll();
            setTimeout(() => startPtpSnapMode(), 0);
        }));

        m.appendChild(separator());

        // Location (submenu)
        const itemLoc = document.createElement('div');
        itemLoc.className = 'ctx-item has-sub';
        itemLoc.innerHTML = 'Location';
        const subLoc = document.createElement('div');
        subLoc.className = 'ctx-submenu';

        subLoc.appendChild(simpleItem('Reset init. location', () => {
            if (lastSelectedObject) setDefPosRotScale(lastSelectedObject);
            hideAll();
        }));
        subLoc.appendChild(simpleItem('Undo last transform', () => {
            if (lastSelectedObject && previousTransformState) undoLastTransform(lastSelectedObject);
            hideAll();
        }));
        subLoc.appendChild(separator());

        const inputDefs = [
            { id: 'ctx-px', label: 'Px',    step: extent.pStep, get: () => lastSelectedObject?.position.x,  set: v => { if (lastSelectedObject) { lastSelectedObject.position.x = v; render(); } } },
            { id: 'ctx-py', label: 'Py',    step: extent.pStep, get: () => lastSelectedObject?.position.y,  set: v => { if (lastSelectedObject) { lastSelectedObject.position.y = v; render(); } } },
            { id: 'ctx-pz', label: 'Pz',    step: extent.pStep, get: () => lastSelectedObject?.position.z,  set: v => { if (lastSelectedObject) { lastSelectedObject.position.z = v; render(); } } },
            { id: 'ctx-rx', label: 'Rx',    step: extent.rStep, get: () => lastSelectedObject?.rotation.x,  set: v => { if (lastSelectedObject) { lastSelectedObject.rotation.x = v; render(); } } },
            { id: 'ctx-ry', label: 'Ry',    step: extent.rStep, get: () => lastSelectedObject?.rotation.y,  set: v => { if (lastSelectedObject) { lastSelectedObject.rotation.y = v; render(); } } },
            { id: 'ctx-rz', label: 'Rz',    step: extent.rStep, get: () => lastSelectedObject?.rotation.z,  set: v => { if (lastSelectedObject) { lastSelectedObject.rotation.z = v; render(); } } },
            { id: 'ctx-sc', label: 'Scale', step: extent.sStep, get: () => lastSelectedObject?.scale.x,     set: v => { if (lastSelectedObject) { lastSelectedObject.scale.set(v, v, v); render(); } } },
        ];

        inputDefs.forEach(def => {
            const row = document.createElement('div');
            row.className = 'ctx-input-row';
            const lbl = document.createElement('label');
            lbl.textContent = def.label;
            const inp = document.createElement('input');
            inp.type = 'number';
            inp.id = def.id;
            inp.step = def.step;
            inp.addEventListener('click', e => e.stopPropagation());
            inp.addEventListener('change', e => def.set(parseFloat(e.target.value)));
            row.appendChild(lbl);
            row.appendChild(inp);
            subLoc.appendChild(row);
        });

        itemLoc.appendChild(subLoc);
        m.appendChild(itemLoc);

        return m;
    }

    // --- CAD dim label-mode menu ---
    function createCadDimMenu() {
        const m = document.createElement('div');
        m.className = 'ctx-menu hidden';

        const lbl = document.createElement('div');
        lbl.className = 'ctx-label';
        lbl.textContent = 'CAD dimension';
        m.appendChild(lbl);

        m.appendChild(separator());

        // Label display mode
        const itemSimple = simpleItem('Axis value (X or Y or Z)', () => {
            const sel = getSelectedCadDim();
            if (sel) setCadDimLabelMode(sel, 0, render);
            hideAll();
        });
        m.appendChild(itemSimple);

        const itemFull = simpleItem('Full  (Δx Δy Δz …)', () => {
            const sel = getSelectedCadDim();
            if (sel) setCadDimLabelMode(sel, 1, render);
            hideAll();
        });
        m.appendChild(itemFull);

        m.appendChild(separator());

        // Drag mode
        const itemLabelOffset = simpleItem('Label offset', () => {
            const sel = getSelectedCadDim();
            if (sel) setCadDimDragMode(sel, sel.dragMode === 1 ? 0 : 1, render);
            hideAll();
        });
        m.appendChild(itemLabelOffset);

        m.appendChild(separator());

        // Color pickers + size
        const colorRow = (labelText, onInput) => {
            const el = document.createElement('div');
            el.style.cssText = 'padding:2px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:default;';
            const span = document.createElement('span');
            span.textContent = labelText;
            span.style.fontSize = '13px';
            const inp = document.createElement('input');
            inp.type = 'color';
            inp.style.cssText = 'width:26px;height:18px;border:none;padding:0;cursor:pointer;background:none;';
            inp.addEventListener('mousedown', e => e.stopPropagation());
            inp.addEventListener('click', e => e.stopPropagation());
            inp.addEventListener('input', e => { e.stopPropagation(); onInput(inp.value); });
            el.appendChild(span); el.appendChild(inp);
            m.appendChild(el);
            return inp;
        };
        const sizeRow = (labelText, onInput) => {
            const el = document.createElement('div');
            el.style.cssText = 'padding:2px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:default;';
            const span = document.createElement('span');
            span.textContent = labelText;
            span.style.fontSize = '13px';
            const inp = document.createElement('input');
            inp.type = 'number';
            inp.min = '6'; inp.max = '32'; inp.step = '1';
            inp.style.cssText = 'width:46px;font-size:12px;background:#333;color:#fff;border:1px solid #555;border-radius:3px;padding:1px 3px;';
            inp.addEventListener('mousedown', e => e.stopPropagation());
            inp.addEventListener('click', e => e.stopPropagation());
            inp.addEventListener('change', e => { e.stopPropagation(); onInput(parseInt(e.target.value)); });
            el.appendChild(span); el.appendChild(inp);
            m.appendChild(el);
            return inp;
        };

        const inpTextColor = colorRow('Text color', (color) => {
            const sel = getSelectedCadDim();
            if (sel) { sel._textColor = color; if (sel.label) sel.label.element.style.color = color; render(); }
        });
        const inpBgColor = colorRow('Background', (color) => {
            const sel = getSelectedCadDim();
            if (sel) { sel._bgColor = color; if (sel.label) sel.label.element.style.background = color; render(); }
        });
        const inpFontSize = sizeRow('Size', (size) => {
            const sel = getSelectedCadDim();
            if (sel) { sel._fontSize = size; if (sel.label) sel.label.element.style.fontSize = size + 'px'; render(); }
        });

        m.appendChild(separator());

        m.appendChild(simpleItem('Convert to 3D dimension', () => {
            const sel = getSelectedCadDim();
            hideAll();
            if (sel) {
                const newMeas = convertCadDimTo3d(sel, deleteCadDimByRef, render);
                if (newMeas) registerLabelForSelection(newMeas);
            }
        }));

        m.appendChild(simpleItem('Delete dimension', () => {
            deleteSelectedDimension(render);
            hideAll();
        }));

        // Expose for refresh
        m._itemLabelOffset = itemLabelOffset;
        m._itemSimple      = itemSimple;
        m._itemFull        = itemFull;
        m._inpTextColor    = inpTextColor;
        m._inpBgColor      = inpBgColor;
        m._inpFontSize     = inpFontSize;

        return m;
    }

    function refreshCadDimMenu() {
        const sel = getSelectedCadDim();
        if (!sel) return;
        // Highlight active label mode
        menuCadDim._itemSimple.style.fontWeight = sel.labelMode === 0 ? 'bold' : '';
        menuCadDim._itemFull.style.fontWeight   = sel.labelMode === 1 ? 'bold' : '';
        // Toggle label-offset item text
        menuCadDim._itemLabelOffset.textContent =
            sel.dragMode === 1 ? '✓ Label offset' : 'Label offset';
        // Colors / size
        const def = getFlatDimDefaults();
        menuCadDim._inpTextColor.value = sel._textColor || def.textColor;
        menuCadDim._inpBgColor.value   = sel._bgColor   || def.bgColor;
        menuCadDim._inpFontSize.value  = sel._fontSize  != null ? sel._fontSize : def.fontSize;
    }

    // --- CAD dim 3D label-mode menu ---
    function createCadDim3dMenu() {
        const m = document.createElement('div');
        m.className = 'ctx-menu hidden';

        const lbl = document.createElement('div');
        lbl.className = 'ctx-label';
        lbl.textContent = 'CAD dimension (3D)';
        m.appendChild(lbl);

        m.appendChild(separator());

        const itemSimple = simpleItem('Axis value (X or Y or Z)', () => {
            const sel = getSelectedCadDim3d();
            if (sel) setCadDim3dLabelMode(sel, 0, render);
            hideAll();
        });
        m.appendChild(itemSimple);

        const itemFull = simpleItem('Full  (Δx Δy Δz …)', () => {
            const sel = getSelectedCadDim3d();
            if (sel) setCadDim3dLabelMode(sel, 1, render);
            hideAll();
        });
        m.appendChild(itemFull);

        m.appendChild(separator());

        const itemLabelOffset = simpleItem('Label offset', () => {
            const sel = getSelectedCadDim3d();
            if (sel) setCadDim3dDragMode(sel, sel.dragMode === 1 ? 0 : 1, render);
            hideAll();
        });
        m.appendChild(itemLabelOffset);

        m.appendChild(separator());

        const itemRotatePlus = simpleItem('↻ Rotate +90°', () => {
            const sel = getSelectedCadDim3d();
            if (sel) setCadDim3dRotate(sel, Math.PI / 2, render);
            hideAll();
        });
        m.appendChild(itemRotatePlus);

        const itemRotateMinus = simpleItem('↺ Rotate -90°', () => {
            const sel = getSelectedCadDim3d();
            if (sel) setCadDim3dRotate(sel, -Math.PI / 2, render);
            hideAll();
        });
        m.appendChild(itemRotateMinus);

        const itemEditSize = simpleItem('⤢ Edit size…', () => {
            const sel = getSelectedCadDim3d();
            hideAll();
            if (sel) setCadDim3dLabelScaleDialog(sel, render);
        });
        m.appendChild(itemEditSize);

        const itemMirror = simpleItem('Mirror text', () => {
            const sel = getSelectedCadDim3d();
            if (sel) setCadDim3dMirrored(sel, render);
            hideAll();
        });
        m.appendChild(itemMirror);

        m.appendChild(separator());

        // Color pickers
        const colorRow = (labelText, getColor, onInput) => {
            const el = document.createElement('div');
            el.style.cssText = 'padding:2px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:default;';
            const span = document.createElement('span');
            span.textContent = labelText;
            span.style.fontSize = '13px';
            const inp = document.createElement('input');
            inp.type = 'color';
            inp.style.cssText = 'width:26px;height:18px;border:none;padding:0;cursor:pointer;background:none;';
            inp.addEventListener('mousedown', e => e.stopPropagation());
            inp.addEventListener('click', e => e.stopPropagation());
            inp.addEventListener('input', e => { e.stopPropagation(); onInput(inp.value); });
            el.appendChild(span); el.appendChild(inp);
            m.appendChild(el);
            return inp; // return input for refresh
        };

        const inpTextColor = colorRow('Text color',
            () => '#ffffff',
            (color) => { const sel = getSelectedCadDim3d(); if (sel) setCadDim3dTextColor(sel, color, render); }
        );
        const inpBgColor = colorRow('Background',
            () => '#6e3200',
            (color) => { const sel = getSelectedCadDim3d(); if (sel) setCadDim3dBgColor(sel, color, render); }
        );

        m.appendChild(separator());

        // Orientation items (flat, directly in menu)
        const ORIENT_MODES_3D = [
            { key: 'camera', label: 'Face camera' },
            { key: 'XY',     label: 'XY plane'    },
            { key: 'XZ',     label: 'XZ plane'    },
            { key: 'YZ',     label: 'YZ plane'    },
        ];
        const orientItems = {};
        for (const mode of ORIENT_MODES_3D) {
            const item = simpleItem(mode.label, () => {
                const sel = getSelectedCadDim3d();
                if (sel) setCadDim3dOrientationMode(sel, mode.key, render);
                hideAll();
            });
            orientItems[mode.key] = item;
            m.appendChild(item);
        }

        m.appendChild(separator());

        m.appendChild(simpleItem('Convert to Flat dimension', () => {
            const sel = getSelectedCadDim3d();
            hideAll();
            if (sel) convertCadDim3dTo2d(sel, render);
        }));

        m.appendChild(simpleItem('Delete dimension', () => {
            deleteSelectedDimension(render);
            hideAll();
        }));

        m._itemSimple      = itemSimple;
        m._itemFull        = itemFull;
        m._itemLabelOffset = itemLabelOffset;
        m._itemMirror      = itemMirror;
        m._inpTextColor    = inpTextColor;
        m._inpBgColor      = inpBgColor;
        m._orientItems     = orientItems;
        return m;
    }

    function refreshCadDim3dMenu() {
        const sel = getSelectedCadDim3d();
        if (!sel) return;
        menuCadDim3d._itemSimple.style.fontWeight = (sel.labelMode === 0 || !sel.labelMode) ? 'bold' : '';
        menuCadDim3d._itemFull.style.fontWeight   = sel.labelMode === 1 ? 'bold' : '';
        menuCadDim3d._itemLabelOffset.textContent = sel.dragMode === 1 ? '✓ Label offset' : 'Label offset';
        menuCadDim3d._itemMirror.textContent = (sel.mirrored ? '☑' : '☐') + ' Mirror text';
        menuCadDim3d._inpTextColor.value = sel.textColor || '#ffffff';
        menuCadDim3d._inpBgColor.value   = sel.bgColor   || '#6e3200';
        const currentOrient = sel.orientationMode || 'camera';
        for (const [key, item] of Object.entries(menuCadDim3d._orientItems)) {
            item.style.fontWeight = key === currentOrient ? 'bold' : '';
        }
    }

    // --- State ---
    let activeMenu = null;
    const menuEmpty    = createEmptyMenu();
    const menuObject   = createObjectMenu();
    const menuCadDim   = createCadDimMenu();
    const menuCadDim3d = createCadDim3dMenu();
    document.body.appendChild(menuEmpty);
    document.body.appendChild(menuObject);
    document.body.appendChild(menuCadDim);
    document.body.appendChild(menuCadDim3d);

    function hideAll() {
        menuEmpty.classList.add('hidden');
        menuObject.classList.add('hidden');
        menuCadDim.classList.add('hidden');
        menuCadDim3d.classList.add('hidden');
        activeMenu = null;
    }

    function showAt(menu, x, y) {
        hideAll();
        menu.style.left = x + 'px';
        menu.style.top  = y + 'px';
        menu.classList.remove('hidden');
        activeMenu = menu;
        // keep inside viewport
        const r = menu.getBoundingClientRect();
        if (r.right  > window.innerWidth)  menu.style.left = (x - r.width)  + 'px';
        if (r.bottom > window.innerHeight) menu.style.top  = (y - r.height) + 'px';
    }

    function refreshObjectInputs(obj) {
        document.getElementById('ctx-obj-label').textContent = obj.name || 'Object';
        const map = {
            'ctx-px': obj.position.x,
            'ctx-py': obj.position.y,
            'ctx-pz': obj.position.z,
            'ctx-rx': obj.rotation.x,
            'ctx-ry': obj.rotation.y,
            'ctx-rz': obj.rotation.z,
            'ctx-sc': obj.scale.x,
        };
        for (const [id, val] of Object.entries(map)) {
            const el = document.getElementById(id);
            if (el) el.value = parseFloat(val.toFixed(4));
        }
    }

    // --- Shared trigger (mouse RMB + touch long-press) ---
    function triggerContextMenu(x, y) {
        if (viewProp.selectDimensionMode && isSelectDimActive() && getSelectedCadDim3d()) {
            refreshCadDim3dMenu();
            showAt(menuCadDim3d, x, y);
        } else if (viewProp.selectDimensionMode && isSelectDimActive() && getSelectedCadDim()) {
            refreshCadDimMenu();
            showAt(menuCadDim, x, y);
        } else if (lastSelectedObject) {
            refreshObjectInputs(lastSelectedObject);
            showAt(menuObject, x, y);
        } else {
            document.getElementById('ctx-chk-select').checked = viewProp.isSelectAllowed;
            showAt(menuEmpty, x, y);
        }
    }

    // --- Mouse RMB handler ---
    window.addEventListener('contextmenu', function(event) {
        if (isMouseOnGUI(event)) return; // let GUI handle its own RMB
        event.preventDefault();

        // In CAD dim phase 2 – cycle axis instead of showing context menu
        if (viewProp.cadDimMode && isCadDimActive() && getCadDimStep() === 2) {
            const newAxis = cycleCadDimAxis(mouse, currentCamera);
            _updateCadDimHintUI(newAxis);
            render();
            return;
        }

        // In CAD dim 3D phase 2 – cycle axis instead of showing context menu
        if (viewProp.cadDim3dMode && isCadDim3dActive() && getCadDim3dStep() === 2) {
            const newAxis3d = cycleCadDim3dAxis(mouse, currentCamera);
            _updateCadDim3dHintUI(newAxis3d);
            render();
            return;
        }

        // In Edit Labels mode with a CAD dim (CSS3D) selected – show cadDim3d label menu
        if (viewProp.selectDimensionMode && isSelectDimActive() && getSelectedCadDim3d()) {
            refreshCadDim3dMenu();
            showAt(menuCadDim3d, event.clientX, event.clientY);
            return;
        }

        // In Edit Labels mode with a CAD dim selected – show cadDim label menu
        if (viewProp.selectDimensionMode && isSelectDimActive() && getSelectedCadDim()) {
            refreshCadDimMenu();
            showAt(menuCadDim, event.clientX, event.clientY);
            return;
        }

        // Kontrola, zda se myš od pravého kliknutí příliš pohybovala
        const contextMenuPos = new THREE.Vector2(event.clientX, event.clientY);
        const dragDistance = mouseDownPos.distanceTo(contextMenuPos);
        
        // Zobrazit kontextové menu pouze pokud se myš neposunula více než 3 pixely
        if (dragDistance <= 3) {
        triggerContextMenu(event.clientX, event.clientY);
        }
    }, false);

    // --- Touch long-press handler (500 ms) ---
    let longPressTimer = null;
    let longPressStartPos = new THREE.Vector2();

    window.addEventListener('touchstart', function(event) {
        if (event.touches.length !== 1) return;
        const touch = event.touches[0];
        // Skip if touch is on GUI
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (guiWrapper.contains(el)) return;

        longPressStartPos.set(touch.clientX, touch.clientY);
        longPressTimer = setTimeout(() => {
            longPressTimer = null;
            suppressTouchEndOnce = true;
            triggerContextMenu(touch.clientX, touch.clientY);
        }, 500);
    }, { passive: true });

    window.addEventListener('touchmove', function(event) {
        if (!longPressTimer) return;
        if (event.touches.length !== 1) { clearTimeout(longPressTimer); longPressTimer = null; return; }
        const touch = event.touches[0];
        const moved = longPressStartPos.distanceTo(new THREE.Vector2(touch.clientX, touch.clientY));
        if (moved > 10) { clearTimeout(longPressTimer); longPressTimer = null; }
    }, { passive: true });

    window.addEventListener('touchend', function() {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    }, { passive: true });

    window.addEventListener('touchcancel', function() {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    }, { passive: true });

    // Close on outside click
    window.addEventListener('mousedown', function(e) {
        if (activeMenu && !activeMenu.contains(e.target)) hideAll();
    }, true);

    window.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') hideAll();
    });

})();
