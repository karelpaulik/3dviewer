// viewportCapture.js
// Screen capture via getDisplayMedia (WYSIWYG page pixels).

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

function canvasFromFullVideoFrame(video) {
    const out = document.createElement('canvas');
    out.width = video.videoWidth;
    out.height = video.videoHeight;
    const ctx = out.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, 0, 0);
    return out;
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

/** @param {'browser'|'window'|'monitor'|undefined} displaySurface */
function canvasFromVideoFrame(video, displaySurface) {
    if (displaySurface === 'browser') {
        return canvasFromNormalizedVideoFrame(video);
    }
    if (displaySurface === 'monitor' || displaySurface === 'window') {
        return canvasFromFullVideoFrame(video);
    }
    // Unknown / unsupported — keep page-based heuristics (HiDPI tab capture, etc.)
    return canvasFromNormalizedVideoFrame(video);
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
 * Live display capture stream for screen sharing (caller must stop tracks when done).
 * @returns {Promise<{ stream: MediaStream, track: MediaStreamTrack, displaySurface?: string }>}
 */
export async function acquireLiveDisplayStream() {
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
            selfBrowserSurface: 'include',
        });
    } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
            throw new Error('Screen sharing was cancelled.');
        }
        throw err;
    }

    const track = stream.getVideoTracks()[0];
    if (!track) {
        stream.getTracks().forEach((t) => t.stop());
        throw new Error('No video track in screen capture.');
    }

    return {
        stream,
        track,
        displaySurface: track.getSettings?.().displaySurface,
    };
}

/**
 * Capture via getDisplayMedia (WYSIWYG screen pixels).
 * Tab (`browser`): normalized to stable page pixels (innerWidth/Height × devicePixelRatio).
 * Window or monitor: full captured frame at native stream resolution.
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function captureScreenFromDisplayMedia() {
    const { stream, displaySurface } = await acquireLiveDisplayStream();

    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;

    try {
        await video.play();
        await waitForVideoReady(video);
        await waitForStableFrame();

        return canvasFromVideoFrame(video, displaySurface);
    } finally {
        stream.getTracks().forEach((t) => t.stop());
        video.srcObject = null;
    }
}
