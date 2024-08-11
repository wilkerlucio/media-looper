<script lang="ts">
  import {getStoreForce, useTable} from "@/lib/stores/tinybase-stores";

  const store = getStoreForce()

  const medias = useTable('medias')
</script>

<div>
  {#each Object.entries($medias) as [id, media] (id)}
    <div>{media.channel} - {media.title}</div>
  {/each}
</div>
