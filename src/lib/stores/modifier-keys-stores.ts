import {readable} from "svelte/store";

export const shiftKeyMod = readable(false, (set) => {
  function down(e: KeyboardEvent) {
    if (e.code === 'ShiftLeft') set(true)
  }

  function up(e: KeyboardEvent) {
    if (e.code === 'ShiftLeft') set(false)
  }

  document.body.addEventListener('keydown', down)
  document.body.addEventListener('keyup', up)

  return () => {
    document.body.removeEventListener('keydown', down)
    document.body.removeEventListener('keyup', up)
  }
})
