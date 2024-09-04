import {parseEDNString} from "edn-data";
import type {Identified, Loop, Media} from "@/lib/model";
import {videoIdFromSourceId} from "@/lib/youtube/ui";
import {MergeableStore, Store} from "tinybase";

export function parseEDN(edn: string) {
  return parseEDNString(edn, { mapAs: 'object', keywordAs: 'string' })
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