export function videoCurrentTimeStore(videoElement: HTMLVideoElement | null) {
  if (!videoElement) return

  let currentTime = $state(videoElement.currentTime)

  $effect(() => {
    const ticker = () => currentTime = videoElement.currentTime

    videoElement.addEventListener('timeupdate', ticker)

    return () => {
      videoElement.removeEventListener('timeupdate', ticker)
    }
  })

  return { get value() { return currentTime }}
}