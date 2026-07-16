// jitsiCall.js
// Lightweight Jitsi Meet embed (no backend required).

import {
    CALL_TYPE_JITSI,
    generateRoomId,
    sanitizeRoomId,
    sanitizeHostname,
    applyUrlParams,
    buildShareUrl,
    clearCallParamsFromUrl,
} from './callUtils.js';

export const JITSI_SERVER_PRESETS = [
    'meet.jit.si',
    'meet.ffmuc.net',
    'jitsi.riot.im',
    'vc.hot-chili.net',
];
export const JITSI_CUSTOM_PRESET = 'Custom';

const DEFAULT_JITSI_DOMAIN = 'jitsi.riot.im';
const STORAGE_KEY = 'meshbex-jitsi-domain';
const STORAGE_KEY_CUSTOM = 'meshbex-jitsi-custom-domain';

let _dialog = null;
let _iframe = null;
let _roomLabel = null;
let _minimizeBtn = null;
let _currentRoomId = null;
let _minimized = false;
let _jitsiDomain = DEFAULT_JITSI_DOMAIN;
let _customDomain = '';

export function sanitizeJitsiDomain(input) {
    return sanitizeHostname(input);
}

function persistJitsiDomain(domain) {
    try {
        localStorage.setItem(STORAGE_KEY, domain);
    } catch {
        // ignore quota / private mode
    }
}

function persistCustomDomain(domain) {
    _customDomain = domain;
    try {
        localStorage.setItem(STORAGE_KEY_CUSTOM, domain);
    } catch {
        // ignore
    }
}

function loadStoredJitsiDomain() {
    try {
        return sanitizeJitsiDomain(localStorage.getItem(STORAGE_KEY));
    } catch {
        return null;
    }
}

function loadStoredCustomDomain() {
    try {
        return sanitizeJitsiDomain(localStorage.getItem(STORAGE_KEY_CUSTOM)) || '';
    } catch {
        return '';
    }
}

export function resolveJitsiDomainFromPreset(preset, customDomain) {
    if (preset === JITSI_CUSTOM_PRESET) {
        return sanitizeJitsiDomain(customDomain);
    }
    if (JITSI_SERVER_PRESETS.includes(preset)) {
        return preset;
    }
    return sanitizeJitsiDomain(preset);
}

export function getJitsiDomain() {
    return _jitsiDomain;
}

export function getJitsiServerPreset() {
    if (JITSI_SERVER_PRESETS.includes(_jitsiDomain)) {
        return _jitsiDomain;
    }
    return JITSI_CUSTOM_PRESET;
}

export function getJitsiCustomDomain() {
    return _customDomain;
}

function syncActiveCallInUrl(roomId) {
    const params = new URLSearchParams(window.location.search);
    params.set('room', roomId);
    params.set('jitsi', _jitsiDomain);
    params.delete('call');
    params.delete('peer');
    applyUrlParams(params);
}

function syncJitsiDomainInUrlIfActiveCall() {
    if (_currentRoomId) {
        syncActiveCallInUrl(_currentRoomId);
        return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.has('jitsi')) {
        params.delete('jitsi');
        applyUrlParams(params);
    }
}

function reloadActiveJitsiIframe() {
    if (_currentRoomId && _iframe && _dialog?.open) {
        _iframe.src = buildJitsiIframeUrl(_currentRoomId);
    }
}

export function setJitsiDomain(domain) {
    const sanitized = sanitizeJitsiDomain(domain);
    if (!sanitized) return false;

    _jitsiDomain = sanitized;
    persistJitsiDomain(sanitized);
    syncJitsiDomainInUrlIfActiveCall();
    updateRoomLabel();
    reloadActiveJitsiIframe();
    return true;
}

export function setJitsiDomainFromGui(preset, customDomain) {
    const domain = resolveJitsiDomainFromPreset(preset, customDomain);
    if (!domain) {
        if (preset === JITSI_CUSTOM_PRESET) {
            alert('Enter a valid Jitsi server hostname (e.g. meet.example.org).');
        }
        return false;
    }

    if (preset === JITSI_CUSTOM_PRESET) {
        persistCustomDomain(domain);
    }

    return setJitsiDomain(domain);
}

export function initJitsiDomainFromStorageAndUrl() {
    _customDomain = loadStoredCustomDomain();

    const fromUrl = sanitizeJitsiDomain(new URLSearchParams(window.location.search).get('jitsi'));
    const fromStorage = loadStoredJitsiDomain();
    const domain = fromUrl || fromStorage || DEFAULT_JITSI_DOMAIN;

    _jitsiDomain = domain;
    if (!JITSI_SERVER_PRESETS.includes(domain)) {
        _customDomain = domain;
        persistCustomDomain(domain);
    }

    persistJitsiDomain(domain);

    const params = new URLSearchParams(window.location.search);
    if (!sanitizeRoomId(params.get('room'))) {
        params.delete('jitsi');
        applyUrlParams(params);
    }

    updateRoomLabel();
}

function buildJitsiIframeUrl(roomId) {
    const hash = [
        'config.prejoinPageEnabled=false',
        'config.disableDeepLinking=true',
        'config.startWithAudioMuted=true',
    ].join('&');
    return `https://${_jitsiDomain}/${encodeURIComponent(roomId)}#${hash}`;
}

function updateRoomLabel() {
    if (!_roomLabel) return;

    if (!_currentRoomId) {
        _roomLabel.textContent = '';
        return;
    }

    _roomLabel.textContent = `Room: ${_currentRoomId} \u00b7 ${_jitsiDomain}`;
}

function setJitsiCallMinimized(minimized) {
    _minimized = minimized;
    if (!_dialog) return;

    _dialog.classList.toggle('jitsi-call-minimized', minimized);

    if (_minimizeBtn) {
        _minimizeBtn.textContent = minimized ? '\u25A1' : '\u2212';
        _minimizeBtn.title = minimized ? 'Restore' : 'Minimize';
    }
}

export function toggleJitsiCallMinimized() {
    setJitsiCallMinimized(!_minimized);
}

function _createDialog() {
    const dlg = document.createElement('dialog');
    dlg.id = 'jitsi-call-dialog';
    dlg.innerHTML = `
        <div class="jitsi-call-header">
            <h2>Video call</h2>
            <span id="jitsi-room-label" class="jitsi-call-room"></span>
            <span class="jitsi-call-header-spacer"></span>
            <button type="button" id="jitsi-minimize" class="jitsi-call-btn" title="Minimize">&minus;</button>
            <button type="button" id="jitsi-copy-link" class="jitsi-call-btn">Copy link</button>
            <button type="button" id="jitsi-leave" class="jitsi-call-btn jitsi-call-btn-leave">Leave</button>
        </div>
        <div class="jitsi-call-iframe-wrap">
            <iframe
                id="jitsi-call-iframe"
                title="Video call"
                allow="camera; microphone; display-capture; fullscreen; autoplay"
            ></iframe>
        </div>
    `;
    document.body.appendChild(dlg);

    _iframe = dlg.querySelector('#jitsi-call-iframe');
    _roomLabel = dlg.querySelector('#jitsi-room-label');
    _minimizeBtn = dlg.querySelector('#jitsi-minimize');

    _minimizeBtn.addEventListener('click', () => {
        toggleJitsiCallMinimized();
    });
    dlg.querySelector('#jitsi-copy-link').addEventListener('click', () => {
        copyJitsiInviteLink();
    });
    dlg.querySelector('#jitsi-leave').addEventListener('click', () => {
        leaveJitsiCall();
    });

    return dlg;
}

export function initJitsiCall() {
    if (_dialog) return;
    _dialog = _createDialog();
}

export function getJitsiRoomId() {
    return _currentRoomId;
}

export function buildJitsiShareUrl(roomId) {
    const id = sanitizeRoomId(roomId) || _currentRoomId;
    if (!id) return window.location.href;
    return buildShareUrl(id, CALL_TYPE_JITSI, { jitsi: _jitsiDomain });
}

export async function copyJitsiInviteLink() {
    const roomId = _currentRoomId;
    if (!roomId) {
        alert('No active call. Start or join a call first.');
        return;
    }

    const url = buildJitsiShareUrl(roomId);
    try {
        await navigator.clipboard.writeText(url);
    } catch {
        prompt('Copy this invite link:', url);
    }
}

export async function startJitsiCall(roomId) {
    const { leavePeerCall } = await import('./peerJSCall.js');
    leavePeerCall();

    initJitsiCall();

    const id = sanitizeRoomId(roomId) || _currentRoomId || generateRoomId();
    _currentRoomId = id;
    syncActiveCallInUrl(id);
    updateRoomLabel();

    if (_iframe) {
        _iframe.src = buildJitsiIframeUrl(id);
    }

    if (!_dialog.open) {
        _dialog.show();
    }

    setJitsiCallMinimized(false);
}

export function leaveJitsiCall() {
    if (_iframe) {
        _iframe.src = 'about:blank';
    }
    _currentRoomId = null;
    updateRoomLabel();
    clearCallParamsFromUrl();
    setJitsiCallMinimized(false);

    if (_dialog?.open) {
        _dialog.close();
    }
}
