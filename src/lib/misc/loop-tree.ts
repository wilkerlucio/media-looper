import {Id} from "tinybase";
import {LoopEntry, Loops} from "@/lib/model";

export function sortLoops(loops: Loops) {
  return loops.sort((a, b) => {
    const startCheck = a[1].startTime - b[1].startTime
    return startCheck === 0 ? b[1].endTime - a[1].endTime : startCheck
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

    // Create a new loop object instead of mutating the original
    const newFirst: LoopEntry = [first[0], {...first[1]}]

    if (separation >= 0) {
      newFirst[1].children = iterateBreak(rest.slice(0, separation + 1))
    }

    return [newFirst, ...iterateBreak(rest.slice(separation + 1))]
  } else {
    return []
  }
}

export function loopTree(loops: {[key: Id]: LoopEntry}) {
  return iterateBreak(sortLoops(Object.entries(loops)))
}
