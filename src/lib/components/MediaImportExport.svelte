<script lang="ts">

  import {download, pickFile, readFileText} from "@/lib/misc/browser-file";
  import {pd} from "@/lib/helpers/events";
  import {exportDatabase, parseFromImportFile} from "@/lib/logic/database";
  import {getTinyContextForce} from "@/lib/tinybase/tinybase-stores";
  import {sourceInfo, videoIdFromSourceId} from "@/lib/youtube/ui";
  import {IdentifiedLoop, Loop} from "@/lib/model";

  let {sourceId}: {
    sourceId: string
  } = $props()

  const store = getTinyContextForce('store')
  const relationships = getTinyContextForce('relationships')

  let importError: string | undefined = $state()
  let videoId = $derived(videoIdFromSourceId(sourceId))

  async function importFromJSON(file: File) {
    const content = await readFileText(file)

    try {
      const {loops} = JSON.parse(content)

      for (const {id, ...loop} of loops) {
        store.setRow('loops', id, loop)
      }
    } catch(e: any) {
      importError = e.message
    }
  }

  async function importFromEdn(file: File) {
    const content = await readFileText(file)

    try {
      const loops = parseFromImportFile(videoId, content)
      if (loops.length == 0) throw new Error('No loops to import from this file')

      for (const {id, ...loop} of loops) {
        store.setRow('loops', id, loop)
      }
    } catch (e: any) {
      importError = e.message
    }
  }

  function pathExtension(path: string) {
    const extensionMatch = path.match(/\.([^.]+)$/) || []

    return extensionMatch[1]
  }

  async function importMediaFromFile() {
    const file = await pickFile({accept: ".json,.edn"})

    importError = undefined

    const extension = pathExtension(file.name)

    switch (extension) {
      case 'json':
        await importFromJSON(file)
        break;
      case 'edn':
        await importFromEdn(file)
        break;
      default:
        importError = "Invalid file type."
    }
  }

  function exportMediaToFile() {
    const loops = relationships.getLocalRowIds('mediaLoops', sourceId).map((loopId): IdentifiedLoop => {
      const loop = store.getRow('loops', loopId) as unknown as Loop
      return {id: loopId, ...loop}
    }).filter((loop) => {
      return !loop.readonly
    })

    const exportJSON = JSON.stringify({loops, sourceId})

    const title = store.getCell('medias', sourceId, 'title') || sourceInfo()?.title || 'Unknown title';

    download(title, new Blob([exportJSON], {type: "application/json"}))
  }

</script>

{#if importError}
  <div class="error"><strong>Error:</strong> {importError}</div>
{/if}
<a href="#import-media" onclick={pd(importMediaFromFile)}>Import</a>
<a href="#export-media" onclick={pd(exportMediaToFile)}>Export</a>

<style>
    a {
        margin: 0 3px;
    }

    .error {
        background: #ff00004d;
        padding: 0 3px;
    }
</style>