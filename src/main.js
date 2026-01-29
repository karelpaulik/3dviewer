//main.js
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';

//import { GUI } from 'dat.gui';
import { GUI } from 'lil-gui';
import ZipLoader from 'zip-loader';

// Proměnné globálního rozsahu----------------------------------------------------------------------------------------
let container, stats;
let camera, cameraTarget, scene, renderer;			

const clipPlanes = [];		

let cameraPersp, cameraOrtho, currentCamera;
let transformControls, orbitControls;
const helperObjects = [];

const gui = new GUI();				
let lastSelectedObject = null;
const lastSelectedMeshes = [];
let selectedFolder = null;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2( 1, 1 ); //udání hodnoty 1,1 je kvůli inicializaci. Jinak může vybrat objekt i když není na vybrání.
let INTERSECTED;

let isTouchScreen;

let selectionHelper;

// Možnost zobrazení následujících objektů v konzoli pouze v režimu "npx vite"
if (import.meta.env.DEV) {
    //OK, reference na objekty jsou dostupné v konzoli pro ladění
    window.helperObjects = helperObjects;
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
function initLoad() {		    
    // Načtení modelu z URL parametru---------------------------------------------------------
    // 1. Získání celého řetězce dotazu (query string) z aktuální URL
    // Např. získá '?model=https%3A%2F%2Ffirebase.zip&name=muj_dil.zip'
    const urlParams = new URLSearchParams(window.location.search);

    // 2. Získání hodnoty parametru s názvem 'model' (URL k modelu) a 'name' (původní název souboru)
    // Např. pro 'model' získá 'https%3A%2F%2Ffirebase.zip' a pro 'name' získá 'muj_dil.zip'
    const fileUrl = urlParams.get('model'); 
    const fileName = urlParams.get('name'); 

    // 3. Načtení modelu
    if (fileUrl && fileName) {
        console.log(`fileUrl: ${fileUrl}`);
        console.log(`fileName: ${fileName}`);

        document.getElementById('fileNameLabel').textContent = fileName;
        document.getElementById('pageTitle').textContent = fileName;
        
        // Použití proměnné modelToLoad v tvé funkci
        loadModel(fileUrl, fileName, 0.001, true).then( (result) => {
            // Zde pokračuje tvůj kód pro zpracování načteného modelu
            helperObjects.push(result);
            console.log(`Model ${fileName} byl úspěšně načten.`);
        }).catch((error) => {
            console.error(`Chyba při načítání modelu ${fileName}:`, error);
        });

    } else {
        //console.error("Chyba: Nebyl nalezen žádný model k načtení.");
        //loadModel('/models/1011364_c.zip','1011364_c.zip', 0.001, true).then( (result)=>{helperObjects.push( result )} );	
        loadGlbModel('./models/1011364_c.zip','1011364_c.zip', 0.001, true).then( (result)=>{helperObjects.push( result )} );
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
    let newColor = color || undefined;
    for (let i = 0; i < obj.material.length; i++) {
        if (color === undefined) {
            newColor = new THREE.Color(Math.random() * 0xffffff);
            //newColor = new THREE.Color();
            //newColor.setHSL(Math.random(), 0.6, 0.5); // Náhodný odstín, daná sytost i jas
        } else {
            newColor = new THREE.Color(color);
        }
        obj.material[i].color = newColor;
        if (obj.children[0]) {
            obj.children[0].material[i].color = newColor;
        }
    }
    render();
}

function setDefPosRotScale(obj) {
    if (!obj) return;
    obj.position.set(obj.initPosition.x, obj.initPosition.y, obj.initPosition.z);
    obj.rotation.set(obj.initRotation.x, obj.initRotation.y, obj.initRotation.z);
    obj.scale.set(obj.initScale.x, obj.initScale.y, obj.initScale.z);
    render();
}

function createSectionMesh(mesh) {
    const sectionMesh = mesh.clone();	

    let parentMaterialColor;        
    for (let j=0; j < sectionMesh.material.length; j++) {
        parentMaterialColor = sectionMesh.material[j].color;
        //console.log(parentMaterialColor);
        const material = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            clippingPlanes: clipPlanes,
            clipIntersection: true,								
            color: parentMaterialColor,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            wireframe: false
        });
        sectionMesh.material[j] = material;
    }

    sectionMesh.position.set( 0, 0, 0);
    sectionMesh.rotation.set( 0, 0, 0);							
    sectionMesh.scale.set( 1, 1, 1 );
            
    mesh.add(sectionMesh);			
}

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
    cameraOrtho = new THREE.OrthographicCamera( frustumSize * aspect / - 0.002, frustumSize * aspect / 0.002, frustumSize / 0.002, frustumSize / - 0.002, 250, 20000 );
    
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

    let mouseDown = 0;
    document.body.onmousedown = function() { 
        mouseDown = 1;
    }
    document.body.onmouseup = function() {
        mouseDown = 0;
    }
    
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
    scene.add( transformControls.getHelper() );	//Nutno v novém three.js. Dříve bylo: scene.add( transformControls );
    transformControls.addEventListener( 'change', render );
    transformControls.addEventListener( 'dragging-changed', function ( event ) {
        orbitControls.enabled = ! event.value;
    } );	
    

    selectionHelper = new THREE.BoxHelper(new THREE.Mesh(), 0xffff00);
    selectionHelper.visible = false;
    scene.add(selectionHelper);
    
    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'mousemove', onMouseMove, false );				
    window.addEventListener( 'click', onClick, false );
    
    window.addEventListener( 'keydown', function ( event ) {
        switch ( event.key ) {
            case 'Escape':
                // 1. Odpojíme transformační prvky od objektu
                if (transformControls.object) {
                    transformControls.detach();
                }                
                // 2. Zničíme složku v lil-gui, pokud existuje
                if (selectedFolder) {
                    selectedFolder.destroy();
                    selectedFolder = null;
                }                
                // 3. Volitelné: vynulování pomocných proměnných
                lastSelectedMeshes.forEach( child => {
                    if (child.material.emissive) {
                        child.material.emissive.setHex(0x000000);
                    }
                });
                lastSelectedMeshes.length = 0; // empty the array
                lastSelectedObject = null;

                render(); // Překreslíme scénu, aby zmizely transformátory
                break;
            case 'q':
            case 'Q':
                transformControls.setSpace( transformControls.space === 'local' ? 'world' : 'local' );
                break;

            case 'Shift':
                transformControls.setTranslationSnap( 10 );
                transformControls.setRotationSnap( THREE.MathUtils.degToRad( 30 ) );
                transformControls.setScaleSnap( 0.25 );
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
            
            case 'p': //select parent of the selected object
                if (lastSelectedObject) {
                    const parentObject = lastSelectedObject.parent;
                    if (parentObject && parentObject !== scene) {
                        transformControls.attach(parentObject);
                        lastSelectedObject = parentObject;
                        console.log("Selected parent object: ", lastSelectedObject);
                        refreshSelectedObjGui(lastSelectedObject);

                        lastSelectedObject.traverse( function ( child ) {
                            if ( child.isMesh ) {
                                lastSelectedMeshes.push( child );
                            }
                        } );
                        lastSelectedMeshes.forEach( child => {
                            if (child.material.emissive) {
                                child.material.emissive.setHex(0xff0000);
                            }
                        });

                        render();
                        console.log("Last sel obj. in parent meshes: ", lastSelectedObject);

                    }
                }
                break;
        }
    } );

    window.addEventListener( 'keyup', function ( event ) {
        switch ( event.key ) {
            case 'Shift':
                transformControls.setTranslationSnap( null );
                transformControls.setRotationSnap( null );
                transformControls.setScaleSnap( null );
                break;
        }
    } );
} //End init 	

//GUI----------------------------------------------------------------------------------------------------------------
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

const viewProp = {
    perspCam: false,
    section: false,
    px: 0,
    py: 0,
    pz: 0,
    reset: function() { resetSection() },
    viewx: function() { viewFromPoint(1000, 0, 0) },
    viewy: function() { viewFromPoint(0, 1000, 0) },
    viewz: function() { viewFromPoint(0, 0, 1000) },
}
    
const part = {
    remove: function() { removeModel(lastSelectedObject); },
    color: "#888888",
    separate: function() { 
        if (lastSelectedObject) {
            separateMesh(lastSelectedObject); 
        }									
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
    }
};	

const params = {
    backgroundColor: "#888888"
}

function addMainGui() {
    //View
    const folderProp = gui.addFolder( 'View' );
    folderProp.addColor(params, 'backgroundColor').name('Background').onChange(function(value){ scene.background = new THREE.Color(value); render(); });
    folderProp.add(viewProp, 'perspCam').name('Persp. camera').onChange(function(value){setCamera(); render(); });
    folderProp.add(viewProp, 'section').name('Section').onChange(function(value){renderer.localClippingEnabled = value; render(); });
    folderProp.add(viewProp, 'px', extent.pn, extent.pp, extent.pStep).name('Pos. x').onChange(function(value){clipPlanes[0].constant=value; render(); }).listen();
    folderProp.add(viewProp, 'py', extent.pn, extent.pp, extent.pStep).name('Pos. y').onChange(function(value){clipPlanes[1].constant=value; render(); }).listen();
    folderProp.add(viewProp, 'pz', extent.pn, extent.pp, extent.pStep).name('Pos. z').onChange(function(value){clipPlanes[2].constant=value; render(); }).listen();
    folderProp.add(viewProp, 'reset').name('Reset section');
    folderProp.add(viewProp, 'viewx').name('View from X');
    folderProp.add(viewProp, 'viewy').name('View from Y');
    folderProp.add(viewProp, 'viewz').name('View from Z');
    folderProp.add(part, 'randomColor').name('Random color');						
}	

function refreshSelectedObjGui(obj) {
    if (selectedFolder) {
        selectedFolder.destroy();
        selectedFolder = null;
    }
                
    selectedFolder = gui.addFolder( 'Selected part: ' + (obj.name || 'Unnamed') );
    selectedFolder.add(obj, 'name').name('Name').listen();
    selectedFolder.add(part, 'randomColor').name('Random color');
    selectedFolder.addColor(part, 'color').name('Specif. color').onChange(function(value){ changeColor(obj, value); });
    selectedFolder.add(part, 'remove').name('Remove');	
    selectedFolder.add(part, 'separate').name('Separate Part');

    const folder2 = selectedFolder.addFolder("Location");
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
    folder2.add(part, 'resetLocation').name('Reset init. location');
    folder2.close();
    
    // if (obj.children[0]) {   
    //     const folder3 = selectedFolder.addFolder("Section view");
    //     folder3.add(obj.children[0], 'visible').name('Fullfiled section').onChange(function(value){obj.children[0].visible = value; render(); });
    //     folder3.add(obj.children[0].material[0], 'polygonOffsetFactor', -4, 0, 0.1)
    //         .name('OffsetFactor')
    //         .onChange(function(value){setPolygonOffsetFactor(obj, value);render(); });
    // }

    selectedFolder.open();
}

function resetSection() {					
    viewProp.px = 0;
    viewProp.py = 0;
    viewProp.pz = 0;
    updateSection();
}
    
function viewFromPoint(x, y, z) {
    currentCamera.position.set( x, y, z );	
    currentCamera.lookAt( 0, 0, 0 );					
    orbitControls.update();
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
                        wireframe: false
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
                render();
                resolve(mesh);	

                createSectionMesh(mesh);
                lastSelectedObject=mesh;  
                addMainGui();
            } );
        } );					
    });
}

function loadGlbModel(model, name, scale, colored) {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load('./models/1012053_l.glb', function (gltf) {
            gltf.scene.scale.set(1000.0, 1000.0, 1000.0);
            gltf.scene.rotation.x = - Math.PI / 2;

            scene.add(gltf.scene);
            console.log(gltf.scene);

            const meshes = [];
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    if (child.material) {
                        child.material = child.material.clone();// Naklonujeme materiál, aby byl unikátní. Jinak jeden typ materiálu pro více častí stejné barvy.
                    }
                    meshes.push(child);
                    helperObjects.push(child);
                }
            });

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

function removeModel(part) {
    try {				
        transformControls.detach( part );
        scene.remove( part );
        const partIndex = helperObjects.indexOf(part);
        if (partIndex !== -1) helperObjects.splice(partIndex, 1);			
        render();
    } catch(err) {
        console.log("Error: removeModel " + err.message);
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

// Funkce pro aktivaci zvýraznění (Emisivita + BoxHelper)
function highlightObject(object) {
    if (!object) return;

    // 1. Nastavení emisivity (červená záře)
    // Použijeme tvou logiku pro procházení materiálů
    // const applyEmissive = (mat) => {
    //     if (mat.emissive) {
    //         mat.emissive.setHex(0xff0000);
    //     }
    // };

    // if (Array.isArray(object.material)) {
    //     object.material.forEach(applyEmissive);
    // } else {
    //     applyEmissive(object.material);
    // }

    // 2. Nastavení BoxHelperu (žlutý rámeček)
    if (selectionHelper) {
        selectionHelper.setFromObject(object);
        selectionHelper.visible = true;
    }
}

// Funkce pro vypnutí zvýraznění (Černá barva + Schování helperu)
function clearHighlight() {
    if (!INTERSECTED) return;

    // 1. Vypnutí emisivity (nastavení na černou)
    // const removeEmissive = (mat) => {
    //     if (mat.emissive) {
    //         mat.emissive.setHex(0x000000);
    //     }
    // };

    // if (Array.isArray(INTERSECTED.material)) {
    //     INTERSECTED.material.forEach(removeEmissive);
    // } else {
    //     removeEmissive(INTERSECTED.material);
    // }

    // 2. Schování BoxHelperu
    if (selectionHelper) {
        selectionHelper.visible = false;
    }
}

function render() {   
    if (!isTouchScreen) {      
        raycaster.setFromCamera(mouse, currentCamera);
        const intersects = raycaster.intersectObjects(helperObjects);                

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

function onClick( event ) {		
    if (INTERSECTED) {
        transformControls.attach(INTERSECTED);					
        lastSelectedObject=INTERSECTED;	
        console.log("Selected object: ", lastSelectedObject);				
        refreshSelectedObjGui(lastSelectedObject);
    }
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
        
        // Inicializace sekcí a registrace
        createSectionMesh(newMesh);
        helperObjects.push(newMesh);
    });

    render();
}