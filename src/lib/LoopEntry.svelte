<script lang="ts">
  import {useRow} from "@/lib/stores/tinybase-stores";
  import type {Loop} from "@/lib/model";
  import {createEventDispatcher} from "svelte";
  import {formatTime} from "@/lib/helpers/time";

  const dispatch = createEventDispatcher()

  export let video = document.querySelector("video")
  export let id;
  export let active = false;

  const _loop = useRow('loops', id) as Loop
  $: loop = $_loop
</script>

<div class="container" class:active>
  <button on:click={() => dispatch('select', {id})}>{loop.label}</button>
  <div class="spacer"></div>
  <div>{formatTime(loop.startTime)}</div>
  <div>/</div>
  <div>{formatTime(loop.endTime)}</div>
</div>

<style>

    .container {
        display: flex;
        align-items: center;
    }

    .active {
        background: rgba(255, 0, 0, 0.52);
    }

    .spacer {
        flex: 1;
    }

</style>
