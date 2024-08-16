<script lang="ts">
  import {useQueriesResultTable, useRow} from "@/lib/stores/tinybase-stores";
  import {sortLoops} from "@/lib/misc/loop-tree";
  import LoopEntryAdmin from "@/entrypoints/admin/components/LoopEntryAdmin.svelte";
  import {A} from "flowbite-svelte";

  export let id: string;

  let videoId = id.substring(8)

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
    where((getCell) => !getCell('readonly'))
  })
</script>

<div class="flex flex-row gap-2 mb-3 items-start">
  <a href="https://www.youtube.com/watch?v={videoId}" target="_blank">
    <img src={getThumbUrl(videoId, 'default')} alt="{$media.title}"/>
  </a>

  <div>
    <div><A href="https://www.youtube.com/watch?v={videoId}" target="_blank">{$media.channel} - {$media.title}</A></div>

    <div>
      {#each sortLoops(Object.entries($loops)) as [id] (id)}
        <LoopEntryAdmin {id} />
      {/each}
    </div>
  </div>
</div>
