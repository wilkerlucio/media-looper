<script lang="ts">
  import {getTinyContextForce, useTable} from "@/lib/tinybase/tinybase-stores";
  import {Button, Checkbox, Heading, Modal, TableBody, TableHead, TableHeadCell, TableSearch} from "flowbite-svelte";
  import {ExclamationCircleOutline} from "flowbite-svelte-icons";
  import {type MergeableStore} from "tinybase";
  import {download, pickFile, readFileText} from "@/lib/misc/browser-file";
  import MediaAdmin from "@/entrypoints/dashboard/components/MediaAdmin.svelte";
  import type {Media} from "@/lib/model";
  import ImportEntry from "@/entrypoints/dashboard/components/ImportEntry.svelte";
  import {channelListener, runtimeOnMessageListener} from "@/lib/misc/browser-network";
  import deburr from "lodash/deburr";
  import sortBy from "lodash/sortBy";
  import SettingsModal from "@/entrypoints/dashboard/components/SettingsModal.svelte";
  import {exportDatabase, importMedia, loadLoopsPrevious} from "@/lib/logic/database";
  import {deleteMediaBulk} from "@/lib/controller";

  const store = getTinyContextForce('store') as MergeableStore
  const relationships = getTinyContextForce('relationships')

  let search = $state("")
  let toImport: { [key: string]: any } | false = $state(false)
  let selection: {[key: string]: boolean} = $state({})
  let showBulkDeleteModal = $state(false)

  function downloadDatabase() {
    download('media-looper-backup.json', new Blob([JSON.stringify(exportDatabase(store))], {type: "application/json"}))
  }

  async function importLoops() {
    const file = await pickFile({accept: ".json"})
    const content = await readFileText(file)

    toImport = JSON.parse(content)
  }

  const prevData = loadLoopsPrevious()

  async function importLoopsPreviousPreview() {
    toImport = await prevData
  }

  function importLoopsFinish() {
    for (const {sourceId, loops, fromCLJS, ...media} of Object.values(toImport)) {
      importMedia(store, sourceId, {readonly: false, ...media}, loops)
    }
  }

  const mediaIds = useTable(store, 'medias')

  let medias = $derived(sortBy(Object.entries($mediaIds).filter(([id, r]) => {
    if (search === '') return true

    const media = r as unknown as Media

    if (media.title?.toLowerCase().indexOf(search) > -1) return true
    if (media.channel?.toLowerCase().indexOf(search) > -1) return true

    return false
  }), ([id, r]) => [deburr(r.channel?.toLowerCase() || ''), deburr(r.title?.toLowerCase() || '')]))

  let ids = $derived(medias.map(([id]) => id))

  let selectedIds = $derived(ids.filter(id => selection[id]))
  let selectedCount = $derived(selectedIds.length)
  let allSelected = $derived(ids.length > 0 && ids.every(id => selection[id]))
  let someSelected = $derived(selectedCount > 0 && !allSelected)

  function toggleSelectAll() {
    const newValue = !allSelected
    for (const id of ids) {
      selection[id] = newValue
    }
  }

  function bulkDelete() {
    deleteMediaBulk(store, relationships, selectedIds)
    selection = {}
    showBulkDeleteModal = false
  }

  $effect(() => {
    return channelListener(runtimeOnMessageListener, 'embed-media-info')((msg: any) => {
      if (!toImport) return

      if (toImport[msg.sourceId]) {
        if (msg.title)
          toImport[msg.sourceId] = {...msg, ...toImport[msg.sourceId]}
        else
          toImport[msg.sourceId].readInfoFailed = true
      }
    })
  })

</script>

<div class="px-10 w-full my-6">
  <Heading tag="h1" class="mb-5">Youtube Looper Dashboard</Heading>

  <div class="my-4 flex gap-3">
    <Button on:click={downloadDatabase}>Export database</Button>
    <Button on:click={importLoops}>Import database</Button>
    {#await prevData then x}
      {#if Object.entries(x).length > 0}
        <Button on:click={importLoopsPreviousPreview}>Import from previous version</Button>
      {/if}
    {/await}
    {#if selectedCount > 0}
      <Button color="red" on:click={() => showBulkDeleteModal = true}>Delete selected ({selectedCount})</Button>
    {/if}
    <div class="flex-1"></div>
    <SettingsModal />
  </div>

  <TableSearch placeholder="Search" hoverable={true} shadow bind:inputValue={search}>
    <TableHead>
      <TableHeadCell class="w-4 p-4">
        <Checkbox checked={allSelected} indeterminate={someSelected} on:click={toggleSelectAll} />
      </TableHeadCell>
      <TableHeadCell></TableHeadCell>
      <TableHeadCell>Channel</TableHeadCell>
      <TableHeadCell>Title</TableHeadCell>
      <TableHeadCell>Loop Count</TableHeadCell>
      <TableHeadCell></TableHeadCell>
    </TableHead>
    <TableBody tableBodyClass="divide-y">
      {#each ids as id (id)}
        <MediaAdmin {id} bind:selected={selection[id]} />
      {/each}
    </TableBody>
  </TableSearch>

  <Modal title="Import medias" bind:open={toImport} autoclose outsideclose classDialog="outline-0">
    <div class="flex flex-row flex-wrap justify-between">
      {#each Object.values(toImport) as media}
        <ImportEntry media={media}/>
      {/each}
    </div>

    <svelte:fragment slot="footer">
      <Button on:click={importLoopsFinish}>Import</Button>
      <Button color="alternative">Cancel</Button>
    </svelte:fragment>
  </Modal>

  <Modal bind:open={showBulkDeleteModal} size="xs" autoclose>
    <div class="text-center">
      <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
      <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete {selectedCount} item{selectedCount === 1 ? '' : 's'}?</h3>
      <Button color="red" class="me-2" on:click={bulkDelete}>Yes, delete all</Button>
      <Button color="alternative">No, cancel</Button>
    </div>
  </Modal>
</div>
