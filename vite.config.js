// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.js'),
        popup: resolve(__dirname, 'src/popup.html'),
        content: resolve(__dirname, 'src/content.js'),
        blockPage: resolve(__dirname, 'src/blockPage.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  plugins: [
    {
      name: 'copy-manifest',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'manifest.json',
          source: JSON.stringify(require('./src/manifest.json'), null, 2)
        });
      }
    },
    {
      name: 'copy-assets',
      generateBundle() {
        // Copy icon files - you would need actual icons in these locations
        ['16', '48', '128'].forEach(size => {
          this.emitFile({
            type: 'asset',
            fileName: `assets/icon${size}.png`,
            source: fs.existsSync(resolve(__dirname, `src/assets/icon${size}.png`)) 
              ? fs.readFileSync(resolve(__dirname, `src/assets/icon${size}.png`)) 
              : (console.warn(`Warning: src/assets/icon${size}.png is missing`), '')
          });
        });
      }
    }
  ]
});