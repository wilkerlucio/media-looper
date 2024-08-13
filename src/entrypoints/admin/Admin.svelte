<script lang="ts">
  import {useRowIds} from "@/lib/stores/tinybase-stores";
  import Media from "@/entrypoints/admin/Media.svelte";

  const mediaIds = useRowIds('medias')
</script>

<h1>Youtube Looper Admin</h1>

<div>
  {#each $mediaIds as id}
    <Media {id}/>
  {/each}
</div>
