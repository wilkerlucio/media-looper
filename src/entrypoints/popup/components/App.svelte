<script lang="ts">
  import Popup from "@/entrypoints/popup/components/Popup.svelte";
  import {setTinyBaseContext, setupStore} from "@/lib/stores/core";
  import {contentScriptListen} from "@/lib/misc/chrome-network";

  const ctx = setupStore({
    listener: browser.runtime.onMessage,
    sender: browser.runtime
  });

  setTinyBaseContext(ctx)

  // @ts-ignore
  window.store = ctx.store
</script>

{#await ctx.ready}
  <div>Initializing...</div>
{:then x}
  <Popup/>
{/await}
