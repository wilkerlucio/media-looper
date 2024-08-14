<script lang="ts">
  import Popup from "@/entrypoints/popup/Popup.svelte";
  import {setTinyBaseContext, setupStore} from "@/lib/stores/core";
  import {contentScriptListen} from "@/lib/misc/chrome-network";

  const ctx = setupStore({
    listener: contentScriptListen(),
    sender: browser.runtime
  });

  setTinyBaseContext(ctx)

  // @ts-ignore
  window.store = ctx.store
</script>

{#await ctx.ready then s}
  <Popup/>
{/await}
