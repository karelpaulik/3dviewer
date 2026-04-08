import { defineConfig } from 'vite'

// Vite plugin: bundles Three.js + addons + gsap into a single IIFE string
// so that HTML exports can embed all libraries inline (fully offline).
function exportLibsBundlePlugin() {
  const virtualId = 'virtual:export-libs-bundle';
  const resolvedVirtualId = '\0' + virtualId;
  let cachedBundle = null;
  let root = '';

  return {
    name: 'export-libs-bundle',
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === virtualId) return resolvedVirtualId;
    },
    async load(id) {
      if (id !== resolvedVirtualId) return;
      if (!cachedBundle) {
        const esbuild = await import('esbuild');
        const result = await esbuild.build({
          stdin: {
            contents: [
              "import * as THREE from 'three';",
              "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';",
              "import { OrbitControls } from 'three/addons/controls/OrbitControls.js';",
              "import gsap from 'gsap';",
              "window.THREE = THREE;",
              "window.GLTFLoader = GLTFLoader;",
              "window.OrbitControls = OrbitControls;",
              "window.gsap = gsap;",
            ].join('\n'),
            resolveDir: root,
            loader: 'js',
          },
          bundle: true,
          format: 'iife',
          write: false,
          minify: true,
        });
        cachedBundle = result.outputFiles[0].text;
      }
      return `export default ${JSON.stringify(cachedBundle)};`;
    }
  };
}

export default defineConfig({
  // Toto zajistí, že cesty v index.html budou začínat tečkou (./assets/...)
  // a projekt bude fungovat v jakémkoli podadresáři
  // Nutno, pokud chci dist použít v jiném projektu
  base: './', 
  
  // build: {
  //   // Volitelné: pokud chceš mít vše v jednom souboru, 
  //   // ale pro Three.js je lepší nechat výchozí nastavení
  // }

  //base: '/3dviewer/',
  build: {
    outDir: 'docs'
  },
  plugins: [exportLibsBundlePlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(require('./package.json').version),
  },
})