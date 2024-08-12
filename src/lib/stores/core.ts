import {createQueries, createRelationships, createStore, type Relationships, Store,} from "tinybase";
import {setContext} from "svelte";
import {IndexedDBStorageAdapter} from "@automerge/automerge-repo-storage-indexeddb";
import {createAutomergePersister} from "tinybase/persisters/persister-automerge";

// Note the ?url suffix
import wasmUrl from "@automerge/automerge/automerge.wasm?url";
import {next as Automerge} from "@automerge/automerge/slim";
import {AnyDocumentId, DocHandle, Repo, RepoConfig} from '@automerge/automerge-repo/slim';
import {BroadcastChannelNetworkAdapter} from "@automerge/automerge-repo-network-broadcastchannel";
import {RuntimeChannelNetworkAdapter} from "@/lib/automerge/network/runtime-channel";
import {backgroundListen, contentScriptListen} from "@/lib/misc/chrome-network";

const amReady = Automerge.initializeWasm(wasmUrl)

const MAIN_DOC_KEY = "youtube-looper-automerge-doc-url"

function getAutomergeDoc(repo: Repo) {
  if (globalThis.localStorage) {
    let docId = localStorage.getItem(MAIN_DOC_KEY)
    let doc: DocHandle<any> | null = null

    if (docId) doc = repo.find(docId as AnyDocumentId)
    if (!doc) doc = repo.create()

    localStorage.setItem(MAIN_DOC_KEY, doc.documentId)

    return doc
  } else {
    return repo.create()
  }
}

type Options = {
  persist?: boolean,
  extensionId?: string | null,
  backConn?: ReturnType<typeof backgroundListen>
  csConn?: ReturnType<typeof contentScriptListen>
}

export function setupRepo({persist, extensionId, backConn, csConn}: Options) {
  const options: RepoConfig = {network: [
    new RuntimeChannelNetworkAdapter({extensionId, backConn, csConn})
  ]}

  if (persist) options.storage = new IndexedDBStorageAdapter()

  return new Repo(options);
}

export function setupStore(options?: Options) {
  const opts = {persist: true, ...options}
  const store: Store = createStore();
  let persister;

  const relationships: Relationships = createRelationships(store);
  relationships.setRelationshipDefinition('mediaLoops', 'loops', 'medias', 'source')

  const queries = createQueries(store);

  const ready = amReady.then(async () => {
    const repo = setupRepo(opts)

    const doc = getAutomergeDoc(repo)
    await doc.whenReady()

    console.log('doc!', doc);

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
