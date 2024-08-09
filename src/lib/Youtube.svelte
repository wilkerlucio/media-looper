<script lang="ts">
  import {locationStore} from "@/lib/stores/location";
  import {portal} from './Portal.svelte'
  import LoopsController from "@/lib/LoopsController.svelte";
  import {setContext} from "svelte";
  import {createQueries, createRelationships, createStore, type Relationships, type Store} from "tinybase";
  import {createLocalPersister} from "tinybase/persisters/persister-browser";
  import {logoData} from "@/lib/misc/app-icon";

  const store: Store = createStore();

  const relationships: Relationships = createRelationships(store);
  relationships.setRelationshipDefinition('mediaLoops', 'loops', 'medias', 'source')

  const queries = createQueries(store);

  setContext('tinybase', {
    store, relationships, queries
  });

  const persister = createLocalPersister(store, 'media-looper');

  const wait = Promise.all([
    persister.startAutoLoad(),
    persister.startAutoSave()
  ])

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

{#await wait then x}
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
      height: calc(100% - 64px);
      overflow: hidden;
  }

  .ml-popup.popupVisible {
      display: block;
  }
</style>
