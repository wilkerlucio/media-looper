<script lang="ts">

  import {getThumbUrl} from "@/lib/helpers/youtube";
  import {A, Tooltip} from "flowbite-svelte";
  import type {Loop, Media} from "@/lib/model";
  import YoutubeEmbed from "@/lib/components/YoutubeEmbed.svelte";
  import {getTinyContextForce, useRow} from "@/lib/tinybase/tinybase-stores";
  import {sourceIdFromVideoId, videoIdFromSourceId} from "@/lib/youtube/ui";

  let {media}: {
    media: { sourceId: string, loops: Loop[], title?: string, readInfoFailed?: boolean, fromCLJS?: boolean }
  } = $props()

  const store = getTinyContextForce('store')

  let videoId = $derived(videoIdFromSourceId(media.sourceId))

  let dbMedia = $derived(useRow<Media>(store, 'medias', sourceIdFromVideoId(videoId)))

  let title = $derived(media.title || $dbMedia.title)

</script>
{#if !media.fromCLJS || (media.fromCLJS && !$dbMedia.importedFromCLJS)}
  <div class="text-center m-1 w-[120px]">
    <A href="https://www.youtube.com/watch?v={videoId}" target="_blank">
      <img src={getThumbUrl(videoId, 'default')} alt="Unknown" width="120" height="90" />
    </A>
    {#if title}
      <div class="truncate">{title}</div>
    {:else if media.readInfoFailed}
      <div class="text-red-500">Error loading info</div>
      <Tooltip class="w-64 text-sm font-light">
        Some videos are forbidden to be loaded as embed, this prevents the extension to be able to find the information
        about the video. If you click on the video thumb above this text to open it on the full page, the info will be
        captured here.
      </Tooltip>
    {:else}
      Loading info...
      <div class="hidden">
        <YoutubeEmbed videoId={videoId}/>
      </div>
    {/if}

    <div>{media.loops.length} loop{media.loops.length === 1 ? '' : 's'}</div>
  </div>
{/if}
