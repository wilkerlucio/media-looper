<script lang="ts">
  import {getTinyContextForce, useRow} from "@/lib/tinybase/tinybase-stores";
  import type {Loop, Loops} from "@/lib/model";
  import {formatTime} from "@/lib/helpers/time";
  import {shiftKeyMod} from "@/lib/stores/modifier-keys-stores";
  import Icon from "@/lib/components/Icon.svelte";
  import EditableTime from "@/lib/components/EditableTime.svelte";
  import type {Id} from "tinybase";
  import LoopEntryActions from "@/lib/components/LoopEntryActions.svelte";
  import {sp} from "@/lib/helpers/events";
  import Self from './LoopEntry.svelte'

  let {video, id, loop: loopProp, children, active, nesting = 0, onselect, onduplicate, oncut, ondelete}: {
    video: HTMLVideoElement | null,
    id: Id,
    loop?: Loop,
    children: Loops | undefined,
    active: Id | null,
    nesting?: number,
    onselect: (x: any) => void,
    onduplicate: (x: any) => void,
    oncut: (x: any) => void,
    ondelete: (x: any) => void
  } = $props()

  const store = getTinyContextForce('store')

  let events = $derived({onselect, onduplicate, oncut, ondelete})

  let showActions: boolean = $state(false)

  // Only use prop data for readonly loops (memory-only chapter loops)
  // For persisted loops, always load from TinyBase to get reactive updates
  let loopSource = $derived(loopProp?.readonly ? undefined : useRow<Loop>(store, 'loops', id))
  let loop = $derived((loopProp?.readonly ? loopProp : $loopSource) as Loop)

  let formatPrecision = $derived($shiftKeyMod ? 3 : undefined)
  let imActive = $derived(active === id)

  // precision
  function p(e: MouseEvent) {
    return e.shiftKey ? 0.1 : 1
  }

  function loseFocus(e: KeyboardEvent) {
    e.stopPropagation()

    if (e.code === 'Escape' || e.code === "Enter") {
      e.target?.blur()
    }
  }
</script>

<div class="container" class:active={imActive} style:padding-left={nesting * 10 + 'px'}>
  <Icon icon="{imActive ? 'stop' : 'play'}-circle" onclick={() => onselect({id})}/>
  {#if loop.readonly}
    <div>{loop.label}</div>
  {:else}
    <input bind:value={$loopSource!.label} class="full-width" onkeydowncapture={loseFocus} onkeyupcapture={sp}>
  {/if}
  <div class="flex"></div>

  {#if loop.readonly}
    <div>{formatTime(loop.startTime, formatPrecision)}</div>
  {:else}
    <Icon icon="minus-circle" onclick={(e: MouseEvent) => $loopSource!.startTime = Math.max(loop.startTime - p(e), 0)} />
    <EditableTime bind:value={$loopSource!.startTime} {formatPrecision} />
    <Icon icon="plus-circle" onclick={(e: MouseEvent) => $loopSource!.startTime = Math.min(loop.startTime + p(e), loop.endTime)} />
  {/if}

  <div>/</div>

  {#if loop.readonly}
    <div>{formatTime(loop.endTime, formatPrecision)}</div>
  {:else}
    <Icon icon="minus-circle" onclick={(e: MouseEvent) => $loopSource!.endTime = Math.max(loop.endTime - p(e), loop.startTime)} />
    <EditableTime bind:value={$loopSource!.endTime} {formatPrecision} />
    <Icon icon="plus-circle" onclick={(e: MouseEvent) => $loopSource!.endTime = Math.min(loop.endTime + p(e), video?.duration || 0)} />
  {/if}

  <div class="looper-dropdown" role="button" tabindex="0" aria-label="Loop actions" onmouseenter={() => showActions = true} onmouseleave={() => showActions = false}>
    <Icon icon="ellipsis-h" style="margin-top: 2px;" />
    {#if showActions}
      <LoopEntryActions
          {id}
          {loop}
          {active}
          {onduplicate}
          {oncut}
          {ondelete}
      />
    {/if}
  </div>
</div>

{#if children}
  {#each children as [id, loop] (id)}
    <Self
      {id}
      {loop}
      children={loop.children}
      {active}
      {video}
      nesting={nesting + 1}
      {...events}
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

    :global(.ytp-big-mode) input {
        font-size: 17px !important;
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

</style>
