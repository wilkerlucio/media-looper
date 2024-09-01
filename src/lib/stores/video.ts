import {readable} from "svelte/store";

export function videoCurrentTimeStore(videoElement: HTMLVideoElement) {
  return readable(videoElement.currentTime, (set) => {
    const ticker = () => set(videoElement.currentTime)

    videoElement.addEventListener('timeupdate', ticker)

    return () => videoElement.removeEventListener('timeupdate', ticker)
  })
}
