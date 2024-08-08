<script lang="ts">
  import {locationStore} from "@/lib/stores/location";
  import {portal} from './Portal.svelte'

  function extractVideoId(url) {
    const matches = url.match(/watch.+v=([^&]+)/)

    return matches ? matches[1] : null
  }

  $: videoId = extractVideoId($locationStore)
</script>

{#if videoId}
  <button class="ytp-button" use:portal={{target: ".ytp-right-controls", position: 'start'}}>
    Meu botao
  </button>

  <div class="ytp-popup ytp-settings-menu ml-popup" use:portal={{target: ".html5-video-player"}}>
    <div>Popup contents</div>
  </div>
{/if}

<style>
  .ml-popup {
      /*display: none;*/
      height: calc(100% - 64px);
      overflow: hidden;
  }

  .ml-popup > div {
      padding: 10px 20px;
  }
</style>
