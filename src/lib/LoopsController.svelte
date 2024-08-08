<script lang="ts">
  import SpeedControl from "@/lib/SpeedControl.svelte";
  import Recorder from "@/lib/Recorder.svelte";
  import ActiveLoop from "@/lib/ActiveLoop.svelte";

  export let sourceId: string

  let video = document.querySelector("video")
  let activeLoop = null;

</script>

<div class="container">
  <Recorder on:newLoop={(e) => activeLoop = e.detail} />
  {#if activeLoop}
    <div on:click={() => activeLoop = null}>{JSON.stringify(activeLoop)}</div>
  {/if}
  <div class="spacer"></div>
  <div class="support-speed">
    <div><a href="https://www.patreon.com/wsscode" target="_blank">Support my work</a></div>
    <div class="spacer"></div>
    <SpeedControl/>
  </div>
</div>

{#if activeLoop}
  <ActiveLoop {...activeLoop} bind:duration={video.duration} />
{/if}

<style>

    .container {
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 500px;
        padding: 11px 13px;
    }

    .support-speed {
        display: flex;
    }

    .spacer {
        flex: 1;
    }

</style>
