import {createQueries, createRelationships, createStore, type Relationships, Store,} from "tinybase";
import {setContext} from "svelte";
import {AnyDocumentId, Repo} from "@automerge/automerge-repo";
import {IndexedDBStorageAdapter} from "@automerge/automerge-repo-storage-indexeddb";
import {createAutomergePersister} from "tinybase/persisters/persister-automerge";

const MAIN_DOC_KEY = "youtube-looper-automerge-doc-url"

function getAutomergeDoc(repo: Repo) {
  let docId = localStorage.getItem(MAIN_DOC_KEY)

  if (docId) return repo.find(docId as AnyDocumentId)

  const doc = repo.create()

  localStorage.setItem(MAIN_DOC_KEY, doc.documentId)

  return doc
}

export function setupStore({}) {
  // region: automerge setup

  const indexedDB = new IndexedDBStorageAdapter();

  const repo = new Repo({
    storage: indexedDB
  });

  const doc = getAutomergeDoc(repo)

  // endregion

  const store: Store = createStore();
  let persister;

  const relationships: Relationships = createRelationships(store);
  relationships.setRelationshipDefinition('mediaLoops', 'loops', 'medias', 'source')

  const queries = createQueries(store);

  persister = createAutomergePersister(store, doc);

  const ready = Promise.all([
    persister.startAutoLoad(),
    persister.startAutoSave()
  ])

  return {
    store, relationships, queries, persister, ready
  }
}

export function setTinyBaseContext(ctx: { [key: string]: any }) {
  setContext('tinybase', ctx);
}
