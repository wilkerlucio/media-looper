import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';
import {setupStore} from "@/lib/stores/core";
import {hubServer, combineSenders, listenerIgnoringExtensionMessages} from "@/lib/misc/chrome-network";

export default defineBackground({
  persistent: true,

  main() {
    const ctx = setupStore({
      listener: listenerIgnoringExtensionMessages(browser.runtime.onMessage),
      sender: combineSenders(hubServer(), browser.runtime),
      persister: (store) => createIndexedDbPersister(store, 'youtube-looper-tb')
    })

    // @ts-ignore
    globalThis.store = ctx.store
  }
});
