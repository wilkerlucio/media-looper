<script lang="ts">
  import {setupStore} from "@/lib/stores/core";
  import {setTinyContext} from "@/lib/tinybase/tinybase-stores";
  import {listenerIgnoringExtensionMessages} from "@/lib/misc/chrome-network";
  import Dashboard from "@/entrypoints/dashboard/components/Dashboard.svelte";

  const ctx = setupStore({
    listener: listenerIgnoringExtensionMessages(browser.runtime.onMessage),
    sender: browser.runtime
  });
  setTinyContext(ctx)

  // @ts-ignore
  window.store = ctx
</script>

{#await ctx.ready then s}
  <Dashboard/>
{/await}
