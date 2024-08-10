import {
  createMergeableStore,
  createQueries,
  createRelationships,
  type MergeableStore,
  type Relationships,
} from "tinybase";
import {createLocalPersister} from "tinybase/persisters/persister-browser";
import {setContext} from "svelte";
import {createBrowserRuntimeSynchronizer} from "@/lib/misc/runtime-synchronizer";

export function setupStore({persist = true}) {
  const store: MergeableStore = createMergeableStore();
  let persister;

  const relationships: Relationships = createRelationships(store);
  relationships.setRelationshipDefinition('mediaLoops', 'loops', 'medias', 'source')

  const queries = createQueries(store);

  const synchronizer = createBrowserRuntimeSynchronizer(
    store,
    // 'syncChannel',
    function onSend(...args) {
      console.log('send', args);
    },
    function onReceive(...args) {
      console.log('receive', args);
    },
    function onIgnoredError(...args) {
      console.log('ignored error', args);
    }
  );

  const waits: Promise<any>[] = [synchronizer.startSync()]

  if (persist) {
    persister = createLocalPersister(store, 'media-looper');

    waits.push(persister.startAutoLoad())
    waits.push(persister.startAutoSave())
  }

  const ready = Promise.all(waits)

  return {
    store, relationships, queries, persister, ready
  }
}

export function setTinyBaseContext(ctx: { [key: string]: any }) {
  setContext('tinybase', ctx);
}
