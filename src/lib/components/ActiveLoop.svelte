<script lang="ts">
  import {portal} from './Portal.svelte'
  import {getTinyContextForce, useRow} from "@/lib/tinybase/tinybase-stores";
  import type {Id} from "tinybase";
  import type {Loop} from "@/lib/model";

  let {video = document.querySelector("video"), id, loop: loopProp, oncomplete}: {
    video?: HTMLVideoElement | null,
    id: Id,
    loop?: Loop,
    oncomplete?: () => void
  } = $props()

  const store = getTinyContextForce('store')

  // Only use prop data for readonly loops (memory-only chapter loops)
  // For persisted loops, always load from TinyBase to get reactive updates
  let loopStore = $derived(loopProp?.readonly ? undefined : useRow<Loop>(store, 'loops', id))
  let loop = $derived((loopProp?.readonly ? loopProp : $loopStore) as Loop)
  let startTime = $derived(loop.startTime)

  let duration = $derived(video?.duration as number)

  let left = $derived(loop.startTime / duration * 100)
  let width = $derived((loop.endTime - loop.startTime) / duration * 100)

  // Remaining plays for finite loops. undefined/0 = infinite.
  // repeatCount = N plays the segment N times, then stops.
  let remaining = $state(0)

  $effect(() => {
    // Reset counter whenever the underlying loop id or its repeatCount changes.
    id
    remaining = loop.repeatCount && loop.repeatCount > 0 ? loop.repeatCount : 0
  })

  function ticker() {
    if (!video) return

    if (video.currentTime > loop.endTime) {
      const finite = loop.repeatCount && loop.repeatCount > 0
      if (finite) {
        remaining -= 1
        if (remaining <= 0) {
          oncomplete?.()
          return
        }
      }
      video.currentTime = loop.startTime
    }
  }

  $effect(() => {
    if (!video) return

    video.currentTime = startTime
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
