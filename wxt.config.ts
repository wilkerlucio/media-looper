import { defineConfig } from 'wxt';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: "YouTube Looper",
    description: "Custom loops extension for Youtube videos",
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
    startUrls: ['https://www.youtube.com/watch?v=EDRRbuWuUbQ']
    // chromiumArgs: ['--user-data-dir=./.chrome-data']
  }
});
