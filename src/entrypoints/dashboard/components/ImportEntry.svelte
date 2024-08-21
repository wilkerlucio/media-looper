<script lang="ts">

  import {getThumbUrl} from "@/lib/helpers/youtube";
  import {A} from "flowbite-svelte";
  import type {Loop} from "@/lib/model";
  import YoutubeEmbed from "@/lib/components/YoutubeEmbed.svelte";

  export let media: {videoId: string, loops: Loop[]};

</script>
<div class="text-center m-1">
  <A href="https://www.youtube.com/watch?v={media.videoId}" target="_blank">
    <img src={getThumbUrl(media.videoId, 'default')} alt="Unknown"/>
  </A>
  <div>{media.loops.length} loop{media.loops.length === 1 ? '' : 's'}</div>
  <div class="hidden">
    <YoutubeEmbed videoId={media.videoId} />
  </div>
</div>
