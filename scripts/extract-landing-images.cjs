// extract-landing-images.cjs
//
// One-off helper: pulls screenshots that are already embedded as base64 PNGs
// inside the in-app help JSON files (public/help/*.json) and writes them out
// as plain PNG files under public/landing/, so the marketing landing page can
// reuse real product screenshots without creating new assets.
//
// Usage:
//   node scripts/extract-landing-images.cjs            -> lists every embedded
//                                                          image with its alt
//                                                          text / caption and
//                                                          a candidate index
//   node scripts/extract-landing-images.cjs --dump     -> also writes every
//                                                          candidate to
//                                                          public/landing/_candidates/
//                                                          for manual review
//
// This script is not part of the build; it is run manually whenever the
// landing page screenshots need to be refreshed.

const fs = require('fs');
const path = require('path');

const HELP_DIR = path.join(__dirname, '../public/help');
const OUT_DIR = path.join(__dirname, '../public/landing');
const CANDIDATES_DIR = path.join(OUT_DIR, '_candidates');

const SOURCE_FILES = [
    'guide-for-beginners.json',
    'screen-layout.json',
    'users-guide-3d-models.json',
];

// Hand-picked after visually reviewing the `--dump` output once. Indices refer
// to the flattened, in-order list printed by this script (SOURCE_FILES order).
const FINAL_SELECTION = [
    { index: 7, output: 'hero-ui.png' },
    { index: 3, output: 'feature-section.png' },
    { index: 4, output: 'feature-assembly.png' },
    { index: 6, output: 'feature-annotations.png' },
];

const IMG_RE = /<img\b[^>]*?\bsrc="data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)"[^>]*?>/g;
const ATTR_RE = /(\w+)="([^"]*)"/g;
const CAPTION_RE = /<p>(Pic\.?\s*\d+\.[^<]*)<\/p>/;

function parseAttrs(tag) {
    const attrs = {};
    let m;
    ATTR_RE.lastIndex = 0;
    while ((m = ATTR_RE.exec(tag))) {
        attrs[m[1]] = m[2];
    }
    return attrs;
}

function extractFromFile(fileName) {
    const filePath = path.join(HELP_DIR, fileName);
    const raw = fs.readFileSync(filePath, 'utf8');
    const doc = JSON.parse(raw);
    const content = doc.content || '';

    const results = [];
    let match;
    IMG_RE.lastIndex = 0;
    while ((match = IMG_RE.exec(content))) {
        const [fullTag, ext, base64] = match;
        const attrs = parseAttrs(fullTag);
        const after = content.slice(match.index + fullTag.length, match.index + fullTag.length + 200);
        const captionMatch = after.match(CAPTION_RE);
        results.push({
            source: fileName,
            ext,
            base64,
            alt: attrs.alt || '',
            caption: captionMatch ? captionMatch[1].trim() : '',
        });
    }
    return results;
}

function main() {
    const dump = process.argv.includes('--dump');
    const final = process.argv.includes('--final');
    const all = SOURCE_FILES.flatMap(extractFromFile);

    console.log(`Found ${all.length} embedded image(s) across ${SOURCE_FILES.length} help file(s):\n`);
    all.forEach((img, i) => {
        console.log(`[${i}] ${img.source} — alt="${img.alt}" caption="${img.caption}"`);
    });

    if (dump) {
        fs.mkdirSync(CANDIDATES_DIR, { recursive: true });
        all.forEach((img, i) => {
            const outPath = path.join(CANDIDATES_DIR, `${i}.${img.ext}`);
            fs.writeFileSync(outPath, Buffer.from(img.base64, 'base64'));
        });
        console.log(`\nWrote ${all.length} candidate image(s) to ${path.relative(process.cwd(), CANDIDATES_DIR)}/`);
    }

    if (final) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
        FINAL_SELECTION.forEach(({ index, output }) => {
            const img = all[index];
            if (!img) throw new Error(`No image at index ${index}`);
            fs.writeFileSync(path.join(OUT_DIR, output), Buffer.from(img.base64, 'base64'));
        });
        console.log(`\nWrote ${FINAL_SELECTION.length} final landing image(s) to ${path.relative(process.cwd(), OUT_DIR)}/`);
    }
}

main();
