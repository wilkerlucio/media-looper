import {createIndexedDbPersister} from 'tinybase/persisters/persister-indexed-db';
import {createStore, Store} from 'tinybase';
import {Repo} from "@automerge/automerge-repo/slim";
import {setupStore} from "@/lib/stores/core";
import {backgroundListen, combineSenders} from "@/lib/misc/chrome-network";

async function setupLocalStore() {
  const store = createStore()
  const persister = createIndexedDbPersister(store, 'media-looper-background');

  await persister.load()
  await persister.startAutoSave()

  return store
}

function ensureAutomergeDocURL(store: Store, repo: Repo) {
  if (!store.getValue("media-looper-automerge-doc-url")) {
    const doc = repo.create()

    store.setValue("media-looper-automerge-doc-url", doc.url)
  }
}

export default defineBackground({
  persistent: true,

  main() {
    const ctx = setupStore({
      listener: browser.runtime.onMessage,
      sender: combineSenders(backgroundListen(), browser.runtime),
      persister: (store) => createIndexedDbPersister(store, 'youtube-looper-tb')
    })

    // @ts-ignore
    globalThis.store = ctx.store
  }
});
