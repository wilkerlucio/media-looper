import {createQueries, createRelationships, createStore, type Relationships, Store,} from "tinybase";
import {setContext} from "svelte";
import {IndexedDBStorageAdapter} from "@automerge/automerge-repo-storage-indexeddb";
import {createAutomergePersister} from "tinybase/persisters/persister-automerge";

// Note the ?url suffix
import wasmUrl from "@automerge/automerge/automerge.wasm?url";
import {next as Automerge} from "@automerge/automerge/slim";
import {AnyDocumentId, DocHandle, Repo} from '@automerge/automerge-repo/slim';

const amReady = Automerge.initializeWasm(wasmUrl)

const MAIN_DOC_KEY = "youtube-looper-automerge-doc-url"

function getAutomergeDoc(repo: Repo) {
  let docId = localStorage.getItem(MAIN_DOC_KEY)
  let doc: DocHandle<any> | null = null

  if (docId) doc = repo.find(docId as AnyDocumentId)
  if (!doc) doc = repo.create()

  localStorage.setItem(MAIN_DOC_KEY, doc.documentId)

  return doc
}

export function setupStore({}) {
  const store: Store = createStore();
  let persister;

  const relationships: Relationships = createRelationships(store);
  relationships.setRelationshipDefinition('mediaLoops', 'loops', 'medias', 'source')

  const queries = createQueries(store);

  const ready = amReady.then(async () => {
    const indexedDB = new IndexedDBStorageAdapter();

    const repo = new Repo({
      storage: indexedDB
    });

    const doc = getAutomergeDoc(repo)
    await doc.whenReady()

    persister = createAutomergePersister(store, doc);

    await persister.startAutoLoad()
    await persister.startAutoSave()
  })

  return {
    store, relationships, queries, persister, ready
  }
}

export function setTinyBaseContext(ctx: { [key: string]: any }) {
  setContext('tinybase', ctx);
}
