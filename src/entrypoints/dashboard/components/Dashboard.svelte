<script lang="ts">
  import {getTinyContextForce, useTable} from "@/lib/tinybase/tinybase-stores";
  import {
    Button,
    Heading,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    TableSearch
  } from "flowbite-svelte";
  import {createMergeableStore, type MergeableStore} from "tinybase";
  import {download, pickFile, readFileText} from "@/lib/misc/browser-file";
  import {slide} from "svelte/transition";
  import MediaAdmin from "@/entrypoints/dashboard/components/MediaAdmin.svelte";
  import type {Media} from "@/lib/model";
  import YoutubeEmbed from "@/lib/components/YoutubeEmbed.svelte";

  const store = getTinyContextForce('store') as MergeableStore

  let media: string | null = null
  let search = ""

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

  const mediaIds = useTable('medias')

  $: medias = Object.entries($mediaIds).filter(([id, r]) => {
    const media = r as unknown as Media

    if (media.title.toLowerCase().indexOf(search) > -1) return true
    if (media.channel.toLowerCase().indexOf(search) > -1) return true

    return false
  })

  $: ids = medias.map(([id]) => id)
</script>

<div class="px-10 w-full my-6">
  <Heading tag="h1" class="mb-5">Youtube Looper Admin</Heading>

  <div class="my-4">
    <Button on:click={downloadDatabase}>Export database</Button>
    <Button on:click={importLoops}>Import database</Button>
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
        <MediaAdmin {id} on:click={() => media = media === id ? null : id}/>
        {#if media === id}
          <TableBodyRow>
            <TableBodyCell colspan="10" class="p-0">
              <div class="px-2 py-3" transition:slide={{ duration: 300, axis: 'y' }}>
                <YoutubeEmbed videoId={id.substring(8)} />
              </div>
            </TableBodyCell>
          </TableBodyRow>
        {/if}
      {/each}
    </TableBody>

  </TableSearch>
</div>
