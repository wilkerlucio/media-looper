<script lang="ts">
  import {getTinyContextForce, useTable} from "@/lib/tinybase/tinybase-stores";
  import {Button, Heading, Modal, TableBody, TableHead, TableHeadCell, TableSearch} from "flowbite-svelte";
  import {createMergeableStore, type MergeableStore} from "tinybase";
  import {download, pickFile, readFileText} from "@/lib/misc/browser-file";
  import MediaAdmin from "@/entrypoints/dashboard/components/MediaAdmin.svelte";
  import type {Loop, Media} from "@/lib/model";
  import YoutubeEmbed from "@/lib/components/YoutubeEmbed.svelte";
  import {parseEDNString} from "edn-data";
  import {keep} from "@/lib/helpers/array";
  import ImportEntry from "@/entrypoints/dashboard/components/ImportEntry.svelte";
  import {sourceIdFromVideoId} from "@/lib/youtube/ui";
  import {onDestroy, onMount} from "svelte";
  import {channelListener, runtimeOnMessageListener} from "@/lib/misc/browser-network";
  import {keyBy, sortBy, deburr} from "lodash";
  import SettingsModal from "@/entrypoints/dashboard/components/SettingsModal.svelte";

  const store = getTinyContextForce('store') as MergeableStore

  let media: string | false = false
  let search = ""
  let toImport: {[key: string]: any} | false = false

  function downloadDatabase() {
    download('media-looper-backup.json', new Blob([JSON.stringify(store.getMergeableContent())], {type: "application/json"}))
  }

  async function importLoops() {
    const file = await pickFile()
    const content = await readFileText(file)

    const importStore = createMergeableStore()
    importStore.setMergeableContent(JSON.parse(content))

    store.merge(importStore)
  }

  function parseLoops(videoId: string, loopsEdn: string): Loop[] {
    const loops = parseEDNString(loopsEdn as string, { mapAs: 'object', keywordAs: 'string' }) as any[]

    return loops.map((l) => {
      return {
        id: l['com.wsscode.media-looper.model/loop-id'].val,
        startTime: l['com.wsscode.media-looper.model/loop-start'],
        endTime: l['com.wsscode.media-looper.model/loop-finish'],
        label: l['com.wsscode.media-looper.model/loop-title'],
        source: 'youtube:' + videoId
      }
    })
  }

  async function importLoopsPreviousPreview() {
    const data = await browser.storage.sync.get(null)

    toImport = keyBy(keep(Object.entries(data), ([id, x]: [string, any]) => {
      const match = id.match(/media-looper:youtube:([^"]+)/)

      if (!match) return null

      return {sourceId: sourceIdFromVideoId(match[1]), loops: parseLoops(match[1], x)}
    }), x => x.sourceId)

    console.log('import', toImport);
  }

  function importLoopsPrevious() {
    for (const {sourceId, loops, ...media} of Object.values(toImport)) {
      store.setPartialRow('medias', sourceId, {readonly: false, ...media})

      for (const {id, ...loop} of loops) {
        store.setRow('loops', id, loop)
      }
    }
  }

  const mediaIds = useTable('medias')

  $: medias = sortBy(Object.entries($mediaIds).filter(([id, r]) => {
    if (search === '') return true

    const media = r as unknown as Media

    if (media.title?.toLowerCase().indexOf(search) > -1) return true
    if (media.channel?.toLowerCase().indexOf(search) > -1) return true

    return false
  }), ([id, r]) => [deburr(r.channel?.toLowerCase() || ''), deburr(r.title?.toLowerCase() || '')])

  $: ids = medias.map(([id]) => id)

  let embedListener: any;

  onMount(() => {
    embedListener = channelListener(runtimeOnMessageListener, 'embed-media-info')((msg: any) => {
      if (!toImport) return

      if (toImport[msg.sourceId]) {
        if (msg.title)
          toImport[msg.sourceId] = {...msg, ...toImport[msg.sourceId]}
        else
          toImport[msg.sourceId].readInfoFailed = true
      }
    })
  })

  onDestroy(() => {
    if (embedListener) embedListener()
  })
</script>

<div class="px-10 w-full my-6">
  <Heading tag="h1" class="mb-5">Youtube Looper Dashboard</Heading>

  <div class="my-4">
    <Button on:click={downloadDatabase}>Export database</Button>
    <Button on:click={importLoops}>Import database</Button>
    <Button on:click={importLoopsPreviousPreview}>Import from previous version</Button>
    <SettingsModal />
  </div>

  <TableSearch placeholder="Search" hoverable={true} shadow bind:inputValue={search}>
    <TableHead>
      <TableHeadCell></TableHeadCell>
      <TableHeadCell>Channel</TableHeadCell>
      <TableHeadCell>Title</TableHeadCell>
      <TableHeadCell>Loop Count</TableHeadCell>
      <TableHeadCell></TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="divide-y">
      {#each ids as id (id)}
        <MediaAdmin {id} on:click={() => media = id}/>
      {/each}
    </TableBody>

  </TableSearch>

  <Modal bind:open={media} autoclose outsideclose dismissable={false} size={'xl'} classDialog="outline-0">
    {#if media}
      <YoutubeEmbed videoId={media.substring(8)} />
    {:else}
      <div>Something is wrong, no media selected.</div>
    {/if}
  </Modal>

  <Modal title="Import videos" bind:open={toImport} autoclose outsideclose classDialog="outline-0">
    <div class="flex flex-row flex-wrap justify-between">
      {#each Object.values(toImport) as media}
        <ImportEntry media={media}/>
      {/each}
    </div>

    <svelte:fragment slot="footer">
      <Button on:click={importLoopsPrevious}>Import</Button>
      <Button color="alternative">Cancel</Button>
    </svelte:fragment>
  </Modal>
</div>
