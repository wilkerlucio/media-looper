import {createMergeableStore, createQueries, createRelationships, type Relationships,} from "tinybase";
import {setContext} from "svelte";
import {createBrowserRuntimeSynchronizer, RuntimeSyncOptions} from "@/lib/misc/runtime-synchronizer";
import {createIndexedDbPersister} from "tinybase/persisters/persister-indexed-db";

type Options = {
  persist?: boolean
} & RuntimeSyncOptions

export function setupStore(options?: Options) {
  const opts = {persist: true, ...options}
  const store = createMergeableStore();

  const relationships: Relationships = createRelationships(store);
  relationships.setRelationshipDefinition('mediaLoops', 'loops', 'medias', 'source')

  const queries = createQueries(store);

  const persister = createIndexedDbPersister(store, 'youtube-looper-tb')

  const synchronizer = createBrowserRuntimeSynchronizer(store, opts as RuntimeSyncOptions)

  const ready = (async () => {
    await persister.startAutoLoad()
    await persister.startAutoSave()
    await synchronizer.startSync()
  })()

  return {
    store, relationships, queries, persister, ready
  }
}

export function setTinyBaseContext(ctx: { [key: string]: any }) {
  setContext('tinybase', ctx);
}
