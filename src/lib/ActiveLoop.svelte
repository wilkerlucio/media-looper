<script lang="ts">
  import {portal} from './Portal.svelte'
  import {onDestroy, onMount} from "svelte";

  export let startTime: number;
  export let endTime: number;
  export let duration: number;

  $: left = startTime / duration * 100
  $: width = (endTime - startTime) / duration * 100

  let video = document.querySelector("video")

  function ticker(e) {
    if (!video) return

    if (video.currentTime > endTime) {
      video.currentTime = startTime
    }
  }

  onMount(() => {
    video?.addEventListener("timeupdate", ticker)
  })

  onDestroy(() => {
    video?.removeEventListener("timeupdate", ticker)
  })
</script>

<div class="bar" use:portal={{target: ".ytp-progress-bar"}} style:left={left + '%'} style:width={width + '%'}></div>

<style>

    .bar {
        position: absolute;
        height: 3px;
        background: rgb(5 255 0 / 71%);
        top: 1px;
        z-index: 100;
    }

</style>
