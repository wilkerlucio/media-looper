<script lang="ts">
  import {locationStore} from "@/lib/stores/location";
  import {portal} from './Portal.svelte'
  import LoopsController from "@/lib/components/LoopsController.svelte";
  import {logoData} from "@/lib/misc/app-icon";
  import {setupStore} from "@/lib/stores/core";
  import * as amplitude from '@amplitude/analytics-browser';
  import {channelListener, channelSender, pullListener, runtimeOnMessageSender} from "@/lib/misc/browser-network";
  import {setTinyContext} from "@/lib/tinybase/tinybase-stores";
  import {extractVideoId} from "@/lib/youtube/ui";
  import {createLocalPersister} from "tinybase/persisters/persister-browser";

  const ctx = setupStore({
    listener: channelListener(pullListener(), 'tiny-sync'),
    sender: channelSender(runtimeOnMessageSender, 'tiny-sync'),
    localOptions: {
      listener: channelListener(pullListener(), 'tiny-sync-local-settings'),
      sender: channelSender(runtimeOnMessageSender, 'tiny-sync-local-settings'),
      persister: (store) => createLocalPersister(store, 'youtube-looper-tb-local')
    }
  });

  setTinyContext(ctx)

  let popupVisible = false

  $: videoId = extractVideoId($locationStore)
  $: sourceId = (videoId ? "youtube:" + videoId : null) as string | null

  function toggleVisible() {
    if (popupVisible) {
      amplitude.track('Open Dialog', {sourceId})
      popupVisible = false
    } else {
      amplitude.track('Close Dialog', {sourceId})
      popupVisible = true
    }
  }

</script>

<svelte:head>
  <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css" />
</svelte:head>

{#await ctx.ready then x}
  {#if sourceId}
    <button class="ytp-button" use:portal={{target: ".ytp-right-controls", position: 'start'}} on:click={toggleVisible}>
      <img src={logoData} alt="Youtube Looper" />
    </button>

    <div class="ytp-popup ytp-settings-menu ml-popup" class:popupVisible use:portal={{target: ".html5-video-player"}}>
      <LoopsController {sourceId} />
    </div>
  {/if}
{/await}

<style>

    img {
        display: block;
        width: 32px;
    }

    .ml-popup {
        display: none;
        height: calc(100% - 72px);
        top: 8px;
        overflow: hidden;
    }

    .ml-popup.popupVisible {
        display: block;
    }

</style>
