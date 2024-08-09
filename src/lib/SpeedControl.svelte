<script lang="ts">
  import Icon from "@/lib/Icon.svelte";

  export let video = document.querySelector("video")

  function increment(e) {
    return e.shiftKey ? 0.01 : 0.1
  }
</script>

<div class="container">
  <div class="label" on:click={() => video.playbackRate = 1}>Speed</div>
  <Icon icon="minus-circle" on:click={(e) => video.playbackRate -= increment(e)} />
  <input type="range" min="0.1" max="2" step="0.01" bind:value={video.playbackRate}/>
  <Icon icon="plus-circle" on:click={(e) => video.playbackRate += increment(e)} />
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
