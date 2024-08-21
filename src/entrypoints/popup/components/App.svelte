<script lang="ts">
  import Popup from "@/entrypoints/popup/components/Popup.svelte";
  import {setupStore} from "@/lib/stores/core";
  import {setTinyContext} from "@/lib/tinybase/tinybase-stores";
  import {
    channelListener,
    channelSender,
    runtimeOnMessageListener,
    runtimeOnMessageSender
  } from "@/lib/misc/chrome-network";

  const ctx = setupStore({
    listener: channelListener(runtimeOnMessageListener, 'tiny-sync'),
    sender: channelSender(runtimeOnMessageSender, 'tiny-sync')
  });

  setTinyContext(ctx)

  // @ts-ignore
  window.store = ctx.store
</script>

{#await ctx.ready then s}
  <Popup/>
{/await}
