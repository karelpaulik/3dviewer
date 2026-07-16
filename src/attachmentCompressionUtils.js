// attachmentCompressionUtils.js
// Gzip compression for GLB-embedded attachments (export/import boundary only).

import { gzipSync, gunzipSync } from 'fflate';

const GZIP_LEVEL = 6;

function base64ToUint8Array(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function uint8ArrayToBase64(bytes) {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
}

export function gzipBytes(bytes) {
    return gzipSync(bytes, { level: GZIP_LEVEL });
}

export function gunzipBytes(bytes) {
    return gunzipSync(bytes);
}

function attachmentMeta(att) {
    return {
        id: att.id,
        name: att.name,
        mimeType: att.mimeType,
        size: att.size,
        addedAt: att.addedAt,
        ...(att.comment !== undefined ? { comment: att.comment } : {}),
    };
}

export function serializeAttachmentForGltf(att, prefs) {
    const meta = attachmentMeta(att);

    if (!prefs?.enabled) {
        return { ...meta, data: att.data };
    }

    const originalSize = att.size ?? Math.round(att.data.length * 0.75);
    if (originalSize < (prefs.minBytes ?? 0)) {
        return { ...meta, data: att.data };
    }

    const originalBytes = base64ToUint8Array(att.data);
    const compressed = gzipSync(originalBytes, { level: GZIP_LEVEL });

    if (compressed.length >= originalBytes.length) {
        return { ...meta, data: att.data };
    }

    return {
        ...meta,
        data: uint8ArrayToBase64(compressed),
        encoding: 'gzip',
    };
}

export function normalizeAttachmentFromGltf(att) {
    if (att.encoding !== 'gzip') {
        return att;
    }

    const compressedBytes = base64ToUint8Array(att.data);
    const bytes = gunzipSync(compressedBytes);

    return {
        id: att.id,
        name: att.name,
        mimeType: att.mimeType,
        size: att.size ?? bytes.length,
        addedAt: att.addedAt,
        ...(att.comment !== undefined ? { comment: att.comment } : {}),
        data: uint8ArrayToBase64(bytes),
    };
}

function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function estimateStoredBytes(att) {
    if (att.encoding === 'gzip') {
        return Math.round(att.data.length * 0.75);
    }
    return att.size ?? Math.round(att.data.length * 0.75);
}

export function serializeAttachmentsForExport(store, prefs) {
    const serialized = store.map(att => serializeAttachmentForGltf(att, prefs));

    const fileCount = store.length;
    const totalOriginal = store.reduce((sum, att) => sum + (att.size ?? 0), 0);
    const totalStored = serialized.reduce((sum, att) => sum + estimateStoredBytes(att), 0);
    const compressedCount = serialized.filter(att => att.encoding === 'gzip').length;

    if (fileCount > 5 || totalOriginal > 10 * 1024 * 1024) {
        const saved = totalOriginal > 0
            ? Math.round((1 - totalStored / totalOriginal) * 100)
            : 0;
        console.log(
            `[Attachments] ${fileCount} files, ${formatBytes(totalOriginal)} → ${formatBytes(totalStored)}` +
            ` (${compressedCount} gzip, saved ${saved}%)`
        );
    }

    return serialized;
}
