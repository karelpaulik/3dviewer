# 3dviewer

# run test server
npx vite

# create production build
npm run build

`npm run build` runs `prebuild` first, which regenerates the static SEO
pages for the public Help guides (`public/help/*.html`) from their
`public/help/*.json` source before running `vite build`. Run
`npm run generate:help` on its own if you only want to regenerate those
static pages (e.g. after editing help content) without a full build.
If you use `npx vite build` directly, remember to run
`npm run generate:help` first or the static help pages will go stale.

Note:
'''
Before was:
npx vite build - this build does not regenerate static help

npm run build - does 2 things:
- npm run generate:help
- npx vite build
'''

Po přesunu do **nuxtfirebase** web aplikace nezapomenout přejmenovat: stl_viewer_34.html -> index.html
FileItem.vue
'''
const VIEWER_PAGE_PATH = '/3dviewer/stl_viewer_34.html'; 
'''

# Favicon:
14.4.2026
This favicon was generated using the following font:

- Web: https://favicon.io/favicon-generator/
- Font Title: Akshar
- Font Author: undefined
- Font Source: https://fonts.gstatic.com/s/akshar/v16/Yq6I-LyHWTfz9rGoqDaUbHvhkAUsSXYFy9CY94XsnPc.ttf
- Font License: undefined)
