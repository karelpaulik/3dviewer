// Local GLB open/save via File System Access API + File Handling launchQueue + Web Share Target.

import {
    SHARE_CACHE_KEY,
    SHARE_CACHE_NAME,
    SHARE_CACHE_NAME_KEY,
    SHARE_TARGET_MESSAGE_TYPE,
    SHARE_TARGET_QUERY_ERROR,
    SHARE_TARGET_QUERY_PARAM,
    SHARE_TARGET_QUERY_VALUE,
} from './shareTargetConstants.js';

const GLB_PICKER_TYPES = [{
    description: 'GLB Model',
    accept: {
        'model/gltf-binary': ['.glb'],
        'application/octet-stream': ['.glb'],
    },
}];

let currentFileHandle = null;
let currentFileName = null;
let launchedWithFile = false;
let sharedWithFile = false;
let launchQueueSettled = false;
let shareTargetSettled = false;
const pendingLaunchHandles = [];
/** @type {File | null} */
let pendingSharedFile = null;

/** @type {(() => void) | null} */
let _launchQueueSettledResolve = null;
const launchQueueSettledPromise = new Promise(resolve => {
    _launchQueueSettledResolve = resolve;
});

/** @type {(() => void) | null} */
let _shareTargetSettledResolve = null;
const shareTargetSettledPromise = new Promise(resolve => {
    _shareTargetSettledResolve = resolve;
});

/** @type {{
 *   hasLoadedContent?: () => boolean,
 *   clearScene?: () => void | Promise<void>,
 *   loadGlbFile?: (file: File) => void | Promise<void>,
 *   updateFileUi?: (fileName: string) => void,
 *   buildGlbBuffer?: (opts: { draco?: boolean, finalName?: string }) => Promise<{ buffer: ArrayBuffer, suggestedName: string } | null>,
 *   fallbackImportGlb?: () => void,
 * }} */
let _callbacks = {};

function settleLaunchQueue() {
    if (launchQueueSettled) return;
    launchQueueSettled = true;
    _launchQueueSettledResolve?.();
}

function settleShareTargetProbe() {
    if (shareTargetSettled) return;
    shareTargetSettled = true;
    _shareTargetSettledResolve?.();
}

function markLaunchedWithFile() {
    launchedWithFile = true;
    const dlg = document.getElementById('welcome-dialog');
    if (dlg?.open) dlg.close();
}

function markSharedWithFile() {
    sharedWithFile = true;
    const dlg = document.getElementById('welcome-dialog');
    if (dlg?.open) dlg.close();
}

function clearShareTargetQuery() {
    const url = new URL(location.href);
    if (!url.searchParams.has(SHARE_TARGET_QUERY_PARAM)) return;
    url.searchParams.delete(SHARE_TARGET_QUERY_PARAM);
    history.replaceState(null, '', url.pathname + url.search + url.hash);
}

function normalizeSharedFileName(name) {
    const base = (name || 'shared').trim() || 'shared';
    return /\.glb$/i.test(base) ? base : `${base}.glb`;
}

async function readSharedFileFromCache() {
    const cache = await caches.open(SHARE_CACHE_NAME);
    const response = await cache.match(SHARE_CACHE_KEY);
    if (!response) return null;

    const nameResponse = await cache.match(SHARE_CACHE_NAME_KEY);
    const blob = await response.blob();
    await cache.delete(SHARE_CACHE_KEY);
    if (nameResponse) await cache.delete(SHARE_CACHE_NAME_KEY);

    let fileName = nameResponse ? await nameResponse.text() : response.headers.get('x-filename');
    fileName = normalizeSharedFileName(fileName || 'shared.glb');

    return new File([blob], fileName, {
        type: blob.type || 'model/gltf-binary',
    });
}

async function tryConsumePendingSharedFile() {
    if (!pendingSharedFile || !_callbacks.loadGlbFile) return;
    await consumeSharedGlbIfPresent();
}

async function loadPendingShareFromCache(maxRetries = 8, delayMs = 250) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const file = await readSharedFileFromCache();
            if (file) {
                pendingSharedFile = file;
                markSharedWithFile();
                await tryConsumePendingSharedFile();
                return true;
            }
        } catch (err) {
            console.error('[ShareTarget] Failed to read shared file from cache:', err);
            break;
        }

        if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    return false;
}

async function probeShareTargetCache() {
    const params = new URLSearchParams(location.search);
    const target = params.get(SHARE_TARGET_QUERY_PARAM);

    if (target === SHARE_TARGET_QUERY_ERROR) {
        clearShareTargetQuery();
        alert('Could not open the shared file. Only .glb models are supported.');
        settleShareTargetProbe();
        return;
    }

    if (target !== SHARE_TARGET_QUERY_VALUE) {
        settleShareTargetProbe();
        return;
    }

    const loaded = await loadPendingShareFromCache();
    if (!loaded) {
        console.warn('[ShareTarget] No cached file found for share launch.');
        clearShareTargetQuery();
    }

    settleShareTargetProbe();
}

function handleShareTargetMessage() {
    void loadPendingShareFromCache();
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === SHARE_TARGET_MESSAGE_TYPE) {
            handleShareTargetMessage();
        }
    });
}

void probeShareTargetCache();

async function processPendingLaunchHandles() {
    if (!_callbacks.loadGlbFile || pendingLaunchHandles.length === 0) return;
    const handles = pendingLaunchHandles.splice(0);
    for (const handle of handles) {
        try {
            await openGlbFromHandle(handle, { replaceScene: false });
        } catch (err) {
            console.error('[FileHandling] Failed to open file:', err);
        }
    }
}

async function openGlbFromSharedFile(file) {
    clearCurrentLocalFileHandle();
    currentFileName = file.name;
    markSharedWithFile();

    await _callbacks.loadGlbFile?.(file);
    _callbacks.updateFileUi?.(file.name);
    clearShareTargetQuery();
    console.log(`[Share] GLB "${file.name}" loaded from share target.`);
}

export async function consumeSharedGlbIfPresent() {
    if (!pendingSharedFile) return;
    const file = pendingSharedFile;
    pendingSharedFile = null;

    try {
        await openGlbFromSharedFile(file);
    } catch (err) {
        console.error('[ShareTarget] Failed to open shared GLB:', err);
        alert('Could not open the shared file: ' + (err.message || err));
        clearShareTargetQuery();
    }
}

if ('launchQueue' in window) {
    launchQueue.setConsumer(async (launchParams) => {
        const files = launchParams.files || [];
        if (files.length > 0) {
            markLaunchedWithFile();
            pendingLaunchHandles.push(...files);
            await processPendingLaunchHandles();
        }
        settleLaunchQueue();
    });
} else {
    settleLaunchQueue();
}

export function wasLaunchedWithFile() {
    return launchedWithFile;
}

export function wasOpenedWithExternalFile() {
    return launchedWithFile || sharedWithFile;
}

/** Wait until launchQueue consumer runs, or timeout on normal app start. */
export async function waitForLaunchQueueSignal(timeoutMs = 150) {
    if (launchQueueSettled) return;
    await Promise.race([
        launchQueueSettledPromise,
        new Promise(resolve => setTimeout(resolve, timeoutMs)),
    ]);
}

/** Wait until launchQueue and share-target probe complete, or timeout. */
export async function waitForExternalFileSignal(timeoutMs = 150) {
    const needsShareWait = new URLSearchParams(location.search).has(SHARE_TARGET_QUERY_PARAM);
    const effectiveTimeout = needsShareWait ? Math.max(timeoutMs, 3000) : timeoutMs;

    await Promise.race([
        Promise.all([
            launchQueueSettled ? Promise.resolve() : launchQueueSettledPromise,
            shareTargetSettled ? Promise.resolve() : shareTargetSettledPromise,
        ]),
        new Promise(resolve => setTimeout(resolve, effectiveTimeout)),
    ]);
}

async function writeArrayBufferToHandle(handle, buffer) {
    const writable = await handle.createWritable();
    await writable.write(buffer);
    await writable.close();
}

function ensureGlbExtension(name) {
    const trimmed = (name || 'export').trim() || 'export';
    return trimmed.replace(/\.glb$/i, '') + '.glb';
}

export function isLocalFileAccessSupported() {
    return typeof window.showOpenFilePicker === 'function'
        && typeof window.showSaveFilePicker === 'function';
}

export function getCurrentLocalFileName() {
    return currentFileName;
}

export function clearCurrentLocalFileHandle() {
    currentFileHandle = null;
    currentFileName = null;
}

export function initLocalFileAccess(callbacks) {
    _callbacks = callbacks || {};
    void processPendingLaunchHandles();
    void tryConsumePendingSharedFile();
}

async function openGlbFromHandle(handle, { replaceScene }) {
    const file = await handle.getFile();

    if (replaceScene && _callbacks.hasLoadedContent?.()) {
        if (!confirm('Open file and replace current scene?')) return;
        await _callbacks.clearScene?.();
    }

    currentFileHandle = handle;
    currentFileName = file.name;

    await _callbacks.loadGlbFile?.(file);
    _callbacks.updateFileUi?.(file.name);
    console.log(`[Open] GLB "${file.name}" loaded from local file.`);
}

export async function openLocalGlbFile() {
    if (!isLocalFileAccessSupported()) {
        _callbacks.fallbackImportGlb?.();
        return;
    }

    try {
        const [handle] = await window.showOpenFilePicker({
            types: GLB_PICKER_TYPES,
            multiple: false,
        });
        await openGlbFromHandle(handle, { replaceScene: true });
    } catch (err) {
        if (err?.name !== 'AbortError') {
            console.error('[Open] Failed to open local file:', err);
            alert('Could not open file: ' + (err.message || err));
        }
    }
}

export async function saveLocalGlbFile() {
    if (!_callbacks.buildGlbBuffer) return;

    if (!currentFileHandle) {
        await saveLocalGlbFileAs();
        return;
    }

    const finalName = ensureGlbExtension(currentFileName || undefined);

    try {
        const built = await _callbacks.buildGlbBuffer({ draco: true, finalName });
        if (!built) return;

        await writeArrayBufferToHandle(currentFileHandle, built.buffer);
        currentFileName = built.suggestedName;
        _callbacks.updateFileUi?.(built.suggestedName);
        console.log(`[Save] Saved to "${built.suggestedName}".`);
    } catch (err) {
        if (err?.name === 'AbortError') return;
        console.error('[Save] Failed to save local file:', err);
        alert('Could not save file: ' + (err.message || err));
    }
}

export async function saveLocalGlbFileAs() {
    if (!_callbacks.buildGlbBuffer) return;

    if (!isLocalFileAccessSupported()) {
        alert('Save As requires a Chromium-based browser with File System Access API support.');
        return;
    }

    const defaultName = ensureGlbExtension(currentFileName || undefined);

    let handle;
    try {
        handle = await window.showSaveFilePicker({
            suggestedName: defaultName,
            types: GLB_PICKER_TYPES,
        });
    } catch (err) {
        if (err?.name !== 'AbortError') {
            console.error('[Save As] File picker failed:', err);
        }
        return;
    }

    const finalName = ensureGlbExtension(handle.name || defaultName);

    try {
        const built = await _callbacks.buildGlbBuffer({ draco: true, finalName });
        if (!built) return;

        await writeArrayBufferToHandle(handle, built.buffer);
        currentFileHandle = handle;
        currentFileName = built.suggestedName;
        _callbacks.updateFileUi?.(built.suggestedName);
        console.log(`[Save As] Saved to "${built.suggestedName}".`);
    } catch (err) {
        console.error('[Save As] Failed to save local file:', err);
        alert('Could not save file: ' + (err.message || err));
    }
}
