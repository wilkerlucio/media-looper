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

    function ping() {
      return new Promise((resolve) => {
        browser.runtime.sendMessage('ping').then((r) => {
          if(browser.runtime.lastError) {
            setTimeout(ping, 200);
          } else {
            resolve(true)
          }
        });
      })
    }

    ping().then(() => {
      new Youtube({
        target: document.body
      })
    })
  },
});
