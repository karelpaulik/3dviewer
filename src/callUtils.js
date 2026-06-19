// callUtils.js — shared room ID and URL helpers for call modules.

export const CALL_TYPE_JITSI = 'jitsi';
export const CALL_TYPE_PEER = 'peer';

const ROOM_ID_RE = /^[a-zA-Z0-9_-]{4,64}$/;
export const DOMAIN_RE = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;

export function generateRoomId() {
    const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 10);
    return `bedobe-${suffix}`;
}

export function sanitizeRoomId(roomId) {
    if (!roomId || !ROOM_ID_RE.test(roomId)) {
        return null;
    }
    return roomId;
}

export function sanitizeHostname(input) {
    if (!input || typeof input !== 'string') return null;

    let value = input.trim();
    if (!value) return null;

    value = value.replace(/^https?:\/\//i, '');
    value = value.split('/')[0].split('?')[0].split('#')[0];
    value = value.replace(/:\d+$/, '');
    value = value.toLowerCase();

    if (!DOMAIN_RE.test(value)) return null;
    return value;
}

export function applyUrlParams(params) {
    const query = params.toString();
    history.replaceState(null, '', query ? `${location.pathname}?${query}` : location.pathname);
}

export function buildShareUrl(roomId, callType, extraParams = {}) {
    const id = sanitizeRoomId(roomId);
    if (!id) return window.location.href;

    const params = new URLSearchParams(window.location.search);
    params.set('room', id);
    params.delete('jitsi');
    params.delete('peer');
    params.delete('call');

    if (callType === CALL_TYPE_JITSI) {
        if (extraParams.jitsi) params.set('jitsi', extraParams.jitsi);
    } else if (callType === CALL_TYPE_PEER) {
        params.set('call', CALL_TYPE_PEER);
        if (extraParams.peer) params.set('peer', extraParams.peer);
    }

    return `${window.location.origin}${window.location.pathname}?${params}`;
}

export function clearCallParamsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    params.delete('room');
    params.delete('jitsi');
    params.delete('peer');
    params.delete('call');
    applyUrlParams(params);
}
