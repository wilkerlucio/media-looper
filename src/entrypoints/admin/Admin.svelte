<script lang="ts">
  import {useRowIds} from "@/lib/stores/tinybase-stores";
  import Media from "@/entrypoints/admin/Media.svelte";
  import {Heading} from "flowbite-svelte";

  const mediaIds = useRowIds('medias')
</script>

<div class="mx-auto w-[800px] my-6">
  <Heading tag="h1" class="mb-5">Youtube Looper Admin</Heading>

  <div>
    {#each $mediaIds as id}
      <Media {id}/>
    {/each}
  </div>
</div>
