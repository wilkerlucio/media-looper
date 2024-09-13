<script lang="ts">
  import Icon from "@/lib/components/Icon.svelte";
  import {pd} from "@/lib/helpers/events";

  let {video}: {
    video: HTMLVideoElement
  } = $props()

  function increment(e: MouseEvent) {
    return e.shiftKey ? 0.01 : 0.1
  }
</script>

<div class="container">
  <a href="#reset-speed" class="label" onclick={pd(() => video.playbackRate = 1)}>Speed</a>
  <Icon icon="minus-circle" onclick={(e: MouseEvent) => video.playbackRate -= increment(e)} />
  <input type="range" min="0.1" max="2" step="0.01" bind:value={video.playbackRate}/>
  <Icon icon="plus-circle" onclick={(e: MouseEvent) => video.playbackRate += increment(e)} />
  <div>{Math.round(video.playbackRate * 100)}%</div>
</div>

<style>

    .label {
        cursor: pointer;
    }

    .container {
        align-items: center;
        display: flex;
    }

    .container > * {
        margin: 0 5px;
    }

    .container > :first-child {
        margin-left: 0;
    }

    .container > :last-child {
        margin-right: 0;
    }

</style>
