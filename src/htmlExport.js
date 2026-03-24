// htmlExport.js
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// ===== Export to standalone HTML with embedded GLB =====
export function exportToHTML(loadedModels, assemblyGui, assemblyWriteToUserData, assemblyClearUserData) {
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
        };

        const htmlContent = generateStandaloneHTML(base64, animSettings);

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

function generateStandaloneHTML(glbBase64, animSettings) {
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
@media (max-width: 480px) {
    #controls button { padding: 10px 12px; font-size: 14px; min-width: 54px; }
    #controls { bottom: max(10px, env(safe-area-inset-bottom)); gap: 6px; }
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
</style>
</head>
<body>
<div id="status-bar">
    <div id="step-info">Assembled</div>
    <div id="step-desc"></div>
</div>
<div id="canvas-container"></div>
<div id="controls">
    <div class="row">
        <button id="btn-start" title="Reset to start [Home]">⏮ Start</button>
        <button id="btn-finish" title="Reset to finish [End]">Finish ⏭</button>
    </div>
    <div class="row">
        <button id="btn-prev" title="Previous step [PageUp / ←]">◀ Step</button>
        <button id="btn-next" title="Next step [PageDown / →]">Step ▶</button>
    </div>
    <div class="row">
        <button id="btn-anim-start" title="Animate to start [Shift+PageUp]">◀◀ Anim</button>
        <button id="btn-anim-finish" title="Animate to finish [Shift+PageDown]">Anim ▶▶</button>
    </div>
</div>

<script type="importmap">
{
    "imports": {
        "three": "https://esm.sh/three@0.182.0",
        "three/addons/": "https://esm.sh/three@0.182.0/examples/jsm/",
        "gsap": "https://esm.sh/gsap@3.12.5"
    }
}
</script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import gsap from 'gsap';

// ---- Config ----
const ANIM_DURATION    = ${animSettings.duration};
const ANIM_EASE        = '${animSettings.ease}';
const ANIM_REPEAT      = ${animSettings.repeat};
const ANIM_DELAY       = ${animSettings.delay};
const ANIM_REPEAT_DELAY = ${animSettings.repeatDelay};
const ANIM_YOYO        = ${animSettings.yoyo};
const ANIM_STAGGER     = ${animSettings.stagger};
const ANIM_OVERWRITE   = '${animSettings.overwrite}';
const GLB_BASE64 = '${glbBase64}';

// ---- Scene setup ----
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;
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

function render() { renderer.render(scene, camera); }

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
let activeAnimation = null;

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
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
loader.setDRACOLoader(dracoLoader);

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
    render();
}, function(error) {
    console.error('GLB load error:', error);
    document.getElementById('step-info').textContent = 'Error loading model.';
});

// ---- Animation helpers ----
function animateStep(transformations, forward, onComplete) {
    if (activeAnimation) { activeAnimation.kill(); activeAnimation = null; }

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

    if (ANIM_DURATION <= 0) {
        startStates.forEach((s, i) => {
            transformations[i].objectRef.position.copy(s.targetPos);
            if (s.hasRot) transformations[i].objectRef.quaternion.copy(s.targetQuat);
            if (s.hasScale) transformations[i].objectRef.scale.copy(s.targetScale);
        });
        render();
        if (onComplete) onComplete();
        return;
    }

    const proxy = { t: 0 };
    activeAnimation = gsap.to(proxy, {
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
            activeAnimation = null;
            if (onComplete) onComplete();
        },
    });
}

// ---- Playback functions ----
function resetToStart() {
    if (activeAnimation) { activeAnimation.kill(); activeAnimation = null; }
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
    if (activeAnimation) { activeAnimation.kill(); activeAnimation = null; }
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
    const ni = currentStepIndex + 1;
    if (ni >= assemblySteps.length) return;
    const step = assemblySteps[ni];
    if (step.transformations.length === 0) {
        currentStepIndex = ni;
        updateStatus();
        return;
    }
    animateStep(step.transformations, true, () => { currentStepIndex = ni; updateStatus(); });
}

function prevStep() {
    if (currentStepIndex < 0) return;
    const step = assemblySteps[currentStepIndex];
    if (step.transformations.length === 0) {
        currentStepIndex--;
        updateStatus();
        return;
    }
    animateStep(step.transformations, false, () => { currentStepIndex--; updateStatus(); });
}

function animateToFinish() {
    if (assemblySteps.length === 0 || currentStepIndex >= assemblySteps.length - 1) return;
    function next() {
        const ni = currentStepIndex + 1;
        if (ni >= assemblySteps.length) return;
        const step = assemblySteps[ni];
        if (step.transformations.length === 0) {
            currentStepIndex = ni;
            updateStatus();
            next();
            return;
        }
        animateStep(step.transformations, true, () => { currentStepIndex = ni; updateStatus(); next(); });
    }
    next();
}

function animateToStart() {
    if (currentStepIndex < 0) return;
    function prev() {
        if (currentStepIndex < 0) return;
        const step = assemblySteps[currentStepIndex];
        if (step.transformations.length === 0) {
            currentStepIndex--;
            updateStatus();
            prev();
            return;
        }
        animateStep(step.transformations, false, () => { currentStepIndex--; updateStatus(); prev(); });
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
    }
});
<\/script>
</body>
</html>`;
}

// ===== Obfuscated HTML Export ===================================================================

export function exportToHTMLObfuscated(loadedModels, assemblyGui, assemblyWriteToUserData, assemblyClearUserData) {
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
        };

        const htmlContent = generateObfuscatedHTML(base64, animSettings);

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

function generateObfuscatedHTML(glbBase64, animSettings) {
    // Generate the readable standalone HTML with a placeholder for GLB data
    const GLB_PLACEHOLDER = '__GLB_BASE64_PLACEHOLDER__';
    const sourceHTML = generateStandaloneHTML(GLB_PLACEHOLDER, animSettings);

    // ID / class mapping for obfuscation
    const idMap = {
        'status-bar': '_a', 'step-info': '_b', 'step-desc': '_c',
        'canvas-container': '_d', 'controls': '_e',
        'btn-start': '_1', 'btn-finish': '_2', 'btn-prev': '_3',
        'btn-next': '_4', 'btn-anim-start': '_5', 'btn-anim-finish': '_6',
    };
    const classMap = { 'row': '_r' };

    // ── Extract JS module from standalone HTML ──
    const moduleMatch = sourceHTML.match(/<script type="module">([\s\S]*?)<\/script>/);
    if (!moduleMatch) throw new Error('Cannot extract module script from standalone HTML');
    let js = moduleMatch[1];

    // Replace inline GLB constant with DOM element read (GLB stored in a separate script tag)
    js = js.replace(
        /const GLB_BASE64 = '[^']*';/,
        "const GLB_BASE64 = document.getElementById('_g').textContent;"
    );

    // Absolute URLs for blob-URL context (importmap does not apply to blob modules)
    js = js.replace(/from 'three';/g, "from 'https://esm.sh/three@0.182.0';");
    js = js.replace(/from 'three\/addons\//g, "from 'https://esm.sh/three@0.182.0/examples/jsm/");
    js = js.replace(/from 'gsap';/g, "from 'https://esm.sh/gsap@3.12.5';");

    // Rename element IDs in JS
    for (const [readable, obf] of Object.entries(idMap)) {
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
    for (const [readable, obf] of Object.entries(idMap)) {
        css = css.replaceAll('#' + readable, '#' + obf);
    }
    for (const [readable, obf] of Object.entries(classMap)) {
        css = css.replaceAll('.' + readable, '.' + obf);
    }
    css = css.replace(/\n\s*/g, '');
    css = css.replace(/\s*\{\s*/g, '{');
    css = css.replace(/\s*\}\s*/g, '}');
    css = css.replace(/\s*;\s*/g, ';');
    css = css.replace(/:\s+/g, ':');
    css = css.replace(/,\s+/g, ',');
    css = css.trim();

    // ── Assemble obfuscated HTML ──
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"><style>${css}</style></head><body>` +
        `<div id="_a"><div id="_b"></div><div id="_c"></div></div>` +
        `<div id="_d"></div>` +
        `<div id="_e">` +
        `<div class="_r"><button id="_1">&#x23EE; Start</button><button id="_2">Finish &#x23ED;</button></div>` +
        `<div class="_r"><button id="_3">&#x25C0; Step</button><button id="_4">Step &#x25B6;</button></div>` +
        `<div class="_r"><button id="_5">&#x25C0;&#x25C0; Anim</button><button id="_6">Anim &#x25B6;&#x25B6;</button></div>` +
        `</div>` +
        `<script id="_g" type="text/plain">${glbBase64}<\/script>` +
        `<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"><\/script>` +
        `<script>(function(){var _0x=${key},_0e=atob('${encoded}'),_0r='';for(var _0i=0;_0i<_0e.length;_0i++)_0r+=String.fromCharCode(_0e.charCodeAt(_0i)^_0x);import(URL.createObjectURL(new Blob([_0r],{type:'application/javascript'})))})()<\/script>` +
        `</body></html>`;
}
