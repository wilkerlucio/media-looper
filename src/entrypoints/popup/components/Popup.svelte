<script lang="ts">
  import {useTable} from "@/lib/stores/tinybase-stores";

  const medias = useTable('medias')
  const adminUrl = browser.runtime.getURL('/admin.html')
</script>

<div>
  {#each Object.entries($medias) as [id, media] (id)}
    <div>{media.channel} - {media.title}</div>
  {/each}

  <a href="{adminUrl}" target="_blank">Open Admin</a>
</div>
