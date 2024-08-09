<script lang="ts">
  import {createEventDispatcher} from "svelte";
  import {formatTime} from "@/lib/helpers/time";
  import Icon from "@/lib/Icon.svelte";

  export let video = document.querySelector("video")
  let startTime = null;

  const dispatch = createEventDispatcher()

  function record() {
    if (startTime) {
      const endTime = video?.currentTime
      const loop = {startTime, endTime, label: "New loop"}

      dispatch('newLoop', loop)

      startTime = null
    } else {
      startTime = video?.currentTime
    }
  }
</script>

<div class="container" class:recording={!!startTime} on:click={record}>
  {#if startTime}
    <Icon icon="stop-circle" />
    <div>Stop recording [{formatTime(startTime, 3)}]</div>
  {:else}
    <Icon icon="plus-circle" />
    <div>Start new loop</div>
  {/if}
</div>

<style>

    .container {
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 4px 0;
    }

    .recording {
        background: rgba(255, 0, 0, 0.52);
    }

</style>
