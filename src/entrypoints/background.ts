import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';
import {setupStore} from "@/lib/stores/core";
import {
  hubServer,
  multiSender,
  runtimeOnMessageSender, runtimeOnMessageListener, channelListener, channelSender
} from "@/lib/misc/browser-network";

import {createWsSynchronizer} from "tinybase/synchronizers/synchronizer-ws-client";

export default defineBackground({
  persistent: true,

  main() {
    (async () => {
      const ctx = setupStore({
        listener: channelListener(runtimeOnMessageListener, 'tiny-sync'),
        sender: channelSender(multiSender(hubServer(), runtimeOnMessageSender), 'tiny-sync'),
        persister: (store) => createIndexedDbPersister(store, 'youtube-looper-tb')
      })

      console.log('Background store started');

      // const wsSync = await createWsSynchronizer(
      //   ctx.store,
      //   new WebSocket('ws://localhost:8047/youtube-looper'),
      // );
      //
      // await wsSync.startSync();
      //
      // console.log('Background store WS sync ready');

      // @ts-ignore
      globalThis.store = ctx.store
    })()
  }
});
