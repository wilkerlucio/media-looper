<script lang="ts">
  import {setupStore} from "@/lib/stores/core";
  import {setTinyContext} from "@/lib/tinybase/tinybase-stores";
  import {extensionDomainStoreSetup} from "@/lib/misc/browser-network";
  import Dashboard from "@/entrypoints/dashboard/components/Dashboard.svelte";

  const ctx = setupStore(extensionDomainStoreSetup())
  setTinyContext(ctx)

  // @ts-ignore
  window.store = ctx
</script>

{#await ctx.ready then s}
  <Dashboard/>
{/await}
