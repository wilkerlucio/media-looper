function zeroNaN(x: number) {
  return isNaN(x) ? 0 : x
}

function zeroPad(x: number, n: number) {
  let xx = x + ""

  while (xx.length < n) {
    xx = "0" + xx
  }

  return xx
}

function secondsFormat(x: string) {
  return parseInt(x) >= 10 ? x : "0" + x
}

export function formatTime(time: number, precision?: number) {
  const hours = Math.floor(zeroNaN(time / 3600))
  const minutes = Math.floor(time / 60) % 60
  const seconds = time % 60

  let out = ""

  if (hours > 0) out += zeroPad(hours, 2) + ":"

  out += zeroPad(minutes, 2) + ":"
  out += secondsFormat(precision ? seconds.toFixed(precision) : Math.floor(seconds) + "")

  return out
}
