// vite.config.js
import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

function emitFileIfExists(context, filePath, fileName) {
  const fullPath = resolve(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    context.emitFile({
      type: 'asset',
      fileName,
      source: fs.readFileSync(fullPath),
    });
  } else {
    console.warn(`Warning: ${filePath} is missing`);
  }
}

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
      async generateBundle() {
        const manifest = await import('./src/manifest.json', { with: { type: 'json' } });
        this.emitFile({
          type: 'asset',
          fileName: 'manifest.json',
          source: JSON.stringify(manifest.default, null, 2)
        });
      }
    },
    {
      name: 'copy-assets',
      generateBundle() {
        ['16', '48', '128'].forEach(size => {
          emitFileIfExists(this, `src/assets/icon${size}.png`, `assets/icon${size}.png`);
        });
      }
    },
    {
      name: 'copy-helper-js',
      generateBundle() {
        ['blockPage'].forEach(file_name => {
          emitFileIfExists(this, `src/${file_name}.js`, `${file_name}.js`);
        });
      }
    },
  ]
});