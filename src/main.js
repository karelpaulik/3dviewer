//main.js
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

//import { GUI } from 'dat.gui';
import { GUI } from 'lil-gui';
import ZipLoader from 'zip-loader';
import { updateCrossSectionLines as updateCrossSectionLinesCore } from './crossSectionUtils.js';

// Proměnné globálního rozsahu----------------------------------------------------------------------------------------
let container, stats;
let camera, cameraTarget, scene, renderer;			

const clipPlanes = [];		
let crossSectionLines = null; // Pro uchování průřezových čar

let cameraPersp, cameraOrtho, currentCamera;
let transformControls, orbitControls;
const meshObjects = [];
const hiddenObjects = [];
let temporarilyShownObjects = [];
const loadedModels = []; // Pole pro uchování načtených GLB modelů (root scene objekty)

const gui = new GUI();				
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
let INTERSECTED;
let isMouseDown = false;
let isTouchDragging = false;

let isTouchScreen;

let selectionHelper;
let isTransformDragging = false;
let previousTransformState = null; // Uložení předchozího stavu pro undo
let isShiftHeld = false; // Pro manuální translation snap ve world space

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
    reset: function() { resetSection() },
    fit: function() { fitView() },
    viewx: function() { viewFromPoint(1000, 0, 0) },
    viewy: function() { viewFromPoint(0, 1000, 0) },
    viewz: function() { viewFromPoint(0, 0, 1000) },
    showHiddenObjects: function() { showHiddenObjects() },
    switchHiddenObjects: function() { toggleHiddenObjects() },
    resetWholeModel: function() { resetWholeModel() },
    rotateXPlus: function() { rotateAllModels('x', Math.PI / 2) },
    rotateXMinus: function() { rotateAllModels('x', -Math.PI / 2) },
    rotateYPlus: function() { rotateAllModels('y', Math.PI / 2) },
    rotateYMinus: function() { rotateAllModels('y', -Math.PI / 2) },
    rotateZPlus: function() { rotateAllModels('z', Math.PI / 2) },
    rotateZMinus: function() { rotateAllModels('z', -Math.PI / 2) },
    exportAll: function() { exportAllModels(); },
    exportSelected: function() { exportSelectedObject(); },
    transformSpace: true,  // true = world, false = local
    snapEnabled: true,     // true = snap vždy aktivní, false = snap jen při Shift
    snapTranslation: 10,   // krok translace
    snapRotationDeg: 30,   // krok rotace ve stupních
    snapScale: 0.25,       // krok měřítka
};

const extent = {
    pn: -1000,
    pp: +1000,
    pStep: 10,
    rn: -3.1416,
    rp: 3.1416,
    rStep: 0.035,
    sn: 0,
    sp: 10,
    sStep: 0.1
}
    
const part = {
    remove: function() { removeModel(lastSelectedObject); },
    color: "#888888",
    separate: function() { 
        if (lastSelectedObject) {
            separateMesh(lastSelectedObject); 
        }									
    },
    deselect: function() { // Přidáno: tlačítko pro zrušení selekce
        deselectObject();
    },
    randomColor: function() {
        if (lastSelectedObject) {
            changeColor(lastSelectedObject);
        }
    },
    resetLocation: function() {
        if (lastSelectedObject) {
            setDefPosRotScale(lastSelectedObject);
        }
    },
    selectParent: function() {
        selectParent();
    },
    selectPrevious: function() {   
        selectPrevious(); 
    },
    hideObject: function() {
        if (lastSelectedObject) {
            hideObject(lastSelectedObject);
        }
    },
    undoTransform: function() {
        if (lastSelectedObject && previousTransformState) {
            undoLastTransform(lastSelectedObject);
        }
    }
};	

// Možnost zobrazení následujících objektů v konzoli pouze v režimu "npx vite"
if (import.meta.env.DEV) {
    //OK, reference na objekty jsou dostupné v konzoli pro ladění
    window.meshObjects = meshObjects;
    window.clipPlanes = clipPlanes;

    //NOK - toto není reference
    window.transformControls = transformControls;
    window.lastSelectedObject = lastSelectedObject;
}

// Inicializace--------------------------------------------------------------------------------------------------------
isTouchScreen = isTouchDevice();

init();
render();
initLoad();

// Funkce----------------------------------------------------------------------------------------------------------------
function init() {   
    //container
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    //renderer
    renderer = new THREE.WebGLRenderer( { antialias: true } );
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
    
    //currentCamera
    const frustumSize = 1;
    const aspect = window.innerWidth / window.innerHeight;
    cameraPersp = new THREE.PerspectiveCamera( 20, aspect, 250, 20000 );
    cameraOrtho = new THREE.OrthographicCamera( frustumSize * aspect / - 0.002, frustumSize * aspect / 0.002, frustumSize / 0.002, frustumSize / - 0.002, 0.1, 20000 );
    
    currentCamera = cameraOrtho;

    currentCamera.position.set( 1000, 1000, 1000 );
    currentCamera.lookAt( 0, 0, 0 );
    
    //scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x72645b );						

    //lights
    scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );
    addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
    addShadowedLight( 0.5, 1, - 1, 0xffaa00, 1 );

    // headlight - světlo z pohledu kamery
    const headlight = new THREE.DirectionalLight(0xffffff, 0.5);
    currentCamera.add(headlight); // Světlo bude svítit ze stejného místa jako oči uživatele
    scene.add(currentCamera); // BEZ TOHOTO ŘÁDKU SVĚTLO NEBUDE SVÍTIT
    
    //clipPlanes
    clipPlanes[0] = new THREE.Plane( new THREE.Vector3( -1, 0, 0 ), 0 );
    clipPlanes[1] = new THREE.Plane( new THREE.Vector3( 0, -1, 0 ), 0 );
    clipPlanes[2] = new THREE.Plane( new THREE.Vector3( 0, 0, -1 ), 0 );
    
    //newcontrols
    orbitControls = new OrbitControls( currentCamera, renderer.domElement );
    orbitControls.update();
    orbitControls.addEventListener( 'change', render ); // use if there is no animation loop

    transformControls = new TransformControls( currentCamera, renderer.domElement );
    transformControls.setSize( 0.5 );	
    transformControls.setSpace( 'world' ); // Default: world space (intuitivnější pro uživatele)
    applySnapSettings(); // Aplikujeme snap nastavení při inicializaci
    scene.add( transformControls.getHelper() );	//Nutno v novém three.js. Dříve bylo: scene.add( transformControls );
    transformControls.addEventListener( 'change', function() {
        // World-space manual snap: built-in setTranslationSnap works only in 'local' space.
        // In 'world' space we must snap the world-space coordinates and convert back to local.
        if ((viewProp.snapEnabled || isShiftHeld) && transformControls.object && transformControls.getMode() === 'translate' && transformControls.space === 'world') {
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
        render();
    } );
    transformControls.addEventListener( 'dragging-changed', function ( event ) {
        if (event.value) { // Dragování začalo
            isTransformDragging = true;
            orbitControls.enabled = false;
            // Uložíme předchozí stav před změnou
            if (transformControls.object) {
                savePreviousTransformState(transformControls.object);
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
            }, 100);
        }
    } );	
    

    selectionHelper = new THREE.BoxHelper(new THREE.Mesh(), 0xffff00);
    selectionHelper.visible = false;
    scene.add(selectionHelper);
    
    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'mousemove', onMouseMove, false );				
    window.addEventListener( 'mousedown', onMouseDown, false );
    window.addEventListener( 'mouseup', onMouseUp, false );
    window.addEventListener( 'click', onClick, false );
    window.addEventListener( 'touchstart', onTouchStart, false );
    window.addEventListener( 'touchmove', onTouchMove, false );
    window.addEventListener( 'touchend', onTouchEnd, false );
    
    window.addEventListener( 'keydown', function ( event ) {
        switch ( event.key ) {
            case 'Escape':
                deselectObject();
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
                break;

            case 's':
            case 'S':
                transformControls.setMode( 'scale' );
                break;

            case 't':
            case 'T':
                transformControls.setMode( 'translate' );
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

            case 'p':
                console.log("selectionHistory.length: ", selectionHistory.length);
                selectionHistory.forEach( (obj, index) => {console.log(obj.name, index)}) ;
                break;
        }
    } );

    window.addEventListener( 'keyup', function ( event ) {
        switch ( event.key ) {
            case 'Shift':
                isShiftHeld = false;
                applySnapSettings();
                break;
        }
    } );
} //End init 

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

//GUI----------------------------------------------------------------------------------------------------------------
function addMainGui() {
    //View
    const folderProp = gui.addFolder( 'View' );
        folderProp.add(viewProp, 'fit').name('Fit View');
        folderProp.add(viewProp, 'resetWholeModel').name('Reset whole model');
        folderProp.add(viewProp, 'showHiddenObjects').name('Show hidden objects');
        folderProp.add(viewProp, 'switchHiddenObjects').name('Switch hidden objects');
        let fsCtrl = folderProp.add(viewProp, 'fullscreen').name('Fullscreen').onChange(function(value){// Fullscreen toggle (false = windowed, true = fullscreen)
            if (value) {
                document.getElementById('body').requestFullscreen().catch((err) => {console.warn('Fullscreen not available: ', err.message)});
            } else {
                if (document.fullscreenElement) document.exitFullscreen();
            }
        }).listen();
        folderProp.add(viewProp, 'isSelectAllowed').name('Allow selection').listen();
        folderProp.add(viewProp, 'transformSpace').name('Transform: World space').onChange(function(value) {
            transformControls.setSpace( value ? 'world' : 'local' );
        }).listen();
        folderProp.addColor(viewProp, 'backgroundColor').name('Background').onChange(function(value){ scene.background = new THREE.Color(value); render(); });
        //folderProp.add(viewProp, 'perspCam').name('Persp. camera').onChange(function(value){setCamera(); render(); });
        const sectionFolder = folderProp.addFolder("Section view");   
            sectionFolder.add(viewProp, 'section').name('Section').onChange(function(value){renderer.localClippingEnabled = value; render(); });
            sectionFolder.add(viewProp, 'showSectionMesh').name('Show Section Mesh').onChange(function(value){toggleSectionMeshAll(); });
            sectionFolder.add(viewProp, 'px', extent.pn, extent.pp, extent.pStep).name('Pos. x').onChange(function(value){clipPlanes[0].constant=value; render(); }).listen();
            sectionFolder.add(viewProp, 'py', extent.pn, extent.pp, extent.pStep).name('Pos. y').onChange(function(value){clipPlanes[1].constant=value; render(); }).listen();
            sectionFolder.add(viewProp, 'pz', extent.pn, extent.pp, extent.pStep).name('Pos. z').onChange(function(value){clipPlanes[2].constant=value; render(); }).listen();
            sectionFolder.add(viewProp, 'reset').name('Reset section');
            
            const crossSectionFolder = sectionFolder.addFolder("Cross Section Lines");
            crossSectionFolder.add(viewProp, 'showCrossSection').name('Show Lines').onChange(function(value){updateCrossSectionLines(); render(); });
            crossSectionFolder.add(viewProp, 'crossSectionPlane', ['XY', 'XZ', 'YZ']).name('Plane').onChange(function(value){if(viewProp.showCrossSection){updateCrossSectionLines(); render();}});
            crossSectionFolder.add(viewProp, 'crossSectionPos', extent.pn, extent.pp, extent.pStep).name('Position').onChange(function(value){if(viewProp.showCrossSection){updateCrossSectionLines(); render();}}).listen();
            crossSectionFolder.addColor(viewProp, 'crossSectionColor').name('Color').onChange(function(value){if(crossSectionLines){crossSectionLines.material.color.set(value); render();}});
            crossSectionFolder.close();
            
            sectionFolder.close();
        const oritationFolder = folderProp.addFolder("View orientation");
            oritationFolder.add(viewProp, 'viewx').name('View from X');
            oritationFolder.add(viewProp, 'viewy').name('View from Y');
            oritationFolder.add(viewProp, 'viewz').name('View from Z');
            oritationFolder.close();
        
        const rotationFolder = folderProp.addFolder("Whole Model Rotation");
            rotationFolder.add(viewProp, 'rotateXPlus').name('Rotate X +90°');
            rotationFolder.add(viewProp, 'rotateXMinus').name('Rotate X -90°');
            rotationFolder.add(viewProp, 'rotateYPlus').name('Rotate Y +90°');
            rotationFolder.add(viewProp, 'rotateYMinus').name('Rotate Y -90°');
            rotationFolder.add(viewProp, 'rotateZPlus').name('Rotate Z +90°');
            rotationFolder.add(viewProp, 'rotateZMinus').name('Rotate Z -90°');
            rotationFolder.close();
        const snapFolder = folderProp.addFolder("Snap");
            snapFolder.add(viewProp, 'snapEnabled').name('Snap aktivní').onChange(function() { applySnapSettings(); }).listen();
            snapFolder.add(viewProp, 'snapTranslation', 1, 1000, 1).name('Translace').onChange(function() { applySnapSettings(); }).listen();
            snapFolder.add(viewProp, 'snapRotationDeg', 1, 90, 1).name('Rotace (°)').onChange(function() { applySnapSettings(); }).listen();
            snapFolder.add(viewProp, 'snapScale', 0.01, 2, 0.01).name('Měřítko').onChange(function() { applySnapSettings(); }).listen();
            snapFolder.close();
        const exportFolder = folderProp.addFolder("Export GLB");
            exportFolder.add(viewProp, 'exportAll').name('Export all models');
            exportFolder.add(viewProp, 'exportSelected').name('Export selected object');
            exportFolder.close();
        //folderProp.add(part, 'randomColor').name('Random color');	

    // Když by toto nebylo, tak při ukončení fullscreenu escapem, by "fulscreen" zůstalo zartřené. Funkčně by se moc nestalo.
    document.addEventListener('fullscreenchange', function(){
        viewProp.fullscreen = !!document.fullscreenElement;
        if (fsCtrl && fsCtrl.updateDisplay) fsCtrl.updateDisplay();
    });
}	

function refreshSelectedObjGui(obj) {
    if (selectedFolder) {
        selectedFolder.destroy();
        selectedFolder = null;
    }
                
    selectedFolder = gui.addFolder( 'Selected part: ' + (obj.name || 'Unnamed') );
    selectedFolder.add(obj, 'name').name('Name').listen();
    selectedFolder.addColor(part, 'color').name('Specif. color').onChange(function(value){ changeColor(obj, value); });
    selectedFolder.add(part, 'randomColor').name('Random color');
    //selectedFolder.add(part, 'remove').name('Remove');	
    //selectedFolder.add(part, 'separate').name('Separate Part');
    selectedFolder.add(part, 'hideObject').name('Hide Object');
    //selectedFolder.add(part, 'deselect').name('Deselect');

    const folder2 = selectedFolder.addFolder("Location");
        folder2.add(part, 'resetLocation').name('Reset init. location');
        folder2.add(part, 'undoTransform').name('Undo last transform');
        folder2.add(obj.position, 'x', extent.pn, extent.pp, extent.pStep)
            .name('Px')
            .onChange(function(value){obj.position.x=value; render(); })
            .listen();
        folder2.add(obj.position, 'y', extent.pn, extent.pp, extent.pStep)
            .name('Py')
            .onChange(function(value){obj.position.y=value; render(); })
            .listen();
        folder2.add(obj.position, 'z', extent.pn, extent.pp, extent.pStep)
            .name('Pz')
            .onChange(function(value){obj.position.z=value; render(); })
            .listen();
        folder2.add(obj.rotation, 'x', extent.rn, extent.rp, extent.rStep)
            .name('Rx')
            .onChange(function(value){obj.rotation.x=value; render(); })
            .listen();
        folder2.add(obj.rotation, 'y', extent.rn, extent.rp, extent.rStep)
            .name('Ry')
            .onChange(function(value){obj.rotation.y=value; render(); })
            .listen();
        folder2.add(obj.rotation, 'z', extent.rn, extent.rp, extent.rStep)
            .name('Rz')
            .onChange(function(value){obj.rotation.z=value; render(); })
            .listen();
        folder2.add(obj.scale, 'x', extent.sn, extent.sp, extent.sStep)
            .name('Scale')
            .onChange(function(value){obj.scale.x=value; obj.scale.y=value; obj.scale.z=value; render(); })
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
        navFolder.add(part, 'selectParent').name('Select parent (Arrow Up)');
        navFolder.add(part, 'selectPrevious').name('Select previous (Arrow Down)');
        navFolder.open();

    selectedFolder.open();
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
                    // Mesh je již přidán do meshObjects uvnitř loadModel
                    //addAxesHelper();
                    fitView();
                    console.log(`Model ${fileName} byl úspěšně načten.`);
                }).catch((error) => {
                    console.error(`Chyba při načítání modelu ${fileName}:`, error);
                });
                break;

            case 'glb': 
                loadGlbModel(fileUrl, fileName, 0.001, true).then( (result) => {
                    // Meshe jsou již přidány do meshObjects uvnitř loadGlbModel
                    //addAxesHelper();
                    fitView();
                    console.log(`Model ${fileName} byl úspěšně načten.`);   
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
            // Meshe jsou již přidány do meshObjects uvnitř loadGlbModel
            addAxesHelper();
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
    obj.position.set(obj.initPosition.x, obj.initPosition.y, obj.initPosition.z);
    obj.rotation.set(obj.initRotation.x, obj.initRotation.y, obj.initRotation.z);
    obj.scale.set(obj.initScale.x, obj.initScale.y, obj.initScale.z);
    render();
}

function resetWholeModel() {
    scene.traverse(function(child) {
        if (child.initPosition && child.initRotation && child.initScale) {
            child.position.copy(child.initPosition);
            child.rotation.copy(child.initRotation);
            child.scale.copy(child.initScale);
        }
    });
    
    // Aktualizace průřezových čar
    if (viewProp.showCrossSection) {
        updateCrossSectionLines();
    }
    
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
    if (viewProp.showCrossSection) {
        updateCrossSectionLines();
    }
    
    render();
}

function roundNearZero(value, epsilon = 1e-10) {
    return Math.abs(value) < epsilon ? 0 : value;
}

function savePreviousTransformState(obj) {
    if (!obj) return;
    previousTransformState = {
        object: obj,
        position: obj.position.clone(),
        rotation: obj.rotation.clone(),
        scale: obj.scale.clone()
    };
}

function undoLastTransform(obj) {
    if (!obj || !previousTransformState || previousTransformState.object !== obj) {
        console.log("Není co vrátit zpět.");
        return;
    }
    
    obj.position.copy(previousTransformState.position);
    obj.rotation.copy(previousTransformState.rotation);
    obj.scale.copy(previousTransformState.scale);
    
    console.log("Transformace vrácena zpět.");
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


function resetSection() {					
    viewProp.px = 0;
    viewProp.py = 0;
    viewProp.pz = 0;
    viewProp.crossSectionPos = 0;
    updateSection();
    if (viewProp.showCrossSection) {
        updateCrossSectionLines();
    }
}

// Wrapper funkce pro aktualizaci průřezových čar
function updateCrossSectionLines() {
    crossSectionLines = updateCrossSectionLinesCore(scene, crossSectionLines, viewProp, meshObjects);
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
            // Nastavíme zoom tak, aby byl model vidět v celé šířce s malou rezervou
            const aspect = window.innerWidth / window.innerHeight;
            const frameSize = Math.max(size.x, size.y) * 1.5; // 50% rezerva
            currentCamera.zoom = Math.min(
                window.innerWidth / frameSize,
                window.innerHeight / frameSize
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

    currentCamera.lookAt( orbitControls.target.x, orbitControls.target.y, orbitControls.target.z );
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
}

function addAxesHelper(axesSize) {
    let size;
    
    // Pokud není zadán parametr, velikost se dopočítá
    if (axesSize === undefined) {
        // Vypočítáme střed a velikost všech objektů
        let box = new THREE.Box3();
        meshObjects.forEach(obj => {
            box.expandByObject(obj);
        });
        
        if (!box.isEmpty()) {
            const boxSize = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(boxSize.x, boxSize.y, boxSize.z);
            size = maxDim * 0.5;
        } else {
            return; // Pokud je box prázdný, neděláme nic
        }
    } else {
        // Pokud je parametr zadán, použijeme ho jako velikost
        size = axesSize;
    }
    
    // Vytvoříme helper s určenou velikostí
    const axesHelper = new THREE.AxesHelper(size);
    scene.add(axesHelper);
    render();
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
                
                // Definice výchozích hodnot přímo na objektu (náhrada za prototypy)
                mesh.initPosition = { x: 0, y: 0, z: 0 };
                mesh.initRotation = { x: -Math.PI/2, y: 0, z: 0 };
                mesh.initScale = { x: 1, y: 1, z: 1 };
                
                setDefPosRotScale(mesh);
                mesh.name = fileNameWithoutExtension(model);
                scene.add( mesh );	
                console.log(mesh);
                meshObjects.push(mesh);
                render();
                resolve(mesh);	

                lastSelectedObject=mesh;  
                addMainGui();
            } );
        } );					
    });
}

function loadGlbModel(model, name, scale, colored) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
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
            loadedModels.push(gltf.scene); // Uložení reference na načtený model
            console.log(gltf.scene);

            const meshes = [];
            gltf.scene.traverse(function (child) {
                // Uložení počátečních hodnot pro všechny objekty (Group, Object3D, Mesh)
                child.initPosition = child.position.clone();
                child.initRotation = child.rotation.clone();
                child.initScale = child.scale.clone();
                
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
            
            
            render();
            resolve(gltf.scene);
            addMainGui();
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

function removeModel(part) {
    try {				
        transformControls.detach( part );
        
        // Pokud je součástí skupiny (např. z GLB modelu), odstraníme z rodiče
        if (part.parent) {
            part.parent.remove( part );
        } else {
            // Jinak odstraníme ze scény
            scene.remove( part );
        }
        
        const partIndex = meshObjects.indexOf(part);
        if (partIndex !== -1) meshObjects.splice(partIndex, 1);			
        
        // Aktualizace průřezových čar
        if (viewProp.showCrossSection) {
            updateCrossSectionLines();
        }
        
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
            console.log(`Objekt ${part.name || 'Unnamed'} byl odstraněn z temporarilyShownObjects.`);
        }
        
        // Přidáme objekt do pole skrytých objektů, pokud tam ještě není
        if (!hiddenObjects.includes(part)) {
            hiddenObjects.push(part);
            console.log(`Objekt ${part.name || 'Unnamed'} byl skryt.`);
        }
        
        // Zrušíme selekci skrytého objektu
        deselectObject();
        
        // Aktualizace průřezových čar
        if (viewProp.showCrossSection) {
            updateCrossSectionLines();
        }
        
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
            console.log(`Objekt ${obj.name || 'Unnamed'} byl zobrazen.`);
        });
        
        // Vyprázdníme pole skrytých objektů
        hiddenObjects.length = 0;
        
        // Aktualizace průřezových čar
        if (viewProp.showCrossSection) {
            updateCrossSectionLines();
        }
        
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
            console.log(`Objekt ${obj.name || 'Unnamed'} je skrytý.`);
        });
        
        // Všechny objekty v temporarilyShownObjects nastavíme jako viditelné
        temporarilyShownObjects.forEach(obj => {
            obj.visible = true;
            console.log(`Objekt ${obj.name || 'Unnamed'} je viditelný.`);
        });
        
        // Aktualizace průřezových čar
        if (viewProp.showCrossSection) {
            updateCrossSectionLines();
        }
        
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
        const frustumSize = 1;
        currentCamera.left = - frustumSize * aspect / 0.002;
        currentCamera.right = frustumSize * aspect / 0.002;
        currentCamera.top = frustumSize / 0.002;
        currentCamera.bottom = - frustumSize / 0.002;					
    }
    
    currentCamera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
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
             
        selectionHistory.push(object); // Přidáme do historie vybraných objektů
        if (selectionHistory.length > 30) {// Omezíme velikost historie (např. 30 záznamů), aby nezabírala paměť
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
    }                
    // Volitelné: vynulování pomocných proměnných
    lastSelectedMeshes.forEach(child => applyEmissive(child, 0x000000));

    lastSelectedMeshes.length = 0; // empty the array

    lastSelectedObject = null;

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
    if (!isTransformDragging && !isMouseOverGui && !isMouseDown && !isTouchDragging && viewProp.isSelectAllowed) {      
        raycaster.setFromCamera(mouse, currentCamera);
        const intersects = raycaster.intersectObjects(meshObjects);                

        if (intersects.length > 0) { // Myš je nad objektem
            if (INTERSECTED != intersects[0].object) { 
                // 1. Předchozímu objektu vypneme záři a helper
                if (INTERSECTED) {
                    clearHighlight();
                }   
                // 2. Nastavíme nový objekt
                INTERSECTED = intersects[0].object;
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

    // Pokud je selekce zakázána, zajistíme že nebude nic zvýrazněno
    if (!viewProp.isSelectAllowed && INTERSECTED) {
        clearHighlight();
        INTERSECTED = null;
    }
    
    // Pokud se objekty ve scéně hýbou, odkomentuj řádek níže pro plynulý rámeček:
    // if (selectionHelper && selectionHelper.visible) selectionHelper.update();

    renderer.render(scene, currentCamera);
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
    // Pokud je kliknuto na GUI prvek, ignorujeme raycast pro selekci
    if (gui.domElement.contains(event.target)) {
        return;
    }
    // Pokud je selekce zakázána v GUI, ignorujeme click
    if (!viewProp.isSelectAllowed) return;

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

    if (INTERSECTED) {
        selectObject(INTERSECTED);
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
        render();
    }
}

function isTouchOnGUI(event) { // return: true/false
    if (event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const elementAtTouch = document.elementFromPoint(touch.clientX, touch.clientY);
        return gui.domElement.contains(elementAtTouch);
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

        // Selekce pouze pokud nedocházelo k dragování (vzdálenost < 10 pixelů)
        if (dragDistance > 10 || isTouchDragging) {
            isTouchDragging = false;
            return; // Ignorujeme selekci při dragování
        }

        // All touches ended - simulujeme click pro selekci
        if (!viewProp.isSelectAllowed) return;
        if (isTransformDragging) return;

        // Pokud je dotykem stisknuto na GUI prvek, ignorujeme raycast pro selekci
        if (isTouchOnGUI(event)) {
            return;
        }

        if (INTERSECTED) {
            selectObject(INTERSECTED);
        } else {
            deselectObject();
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

function exportAllModels() {
    if (loadedModels.length === 0) {
        console.warn('Žádné modely k exportu.');
        return;
    }
    const defaultName = 'export_all.glb';
    const filename = window.prompt('Název souboru pro export:', defaultName);
    if (filename === null) return; // uživatel stiskl Cancel
    const finalName = filename.trim() || defaultName;
    const exporter = new GLTFExporter();
    const group = new THREE.Group();
    loadedModels.forEach(model => {
        group.add(model.clone(true));
    });
    exporter.parse(group, function(result) {
        saveArrayBuffer(result, finalName);
        console.log('Export all: hotovo.');
    }, function(error) {
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

    const exporter = new GLTFExporter();
    const clone = lastSelectedObject.clone(true);

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