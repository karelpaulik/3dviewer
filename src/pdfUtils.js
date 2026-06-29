// pdfUtils.js — shared PDF.js worker + WASM decoder setup (JBig2, OpenJPEG).

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/** @type {string} Trailing slash required by pdf.js. */
const PDFJS_WASM_URL = `${import.meta.env.BASE_URL}wasm/`;

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
