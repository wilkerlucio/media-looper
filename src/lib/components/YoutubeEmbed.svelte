<script lang="ts">

  export let videoId;

</script>

<div class="w-full pb-[56.25%] relative">
  <iframe
      class="left-0 top-0 w-full h-full absolute"
      src="https://www.youtube.com/embed/{videoId}"
      title="YouTube video player"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>
