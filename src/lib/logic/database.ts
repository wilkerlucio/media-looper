import type {GenericStore} from "@/lib/tinybase/tinybase-stores.svelte";
import keyBy from "lodash/keyBy";
import {keep} from "@/lib/helpers/array";
import {sourceIdFromVideoId} from "@/lib/youtube/ui";
import {parseLoops} from "@/lib/logic/import-cljs";
import type {Id} from "tinybase";

export function exportDatabase(store: GenericStore) {
  const medias = store.getTable('medias') as {[k: Id]: any}
  const loops = store.getTable('loops') as {[k: Id]: any}

  for (const [id, media] of Object.entries(medias)) {
    media.sourceId = id
  }

  for (const [id, loop] of Object.entries(loops)) {
    loop.id = id
    medias[loop.source].loops ||= []
    medias[loop.source].loops.push(loop)
  }

  return medias
}

export async function loadLoopsPrevious() {
  const data = await browser.storage.sync.get(null)

  return keyBy(keep(Object.entries(data), ([id, x]: [string, any]) => {
    const match = id.match(/media-looper:youtube:([^"]+)/)

    if (!match) return null

    return {sourceId: sourceIdFromVideoId(match[1]), loops: parseLoops(match[1], x), fromCLJS: true}
  }), x => x.sourceId)
}