<script lang="ts">

  import {useSortedRowIds} from "@/lib/tinybase/tinybase-stores";
  import Media from "@/entrypoints/popup/components/Media.svelte";
  import {A, Heading} from "flowbite-svelte";

  const adminUrl = browser.runtime.getURL('/admin.html')

  const medias = useSortedRowIds('medias', 'lastLoopPlay', true, 0, 4)

</script>

<div>
  <Heading tag="h4" class="mb-3">Last Played Medias</Heading>

  <A href="{adminUrl}" target="_blank">Open Admin</A>

  <div class="flex flex-wrap gap-3 w-[252px] mx-auto mt-3">
    {#each $medias as id}
      <Media {id}/>
    {/each}
  </div>
</div>
