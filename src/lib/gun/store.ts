import {getContext, setContext} from "svelte";
import {writable} from "svelte/store";

const CONTEXT_NAME = 'gun'

export function createGunContext(gunInstance: any) {
  setContext(CONTEXT_NAME, gunInstance)
}

export function getGunContext() {
  return getContext(CONTEXT_NAME)
}

export function useNode(id: string, parentNode: any) {
  const context = (parentNode || getGunContext()).get(id)

  const {subscribe} = writable(undefined, (set) => {
    context.on()
  })

  return {
    subscribe,
    set: (x: any) => {
      context.put(x)
    }
  }
}
