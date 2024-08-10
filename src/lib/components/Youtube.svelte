<script lang="ts">
  import {locationStore} from "@/lib/stores/location";
  import {portal} from './Portal.svelte'
  import LoopsController from "@/lib/components/LoopsController.svelte";
  import {logoData} from "@/lib/misc/app-icon";
  import {setupStore} from "@/lib/stores/core";

  const store = setupStore();

  function extractVideoId(url) {
    const matches = url.match(/watch.+v=([^&]+)/)

    return matches ? matches[1] : null
  }

  let popupVisible = false

  $: videoId = extractVideoId($locationStore)
  $: sourceId = videoId ? "youtube:" + videoId : null
</script>

<svelte:head>
  <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css" />
</svelte:head>

{#await store then x}
  {#if videoId}
    <button class="ytp-button" use:portal={{target: ".ytp-right-controls", position: 'start'}} on:click={() => popupVisible = !popupVisible}>
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
