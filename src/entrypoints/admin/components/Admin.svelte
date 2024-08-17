<script lang="ts">
  import {getTinyContextForce, useRowIds} from "@/lib/tinybase/tinybase-stores";
  import Media from "@/entrypoints/admin/components/Media.svelte";
  import {
    Button,
    Heading,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell
  } from "flowbite-svelte";
  import {createMergeableStore, type MergeableStore} from "tinybase";
  import {download, pickFile, readFileText} from "@/lib/misc/browser-file";
  import {slide} from "svelte/transition";

  const store = getTinyContextForce('store') as MergeableStore

  let media: string | null = null

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

  const mediaIds = useRowIds('medias')
</script>

<div class="px-10 w-full my-6">
  <Heading tag="h1" class="mb-5">Youtube Looper Admin</Heading>

  <div class="my-4">
    <Button on:click={downloadDatabase}>Export database</Button>
    <Button on:click={importLoops}>Import database</Button>
  </div>

  <Table hoverable={true} shadow>
    <TableHead>
      <TableHeadCell></TableHeadCell>
      <TableHeadCell>Channel</TableHeadCell>
      <TableHeadCell>Title</TableHeadCell>
      <TableHeadCell>Loop Count</TableHeadCell>
      <TableHeadCell></TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="divide-y">
      {#each $mediaIds as id}
        <Media {id} on:click={() => media = media === id ? null : id}/>
        {#if media === id}
          <TableBodyRow>
            <TableBodyCell colspan="5" class="p-0">
              <div class="px-2 py-3" transition:slide={{ duration: 300, axis: 'y' }}>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/{id.substring(8)}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
              </div>
            </TableBodyCell>
          </TableBodyRow>
        {/if}
      {/each}
    </TableBody>

  </Table>
</div>
