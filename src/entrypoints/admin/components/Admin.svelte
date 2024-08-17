<script lang="ts">
  import {getTinyContextForce, useRowIds} from "@/lib/stores/tinybase-stores";
  import Media from "@/entrypoints/admin/components/Media.svelte";
  import {Button, Heading, Table, TableBody, TableHead, TableHeadCell} from "flowbite-svelte";
  import {createMergeableStore, type MergeableStore} from "tinybase";
  import {download, pickFile, readFileText} from "@/lib/misc/browser-file";

  const store = getTinyContextForce('store') as MergeableStore

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

  <Table hoverable={true}>
    <TableHead>
      <TableHeadCell></TableHeadCell>
      <TableHeadCell>Channel</TableHeadCell>
      <TableHeadCell>Title</TableHeadCell>
      <TableHeadCell>Loop Count</TableHeadCell>
      <TableHeadCell></TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="divide-y">
      {#each $mediaIds as id}
        <Media {id}/>
      {/each}
    </TableBody>
  </Table>
</div>
