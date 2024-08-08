<script lang="ts">
  import {locationStore} from "@/lib/stores/location";
  import {portal} from './Portal.svelte'
  import LoopsController from "@/lib/LoopsController.svelte";

  function extractVideoId(url) {
    const matches = url.match(/watch.+v=([^&]+)/)

    return matches ? matches[1] : null
  }

  let popupVisible = false

  $: videoId = extractVideoId($locationStore)
  $: sourceId = videoId ? "youtube:" + videoId : null
</script>

{#if videoId}
  <button class="ytp-button" use:portal={{target: ".ytp-right-controls", position: 'start'}} on:click={() => popupVisible = !popupVisible}>
    Meu botao
  </button>

  <div class="ytp-popup ytp-settings-menu ml-popup" class:popupVisible use:portal={{target: ".html5-video-player"}}>
    <LoopsController {sourceId} />
  </div>
{/if}

<style>
  .ml-popup {
      display: none;
      height: calc(100% - 64px);
      overflow: hidden;
  }

  .ml-popup.popupVisible {
      display: block;
  }
</style>
