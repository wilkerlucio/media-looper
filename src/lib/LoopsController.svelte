<script lang="ts">
  import SpeedControl from "@/lib/SpeedControl.svelte";
  import Recorder from "@/lib/Recorder.svelte";
  import ActiveLoop from "@/lib/ActiveLoop.svelte";
  import {getContext} from "svelte";
  import type {Queries, Relationships, Store} from "tinybase";
  import {useQueriesResultTable, useRelationshipLocalRowIds} from "@/lib/stores/tinybase-stores";
  import LoopEntry from "@/lib/LoopEntry.svelte";
  import {loopTree} from "@/lib/misc/loop-tree";

  export let sourceId: string

  const {store, relationships, queries}:
    { store: Store, relationships: Relationships, queries: Queries } = getContext('tinybase') || {};

  let video = document.querySelector("video")
  $: activeLoop = sourceId ? null : null;

  function sourceInfo() {
    return {
      title: document.querySelector("#title h1").innerText,
      channel: document.querySelector("#container.ytd-channel-name").innerText
    }
  }

  function createLoop(loop) {
    if (Object.keys(store.getRow('medias', sourceId)).length === 0)
      store.setRow('medias', sourceId, sourceInfo())

    loop.source = sourceId

    activeLoop = store.addRow('loops', loop)
  }

  function selectLoop(e) {
    const id = e.detail.id
    activeLoop = activeLoop === id ? null : id
  }

  function duplicateLoop(e) {
    const loop = store.getRow('loops', e.detail.id)

    if (loop) {
      store.addRow('loops', loop)
    }
  }

  function deleteLoop(e) {
    if (activeLoop === e.detail.id) {
      activeLoop = null
    }

    store.delRow('loops', e.detail.id)
  }

  $: queryId = "loopsQ:" + sourceId

  $: loops = useQueriesResultTable(queryId, 'loops', ({select, where}) => {
    select('startTime')
    select('endTime')
    where('source', sourceId)
  })

  $: sortedLoops = loopTree($loops)
</script>

<div class="container">
  <Recorder {video} on:newLoop={(e) => createLoop(e.detail)}/>
  {#each sortedLoops as [id, {children}] (id)}
    <LoopEntry
      {id}
      {children}
      active={activeLoop}
      on:select={selectLoop}
      on:duplicate={duplicateLoop}
      on:delete={deleteLoop}
    />
  {/each}
  <div class="spacer"></div>
  <div class="support-speed">
    <div><a href="https://www.patreon.com/wsscode" target="_blank">Support my work</a></div>
    <div class="spacer"></div>
    <SpeedControl {video}/>
  </div>
</div>

{#if activeLoop}
  <ActiveLoop {video} id={activeLoop}/>
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

    .support-speed {
        display: flex;
    }

    .spacer {
        flex: 1;
    }

</style>
