import { defineConfig } from 'wxt';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    permissions: ["storage"],
    web_accessible_resources: [
      {
        resources: ["dashboard.html"],
        matches: ["*://*.youtube.com/*"]
      }
    ]
  },
  vite: () => ({
    plugins: [
      wasm(),
      topLevelAwait()
    ],
  }),
  runner: {
    chromiumArgs: ['--user-data-dir=./.chrome-data']
  }
});
