<script lang="ts">
  import {createEventDispatcher} from "svelte";
  import {formatTime} from "@/lib/helpers/time";
  import Icon from "@/lib/components/Icon.svelte";

  export let video = document.querySelector("video")
  let startTime: number | undefined;

  const dispatch = createEventDispatcher()

  export function record() {
    if (startTime !== undefined) {
      const endTime = video?.currentTime
      const loop = {startTime, endTime, label: "New loop"}

      dispatch('newLoop', loop)

      startTime = undefined
    } else {
      startTime = video?.currentTime
    }
  }
</script>

<a href="#record" class="container" class:recording={startTime !== undefined} on:click|preventDefault={record}>
  {#if startTime !== undefined}
    <Icon icon="stop-circle" />
    <div>Stop recording [{formatTime(startTime, 3)}]</div>
  {:else}
    <Icon icon="plus-circle" />
    <div>Start new loop</div>
  {/if}
</a>

<style>

    div {
        margin-left: 3px;
    }

    .container {
        cursor: pointer;
        display: flex;
        align-items: center;
        padding: 4px 0;
        transition: background-color 250ms;
    }

    .recording {
        background: rgba(255, 0, 0, 0.52);
    }

</style>
