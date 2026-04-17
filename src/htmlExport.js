// htmlExport.js
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import exportLibsBundle from 'virtual:export-libs-bundle';

// ===== Export to standalone HTML with embedded GLB =====
export function exportToHTML(loadedModels, assemblyGui, viewProp, assemblyWriteToUserData, assemblyClearUserData) {
    if (loadedModels.length === 0) {
        alert('No models to export.');
        return;
    }
    const defaultName = 'assembly_viewer.html';
    const filename = window.prompt('File name for HTML export:', defaultName);
    if (filename === null) return;
    const finalName = filename.trim() || defaultName;

    // Write assembly workflow into userData before cloning
    assemblyWriteToUserData();

    const exporter = new GLTFExporter();
    const group = new THREE.Group();
    loadedModels.forEach(model => group.add(model.clone(true)));

    // Clean up originals
    assemblyClearUserData();

    exporter.parse(group, function(glbBuffer) {
        // Convert ArrayBuffer to base64
        const bytes = new Uint8Array(glbBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        // Get current animation settings
        const animSettings = {
            duration:    assemblyGui.animationDuration,
            ease:        assemblyGui.animationEase,
            repeat:      assemblyGui.animationRepeat,
            delay:       assemblyGui.animationDelay,
            repeatDelay: assemblyGui.animationRepeatDelay,
            yoyo:        assemblyGui.animationYoyo,
            stagger:     assemblyGui.animationStagger,
            overwrite:   assemblyGui.animationOverwrite,
            loop:        assemblyGui.animationLoop,
            camera:      assemblyGui.animationCamera,
            zoomCoeff:   assemblyGui.zoomCoeff,
        };

        const sectionSettings = {
            section:         viewProp.section,
            showSectionMesh: viewProp.showSectionMesh,
            sectionCrossLines: viewProp.sectionCrossLines,
            crossSectionColor: viewProp.crossSectionColor,
            solidSection: viewProp.solidSection,
            capColor: viewProp.capColor,
            px: viewProp.px,
            py: viewProp.py,
            pz: viewProp.pz,
        };

        const htmlContent = generateStandaloneHTML(base64, animSettings, sectionSettings, '');

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = finalName;
        link.click();
        URL.revokeObjectURL(link.href);
        console.log('Export to HTML: done.');
    }, function(error) {
        console.error('HTML export error:', error);
    }, { binary: true, onlyVisible: false });
}

// ===== Export to standalone HTML with Draco compression =====
export function exportToHTMLDraco(loadedModels, assemblyGui, viewProp, assemblyWriteToUserData, assemblyClearUserData) {
    if (loadedModels.length === 0) {
        alert('No models to export.');
        return;
    }
    const defaultName = 'assembly_viewer_draco.html';
    const filename = window.prompt('File name for HTML export (Draco):', defaultName);
    if (filename === null) return;
    const finalName = filename.trim() || defaultName;

    // Write assembly workflow into userData before cloning
    assemblyWriteToUserData();

    const exporter = new GLTFExporter();
    const group = new THREE.Group();
    loadedModels.forEach(model => group.add(model.clone(true)));

    // Clean up originals
    assemblyClearUserData();

    exporter.parse(group, async function(glbBuffer) {
        // Show overlay
        let overlay = document.getElementById('dracoOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'dracoOverlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;color:#fff;font-size:22px;font-family:sans-serif;';
            overlay.textContent = 'Draco compressing… please wait';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        // Let browser paint overlay before CPU-intensive work
        await new Promise(r => setTimeout(r, 50));

        try {
        // --- Draco compression ---
        let finalGlb = glbBuffer;
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

            const gltfDoc = await io.readBinary(new Uint8Array(glbBuffer));
            await gltfDoc.transform(draco());
            finalGlb = await io.writeBinary(gltfDoc);
            console.log('HTML export (Draco): compression done.');
        } catch (err) {
            console.warn('HTML export (Draco): compression failed, using uncompressed.', err);
        }

        // Convert ArrayBuffer to base64
        const bytes = new Uint8Array(finalGlb);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        // Get current animation settings
        const animSettings = {
            duration:    assemblyGui.animationDuration,
            ease:        assemblyGui.animationEase,
            repeat:      assemblyGui.animationRepeat,
            delay:       assemblyGui.animationDelay,
            repeatDelay: assemblyGui.animationRepeatDelay,
            yoyo:        assemblyGui.animationYoyo,
            stagger:     assemblyGui.animationStagger,
            overwrite:   assemblyGui.animationOverwrite,
            loop:        assemblyGui.animationLoop,
            camera:      assemblyGui.animationCamera,
            zoomCoeff:   assemblyGui.zoomCoeff,
        };

        const sectionSettings = {
            section:         viewProp.section,
            showSectionMesh: viewProp.showSectionMesh,
            sectionCrossLines: viewProp.sectionCrossLines,
            crossSectionColor: viewProp.crossSectionColor,
            solidSection: viewProp.solidSection,
            capColor: viewProp.capColor,
            px: viewProp.px,
            py: viewProp.py,
            pz: viewProp.pz,
        };

        // Fetch Draco decoder JS for embedding in standalone HTML
        let dracoDecoderBase64 = '';
        try {
            const resp = await fetch('./draco/draco_decoder.js');
            const text = await resp.text();
            dracoDecoderBase64 = btoa(unescape(encodeURIComponent(text)));
        } catch (err) {
            console.warn('Could not fetch draco_decoder.js for HTML embed:', err);
        }

        const htmlContent = generateStandaloneHTML(base64, animSettings, sectionSettings, dracoDecoderBase64);

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = finalName;
        link.click();
        URL.revokeObjectURL(link.href);
        console.log('Export to HTML (Draco): done.');
        } finally {
            overlay.style.display = 'none';
        }
    }, function(error) {
        console.error('HTML export error:', error);
    }, { binary: true, onlyVisible: false });
}

function generateStandaloneHTML(glbBase64, animSettings, sectionSettings, dracoDecoderBase64) {
    const safeLibsBundle = exportLibsBundle.replace(/<\/script/gi, '<\\/script');
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>Assembly Viewer</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #72645b; font-family: Arial, sans-serif; }
#canvas-container { width: 100%; height: 100%; }
canvas { display: block; width: 100%; height: 100%; }
#controls {
    position: fixed;
    bottom: max(16px, env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    z-index: 10;
    pointer-events: none;
}
#controls .row {
    display: flex;
    gap: 8px;
    pointer-events: auto;
}
#controls button {
    min-width: 64px;
    padding: 12px 18px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    color: #fff;
    background: rgba(50,50,50,0.85);
    backdrop-filter: blur(4px);
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.15s;
}
#controls button:active { background: rgba(80,80,80,0.95); }
#controls button:disabled { opacity: 0.4; cursor: default; }
#controls .chk-label {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(50,50,50,0.85);
    border-radius: 8px;
    cursor: pointer;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    user-select: none;
    -webkit-user-select: none;
    backdrop-filter: blur(4px);
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
}
#controls .chk-label input[type=checkbox] { cursor: pointer; width: 15px; height: 15px; accent-color: #0a8; flex-shrink: 0; }
@media (max-width: 480px) {
    #controls button { padding: 8px 10px; font-size: 13px; min-width: 48px; }
    #controls .chk-label { padding: 8px 10px; font-size: 13px; }
    #controls { bottom: max(10px, env(safe-area-inset-bottom)); gap: 5px; }
}
#status-bar {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    max-width: 90vw;
}
#step-info {
    color: #fff;
    background: rgba(0,0,0,0.5);
    padding: 6px 16px;
    border-radius: 6px;
    font-size: 14px;
    max-width: 90vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#step-desc {
    color: #ddd;
    background: rgba(0,0,0,0.4);
    padding: 4px 14px;
    border-radius: 6px;
    font-size: 12px;
    max-width: 90vw;
    text-align: center;
    display: none;
}
#right-panels {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 6px;
}
#section-panel {
    min-width: 190px;
    background: rgba(50,50,50,0.85);
    border-radius: 8px;
    backdrop-filter: blur(4px);
    color: #fff;
    font-family: Arial, sans-serif;
    font-size: 14px;
}
#section-panel-hdr {
    padding: 8px 12px;
    cursor: pointer;
    font-weight: bold;
    user-select: none;
    -webkit-user-select: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 8px;
    transition: background 0.15s;
}
#section-panel-hdr:hover { background: rgba(80,80,80,0.9); }
#section-panel-body {
    display: none;
    flex-direction: column;
    gap: 6px;
    padding: 0 10px 10px;
}
#section-panel-body.open { display: flex; }
#section-panel-body .chk-label { font-size: 13px; }
.sec-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
}
.sec-row .sec-axis { min-width: 14px; font-weight: bold; }
.sec-row input[type=range] { flex: 1; accent-color: #0a8; cursor: pointer; }
.sec-row input[type=number] {
    width: 58px;
    background: rgba(30,30,30,0.8);
    border: 1px solid #555;
    border-radius: 4px;
    color: #fff;
    padding: 2px 4px;
    font-size: 12px;
}
#btn-sec-reset {
    margin-top: 2px;
    padding: 6px 10px;
    font-size: 13px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: #fff;
    background: rgba(80,80,80,0.9);
    touch-action: manipulation;
    transition: background 0.15s;
}
#btn-sec-reset:active { background: rgba(120,120,120,0.95); }
#analysis-panel {
    min-width: 190px;
    background: rgba(50,50,50,0.85);
    border-radius: 8px;
    backdrop-filter: blur(4px);
    color: #fff;
    font-family: Arial, sans-serif;
    font-size: 14px;
}
#analysis-panel-hdr {
    padding: 8px 12px;
    cursor: pointer;
    font-weight: bold;
    user-select: none;
    -webkit-user-select: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 8px;
    transition: background 0.15s;
}
#analysis-panel-hdr:hover { background: rgba(80,80,80,0.9); }
#analysis-panel-body {
    display: none;
    flex-direction: column;
    gap: 6px;
    padding: 0 10px 10px;
}
#analysis-panel-body.open { display: flex; }
#analysis-panel-body .chk-label { font-size: 13px; }
#btn-clear-meas {
    margin-top: 2px;
    padding: 6px 10px;
    font-size: 13px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: #fff;
    background: rgba(80,80,80,0.9);
    touch-action: manipulation;
    transition: background 0.15s;
}
#btn-clear-meas:active { background: rgba(120,120,120,0.95); }
.meas-label {
    position: fixed;
    color: #fff;
    background: rgba(200,40,40,0.85);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 11px;
    pointer-events: none;
    white-space: nowrap;
    line-height: 1.4;
    z-index: 5;
}
@media (max-width: 480px) {
    #section-panel { min-width: 150px; font-size: 12px; }
    .sec-row input[type=number] { width: 46px; }
}
</style>
</head>
<body>
<div id="status-bar">
    <div id="step-info">Assembled</div>
    <div id="step-desc"></div>
</div>
<div id="right-panels">
<div id="section-panel">
    <div id="section-panel-hdr">&#x2702; Section &#x25BE;</div>
    <div id="section-panel-body">
        <label class="chk-label"><input type="checkbox" id="chk-section"> Section</label>        
        <label class="chk-label"><input type="checkbox" id="chk-section-cross"> Cross Section Lines</label>
        <label class="chk-label"><input type="checkbox" id="chk-solid-section"${sectionSettings.solidSection ? ' checked' : ''}> Solid Section</label>
        <label class="chk-label"><input type="checkbox" id="chk-section-mesh"> Section Mesh</label>
        <div class="sec-row"><span class="sec-axis">X</span><input type="range" id="sld-px" step="1"><input type="number" id="num-px" step="1"></div>
        <div class="sec-row"><span class="sec-axis">Y</span><input type="range" id="sld-py" step="1"><input type="number" id="num-py" step="1"></div>
        <div class="sec-row"><span class="sec-axis">Z</span><input type="range" id="sld-pz" step="1"><input type="number" id="num-pz" step="1"></div>
        <button id="btn-sec-reset">&#x21BA; Reset</button>
    </div>
</div>
<div id="analysis-panel">
    <div id="analysis-panel-hdr">&#x1F4CF; Analysis &#x25BE;</div>
    <div id="analysis-panel-body">
        <label class="chk-label"><input type="checkbox" id="chk-measure"> Measure (point-to-point)</label>
        <label class="chk-label"><input type="checkbox" id="chk-detect-circle"> Detect circle center</label>
        <button id="btn-clear-meas">&#x1F5D1; Clear measurements</button>
    </div>
</div>
</div>
<div id="canvas-container"></div>
<div id="controls">
    <div class="row">
        <button id="btn-start" title="Reset to start [Home]">⏮ Start</button>
        <button id="btn-finish" title="Reset to finish [End]">Finish ⏭</button>
        <button id="btn-anim-start" title="Animate to start [Shift+PageUp]">&#x23EA; Anim</button>
        <button id="btn-anim-finish" title="Animate to finish [Shift+PageDown]">Anim &#x23E9;</button>
    </div>
    <div class="row">
        <button id="btn-prev" title="Previous step [PageUp / ←]">&#x25C4; Step</button>
        <button id="btn-next" title="Next step [PageDown / →]">Step &#x25BA;</button>
        <label class="chk-label"><input type="checkbox" id="chk-loop"${animSettings.loop ? ' checked' : ''}> &#x221E; Loop</label>
        <label class="chk-label"><input type="checkbox" id="chk-camera"${animSettings.camera ? ' checked' : ''}> &#x1F3A5; Cam</label>
        <label class="chk-label"><input type="checkbox" id="chk-fullscreen"> &#x26F6; Full</label>
    </div>
    <div class="row">
        <label class="chk-label">&#x1F50D; Zoom coeff: <input type="number" id="zoom-coeff" value="${animSettings.zoomCoeff}" min="0.1" max="5" step="0.05" style="width:60px"></label>
    </div>
</div>

<script>${safeLibsBundle}<\/script>
<script type="module">
const THREE = window.THREE;
const GLTFLoader = window.GLTFLoader;
const DRACOLoader = window.DRACOLoader;
const OrbitControls = window.OrbitControls;
const gsap = window.gsap;

// ---- Config ----
const ANIM_DURATION    = ${animSettings.duration};
const ANIM_EASE        = '${animSettings.ease}';
const ANIM_REPEAT      = ${animSettings.repeat};
const ANIM_DELAY       = ${animSettings.delay};
const ANIM_REPEAT_DELAY = ${animSettings.repeatDelay};
const ANIM_YOYO        = ${animSettings.yoyo};
const ANIM_STAGGER     = ${animSettings.stagger};
const ANIM_OVERWRITE   = '${animSettings.overwrite}';
const ANIM_LOOP        = ${animSettings.loop};
const ANIM_CAMERA      = ${animSettings.camera};
const ANIM_ZOOM_COEFF  = ${animSettings.zoomCoeff};
const GLB_BASE64 = '${glbBase64}';

// ---- Scene setup ----
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true, stencil: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;
renderer.localClippingEnabled = ${sectionSettings.section};
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x72645b);

// Lights (matching original)
scene.add(new THREE.HemisphereLight(0x443333, 0x111122));
const dl1 = new THREE.DirectionalLight(0xffffff, 1.35);
dl1.position.set(1, 1, 1);
scene.add(dl1);
const dl2 = new THREE.DirectionalLight(0xffaa00, 1);
dl2.position.set(0.5, 1, -1);
scene.add(dl2);

// Clip planes (section view)
const clipPlanes = [
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), ${sectionSettings.px}),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), ${sectionSettings.py}),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), ${sectionSettings.pz}),
];
let sectionMeshEnabled = ${sectionSettings.showSectionMesh};
let sectionCrossLinesEnabled = ${sectionSettings.sectionCrossLines};
let sectionCrossLinesObj = null;
let solidSectionEnabled = ${sectionSettings.solidSection};
const solidSectionCapColor = '${sectionSettings.capColor}';
const solidSectionObjects = [];
let sceneRoot = null;

// ---- Raycaster & measurement state ----
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const mouseDownPos = new THREE.Vector2();
const mouseUpPos = new THREE.Vector2();
let measureMode = false;
let detectCircleCenter = false;
let pendingPoint = null;
let pendingMarker = null;
let previewMarker = null;
let previewLine = null;
const measurements = [];
const measLabelDivs = [];
const MARKER_RADIUS = 1;
const MARKER_COLOR = 0xff4444;
const LINE_COLOR = 0xff4444;
const PREVIEW_COLOR = 0xff8888;
const MARKER_SCREEN_SIZE = 5;

// Ortho camera
let orthoHalf = 500;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
    -orthoHalf * aspect, orthoHalf * aspect,
     orthoHalf, -orthoHalf,
    0.1, orthoHalf * 40
);
camera.position.set(1000, 1000, 1000);
camera.lookAt(0, 0, 0);

// Headlight
const headlight = new THREE.DirectionalLight(0xffffff, 0.5);
camera.add(headlight);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', render);

// ---- Mouse tracking ----
renderer.domElement.addEventListener('mousemove', function(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    if (measureMode) updateMeasurePreview();
});
renderer.domElement.addEventListener('mousedown', function(e) {
    mouseDownPos.set(e.clientX, e.clientY);
});
renderer.domElement.addEventListener('mouseup', function(e) {
    mouseUpPos.set(e.clientX, e.clientY);
    if (!measureMode) return;
    if (mouseDownPos.distanceTo(mouseUpPos) > 3) return;
    handleMeasureClick();
});

function render() {
    updateMarkerScales();
    renderer.render(scene, camera);
    updateMeasureLabelPositions();
}

function updateCameraFrustum() {
    const a = window.innerWidth / window.innerHeight;
    camera.left   = -orthoHalf * a;
    camera.right  =  orthoHalf * a;
    camera.top    =  orthoHalf;
    camera.bottom = -orthoHalf;
    camera.updateProjectionMatrix();
}

// ── Camera helpers ──
function recalibrateCamera(root) {
    const box = new THREE.Box3().setFromObject(root);
    if (box.isEmpty()) return;
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    orthoHalf    = maxDim * 1.5;
    camera.near  = Math.min(1, maxDim * 0.01);
    camera.far   = maxDim * 10;
    camera.zoom  = 1;
    updateCameraFrustum();
}

function fitView(root) {
    const box = new THREE.Box3().setFromObject(root);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist   = maxDim * 2.6;
    const angle  = Math.PI / 4;
    camera.position.set(
        center.x + dist * Math.cos(angle),
        center.y + dist * Math.sin(angle),
        center.z + dist * Math.cos(angle)
    );
    const frameSize = Math.max(size.x, size.y) * 1.5;
    camera.zoom = Math.min(window.innerWidth / frameSize, window.innerHeight / frameSize);
    camera.lookAt(center);
    controls.target.copy(center);
    updateCameraFrustum();
    controls.update();
}

window.addEventListener('resize', () => {
    updateCameraFrustum();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
});

// ---- Assembly data ----
const assemblySteps = []; // { id, name, description, transformations[] }
let currentStepIndex = -1;
let assemblyAnimation = null;
let assemblyAnimationFinalize = null;
let cameraAnimation = null;
let cameraAnimationFinalize = null;
let loopEnabled = ANIM_LOOP;
let cameraEnabled = ANIM_CAMERA;
let zoomCoeff = ANIM_ZOOM_COEFF;

function updateStatus() {
    const el = document.getElementById('step-info');
    const descEl = document.getElementById('step-desc');
    const n = assemblySteps.length;
    if (currentStepIndex < 0) {
        el.textContent = 'Assembled (' + n + ' step' + (n === 1 ? '' : 's') + ')';
        descEl.style.display = 'none';
    } else {
        const s = assemblySteps[currentStepIndex];
        el.textContent = 'Step ' + (currentStepIndex + 1) + '/' + n + ': ' + (s.name || '');
        if (s.description) {
            descEl.textContent = s.description;
            descEl.style.display = 'block';
        } else {
            descEl.style.display = 'none';
        }
    }
}

// ---- Load GLB ----
function base64ToArrayBuffer(b64) {
    const bin = atob(b64);
    const len = bin.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
}

const loader = new GLTFLoader();

// Draco decoder embedded as base64 for offline use
const DRACO_DECODER_BASE64 = '${dracoDecoderBase64}';
if (DRACO_DECODER_BASE64) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' });
    // Override internal library loading to use embedded decoder
    const decoderText = decodeURIComponent(escape(atob(DRACO_DECODER_BASE64)));
    dracoLoader._loadLibrary = function(url, responseType) {
        if (url === 'draco_decoder.js') return Promise.resolve(decoderText);
        return Promise.reject(new Error('Unexpected Draco library: ' + url));
    };
    loader.setDRACOLoader(dracoLoader);
}

const glbBuffer = base64ToArrayBuffer(GLB_BASE64);
loader.parse(glbBuffer, '', function(gltf) {
    const model = gltf.scene;
    scene.add(model);

    // Import assembly data from userData
    const importedSteps = new Map();
    model.traverse(function(child) {
        const arr = child.userData.assemblyTransformations;
        if (!Array.isArray(arr) || arr.length === 0) return;
        arr.forEach(entry => {
            if (!importedSteps.has(entry.step_id)) {
                importedSteps.set(entry.step_id, {
                    id: entry.step_id,
                    name: entry.step_name || ('Step ' + entry.step_id),
                    description: entry.step_description || '',
                    camera: entry.step_camera || null,
                    transformations: [],
                });
            }
            importedSteps.get(entry.step_id).transformations.push({
                objectRef: child,
                initPosition: entry.initPosition,
                finalPosition: entry.finalPosition,
                initQuaternion: entry.initQuaternion || null,
                finalQuaternion: entry.finalQuaternion || null,
                initScale: entry.initScale || null,
                finalScale: entry.finalScale || null,
            });
        });
        delete child.userData.assemblyTransformations;
    });
    [...importedSteps.values()].sort((a,b) => a.id - b.id).forEach(s => assemblySteps.push(s));

    // Camera setup
    recalibrateCamera(model);
    fitView(model);
    resetToStart();
    updateStatus();

    // Section view setup
    sceneRoot = model;
    applyClipPlanesToMaterials(model);
    if (sectionMeshEnabled) updateSectionMeshes();
    if (solidSectionEnabled) computeSolidSection();
    const _secBox = new THREE.Box3().setFromObject(model);
    const _secSize = _secBox.getSize(new THREE.Vector3());
    const _secRange = Math.ceil(Math.max(_secSize.x, _secSize.y, _secSize.z) * 2);
    setSectionSliderRange(_secRange);

    render();
}, function(error) {
    console.error('GLB load error:', error);
    document.getElementById('step-info').textContent = 'Error loading model.';
});

// ---- Animation helpers ----
function animateStep(transformations, forward, onComplete) {
    if (assemblyAnimation) { assemblyAnimation.kill(); assemblyAnimation = null; }

    const startStates = transformations.map(tr => {
        const tgtP = forward ? tr.finalPosition : tr.initPosition;
        const tgtQ = forward ? tr.finalQuaternion : tr.initQuaternion;
        const tgtS = forward ? tr.finalScale : tr.initScale;
        const hasRot = !!(tr.initQuaternion && tr.finalQuaternion);
        const hasScale = !!(tr.initScale && tr.finalScale);
        return {
            pos: tr.objectRef.position.clone(),
            targetPos: new THREE.Vector3(tgtP.x, tgtP.y, tgtP.z),
            quat: tr.objectRef.quaternion.clone(),
            targetQuat: hasRot ? new THREE.Quaternion(tgtQ.x, tgtQ.y, tgtQ.z, tgtQ.w) : null,
            scale: tr.objectRef.scale.clone(),
            targetScale: hasScale ? new THREE.Vector3(tgtS.x, tgtS.y, tgtS.z) : null,
            hasRot, hasScale,
        };
    });

    assemblyAnimationFinalize = () => {
        if (assemblyAnimation) { assemblyAnimation.kill(); assemblyAnimation = null; }
        startStates.forEach((s, i) => {
            transformations[i].objectRef.position.copy(s.targetPos);
            if (s.hasRot) transformations[i].objectRef.quaternion.copy(s.targetQuat);
            if (s.hasScale) transformations[i].objectRef.scale.copy(s.targetScale);
        });
        render();
        assemblyAnimationFinalize = null;
    };

    if (ANIM_DURATION <= 0) {
        assemblyAnimationFinalize();
        assemblyAnimationFinalize = null;
        if (onComplete) onComplete();
        return;
    }

    const proxy = { t: 0 };
    assemblyAnimation = gsap.to(proxy, {
        t: 1,
        duration:    ANIM_DURATION    / 1000,
        ease:        ANIM_EASE,
        repeat:      ANIM_REPEAT,
        delay:       ANIM_DELAY       / 1000,
        repeatDelay: ANIM_REPEAT_DELAY / 1000,
        yoyo:        ANIM_YOYO,
        stagger:     ANIM_STAGGER    / 1000,
        overwrite:   ANIM_OVERWRITE,
        onUpdate() {
            transformations.forEach((tr, i) => {
                const s = startStates[i];
                tr.objectRef.position.lerpVectors(s.pos, s.targetPos, proxy.t);
                if (s.hasRot) tr.objectRef.quaternion.slerpQuaternions(s.quat, s.targetQuat, proxy.t);
                if (s.hasScale) tr.objectRef.scale.lerpVectors(s.scale, s.targetScale, proxy.t);
            });
            render();
        },
        onComplete() {
            assemblyAnimation = null;
            assemblyAnimationFinalize = null;
            if (onComplete) onComplete();
        },
    });
}

function animateCameraToView(camData, onComplete) {
    if (!camData) { if (onComplete) onComplete(); return; }
    if (cameraAnimation) { cameraAnimation.kill(); cameraAnimation = null; }
    cameraAnimationFinalize = null;
    const startPos    = camera.position.clone();
    const startTarget = controls.target.clone();
    const endPos    = new THREE.Vector3(camData.position.x, camData.position.y, camData.position.z);
    const endTarget = new THREE.Vector3(camData.target.x,   camData.target.y,   camData.target.z);
    const startZoom = camera.zoom;
    const endZoom   = (camData.zoom != null) ? camData.zoom * zoomCoeff : startZoom;
    const EPS = 1e-6;
    if (startPos.distanceToSquared(endPos) < EPS && startTarget.distanceToSquared(endTarget) < EPS && Math.abs(startZoom - endZoom) < EPS) {
        if (onComplete) onComplete(); return;
    }
    cameraAnimationFinalize = () => {
        if (cameraAnimation) { cameraAnimation.kill(); cameraAnimation = null; }
        camera.position.copy(endPos);
        controls.target.copy(endTarget);
        camera.zoom = endZoom;
        camera.updateProjectionMatrix();
        controls.update();
        render();
        cameraAnimationFinalize = null;
        if (onComplete) onComplete();
    };
    if (ANIM_DURATION <= 0) {
        camera.position.copy(endPos);
        controls.target.copy(endTarget);
        camera.zoom = endZoom;
        camera.updateProjectionMatrix();
        controls.update();
        render();
        cameraAnimationFinalize = null;
        if (onComplete) onComplete();
        return;
    }
    const proxy = { t: 0 };
    cameraAnimation = gsap.to(proxy, {
        t: 1,
        duration: ANIM_DURATION / 1000,
        ease: ANIM_EASE,
        onUpdate() {
            camera.position.lerpVectors(startPos, endPos, proxy.t);
            controls.target.lerpVectors(startTarget, endTarget, proxy.t);
            camera.zoom = startZoom + (endZoom - startZoom) * proxy.t;
            camera.updateProjectionMatrix();
            controls.update();
            render();
        },
        onComplete() {
            cameraAnimation = null;
            cameraAnimationFinalize = null;
            if (onComplete) onComplete();
        },
    });
}

// ---- Playback functions ----
function resetToStart() {
    if (assemblyAnimation) { assemblyAnimation.kill(); assemblyAnimation = null; }
    if (cameraAnimation) { cameraAnimation.kill(); cameraAnimation = null; }
    assemblyAnimationFinalize = null;
    cameraAnimationFinalize = null;
    [...assemblySteps].reverse().forEach(step => {
        step.transformations.forEach(t => {
            t.objectRef.position.set(t.initPosition.x, t.initPosition.y, t.initPosition.z);
            if (t.initQuaternion) t.objectRef.quaternion.set(t.initQuaternion.x, t.initQuaternion.y, t.initQuaternion.z, t.initQuaternion.w);
            if (t.initScale) t.objectRef.scale.set(t.initScale.x, t.initScale.y, t.initScale.z);
        });
    });
    currentStepIndex = -1;
    updateStatus();
    render();
}

function resetToFinish() {
    if (assemblyAnimation) { assemblyAnimation.kill(); assemblyAnimation = null; }
    if (cameraAnimation) { cameraAnimation.kill(); cameraAnimation = null; }
    assemblyAnimationFinalize = null;
    cameraAnimationFinalize = null;
    if (!assemblySteps.length) return;
    assemblySteps.forEach(step => {
        step.transformations.forEach(t => {
            t.objectRef.position.set(t.finalPosition.x, t.finalPosition.y, t.finalPosition.z);
            if (t.finalQuaternion) t.objectRef.quaternion.set(t.finalQuaternion.x, t.finalQuaternion.y, t.finalQuaternion.z, t.finalQuaternion.w);
            if (t.finalScale) t.objectRef.scale.set(t.finalScale.x, t.finalScale.y, t.finalScale.z);
        });
    });
    currentStepIndex = assemblySteps.length - 1;
    updateStatus();
    render();
}

function nextStep() {
    cameraAnimationFinalize?.(); cameraAnimationFinalize = null;
    assemblyAnimationFinalize?.(); assemblyAnimationFinalize = null;
    const ni = currentStepIndex + 1;
    if (ni >= assemblySteps.length) return;
    const step = assemblySteps[ni];
    currentStepIndex = ni;
    updateStatus();
    const useCam = step.camera && cameraEnabled;
    if (step.transformations.length === 0) {
        if (useCam) { animateCameraToView(step.camera); }
        return;
    }
    if (useCam) {
        animateCameraToView(step.camera, () => {
            animateStep(step.transformations, true, () => { updateStatus(); });
        });
    } else {
        animateStep(step.transformations, true, () => { updateStatus(); });
    }
}

function prevStep() {
    cameraAnimationFinalize?.(); cameraAnimationFinalize = null;
    assemblyAnimationFinalize?.(); assemblyAnimationFinalize = null;
    if (currentStepIndex < 0) return;
    const step = assemblySteps[currentStepIndex];
    currentStepIndex--;
    updateStatus();
    const useCam = step.camera && cameraEnabled;
    if (step.transformations.length === 0) {
        if (useCam) { animateCameraToView(step.camera); }
        return;
    }
    if (useCam) {
        animateCameraToView(step.camera, () => {
            animateStep(step.transformations, false, () => { updateStatus(); });
        });
    } else {
        animateStep(step.transformations, false, () => { updateStatus(); });
    }
}

function animateToFinish() {
    cameraAnimationFinalize?.(); cameraAnimationFinalize = null;
    assemblyAnimationFinalize?.(); assemblyAnimationFinalize = null;
    if (assemblySteps.length === 0 || currentStepIndex >= assemblySteps.length - 1) return;
    function next() {
        const ni = currentStepIndex + 1;
        if (ni >= assemblySteps.length) {
            if (loopEnabled) animateToStart();
            return;
        }
        const step = assemblySteps[ni];
        currentStepIndex = ni;
        updateStatus();
        const useCam = step.camera && cameraEnabled;
        if (step.transformations.length === 0) {
            if (useCam) {
                animateCameraToView(step.camera, () => next());
            } else {
                next();
            }
            return;
        }
        if (useCam) {
            animateCameraToView(step.camera, () => {
                animateStep(step.transformations, true, () => { updateStatus(); next(); });
            });
        } else {
            animateStep(step.transformations, true, () => { updateStatus(); next(); });
        }
    }
    next();
}

function animateToStart() {
    cameraAnimationFinalize?.(); cameraAnimationFinalize = null;
    assemblyAnimationFinalize?.(); assemblyAnimationFinalize = null;
    if (currentStepIndex < 0) return;
    function prev() {
        if (currentStepIndex < 0) {
            if (loopEnabled) animateToFinish();
            return;
        }
        const step = assemblySteps[currentStepIndex];
        const afterTransforms = () => {
            currentStepIndex--;
            updateStatus();
            prev();
        };
        const useCam = step.camera && cameraEnabled;
        if (step.transformations.length === 0) {
            if (useCam) {
                animateCameraToView(step.camera, () => afterTransforms());
            } else {
                afterTransforms();
            }
            return;
        }
        if (useCam) {
            animateCameraToView(step.camera, () => {
                animateStep(step.transformations, false, () => { updateStatus(); afterTransforms(); });
            });
        } else {
            animateStep(step.transformations, false, () => { updateStatus(); afterTransforms(); });
        }
    }
    prev();
}

// ---- Wire buttons ----
document.getElementById('btn-start').addEventListener('click', resetToStart);
document.getElementById('btn-finish').addEventListener('click', resetToFinish);
document.getElementById('btn-prev').addEventListener('click', prevStep);
document.getElementById('btn-next').addEventListener('click', nextStep);
document.getElementById('btn-anim-start').addEventListener('click', animateToStart);
document.getElementById('btn-anim-finish').addEventListener('click', animateToFinish);
document.getElementById('chk-loop').addEventListener('change', function() {
    loopEnabled = this.checked;
});
document.getElementById('chk-camera').addEventListener('change', function() {
    cameraEnabled = this.checked;
});
document.getElementById('zoom-coeff').addEventListener('input', function() {
    const v = parseFloat(this.value);
    if (!isNaN(v) && v >= 0.1 && v <= 5) zoomCoeff = v;
});
document.getElementById('chk-fullscreen').addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.requestFullscreen().catch(() => { this.checked = false; });
    } else {
        document.exitFullscreen();
    }
});
document.addEventListener('fullscreenchange', function() {
    document.getElementById('chk-fullscreen').checked = !!document.fullscreenElement;
});

// ---- Section view functions ----
function applyClipPlanesToMaterials(root) {
    root.traverse(function(child) {
        if (child.isMesh && !child.isSectionMesh) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(mat => {
                mat.clippingPlanes = clipPlanes;
                mat.clipIntersection = true;
                mat.side = THREE.DoubleSide;
                mat.needsUpdate = true;
            });
        }
    });
}

function createSectionMesh(mesh) {
    if (mesh.children.some(c => c.isSectionMesh)) return;
    const sm = mesh.clone(false);
    const mats = Array.isArray(sm.material) ? sm.material : [sm.material];
    const newMats = mats.map(mat => new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        clippingPlanes: clipPlanes,
        clipIntersection: true,
        color: mat.color,
        polygonOffset: true,
        polygonOffsetFactor: -1,
    }));
    sm.material = Array.isArray(mesh.material) ? newMats : newMats[0];
    sm.position.set(0, 0, 0);
    sm.rotation.set(0, 0, 0);
    sm.scale.set(1, 1, 1);
    sm.isSectionMesh = true;
    mesh.add(sm);
}

function removeSectionMeshes(root) {
    root.traverse(function(child) {
        if (child.isMesh && !child.isSectionMesh) {
            [...child.children].filter(c => c.isSectionMesh).forEach(sm => {
                child.remove(sm);
                if (sm.geometry) sm.geometry.dispose();
                (Array.isArray(sm.material) ? sm.material : [sm.material]).forEach(m => m.dispose());
            });
        }
    });
}

function updateSectionMeshes() {
    if (!sceneRoot) return;
    if (sectionMeshEnabled) {
        sceneRoot.traverse(c => { if (c.isMesh && !c.isSectionMesh) createSectionMesh(c); });
    } else {
        removeSectionMeshes(sceneRoot);
    }
}

function checkEdgeSec(v1, v2, plane, pts) {
    const eps = 1e-6;
    const d1 = plane.distanceToPoint(v1);
    const d2 = plane.distanceToPoint(v2);
    if (Math.abs(d1) < eps && Math.abs(d2) < eps) { pts.push(v1.clone(), v2.clone()); return; }
    if (Math.abs(d1) < eps) { pts.push(v1.clone()); return; }
    if (Math.abs(d2) < eps) { pts.push(v2.clone()); return; }
    if ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) {
        const t = d1 / (d1 - d2);
        pts.push(new THREE.Vector3().lerpVectors(v1, v2, t));
    }
}

function createMeshCrossLines(mesh, plane, color) {
    const geom = mesh.geometry;
    if (!geom || !geom.attributes.position) return null;
    const pos = geom.attributes.position;
    const idx = geom.index ? geom.index.array : null;
    const verts = [];
    for (let i = 0; i < pos.count; i++) {
        verts.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(mesh.matrixWorld));
    }
    const triCount = idx ? idx.length / 3 : verts.length / 3;
    const lines = [];
    for (let i = 0; i < triCount; i++) {
        const i0 = idx ? idx[i*3] : i*3, i1 = idx ? idx[i*3+1] : i*3+1, i2 = idx ? idx[i*3+2] : i*3+2;
        const pts = [];
        checkEdgeSec(verts[i0], verts[i1], plane, pts);
        checkEdgeSec(verts[i1], verts[i2], plane, pts);
        checkEdgeSec(verts[i2], verts[i0], plane, pts);
        const eps = 1e-6;
        const uniq = [];
        for (const p of pts) { if (!uniq.some(u => u.distanceToSquared(p) < eps*eps)) uniq.push(p); }
        if (uniq.length >= 2) { lines.push(uniq[0], uniq[1]); }
    }
    if (lines.length === 0) return null;
    const lg = new THREE.BufferGeometry().setFromPoints(lines);
    return new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: new THREE.Color(color), linewidth: 2 }));
}

function updateSectionCrossLines() {
    if (sectionCrossLinesObj) {
        scene.remove(sectionCrossLinesObj);
        sectionCrossLinesObj.geometry.dispose();
        sectionCrossLinesObj.material.dispose();
        sectionCrossLinesObj = null;
    }
    if (!sectionCrossLinesEnabled || !renderer.localClippingEnabled || !sceneRoot) return;
    const allLines = [];
    for (let ci = 0; ci < clipPlanes.length; ci++) {
        const plane = clipPlanes[ci];
        sceneRoot.traverse(function(child) {
            if (child.isMesh && child.visible && !child.isSectionMesh) {
                const l = createMeshCrossLines(child, plane, '${sectionSettings.crossSectionColor}');
                if (l && l.geometry.attributes.position.count > 0) allLines.push(l);
            }
        });
    }
    if (allLines.length > 0) {
        const positions = [];
        allLines.forEach(function(lo) {
            const p = lo.geometry.attributes.position;
            for (let i = 0; i < p.count; i++) positions.push(p.getX(i), p.getY(i), p.getZ(i));
            lo.geometry.dispose(); lo.material.dispose();
        });
        const cg = new THREE.BufferGeometry();
        cg.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        sectionCrossLinesObj = new THREE.LineSegments(cg, new THREE.LineBasicMaterial({ color: new THREE.Color('${sectionSettings.crossSectionColor}'), linewidth: 2 }));
        scene.add(sectionCrossLinesObj);
    }
    render();
}

function isEffectivelyVisible(obj) {
    let o = obj;
    while (o) {
        if (!o.visible) return false;
        o = o.parent;
    }
    return true;
}

function computeSolidSection() {
    clearSolidSection();
    if (!sceneRoot) return;
    const meshes = [];
    sceneRoot.traverse(function(c) {
        if (c.isMesh && isEffectivelyVisible(c) && !c.isSectionMesh) meshes.push(c);
    });
    if (meshes.length === 0) return;

    const sceneBBox = new THREE.Box3();
    meshes.forEach(function(m) { sceneBBox.expandByObject(m); });
    if (sceneBBox.isEmpty()) return;

    const sceneSize   = sceneBBox.getSize(new THREE.Vector3());
    const sceneCenter = sceneBBox.getCenter(new THREE.Vector3());
    const planeSize   = Math.max(sceneSize.x, sceneSize.y, sceneSize.z) * 4;
    const capGeo      = new THREE.PlaneGeometry(planeSize, planeSize);

    const px = clipPlanes[0].constant, py = clipPlanes[1].constant, pz = clipPlanes[2].constant;

    const sPlanes = [
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), px),
        new THREE.Plane(new THREE.Vector3(0, -1, 0), py),
        new THREE.Plane(new THREE.Vector3(0, 0, -1), pz),
    ];
    const constraintPlanes = [
        [new THREE.Plane(new THREE.Vector3(0, 1, 0), -py), new THREE.Plane(new THREE.Vector3(0, 0, 1), -pz)],
        [new THREE.Plane(new THREE.Vector3(1, 0, 0), -px), new THREE.Plane(new THREE.Vector3(0, 0, 1), -pz)],
        [new THREE.Plane(new THREE.Vector3(1, 0, 0), -px), new THREE.Plane(new THREE.Vector3(0, 1, 0), -py)],
    ];
    const capTransforms = [
        { pos: new THREE.Vector3(px, sceneCenter.y, sceneCenter.z), rot: new THREE.Euler(0, Math.PI / 2, 0) },
        { pos: new THREE.Vector3(sceneCenter.x, py, sceneCenter.z), rot: new THREE.Euler(-Math.PI / 2, 0, 0) },
        { pos: new THREE.Vector3(sceneCenter.x, sceneCenter.y, pz), rot: new THREE.Euler(0, 0, 0) },
    ];

    let order = 1;
    for (let i = 0; i < 3; i++) {
        const plane      = sPlanes[i];
        const constraint = constraintPlanes[i];
        const transform  = capTransforms[i];

        meshes.forEach(function(mesh) {
            mesh.updateWorldMatrix(true, false);
            solidSectionObjects.push(makeStencilMesh(mesh, plane, THREE.BackSide,  THREE.IncrementWrapStencilOp, order));
            solidSectionObjects.push(makeStencilMesh(mesh, plane, THREE.FrontSide, THREE.DecrementWrapStencilOp, order));
        });

        const capMat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(solidSectionCapColor),
            roughness: 0.5,
            metalness: 0.1,
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: true,
            stencilWrite: true,
            stencilRef: 0,
            stencilFunc: THREE.NotEqualStencilFunc,
            stencilFail:  THREE.KeepStencilOp,
            stencilZFail: THREE.KeepStencilOp,
            stencilZPass: THREE.KeepStencilOp,
            clippingPlanes: constraint,
        });
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.copy(transform.pos);
        cap.rotation.copy(transform.rot);
        cap.renderOrder = order + 1;
        cap.frustumCulled = false;
        cap.onAfterRender = function(r) { r.clearStencil(); };
        scene.add(cap);
        solidSectionObjects.push(cap);

        order += 2;
    }
    render();
}

function clearSolidSection() {
    solidSectionObjects.forEach(function(obj) {
        if (obj.parent) obj.parent.remove(obj);
        if (obj.material) {
            (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(function(m) { m.dispose(); });
        }
    });
    solidSectionObjects.length = 0;
}

function makeStencilMesh(mesh, clipPlane, side, stencilOp, renderOrder) {
    const mat = new THREE.MeshBasicMaterial({
        side: side,
        depthWrite: false,
        depthTest: false,
        colorWrite: false,
        stencilWrite: true,
        stencilFunc: THREE.AlwaysStencilFunc,
        stencilFail:  stencilOp,
        stencilZFail: stencilOp,
        stencilZPass: stencilOp,
        clippingPlanes: [clipPlane],
    });
    const m = new THREE.Mesh(mesh.geometry, mat);
    m.matrixAutoUpdate = false;
    m.frustumCulled = false;
    m.matrix.copy(mesh.matrixWorld);
    m.renderOrder = renderOrder;
    m.onBeforeRender = function() {
        mesh.updateWorldMatrix(true, false);
        m.matrixWorld.copy(mesh.matrixWorld);
    };
    scene.add(m);
    return m;
}

function setSectionSliderRange(range) {
    document.getElementById('sld-px').min = -range; document.getElementById('sld-px').max = range;
    document.getElementById('num-px').min = -range; document.getElementById('num-px').max = range;
    document.getElementById('sld-py').min = -range; document.getElementById('sld-py').max = range;
    document.getElementById('num-py').min = -range; document.getElementById('num-py').max = range;
    document.getElementById('sld-pz').min = -range; document.getElementById('sld-pz').max = range;
    document.getElementById('num-pz').min = -range; document.getElementById('num-pz').max = range;
}

// ---- Section UI wiring ----
document.getElementById('section-panel-hdr').addEventListener('click', function() {
    const body = document.getElementById('section-panel-body');
    body.classList.toggle('open');
    this.innerHTML = body.classList.contains('open') ? '&#x2702; Section &#x25B4;' : '&#x2702; Section &#x25BE;';
});

// Auto-open panel if section was active on export
${sectionSettings.section ? `document.getElementById('section-panel-body').classList.add('open');
document.getElementById('section-panel-hdr').innerHTML = '&#x2702; Section &#x25B4;';` : ''}

const chkSection = document.getElementById('chk-section');
chkSection.checked = renderer.localClippingEnabled;
chkSection.addEventListener('change', function() {
    renderer.localClippingEnabled = this.checked;
    if (!this.checked && solidSectionEnabled) { clearSolidSection(); }
    if (this.checked && solidSectionEnabled) { computeSolidSection(); }
    updateSectionCrossLines();
    render();
});

const chkSolidSection = document.getElementById('chk-solid-section');
chkSolidSection.addEventListener('change', function() {
    solidSectionEnabled = this.checked;
    if (this.checked) {
        renderer.localClippingEnabled = true;
        chkSection.checked = true;
        computeSolidSection();
    } else {
        clearSolidSection();
        render();
    }
});

const chkSectionMesh = document.getElementById('chk-section-mesh');
chkSectionMesh.checked = sectionMeshEnabled;
chkSectionMesh.addEventListener('change', function() {
    sectionMeshEnabled = this.checked;
    updateSectionMeshes();
    render();
});

const chkSectionCross = document.getElementById('chk-section-cross');
chkSectionCross.checked = sectionCrossLinesEnabled;
chkSectionCross.addEventListener('change', function() {
    sectionCrossLinesEnabled = this.checked;
    updateSectionCrossLines();
});

function wireAxisSlider(sldId, numId, idx) {
    const sld = document.getElementById(sldId);
    const num = document.getElementById(numId);
    sld.value = clipPlanes[idx].constant;
    num.value = clipPlanes[idx].constant;
    function update(v) {
        clipPlanes[idx].constant = v;
        sld.value = v; num.value = v;
        if (sectionCrossLinesEnabled) updateSectionCrossLines();
        if (solidSectionEnabled) computeSolidSection();
        render();
    }
    sld.addEventListener('input', () => update(parseFloat(sld.value)));
    num.addEventListener('change', () => update(parseFloat(num.value) || 0));
}
wireAxisSlider('sld-px', 'num-px', 0);
wireAxisSlider('sld-py', 'num-py', 1);
wireAxisSlider('sld-pz', 'num-pz', 2);

document.getElementById('btn-sec-reset').addEventListener('click', function() {
    clipPlanes[0].constant = 0; clipPlanes[1].constant = 0; clipPlanes[2].constant = 0;
    document.getElementById('sld-px').value = 0; document.getElementById('num-px').value = 0;
    document.getElementById('sld-py').value = 0; document.getElementById('num-py').value = 0;
    document.getElementById('sld-pz').value = 0; document.getElementById('num-pz').value = 0;
    if (sectionCrossLinesEnabled) updateSectionCrossLines();
    if (solidSectionEnabled) computeSolidSection();
    render();
});

// ---- Analysis: Measurement helpers ----
function getMeshObjects() {
    const meshes = [];
    if (sceneRoot) sceneRoot.traverse(function(c) {
        if (c.isMesh && c.visible && !c.isSectionMesh) meshes.push(c);
    });
    return meshes;
}

function projectToScreen(point) {
    const v = point.clone().project(camera);
    return {
        x: (v.x * 0.5 + 0.5) * window.innerWidth,
        y: (-v.y * 0.5 + 0.5) * window.innerHeight
    };
}

function createMarker(position) {
    const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: MARKER_COLOR, depthTest: false });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 999;
    mesh.position.copy(position);
    return mesh;
}

function createLine(p1, p2) {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    const mat = new THREE.LineBasicMaterial({ color: LINE_COLOR, depthTest: false });
    const line = new THREE.Line(geo, mat);
    line.renderOrder = 999;
    return line;
}

function createMeasLabel(text, midPoint) {
    const div = document.createElement('div');
    div.className = 'meas-label';
    div.innerHTML = text;
    document.body.appendChild(div);
    return { div: div, point: midPoint };
}

function updateMeasureLabelPositions() {
    for (const ml of measLabelDivs) {
        const s = projectToScreen(ml.point);
        ml.div.style.left = s.x + 'px';
        ml.div.style.top = s.y + 'px';
    }
}

function updateMarkerScales() {
    const allMarkers = [];
    for (const m of measurements) { allMarkers.push(m.marker1, m.marker2); }
    if (pendingMarker) allMarkers.push(pendingMarker);
    if (previewMarker) allMarkers.push(previewMarker);
    if (allMarkers.length === 0) return;
    const viewHeight = (camera.top - camera.bottom) / camera.zoom;
    const s = viewHeight / window.innerHeight * MARKER_SCREEN_SIZE;
    for (const mk of allMarkers) mk.scale.setScalar(s);
}

function hidePreview() {
    if (previewMarker) { scene.remove(previewMarker); previewMarker.geometry.dispose(); previewMarker.material.dispose(); previewMarker = null; }
    if (previewLine) { scene.remove(previewLine); previewLine.geometry.dispose(); previewLine.material.dispose(); previewLine = null; }
}

function updateMeasurePreview() {
    if (!measureMode || !sceneRoot) { hidePreview(); return; }
    raycaster.setFromCamera(mouse, camera);
    const meshes = getMeshObjects();
    const hits = raycaster.intersectObjects(meshes);
    const visHits = (renderer.localClippingEnabled && clipPlanes.length > 0)
        ? hits.filter(function(h) { return clipPlanes.some(function(p) { return p.distanceToPoint(h.point) >= 0; }); })
        : hits;
    if (visHits.length === 0) { hidePreview(); render(); return; }
    let pt = visHits[0].point;
    if (detectCircleCenter) {
        const cc = detectCircleCenterFromHit(visHits[0]);
        if (cc) pt = cc;
    }
    if (!previewMarker) {
        const geo = new THREE.SphereGeometry(MARKER_RADIUS, 12, 12);
        const mat = new THREE.MeshBasicMaterial({ color: PREVIEW_COLOR, depthTest: false, transparent: true, opacity: 0.7 });
        previewMarker = new THREE.Mesh(geo, mat);
        previewMarker.renderOrder = 999;
        scene.add(previewMarker);
    }
    previewMarker.position.copy(pt);
    if (pendingPoint) {
        if (previewLine) { scene.remove(previewLine); previewLine.geometry.dispose(); previewLine.material.dispose(); }
        const geo = new THREE.BufferGeometry().setFromPoints([pendingPoint, pt]);
        const mat = new THREE.LineDashedMaterial({ color: LINE_COLOR, dashSize: 4, gapSize: 3, depthTest: false });
        previewLine = new THREE.Line(geo, mat);
        previewLine.computeLineDistances();
        previewLine.renderOrder = 999;
        scene.add(previewLine);
    } else if (previewLine) {
        scene.remove(previewLine); previewLine.geometry.dispose(); previewLine.material.dispose(); previewLine = null;
    }
    render();
}

function handleMeasureClick() {
    if (!sceneRoot) return;
    raycaster.setFromCamera(mouse, camera);
    const meshes = getMeshObjects();
    const hits = raycaster.intersectObjects(meshes);
    const visHits = (renderer.localClippingEnabled && clipPlanes.length > 0)
        ? hits.filter(function(h) { return clipPlanes.some(function(p) { return p.distanceToPoint(h.point) >= 0; }); })
        : hits;
    if (visHits.length === 0) return;
    let pt = visHits[0].point;
    if (detectCircleCenter) {
        const cc = detectCircleCenterFromHit(visHits[0]);
        if (cc) pt = cc;
    }
    addMeasurePoint(pt);
}

function addMeasurePoint(point) {
    if (!pendingPoint) {
        pendingPoint = point.clone();
        pendingMarker = createMarker(pendingPoint);
        scene.add(pendingMarker);
        render();
    } else {
        const p1 = pendingPoint;
        const p2 = point.clone();
        const dist = p1.distanceTo(p2);
        const marker1 = pendingMarker;
        const marker2 = createMarker(p2);
        const line = createLine(p1, p2);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const dx = Math.abs(p2.x - p1.x), dy = Math.abs(p2.y - p1.y), dz = Math.abs(p2.z - p1.z);
        const txt = dist.toFixed(2) + '<br><span style="font-size:10px;opacity:0.85;">&Delta;x ' + dx.toFixed(2) + '<br>&Delta;y ' + dy.toFixed(2) + '<br>&Delta;z ' + dz.toFixed(2) + '</span>';
        const ml = createMeasLabel(txt, mid);
        scene.add(marker2);
        scene.add(line);
        measurements.push({ line: line, marker1: marker1, marker2: marker2, p1: p1, p2: p2 });
        measLabelDivs.push(ml);
        pendingPoint = null;
        pendingMarker = null;
        hidePreview();
        render();
    }
}

function clearMeasurements() {
    if (pendingMarker) { scene.remove(pendingMarker); pendingMarker.geometry.dispose(); pendingMarker.material.dispose(); pendingMarker = null; }
    pendingPoint = null;
    for (const m of measurements) {
        scene.remove(m.line); scene.remove(m.marker1); scene.remove(m.marker2);
        m.line.geometry.dispose(); m.line.material.dispose();
        m.marker1.geometry.dispose(); m.marker1.material.dispose();
        m.marker2.geometry.dispose(); m.marker2.material.dispose();
    }
    measurements.length = 0;
    for (const ml of measLabelDivs) { ml.div.remove(); }
    measLabelDivs.length = 0;
    hidePreview();
    render();
}

// ---- Analysis: Circle detection ----
const SHARP_ANGLE_DEG = 12;
const CIRCLE_FIT_TOLERANCE = 0.25;
const MIN_LOOP_VERTICES = 3;
const MAX_LOOP_VERTICES = 4000;
const _geoCache = new WeakMap();
const _faceCache = { mesh: null, faceIndex: -1, result: null };

function _getGeoData(geometry) {
    if (_geoCache.has(geometry)) return _geoCache.get(geometry);
    const pos = geometry.getAttribute('position');
    const rawIdx = geometry.index;
    const vertCount = pos.count;
    const bbox = geometry.boundingBox || (geometry.computeBoundingBox(), geometry.boundingBox);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
    const eps = maxDim * 1e-5;
    const invEps = 1 / eps;
    const posMap = new Map();
    const canonical = new Int32Array(vertCount);
    const canonPos = [];
    let nextCanon = 0;
    for (let i = 0; i < vertCount; i++) {
        const key = Math.round(pos.getX(i) * invEps) + '_' + Math.round(pos.getY(i) * invEps) + '_' + Math.round(pos.getZ(i) * invEps);
        if (!posMap.has(key)) { posMap.set(key, nextCanon); canonPos.push(i); nextCanon++; }
        canonical[i] = posMap.get(key);
    }
    const getOrigIdx = rawIdx ? function(i) { return rawIdx.getX(i); } : function(i) { return i; };
    const totalIdx = rawIdx ? rawIdx.count : vertCount;
    const faceCount = Math.floor(totalIdx / 3);
    const faceNormals = new Array(faceCount);
    const faceVerts = new Array(faceCount);
    const v0 = new THREE.Vector3(), v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
    const e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
    for (let f = 0; f < faceCount; f++) {
        const oi0 = getOrigIdx(f * 3), oi1 = getOrigIdx(f * 3 + 1), oi2 = getOrigIdx(f * 3 + 2);
        faceVerts[f] = [canonical[oi0], canonical[oi1], canonical[oi2]];
        v0.fromBufferAttribute(pos, oi0); v1.fromBufferAttribute(pos, oi1); v2.fromBufferAttribute(pos, oi2);
        e1.subVectors(v1, v0); e2.subVectors(v2, v0);
        faceNormals[f] = new THREE.Vector3().crossVectors(e1, e2).normalize();
    }
    const edgeFaces = new Map();
    const faceEdges = new Array(faceCount);
    for (let f = 0; f < faceCount; f++) {
        const [a, b, c] = faceVerts[f];
        const keys = [];
        for (const [u, vv] of [[a, b], [b, c], [c, a]]) {
            const key = Math.min(u, vv) + '_' + Math.max(u, vv);
            keys.push(key);
            if (!edgeFaces.has(key)) edgeFaces.set(key, []);
            edgeFaces.get(key).push(f);
        }
        faceEdges[f] = keys;
    }
    const sharpThreshold = Math.cos(SHARP_ANGLE_DEG * Math.PI / 180);
    const sharpEdgeSet = new Set();
    const vertSharpAdj = new Map();
    for (const [key, faces] of edgeFaces) {
        let isSharp = false;
        if (faces.length === 1) { isSharp = true; }
        else { for (let i = 0; i < faces.length - 1 && !isSharp; i++) { for (let j = i + 1; j < faces.length && !isSharp; j++) { if (faceNormals[faces[i]].dot(faceNormals[faces[j]]) < sharpThreshold) isSharp = true; } } }
        if (isSharp) {
            sharpEdgeSet.add(key);
            const [a, b] = key.split('_').map(Number);
            if (!vertSharpAdj.has(a)) vertSharpAdj.set(a, new Map());
            if (!vertSharpAdj.has(b)) vertSharpAdj.set(b, new Map());
            vertSharpAdj.get(a).set(b, key);
            vertSharpAdj.get(b).set(a, key);
        }
    }
    const usedEdges = new Set();
    const circles = [];
    for (const startEdge of sharpEdgeSet) {
        if (usedEdges.has(startEdge)) continue;
        const [startA, startB] = startEdge.split('_').map(Number);
        const loop = _walkLoop(startA, startB, vertSharpAdj, canonPos, pos);
        if (!loop || loop.length < MIN_LOOP_VERTICES) continue;
        const loopKey = loop.slice().sort(function(a, b) { return a - b; }).join(',');
        if (usedEdges.has('L_' + loopKey)) continue;
        usedEdges.add('L_' + loopKey);
        const loopPts = loop.map(function(cv) { return new THREE.Vector3().fromBufferAttribute(pos, canonPos[cv]); });
        const fit = _fitCircle3D(loopPts);
        if (!fit) continue;
        for (let i = 0; i < loop.length; i++) {
            const a = loop[i], b = loop[(i + 1) % loop.length];
            usedEdges.add(Math.min(a, b) + '_' + Math.max(a, b));
        }
        circles.push({ loopVerts: loop, center: fit.center, radius: fit.radius });
    }
    const vertToCircles = new Map();
    for (let ci = 0; ci < circles.length; ci++) {
        for (const vv of circles[ci].loopVerts) {
            if (!vertToCircles.has(vv)) vertToCircles.set(vv, []);
            vertToCircles.get(vv).push(ci);
        }
    }
    const data = { canonPos: canonPos, faceVerts: faceVerts, faceCount: faceCount, faceEdges: faceEdges, edgeFaces: edgeFaces, sharpEdgeSet: sharpEdgeSet, circles: circles, vertToCircles: vertToCircles };
    _geoCache.set(geometry, data);
    return data;
}

function _walkLoop(startU, startV, vertSharpAdj, canonPos, pos) {
    const loop = [startU];
    let prev = startU, curr = startV;
    for (let i = 0; i < MAX_LOOP_VERTICES; i++) {
        if (curr === startU) return loop;
        loop.push(curr);
        const adj = vertSharpAdj.get(curr);
        if (!adj || adj.size < 2) return null;
        if (adj.size === 2) {
            let next = -1;
            for (const [n] of adj) { if (n !== prev) { next = n; break; } }
            if (next === -1) return null;
            prev = curr; curr = next;
        } else {
            const pPrev = _posFromCanon(prev, canonPos, pos);
            const pCurr = _posFromCanon(curr, canonPos, pos);
            const inDir = new THREE.Vector3().subVectors(pCurr, pPrev).normalize();
            let bestNext = -1, bestDot = -2;
            for (const [n] of adj) {
                if (n === prev) continue;
                const pN = _posFromCanon(n, canonPos, pos);
                const d = inDir.dot(new THREE.Vector3().subVectors(pN, pCurr).normalize());
                if (d > bestDot) { bestDot = d; bestNext = n; }
            }
            if (bestNext === -1) return null;
            prev = curr; curr = bestNext;
        }
    }
    return null;
}

function _posFromCanon(cv, canonPos, pos) {
    const oi = canonPos[cv];
    return new THREE.Vector3(pos.getX(oi), pos.getY(oi), pos.getZ(oi));
}

function _fitCircle3D(points) {
    const count = points.length;
    if (count < 3) return null;
    const centroid = new THREE.Vector3();
    for (const p of points) centroid.add(p);
    centroid.divideScalar(count);
    const p0 = points[0], p1 = points[Math.floor(count / 3)], p2 = points[Math.floor(2 * count / 3)];
    const fe1 = new THREE.Vector3().subVectors(p1, p0);
    const fe2 = new THREE.Vector3().subVectors(p2, p0);
    const normal = new THREE.Vector3().crossVectors(fe1, fe2).normalize();
    if (normal.lengthSq() < 1e-10) return null;
    const uDir = fe1.clone().normalize();
    const vDir = new THREE.Vector3().crossVectors(normal, uDir).normalize();
    const pts2d = points.map(function(p) { const d = new THREE.Vector3().subVectors(p, centroid); return { x: d.dot(uDir), y: d.dot(vDir) }; });
    let sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0, sxd = 0, syd = 0, sd = 0;
    for (const pt of pts2d) {
        const dd = pt.x * pt.x + pt.y * pt.y;
        sx += pt.x; sy += pt.y; sxx += pt.x * pt.x; syy += pt.y * pt.y; sxy += pt.x * pt.y; sxd += pt.x * dd; syd += pt.y * dd; sd += dd;
    }
    const M = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, count]];
    const B = [sxd, syd, sd];
    const det = M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
    if (Math.abs(det) < 1e-12) return null;
    const a = (B[0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (B[1] * M[2][2] - M[1][2] * B[2]) + M[0][2] * (B[1] * M[2][1] - M[1][1] * B[2])) / det;
    const b = (M[0][0] * (B[1] * M[2][2] - M[1][2] * B[2]) - B[0] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * B[2] - B[1] * M[2][0])) / det;
    const cx = a / 2, cy = b / 2;
    const cVal = (M[0][0] * (M[1][1] * B[2] - B[1] * M[2][1]) - M[0][1] * (M[1][0] * B[2] - B[1] * M[2][0]) + B[0] * (M[1][0] * M[2][1] - M[1][1] * M[2][0])) / det;
    const rSq = cVal + cx * cx + cy * cy;
    if (rSq <= 0) return null;
    const r = Math.sqrt(rSq);
    let maxErr = 0;
    for (const pt of pts2d) { const dist = Math.sqrt((pt.x - cx) * (pt.x - cx) + (pt.y - cy) * (pt.y - cy)); maxErr = Math.max(maxErr, Math.abs(dist - r)); }
    if (maxErr > r * CIRCLE_FIT_TOLERANCE) return null;
    const center3d = centroid.clone().add(uDir.clone().multiplyScalar(cx)).add(vDir.clone().multiplyScalar(cy));
    return { center: center3d, radius: r };
}

function detectCircleCenterFromHit(hit) {
    if (!hit || hit.faceIndex == null) return null;
    const mesh = hit.object;
    const faceIndex = hit.faceIndex;
    if (_faceCache.mesh === mesh && _faceCache.faceIndex === faceIndex) return _faceCache.result;
    const geometry = mesh.geometry;
    if (!geometry) return _cacheFace(mesh, faceIndex, null);
    const pos = geometry.getAttribute('position');
    if (!pos) return _cacheFace(mesh, faceIndex, null);
    const data = _getGeoData(geometry);
    if (faceIndex >= data.faceCount || data.circles.length === 0) return _cacheFace(mesh, faceIndex, null);
    const BFS_MAX = 3000;
    const visited = new Set([faceIndex]);
    const cands = new Set();
    let frontier = [faceIndex];
    for (const cv of data.faceVerts[faceIndex]) { const cis = data.vertToCircles.get(cv); if (cis) for (const ci of cis) cands.add(ci); }
    while (frontier.length > 0 && visited.size < BFS_MAX) {
        const nf = [];
        for (const fi of frontier) {
            for (const ek of data.faceEdges[fi]) {
                if (data.sharpEdgeSet.has(ek)) {
                    const [a, b] = ek.split('_').map(Number);
                    for (const cv of [a, b]) { const cis = data.vertToCircles.get(cv); if (cis) for (const ci of cis) cands.add(ci); }
                    continue;
                }
                const ef = data.edgeFaces.get(ek);
                if (!ef) continue;
                for (const f of ef) { if (!visited.has(f)) { visited.add(f); nf.push(f); for (const cv of data.faceVerts[f]) { const cis = data.vertToCircles.get(cv); if (cis) for (const ci of cis) cands.add(ci); } } }
            }
        }
        frontier = nf;
    }
    if (cands.size === 0) return _cacheFace(mesh, faceIndex, null);
    mesh.updateMatrixWorld(true);
    let best = null, bestDist = Infinity;
    for (const ci of cands) {
        const wc = data.circles[ci].center.clone().applyMatrix4(mesh.matrixWorld);
        const d = wc.distanceTo(hit.point);
        if (d < bestDist) { bestDist = d; best = wc; }
    }
    return _cacheFace(mesh, faceIndex, best);
}

function _cacheFace(mesh, faceIndex, result) { _faceCache.mesh = mesh; _faceCache.faceIndex = faceIndex; _faceCache.result = result; return result; }

// ---- Analysis UI wiring ----
document.getElementById('analysis-panel-hdr').addEventListener('click', function() {
    const body = document.getElementById('analysis-panel-body');
    body.classList.toggle('open');
    this.innerHTML = body.classList.contains('open') ? '&#x1F4CF; Analysis &#x25B4;' : '&#x1F4CF; Analysis &#x25BE;';
});

document.getElementById('chk-measure').addEventListener('change', function() {
    measureMode = this.checked;
    if (!measureMode) {
        if (pendingMarker) { scene.remove(pendingMarker); pendingMarker.geometry.dispose(); pendingMarker.material.dispose(); pendingMarker = null; }
        pendingPoint = null;
        hidePreview();
        render();
    }
});

document.getElementById('chk-detect-circle').addEventListener('change', function() {
    detectCircleCenter = this.checked;
});

document.getElementById('btn-clear-meas').addEventListener('click', clearMeasurements);

// ---- Keyboard shortcuts ----
window.addEventListener('keydown', function(e) {
    switch (e.key) {
        case 'Home':
            resetToStart();
            e.preventDefault();
            break;
        case 'End':
            resetToFinish();
            e.preventDefault();
            break;
        case 'PageUp':
            if (e.shiftKey) { animateToStart(); } else { prevStep(); }
            e.preventDefault();
            break;
        case 'PageDown':
            if (e.shiftKey) { animateToFinish(); } else { nextStep(); }
            e.preventDefault();
            break;
        case 'ArrowLeft':
            prevStep();
            e.preventDefault();
            break;
        case 'ArrowRight':
            nextStep();
            e.preventDefault();
            break;
        case 'Escape':
            if (measureMode) {
                measureMode = false;
                document.getElementById('chk-measure').checked = false;
                if (pendingMarker) { scene.remove(pendingMarker); pendingMarker.geometry.dispose(); pendingMarker.material.dispose(); pendingMarker = null; }
                pendingPoint = null;
                hidePreview();
                render();
                e.preventDefault();
            }
            break;
    }
});
<\/script>
</body>
</html>`;
}

// ===== Obfuscated HTML Export ===================================================================

export function exportToHTMLObfuscated(loadedModels, assemblyGui, viewProp, assemblyWriteToUserData, assemblyClearUserData) {
    if (loadedModels.length === 0) {
        alert('No models to export.');
        return;
    }
    const defaultName = 'assembly_viewer_obf.html';
    const filename = window.prompt('File name for obfuscated HTML export:', defaultName);
    if (filename === null) return;
    const finalName = filename.trim() || defaultName;

    assemblyWriteToUserData();

    const exporter = new GLTFExporter();
    const group = new THREE.Group();
    loadedModels.forEach(model => group.add(model.clone(true)));

    assemblyClearUserData();

    exporter.parse(group, function(glbBuffer) {
        const bytes = new Uint8Array(glbBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        const animSettings = {
            duration:    assemblyGui.animationDuration,
            ease:        assemblyGui.animationEase,
            repeat:      assemblyGui.animationRepeat,
            delay:       assemblyGui.animationDelay,
            repeatDelay: assemblyGui.animationRepeatDelay,
            yoyo:        assemblyGui.animationYoyo,
            stagger:     assemblyGui.animationStagger,
            overwrite:   assemblyGui.animationOverwrite,
            loop:        assemblyGui.animationLoop,
            camera:      assemblyGui.animationCamera,
            zoomCoeff:   assemblyGui.zoomCoeff,
        };

        const sectionSettings = {
            section:         viewProp.section,
            showSectionMesh: viewProp.showSectionMesh,
            sectionCrossLines: viewProp.sectionCrossLines,
            crossSectionColor: viewProp.crossSectionColor,
            solidSection: viewProp.solidSection,
            capColor: viewProp.capColor,
            px: viewProp.px,
            py: viewProp.py,
            pz: viewProp.pz,
        };

        const htmlContent = generateObfuscatedHTML(base64, animSettings, sectionSettings, '');

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = finalName;
        link.click();
        URL.revokeObjectURL(link.href);
        console.log('Export to obfuscated HTML: done.');
    }, function(error) {
        console.error('Obfuscated HTML export error:', error);
    }, { binary: true, onlyVisible: false });
}

// ===== Export to obfuscated standalone HTML with Draco compression =====
export function exportToHTMLObfuscatedDraco(loadedModels, assemblyGui, viewProp, assemblyWriteToUserData, assemblyClearUserData) {
    if (loadedModels.length === 0) {
        alert('No models to export.');
        return;
    }
    const defaultName = 'assembly_viewer_obf_draco.html';
    const filename = window.prompt('File name for obfuscated HTML export (Draco):', defaultName);
    if (filename === null) return;
    const finalName = filename.trim() || defaultName;

    assemblyWriteToUserData();

    const exporter = new GLTFExporter();
    const group = new THREE.Group();
    loadedModels.forEach(model => group.add(model.clone(true)));

    assemblyClearUserData();

    exporter.parse(group, async function(glbBuffer) {
        // Show overlay
        let overlay = document.getElementById('dracoOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'dracoOverlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;color:#fff;font-size:22px;font-family:sans-serif;';
            overlay.textContent = 'Draco compressing… please wait';
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
        await new Promise(r => setTimeout(r, 50));

        try {
        // --- Draco compression ---
        let finalGlb = glbBuffer;
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

            const gltfDoc = await io.readBinary(new Uint8Array(glbBuffer));
            await gltfDoc.transform(draco());
            finalGlb = await io.writeBinary(gltfDoc);
            console.log('Obfuscated HTML export (Draco): compression done.');
        } catch (err) {
            console.warn('Obfuscated HTML export (Draco): compression failed, using uncompressed.', err);
        }

        const bytes = new Uint8Array(finalGlb);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        const animSettings = {
            duration:    assemblyGui.animationDuration,
            ease:        assemblyGui.animationEase,
            repeat:      assemblyGui.animationRepeat,
            delay:       assemblyGui.animationDelay,
            repeatDelay: assemblyGui.animationRepeatDelay,
            yoyo:        assemblyGui.animationYoyo,
            stagger:     assemblyGui.animationStagger,
            overwrite:   assemblyGui.animationOverwrite,
            loop:        assemblyGui.animationLoop,
            camera:      assemblyGui.animationCamera,
            zoomCoeff:   assemblyGui.zoomCoeff,
        };

        const sectionSettings = {
            section:         viewProp.section,
            showSectionMesh: viewProp.showSectionMesh,
            sectionCrossLines: viewProp.sectionCrossLines,
            crossSectionColor: viewProp.crossSectionColor,
            solidSection: viewProp.solidSection,
            capColor: viewProp.capColor,
            px: viewProp.px,
            py: viewProp.py,
            pz: viewProp.pz,
        };

        let dracoDecoderBase64 = '';
        try {
            const resp = await fetch('./draco/draco_decoder.js');
            const text = await resp.text();
            dracoDecoderBase64 = btoa(unescape(encodeURIComponent(text)));
        } catch (err) {
            console.warn('Could not fetch draco_decoder.js for HTML embed:', err);
        }

        const htmlContent = generateObfuscatedHTML(base64, animSettings, sectionSettings, dracoDecoderBase64);

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = finalName;
        link.click();
        URL.revokeObjectURL(link.href);
        console.log('Export to obfuscated HTML (Draco): done.');
        } finally {
            overlay.style.display = 'none';
        }
    }, function(error) {
        console.error('Obfuscated HTML export error:', error);
    }, { binary: true, onlyVisible: false });
}

function generateObfuscatedHTML(glbBase64, animSettings, sectionSettings, dracoDecoderBase64) {
    // Generate the readable standalone HTML with a placeholder for GLB data
    const GLB_PLACEHOLDER = '__GLB_BASE64_PLACEHOLDER__';
    const sourceHTML = generateStandaloneHTML(GLB_PLACEHOLDER, animSettings, sectionSettings, dracoDecoderBase64 || '');

    // ID / class mapping for obfuscation
    const idMap = {
        'status-bar': '_a', 'step-info': '_b', 'step-desc': '_c',
        'canvas-container': '_d', 'controls': '_e',
        'btn-start': '_1', 'btn-finish': '_2', 'btn-prev': '_3',
        'btn-next': '_4', 'btn-anim-start': '_5', 'btn-anim-finish': '_6', 'chk-loop': '_7', 'chk-fullscreen': '_8', 'chk-camera': '_9',
        'section-panel': '_sa', 'section-panel-hdr': '_sb', 'section-panel-body': '_sc',
        'chk-section': '_s1', 'chk-section-mesh': '_s2', 'chk-section-cross': '_s2b', 'chk-solid-section': '_s2c',
        'sld-px': '_s3', 'num-px': '_s4',
        'sld-py': '_s5', 'num-py': '_s6',
        'sld-pz': '_s7', 'num-pz': '_s8',
        'btn-sec-reset': '_s9',
        'analysis-panel': '_aa', 'analysis-panel-hdr': '_ab', 'analysis-panel-body': '_ac',
        'chk-measure': '_a1', 'chk-detect-circle': '_a2', 'btn-clear-meas': '_a3',
        'right-panels': '_rp',
        'zoom-coeff': '_zc',
    };
    const classMap = { 'row': '_r', 'chk-label': '_cl', 'sec-row': '_sr', 'sec-axis': '_sx', 'meas-label': '_ml' };

    // ── Extract JS module from standalone HTML ──
    const moduleMatch = sourceHTML.match(/<script type="module">([\s\S]*?)<\/script>/);
    if (!moduleMatch) throw new Error('Cannot extract module script from standalone HTML');
    let js = moduleMatch[1];

    // Replace inline GLB constant with DOM element read (GLB stored in a separate script tag)
    js = js.replace(
        /const GLB_BASE64 = '[^']*';/,
        "const GLB_BASE64 = document.getElementById('_g').textContent;"
    );

    // Rename element IDs in JS
    for (const [readable, obf] of Object.entries(idMap)) {
        js = js.replaceAll("'" + readable + "'", "'" + obf + "'");
    }

    // Rename CSS class names in JS
    for (const [readable, obf] of Object.entries(classMap)) {
        js = js.replaceAll("'" + readable + "'", "'" + obf + "'");
    }

    // Minify JS: strip full-line comments, collapse blank lines
    js = js.replace(/^[ \t]*\/\/.*$/gm, '');
    js = js.replace(/\n{2,}/g, '\n');
    js = js.trim();

    // ── XOR encrypt JS ──
    const key = Math.floor(Math.random() * 254) + 1;
    let encrypted = '';
    for (let i = 0; i < js.length; i++) {
        encrypted += String.fromCharCode(js.charCodeAt(i) ^ key);
    }
    const encoded = btoa(encrypted);

    // ── Minify & obfuscate CSS ──
    const cssMatch = sourceHTML.match(/<style>([\s\S]*?)<\/style>/);
    let css = cssMatch ? cssMatch[1] : '';
    // Sort by key length (longest first) to prevent substring collisions
    // e.g. 'section-panel' must not match inside 'section-panel-hdr'
    const sortedIdEntries = Object.entries(idMap).sort((a, b) => b[0].length - a[0].length);
    for (const [readable, obf] of sortedIdEntries) {
        css = css.replaceAll('#' + readable, '#' + obf);
    }
    const sortedClassEntries = Object.entries(classMap).sort((a, b) => b[0].length - a[0].length);
    for (const [readable, obf] of sortedClassEntries) {
        css = css.replaceAll('.' + readable, '.' + obf);
    }
    css = css.replace(/\n\s*/g, '');
    css = css.replace(/\s*\{\s*/g, '{');
    css = css.replace(/\s*\}\s*/g, '}');
    css = css.replace(/\s*;\s*/g, ';');
    css = css.replace(/:\s+/g, ':');
    css = css.replace(/,\s+/g, ',');
    css = css.trim();

    const secPanelOpen = sectionSettings.section ? ' open' : '';
    const secPanelArrow = sectionSettings.section ? '&#x2702; Section &#x25B4;' : '&#x2702; Section &#x25BE;';
    const secChecked = sectionSettings.section ? ' checked' : '';
    const secMeshChecked = sectionSettings.showSectionMesh ? ' checked' : '';
    const secCrossChecked = sectionSettings.sectionCrossLines ? ' checked' : '';
    const secSolidChecked = sectionSettings.solidSection ? ' checked' : '';

    // ── Assemble obfuscated HTML ──
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"><style>${css}</style></head><body>` +
        `<div id="_a"><div id="_b"></div><div id="_c"></div></div>` +
        `<div id="_rp">` +
        `<div id="_sa"><div id="_sb">${secPanelArrow}</div><div id="_sc"${secPanelOpen ? ' class="open"' : ''}>` +
        `<label class="_cl"><input type="checkbox" id="_s1"${secChecked}> Section</label>` +
        `<label class="_cl"><input type="checkbox" id="_s2b"${secCrossChecked}> Cross Section Lines</label>` +
        `<label class="_cl"><input type="checkbox" id="_s2c"${secSolidChecked}> Solid Section</label>` +
        `<label class="_cl"><input type="checkbox" id="_s2"${secMeshChecked}> Section Mesh</label>` +
        `<div class="_sr"><span class="_sx">X</span><input type="range" id="_s3" step="1"><input type="number" id="_s4" step="1"></div>` +
        `<div class="_sr"><span class="_sx">Y</span><input type="range" id="_s5" step="1"><input type="number" id="_s6" step="1"></div>` +
        `<div class="_sr"><span class="_sx">Z</span><input type="range" id="_s7" step="1"><input type="number" id="_s8" step="1"></div>` +
        `<button id="_s9">&#x21BA; Reset</button></div></div>` +
        `<div id="_aa"><div id="_ab">&#x1F4CF; Analysis &#x25BE;</div><div id="_ac">` +
        `<label class="_cl"><input type="checkbox" id="_a1"> Measure (point-to-point)</label>` +
        `<label class="_cl"><input type="checkbox" id="_a2"> Detect circle center</label>` +
        `<button id="_a3">&#x1F5D1; Clear measurements</button></div></div>` +
        `</div>` +
        `<div id="_d"></div>` +
        `<div id="_e">` +
        `<div class="_r"><button id="_1">&#x23EE; Start</button><button id="_2">Finish &#x23ED;</button><button id="_5">&#x23EA; Anim</button><button id="_6">Anim &#x23E9;</button></div>` +
        `<div class="_r"><button id="_3">&#x25C0; Step</button><button id="_4">Step &#x25B6;</button><label class="_cl"><input type="checkbox" id="_7"${animSettings.loop ? ' checked' : ''}> &#x221E; Loop</label><label class="_cl"><input type="checkbox" id="_9"${animSettings.camera ? ' checked' : ''}> &#x1F3A5; Cam</label><label class="_cl"><input type="checkbox" id="_8"> &#x26F6; Full</label></div>` +
        `<div class="_r"><label class="_cl">&#x1F50D; Zoom coeff: <input type="number" id="_zc" value="${animSettings.zoomCoeff}" min="0.1" max="5" step="0.05" style="width:60px"></label></div>` +
        `</div>` +
        `<script id="_g" type="text/plain">${glbBase64}<\/script>` +
        `<script>${exportLibsBundle.replace(/<\/script/gi, '<\\/script')}<\/script>` +
        `<script>(function(){var _0x=${key},_0e=atob('${encoded}'),_0r='';for(var _0i=0;_0i<_0e.length;_0i++)_0r+=String.fromCharCode(_0e.charCodeAt(_0i)^_0x);import(URL.createObjectURL(new Blob([_0r],{type:'application/javascript'})))})()<\/script>` +
        `</body></html>`;
}
