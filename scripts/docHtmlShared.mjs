// docHtmlShared.mjs
// Shared HTML document rendering helpers for TipTap export and static help build.

export const DOC_DEFAULTS = {
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.4',
    paraSpacing: '8px',
    docWidth: '794px',
    tableBorder: '1px solid #ccc',
};

export function resolveDocStyle(doc) {
    const d = doc || {};
    return {
        fontFamily: d.font || DOC_DEFAULTS.fontFamily,
        lineHeight: d.lineHeight || DOC_DEFAULTS.lineHeight,
        paraSpacing: d.paraSpacing || DOC_DEFAULTS.paraSpacing,
        docWidth: d.docWidth || DOC_DEFAULTS.docWidth,
        tableBorder: d.tableBorder || DOC_DEFAULTS.tableBorder,
    };
}

export function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function stripHtml(html) {
    return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function decodeHtmlEntities(str) {
    return String(str)
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#0*39;/gi, "'")
        .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&amp;/gi, '&');
}

export function headingTextFromHtml(html) {
    return decodeHtmlEntities(stripHtml(html));
}

export function injectHeadingIds(html) {
    let index = 0;
    return String(html || '').replace(/<(h[1-4])(\b[^>]*)>/gi, (match, tag, attrs) => {
        if (/\bid\s*=/.test(attrs)) return match;
        const id = `h-${index++}`;
        return `<${tag}${attrs} id="${id}">`;
    });
}

export function buildTocFromHeadings(html) {
    const contentHtml = injectHeadingIds(html);
    const toc = [];
    const re = /<h([1-4])\b[^>]*\bid="(h-\d+)"[^>]*>([\s\S]*?)<\/h\1>/gi;
    let m;
    while ((m = re.exec(contentHtml)) !== null) {
        toc.push({
            level: parseInt(m[1], 10),
            id: m[2],
            text: headingTextFromHtml(m[3]),
        });
    }
    return { contentHtml, toc };
}

export function buildTocNavHtml(toc, navId = 'docToc') {
    if (!toc || toc.length < 2) return '';
    const items = toc.map(item =>
        `<li class="toc-level-${item.level}"><a href="#${item.id}" data-id="${item.id}">${escapeHtml(item.text)}</a></li>`
    ).join('\n        ');
    return `
    <nav id="${navId}">
      <ul>
        ${items}
      </ul>
    </nav>`;
}

export function buildDocContentWrapperCss(selector, style, extraDeclarations = '') {
    const s = style.fontFamily ? style : resolveDocStyle(style);
    return `${selector} {
    padding: 40px 48px;
    max-width: ${s.docWidth};
    margin: 0 auto;
    background: #fff;
    min-height: 100%;
    color: #111;
    line-height: ${s.lineHeight};
    font-family: ${s.fontFamily};
    font-size: 15px;
    ${extraDeclarations}
}`;
}

export function buildDocContentCss(selector, style) {
    const s = style.fontFamily ? style : resolveDocStyle(style);
    return `${selector} h1 { font-size: 2em; margin: 0.6em 0 0.4em; }
${selector} h2 { font-size: 1.5em; margin: 1em 0 0.3em; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
${selector} h3 { font-size: 1.2em; margin: 0.8em 0 0.3em; }
${selector} h4 { font-size: 1em; margin: 0.6em 0 0.3em; font-weight: 600; }
${selector} p { margin: 0 0 ${s.paraSpacing}; }
${selector} ul, ${selector} ol { padding-left: 2em; margin: 0 0 0.8em; }
${selector} blockquote { border-left: 4px solid #ccc; margin: 0.8em 0; padding: 0.2em 1em; color: #555; }
${selector} img { max-width: 100%; height: auto; display: inline-block; vertical-align: top; margin: 0.4em 4px; }
${selector} a { color: #1a6fc4; text-decoration: underline; }
${selector} a:hover { color: #1254a0; }
${selector} strong { font-weight: 700; }
${selector} em { font-style: italic; }
${selector} code {
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9em;
    background: #f0f0f0;
    padding: 1px 4px;
    border-radius: 3px;
}
${selector} pre {
    background: #f5f5f5;
    padding: 12px 16px;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 13px;
}
${selector} pre code { background: none; padding: 0; }
${selector} table { border-collapse: collapse; width: 100%; margin: 1em 0; table-layout: fixed; }
${selector} td, ${selector} th { border: ${s.tableBorder}; padding: 6px 10px; vertical-align: top; box-sizing: border-box; }
${selector} th { background: #f0f0f0; font-weight: 600; text-align: left; }
${selector} hr { border: none; border-top: 1px solid #ddd; margin: 1.5em 0; }`;
}

export function buildTocShellCss(bodyId, navId, contentWrapId, navExtraDeclarations = '') {
    return `#${bodyId} { display: flex; flex: 1; min-height: 0; overflow: hidden; }
#${navId} { width: 240px; flex-shrink: 0; overflow-y: auto; background: #222; border-right: 1px solid #444; padding: 10px 0; ${navExtraDeclarations} }
#${navId} ul { list-style: none; margin: 0; padding: 0; }
#${navId} li { margin: 0; }
#${navId} a { display: block; padding: 4px 14px; color: #bbb; text-decoration: none; font-size: 12px; border-left: 3px solid transparent; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.5; transition: background 0.1s, color 0.1s; }
#${navId} a:hover { background: rgba(255,255,255,0.07); color: #fff; }
#${navId} a.active { border-left-color: #5af; color: #5af; background: rgba(85,170,255,0.08); }
#${navId} .toc-level-1 > a { font-weight: 600; padding-left: 8px; color: #ddd; }
#${navId} .toc-level-2 > a { padding-left: 22px; }
#${navId} .toc-level-3 > a { padding-left: 36px; font-size: 11px; color: #999; }
#${navId} .toc-level-4 > a { padding-left: 50px; font-size: 11px; color: #888; }
#${contentWrapId} { flex: 1; overflow-y: auto; background: #c8c8c8; }
#${contentWrapId}::-webkit-scrollbar { width: 8px; }
#${contentWrapId}::-webkit-scrollbar-track { background: #b0b0b0; }
#${contentWrapId}::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
#${navId}::-webkit-scrollbar { width: 6px; }
#${navId}::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }`;
}

export function buildTocToggleButtonHtml(btnId = 'staticTocToggleBtn') {
    return `<button type="button" id="${btnId}" title="Toggle contents" aria-label="Toggle table of contents">
    <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
        <rect y="0" width="18" height="2" rx="1"/>
        <rect y="6" width="18" height="2" rx="1"/>
        <rect y="12" width="18" height="2" rx="1"/>
    </svg>
</button>`;
}

export function buildTocToggleCss(navId, toggleBtnId) {
    return `#${toggleBtnId} {
    flex-shrink: 0;
    background: none;
    border: 1px solid #555;
    border-radius: 4px;
    color: #ccc;
    cursor: pointer;
    padding: 5px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
}
#${toggleBtnId}:hover { background: #3a3a3a; color: #fff; }
#${navId} { transition: width 0.25s, padding 0.25s, border-color 0.25s; }
#${navId}.toc-hidden {
    width: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    border-right-color: transparent !important;
}`;
}

export function buildTocToggleScript(navId, toggleBtnId, storageKey = 'staticHelpTocHidden') {
    return `(function(){
  var tocEl = document.getElementById('${navId}');
  var toggleBtn = document.getElementById('${toggleBtnId}');
  if (!tocEl || !toggleBtn) return;
  if (localStorage.getItem('${storageKey}') === '1') tocEl.classList.add('toc-hidden');
  toggleBtn.addEventListener('click', function(){
    var hiding = !tocEl.classList.contains('toc-hidden');
    tocEl.classList.toggle('toc-hidden', hiding);
    localStorage.setItem('${storageKey}', hiding ? '1' : '0');
  });
})();`;
}

export function buildTocScrollSpyScript(contentSelector, navId = 'docToc', contentWrapId = 'docContentWrap') {
    return `(function(){
  var tocLinks = Array.from(document.querySelectorAll('#${navId} a'));
  var contentWrap = document.getElementById('${contentWrapId}');
  if (!contentWrap || tocLinks.length === 0) return;
  var headings = Array.from(document.querySelectorAll('${contentSelector} h1,${contentSelector} h2,${contentSelector} h3,${contentSelector} h4'));
  tocLinks.forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var target = document.getElementById(a.dataset.id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  function setActive(id){
    tocLinks.forEach(function(a){ a.classList.toggle('active', a.dataset.id === id); });
  }
  if (headings.length > 0) setActive(headings[0].id);
  contentWrap.addEventListener('scroll', function(){
    var top = contentWrap.getBoundingClientRect().top + 100;
    var activeId = headings[0] ? headings[0].id : null;
    headings.forEach(function(h){ if (h.getBoundingClientRect().top <= top) activeId = h.id; });
    if (activeId) setActive(activeId);
  }, { passive: true });
})();`;
}
