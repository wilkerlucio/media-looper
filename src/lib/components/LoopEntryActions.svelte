<script lang="ts">

  import type {Loop} from "@/lib/model";
  import type {Id} from "tinybase";
  import {videoCurrentTimeStore} from "@/lib/stores/video";

  let {id, loop, video = document.querySelector("video"), onduplicate, oncut, ondelete}: {
    id: Id,
    loop: Loop,
    video: HTMLVideoElement | null,
    onduplicate: any,
    oncut: any,
    ondelete: any
  } = $props()

  let currentTimeStore = $derived(videoCurrentTimeStore(video))
  let currentTime = $derived($currentTimeStore || 0)

</script>
<div class="looper-dropdown-content">
  <a href="#duplicate" onclick={(e) => {e.preventDefault(); onduplicate({id})}}>Duplicate</a>
  {#if loop.startTime < currentTime && currentTime < loop.endTime}
    <a href="#cut" onclick={(e) => {e.preventDefault(); oncut({id})}}>Split</a>
  {/if}
  {#if !loop.readonly}
    <a href="#delete" onclick={(e) => {e.preventDefault(); ondelete({id})}}>Delete</a>
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