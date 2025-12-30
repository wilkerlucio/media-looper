import Youtube from "@/lib/components/Youtube.svelte";
import {mount} from "svelte";

export default defineContentScript({
  allFrames: true,
  matches: ["*://*.youtube.com/*"],
  main() {
    // const appVersion = browser?.runtime?.getManifest()?.version || "0.0.0-dev"

    // Initialize Google Analytics
    // const script = document.createElement('script');
    // script.async = true;
    // script.src = 'https://www.googletagmanager.com/gtag/js?id=G-D9MN9TZ3L5';
    // document.head.appendChild(script);
    //
    // (window as any).dataLayer = (window as any).dataLayer || [];
    // function gtag(...args: any[]) {
    //   (window as any).dataLayer.push(args);
    // }
    // (window as any).gtag = gtag;
    //
    // gtag('js', new Date());
    // gtag('config', 'G-D9MN9TZ3L5', {
    //   app_version: appVersion
    // });

    mount(Youtube, {
      target: document.body
    })
  }
});
