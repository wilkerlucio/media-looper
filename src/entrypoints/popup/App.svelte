<script lang="ts">
  import Popup from "@/lib/components/Popup.svelte";
  import {setTinyBaseContext, setupStore} from "@/lib/stores/core";
  import {contentScriptListen} from "@/lib/misc/chrome-network";

  const ctx = setupStore({csConn: contentScriptListen({})});
  setTinyBaseContext(ctx)

  // @ts-ignore
  window.store = ctx
</script>

{#await ctx.ready then s}
  <Popup/>
{/await}
