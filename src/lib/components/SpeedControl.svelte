<script lang="ts">
  import Icon from "@/lib/components/Icon.svelte";
  import {pd} from "@/lib/helpers/events";

  let {video}: {
    video: HTMLVideoElement
  } = $props()

  function increment(e: MouseEvent) {
    return e.shiftKey ? 0.01 : 0.1
  }

  export function increaseSpeed(precise = false) {
    playbackRate.rate += precise ? 0.05 : 0.1
  }

  export function decreaseSpeed(precise = false) {
    playbackRate.rate -= precise ? 0.05 : 0.1
  }

  export function setSpeed(speed: number) {
    playbackRate.rate = speed
  }

  let rate = $state(video.playbackRate)

  let playbackRate = {
    get rate() {
      return rate
    },

    set rate(x: number) {
      rate = x
      video.playbackRate = x
    }
  }
</script>

<div class="container">
  <a href="#reset-speed" class="label" onclick={pd(() => playbackRate.rate = 1)}>Speed</a>
  <Icon icon="minus-circle" onclick={(e: MouseEvent) => playbackRate.rate -= increment(e)} />
  <input type="range" min="0.1" max="2" step="0.01" bind:value={playbackRate.rate}/>
  <Icon icon="plus-circle" onclick={(e: MouseEvent) => playbackRate.rate += increment(e)} />
  <div>{Math.round(playbackRate.rate * 100)}%</div>
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
