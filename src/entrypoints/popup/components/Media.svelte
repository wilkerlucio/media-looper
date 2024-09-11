<script lang="ts">
  import {getTinyContextForce, useRow} from "@/lib/tinybase/tinybase-stores.svelte";
  import {getThumbUrl} from "@/lib/helpers/youtube";
  import {A, Tooltip} from "flowbite-svelte";

  export let id: string;

  const store = getTinyContextForce('store')

  const media = useRow(store, 'medias', id)

  $: videoId = id.substring(8)
</script>

<A href="https://www.youtube.com/watch?v={videoId}" target="_blank">
  <img src={getThumbUrl(videoId, 'default')} alt={$media.title}/>
</A>
<Tooltip>{$media.title}</Tooltip>
