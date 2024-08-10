<script lang="ts">
  import {useRow} from "@/lib/stores/tinybase-stores";
  import type {Loop, Loops} from "@/lib/model";
  import {createEventDispatcher} from "svelte";
  import {formatTime} from "@/lib/helpers/time";
  import {shiftKeyMod} from "@/lib/stores/modifier-keys-stores";
  import Icon from "@/lib/components/Icon.svelte";
  import EditableText from "@/lib/components/EditableTime.svelte";
  import type {Id} from "tinybase";

  const dispatch = createEventDispatcher()

  export let video = document.querySelector("video");
  export let id: Id;
  export let children: Loops | undefined;
  export let active: Id | null;
  export let nesting = 0;

  const _loop = useRow('loops', id)
  $: loop = ($_loop) as unknown as Loop

  $: formatPrecision = $shiftKeyMod ? 3 : undefined
  $: imActive = active === id

  // precision
  function p(e: MouseEvent) {
    return e.shiftKey ? 0.1 : 1
  }
</script>

<div class="container" class:active={imActive} style:padding-left={nesting * 10 + 'px'}>
  <Icon icon="{imActive ? 'stop' : 'play'}-circle" on:click={() => dispatch('select', {id})} />
  {#if loop.readonly}
    <div>{loop.label}</div>
  {:else}
    <input bind:value={$_loop.label} class="full-width" on:keydown|stopPropagation on:keyup|stopPropagation>
  {/if}
  <div class="flex"></div>

  {#if loop.readonly}
    <div>{formatTime(loop.startTime, formatPrecision)}</div>
  {:else}
    <Icon icon="minus-circle" on:click={(e) => $_loop.startTime = Math.max(loop.startTime - p(e), 0)} />
    <EditableText bind:value={$_loop.startTime}>
      {formatTime(loop.startTime, formatPrecision)}
    </EditableText>
    <Icon icon="plus-circle" on:click={(e) => $_loop.startTime = Math.min(loop.startTime + p(e), loop.endTime)} />
  {/if}

  <div>/</div>

  {#if loop.readonly}
    <div>{formatTime(loop.endTime, formatPrecision)}</div>
  {:else}
    <Icon icon="minus-circle" on:click={(e) => $_loop.endTime = Math.max(loop.endTime - p(e), loop.startTime)} />
    <EditableText bind:value={$_loop.endTime}>
      {formatTime(loop.endTime, formatPrecision)}
    </EditableText>
    <Icon icon="plus-circle" on:click={(e) => $_loop.endTime = Math.min(loop.endTime + p(e), video?.duration || 0)} />
  {/if}

  <div class="looper-dropdown">
    <Icon icon="ellipsis-h" style="margin-top: 2px;" />
    <div class="looper-dropdown-content">
      <a href="#duplicate" on:click|preventDefault={() => dispatch('duplicate', {id})}>Duplicate</a>
      {#if !loop.readonly}
        <a href="#delete" on:click|preventDefault={() => dispatch('delete', {id})}>Delete</a>
      {/if}
    </div>
  </div>
</div>

{#if children}
  {#each children as [id, loop] (id)}
    <svelte:self
      {id}
      children={loop.children}
      {active}
      {video}
      nesting={nesting + 1}
      on:select
      on:duplicate
      on:delete
    />
  {/each}
{/if}

<style>

    input {
        border: none;
        background: none;
        color: #fff;
        font-size: 11px;
        font-family: "YouTube Noto",Roboto,Arial,Helvetica,sans-serif;
        padding: 0;
    }

    .full-width {
        width: 100%;
    }

    .container {
        display: flex;
        align-items: center;
        padding: 2px 0;
        transition: background-color 250ms;
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
