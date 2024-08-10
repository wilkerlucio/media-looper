import {createQueries, createRelationships, createStore, type Relationships, Store} from "tinybase";
import {createLocalPersister} from "tinybase/persisters/persister-browser";
import {setContext} from "svelte";

export async function setupStore() {
  const store: Store = createStore();

  const relationships: Relationships = createRelationships(store);
  relationships.setRelationshipDefinition('mediaLoops', 'loops', 'medias', 'source')

  const queries = createQueries(store);
  const persister = createLocalPersister(store, 'media-looper');

  setContext('tinybase', {
    store, relationships, queries, persister
  });

  await Promise.all([
    persister.startAutoLoad(),
    persister.startAutoSave()
  ])

  return store
}
