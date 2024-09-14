import {
  createMergeableStore,
  createQueries,
  createRelationships,
  type Persister,
  type Relationships,
  type Store,
} from "tinybase";
import {createBrowserRuntimeSynchronizer, RuntimeSyncOptions} from "@/lib/tinybase/runtime-synchronizer";
import {createLocalPersister} from "tinybase/persisters/persister-browser";

type Options = {
  persister?: (store: Store) => Persister
} & RuntimeSyncOptions

export type TinyBaseStoreOptions = Options & {localOptions: Options}

function startPersister(store: Store, persisterBuilder: ((store: Store) => Persister) | undefined) {
  return persisterBuilder ?
    persisterBuilder(store) :
    createLocalPersister(store, 'youtube-looper-tb')
}

export function storeBase() {
  const store = createMergeableStore();

  const relationships: Relationships = createRelationships(store);
  relationships.setRelationshipDefinition('mediaLoops', 'loops', 'medias', 'source')

  const queries = createQueries(store);

  return {store, relationships, queries}
}

export function setupStore(options?: TinyBaseStoreOptions) {
  const {store, relationships, queries} = storeBase()

  const persister = startPersister(store, options?.persister)
  const synchronizer = createBrowserRuntimeSynchronizer(store, options as RuntimeSyncOptions)

  const local = setupLocalSettingsStore(options?.localOptions)

  const ready = (async () => {
    await local.ready
    await persister.startAutoLoad()
    await persister.startAutoSave()
    synchronizer.startSync()
  })()

  return {
    store, relationships, queries, persister, synchronizer, ready, localStore: local.store
  }
}

export function setupLocalSettingsStore(options?: Options) {
  const store = createMergeableStore();

  const persister = startPersister(store, options?.persister)
  const synchronizer = createBrowserRuntimeSynchronizer(store, options as RuntimeSyncOptions)

  const ready = (async () => {
    await persister.startAutoLoad()
    await persister.startAutoSave()
    synchronizer.startSync()
  })()

  return {
    store, persister, synchronizer, ready
  }
}
