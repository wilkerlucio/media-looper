<script lang="ts">
  import Popup from "@/entrypoints/popup/components/Popup.svelte";
  import {setupStore} from "@/lib/stores/core";
  import {setTinyContext} from "@/lib/tinybase/tinybase-stores";
  import {listenerIgnoringExtensionMessages} from "@/lib/misc/chrome-network";

  const ctx = setupStore({
    listener: listenerIgnoringExtensionMessages(browser.runtime.onMessage),
    sender: browser.runtime
  });

  setTinyContext(ctx)

  // @ts-ignore
  window.store = ctx.store
</script>

{#await ctx.ready then s}
  <Popup/>
{/await}
