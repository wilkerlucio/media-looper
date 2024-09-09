<script lang="ts">

  import type {Loop} from "@/lib/model";
  import type {Id} from "tinybase";
  import {videoCurrentTimeStore} from "@/lib/stores/video";

  const dispatch = createEventDispatcher()

  export let id: Id
  export let loop: Loop

  export let video = document.querySelector("video");

  $: currentTimeStore = videoCurrentTimeStore(video)
  $: currentTime = $currentTimeStore

</script>
<div class="looper-dropdown-content">
  <a href="#duplicate" on:click|preventDefault={() => dispatch('duplicate', {id})}>Duplicate</a>
  {#if loop.startTime < currentTime && currentTime < loop.endTime}
    <a href="#cut" on:click|preventDefault={() => dispatch('cut', {id})}>Split</a>
  {/if}
  {#if !loop.readonly}
    <a href="#delete" on:click|preventDefault={() => dispatch('delete', {id})}>Delete</a>
  {/if}
</div>

<style>

    .looper-dropdown-content {
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

</style>