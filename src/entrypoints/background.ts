import {setupRepo, setupStore} from "@/lib/stores/core";
import {backgroundListen} from "@/lib/misc/chrome-network";
import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';
import {createStore, Store} from 'tinybase';
import {Repo} from "@automerge/automerge-repo/slim";

async function setupLocalStore() {
  const store = createStore()
  const persister = createIndexedDbPersister(store, 'media-looper-background');

  await persister.load()
  await persister.startAutoSave()

  return store
}

function ensureAutomergeDocURL(store: Store, repo: Repo) {
  if (!store.getValue("media-looper-automerge-doc-url")) {
    console.log('automerge doc url not found, starting a new one');
    const doc = repo.create()

    store.setValue("media-looper-automerge-doc-url", doc.url)
  } else {
    console.log('we know the doc', store.getValue("media-looper-automerge-doc-url"));
  }
}

export default defineBackground({
  persistent: true,

  main() {
    (async () => {
      const store = await setupLocalStore()

      const repo = await setupRepo({backConn: backgroundListen((msg: any, sender: any, sendResponse: any) => {
        if (msg.__connType === 'getAutomergeDocURL') {
          console.log('sending back doc id', store.getValue("media-looper-automerge-doc-url"));
          sendResponse(store.getValue("media-looper-automerge-doc-url"))
        }
      })})

      ensureAutomergeDocURL(store, repo)

      // @ts-ignore
      globalThis.repo = repo
    })()

  }
});
