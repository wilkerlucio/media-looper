import {Id, Relationships, Store} from "tinybase";

export function deleteMedia(store: Store, relationships: Relationships, mediaId: Id) {
  store.transaction(() => {
    const loopIds = relationships.getLocalRowIds('mediaLoops', mediaId)

    for (const loopId of loopIds)
      store.delRow('loops', loopId)

    store.delRow('medias', mediaId)
  })
}
