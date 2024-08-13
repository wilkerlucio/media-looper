<script lang="ts">
  import {useRow} from "@/lib/stores/tinybase-stores";
  import type {Media} from "@/lib/model";

  export let id;

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

  const media = useRow('medias', id) as Media
</script>

<div>
  <img src={getThumbUrl(videoId, 'mqdefault')} alt="{$media.title}"/>

  {$media.channel} - {$media.title}
</div>
