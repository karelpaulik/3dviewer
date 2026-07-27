// pdfUtils.js — shared PDF.js worker + WASM decoder setup (JBig2, OpenJPEG).

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Absolute path: public/wasm/ is always served from the site root, regardless
// of which HTML entry point (landing page vs. /app/) loaded this script, so
// import.meta.env.BASE_URL (a single build-time constant shared by both) is
// not reliable here.
/** @type {string} Trailing slash required by pdf.js. */
const PDFJS_WASM_URL = '/wasm/';

/**
 * Load a PDF document from raw bytes with WASM image decoders enabled.
 * @param {Uint8Array} bytes
 * @returns {Promise<import('pdfjs-dist').PDFDocumentProxy>}
 */
export function loadPdfDocument(bytes) {
    return pdfjsLib.getDocument({
        data: bytes.slice(),
        wasmUrl: PDFJS_WASM_URL,
    }).promise;
}
