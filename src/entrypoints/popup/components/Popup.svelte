<script lang="ts">

  import {getTinyContextForce, useSortedRowIds} from "@/lib/tinybase/tinybase-stores.svelte";
  import Media from "@/entrypoints/popup/components/Media.svelte";
  import {A, Heading} from "flowbite-svelte";

  const dashboardUrl = browser.runtime.getURL('/dashboard.html')
  const store = getTinyContextForce('store')

  const medias = useSortedRowIds(store, 'medias', 'lastLoopPlay', true, 0, 4)

</script>

<div>
  <Heading tag="h4" class="mb-3">Last Played Medias</Heading>

  <A href="{dashboardUrl}" target="_blank">Open Dashboard</A>

  <div class="flex flex-wrap gap-3 w-[252px] mx-auto mt-3">
    {#each medias.value as id (id)}
      <Media {id}/>
    {/each}
  </div>
</div>
