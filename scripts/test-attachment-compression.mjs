/**
 * Tests for attachment gzip compression (GLB export/import boundary).
 * Run: node scripts/test-attachment-compression.mjs
 */
import {
    gzipBytes,
    gunzipBytes,
    serializeAttachmentForGltf,
    normalizeAttachmentFromGltf,
    serializeAttachmentsForExport,
} from '../src/attachmentCompressionUtils.js';

function assert(cond, msg) {
    if (!cond) throw new Error(msg);
}

function uint8ArrayToBase64(bytes) {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
}

function base64ToUint8Array(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

// Round-trip gzip/gunzip on synthetic text
const text = new TextEncoder().encode('Hello attachment compression '.repeat(200));
const gz = gzipBytes(text);
const restored = gunzipBytes(gz);
assert(restored.length === text.length, 'gzip round-trip length');
assert(restored[0] === text[0] && restored[restored.length - 1] === text[text.length - 1], 'gzip round-trip bytes');

// Round-trip on minimal PDF-like buffer
const pdfHeader = new TextEncoder().encode('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n' + 'x'.repeat(5000));
const gzPdf = gzipBytes(pdfHeader);
const restoredPdf = gunzipBytes(gzPdf);
assert(restoredPdf.length === pdfHeader.length, 'pdf-like gzip round-trip');

const prefsEnabled = { enabled: true, minBytes: 4096 };
const prefsDisabled = { enabled: false, minBytes: 4096 };

const compressibleAtt = {
    id: 'a1',
    name: 'notes.txt',
    mimeType: 'text/plain',
    size: text.length,
    addedAt: '2026-01-01T00:00:00.000Z',
    data: uint8ArrayToBase64(text),
};

const serialized = serializeAttachmentForGltf(compressibleAtt, prefsEnabled);
assert(serialized.encoding === 'gzip', 'large text should be gzip encoded');
assert(serialized.size === compressibleAtt.size, 'size preserves original');

const normalized = normalizeAttachmentFromGltf(serialized);
assert(!normalized.encoding, 'normalized attachment has no encoding field');
assert(normalized.data === compressibleAtt.data, 'normalize restores original base64');

// minBytes skip
const smallAtt = {
    id: 'a2',
    name: 'tiny.txt',
    mimeType: 'text/plain',
    size: 100,
    addedAt: '2026-01-01T00:00:00.000Z',
    data: uint8ArrayToBase64(new TextEncoder().encode('small')),
};
const smallSerialized = serializeAttachmentForGltf(smallAtt, prefsEnabled);
assert(!smallSerialized.encoding, 'small file below minBytes skips compression');

// disabled prefs
const disabledSerialized = serializeAttachmentForGltf(compressibleAtt, prefsDisabled);
assert(!disabledSerialized.encoding, 'disabled prefs skip compression');

// legacy import (no encoding)
const legacyAtt = {
    id: 'legacy',
    name: 'old.bin',
    mimeType: 'application/octet-stream',
    size: 4,
    addedAt: '2025-01-01T00:00:00.000Z',
    data: uint8ArrayToBase64(new Uint8Array([1, 2, 3, 4])),
};
const legacyNormalized = normalizeAttachmentFromGltf(legacyAtt);
assert(legacyNormalized.data === legacyAtt.data, 'legacy import unchanged');

// compressed >= original skip: random bytes rarely compress well when tiny
const randomBytes = crypto.getRandomValues(new Uint8Array(5000));
const randomAtt = {
    id: 'a3',
    name: 'random.bin',
    mimeType: 'application/octet-stream',
    size: randomBytes.length,
    addedAt: '2026-01-01T00:00:00.000Z',
    data: uint8ArrayToBase64(randomBytes),
};
const randomSerialized = serializeAttachmentForGltf(randomAtt, prefsEnabled);
if (randomSerialized.encoding === 'gzip') {
    const stored = base64ToUint8Array(randomSerialized.data);
    assert(stored.length < randomBytes.length, 'if gzip used, must be smaller');
} else {
    assert(true, 'random data skipped when gzip would not help');
}

// batch export helper
const batch = serializeAttachmentsForExport([compressibleAtt, smallAtt], prefsEnabled);
assert(batch.length === 2, 'batch export returns all attachments');
assert(batch[0].encoding === 'gzip', 'batch first item compressed');
assert(!batch[1].encoding, 'batch second item skipped');

console.log('test-attachment-compression: all passed');
