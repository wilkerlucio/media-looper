<script lang="ts">
  import {getThumbUrl} from "@/lib/helpers/youtube";
  import {PlaySolid} from "flowbite-svelte-icons";

  let {videoId, ...props}: {
    videoId: string,
    class?: string
  } = $props()

  let clazz = $derived(props.class || '')

  function openVideo() {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  }
</script>

<div class="w-full pb-[56.25%] relative flex-1 ${clazz} cursor-pointer group" onclick={openVideo}>
  <img
    src={getThumbUrl(videoId, 'maxresdefault')}
    alt="Video thumbnail"
    class="absolute left-0 top-0 w-full h-full object-cover"
  />
  <div class="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
    <div class="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
      <PlaySolid class="w-12 h-12 text-white" />
    </div>
  </div>
  <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
    <p class="text-white text-sm">Click to open in YouTube</p>
  </div>
</div>
