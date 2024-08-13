<script lang="ts">
  import Popup from "@/entrypoints/popup/Popup.svelte";
  import {setTinyBaseContext, setupStore} from "@/lib/stores/core";
  import {contentScriptListen} from "@/lib/misc/chrome-network";
  import Admin from "@/entrypoints/admin/Admin.svelte";

  const ctx = setupStore({csConn: contentScriptListen({})});
  setTinyBaseContext(ctx)

  // @ts-ignore
  window.store = ctx
</script>

{#await ctx.ready then s}
  <Admin/>
{/await}
