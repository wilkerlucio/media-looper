<script lang="ts">
  import {setupStore} from "@/lib/stores/core";
  import {setTinyContext} from "@/lib/tinybase/tinybase-stores";
  import {
    channelListener,
    channelSender,
    runtimeOnMessageListener,
    runtimeOnMessageSender
  } from "@/lib/misc/chrome-network";
  import Dashboard from "@/entrypoints/dashboard/components/Dashboard.svelte";

  const ctx = setupStore({
    listener: channelListener(runtimeOnMessageListener, 'tiny-sync'),
    sender: channelSender(runtimeOnMessageSender, 'tiny-sync')
  });
  setTinyContext(ctx)

  // @ts-ignore
  window.store = ctx
</script>

{#await ctx.ready then s}
  <Dashboard/>
{/await}
