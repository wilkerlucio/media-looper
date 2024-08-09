<script lang="ts">
  import {useRow} from "@/lib/stores/tinybase-stores";
  import type {Loop} from "@/lib/model";
  import {createEventDispatcher} from "svelte";
  import {formatTime} from "@/lib/helpers/time";
  import {shiftKeyMod} from "@/lib/stores/modifier-keys-stores";
  import Icon from "@/lib/Icon.svelte";

  const dispatch = createEventDispatcher()

  export let id;
  export let active = false;

  const _loop = useRow('loops', id) as Loop
  $: loop = $_loop

  $: formatPrecision = $shiftKeyMod ? 3 : null

  // precision
  function p(e) {
    return e.shiftKey ? 0.1 : 1
  }
</script>

<div class="container" class:active>
  <Icon icon="{active ? 'stop' : 'play'}-circle" on:click={() => dispatch('select', {id})} />
  <input bind:value={$_loop.label} class="full-width" on:keydown|stopPropagation on:keyup|stopPropagation>
  <div class="flex"></div>
  <Icon icon="minus-circle" on:click={(e) => $_loop.startTime = Math.max(0, loop.startTime - p(e))} />
  <div>{formatTime(loop.startTime, formatPrecision)}</div>
  <Icon icon="plus-circle" on:click={(e) => $_loop.startTime = Math.min(loop.endTime, loop.startTime + p(e))} />
  <div>/</div>
  <Icon icon="minus-circle" on:click={(e) => $_loop.endTime = Math.max($_loop.startTime, loop.endTime - p(e))} />
  <div>{formatTime(loop.endTime, formatPrecision)}</div>
  <Icon icon="plus-circle" on:click={(e) => $_loop.endTime += p(e)} />
  <div class="looper-dropdown">
    <Icon icon="ellipsis-h" />
    <div class="looper-dropdown-content">
      <a href="#duplicate" on:click|preventDefault={() => dispatch('duplicate', {id})}>Duplicate</a>
      <a href="#delete" on:click|preventDefault={() => dispatch('delete', {id})}>Delete</a>
    </div>
  </div>
</div>

<style>

    input {
        border: none;
        background: none;
        color: #fff;
        font-size: 12px;
        font-family: "YouTube Noto",Roboto,Arial,Helvetica,sans-serif;
    }

    .full-width {
        width: 100%;
    }

    .container {
        display: flex;
        align-items: center;
        padding: 2px 0;
    }

    .container > * {
        margin: 0 3px;
    }

    .container > :first-child {
        margin-left: 0;
    }

    .container > :last-child {
        margin-right: 0;
    }

    .active {
        background: rgba(255, 0, 0, 0.52);
    }

    .flex {
        flex: 1;
    }

    .looper-dropdown {
        position: relative;
        display: inline-block;
        float: right;
    }

    .looper-dropdown-content {
        display: none;
        position: absolute;
        right: 0;
        background-color: #000;
        box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
        z-index: 1;
    }

    .looper-dropdown-content a {
        padding: 12px 16px;
        text-decoration: none;
        display: block;
    }

    .looper-dropdown-content a:hover {
        background: #222;
    }

    .looper-dropdown:hover .looper-dropdown-content {
        display: block;
    }

</style>
