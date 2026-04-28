//main.js
import * as THREE from 'three';
import gsap from 'gsap';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';
import { ViewHelper } from 'three/addons/helpers/ViewHelper.js';

//import { GUI } from 'dat.gui';
import { GUI } from 'lil-gui';
import ZipLoader from 'zip-loader';
import { updateCrossSectionLines as updateCrossSectionLinesCore, updateSectionCrossLines as updateSectionCrossLinesCore } from './crossSectionUtils.js';
import { exportToHTML, exportToHTMLDraco, exportToHTMLObfuscated, exportToHTMLObfuscatedDraco } from './htmlExport.js';
import { initOutliner, toggleOutliner, rebuildTree, highlightObject as outlinerHighlight, updateVisibilityIcon, isOutlinerOpen } from './sceneOutliner.js';
import { initMeasurement, isMeasureActive, setMeasureActive, addMeasurePoint, clearMeasurements, getMeasurementCount, updateMeasurePreview, updateMarkerScales, isAngleActive, setAngleActive, addAnglePoint, updateAnglePreview, clearAngleMeasurements, isSelectDimActive, setSelectDimActive, deleteSelectedDimension, initSelectDimension, updateSelectDimensionCamera, reconstructMeasurements, stripMeasurementVisuals, setMeasurementsVisible, setMeasurementDepthTest, removeMeasurementsForOwner, isCadDimActive, setCadDimActive, getCadDimStep, getCadDimAxis, addCadDimPoint, updateCadDimPreview, updateCadDimHoverPreview, cycleCadDimAxis, placeCadDim, clearCadDimMeasurements, removeCadDimMeasurementsForOwner, getSelectedCadDim, setCadDimLabelMode, setCadDimDragMode, selectDimTouchStart, selectDimTouchMove, selectDimTouchEnd, registerLabelForSelection, getSelectedCadDim3d, getCadDimMeasurements, deleteCadDimByRef, convertCadDim3dTo2d } from './measurementUtils.js';
import { detectCircleCenterFromHit } from './circleDetectionUtils.js';
import { initAnnotations, isAnnotationActive, setAnnotationActive, addAnnotationPoint, getAnnotationPendingPoint, updateAnnotationPreview, updateAnnotationMarkerScales, setAnnotationsVisible, clearAnnotations, stripAnnotationVisuals, reconstructAnnotations, setAnnotationDepthTest, removeAnnotationsForOwner, getAnnotations, isAddLeaderLineActive, cancelAddLeaderLine, commitAddLeaderLine, deleteAnnotationByRef, setConvertTo3dFn, reconstructAnnotationFromRec } from './annotationUtils.js';
import { initAnnotations3d, isAnnotation3dActive, setAnnotation3dActive, addAnnotation3dPoint, getAnnotation3dPendingPoint, updateAnnotation3dPreview, updateAnnotation3dMarkerScales, updateAnnotation3dOrientations, setAnnotations3dVisible, clearAnnotations3d, stripAnnotation3dVisuals, reconstructAnnotations3d, setAnnotation3dDepthTest, removeAnnotations3dForOwner, isAddLeaderLine3dActive, cancelAddLeaderLine3d, commitAddLeaderLine3d, getAnnotation3dDefaults, deleteAnnotation3dByRef, setConvertTo2dFn, reconstructAnnotation3dFromRec } from './annotation3dUtils.js';
import { initCadDim3d, isCadDim3dActive, getCadDim3dStep, getCadDim3dAxis, setCadDim3dActive, addCadDim3dPoint, updateCadDim3dPreview, updateCadDim3dHoverPreview, cycleCadDim3dAxis, placeCadDim3d, clearCadDim3dMeasurements, removeCadDim3dMeasurementsForOwner, setCadDim3dVisible, setCadDim3dDepthTest, updateCadDim3dOrientations, updateCadDim3dMarkerScales, reconstructCadDim3d, stripCadDim3dVisuals, setCadDim3dLabelMode, setCadDim3dDragMode, setCadDim3dOrientationMode, setCadDim3dRotate, setCadDim3dLabelScaleDialog, setCadDim3dMirrored, setCadDim3dTextColor, setCadDim3dBgColor, getCadDim3dDefaults, convertCadDimTo3d } from './cadDim3dUtils.js';
import { computeSolidSection, clearSolidSection } from './solidSectionUtils.js';

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
statusBar.innerHTML = `<span class="status-brand"><i>BE &amp; DO BETTER</i></span><span class="status-copy">&copy; 2026 Bedobe</span><span class="status-version">v${__APP_VERSION__}</span>`;
document.body.appendChild(statusBar);

// Wrapper reference for hit-testing (toolbar + panels + outliner)
let outlinerPanelEl = null;
const guiWrapper = { contains(el) { return guiToolbar.contains(el) || guiContainer.contains(el) || (outlinerPanelEl && outlinerPanelEl.contains(el)); } };

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

// Pre-create all toolbar buttons in desired order: Selected, File, Edit, View, Tools, Assembly, Help
['Selected', 'File', 'Edit', 'View', 'Tools', 'Assembly', 'Help'].forEach(name => {
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

let INTERSECTED;
let isMouseDown = false;
let isTouchDragging = false;
let suppressTouchEndOnce = false; // Prevents deselect after long-press context menu

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
let previousTransformState = null; // Uložení předchozího stavu pro undo
let previousGroupTransformStates = []; // World positions of group objects before drag (for assembly recording)
let isShiftHeld = false; // Pro manuální translation snap ve world space

// --- Multi-výběr ---
const selectedObjects = [];       // objekty přidané do multi-výběru (reference, ještě nejsou reparentovány)
const multiOriginalParents = [];  // původní rodiče (paralelní pole k selectedObjects)
const multiSelectionHelpers = []; // azurové BoxHelpery pro vizualizaci multi-výběru
let pivotObject = null;           // pivot pro skupinovou transformaci

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
    backgroundColor: "#888888",
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
    sectionCrossLines: false, // Průřezové čáry vázané na section view clip planes
    solidSection: false, // Solid (capped) section cut
    capColor: '#00ffff', // Color of the solid section cap faces
    transformSpace: true,  // true = world, false = local
    snapEnabled: true,     // true = snap vždy aktivní, false = snap jen při Shift
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

const extent = {
    pn: -1000,
    pp: +1000,
    pStep: 0.1,
    rn: -3.1416,
    rp: 3.1416,
    rStep: 0.035,
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

        if (viewProp.orientedSelectionBox === 'local') {
            // Compute bounding box from vertices in the object's local space (OBB)
            const invMatrix = new THREE.Matrix4().copy(this.object.matrixWorld).invert();
            this.object.traverse(child => {
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
            // World-space AABB
            const box = new THREE.Box3().setFromObject(this.object);
            min.copy(box.min); max.copy(box.max);
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
    scene.background = new THREE.Color( 0x72645b );						

    //lights
    const hemisLight = new THREE.HemisphereLight( 0x443333, 0x111122 );
    scene.add( hemisLight );
    sceneLights.push(hemisLight);
    sceneLights.push(addShadowedLight( 100, 100, 100, 0xffffff, 1 ));
    sceneLights.push(addShadowedLight( 50, 100, - 100, 0xffaa00, 0.5 ));

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
        if (isTransformDragging && (viewProp.snapEnabled || isShiftHeld) && transformControls.object && transformControls.getMode() === 'translate' && transformControls.space === 'world') {
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
        if (tag === 'TEXTAREA' || tag === 'INPUT') return;
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
                cancelAddLeaderLine();
                cancelAddLeaderLine3d();
                render();
                if (viewProp.detectCircleCenter) {
                    viewProp.detectCircleCenter = false;
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

            case 'Shift':
                isShiftHeld = true;
                applySnapSettings();
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
            
            case 'ArrowUp': // select parent of the selected object
                selectParent();
                break;

            case 'ArrowDown': // select previous selected object
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
        if (tag === 'TEXTAREA' || tag === 'INPUT') return;
        switch ( event.key ) {
            case 'Shift':
                isShiftHeld = false;
                applySnapSettings();
                break;
        }
    } );

    addMainGui();
    addAssemblyGui();
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
    if (viewProp.snapEnabled || isShiftHeld) {
        transformControls.setTranslationSnap( viewProp.snapTranslation );
        transformControls.setRotationSnap( THREE.MathUtils.degToRad( viewProp.snapRotationDeg ) );
        transformControls.setScaleSnap( viewProp.snapScale );
    } else {
        transformControls.setTranslationSnap( null );
        transformControls.setRotationSnap( null );
        transformControls.setScaleSnap( null );
    }
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
        let fsCtrl = folderProp.add(viewProp, 'fullscreen').name('Fullscreen').onChange(function(value){// Fullscreen toggle (false = windowed, true = fullscreen)
            if (value) {
                document.getElementById('body').requestFullscreen().catch((err) => {console.warn('Fullscreen not available: ', err.message)});
            } else {
                if (document.fullscreenElement) document.exitFullscreen();
            }
        }).listen();
        folderProp.add(viewProp, 'isSelectAllowed').name('Allow selection').listen();
        folderProp.add(viewProp, 'wireframe').name('Wireframe').onChange(function(value){ toggleWireframeAll(value); }).listen();
        folderProp.add(viewProp, 'cadSelection', ['CAD', 'Detailed']).name('Selection').listen();
        folderProp.add(viewProp, 'orientedSelectionBox', ['local', 'world']).name('Selection box').onChange(function(){ render(); }).listen();
        folderProp.addColor(viewProp, 'backgroundColor').name('Background').onChange(function(value){ scene.background = new THREE.Color(value); render(); });
        folderProp.add(viewProp, 'perspCam').name('Persp. camera').onChange(function(value){setCamera(); render(); });
        const sectionFolder = folderProp.addFolder("Section view");   
            sectionFolder.add(viewProp, 'section').name('Section').onChange(function(value){renderer.localClippingEnabled = value; viewProp.sectionGizmo = value; activateSectionGizmo(value); updateSectionCrossLines(); render(); });
            sectionFolder.add(viewProp, 'sectionCrossLines').name('Cross Section Lines').onChange(function(value){updateSectionCrossLines(); render(); });
            sectionFolder.addColor(viewProp, 'crossSectionColor').name('Cross Lines Color').onChange(function(value){ if(viewProp.sectionCrossLines) { updateSectionCrossLines(); render(); } });
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
            crossSectionFolder.add(viewProp, 'autoUpdateSectionLines').name('Update Section Lines');
            crossSectionFolder.add(viewProp, 'crossSectionPlane', ['XY', 'XZ', 'YZ']).name('Plane').onChange(function(value){if(viewProp.showCrossSection){updateCrossSectionLines(); render();}});
            crossSectionFolder.add(viewProp, 'crossSectionPos', extent.pn, extent.pp, extent.pStep).name('Position').onChange(function(value){if(viewProp.showCrossSection){updateCrossSectionLines(); render();}}).listen();
            crossSectionFolder.addColor(viewProp, 'crossSectionColor').name('Color').onChange(function(value){if(crossSectionLines){crossSectionLines.material.color.set(value); render();}});
            crossSectionFolder.close();
            
            sectionFolder.close();
        const oritationFolder = folderProp.addFolder("View orientation");
            oritationFolder.add({ fn() { viewFromPoint(1000, 0, 0); } }, 'fn').name('View from X');
            oritationFolder.add({ fn() { viewFromPoint(0, 1000, 0); } }, 'fn').name('View from Y');
            oritationFolder.add({ fn() { viewFromPoint(0, 0, 1000); } }, 'fn').name('View from Z');
            oritationFolder.close();
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
            multiFolder.add(viewProp, 'isGroupTransformActive').name('Group transform active (*)').onChange(function(value) {
                if (value) activateMultiSelect(); else deactivateMultiSelect();
            }).listen();
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
        const toolbarPrefFolder = folderProp.addFolder('Toolbar Preferences');
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

    // Když by toto nebylo, tak při ukončení fullscreenu escapem, by "fulscreen" zůstalo zartřené. Funkčně by se moc nestalo.
    document.addEventListener('fullscreenchange', function(){
        viewProp.fullscreen = !!document.fullscreenElement;
        if (fsCtrl && fsCtrl.updateDisplay) fsCtrl.updateDisplay();
    });

    registerGuiPanel('View', folderProp);

    // --- Tools panel (Measurement & Annotations) ---
    const toolsGui = new GUI({ container: guiContainer, title: 'Tools' });
        toolsGui.add(viewProp, 'showBehindModel').name('Show behind model').onChange(function(value) {
            setMeasurementDepthTest(!value);
            setAnnotationDepthTest(!value);
            setAnnotation3dDepthTest(!value);
            setCadDim3dDepthTest(!value);
            render();
        });
        toolsGui.add(viewProp, 'selectDimensionMode').name('Edit labels').onChange(function(value) {
            setSelectDimActive(value);
            if (value) {
                viewProp.isSelectAllowed = false;
                if (viewProp.measureMode) { viewProp.measureMode = false; setMeasureActive(false); }
                if (viewProp.angleMode) { viewProp.angleMode = false; setAngleActive(false); }
                if (viewProp.cadDimMode) { viewProp.cadDimMode = false; setCadDimActive(false); orbitControls.enabled = true; }
                if (viewProp.cadDim3dMode) { viewProp.cadDim3dMode = false; setCadDim3dActive(false); orbitControls.enabled = true; _updateCadDim3dHintUI(); }
                if (viewProp.annotationMode) { viewProp.annotationMode = false; setAnnotationActive(false); }
                if (viewProp.annotation3dMode) { viewProp.annotation3dMode = false; setAnnotation3dActive(false); }
            } else {
                viewProp.isSelectAllowed = true;
            }
            render();
        }).listen();

        const _rotOpts = { '0°': 0, '90°': Math.PI / 2, '180°': Math.PI, '270°': 3 * Math.PI / 2 };
        const _orientOpts = { 'Face camera': 'camera', 'XY plane': 'XY', 'XZ plane': 'XZ', 'YZ plane': 'YZ' };

        const cadDim3dDefaultsFolder = toolsGui.addFolder('3D dimension defaults');
            const _cadDim3dDef = getCadDim3dDefaults();
            cadDim3dDefaultsFolder.add(_cadDim3dDef, 'labelScale', 0.1, 10, 0.1).name('Size');
            cadDim3dDefaultsFolder.add(_cadDim3dDef, 'rotationCamera', _rotOpts).name('Rotation (Face camera)');
            cadDim3dDefaultsFolder.add(_cadDim3dDef, 'rotationXY',     _rotOpts).name('Rotation (XY plane)');
            cadDim3dDefaultsFolder.add(_cadDim3dDef, 'rotationXZ',     _rotOpts).name('Rotation (XZ plane)');
            cadDim3dDefaultsFolder.add(_cadDim3dDef, 'rotationYZ',     _rotOpts).name('Rotation (YZ plane)');
            cadDim3dDefaultsFolder.add(_cadDim3dDef, 'orientationMode', _orientOpts).name('Orientation');
            cadDim3dDefaultsFolder.addColor(_cadDim3dDef, 'textColor').name('Text color');
            cadDim3dDefaultsFolder.addColor(_cadDim3dDef, 'bgColor').name('Background');
            cadDim3dDefaultsFolder.close();

        const ann3dDefaultsFolder = toolsGui.addFolder('3D annotation defaults');
            const _ann3dDef = getAnnotation3dDefaults();
            ann3dDefaultsFolder.add(_ann3dDef, 'labelScale', 0.1, 10, 0.1).name('Size');
            ann3dDefaultsFolder.add(_ann3dDef, 'rotationCamera', _rotOpts).name('Rotation (Face camera)');
            ann3dDefaultsFolder.add(_ann3dDef, 'rotationXY',     _rotOpts).name('Rotation (XY plane)');
            ann3dDefaultsFolder.add(_ann3dDef, 'rotationXZ',     _rotOpts).name('Rotation (XZ plane)');
            ann3dDefaultsFolder.add(_ann3dDef, 'rotationYZ',     _rotOpts).name('Rotation (YZ plane)');
            ann3dDefaultsFolder.add(_ann3dDef, 'orientationMode', _orientOpts).name('Orientation');
            ann3dDefaultsFolder.addColor(_ann3dDef, 'textColor').name('Text color');
            ann3dDefaultsFolder.addColor(_ann3dDef, 'bgColor').name('Background');
            ann3dDefaultsFolder.close();

        const measureFolder = toolsGui.addFolder('Measurement');
            measureFolder.add(viewProp, 'measureMode').name('Measure (point-to-point)').onChange(function(value) {
                setMeasureActive(value);
                if (value) {
                    viewProp.isSelectAllowed = false;
                    if (viewProp.angleMode) { viewProp.angleMode = false; setAngleActive(false); }
                    if (viewProp.cadDimMode) { viewProp.cadDimMode = false; setCadDimActive(false); orbitControls.enabled = true; }
                    if (viewProp.cadDim3dMode) { viewProp.cadDim3dMode = false; setCadDim3dActive(false); orbitControls.enabled = true; _updateCadDim3dHintUI(); }
                    if (viewProp.selectDimensionMode) { viewProp.selectDimensionMode = false; setSelectDimActive(false); }
                    if (viewProp.annotationMode) { viewProp.annotationMode = false; setAnnotationActive(false); }
                    if (viewProp.annotation3dMode) { viewProp.annotation3dMode = false; setAnnotation3dActive(false); }
                } else {
                    viewProp.isSelectAllowed = true;
                }
                render();
            }).listen();
            measureFolder.add(viewProp, 'angleMode').name('Measure angle (4 pts)').onChange(function(value) {
                setAngleActive(value);
                if (value) {
                    viewProp.isSelectAllowed = false;
                    if (viewProp.measureMode) { viewProp.measureMode = false; setMeasureActive(false); }
                    if (viewProp.cadDimMode) { viewProp.cadDimMode = false; setCadDimActive(false); orbitControls.enabled = true; }
                    if (viewProp.cadDim3dMode) { viewProp.cadDim3dMode = false; setCadDim3dActive(false); orbitControls.enabled = true; _updateCadDim3dHintUI(); }
                    if (viewProp.selectDimensionMode) { viewProp.selectDimensionMode = false; setSelectDimActive(false); }
                    if (viewProp.annotationMode) { viewProp.annotationMode = false; setAnnotationActive(false); }
                    if (viewProp.annotation3dMode) { viewProp.annotation3dMode = false; setAnnotation3dActive(false); }
                } else {
                    viewProp.isSelectAllowed = true;
                }
                render();
            }).listen();
            measureFolder.add(viewProp, 'cadDimMode').name('CAD dimension (Flat)').onChange(function(value) {
                setCadDimActive(value);
                if (value) {
                    viewProp.isSelectAllowed = false;
                    if (viewProp.measureMode) { viewProp.measureMode = false; setMeasureActive(false); }
                    if (viewProp.angleMode) { viewProp.angleMode = false; setAngleActive(false); }
                    if (viewProp.cadDim3dMode) { viewProp.cadDim3dMode = false; setCadDim3dActive(false); orbitControls.enabled = true; _updateCadDim3dHintUI(); }
                    if (viewProp.selectDimensionMode) { viewProp.selectDimensionMode = false; setSelectDimActive(false); }
                    if (viewProp.annotationMode) { viewProp.annotationMode = false; setAnnotationActive(false); }
                    if (viewProp.annotation3dMode) { viewProp.annotation3dMode = false; setAnnotation3dActive(false); }
                } else {
                    orbitControls.enabled = true; // re-enable in case we were in phase 2
                    viewProp.isSelectAllowed = true;
                    _updateCadDimHintUI();
                }
                render();
            }).listen();
            measureFolder.add(viewProp, 'cadDim3dMode').name('CAD dimension (3D)').onChange(function(value) {
                setCadDim3dActive(value);
                if (value) {
                    viewProp.isSelectAllowed = false;
                    if (viewProp.measureMode) { viewProp.measureMode = false; setMeasureActive(false); }
                    if (viewProp.angleMode) { viewProp.angleMode = false; setAngleActive(false); }
                    if (viewProp.cadDimMode) { viewProp.cadDimMode = false; setCadDimActive(false); orbitControls.enabled = true; _updateCadDimHintUI(); }
                    if (viewProp.selectDimensionMode) { viewProp.selectDimensionMode = false; setSelectDimActive(false); }
                    if (viewProp.annotationMode) { viewProp.annotationMode = false; setAnnotationActive(false); }
                    if (viewProp.annotation3dMode) { viewProp.annotation3dMode = false; setAnnotation3dActive(false); }
                } else {
                    orbitControls.enabled = true;
                    viewProp.isSelectAllowed = true;
                    _updateCadDim3dHintUI();
                }
                render();
            }).listen();
            measureFolder.add(viewProp, 'detectCircleCenter').name('Detect circle center');
            measureFolder.add(viewProp, 'showMeasurements').name('Show measurements').onChange(function(value) {
                setMeasurementsVisible(value);
                setCadDim3dVisible(value);
                render();
            });
            measureFolder.add({ fn() {
                if (!confirm('Clear all measurements/dimensions?')) return;
                clearMeasurements(render);
                clearCadDim3dMeasurements(render);
            } }, 'fn').name('Clear measurements');
            measureFolder.close();
        const annotationFolder = toolsGui.addFolder('Annotations');
            annotationFolder.add(viewProp, 'annotationMode').name('Add annotation (Flat)').onChange(function(value) {
                setAnnotationActive(value);
                if (value) {
                    viewProp.isSelectAllowed = false;
                    if (viewProp.measureMode) { viewProp.measureMode = false; setMeasureActive(false); }
                    if (viewProp.angleMode) { viewProp.angleMode = false; setAngleActive(false); }
                    if (viewProp.cadDimMode) { viewProp.cadDimMode = false; setCadDimActive(false); orbitControls.enabled = true; }
                    if (viewProp.cadDim3dMode) { viewProp.cadDim3dMode = false; setCadDim3dActive(false); orbitControls.enabled = true; _updateCadDim3dHintUI(); }
                    if (viewProp.selectDimensionMode) { viewProp.selectDimensionMode = false; setSelectDimActive(false); }
                    if (viewProp.annotation3dMode) { viewProp.annotation3dMode = false; setAnnotation3dActive(false); }
                } else {
                    viewProp.isSelectAllowed = true;
                }
                render();
            }).listen();
            annotationFolder.add(viewProp, 'annotation3dMode').name('Add annotation (3D)').onChange(function(value) {
                setAnnotation3dActive(value);
                if (value) {
                    viewProp.isSelectAllowed = false;
                    if (viewProp.measureMode) { viewProp.measureMode = false; setMeasureActive(false); }
                    if (viewProp.angleMode) { viewProp.angleMode = false; setAngleActive(false); }
                    if (viewProp.cadDimMode) { viewProp.cadDimMode = false; setCadDimActive(false); orbitControls.enabled = true; }
                    if (viewProp.cadDim3dMode) { viewProp.cadDim3dMode = false; setCadDim3dActive(false); orbitControls.enabled = true; _updateCadDim3dHintUI(); }
                    if (viewProp.selectDimensionMode) { viewProp.selectDimensionMode = false; setSelectDimActive(false); }
                    if (viewProp.annotationMode) { viewProp.annotationMode = false; setAnnotationActive(false); }
                } else {
                    viewProp.isSelectAllowed = true;
                }
                render();
            }).listen();
            annotationFolder.add(viewProp, 'showAnnotations').name('Show annotations').onChange(function(value) {
                setAnnotationsVisible(value);
                setAnnotations3dVisible(value);
                render();
            });
            annotationFolder.add({ fn() {
                if (!confirm('Clear all annotations?')) return;
                clearAnnotations(render);
                clearAnnotations3d(render);
            } }, 'fn').name('Clear annotations');

            annotationFolder.close();
    registerGuiPanel('Tools', toolsGui);

    // --- File panel (Export / Import) ---
    const fileGui = new GUI({ container: guiContainer, title: 'File' });
    fileGui.add({ fn() {
        loadGlbModel('./models/demo.glb', 'demo.glb', 0.001, true).then(() => {
            fitView();
        });
    } }, 'fn').name('Import demo GLB');
    fileGui.add({ fn: importGlbFile }, 'fn').name('Import GLB…');
    fileGui.add({ fn: exportAllModels }, 'fn').name('Export all to GLB');
    fileGui.add({ fn: exportAllModelsDraco }, 'fn').name('Export all to GLB (Draco)');
    fileGui.add({ fn: exportSelectedObject }, 'fn').name('Export selected to GLB');
    fileGui.add({ fn() { exportToHTML(loadedModels, assemblyGui, viewProp, assemblyWriteToUserData, assemblyClearUserData); } }, 'fn').name('Export to HTML');
    fileGui.add({ fn() { exportToHTMLDraco(loadedModels, assemblyGui, viewProp, assemblyWriteToUserData, assemblyClearUserData); } }, 'fn').name('Export to HTML (Draco)');
    fileGui.add({ fn() { exportToHTMLObfuscated(loadedModels, assemblyGui, viewProp, assemblyWriteToUserData, assemblyClearUserData); } }, 'fn').name('Export to HTML obfuscated');
    fileGui.add({ fn() { exportToHTMLObfuscatedDraco(loadedModels, assemblyGui, viewProp, assemblyWriteToUserData, assemblyClearUserData); } }, 'fn').name('Export to HTML obfuscated (Draco)');
    registerGuiPanel('File', fileGui);

    // --- Edit panel ---
    const editGui = new GUI({ container: guiContainer, title: 'Edit' });
    editGui.add({ fn: resetWholeModel }, 'fn').name('Reset whole model');
    editGui.add({ fn: cleanupModel }, 'fn').name('Cleanup (flatten unnamed nodes)');
    editGui.add(viewProp, 'transformSpace').name('Transform: World space').onChange(function(value) {
        transformControls.setSpace( value ? 'world' : 'local' );
    }).listen();
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
            snapFolder.add(viewProp, 'snapEnabled').name('Snap enabled').onChange(function() { applySnapSettings(); }).listen();
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
    selectedFolder.add(obj, 'name').name('Name').listen();
    selectedFolder.addColor(part, 'color').name('Specif. color').onChange(function(value){ changeColor(obj, value); });

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
            if (viewProp.orientedSelectionBox === 'local') {
                const inv = new THREE.Matrix4().copy(lastSelectedObject.matrixWorld).invert();
                lastSelectedObject.traverse(ch => {
                    if (ch.geometry && ch.geometry.attributes.position) {
                        const pos = ch.geometry.attributes.position;
                        const toL = new THREE.Matrix4().multiplyMatrices(inv, ch.matrixWorld);
                        for (let i = 0; i < pos.count; i++) { bv.fromBufferAttribute(pos, i).applyMatrix4(toL); bMin.min(bv); bMax.max(bv); }
                    }
                });
            } else {
                const box = new THREE.Box3().setFromObject(lastSelectedObject);
                bMin.copy(box.min); bMax.copy(box.max);
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

        switch ( fileExtension ) {
            case 'zip':      
                loadModel(fileUrl, fileName, 0.001, true).then( (result) => {
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
        //loadModel('./models/1011364_c.zip','1011364_c.zip', 0.001, true).then( (result)=>{} );	
        
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
    const obj = transformControls.object;
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

    // Výpočet ohraničujícího boxu všech objektů ve scéně
    let box = new THREE.Box3();
    
    meshObjects.forEach(obj => {
        box.expandByObject(obj);
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

// Přidá / odebere lastSelectedObject do/z multi-výběru. Volá se klávesou "+".".
function addCurrentToMultiSelect() {
    if (!lastSelectedObject) return;
    if (viewProp.isGroupTransformActive) {
        console.log('Multi-selection is active – deactivate the group first.');
        return;
    }
    const obj = lastSelectedObject;
    const idx = selectedObjects.indexOf(obj);
    if (idx !== -1) {
        // Odebrat z multi-výběru
        selectedObjects.splice(idx, 1);
        multiOriginalParents.splice(idx, 1);
        scene.remove(multiSelectionHelpers[idx]);
        multiSelectionHelpers.splice(idx, 1);
        console.log(`Multi-selection: removed "${obj.name}", remaining: ${selectedObjects.length}`);
    } else {
        // Přidat do multi-výběru
        selectedObjects.push(obj);
        multiOriginalParents.push(obj.parent);
        const h = new PaddedBoxHelper(obj, 0x00ccff, viewProp.multiSelectBoxPadding);
        scene.add(h);
        multiSelectionHelpers.push(h);
        console.log(`Multi-selection: added "${obj.name}", total: ${selectedObjects.length}`);
    }
    render();
}

// Aktivuje skupinovou transformaci: reparentuje objekty do pivotu, TC se přepne na pivot.
function activateMultiSelect() {
    if (selectedObjects.length < 2) {
        console.log('Multi-selection: at least 2 objects required (key +).');
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

    // Připojíme TC k pivotu
    transformControls.attach(pivotObject);
    viewProp.isGroupTransformActive = true;
    console.log(`Multi-selection activated, ${selectedObjects.length} objects.`);
    render();
}

// Deaktivuje skupinovou transformaci: vrátí objekty původním rodičům, TC se odpojí.
// Seznam selectedObjects zůstane zachován – lze skupinu znovu aktivovat.
function deactivateMultiSelect() {
    if (!viewProp.isGroupTransformActive) return;

    if (transformControls.object === pivotObject) transformControls.detach();

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

// Zobrazí PaddedBoxHelpery kolem objektů aktuálního assembly kroku, pokud je aktivní edit mode.
// Volá se z updateAssemblyGuiInfo() a při přepnutí editMode.
function updateAssemblyStepHelpers() {
    // Odstraníme staré helpery
    assemblyStepHelpers.forEach(h => scene.remove(h));
    assemblyStepHelpers.length = 0;

    if (!assemblyState.editMode) { render(); return; }
    const ci = assemblyState.currentStepIndex;
    if (ci < 0 || ci >= assemblyData.steps.length) { render(); return; }

    const step = assemblyData.steps[ci];
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
    });

    console.log(`Group History: group "${snapshot.name}" restored (${selectedObjects.length} objects).`);
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
function loadModel(model, name, scale, colored) {
    return new Promise( (resolve, reject) => {	

        const zipLoader = new ZipLoader( model ); 
        zipLoader.load().then( function() {
            const url = zipLoader.extractAsBlobUrl( fileNameWithoutExtension(name) + '.txt');					
        
            const loader = new STLLoader();
            loader.load( url, function ( geometry ) {												

                const materials = [];
                const nGeometryGroups = geometry.groups.length;
                console.log("nGeometryGroups: ", nGeometryGroups);
                
                for (let i = 0; i < nGeometryGroups; i++) {
                    const material = new THREE.MeshPhongMaterial({
                        side: THREE.DoubleSide,
                        clippingPlanes: clipPlanes,
                        clipIntersection: true,								
                        color: Math.random() * 0xffffff,
                        wireframe: false,
                        polygonOffset: true,
                        polygonOffsetFactor: 1
                    });
                materials.push(material);
                }
                const mesh = new THREE.Mesh(geometry, materials);					
                
                // Definice výchozích hodnot v userData (Three.js best practice)
                mesh.userData.initPosition = { x: 0, y: 0, z: 0 };
                mesh.userData.initRotation = { x: -Math.PI/2, y: 0, z: 0 };
                mesh.userData.initScale = { x: 1, y: 1, z: 1 };
                mesh.name = fileNameWithoutExtension(model);
                scene.add( mesh );	
                console.log(mesh);
                meshObjects.push(mesh);
                render();
                resolve(mesh);	

                lastSelectedObject=mesh;  
            } );
        } );					
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
            
            // Reconstruct measurements stored in userData
            reconstructMeasurements(gltf.scene, render);
            reconstructAnnotations(gltf.scene, render);
            reconstructAnnotations3d(gltf.scene, render);
            reconstructCadDim3d(gltf.scene);
            
            rebuildTree(loadedModels);
            render();
            resolve(gltf.scene);
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
            if (node.userData._isMeasurement || node.userData._isAnnotation) return;
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

function removeModel(part) {
    if (!confirm('Do you really want to permanently remove object?')) return;
    try {				
        deselectObject();

        removeMeasurementsForOwner(part);
        removeAnnotationsForOwner(part);
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
        transformControls.attach(object);// Připojíme TransformControls
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
            if (child.material.emissive) {
                //child.material.emissive.setHex(0xff0000);
                applyEmissive(child, 0xff0000);
            }
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
    // Zničíme složku v lil-gui, pokud existuje
    if (selectedFolder) {
        selectedFolder.destroy();
        selectedFolder = null;
        guiPanels['Selected'].gui = null;
        guiPanels['Selected'].btn.classList.remove('active');
        guiPanels['Selected'].btn.style.display = 'none';
    }                
    // Volitelné: vynulování pomocných proměnných
    lastSelectedMeshes.forEach(child => applyEmissive(child, 0x000000));

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

function render() {   
    //console.log("viewProp.isSelectAllowed: ", viewProp.isSelectAllowed);
    // isMouseOverGui - pokud kurzor nad GUI a současně nad objektem, pak má přednost GUI.
    const isMouseOverGui = document.elementFromPoint(mouse.x * window.innerWidth / 2 + window.innerWidth / 2, 
                                                     -mouse.y * window.innerHeight / 2 + window.innerHeight / 2)?.closest('.lil-gui');
    
    // Nezvýrazňujeme objekty při dragování (rotaci/posouvání) nebo při transformaci
    if (!isTransformDragging && !isMouseOverGui && !isMouseDown && !isTouchDragging && viewProp.isSelectAllowed && !viewProp.isGroupTransformActive) {      
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

    // Pokud je selekce zakázána nebo je aktivní skupinová transformace, zajistíme že nebude nic zvýrazněno
    if ((!viewProp.isSelectAllowed || viewProp.isGroupTransformActive) && INTERSECTED) {
        clearHighlight();
        INTERSECTED = null;
    }

    // Measurement hover preview – raycast for point preview when in measure mode
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

    // Pokud je selekce zakázána v GUI, ignorujeme click
    if (!viewProp.isSelectAllowed) return;
    if (viewProp.isGroupTransformActive) return;

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

// Open a file-picker dialog and load the chosen GLB file.
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
            fitView();
            console.log(`[Import] GLB "${file.name}" loaded successfully.`);
        }).catch(err => {
            URL.revokeObjectURL(url);
            console.error(`[Import] Failed to load "${file.name}":`, err);
        });
    });
    input.click();
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
    const defaultName = 'export_all.glb';
    const filename = window.prompt('Název souboru pro export:', defaultName);
    if (filename === null) return; // uživatel stiskl Cancel
    const finalName = filename.trim() || defaultName;

    // Write assembly workflow into userData before cloning
    assemblyWriteToUserData();

    const exporter = new GLTFExporter();
    const group = new THREE.Group();
    loadedModels.forEach(model => {
        group.add(model.clone(true));
    });

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
    const defaultName = 'export_all_draco.glb';
    const filename = window.prompt('Název souboru pro export (Draco):', defaultName);
    if (filename === null) return;
    const finalName = filename.trim() || defaultName;

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

    const exporter = new GLTFExporter();
    const group = new THREE.Group();
    loadedModels.forEach(model => {
        group.add(model.clone(true));
    });

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
                await gltfDoc.transform(draco());
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
    if (!lastSelectedObject) {
        console.warn('Žádný objekt není vybrán.');
        return;
    }
    const defaultName = `export_${lastSelectedObject.name || 'selected'}.glb`;
    const filename = window.prompt('Název souboru pro export:', defaultName);
    if (filename === null) return; // uživatel stiskl Cancel
    const finalName = filename.trim() || defaultName;
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

    exporter.parse(clone, function(result) {
        saveArrayBuffer(result, finalName);
        console.log(`Export selected: hotovo.`);
    }, function(error) {
        console.error('Chyba při exportu:', error);
    }, { binary: true, onlyVisible: false });
}

function separateMesh(meshToSeparate) {
    if (!meshToSeparate || !meshToSeparate.geometry) return;

    // 1. Získání nových geometrií pomocí vaší existující logiky - goemetries je array.
    const geometries = separateGroups(meshToSeparate.geometry);
    
    // 2. Odstranění původního modelu
    removeModel(meshToSeparate);

    // 3. Vytvoření nových meshů
    geometries.forEach((geom, i) => {
        const materials = [];
        materials.push(meshToSeparate.material[i]);
        const newMesh = new THREE.Mesh(geom, materials);

        // Separated parts - v initial pozici, rotaci a měřítku
        // newMesh.initPosition = { ...meshToSeparate.initPosition };
        // newMesh.initRotation = { ...meshToSeparate.initRotation };
        // newMesh.initScale = { ...meshToSeparate.initScale };
        
        // Separated parts - ve své aktuální pozici, rotaci a měřítku
        newMesh.initPosition = meshToSeparate.position.clone();
        newMesh.initRotation = meshToSeparate.rotation.clone();
        newMesh.initScale = meshToSeparate.scale.clone();

        setDefPosRotScale(newMesh);
        newMesh.name = `Part_${i}_${meshToSeparate.name || 'sep'}`;
        //newMesh.name = fileNameWithoutExtension("sep dil");
        
        scene.add(newMesh);
        
        meshObjects.push(newMesh);
    });

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
    editControls.push( editFolder.add({ fn: assemblySaveCameraView }, 'fn').name('📷  Save camera view') );
    editControls.push( editFolder.add({ fn: assemblyClearCameraView }, 'fn').name('✕  Clear camera view') );

    // Start disabled (editMode defaults to false)
    editControls.forEach(c => c.disable());

    editFolder.close();

    registerGuiPanel('Assembly', assemblyFolder);
    updateAssemblyGuiInfo();
}

function addHelpGui() {
        // Create <dialog> element once
    const aboutDialog = document.createElement('dialog');
    aboutDialog.id = 'about-dialog';
    aboutDialog.innerHTML =
        '<h2>BEDOBE</h2>'
        + '<p>3D Studio</p>'
        + '<p>BEDOBE is a web-based 3D model viewer and assembly workflow editor built with Three.js. It allows you to load GLB models, explore their structure, create step-by-step assembly instructions with smooth animations and much much more.</p>'
        + '<form method="dialog"><button>OK</button></form>';
    aboutDialog.addEventListener('click', e => { if (e.target === aboutDialog) aboutDialog.close(); });
    document.body.appendChild(aboutDialog);

    const helpGui = new GUI({ container: guiContainer, title: 'Help' });
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
        render();
        assemblyAnimationFinalize = null;
    };

    // Instant move when duration === 0
    if (duration <= 0) {
        applyTransforms(transformations, startStates, 1);
        if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) updateCrossSectionLines();
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
                if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) updateCrossSectionLines();
                render();
            },
            onComplete() {
                assemblyAnimation = null;
                assemblyAnimationFinalize = null;
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
                    if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) updateCrossSectionLines();
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
    render();
    if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) updateCrossSectionLines();
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
    render();
    if (viewProp.showCrossSection && viewProp.autoUpdateSectionLines) updateCrossSectionLines();
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
    const logBack = () => {
        const label = assemblyState.currentStepIndex < 0
            ? 'Assembled'
            : `Step ${assemblyState.currentStepIndex + 1}: "${assemblyData.steps[assemblyState.currentStepIndex].name}"`;
        console.log(`[Assembly] ← Back → ${label}`);
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
        m._itemSimple = itemSimple;
        m._itemFull   = itemFull;

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
