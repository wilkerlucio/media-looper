import Youtube from "@/lib/components/Youtube.svelte";
import * as amplitude from '@amplitude/analytics-browser';
import {mount} from "svelte";

export default defineContentScript({
  allFrames: true,
  matches: ["*://*.youtube.com/*"],
  main() {
    const appVersion = browser?.runtime?.getManifest()?.version || "0.0.0-dev"

    amplitude.init('a252b7def7525ff7a88e3172423510c0', {
      appVersion,
      autocapture: false
    });

    mount(Youtube, {
      target: document.body
    })
  }
});
