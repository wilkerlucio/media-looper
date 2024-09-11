export function useLocation() {
  let current = $state(location.href)

  $effect(() => {
    const interval = setInterval(() => {
      if (current !== location.href) {
        console.log('fire change', current, location.href);
        current = location.href
      }
    }, 500)

    return () => clearInterval(interval)
  })

  return {
    get value() {return current}
  }
}
