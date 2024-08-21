import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';
import {setupStore} from "@/lib/stores/core";
import {
  hubServer,
  multiSender,
  runtimeOnMessageSender, runtimeOnMessageListener, channelListener, channelSender
} from "@/lib/misc/chrome-network";

export default defineBackground({
  persistent: true,

  main() {
    const ctx = setupStore({
      listener: channelListener(runtimeOnMessageListener, 'tiny-sync'),
      sender: channelSender(multiSender(hubServer(), runtimeOnMessageSender), 'tiny-sync'),
      persister: (store) => createIndexedDbPersister(store, 'youtube-looper-tb')
    })

    // @ts-ignore
    globalThis.store = ctx.store
  }
});
