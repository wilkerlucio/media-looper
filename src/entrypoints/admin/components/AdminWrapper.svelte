<script lang="ts">
  import {setupStore} from "@/lib/stores/core";
  import Admin from "@/entrypoints/admin/components/Admin.svelte";
  import {setTinyContext} from "@/lib/stores/tinybase-stores";

  const ctx = setupStore({
    listener: browser.runtime.onMessage,
    sender: browser.runtime
  });
  setTinyContext(ctx)

  // @ts-ignore
  window.store = ctx
</script>

{#await ctx.ready then s}
  <Admin/>
{/await}
