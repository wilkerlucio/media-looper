import Youtube from "@/lib/components/Youtube.svelte";
import * as amplitude from '@amplitude/analytics-browser';

export default defineContentScript({
  allFrames: true,
  matches: ["*://*.youtube.com/*"],
  main() {
    const appVersion = browser?.runtime?.getManifest()?.version || "0.0.0"

    amplitude.init('a252b7def7525ff7a88e3172423510c0', {
      appVersion,
      autocapture: false
    });

    new Youtube({
      target: document.body
    })
  },
});
