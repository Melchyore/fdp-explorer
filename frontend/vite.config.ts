import { defineConfig } from 'vite'

import nodePolyfills from 'rollup-plugin-polyfill-node'

import builtins from 'rollup-plugin-node-builtins'
import globals from 'rollup-plugin-node-globals'

import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  build: {
    polyfillDynamicImport: true,
  },

  define: {
    global: {}
  }
})
