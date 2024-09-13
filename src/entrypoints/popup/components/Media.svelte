<script lang="ts">
  import {getTinyContextForce, useRow} from "@/lib/tinybase/tinybase-stores";
  import {getThumbUrl} from "@/lib/helpers/youtube";
  import {A, Tooltip} from "flowbite-svelte";
  import type {Media} from "@/lib/model";

  let {id}: {id: string} = $props()

  const store = getTinyContextForce('store')

  const media = useRow<Media>(store, 'medias', id)

  let videoId = $derived(id.substring(8))
</script>

<A href="https://www.youtube.com/watch?v={videoId}" target="_blank">
  <img src={getThumbUrl(videoId, 'default')} alt={$media.title}/>
</A>
<Tooltip>{$media.title}</Tooltip>
