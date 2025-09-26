import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

const plugins: PluginOption[] = [react()]

if (process.env.ANALYZE === 'true') {
  plugins.push(
    visualizer({ filename: 'dist/bundle-report.html', gzipSize: true, brotliSize: true })
  )
}

// 👉 Set this to your PC's LAN IP for the most reliable mobile HMR.
//    You can find it with `ipconfig` (IPv4 Address).
const LAN_IP = process.env.LAN_IP || undefined   // e.g. "192.168.1.23"

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,          // listen on 0.0.0.0 (expose to LAN)
    port: 5173,
    strictPort: true,
    open: false,
    // HMR over LAN (works even on mobile)
    hmr: LAN_IP ? { host: LAN_IP } : true,
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
  },
})
