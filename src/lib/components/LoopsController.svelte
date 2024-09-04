<script lang="ts">
  import SpeedControl from "@/lib/components/SpeedControl.svelte";
  import Recorder from "@/lib/components/Recorder.svelte";
  import ActiveLoop from "@/lib/components/ActiveLoop.svelte";
  import {getContext, onMount} from "svelte";
  import type {Id, Queries, Relationships, Row, Store} from "tinybase";
  import {useQueriesResultTable, useValue} from "@/lib/tinybase/tinybase-stores";
  import LoopEntry from "@/lib/components/LoopEntry.svelte";
  import {loopTree} from "@/lib/misc/loop-tree";
  import {partition} from "@/lib/helpers/array";
  import {secondsFromTime} from "@/lib/helpers/time";
  import type {Loop} from "@/lib/model";
  import * as amplitude from '@amplitude/analytics-browser';
  import {sourceInfo, videoChapters, videoIdFromSourceId} from "@/lib/youtube/ui";
  import {channelSender, runtimeOnMessageSender} from "@/lib/misc/browser-network";
  import ConnectionStatusIndicator from "@/lib/components/ConnectionStatusIndicator.svelte";
  import {nanoid} from "nanoid";
  import {cutLoop} from "@/lib/controller";
  import {videoCurrentTimeStore} from "@/lib/stores/video";

  const dashboardUrl = browser.runtime.getURL('/dashboard.html')

  export let sourceId: string

  let activeComponent: ActiveLoop
  let recorderComponent: Recorder

  const {store}: { store: Store } = getContext('tinybase') || {};

  let video = document.querySelector("video")

  $: activeLoop = null as Id | null;

  function ensureMediaInfo() {
    if (!store.getCell('medias', sourceId, 'title')) {
      const info = sourceInfo()

      if (info) store.setPartialRow('medias', sourceId, info)
    }
  }

  $: {
    sourceId

    const chapters = videoChapters(video)
    const groups = partition(chapters, 2, 1)
    const loops = groups.map(([a, b]) => {
      return {
        id: sourceId + '-' + a.time,
        label: a.title,
        startTime: secondsFromTime(a.time),
        endTime: secondsFromTime(b.time),
        source: sourceId,
        readonly: true
      }
    })

    if (loops.length > 0) {
      ensureMediaInfo()
    }

    for (const {id, ...loop} of loops) {
      store.setRow('loops', id, loop as Row)
    }
  }

  function log(event: string, details?: {[key: string]: any}) {
    amplitude.track(event, {sourceId, ...details})
  }

  function loopLogDetail(loopId: Id) {
    return {label: store.getCell('loops', loopId, 'label')}
  }

  function playLoop(loopId: Id) {
    store.setCell('medias', sourceId, 'lastLoopPlay', Date.now())

    activeLoop = loopId
  }

  // region: event handlers

  function createLoop(loop: Loop) {
    ensureMediaInfo()

    loop.source = sourceId

    log('Create Loop', loop)

    const loopId = nanoid()

    // @ts-ignore
    store.setRow('loops', loopId, loop)

    playLoop(loopId)
  }

  function selectLoop(e: any) {
    const id = e.detail.id

    if (activeLoop === id) {
      log('Stop Loop', loopLogDetail(id))

      activeLoop = null
    } else {
      if (activeLoop) log('Stop Loop', loopLogDetail(activeLoop))

      log('Start Loop', loopLogDetail(id))

      playLoop(id)
    }
  }

  function duplicateLoop(e: any) {
    const loop = store.getRow('loops', e.detail.id)

    if (loop) {
      loop.readonly = false

      log('Duplicate Loop', loop)

      const loopId = nanoid()

      store.setRow('loops', loopId, loop)
    }
  }

  function divideLoop(e: any) {
    log('Cut Loop', loopLogDetail(e.detail.id))

    cutLoop(store, e.detail.id, video?.currentTime)
  }

  function deleteLoop(e: any) {
    if (activeLoop === e.detail.id) {
      activeLoop = null
    }

    log('Remove Loop', loopLogDetail(e.detail.id))

    store.delRow('loops', e.detail.id)
  }

  // endregion

  $: queryId = "loopsQ:" + sourceId

  $: loops = useQueriesResultTable(queryId, 'loops', ({select, where}) => {
    select('startTime')
    select('endTime')
    where('source', sourceId)
  })

  // @ts-ignore
  $: sortedLoops = loopTree($loops)

  function shortcutsHandler(e: KeyboardEvent) {
    if (e.altKey && e.code === 'KeyZ') {
      if (activeComponent) {
        activeComponent.seekStart(e.shiftKey ? 3 : 0)
      } else {
        recorderComponent.record()
      }
    }
  }

  // broadcast the media info from this page so it can be used in places like the import screen to get the name of
  // media being imported
  onMount(() => {
    const sender = channelSender(runtimeOnMessageSender, 'embed-media-info')

    sender({sourceId, ...sourceInfo() || {}})
  })

  // automatic import data from a previous version when available
  onMount(async () => {
    const previousData = await browser.storage.sync.get(`"media-looper:youtube:${videoIdFromSourceId(sourceId)}"`)

    if (previousData) {
      const sender = channelSender(runtimeOnMessageSender, 'import-from-previous')

      sender({sourceId, info: sourceInfo(), edn: previousData})
    }
  })

  $: if (Object.entries($loops).length > 0) ensureMediaInfo()

  const connectionStatus = useValue('websocket-server-status')

  $: currentTimeStore = videoCurrentTimeStore(video)

</script>

<svelte:document on:keydown={shortcutsHandler} />

<div class="container">
  <Recorder {video} on:newLoop={(e) => createLoop(e.detail)} bind:this={recorderComponent}/>
  <div class="loops">
    {#each sortedLoops as [id, {children}] (id)}
      <LoopEntry
          {id}
          {children}
          {video}
          currentTime={$currentTimeStore}
          active={activeLoop}
          on:select={selectLoop}
          on:duplicate={duplicateLoop}
          on:cut={divideLoop}
          on:delete={deleteLoop}
      />
    {/each}
  </div>
  <div class="dashboard">
    <a href="{dashboardUrl}" target="_blank">Open Dashboard</a>
    <div class="spacer"></div>
    <ConnectionStatusIndicator/>
  </div>
  <div class="support-speed">
    <div><a href="https://www.patreon.com/wsscode" on:click={() => log('Click support link')} target="_blank">Support my work</a></div>
    <div class="spacer"></div>
    <SpeedControl {video}/>
  </div>
</div>

{#if activeLoop}
  <ActiveLoop {video} id={activeLoop} bind:this={activeComponent}/>
{/if}

<style>

    .container {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 500px;
        padding: 11px 13px;
    }

    .loops {
        flex: 1;
        overflow-y: auto
    }

    .dashboard {
        display: flex;
        align-items: center;
        padding: 6px 0;
    }

    .support-speed {
        display: flex;
    }

    .spacer {
        flex: 1;
    }

</style>
