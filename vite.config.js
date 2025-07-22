import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { viteStaticCopy } from 'vite-plugin-static-copy'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
    topLevelAwait(),
    wasm(),
    viteStaticCopy({
      targets: [
        {
          src: ['../../node_modules/tfhe/tfhe_bg.wasm', 'node_modules/tfhe/tfhe_bg.wasm'],
          dest: ''
        }
      ]
    }),
  ],
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  optimizeDeps: {
    exclude: ['cofhejs', 'tfhe'],
    assetsInclude: ['**/*.wasm'],
    esbuildOptions: {
      target: "esnext",
      // Node.js global to browser globalThis
      define: {
        global: "globalThis",
      },
      supported: {
        bigint: true,
      },
      plugins: [

      ]
    },
  },
  build: {
    target: ["esnext"],
    outDir: "./build",
    sourcemap: false, // Disable source maps to save memory
    minify: "terser", // More efficient minification
    chunkSizeWarningLimit: 1000, // Increase,
  },
  server: {
    host: true,
  },
});
