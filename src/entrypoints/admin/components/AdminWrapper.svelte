<script lang="ts">
  import {setTinyBaseContext, setupStore} from "@/lib/stores/core";
  import {contentScriptListen} from "@/lib/misc/chrome-network";
  import Admin from "@/entrypoints/admin/components/Admin.svelte";

  const ctx = setupStore({
    listener: contentScriptListen(),
    sender: browser.runtime
  });
  setTinyBaseContext(ctx)

  // @ts-ignore
  window.store = ctx
</script>

{#await ctx.ready then s}
  <Admin/>
{/await}
