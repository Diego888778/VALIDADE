import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';

// Após o build, grava no sw.js a lista de arquivos para funcionar offline.
const swPrecache = () => ({
  name: 'sw-precache', apply: 'build',
  closeBundle() {
    const files = fs.readdirSync('dist/assets').map((f) => './assets/' + f);
    const sw = fs.readFileSync('dist/sw.js', 'utf8').replace('/*ASSETS*/[]', JSON.stringify(files)).replace('__V__', Date.now());
    fs.writeFileSync('dist/sw.js', sw);
  },
});
export default defineConfig({ base: './', plugins: [react(), swPrecache()], test: { environment: 'node' } });
