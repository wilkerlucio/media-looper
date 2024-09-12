<script lang="ts">
  import {useLocation} from "@/lib/stores/location.svelte";
  import {portal} from './Portal.svelte'
  import LoopsController from "@/lib/components/LoopsController.svelte";
  import {logoData} from "@/lib/misc/app-icon";
  import {setupStore} from "@/lib/stores/core";
  import * as amplitude from '@amplitude/analytics-browser';
  import {channelListener, channelSender, pullListener, runtimeOnMessageSender} from "@/lib/misc/browser-network";
  import {setTinyContext} from "@/lib/tinybase/tinybase-stores.svelte";
  import {extractMediaId} from "@/lib/youtube/ui";
  import {createLocalPersister} from "tinybase/persisters/persister-browser";
  import type {Id} from "tinybase";
  import ActiveLoop from "@/lib/components/ActiveLoop.svelte";

  const ctx = setupStore({
    listener: channelListener(pullListener(), 'tiny-sync'),
    sender: channelSender(runtimeOnMessageSender, 'tiny-sync'),
    localOptions: {
      listener: channelListener(pullListener({pullInterval: 5000}), 'tiny-sync-local-settings'),
      sender: channelSender(runtimeOnMessageSender, 'tiny-sync-local-settings'),
      persister: (store) => createLocalPersister(store, 'youtube-looper-tb-local')
    }
  });

  setTinyContext(ctx)

  let location = useLocation()
  let videoId = $derived(extractMediaId(location.value))
  let sourceId = $derived(videoId ? "youtube:" + videoId : null) as string | null

  // need to use in this format so it clears the loop when the video changes
  let activeLoop = $state(null) as Id | null;
  let popupVisible = $state(false) as boolean;

  $effect.pre(() => {
    sourceId
    activeLoop = null
    popupVisible = false
  })

  let activeComponent: ActiveLoop | undefined = $state()
  let controllerComponent: LoopsController | undefined = $state()

  function log(event: string, details?: {[key: string]: any}) {
    amplitude.track(event, {sourceId, ...details})
  }

  function loopLogDetail(loopId: Id) {
    return {label: ctx.store.getCell('loops', loopId, 'label')}
  }

  function toggleVisible() {
    if (popupVisible) {
      amplitude.track('Open Dialog', {sourceId})
      popupVisible = false
    } else {
      amplitude.track('Close Dialog', {sourceId})
      popupVisible = true
    }
  }

  function playLoop(loopId: Id) {
    if (!sourceId) return

    ctx.store.setCell('medias', sourceId, 'lastLoopPlay', Date.now())

    activeLoop = loopId
  }

  function selectLoop(e: any) {
    const id = e.id

    if (activeLoop === id) {
      log('Stop Loop', loopLogDetail(id))

      activeLoop = null
    } else {
      if (activeLoop) log('Stop Loop', loopLogDetail(activeLoop))

      log('Start Loop', loopLogDetail(id))

      playLoop(id)
    }
  }

  function shortcutsHandler(e: KeyboardEvent) {
    if (e.altKey && e.code === 'KeyZ') {
      if (activeComponent) {
        activeComponent.seekStart(e.shiftKey ? 3 : 0)
      } else {
        if (controllerComponent)
          controllerComponent.record()
      }
    }
  }

</script>

<svelte:head>
  <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css" />
</svelte:head>

<svelte:document on:keydown={shortcutsHandler} />

{#await ctx.ready then x}
  {#if sourceId}
    <button class="ytp-button" use:portal={{target: ".ytp-right-controls", position: 'start'}} onclick={toggleVisible}>
      <div class="button-inner-container">
        <img src={logoData} alt="Youtube Looper" />
      </div>
    </button>

    {#if activeLoop}
      <ActiveLoop id={activeLoop} bind:this={activeComponent}/>
    {/if}

    {#if popupVisible}
      <div class="ytp-popup ytp-settings-menu ml-popup" use:portal={{target: ".html5-video-player"}}>
        <LoopsController
            {sourceId}
            {activeLoop}
            onselect={selectLoop}
            bind:this={controllerComponent}
        />
      </div>
    {/if}
  {/if}
{/await}

<style>

    img {
        display: block;
        width: 32px;
    }

    .ytp-button {
        float: left;
    }

    .button-inner-container {
        width: 100%;
        height: 100%;
        display: inline-flex;
        align-items: center;
    }

    .ml-popup {
        display: block;
        height: calc(100% - 72px);
        top: 8px;
        overflow: hidden;
    }

</style>
