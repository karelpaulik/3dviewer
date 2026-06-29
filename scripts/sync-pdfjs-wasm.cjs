const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../node_modules/pdfjs-dist/wasm');
const dest = path.join(__dirname, '../public/wasm');

if (!fs.existsSync(src)) {
    console.warn('sync-pdfjs-wasm: pdfjs-dist/wasm not found, skipping');
    process.exit(0);
}

fs.cpSync(src, dest, { recursive: true });
console.log('sync-pdfjs-wasm: copied pdfjs-dist/wasm → public/wasm');
