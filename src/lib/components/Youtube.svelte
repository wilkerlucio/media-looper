<script lang="ts">
  import {locationStore} from "@/lib/stores/location";
  import {portal} from './Portal.svelte'
  import LoopsController from "@/lib/components/LoopsController.svelte";
  import {logoData} from "@/lib/misc/app-icon";
  import {setupStore} from "@/lib/stores/core";
  import {channelListener, channelSender, pullListener, runtimeOnMessageSender} from "@/lib/misc/browser-network";
  import {setTinyContext} from "@/lib/tinybase/tinybase-stores";
  import {extractMediaId} from "@/lib/youtube/ui";
  import {createLocalPersister} from "tinybase/persisters/persister-browser";
  import {trackEvent} from "@/lib/misc/analytics";
  import type {Id} from "tinybase";
  import ActiveLoop from "@/lib/components/ActiveLoop.svelte";
  import JumpBack from "@/lib/components/JumpBack.svelte";
  import type {Loop} from "@/lib/model";
  import {clearUrlLoopParams, readUrlLoopParams} from "@/lib/helpers/url-loop";

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

  let videoId = $derived(extractMediaId($locationStore))
  let sourceId = $derived(videoId ? "youtube:" + videoId : null) as string | null

  // need to use in this format so it clears the loop when the video changes
  let activeLoop = $state(null) as Id | null;
  let popupVisible = $state(false) as boolean;

  // Ephemeral loop from URL params (?start=&end=&loop=). Not persisted.
  let urlLoop = $state<Loop | null>(null)
  const URL_LOOP_ID = '__url_loop__'

  $effect.pre(() => {
    sourceId
    activeLoop = null
    popupVisible = false
    urlLoop = null
  })

  let activeComponent: ActiveLoop | undefined = $state()
  let controllerComponent: LoopsController | undefined = $state()
  let jumpBackComponent: JumpBack | undefined = $state();

  // Get loop data from controller (includes both persisted and memory-only chapter loops)
  let activeLoopData = $derived(
    activeLoop === URL_LOOP_ID
      ? urlLoop ?? undefined
      : (activeLoop && controllerComponent ? controllerComponent.getLoop(activeLoop) : undefined)
  )

  // Apply URL params when the video for this sourceId is ready.
  $effect(() => {
    sourceId // re-run when video changes
    if (!sourceId) return

    const params = readUrlLoopParams()
    if (params.start == null && params.end == null && params.repeatCount == null) return

    const video = document.querySelector('video') as HTMLVideoElement | null
    if (!video) return

    const armed = { done: false, cancelled: false }

    const arm = () => {
      if (armed.done || armed.cancelled) return
      const duration = video.duration
      if (!isFinite(duration) || duration <= 0) return

      // Require at least one of start/end to define a real segment. Bare ?loop=N
      // without start/end is ambiguous — ignore and clear.
      if (params.start == null && params.end == null) {
        clearUrlLoopParams()
        armed.done = true
        return
      }

      const start = params.start != null ? Math.max(0, Math.min(params.start, duration)) : 0
      const end = params.end != null ? Math.max(0, Math.min(params.end, duration)) : duration
      if (!(end > start)) {
        clearUrlLoopParams()
        armed.done = true
        return
      }

      // Wait for the persister to finish hydrating before we look for a match —
      // otherwise store.getTable('loops') can be empty on first paint and we'd
      // incorrectly fall through to the Save banner.
      ctx.ready.then(() => {
        if (armed.done || armed.cancelled) return

        // If a saved loop for this video already matches (within 1s on each side),
        // just activate it and skip the ephemeral loop + Save banner.
        const MATCH_TOLERANCE = 1.0
        const loopsTable = ctx.store.getTable('loops') as {[k: Id]: any}
        let matchId: Id | null = null
        for (const [rowId, row] of Object.entries(loopsTable)) {
          if (row?.source !== sourceId) continue
          if (row.readonly) continue
          const dStart = Math.abs((row.startTime ?? 0) - start)
          const dEnd = Math.abs((row.endTime ?? 0) - end)
          if (dStart <= MATCH_TOLERANCE && dEnd <= MATCH_TOLERANCE) { matchId = rowId; break }
        }

        if (matchId) {
          ctx.store.setCell('medias', sourceId!, 'lastLoopPlay', Date.now())
          activeLoop = matchId
          clearUrlLoopParams()
          log('start_loop', {label: 'url-param-match'})
          armed.done = true
          return
        }

        urlLoop = {
          startTime: start,
          endTime: end,
          label: 'Loop from URL',
          source: sourceId!,
          readonly: true,
          repeatCount: params.repeatCount ?? 0,
        }
        activeLoop = URL_LOOP_ID
        clearUrlLoopParams()
        log('start_loop', {label: 'url-param'})
        armed.done = true
      })
    }

    // Try now, then wait for metadata if needed.
    arm()
    if (!armed.done) {
      const onReady = () => arm()
      video.addEventListener('loadedmetadata', onReady, { once: true })
      video.addEventListener('durationchange', onReady, { once: true })
      return () => {
        armed.cancelled = true
        video.removeEventListener('loadedmetadata', onReady)
        video.removeEventListener('durationchange', onReady)
      }
    }
  })

  function log(event: string, details?: {[key: string]: any}) {
    trackEvent(event, {
      source_id: sourceId,
      ...details
    });
  }

  function loopLogDetail(loopId: Id) {
    // Try to get from controller (includes memory-only loops), fallback to store
    const loop = controllerComponent?.getLoop(loopId)
    return {label: loop?.label || ctx.store.getCell('loops', loopId, 'label')}
  }

  function toggleVisible() {
    if (popupVisible) {
      log('open_dialog')
      popupVisible = false
    } else {
      log('close_dialog')
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
      log('stop_loop', loopLogDetail(id))

      activeLoop = null
    } else {
      if (activeLoop) log('stop_loop', loopLogDetail(activeLoop))

      log('start_loop', loopLogDetail(id))

      playLoop(id)
    }
  }

  function saveUrlLoop() {
    if (!urlLoop || !controllerComponent) return
    // Label from the time range, e.g. "0:43 – 1:15"
    const fmt = (t: number) => {
      const m = Math.floor(t / 60)
      const s = Math.floor(t % 60).toString().padStart(2, '0')
      return `${m}:${s}`
    }
    const label = `${fmt(urlLoop.startTime)} – ${fmt(urlLoop.endTime)}`
    const payload: Partial<Loop> = {
      startTime: urlLoop.startTime,
      endTime: urlLoop.endTime,
      label,
    }
    if (urlLoop.repeatCount && urlLoop.repeatCount > 0) {
      payload.repeatCount = urlLoop.repeatCount
    }
    log('save_url_loop', {label})
    controllerComponent.saveLoop(payload)
    // saveLoop -> createLoop -> onselect fires and sets activeLoop to the new id.
    // Clear the ephemeral loop so the banner disappears.
    urlLoop = null
  }

  function dismissUrlLoop() {
    if (activeLoop === URL_LOOP_ID) activeLoop = null
    urlLoop = null
  }

  function shortcutsHandler(e: KeyboardEvent) {
    if (e.altKey && e.code === "KeyV") {
      toggleVisible();
    }
    if (e.altKey && e.code === "KeyZ") {
      if (activeComponent) {
        activeComponent.seekStart(e.shiftKey ? 3 : 0);
      } else {
        if (controllerComponent) controllerComponent.record();
      }
    }
    if (e.altKey && e.code === "KeyX") {
      if (activeLoop) {
        log('stop_loop', loopLogDetail(activeLoop));
        activeLoop = null;
      }
    }
    if (e.altKey && e.code === "KeyS") {
      if (controllerComponent) {
        controllerComponent.decreaseSpeed(e.shiftKey);
      }
    }
    if (e.altKey && e.code === "KeyD") {
      if (controllerComponent) {
        controllerComponent.increaseSpeed(e.shiftKey);
      }
    }
    if (e.altKey && e.code === "KeyF") {
      if (controllerComponent) {
        controllerComponent.setSpeed(1);
      }
    }
    if (e.altKey && e.code === "KeyG") {
      if (controllerComponent) {
        controllerComponent.setSpeed(2);
      }
    }
    if (e.altKey && e.code.match(/^Digit[1-9]$/)) {
      if (controllerComponent) {
        const speed = parseInt(e.code.slice(-1)) / 10;
        controllerComponent.setSpeed(speed);
      }
    }
    if (e.altKey && e.code === "KeyB") {
      if (jumpBackComponent) {
        jumpBackComponent.backToStart();
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
    <button class="ytp-button" use:portal={{target: [".ytp-right-controls .ytp-right-controls-left", ".ytp-right-controls"], position: 'end'}} onclick={toggleVisible}>
      <div class="button-inner-container">
        <img src={logoData} alt="Youtube Looper" />
      </div>
    </button>

    {#if activeLoop}
      <ActiveLoop id={activeLoop} loop={activeLoopData} bind:this={activeComponent}/>
    {/if}

      <div class="ytp-popup ytp-settings-menu ml-popup" use:portal={{target: ".html5-video-player"}} style="display: {popupVisible ? 'block' : 'none'}">
        <LoopsController
            {sourceId}
            {activeLoop}
            onselect={selectLoop}
            urlLoop={activeLoop === URL_LOOP_ID ? urlLoop : null}
            onsaveUrlLoop={saveUrlLoop}
            ondismissUrlLoop={dismissUrlLoop}
            bind:this={controllerComponent}
        />
        <JumpBack bind:this={jumpBackComponent} />
      </div>
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
        justify-content: center;
    }

    .ml-popup {
        display: block;
        height: calc(100% - 72px);
        top: 8px;
        overflow: hidden;
    }

</style>
