// arUtils.js – AR via Google <model-viewer>

const AR_CACHE = 'bedobe-ar-v1';
const AR_MODEL_PATH = 'ar-session/current.glb';
const AR_MAX_BYTES = 45 * 1024 * 1024;
const AR_MAX_TRIANGLES = 600000;

let overlayEl = null;
let modelViewerEl = null;
let loadingEl = null;
let hintEl = null;
let closeBtnEl = null;
let currentModelUrl = null;
let currentBlobUrl = null;
let sessionActive = false;
let modelViewerReady = false;
let getGlbBufferFn = null;
let hasModelsFn = null;

function isAndroid() {
    return /Android/i.test(navigator.userAgent);
}

function isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function getArModes() {
    if (isAndroid()) return 'scene-viewer';
    if (isIOS()) return 'quick-look';
    return 'webxr scene-viewer quick-look';
}

function isMobileArPlatform() {
    return isAndroid() || isIOS();
}

function canPublishArModel() {
    return location.protocol === 'https:' && 'serviceWorker' in navigator && 'caches' in window;
}

async function publishArModelGlb(arrayBuffer) {
    const modelUrl = new URL(AR_MODEL_PATH, document.baseURI);
    modelUrl.searchParams.set('v', String(Date.now()));
    const url = modelUrl.href;

    const cache = await caches.open(AR_CACHE);
    await cache.put(url, new Response(arrayBuffer, {
        headers: {
            'Content-Type': 'model/gltf-binary',
            'Access-Control-Allow-Origin': '*',
        },
    }));

    const probe = await fetch(url, { cache: 'no-store' });
    if (!probe.ok) {
        throw new Error(`AR model publish failed (${probe.status})`);
    }

    return url;
}

async function resolveArModelUrl(arrayBuffer) {
    if (canPublishArModel()) {
        try {
            return await publishArModelGlb(arrayBuffer);
        } catch (err) {
            console.warn('AR: SW publish failed, using blob URL fallback:', err);
        }
    }

    if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
    }
    currentBlobUrl = URL.createObjectURL(
        new Blob([arrayBuffer], { type: 'model/gltf-binary' })
    );
    return currentBlobUrl;
}

async function cleanupArModelUrl() {
    if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
    }
    if (currentModelUrl && !currentModelUrl.startsWith('blob:') && 'caches' in window) {
        try {
            const cache = await caches.open(AR_CACHE);
            await cache.delete(currentModelUrl);
        } catch (err) {
            console.warn('Failed to remove AR model from cache:', err);
        }
    }
    currentModelUrl = null;
}

async function ensureModelViewerLoaded() {
    if (modelViewerReady) return;
    await import('@google/model-viewer');
    modelViewerReady = true;
}

function waitForModelLoad(viewer) {
    if (viewer.loaded) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const onLoad = () => {
            viewer.removeEventListener('load', onLoad);
            viewer.removeEventListener('error', onError);
            resolve();
        };
        const onError = (e) => {
            viewer.removeEventListener('load', onLoad);
            viewer.removeEventListener('error', onError);
            reject(e);
        };
        viewer.addEventListener('load', onLoad);
        viewer.addEventListener('error', onError);
    });
}

function setLoading(visible, message = 'Preparing model for AR…') {
    if (!loadingEl) return;
    loadingEl.textContent = message;
    loadingEl.hidden = !visible;
}

function setHint(message) {
    if (!hintEl) return;
    if (message) {
        hintEl.textContent = message;
        hintEl.hidden = false;
    } else {
        hintEl.hidden = true;
    }
}

function revealModelPreview() {
    if (!modelViewerEl) return;
    if (typeof modelViewerEl.dismissPoster === 'function') {
        modelViewerEl.dismissPoster();
    }
}

function onArStatus(event) {
    const status = event.detail?.status;
    console.log('[AR] ar-status:', status, event.detail);
    if (status === 'session-started') {
        sessionActive = true;
        setLoading(false);
        setHint('');
    } else if (status === 'not-presenting') {
        sessionActive = false;
        setLoading(false);
        revealModelPreview();
        updateArHint();
    } else if (status === 'failed') {
        sessionActive = false;
        setLoading(false);
        revealModelPreview();
        console.warn('AR session failed:', event.detail);
        setHint('AR could not start. Try a smaller model or reload the page.');
    }
}

function onModelViewerError(event) {
    console.error('[AR] model-viewer error:', event);
    setHint('Failed to load model preview. The export may be too complex for AR.');
}

function unmountModelViewer() {
    if (!modelViewerEl) return;
    modelViewerEl.removeEventListener('ar-status', onArStatus);
    modelViewerEl.removeEventListener('error', onModelViewerError);
    modelViewerEl.remove();
    modelViewerEl = null;
}

function mountModelViewer(modelUrl) {
    unmountModelViewer();

    const viewer = document.createElement('model-viewer');
    viewer.toggleAttribute('ar', true);
    viewer.setAttribute('ar-modes', getArModes());
    viewer.setAttribute('ar-scale', 'fixed');
    viewer.setAttribute('ar-placement', 'floor');
    viewer.toggleAttribute('camera-controls', true);
    viewer.setAttribute('touch-action', 'pan-y');
    viewer.setAttribute('shadow-intensity', '0.8');
    viewer.setAttribute('environment-image', 'neutral');
    viewer.setAttribute('reveal', 'interaction');
    viewer.setAttribute('loading', 'eager');
    viewer.setAttribute('interaction-prompt', 'auto');
    viewer.setAttribute('alt', '3D model');
    viewer.src = modelUrl;

    const arButton = document.createElement('button');
    arButton.slot = 'ar-button';
    arButton.id = 'ar-slot-button';
    arButton.type = 'button';
    arButton.textContent = 'View in AR';
    viewer.appendChild(arButton);

    viewer.addEventListener('ar-status', onArStatus);
    viewer.addEventListener('error', onModelViewerError);
    overlayEl.appendChild(viewer);
    modelViewerEl = viewer;
}

function updateArHint() {
    if (!modelViewerEl) return;
    if (sessionActive) {
        setHint('');
        return;
    }
    if (!modelViewerEl.canActivateAR) {
        const onLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        if (onLocalhost) {
            setHint('AR preview on localhost. Deploy over HTTPS on a phone for mobile AR.');
            return;
        }
        if (!canPublishArModel()) {
            setHint('AR requires HTTPS and Service Worker support. Open the deployed site on your phone.');
            return;
        }
        setHint('AR is not available on this device. You can still inspect the model here.');
        return;
    }
    if (isAndroid()) {
        setHint('Drag to rotate the preview. Tap "View in AR" to open Google Scene Viewer.');
    } else if (isIOS()) {
        setHint('Drag to rotate the preview. Tap "View in AR" for AR Quick Look.');
    } else {
        setHint('Drag to rotate the preview. Tap "View in AR" for WebXR.');
    }
}

function confirmArComplexity(built) {
    const bytes = built.buffer?.byteLength ?? 0;
    const triangles = built.stats?.triangleCount ?? 0;
    const parts = [];
    if (bytes > AR_MAX_BYTES) {
        parts.push(`${(bytes / (1024 * 1024)).toFixed(1)} MB file size`);
    }
    if (triangles > AR_MAX_TRIANGLES) {
        parts.push(`${Math.round(triangles / 1000)}k triangles`);
    }
    if (parts.length === 0) return true;
    return window.confirm(
        `This model is heavy for AR (${parts.join(', ')}). AR may fail or be slow.\n\nContinue anyway?`
    );
}

export function isArSessionActive() {
    return sessionActive;
}

export async function closeAr() {
    sessionActive = false;
    unmountModelViewer();
    await cleanupArModelUrl();
    if (overlayEl) {
        overlayEl.hidden = true;
    }
    setLoading(false);
    setHint('');
}

export function initAr({ getGlbBuffer, hasModels }) {
    getGlbBufferFn = getGlbBuffer;
    hasModelsFn = hasModels;

    overlayEl = document.createElement('div');
    overlayEl.id = 'ar-overlay';
    overlayEl.hidden = true;

    loadingEl = document.createElement('div');
    loadingEl.id = 'ar-loading';
    loadingEl.textContent = 'Preparing model for AR…';
    overlayEl.appendChild(loadingEl);

    hintEl = document.createElement('div');
    hintEl.id = 'ar-hint';
    hintEl.hidden = true;
    overlayEl.appendChild(hintEl);

    closeBtnEl = document.createElement('button');
    closeBtnEl.id = 'ar-close-btn';
    closeBtnEl.type = 'button';
    closeBtnEl.title = 'Close AR';
    closeBtnEl.textContent = '✕';
    closeBtnEl.addEventListener('click', () => { closeAr(); });
    overlayEl.appendChild(closeBtnEl);

    document.body.appendChild(overlayEl);
}

export async function launchAr() {
    if (!hasModelsFn || !hasModelsFn()) {
        alert('No models to view in AR.');
        return;
    }
    if (!getGlbBufferFn || !overlayEl) {
        console.error('AR not initialized.');
        return;
    }

    if (isMobileArPlatform() && !canPublishArModel()) {
        alert('AR on mobile requires the app to be opened over HTTPS with Service Worker enabled.');
        return;
    }

    overlayEl.hidden = false;
    setLoading(true, 'Preparing model for AR…');
    setHint('');

    try {
        const built = await getGlbBufferFn();
        if (!built?.buffer) {
            alert('Failed to prepare model for AR.');
            await closeAr();
            return;
        }

        if (!confirmArComplexity(built)) {
            await closeAr();
            return;
        }

        console.log('[AR] export stats:', built.stats, 'bytes:', built.buffer.byteLength);

        await cleanupArModelUrl();
        currentModelUrl = await resolveArModelUrl(built.buffer);

        await ensureModelViewerLoaded();
        mountModelViewer(currentModelUrl);

        await waitForModelLoad(modelViewerEl);
        if (modelViewerEl.updateComplete) {
            await modelViewerEl.updateComplete;
        }

        revealModelPreview();
        setLoading(false);
        updateArHint();
    } catch (err) {
        console.error('AR launch error:', err);
        alert('Failed to open AR view. See console for details.');
        await closeAr();
    }
}

export function getArOverlayElement() {
    return overlayEl;
}
