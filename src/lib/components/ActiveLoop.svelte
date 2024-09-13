<script lang="ts">
  import {portal} from './Portal.svelte'
  import {getTinyContextForce, useRow} from "@/lib/tinybase/tinybase-stores";
  import type {Id} from "tinybase";
  import type {Loop} from "@/lib/model";

  let {video = document.querySelector("video"), id}: {
    video: HTMLVideoElement | null,
    id: Id
  } = $props()

  const store = getTinyContextForce('store')

  let loopStore = $derived(useRow<Loop>(store, 'loops', id))
  let loop = $derived($loopStore)

  let duration = $derived(video?.duration as number)

  let left = $derived(loop.startTime / duration * 100)
  let width = $derived((loop.endTime - loop.startTime) / duration * 100)

  function ticker() {
    if (!video) return

    if (video.currentTime > loop.endTime) {
      video.currentTime = loop.startTime
    }
  }

  $effect(() => {
    if (!video) return

    video.currentTime = loop.startTime
  })

  $effect(() => {
    if (!video) return;

    video.addEventListener("timeupdate", ticker)

    return () => video.removeEventListener("timeupdate", ticker)
  })

  export function seekStart(preRoll = 0) {
    if (!video) return

    video.currentTime = Math.max(loop.startTime - preRoll, 0)
  }
</script>

<div class="bar" use:portal={{target: ".ytp-progress-bar"}} style:left={left + '%'} style:width={width + '%'}></div>

<style>

    .bar {
        position: absolute;
        height: 3px;
        background: rgb(5 255 0 / 50%);
        top: 1px;
        z-index: 100;
    }

</style>
