/**
 * Stop propagation
 *
 * This is a helper to use with events.
 * There are a few ways this function is intended to be used.
 *
 * @example <caption>If you just want to stop propagation and do nothing else:</caption>
 * <button onclick={sp}></button>
 *
 * @example <caption>You can also pass a function to do something on top of stopping the propagation</caption>
 * <button onclick={sp((e) => console.log('clicked', e))}></button>
 */
export function sp(e: Event | Function) {
  if (typeof e === 'function') {
    return (e2: Event, ...args: any[]) => {
      e2.stopPropagation()
      e(e2, ...args)
    }
  } else {
    e.stopPropagation()
  }
}

/**
 * Prevent default
 *
 * This is a helper to use with events.
 * There are a few ways this function is intended to be used.
 *
 * @example <caption>If you just want to prevent default and do nothing else:</caption>
 * <button onclick={pd}></button>
 *
 * @example <caption>You can also pass a function to do something on top of preventing the default</caption>
 * <button onclick={pd((e) => console.log('clicked', e))}></button>
 */
export function pd(e: Event | Function) {
  if (typeof e === 'function') {
    return (e2: Event, ...args: any[]) => {
      e2.preventDefault()
      e(e2, ...args)
    }
  } else {
    e.preventDefault()
  }
}