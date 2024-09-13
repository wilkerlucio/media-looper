import type {GenericStore} from "@/lib/tinybase/tinybase-stores";
import keyBy from "lodash/keyBy";
import {keep} from "@/lib/helpers/array";
import {sourceIdFromVideoId} from "@/lib/youtube/ui";
import {Id, MergeableStore, Store} from "tinybase";
import type {Identified, Loop, Media} from "@/lib/model";
import {parseEDNString} from "edn-data";

// region: import

export function parseEDN(edn: string) {
  return parseEDNString(edn, {mapAs: 'object', keywordAs: 'string'})
}

export function adaptLoop(videoId: string, loop: any) {
  return {
    id: loop['com.wsscode.media-looper.model/loop-id'].val,
    startTime: loop['com.wsscode.media-looper.model/loop-start'],
    endTime: loop['com.wsscode.media-looper.model/loop-finish'],
    label: loop['com.wsscode.media-looper.model/loop-title'],
    source: 'youtube:' + videoId
  }
}

export function parseLoops(videoId: string, loopsEdn: string): (Loop & Identified)[] {
  const loops = parseEDN(loopsEdn as string) as any[]

  return loops.map((l) => adaptLoop(videoId, l))
}

export function importMedia(store: Store | MergeableStore, sourceId: string, info: Media, loops: (Loop & Identified)[]) {
  const skipImport = store.getCell('medias', sourceId, 'importedFromCLJS')

  if (skipImport) return false

  store.setPartialRow('medias', sourceId, {importedFromCLJS: true, ...info})

  for (const {id, ...loop} of loops) {
    store.setRow('loops', id, loop)
  }

  return true
}

// endregion

// region: import previous

export async function loadLoopsPrevious() {
  const data = await browser.storage.sync.get(null)

  return keyBy(keep(Object.entries(data), ([id, x]: [string, any]) => {
    const match = id.match(/media-looper:youtube:([^"]+)/)

    if (!match) return null

    return {sourceId: sourceIdFromVideoId(match[1]), loops: parseLoops(match[1], x), fromCLJS: true}
  }), x => x.sourceId)
}

// endregion

// region: export

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

// endregion