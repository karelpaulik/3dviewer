import { defineConfig } from 'vite'

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
  }

})