import Youtube from "@/lib/Youtube.svelte";

export default defineContentScript({
  allFrames: true,
  matches: ["*://*.youtube.com/*"],
  main() {
    new Youtube({
      target: document.body
    })
  },
});
