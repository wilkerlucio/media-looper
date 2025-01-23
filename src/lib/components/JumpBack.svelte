<script lang="ts">
  let video = document.querySelector("video")

    let lastStartTime = $state(0)
  
    $effect(() => {
      if (!video) return
  
      const updateLastStart = () => {
        if (!video.paused) {
          lastStartTime = video.currentTime
        }
      }
  
      video.addEventListener('play', updateLastStart)
      video.addEventListener('seeking', updateLastStart)
  
      return () => {
        video.removeEventListener('play', updateLastStart)
        video.removeEventListener('seeking', updateLastStart)
      }
    })
  
    export function backToStart() {
      if (video) {
        video.currentTime = lastStartTime
        video.play()
      }
    }
  </script>