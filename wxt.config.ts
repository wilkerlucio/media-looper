import { defineConfig } from 'wxt';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    permissions: ["scripting", "activeTab"],
    externally_connectable: {
      ids: ["*"],
      matches: ["*://*.youtube.com/*"],
    }
  },
  vite: () => ({
    plugins: [
      wasm(),
      topLevelAwait()
    ],
  }),
});
