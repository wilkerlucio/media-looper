<script lang="ts">
  export let video = document.querySelector("video")
</script>

<div class="container">
  <div class="label" on:click={() => video.playbackRate = 1}>Speed</div>
  <input type="range" min="0.1" max="2" step="0.01" bind:value={video.playbackRate}/>
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
