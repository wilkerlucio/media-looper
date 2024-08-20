<script lang="ts">
  import SpeedControl from "@/lib/components/SpeedControl.svelte";
  import Recorder from "@/lib/components/Recorder.svelte";
  import ActiveLoop from "@/lib/components/ActiveLoop.svelte";
  import {getContext} from "svelte";
  import type {Id, Queries, Relationships, Row, Store} from "tinybase";
  import {useQueriesResultTable} from "@/lib/tinybase/tinybase-stores";
  import LoopEntry from "@/lib/components/LoopEntry.svelte";
  import {loopTree} from "@/lib/misc/loop-tree";
  import {uniqBy} from 'lodash'
  import {partition} from "@/lib/helpers/array";
  import {formatTime, nowStamp, secondsFromTime} from "@/lib/helpers/time";
  import type {Loop} from "@/lib/model";
  import * as amplitude from '@amplitude/analytics-browser';

  const dashboardUrl = browser.runtime.getURL('/dashboard.html')

  export let sourceId: string

  let activeComponent: ActiveLoop
  let recorderComponent: Recorder

  const {store, relationships, queries}:
    { store: Store, relationships: Relationships, queries: Queries } = getContext('tinybase') || {};

  let video = document.querySelector("video")

  $: activeLoop = (sourceId ? null : null) as Id | null;

  function sourceInfo() {
    return {
      // @ts-ignore
      title: document.querySelector("#title h1")?.innerText,
      // @ts-ignore
      channel: document.querySelector("#container.ytd-channel-name")?.innerText
    }
  }

  function ensureMediaInfo() {
    console.log('ensure media');
    if (!store.getCell('medias', sourceId, 'title'))
      store.setRow('medias', sourceId, sourceInfo())
  }

  function videoChapters() {
    if (!video) return []

    const chapters = uniqBy(Array.from(document.querySelectorAll(".ytd-macro-markers-list-renderer ytd-macro-markers-list-item-renderer #details")).map((node) => {
      // @ts-ignore
      return {title: node.querySelector("h4")?.innerText, time: node.querySelector("#time")?.innerText}
    }), (x) => x.time)

    chapters.push({title: "END", time: formatTime(video.duration - 0.1, 3)})

    return chapters
  }

  $: {
    sourceId

    setTimeout(() => {
      const chapters = videoChapters()
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
    }, 1000)
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

    // @ts-ignore
    playLoop(store.addRow('loops', loop) || null)
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

      store.addRow('loops', loop)
    }
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

  $: if (Object.entries($loops).length > 0) ensureMediaInfo()
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
          active={activeLoop}
          on:select={selectLoop}
          on:duplicate={duplicateLoop}
          on:delete={deleteLoop}
      />
    {/each}
  </div>
  <div class="dashboard"><a href="{dashboardUrl}" target="_blank">Open Dashboard</a></div>
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
        padding: 6px 0;
    }

    .support-speed {
        display: flex;
    }

    .spacer {
        flex: 1;
    }

</style>
