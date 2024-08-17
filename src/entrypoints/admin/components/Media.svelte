<script lang="ts">
  import {getTinyContextForce, useQueriesResultTable, useRow} from "@/lib/tinybase/tinybase-stores";
  import {sortLoops} from "@/lib/misc/loop-tree";
  import LoopEntryAdmin from "@/entrypoints/admin/components/LoopEntryAdmin.svelte";
  import {A, Button, Modal, TableBodyCell, TableBodyRow} from "flowbite-svelte";
  import {ExclamationCircleOutline, TrashBinOutline} from "flowbite-svelte-icons";
  import {deleteMedia} from "@/lib/controller";

  export let id: string;

  let showDeleteModal = false
  let videoId = id.substring(8)

  let store = getTinyContextForce('store')
  let relationships = getTinyContextForce('relationships')

  type YoutubeThumbnail =
    '0' |
    '1' |
    '2' |
    '3' |
    'default' |
    'mqdefault' |
    'hqdefault' |
    'sddefault' |
    'maxresdefault'

  function getThumbUrl(videoId: string, variant: YoutubeThumbnail) {
    return `https://img.youtube.com/vi/${videoId}/${variant}.jpg`
  }

  const media = useRow('medias', id)

  $: loops = useQueriesResultTable("loopsQ:" + id, 'loops', ({select, where}) => {
    select('startTime')
    select('endTime')
    select('label')
    where('source', id)
  })

  function remove() {
    deleteMedia(store, relationships, id)
  }

</script>

<TableBodyRow>
  <TableBodyCell>
    <A href="https://www.youtube.com/watch?v={videoId}" target="_blank">
      <img src={getThumbUrl(videoId, 'default')} alt="{$media.title}"/>
    </A>
  </TableBodyCell>
  <TableBodyCell>{$media.channel}</TableBodyCell>
  <TableBodyCell>{$media.title}</TableBodyCell>
  <TableBodyCell>{Object.entries($loops).length}</TableBodyCell>
  <TableBodyCell><A on:click={() => showDeleteModal = true}><TrashBinOutline size="md" /></A></TableBodyCell>
</TableBodyRow>

<Modal bind:open={showDeleteModal} size="xs" autoclose>
  <div class="text-center">
    <ExclamationCircleOutline class="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" />
    <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this media?</h3>
    <Button color="red" class="me-2" on:click={remove}>Yes, I'm sure</Button>
    <Button color="alternative">No, cancel</Button>
  </div>
</Modal>

<!--<div class="flex flex-row gap-2 mb-3 items-start">-->
<!--  -->

<!--  <div>-->
<!--    <div><A href="https://www.youtube.com/watch?v={videoId}" target="_blank"> - {$media.title}</A></div>-->

<!--    <div>-->
<!--      {#each sortLoops(Object.entries($loops)) as [id] (id)}-->
<!--        <LoopEntryAdmin {id} />-->
<!--      {/each}-->
<!--    </div>-->
<!--  </div>-->
<!--</div>-->
