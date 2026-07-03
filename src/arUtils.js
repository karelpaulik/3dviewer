// arUtils.js – AR via Google <model-viewer>

let overlayEl = null;
let modelViewerEl = null;
let loadingEl = null;
let hintEl = null;
let closeBtnEl = null;
let currentBlobUrl = null;
let sessionActive = false;
let modelViewerReady = false;
let getGlbBufferFn = null;
let hasModelsFn = null;

function isMobileArPlatform() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function getArModes() {
    // Prefer native mobile AR; WebXR last (avoids desktop emulator black-screen issues).
    return isMobileArPlatform()
        ? 'scene-viewer quick-look webxr'
        : 'webxr scene-viewer quick-look';
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

function revokeCurrentBlobUrl() {
    if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
        currentBlobUrl = null;
    }
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

function shouldAutoActivateAr(viewer) {
    if (!viewer.canActivateAR) return false;
    // Auto-launch only on mobile native AR; desktop WebXR emulators often show a black screen.
    return isMobileArPlatform();
}

function onArStatus(event) {
    const status = event.detail?.status;
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
        updateArHint();
        console.warn('AR session failed.');
    }
}

function unmountModelViewer() {
    if (!modelViewerEl) return;
    modelViewerEl.removeEventListener('ar-status', onArStatus);
    modelViewerEl.remove();
    modelViewerEl = null;
}

function mountModelViewer(blobUrl) {
    unmountModelViewer();

    const viewer = document.createElement('model-viewer');
    viewer.toggleAttribute('ar', true);
    viewer.setAttribute('ar-modes', getArModes());
    viewer.setAttribute('ar-scale', 'auto');
    viewer.setAttribute('ar-placement', 'floor');
    viewer.toggleAttribute('camera-controls', true);
    viewer.setAttribute('touch-action', 'pan-y');
    viewer.setAttribute('shadow-intensity', '1');
    viewer.setAttribute('environment-image', 'neutral');
    viewer.setAttribute('reveal', 'auto');
    viewer.setAttribute('loading', 'eager');
    viewer.setAttribute('alt', '3D model');
    viewer.src = blobUrl;

    const arButton = document.createElement('button');
    arButton.slot = 'ar-button';
    arButton.id = 'ar-slot-button';
    arButton.type = 'button';
    arButton.textContent = 'View in AR';
    viewer.appendChild(arButton);

    viewer.addEventListener('ar-status', onArStatus);
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
        setHint(onLocalhost
            ? 'AR preview only on localhost. Deploy over HTTPS on a phone to use AR.'
            : 'AR is not available on this device. You can still inspect the model here.');
        return;
    }
    if (isMobileArPlatform()) {
        setHint('Tap "View in AR" to place the model in your space.');
    } else {
        setHint('Use "View in AR" for WebXR, or open this page on a phone over HTTPS.');
    }
}

export function isArSessionActive() {
    return sessionActive;
}

export function closeAr() {
    sessionActive = false;
    unmountModelViewer();
    revokeCurrentBlobUrl();
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
    closeBtnEl.addEventListener('click', closeAr);
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

    overlayEl.hidden = false;
    setLoading(true, 'Preparing model for AR…');
    setHint('');

    try {
        const built = await getGlbBufferFn();
        if (!built?.buffer) {
            alert('Failed to prepare model for AR.');
            closeAr();
            return;
        }

        revokeCurrentBlobUrl();
        currentBlobUrl = URL.createObjectURL(
            new Blob([built.buffer], { type: 'model/gltf-binary' })
        );

        await ensureModelViewerLoaded();
        mountModelViewer(currentBlobUrl);

        await waitForModelLoad(modelViewerEl);
        if (modelViewerEl.updateComplete) {
            await modelViewerEl.updateComplete;
        }

        revealModelPreview();
        setLoading(false);
        updateArHint();

        if (shouldAutoActivateAr(modelViewerEl)) {
            try {
                await modelViewerEl.activateAR();
            } catch (err) {
                console.warn('activateAR failed:', err);
            }
        }
    } catch (err) {
        console.error('AR launch error:', err);
        alert('Failed to open AR view. See console for details.');
        closeAr();
    }
}

export function getArOverlayElement() {
    return overlayEl;
}
