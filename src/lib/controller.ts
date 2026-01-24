import {Id, Relationships, Store} from "tinybase";
import * as logic from "@/lib/logic/loop";
import {Loop} from "@/lib/model";

export function cutLoop(store: Store, loopId: string, cutTime: number) {
  const loop = store.getRow('loops', loopId)

  if (!loop) throw new Error(`Loop ${loopId} not found`)

  const newLoops = logic.cutLoop(loop as unknown as Loop, cutTime)

  for (const {id, ...newLoop} of newLoops)
    store.setRow('loops', id, newLoop)
}

export function deleteMedia(store: Store, relationships: Relationships, mediaId: Id) {
  store.transaction(() => {
    const loopIds = relationships.getLocalRowIds('mediaLoops', mediaId)

    for (const loopId of loopIds)
      store.delRow('loops', loopId)

    store.delRow('medias', mediaId)
  })
}

export function deleteMediaBulk(store: Store, relationships: Relationships, mediaIds: Id[]) {
  store.transaction(() => {
    for (const mediaId of mediaIds) {
      const loopIds = relationships.getLocalRowIds('mediaLoops', mediaId)

      for (const loopId of loopIds)
        store.delRow('loops', loopId)

      store.delRow('medias', mediaId)
    }
  })
}
