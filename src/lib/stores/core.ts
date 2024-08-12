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
  const doc =  repo.find('automerge:3tKjsbD9UTDb1JY5Q5hZFesLkZju')

  if (doc.state === 'unavailable') {
    return repo.import(new Uint8Array([133,111,74,131,165,175,108,242,0,158,1,1,16,128,52,134,192,235,195,71,219,132,217,252,210,12,252,237,79,1,111,104,255,11,34,193,86,235,15,102,227,64,239,90,73,213,137,115,36,36,193,92,247,99,199,138,221,143,37,151,153,239,7,1,2,3,2,19,4,35,8,64,4,67,3,86,2,11,1,4,2,4,21,15,33,2,35,2,52,1,66,2,86,2,128,1,4,129,1,2,131,1,2,3,0,3,1,125,0,1,3,127,239,177,230,181,6,2,0,127,0,2,1,126,0,1,3,7,0,2,2,0,0,2,2,2,2,8,116,105,110,121,98,97,115,101,126,1,116,1,118,4,0,4,1,4,4,0,4,0,127,1,3,0,127,0,127,2,2]))
  }

  return doc
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
