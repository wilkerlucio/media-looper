<script lang="ts">
  import {setupStore} from "@/lib/stores/core";
  import {setTinyContext} from "@/lib/tinybase/tinybase-stores";
  import {
    channelListener,
    channelSender,
    runtimeOnMessageListener,
    runtimeOnMessageSender
  } from "@/lib/misc/browser-network";
  import Dashboard from "@/entrypoints/dashboard/components/Dashboard.svelte";
  import {createLocalPersister} from "tinybase/persisters/persister-browser";

  const ctx = setupStore({
    listener: channelListener(runtimeOnMessageListener, 'tiny-sync'),
    sender: channelSender(runtimeOnMessageSender, 'tiny-sync'),
    localOptions: {
      listener: channelListener(runtimeOnMessageListener, 'tiny-sync-local-settings'),
      sender: channelSender(runtimeOnMessageSender, 'tiny-sync-local-settings'),
      persister: (store) => createLocalPersister(store, 'youtube-looper-tb-local')
    }
  });
  setTinyContext(ctx)

  // @ts-ignore
  window.store = ctx
</script>

{#await ctx.ready then s}
  <Dashboard/>
{/await}
