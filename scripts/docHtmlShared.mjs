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
            text: stripHtml(m[3]),
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

export function buildTocScrollSpyScript(contentSelector, navId = 'docToc') {
    return `(function(){
  var tocLinks = Array.from(document.querySelectorAll('#${navId} a'));
  var contentWrap = document.getElementById('docContentWrap');
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
