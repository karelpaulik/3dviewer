// peerJSCall.js
// Lightweight PeerJS mesh video/audio call (signaling server required).

import Peer from 'peerjs';
import { acquireLiveDisplayStream } from './viewportCapture.js';
import {
    CALL_TYPE_PEER,
    generateRoomId,
    sanitizeRoomId,
    sanitizeHostname,
    applyUrlParams,
    buildShareUrl,
    clearCallParamsFromUrl,
} from './callUtils.js';

export const PEER_SERVER_PRESETS = [
    '0.peerjs.com',
];
export const PEER_CUSTOM_PRESET = 'Custom';

const DEFAULT_PEER_HOST = '0.peerjs.com';
const STORAGE_KEY = 'meshbex-peer-host';
const STORAGE_KEY_CUSTOM = 'meshbex-peer-custom-host';

let _dialog = null;
let _videoGrid = null;
let _localVideo = null;
let _roomLabel = null;
let _statusLabel = null;
let _minimizeBtn = null;
let _muteBtn = null;
let _cameraBtn = null;
let _screenShareBtn = null;
let _fullscreenHeaderBtn = null;

let _fullscreenOverlay = null;
let _fullscreenVideoEl = null;
let _fullscreenLabel = null;
let _fullscreenPeerId = null;
let _fsEscBound = false;

let _peer = null;
let _localStream = null;
let _screenShareTrack = null;
let _screenShareStream = null;
/** @type {MediaStreamTrack | null} */
let _cameraTrackBackup = null;
let _currentRoomId = null;
let _myPeerId = null;
let _isHost = false;
let _minimized = false;
let _peerHost = DEFAULT_PEER_HOST;
let _customHost = '';

/** @type {Map<string, { call?: import('peerjs').MediaConnection, stream?: MediaStream, video?: HTMLVideoElement, wrap?: HTMLElement, audio?: HTMLAudioElement, tile?: HTMLElement }>} */
const _remotes = new Map();
/** @type {Map<string, import('peerjs').DataConnection>} */
const _dataConns = new Map();

function persistPeerHost(host) {
    try {
        localStorage.setItem(STORAGE_KEY, host);
    } catch {
        // ignore
    }
}

function persistCustomHost(host) {
    _customHost = host;
    try {
        localStorage.setItem(STORAGE_KEY_CUSTOM, host);
    } catch {
        // ignore
    }
}

function loadStoredPeerHost() {
    try {
        return sanitizeHostname(localStorage.getItem(STORAGE_KEY));
    } catch {
        return null;
    }
}

function loadStoredCustomHost() {
    try {
        return sanitizeHostname(localStorage.getItem(STORAGE_KEY_CUSTOM)) || '';
    } catch {
        return '';
    }
}

export function resolvePeerHostFromPreset(preset, customHost) {
    if (preset === PEER_CUSTOM_PRESET) {
        return sanitizeHostname(customHost);
    }
    if (PEER_SERVER_PRESETS.includes(preset)) {
        return preset;
    }
    return sanitizeHostname(preset);
}

export function getPeerHost() {
    return _peerHost;
}

export function getPeerServerPreset() {
    if (PEER_SERVER_PRESETS.includes(_peerHost)) {
        return _peerHost;
    }
    return PEER_CUSTOM_PRESET;
}

export function getPeerCustomDomain() {
    return _customHost;
}

function buildPeerOptions() {
    return {
        host: _peerHost,
        port: 443,
        path: '/',
        secure: true,
    };
}

function syncActiveCallInUrl(roomId) {
    const params = new URLSearchParams(window.location.search);
    params.set('room', roomId);
    params.set('call', CALL_TYPE_PEER);
    params.set('peer', _peerHost);
    params.delete('jitsi');
    applyUrlParams(params);
}

function syncPeerHostInUrlIfActiveCall() {
    if (_currentRoomId) {
        syncActiveCallInUrl(_currentRoomId);
        return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.has('peer')) {
        params.delete('peer');
        applyUrlParams(params);
    }
}

export function setPeerHost(host) {
    const sanitized = sanitizeHostname(host);
    if (!sanitized) return false;

    _peerHost = sanitized;
    persistPeerHost(sanitized);
    syncPeerHostInUrlIfActiveCall();
    updateRoomLabel();
    return true;
}

export function setPeerServerFromGui(preset, customHost) {
    const host = resolvePeerHostFromPreset(preset, customHost);
    if (!host) {
        if (preset === PEER_CUSTOM_PRESET) {
            alert('Enter a valid PeerJS server hostname (e.g. peer.example.org).');
        }
        return false;
    }

    if (preset === PEER_CUSTOM_PRESET) {
        persistCustomHost(host);
    }

    return setPeerHost(host);
}

export function initPeerServerFromStorageAndUrl() {
    _customHost = loadStoredCustomHost();

    const fromUrl = sanitizeHostname(new URLSearchParams(window.location.search).get('peer'));
    const fromStorage = loadStoredPeerHost();
    const host = fromUrl || fromStorage || DEFAULT_PEER_HOST;

    _peerHost = host;
    if (!PEER_SERVER_PRESETS.includes(host)) {
        _customHost = host;
        persistCustomHost(host);
    }

    persistPeerHost(host);

    const params = new URLSearchParams(window.location.search);
    if (!sanitizeRoomId(params.get('room'))) {
        params.delete('peer');
        params.delete('call');
        applyUrlParams(params);
    }

    updateRoomLabel();
}

function updateRoomLabel() {
    if (!_roomLabel) return;

    if (!_currentRoomId) {
        _roomLabel.textContent = '';
        return;
    }

    _roomLabel.textContent = `Room: ${_currentRoomId} \u00b7 ${_peerHost}`;
}

function setStatus(text) {
    if (_statusLabel) {
        _statusLabel.textContent = text || '';
    }
}

function setPeerCallMinimized(minimized) {
    _minimized = minimized;
    if (!_dialog) return;

    _dialog.classList.toggle('peer-call-minimized', minimized);

    if (_minimizeBtn) {
        _minimizeBtn.textContent = minimized ? '\u25A1' : '\u2212';
        _minimizeBtn.title = minimized ? 'Restore' : 'Minimize';
    }
}

export function togglePeerCallMinimized() {
    setPeerCallMinimized(!_minimized);
}

function updateMediaButtons() {
    if (!_muteBtn || !_cameraBtn) return;

    const audioTrack = _localStream?.getAudioTracks()[0];
    const videoTrack = _localStream?.getVideoTracks()[0];
    const isSharingScreen = !!_screenShareTrack;

    if (audioTrack) {
        _muteBtn.disabled = false;
        _muteBtn.textContent = audioTrack.enabled ? 'Mute' : 'Unmute';
    } else {
        _muteBtn.disabled = true;
        _muteBtn.textContent = 'Mute';
    }

    _cameraBtn.disabled = isSharingScreen;
    if (videoTrack) {
        _cameraBtn.textContent = videoTrack.enabled ? 'Camera off' : 'Camera on';
    } else {
        _cameraBtn.textContent = 'Camera on';
    }

    if (_screenShareBtn) {
        _screenShareBtn.disabled = !_currentRoomId;
        if (isSharingScreen) {
            _screenShareBtn.textContent = 'Stop sharing';
            _screenShareBtn.classList.add('peer-call-btn-active');
        } else {
            _screenShareBtn.textContent = 'Share screen';
            _screenShareBtn.classList.remove('peer-call-btn-active');
        }
    }

    if (_fullscreenHeaderBtn) {
        _fullscreenHeaderBtn.disabled = !findFirstRemoteVideoPeerId();
    }
}

function clearLocalPreviewPlaceholders() {
    _videoGrid?.querySelector('.peer-call-local-audio-placeholder')?.remove();
    _videoGrid?.querySelector('.peer-call-local-screen-placeholder')?.remove();
}

function updateLocalPreview() {
    if (!_localVideo || !_videoGrid) return;

    clearLocalPreviewPlaceholders();

    if (_screenShareStream) {
        _localVideo.style.display = '';
        _localVideo.classList.add('peer-call-video-screen');
        attachStreamToVideo(_localVideo, _screenShareStream);

        const placeholder = document.createElement('div');
        placeholder.className = 'peer-call-audio-tile peer-call-local-screen-placeholder';
        placeholder.textContent = 'You · screen';
        _videoGrid.insertBefore(placeholder, _localVideo);
        return;
    }

    _localVideo.classList.remove('peer-call-video-screen');
    updateLocalVideoVisibility();
}

function updateLocalVideoVisibility() {
    if (!_localVideo || !_videoGrid || _screenShareStream) return;

    const hasVideo = hasVideoTrack(_localStream);
    _localVideo.style.display = hasVideo ? '' : 'none';

    clearLocalPreviewPlaceholders();
    if (!hasVideo) {
        const placeholder = document.createElement('div');
        placeholder.className = 'peer-call-audio-tile peer-call-local-audio-placeholder';
        placeholder.textContent = 'You · audio only';
        _videoGrid.insertBefore(placeholder, _localVideo);
    } else {
        ensureLocalVideo();
    }
}

function attachStreamToMedia(el, stream) {
    el.srcObject = stream;
    el.play().catch(() => {});
}

function attachStreamToVideo(videoEl, stream) {
    attachStreamToMedia(videoEl, stream);
}

function hasVideoTrack(stream) {
    return !!stream?.getVideoTracks().length;
}

function ensureLocalVideo() {
    if (!_localVideo || !_localStream || !hasVideoTrack(_localStream)) return;
    attachStreamToVideo(_localVideo, _localStream);
}

function findFirstRemoteVideoPeerId() {
    for (const [peerId, entry] of _remotes) {
        if (entry.video && entry.stream && hasVideoTrack(entry.stream)) {
            return peerId;
        }
    }
    return null;
}

function createRemoteVideoWrap(peerId) {
    const wrap = document.createElement('div');
    wrap.className = 'peer-call-remote-wrap';

    const video = document.createElement('video');
    video.className = 'peer-call-video peer-call-video-remote';
    video.autoplay = true;
    video.playsInline = true;
    video.title = peerId;

    const fsBtn = document.createElement('button');
    fsBtn.type = 'button';
    fsBtn.className = 'peer-call-fs-btn';
    fsBtn.title = 'Fullscreen';
    fsBtn.textContent = '\u26F6';
    fsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        enterRemoteFullscreen(peerId);
    });

    video.addEventListener('dblclick', () => enterRemoteFullscreen(peerId));

    wrap.appendChild(video);
    wrap.appendChild(fsBtn);
    _videoGrid.appendChild(wrap);

    return { wrap, video };
}

function _onFullscreenKeydown(e) {
    if (e.key !== 'Escape' || !_fullscreenPeerId) return;
    exitRemoteFullscreen();
}

function enterRemoteFullscreen(peerId) {
    initPeerCall();
    _createFullscreenOverlay();

    const entry = _remotes.get(peerId);
    if (!entry?.video || !entry.stream || !hasVideoTrack(entry.stream)) return;

    _fullscreenPeerId = peerId;
    if (_fullscreenLabel) {
        _fullscreenLabel.textContent = peerId.slice(0, 24);
    }
    attachStreamToVideo(_fullscreenVideoEl, entry.stream);
    _fullscreenOverlay.hidden = false;
}

function exitRemoteFullscreen() {
    if (!_fullscreenOverlay) return;

    _fullscreenPeerId = null;
    if (_fullscreenVideoEl) {
        _fullscreenVideoEl.srcObject = null;
    }
    _fullscreenOverlay.hidden = true;
}

function addRemoteMedia(peerId, stream) {
    const showVideo = hasVideoTrack(stream);
    let entry = _remotes.get(peerId);

    if (!entry) {
        if (showVideo) {
            const { wrap, video } = createRemoteVideoWrap(peerId);
            entry = { wrap, video };
        } else {
            const tile = document.createElement('div');
            tile.className = 'peer-call-audio-tile';
            tile.title = peerId;
            tile.textContent = `${peerId.slice(0, 16)} · audio`;

            const audio = document.createElement('audio');
            audio.autoplay = true;
            audio.playsInline = true;
            tile.appendChild(audio);
            _videoGrid.appendChild(tile);
            entry = { tile, audio };
        }
        _remotes.set(peerId, entry);
    } else if (showVideo && !entry.video) {
        entry.tile?.remove();
        entry.audio = undefined;
        entry.tile = undefined;

        const { wrap, video } = createRemoteVideoWrap(peerId);
        entry.wrap = wrap;
        entry.video = video;
    } else if (!showVideo && !entry.audio) {
        const tile = document.createElement('div');
        tile.className = 'peer-call-audio-tile';
        tile.title = peerId;
        tile.textContent = `${peerId.slice(0, 16)} · audio`;

        const audio = document.createElement('audio');
        audio.autoplay = true;
        audio.playsInline = true;
        tile.appendChild(audio);
        entry.wrap?.remove();
        entry.video = undefined;
        entry.wrap = undefined;
        entry.tile = tile;
        entry.audio = audio;
        _videoGrid.appendChild(tile);
    }

    entry.stream = stream;
    if (showVideo && entry.video) {
        attachStreamToVideo(entry.video, stream);
        if (_fullscreenPeerId === peerId && _fullscreenVideoEl) {
            attachStreamToVideo(_fullscreenVideoEl, stream);
        }
    } else if (entry.audio) {
        attachStreamToMedia(entry.audio, stream);
    }

    updateMediaButtons();
}

function getOutboundVideoTrack() {
    if (_screenShareTrack) return _screenShareTrack;
    const camera = _localStream?.getVideoTracks()[0];
    if (!camera || !camera.enabled) return null;
    return camera;
}

function getOutboundMediaStream() {
    const stream = new MediaStream();
    if (_localStream) {
        for (const track of _localStream.getAudioTracks()) {
            stream.addTrack(track);
        }
    }
    const videoTrack = getOutboundVideoTrack();
    if (videoTrack) {
        stream.addTrack(videoTrack);
    }
    return stream;
}

function bindRemoteStream(peerId, stream) {
    const refresh = () => {
        addRemoteMedia(peerId, stream);
        setStatus('Connected');
    };
    refresh();
    stream.onaddtrack = refresh;
    stream.onremovetrack = refresh;
}

function setupCallHandlers(remoteId, call) {
    call.on('stream', (remoteStream) => {
        bindRemoteStream(remoteId, remoteStream);
    });
    call.on('close', () => {
        removeRemoteMedia(remoteId);
        _remotes.delete(remoteId);
    });
    call.on('error', () => {
        removeRemoteMedia(remoteId);
        _remotes.delete(remoteId);
    });
}

function removeRemoteMedia(peerId) {
    if (_fullscreenPeerId === peerId) {
        exitRemoteFullscreen();
    }

    const entry = _remotes.get(peerId);
    if (!entry) return;
    entry.wrap?.remove();
    entry.tile?.remove();
    _remotes.delete(peerId);
    updateMediaButtons();
}

async function replaceOutboundVideoTrack(videoTrack) {
    if (!_localStream) return;

    const tasks = [];
    for (const [, entry] of _remotes) {
        const pc = entry.call?.peerConnection;
        if (!pc) continue;

        const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
        if (videoSender) {
            tasks.push(videoSender.replaceTrack(videoTrack));
        } else if (videoTrack) {
            pc.addTrack(videoTrack, _localStream);
        }
    }

    const results = await Promise.allSettled(tasks);
    for (const result of results) {
        if (result.status === 'rejected') {
            console.warn('replaceTrack failed:', result.reason);
        }
    }
}

async function refreshOutboundCalls() {
    if (!_peer || !_localStream) return;

    const outbound = getOutboundMediaStream();
    const peerIds = [..._remotes.keys()];

    for (const remoteId of peerIds) {
        const entry = _remotes.get(remoteId);
        if (!entry?.call) continue;

        try {
            entry.call.close();
        } catch {
            // ignore
        }
        _remotes.delete(remoteId);

        const call = _peer.call(remoteId, outbound);
        if (!call) continue;

        setupCallHandlers(remoteId, call);
        _remotes.set(remoteId, { call });
    }
}

async function stopScreenShare({ fullCleanup = false } = {}) {
    if (!_screenShareTrack && !_screenShareStream) {
        return;
    }

    const track = _screenShareTrack;
    _screenShareTrack = null;
    if (track) {
        track.onended = null;
        if (_localStream?.getVideoTracks().includes(track)) {
            _localStream.removeTrack(track);
        }
        track.stop();
    }

    if (_screenShareStream) {
        for (const t of _screenShareStream.getTracks()) {
            if (t !== track) t.stop();
        }
        _screenShareStream = null;
    }

    if (_cameraTrackBackup) {
        if (!fullCleanup && _localStream) {
            if (!_localStream.getVideoTracks().includes(_cameraTrackBackup)) {
                _localStream.addTrack(_cameraTrackBackup);
            }
            const outboundTrack = _cameraTrackBackup.enabled ? _cameraTrackBackup : null;
            await replaceOutboundVideoTrack(outboundTrack);
            await refreshOutboundCalls();
        } else {
            _cameraTrackBackup.stop();
        }
        _cameraTrackBackup = null;
    } else if (!fullCleanup) {
        await replaceOutboundVideoTrack(null);
        await refreshOutboundCalls();
    }

    if (_localVideo && !_screenShareStream) {
        _localVideo.srcObject = null;
    }

    updateLocalPreview();
    updateMediaButtons();

    if (_currentRoomId && !fullCleanup) {
        setStatus('Connected');
    }
}

async function startScreenShare() {
    if (!_currentRoomId || _screenShareTrack) return;

    try {
        const { stream, track } = await acquireLiveDisplayStream();

        const cameraTrack = _localStream?.getVideoTracks()[0];
        if (cameraTrack) {
            _cameraTrackBackup = cameraTrack;
            _localStream.removeTrack(cameraTrack);
        }

        _screenShareStream = stream;
        _screenShareTrack = track;
        track.onended = () => { void stopScreenShare(); };

        _localStream.addTrack(track);
        await refreshOutboundCalls();
        updateLocalPreview();
        setStatus('Sharing screen — prefer sharing the Meshbex tab');
        updateMediaButtons();
    } catch (err) {
        alert(err.message || 'Screen sharing was cancelled.');
        console.warn(err);
    }
}

async function toggleScreenShare() {
    if (_screenShareTrack) {
        await stopScreenShare();
    } else {
        await startScreenShare();
    }
}

async function enableLocalCamera() {
    if (_screenShareTrack) return;
    const existing = _localStream?.getVideoTracks()[0];
    if (existing) {
        existing.enabled = true;
        updateLocalVideoVisibility();
        updateMediaButtons();
        return;
    }

    try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const videoTrack = videoStream.getVideoTracks()[0];
        if (!videoTrack || !_localStream) {
            videoStream.getTracks().forEach((t) => t.stop());
            return;
        }

        _localStream.addTrack(videoTrack);
        replaceOutboundVideoTrack(videoTrack);
        updateLocalVideoVisibility();
        updateMediaButtons();
    } catch (err) {
        alert('Camera access was denied or no camera is available.');
        console.warn(err);
    }
}

async function toggleLocalCamera() {
    if (_screenShareTrack) return;

    const videoTrack = _localStream?.getVideoTracks()[0];
    if (!videoTrack) {
        await enableLocalCamera();
        return;
    }

    videoTrack.enabled = !videoTrack.enabled;
    updateMediaButtons();
}

function getParticipantIds() {
    const ids = new Set(_remotes.keys());
    if (_myPeerId) ids.add(_myPeerId);
    return [...ids];
}

function broadcastMeshSignal(payload, exceptId = null) {
    for (const [id, conn] of _dataConns) {
        if (id === exceptId) continue;
        if (conn.open) conn.send(payload);
    }
}

function handleMeshMessage(fromId, data) {
    if (!data || typeof data !== 'object') return;

    if (data.type === 'participants') {
        for (const id of data.ids || []) {
            if (id !== _myPeerId) connectToPeer(id);
        }
    } else if (data.type === 'join') {
        if (data.id && data.id !== _myPeerId) {
            connectToPeer(data.id);
            if (_isHost) {
                broadcastMeshSignal({ type: 'join', id: data.id }, data.id);
            }
        }
    }
}

function setupDataConnection(conn) {
    _dataConns.set(conn.peer, conn);
    conn.on('data', (data) => handleMeshMessage(conn.peer, data));
    conn.on('close', () => {
        _dataConns.delete(conn.peer);
    });
}

function setupIncomingCall(call) {
    const remoteId = call.peer;
    setupCallHandlers(remoteId, call);
    call.answer(getOutboundMediaStream());

    if (_isHost) {
        const others = getParticipantIds().filter((id) => id !== remoteId && id !== _myPeerId);
        const conn = _peer.connect(remoteId);
        conn.on('open', () => {
            setupDataConnection(conn);
            conn.send({ type: 'participants', ids: others });
            broadcastMeshSignal({ type: 'join', id: remoteId }, remoteId);
        });
    }

    _remotes.set(remoteId, { ...(_remotes.get(remoteId) || {}), call });
}

function connectToPeer(remoteId) {
    if (!_peer || !_localStream || !remoteId) return;
    if (remoteId === _myPeerId || _remotes.has(remoteId)) return;

    setStatus(`Connecting to ${remoteId}…`);
    const call = _peer.call(remoteId, getOutboundMediaStream());
    if (!call) return;

    setupCallHandlers(remoteId, call);

    _remotes.set(remoteId, { ...(_remotes.get(remoteId) || {}), call });
}

async function acquireLocalMedia() {
    if (_localStream) return _localStream;

    let audioStream;
    try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (err) {
        throw new Error('Microphone access is required for PeerJS calls.', { cause: err });
    }

    _localStream = new MediaStream();
    for (const track of audioStream.getAudioTracks()) {
        track.enabled = false;
        _localStream.addTrack(track);
    }

    try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        for (const track of videoStream.getVideoTracks()) {
            _localStream.addTrack(track);
        }
    } catch {
        // Camera optional — audio-only call is fine.
    }

    updateLocalVideoVisibility();
    updateMediaButtons();
    return _localStream;
}

async function releaseLocalMedia() {
    await stopScreenShare({ fullCleanup: true });

    if (_localStream) {
        for (const track of _localStream.getTracks()) {
            track.stop();
        }
        _localStream = null;
    }
    if (_localVideo) {
        _localVideo.srcObject = null;
        _localVideo.classList.remove('peer-call-video-screen');
    }
    clearLocalPreviewPlaceholders();
}

function destroyPeer() {
    for (const [, entry] of _remotes) {
        try {
            entry.call?.close();
        } catch {
            // ignore
        }
    }
    _remotes.clear();

    for (const [, conn] of _dataConns) {
        try {
            conn.close();
        } catch {
            // ignore
        }
    }
    _dataConns.clear();

    if (_peer) {
        _peer.destroy();
        _peer = null;
    }

    _myPeerId = null;
    _isHost = false;
}

function setupPeerEvents(peer) {
    peer.on('open', (id) => {
        _myPeerId = id;
        setStatus('Waiting for participants…');

        if (!_isHost) {
            connectToPeer(_currentRoomId);
        }
    });

    peer.on('call', (call) => {
        setupIncomingCall(call);
    });

    peer.on('connection', (conn) => {
        setupDataConnection(conn);
    });

    peer.on('error', (err) => {
        console.warn('PeerJS error:', err);
        if (_isHost && err.type === 'unavailable-id') {
            setStatus('Room ID taken — joining as guest…');
            _isHost = false;
            destroyPeer();
            joinAsGuest(_currentRoomId);
            return;
        }
        setStatus(`Error: ${err.type || err.message || 'connection failed'}`);
    });

    peer.on('disconnected', () => {
        setStatus('Disconnected — reconnecting…');
        if (!_peer?.destroyed) {
            peer.reconnect();
        }
    });
}

function joinAsGuest(roomId) {
    _isHost = false;
    _peer = new Peer(undefined, buildPeerOptions());
    setupPeerEvents(_peer);
}

function createAsHost(roomId) {
    _isHost = true;
    _peer = new Peer(roomId, buildPeerOptions());
    setupPeerEvents(_peer);
}

function _createDialog() {
    const dlg = document.createElement('dialog');
    dlg.id = 'peer-call-dialog';
    dlg.innerHTML = `
        <div class="peer-call-header">
            <h2>PeerJS call</h2>
            <span id="peer-room-label" class="peer-call-room"></span>
            <span id="peer-status-label" class="peer-call-status"></span>
            <span class="peer-call-header-spacer"></span>
            <button type="button" id="peer-minimize" class="peer-call-btn" title="Minimize">&minus;</button>
            <button type="button" id="peer-mute" class="peer-call-btn">Unmute</button>
            <button type="button" id="peer-camera" class="peer-call-btn">Camera on</button>
            <button type="button" id="peer-screen-share" class="peer-call-btn" disabled>Share screen</button>
            <button type="button" id="peer-fullscreen-header" class="peer-call-btn" disabled>Fullscreen</button>
            <button type="button" id="peer-copy-link" class="peer-call-btn">Copy link</button>
            <button type="button" id="peer-leave" class="peer-call-btn peer-call-btn-leave">Leave</button>
        </div>
        <div class="peer-call-video-wrap">
            <div id="peer-call-video-grid" class="peer-call-video-grid">
                <video id="peer-local-video" class="peer-call-video peer-call-video-local" autoplay playsinline muted></video>
            </div>
        </div>
    `;
    document.body.appendChild(dlg);

    _videoGrid = dlg.querySelector('#peer-call-video-grid');
    _localVideo = dlg.querySelector('#peer-local-video');
    _roomLabel = dlg.querySelector('#peer-room-label');
    _statusLabel = dlg.querySelector('#peer-status-label');
    _minimizeBtn = dlg.querySelector('#peer-minimize');
    _muteBtn = dlg.querySelector('#peer-mute');
    _cameraBtn = dlg.querySelector('#peer-camera');
    _screenShareBtn = dlg.querySelector('#peer-screen-share');
    _fullscreenHeaderBtn = dlg.querySelector('#peer-fullscreen-header');

    _minimizeBtn.addEventListener('click', () => togglePeerCallMinimized());
    dlg.querySelector('#peer-copy-link').addEventListener('click', () => copyPeerInviteLink());
    dlg.querySelector('#peer-leave').addEventListener('click', () => leavePeerCall());
    _screenShareBtn.addEventListener('click', () => toggleScreenShare());
    _fullscreenHeaderBtn.addEventListener('click', () => {
        const peerId = findFirstRemoteVideoPeerId();
        if (peerId) enterRemoteFullscreen(peerId);
    });
    _muteBtn.addEventListener('click', () => {
        const track = _localStream?.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        updateMediaButtons();
    });
    _cameraBtn.addEventListener('click', () => {
        toggleLocalCamera();
    });

    return dlg;
}

function _createFullscreenOverlay() {
    if (_fullscreenOverlay) return;

    const el = document.createElement('div');
    el.id = 'peer-call-fullscreen';
    el.className = 'peer-call-fullscreen';
    el.hidden = true;
    el.innerHTML = `
        <div class="peer-call-fullscreen-header">
            <span id="peer-fullscreen-label" class="peer-call-fullscreen-label"></span>
            <span class="peer-call-header-spacer"></span>
            <button type="button" id="peer-fullscreen-exit" class="peer-call-btn">Exit</button>
        </div>
        <video id="peer-fullscreen-video" autoplay playsinline></video>
    `;
    document.body.appendChild(el);

    _fullscreenOverlay = el;
    _fullscreenVideoEl = el.querySelector('#peer-fullscreen-video');
    _fullscreenLabel = el.querySelector('#peer-fullscreen-label');

    el.querySelector('#peer-fullscreen-exit').addEventListener('click', () => exitRemoteFullscreen());

    if (!_fsEscBound) {
        document.addEventListener('keydown', _onFullscreenKeydown);
        _fsEscBound = true;
    }
}

export function initPeerCall() {
    if (_dialog) return;
    _dialog = _createDialog();
    _createFullscreenOverlay();
}

export function getPeerRoomId() {
    return _currentRoomId;
}

export function buildPeerShareUrl(roomId) {
    const id = sanitizeRoomId(roomId) || _currentRoomId;
    if (!id) return window.location.href;
    return buildShareUrl(id, CALL_TYPE_PEER, { peer: _peerHost });
}

export async function copyPeerInviteLink() {
    const roomId = _currentRoomId;
    if (!roomId) {
        alert('No active call. Start or join a call first.');
        return;
    }

    const url = buildPeerShareUrl(roomId);
    try {
        await navigator.clipboard.writeText(url);
    } catch {
        prompt('Copy this invite link:', url);
    }
}

export function isPeerCallActive() {
    return !!_currentRoomId;
}

export async function startPeerCall(roomId) {
    const { leaveJitsiCall } = await import('./jitsiCall.js');
    leaveJitsiCall();

    initPeerCall();

    const id = sanitizeRoomId(roomId) || _currentRoomId || generateRoomId();
    if (_currentRoomId && _currentRoomId !== id) {
        leavePeerCall();
    }

    _currentRoomId = id;
    syncActiveCallInUrl(id);
    updateRoomLabel();
    setStatus('Starting…');

    for (const [, entry] of _remotes) {
        entry.wrap?.remove();
        entry.tile?.remove();
    }
    _remotes.clear();
    destroyPeer();

    try {
        await acquireLocalMedia();
    } catch (err) {
        alert(err.message || 'Microphone access is required for PeerJS calls.');
        console.warn(err);
        _currentRoomId = null;
        updateRoomLabel();
        clearCallParamsFromUrl();
        return;
    }

    createAsHost(id);

    if (!_dialog.open) {
        _dialog.show();
    }

    setPeerCallMinimized(false);
    updateMediaButtons();
}

export function leavePeerCall() {
    exitRemoteFullscreen();
    destroyPeer();
    void releaseLocalMedia();

    for (const [, entry] of _remotes) {
        entry.wrap?.remove();
        entry.tile?.remove();
    }
    _remotes.clear();

    _currentRoomId = null;
    updateRoomLabel();
    setStatus('');
    clearCallParamsFromUrl();
    setPeerCallMinimized(false);

    if (_screenShareBtn) {
        _screenShareBtn.disabled = true;
        _screenShareBtn.textContent = 'Share screen';
        _screenShareBtn.classList.remove('peer-call-btn-active');
    }
    if (_fullscreenHeaderBtn) {
        _fullscreenHeaderBtn.disabled = true;
    }
    if (_cameraBtn) {
        _cameraBtn.disabled = false;
    }

    if (_dialog?.open) {
        _dialog.close();
    }
}
