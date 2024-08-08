import {readable} from "svelte/store";

export const locationStore = readable(location.href, (set) => {
  let current = location.href;

  const interval = setInterval(() => {
    if (current !== location.href) {
      current = location.href
      set(current)
    }
  }, 500)

  return () => clearInterval(interval)
})
