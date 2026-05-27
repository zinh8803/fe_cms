import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // Warn when a chunk exceeds 500 kB
    chunkSizeWarningLimit: 500,
    // Split CSS per chunk so only page-relevant styles are loaded
    cssCodeSplit: true,
    // Inline assets smaller than 4 kB as base64 (default is 4096)
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting:
         * - "vendor"  : vue + vue-router (rarely changes → long-lived browser cache)
         * - "store"   : pinia (changes infrequently)
         * - "http"    : axios (stable third-party)
         * - Everything else → per-route lazy chunks (already done via dynamic import)
         */
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue-router')) return 'vendor-router';
            if (id.includes('pinia'))      return 'vendor-pinia';
            if (id.includes('axios'))      return 'vendor-axios';
            if (id.includes('vue'))        return 'vendor-vue';
            return 'vendor-misc';
          }
        },
      },
    },
  },
  // server: {
  //   host: '0.0.0.0',
  //   port: 5173,
  // }
})
