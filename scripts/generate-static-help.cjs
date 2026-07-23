// generate-static-help.cjs
//
// Generates fully static, crawlable HTML pages for the "public" help documents
// (the ones listed in the app's Help menu) from their JSON source files in
// public/help/. Unlike public/help.html (which fetches the JSON via JS at
// runtime), these pages embed the content directly in the HTML so that any
// crawler - not just ones that execute JavaScript - can index them.
//
// The JSON files remain the single source of truth (edited via the in-app
// Docs editor / help.json import-export). Re-run this script (or `npm run
// build`, which runs it automatically) after editing any of the JSON files
// below to regenerate the matching static page.

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://meshbex.com';
const HELP_DIR = path.join(__dirname, '../public/help');

// Only the "main" guides shown in the top-level Help menu (src/main.js) get a
// static page. The "Panels" sub-menu JSONs are short, contextual UI tooltips
// and are intentionally left dynamic-only (see project SEO discussion).
const SLUGS = [
    'guide-for-beginners',
    'users-guide-3d-models',
    'screen-layout',
    'controls',
    'supported-file-formats',
    'pwa-install',
];

function truncate(str, maxLen) {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 1).trimEnd() + '\u2026';
}

function buildPage(doc, slug, docHtml) {
    const {
        resolveDocStyle,
        escapeHtml,
        stripHtml,
        buildDocContentCss,
        buildDocContentWrapperCss,
        buildTocFromHeadings,
        buildTocNavHtml,
        buildTocShellCss,
        buildTocScrollSpyScript,
        buildTocToggleButtonHtml,
        buildTocToggleCss,
        buildTocToggleScript,
    } = docHtml;

    const title = (doc.title || slug).trim();
    const description = (doc.description && doc.description.trim())
        ? doc.description.trim()
        : truncate(stripHtml(doc.content || ''), 155);
    const pageTitle = `${title} \u2013 Meshbex Help`;
    const canonical = `${SITE_URL}/help/${slug}.html`;
    const ogImage = `${SITE_URL}/icon-512.png`;

    const safeTitle = escapeHtml(pageTitle);
    const safeDescription = escapeHtml(description);
    const style = resolveDocStyle(doc);
    const { contentHtml, toc } = buildTocFromHeadings(doc.content || '');
    const hasToc = toc.length >= 2;
    const tocHtml = hasToc ? buildTocNavHtml(toc, 'staticHelpToc') : '';
    const contentCss = buildDocContentCss('#staticHelpContent', style);

    const wrapperExtra = hasToc
        ? 'margin: 0 auto;\n    min-height: 100%;'
        : 'margin: 24px auto 64px;\n    min-height: auto;\n    border-radius: 4px;';
    const wrapperCss = buildDocContentWrapperCss('#staticHelpContent', style, wrapperExtra);
    const tocShellCss = hasToc
        ? buildTocShellCss('staticHelpBody', 'staticHelpToc', 'staticHelpContentWrap', 'font-family: Arial, sans-serif;')
        : '';
    const tocToggleCss = hasToc ? buildTocToggleCss('staticHelpToc', 'staticTocToggleBtn') : '';

    const bodyLayoutCss = hasToc
        ? `html, body { height: 100%; }
body { display: flex; flex-direction: column; overflow: hidden; }`
        : '';

    const headerHtml = hasToc
        ? `<div id="staticHelpHeader">
    ${buildTocToggleButtonHtml('staticTocToggleBtn')}
    <a class="staticHelpHeaderHome" href="/">\u2190 Meshbex CAD Explorer</a>
</div>`
        : `<div id="staticHelpHeader">
    <a class="staticHelpHeaderHome" href="/">\u2190 Meshbex CAD Explorer</a>
</div>`;

    const bodyContent = hasToc
        ? `<div id="staticHelpBody">
  ${tocHtml}
  <div id="staticHelpContentWrap">
    <main id="staticHelpContent">${contentHtml}</main>
  </div>
</div>
<script>
${buildTocScrollSpyScript('#staticHelpContent', 'staticHelpToc', 'staticHelpContentWrap')}
${buildTocToggleScript('staticHelpToc', 'staticTocToggleBtn')}
<\/script>`
        : `<main id="staticHelpContent">${contentHtml}</main>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title>
<meta name="description" content="${safeDescription}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">

<meta property="og:type" content="article">
<meta property="og:site_name" content="Meshbex">
<meta property="og:title" content="${safeTitle}">
<meta property="og:description" content="${safeDescription}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">

<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${safeTitle}">
<meta name="twitter:description" content="${safeDescription}">
<meta name="twitter:image" content="${ogImage}">

<link rel="icon" type="image/png" href="/favicon-32x32.png">
<style>
*, *::before, *::after { box-sizing: border-box; }
html, body {
    margin: 0;
    padding: 0;
    background: #1a1a1a;
    color: #ddd;
}
${bodyLayoutCss}
#staticHelpHeader {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    background: #2a2a2a;
    border-bottom: 1px solid #444;
    flex-shrink: 0;
}
.staticHelpHeaderHome {
    margin-left: auto;
    color: #5af;
    text-decoration: none;
    font-size: 13px;
}
.staticHelpHeaderHome:hover { text-decoration: underline; }
${tocToggleCss}
${tocShellCss}
${wrapperCss}
${contentCss}
</style>
</head>
<body>
${headerHtml}
${bodyContent}
</body>
</html>
`;
}

async function main() {
    const docHtml = await import('./docHtmlShared.mjs');
    let failures = 0;
    for (const slug of SLUGS) {
        const jsonPath = path.join(HELP_DIR, `${slug}.json`);
        const outPath = path.join(HELP_DIR, `${slug}.html`);
        try {
            const raw = fs.readFileSync(jsonPath, 'utf8');
            const doc = JSON.parse(raw);
            const html = buildPage(doc, slug, docHtml);
            fs.writeFileSync(outPath, html, 'utf8');
            console.log(`generate-static-help: wrote public/help/${slug}.html`);
        } catch (err) {
            failures++;
            console.warn(`generate-static-help: failed for "${slug}": ${err.message}`);
        }
    }
    if (failures > 0) {
        console.warn(`generate-static-help: ${failures} file(s) failed, continuing build.`);
    }
}

main().catch(err => {
    console.error('generate-static-help:', err);
    process.exit(1);
});
