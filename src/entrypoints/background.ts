// import {setupStore} from "@/lib/stores/core";

export default defineBackground({
  persistent: true,

  main() {
    // browser.runtime.onMessage.addListener(
    //   function(request, sender, sendResponse) {
    //     console.log(sender.tab ?
    //       "from a content script:" + sender.tab.url :
    //       "from the extension");
    //
    //     console.log('req', request);
    //     if (request.greeting === "hello")
    //       sendResponse({farewell: "goodbye"});
    //   }
    // );

    (async function () {
      // const ctx = setupStore({persist: false})
      // await ctx.ready
      //
      // globalThis.store = ctx.store
    })()
  }
});
