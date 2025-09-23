import { fileURLToPath, URL } from 'node:url';

import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

const plugins: PluginOption[] = [react()];

if (process.env.ANALYZE === 'true') {
  plugins.push(
    visualizer({ filename: 'dist/bundle-report.html', gzipSize: true, brotliSize: true })
  );
}

// https://vite.dev/config/
export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
