<script lang="ts">
  // import {setTinyBaseContext, setupStore} from "@/lib/stores/core";
  import Popup from "@/lib/components/Popup.svelte";
  import {setupRepo, setupStore} from "@/lib/stores/core";
  import {backgroundListen} from "@/lib/misc/chrome-network";

  const backConn = backgroundListen()
  const ctx = setupStore({persist: true, backConn})

  window.store = ctx.store
</script>

<!--{#await ctx.ready then s}-->
<!--  <Popup />-->
<!--{/await}-->

