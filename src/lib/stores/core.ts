import {
  createMergeableStore,
  createQueries,
  createRelationships,
  type Persister,
  type Relationships,
  type Store,
} from "tinybase";
import {setContext} from "svelte";
import {createBrowserRuntimeSynchronizer, RuntimeSyncOptions} from "@/lib/misc/runtime-synchronizer";
import {createLocalPersister} from "tinybase/persisters/persister-browser";

type Options = {
  persister?: (store: Store) => Persister
} & RuntimeSyncOptions

function startPersister(store: Store, persisterBuilder: ((store: Store) => Persister) | undefined) {
  return persisterBuilder ?
    persisterBuilder(store) :
    createLocalPersister(store, 'youtube-looper-tb')
}

export function setupStore(options?: Options) {
  const store = createMergeableStore();

  const relationships: Relationships = createRelationships(store);
  relationships.setRelationshipDefinition('mediaLoops', 'loops', 'medias', 'source')

  const queries = createQueries(store);

  const persister = startPersister(store, options?.persister)
  const synchronizer = createBrowserRuntimeSynchronizer(store, options as RuntimeSyncOptions)

  const ready = (async () => {
    await persister.startAutoLoad()
    await persister.startAutoSave()
    await synchronizer.startSync()
  })()

  return {
    store, relationships, queries, persister, synchronizer, ready
  }
}

export function setTinyBaseContext(ctx: { [key: string]: any }) {
  setContext('tinybase', ctx);
}
