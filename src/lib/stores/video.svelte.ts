export function videoCurrentTimeStore(videoElement: HTMLVideoElement | null) {
  if (!videoElement) return

  let currentTime = $state(videoElement.currentTime)

  $effect(() => {
    const ticker = () => currentTime = videoElement.currentTime

    console.log('adding video time listener');
    videoElement.addEventListener('timeupdate', ticker)

    return () => {
      console.log('removing video time listener');

      videoElement.removeEventListener('timeupdate', ticker)
    }
  })

  return { get value() { return currentTime }}
}