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
  import {onMount} from "svelte";

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

  // Cleanup routine to remove readonly loops from database
  onMount(async () => {
    await ctx.ready

    const loopsTable = ctx.store.getTable('loops')
    const readonlyLoopIds: string[] = []

    // Find all loops marked as readonly
    for (const [loopId, loop] of Object.entries(loopsTable)) {
      if (loop.readonly === true) {
        readonlyLoopIds.push(loopId)
      }
    }

    // Remove readonly loops
    if (readonlyLoopIds.length > 0) {
      console.log(`Cleaning up ${readonlyLoopIds.length} readonly chapter loops from database`)
      for (const loopId of readonlyLoopIds) {
        ctx.store.delRow('loops', loopId)
      }
    }
  })
</script>

{#await ctx.ready then s}
  <Dashboard/>
{/await}
