<script lang="ts">

  import type {Loop} from "@/lib/model";
  import type {Id} from "tinybase";
  import {videoCurrentTimeStore} from "@/lib/stores/video.svelte";
  import {pd} from "@/lib/helpers/events";
  import {buildLoopShareUrl} from "@/lib/helpers/url-loop";

  let {id, loop, active, video = document.querySelector("video"), onduplicate, oncut, ondelete}: {
    id: Id,
    loop: Loop,
    active: Id | null,
    video?: HTMLVideoElement | null,
    onduplicate: any,
    oncut: any,
    ondelete: any
  } = $props()

  let currentTimeStore = $derived(videoCurrentTimeStore(video))
  let currentTime = $derived(currentTimeStore?.value || 0)

  let copied = $state(false)
  let copyResetTimer: ReturnType<typeof setTimeout> | null = null

  async function copyLink() {
    const link = buildLoopShareUrl(loop)
    try {
      await navigator.clipboard.writeText(link)
    } catch (_) {
      // Fallback for browsers/contexts where clipboard API is unavailable.
      const ta = document.createElement('textarea')
      ta.value = link
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch (_) {}
      document.body.removeChild(ta)
    }
    copied = true
    if (copyResetTimer) clearTimeout(copyResetTimer)
    copyResetTimer = setTimeout(() => { copied = false }, 1500)
  }

</script>
<div class="looper-dropdown-content">
  <a href="#duplicate" onclick={pd(() => onduplicate({id}))}>Duplicate</a>
  {#if id === active || (loop.startTime < currentTime && currentTime < loop.endTime)}
    <a href="#cut" onclick={pd(() => oncut({id}))}>Split</a>
  {/if}
  <a href="#copy-link" onclick={pd(copyLink)} class:copied>{copied ? 'Copied!' : 'Copy link to loop'}</a>
  {#if !loop.readonly}
    <a href="#delete" onclick={pd(() => ondelete({id}))}>Delete</a>
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

    .looper-dropdown-content a.copied {
        color: rgb(5, 255, 0);
        pointer-events: none;
    }

</style>