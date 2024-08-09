<script lang="ts">
  import {locationStore} from "@/lib/stores/location";
  import {portal} from './Portal.svelte'
  import LoopsController from "@/lib/LoopsController.svelte";
  import {setContext} from "svelte";
  import {createRelationships, createStore, type Relationships, type Store} from "tinybase";
  import {createLocalPersister} from "tinybase/persisters/persister-browser";

  let loaded = false

  const store: Store = createStore();

  const relationships: Relationships = createRelationships(store);
  relationships.setRelationshipDefinition('mediaLoops', 'loops', 'medias', 'source')

  setContext('tinybase', {
    store, relationships
  });

  const persister = createLocalPersister(store, 'media-looper');

  persister.startAutoLoad().then(() => loaded = true);
  persister.startAutoSave();

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
