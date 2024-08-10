import {Id} from "tinybase";
import {LoopEntry, Loops} from "@/lib/model";

function sortLoops(loops: Loops) {
  return loops.sort((a, b) => {
    const startCheck = a[1].startTime - b[1].startTime
    return startCheck === 0 ? a[1].endTime - b[1].endTime : startCheck
  })
}

function iterateBreak([first, ...rest]: Loops): Loops {
  if (first) {
    let separation = rest.length - 1

    for (const [i, loop] of rest.entries()) {
      if (loop[1].endTime > first[1].endTime) {
        separation = i - 1
        break
      }
    }

    if (separation >= 0) {
      first[1].children = iterateBreak(rest.slice(0, separation + 1))
    }

    return [first, ...iterateBreak(rest.slice(separation + 1))]
  } else {
    return []
  }
}

export function loopTree(loops: {[key: Id]: LoopEntry}) {
  return iterateBreak(sortLoops(Object.entries(loops)))
}
