import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
       '@': path.resolve(__dirname, './src'),
       'tweetnacl': 'tweetnacl/nacl-fast.js',
    }
  },
  assetsInclude: ['**/*.wasm'],
  optimizeDeps: {
    exclude: ['cofhejs', 'tfhe'],
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
    sourcemap: true, // Disable source maps to save memory
    minify: "terser", // More efficient minification
    chunkSizeWarningLimit: 1000, // Increase,
  },
  server: {
    host: true,
  },
});
