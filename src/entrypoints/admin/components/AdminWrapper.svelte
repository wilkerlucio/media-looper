<script lang="ts">
  import {setupStore} from "@/lib/stores/core";
  import Admin from "@/entrypoints/admin/components/Admin.svelte";
  import {setTinyContext} from "@/lib/tinybase/tinybase-stores";
  import {listenerIgnoringExtensionMessages} from "@/lib/misc/chrome-network";

  const ctx = setupStore({
    listener: listenerIgnoringExtensionMessages(browser.runtime.onMessage),
    sender: browser.runtime
  });
  setTinyContext(ctx)

  // @ts-ignore
  window.store = ctx
</script>

{#await ctx.ready then s}
  <Admin/>
{/await}
