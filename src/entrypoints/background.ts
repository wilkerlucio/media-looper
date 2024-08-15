import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';
import {setupStore} from "@/lib/stores/core";
import {hubServer, combineSenders} from "@/lib/misc/chrome-network";

export default defineBackground({
  persistent: true,

  main() {
    const ctx = setupStore({
      listener: browser.runtime.onMessage,
      sender: combineSenders(hubServer(), browser.runtime),
      persister: (store) => createIndexedDbPersister(store, 'youtube-looper-tb')
    })

    // @ts-ignore
    globalThis.store = ctx.store
  }
});
