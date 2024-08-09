<script lang="ts">
  import {useRow} from "@/lib/stores/tinybase-stores";
  import type {Loop} from "@/lib/model";
  import {createEventDispatcher} from "svelte";
  import {formatTime} from "@/lib/helpers/time";
  import {shiftKeyMod} from "@/lib/stores/modifier-keys-stores";

  const dispatch = createEventDispatcher()

  export let id;
  export let active = false;

  const _loop = useRow('loops', id) as Loop
  $: loop = $_loop

  $: formatPrecision = $shiftKeyMod ? 3 : null
</script>

<div class="container" class:active>
  <button on:click={() => dispatch('select', {id})}>{loop.label}</button>
  <div class="spacer"></div>
  <div>{formatTime(loop.startTime, formatPrecision)}</div>
  <div>/</div>
  <div>{formatTime(loop.endTime, formatPrecision)}</div>
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
