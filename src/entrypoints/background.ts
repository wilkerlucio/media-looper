import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';
import {setupStore} from "@/lib/stores/core";
import {
  hubServer,
  multiSender,
  runtimeOnMessageSender, runtimeOnMessageListener, channelListener, channelSender
} from "@/lib/misc/browser-network";

import {createWsSynchronizer} from "tinybase/synchronizers/synchronizer-ws-client";
import {MergeableStore} from "tinybase";

export default defineBackground({
  persistent: true,

  main() {
    const ctx = setupStore({
      listener: channelListener(runtimeOnMessageListener, 'tiny-sync'),
      sender: channelSender(multiSender(hubServer(), runtimeOnMessageSender), 'tiny-sync'),
      persister: (store) => createIndexedDbPersister(store, 'youtube-looper-tb')
    })

    ctx.ready.then(async () => {
      console.log('Background store started');

      let wsSync: ReturnType<typeof createWsSynchronizer> | null = null

      async function updateServer(store: MergeableStore, connectionURL: string) {
        console.log('Updating server connection', connectionURL);

        if (wsSync) {
          console.log('Destroyed previous WS synchronizer');

          try {
            (await wsSync).destroy()
          } catch(e) {} finally {
            store.setValue('websocket-server-status', '');
            wsSync = null
          }
        }

        if (connectionURL) {
          store.setValue('websocket-server-status', 'connecting');

          try {
            const webSocket = new WebSocket(connectionURL as string);

            wsSync = createWsSynchronizer(
              ctx.store,
              webSocket,
            );

            await (await wsSync).startSync();

            webSocket.addEventListener('error', (e) => {
              console.log('got websocket error', e);
              store.setValue('websocket-server-status', 'error');
            })

            webSocket.addEventListener('close', (e) => {
              console.log('websocket disconnected', e);
              if (store.getValue('websocket-server-status') !== '')
                store.setValue('websocket-server-status', 'error');
            })

            console.log('Background store WS sync ready');

            store.setValue('websocket-server-status', 'connected');
          } catch(e) {
            console.log(`Failed to connect to ${connectionURL}`, e);

            store.setValue('websocket-server-status', 'error');
          }
        } else {
          store.setValue('websocket-server-status', '');
        }
      }

      await updateServer(ctx.store, ctx.store.getValue('websocket-server-url') as string)

      ctx.store.addValueListener('websocket-server-url', (store, valueId, newValue, oldValue, getValueChange) => {
        updateServer(store, newValue as string)
      }, true)
    })

    // @ts-ignore
    globalThis.store = ctx.store
  }
});
