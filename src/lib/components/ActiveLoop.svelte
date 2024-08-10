<script lang="ts">
  import {portal} from './Portal.svelte'
  import {onDestroy, onMount} from "svelte";
  import {useRow} from "@/lib/stores/tinybase-stores";

  export let video = document.querySelector("video")
  export let id;

  $: loop = useRow('loops', id)

  $: startTime = $loop.startTime
  $: endTime = $loop.endTime

  $: duration = video?.duration;

  $: left = startTime / duration * 100
  $: width = (endTime - startTime) / duration * 100

  function ticker(e) {
    if (!video) return

    if (video.currentTime > endTime) {
      video.currentTime = startTime
    }
  }

  $: video.currentTime = startTime

  onMount(() => {
    if (!video) return;

    video.addEventListener("timeupdate", ticker)
  })

  onDestroy(() => {
    if (!video) return

    video.removeEventListener("timeupdate", ticker)
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
