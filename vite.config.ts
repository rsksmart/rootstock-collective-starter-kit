import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createRequire } from "node:module";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

const require = createRequire(import.meta.url);
const collectiveSdkInstalled = (() => {
  try {
    require.resolve("@rootstockcollective/collective-sdk");
    return true;
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    const code = err?.code ?? "UNKNOWN";
    console.warn(`[Vite] @rootstockcollective/collective-sdk not found (${code}). Using stub. Run npm install.`);
    return false;
  }
})();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      external: collectiveSdkInstalled ? [] : ["@rootstockcollective/collective-sdk"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      ...(collectiveSdkInstalled
        ? {}
        : { "@rootstockcollective/collective-sdk": path.resolve(__dirname, "src/lib/collectiveSdkPlaceholder.ts") }),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [NodeGlobalsPolyfillPlugin({ process: true, buffer: true })],
    },
  },
});
