<script lang="ts">

  import {pickFile, readFileText} from "@/lib/misc/browser-file";
  import {pd} from "@/lib/helpers/events";
  import {parseFromImportFile} from "@/lib/logic/database";
  import {getTinyContextForce} from "@/lib/tinybase/tinybase-stores";
  import {videoIdFromSourceId} from "@/lib/youtube/ui";

  let {sourceId}: {
    sourceId: string
  } = $props()

  const store = getTinyContextForce('store')

  let importError: string | undefined = $state()
  let videoId = $derived(videoIdFromSourceId(sourceId))

  async function importFromJSON(file: File) {
    const content = await readFileText(file)
    console.log('import from json', file, content);
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
      console.error('error', e);
      console.log(e.message, e);
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

    console.log('importing', file);

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

</script>

{#if importError}
  <div class="error"><strong>Error:</strong> {importError}</div>
{/if}
<a href="#import-media" onclick={pd(importMediaFromFile)}>Import</a>
<a href="#export-media">Export</a>

<style>
    a {
        margin: 0 3px;
    }

    .error {
        background: #ff00004d;
        padding: 0 3px;
    }
</style>