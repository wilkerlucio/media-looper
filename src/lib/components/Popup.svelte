<script lang="ts">
  import {useTable} from "@/lib/stores/tinybase-stores";

  const medias = useTable('medias')
</script>

<div>
  {#each Object.entries($medias) as [id, media] (id)}
    <div>{media.channel} - {media.title}</div>
  {/each}
</div>
