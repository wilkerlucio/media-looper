<script lang="ts">
  import SpeedControl from "@/lib/SpeedControl.svelte";

  export let sourceId: string

  let video = document.querySelector("video")
</script>

<div class="container">
  <div>Popup contents</div>
  <div class="spacer"></div>
  <div class="support-speed">
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
