<script lang="ts">
  import SpeedControl from "@/lib/SpeedControl.svelte";
  import Recorder from "@/lib/Recorder.svelte";

  export let sourceId: string

  let currentLoop = null;


</script>

<div class="container">
  <Recorder on:newLoop={(e) => console.log(e.detail)} />
  <div class="spacer"></div>
  <div class="support-speed">
    <div><a href="https://www.patreon.com/wsscode" target="_blank">Support my work</a></div>
    <div class="spacer"></div>
    <SpeedControl/>
  </div>
</div>

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
