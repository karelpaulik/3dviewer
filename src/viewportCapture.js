// viewportCapture.js
// Captures the visible 3D viewport (WebGL + CSS2D/CSS3D overlays) as a canvas.

import html2canvas from 'html2canvas';

const LABEL_SELECTOR = '.measurement-label, .annotation-label, .cad-dim-3d-label';

async function snapshotLabelElement(el, dpr) {
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:fixed;left:-10000px;top:0;overflow:visible;';
    const clone = el.cloneNode(true);
    clone.style.transform = 'none';
    clone.style.transformOrigin = 'top left';
    clone.style.position = 'relative';
    clone.style.margin = '0';
    clone.style.display = 'block';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);
    try {
        return await html2canvas(clone, {
            backgroundColor: null,
            scale: dpr,
            logging: false,
            useCORS: true,
        });
    } finally {
        wrapper.remove();
    }
}

async function captureLabelElement(ctx, el, dpr) {
    const box = el.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return;

    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return;
    if (parseFloat(style.opacity) < 0.01) return;

    const snap = await snapshotLabelElement(el, dpr);
    if (snap.width < 1 || snap.height < 1) return;

    const dx = Math.round(box.left * dpr);
    const dy = Math.round(box.top * dpr);
    const w = Math.round(box.width * dpr);
    const h = Math.round(box.height * dpr);
    ctx.drawImage(snap, dx, dy, w, h);
}

async function captureLabelOverlays(ctx, roots, dpr) {
    const seen = new Set();
    for (const root of roots) {
        if (!root) continue;
        for (const el of root.querySelectorAll(LABEL_SELECTOR)) {
            if (seen.has(el)) continue;
            seen.add(el);
            await captureLabelElement(ctx, el, dpr);
        }
    }
}

/**
 * Capture the page canvas as a PNG-ready composite (WebGL + CSS2D/CSS3D labels).
 * @param {{ webglCanvas: HTMLCanvasElement, css2dElement?: HTMLElement, css3dElement?: HTMLElement, renderFn: () => void }} opts
 */
export async function captureViewportCanvas({ webglCanvas, css2dElement, css3dElement, renderFn }) {
    renderFn();

    const dpr = window.devicePixelRatio || 1;

    const out = document.createElement('canvas');
    out.width = webglCanvas.width;
    out.height = webglCanvas.height;
    const ctx = out.getContext('2d');

    ctx.drawImage(webglCanvas, 0, 0);

    await captureLabelOverlays(ctx, [css2dElement, css3dElement], dpr);

    return out;
}

/** Expected page content size in physical pixels (CSS layout × devicePixelRatio). */
function expectedPagePixelSize() {
    const dpr = window.devicePixelRatio || 1;
    return {
        width: Math.round(window.innerWidth * dpr),
        height: Math.round(window.innerHeight * dpr),
    };
}

function nearSize(a, b, relTol = 0.06) {
    return Math.abs(a - b) <= Math.max(2, Math.abs(b) * relTol);
}

/**
 * Pick a stable crop/size for getDisplayMedia frames (fixes 1× vs 2× width toggling).
 * @returns {{ sx: number, sy: number, sw: number, sh: number, outW: number, outH: number }}
 */
function normalizeDisplayMediaCrop(video) {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const { width: ew, height: eh } = expectedPagePixelSize();

    if (nearSize(vw, ew) && nearSize(vh, eh)) {
        return { sx: 0, sy: 0, sw: vw, sh: vh, outW: ew, outH: eh };
    }

    const widthRatio = ew > 0 ? vw / ew : 1;
    const heightRatio = eh > 0 ? vh / eh : 1;

    // ~2× width, same height — content in left half of buffer (common on HiDPI window capture)
    if (widthRatio >= 1.75 && widthRatio <= 2.25 && nearSize(vh, eh)) {
        return { sx: 0, sy: 0, sw: ew, sh: eh, outW: ew, outH: eh };
    }

    // ~2× height, same width
    if (heightRatio >= 1.75 && heightRatio <= 2.25 && nearSize(vw, ew)) {
        return { sx: 0, sy: 0, sw: ew, sh: eh, outW: ew, outH: eh };
    }

    // ~2× both — top-left quarter
    if (widthRatio >= 1.75 && heightRatio >= 1.75 && widthRatio <= 2.25 && heightRatio <= 2.25) {
        return { sx: 0, sy: 0, sw: ew, sh: eh, outW: ew, outH: eh };
    }

    // 1× CSS pixels — upscale to page DPR size
    if (nearSize(vw, window.innerWidth) && nearSize(vh, window.innerHeight)) {
        return { sx: 0, sy: 0, sw: vw, sh: vh, outW: ew, outH: eh };
    }

    // Full monitor / much larger than page — keep native resolution
    if (vw > ew * 2.5 || vh > eh * 2.5) {
        return { sx: 0, sy: 0, sw: vw, sh: vh, outW: vw, outH: vh };
    }

    if (vw >= ew && vh >= eh) {
        return { sx: 0, sy: 0, sw: ew, sh: eh, outW: ew, outH: eh };
    }

    return { sx: 0, sy: 0, sw: vw, sh: vh, outW: vw, outH: vh };
}

function canvasFromNormalizedVideoFrame(video) {
    const { sx, sy, sw, sh, outW, outH } = normalizeDisplayMediaCrop(video);
    const out = document.createElement('canvas');
    out.width = outW;
    out.height = outH;
    const ctx = out.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
    return out;
}

function waitForStableFrame() {
    return new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
    });
}

function waitForVideoReady(video, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        const check = () => video.videoWidth > 0 && video.videoHeight > 0;

        if (check()) {
            resolve();
            return;
        }

        const onReady = () => {
            if (check()) {
                cleanup();
                resolve();
            }
        };
        const onError = () => {
            cleanup();
            reject(new Error('Video capture failed.'));
        };
        const timer = setTimeout(() => {
            cleanup();
            reject(new Error('Video capture timed out.'));
        }, timeoutMs);
        const cleanup = () => {
            clearTimeout(timer);
            video.removeEventListener('loadeddata', onReady);
            video.removeEventListener('loadedmetadata', onReady);
            video.removeEventListener('error', onError);
        };

        video.addEventListener('loadeddata', onReady);
        video.addEventListener('loadedmetadata', onReady);
        video.addEventListener('error', onError);
    });
}

/**
 * Capture via getDisplayMedia (WYSIWYG screen pixels).
 * Output is normalized to stable page pixel dimensions (innerWidth/Height × devicePixelRatio).
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function captureViewportFromDisplayMedia() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('Screen capture is not supported in this browser.');
    }

    const dpr = window.devicePixelRatio || 1;
    const idealW = Math.round(window.innerWidth * dpr);
    const idealH = Math.round(window.innerHeight * dpr);

    let stream;
    try {
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                width: { ideal: idealW },
                height: { ideal: idealH },
            },
            audio: false,
            preferCurrentTab: true,
            selfBrowserSurface: 'include',
        });
    } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
            throw new Error('Screen capture was cancelled.');
        }
        throw err;
    }

    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;

    try {
        await video.play();
        await waitForVideoReady(video);
        await waitForStableFrame();

        return canvasFromNormalizedVideoFrame(video);
    } finally {
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
    }
}
