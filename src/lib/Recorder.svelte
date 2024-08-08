<script lang="ts">
  import {createEventDispatcher} from "svelte";
  import {formatTime} from "@/lib/helpers/time";

  export let video = document.querySelector("video")
  let startTime = null;

  const dispatch = createEventDispatcher()

  function startRecording() {
    startTime = video?.currentTime
  }

  function finishRecording() {
    const endTime = video?.currentTime
    const loop = {startTime, endTime, label: "New loop"}

    dispatch('newLoop', loop)

    startTime = null
  }
</script>

{#if startTime}
  <div class="container recording" on:click={finishRecording}>Stop recording [{formatTime(startTime, 3)}]</div>
{:else}
  <div class="container" on:click={startRecording}>Start new loop</div>
{/if}

<style>

    .container {
        cursor: pointer;
        padding: 4px 0;
    }

    .recording {
        background: rgba(255, 0, 0, 0.52);
    }

</style>
