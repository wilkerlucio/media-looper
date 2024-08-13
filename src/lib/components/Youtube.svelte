<script lang="ts">
  import {locationStore} from "@/lib/stores/location";
  import {portal} from './Portal.svelte'
  import LoopsController from "@/lib/components/LoopsController.svelte";
  import {logoData} from "@/lib/misc/app-icon";
  import {setTinyBaseContext, setupStore} from "@/lib/stores/core";
  import * as amplitude from '@amplitude/analytics-browser';
  import {contentScriptListen} from "@/lib/misc/chrome-network";

  const ctx = setupStore({csConn: contentScriptListen({})});

  setTinyBaseContext(ctx)

  function extractVideoId(url: string) {
    const matches = url.match(/watch.+v=([^&]+)/)

    return matches ? matches[1] : null
  }

  let popupVisible = false

  $: videoId = extractVideoId($locationStore)
  $: sourceId = (videoId ? "youtube:" + videoId : null) as string | null

  function toggleVisible() {
    console.log('tables', ctx.store.getTables());

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
        height: 20px;
        margin-bottom: 15px;
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
