import {Identified, Loop} from "@/lib/model";
import {nanoid} from "nanoid";

export function cutLoop(loop: Loop, cutTime: number): (Loop & Identified)[] {
  const {startTime, endTime} = loop

  if (cutTime < startTime) throw new Error("Cut time must be after loop start time")
  if (cutTime >= endTime) throw new Error("Cut time must be before loop end time")

  const leftLoop = {
    ...loop,
    id: nanoid(),
    startTime: startTime,
    endTime: cutTime,
    readonly: false,
    label: loop.label + ' left'
  }

  const rightLoop = {
    ...loop,
    id: nanoid(),
    startTime: cutTime,
    endTime: endTime,
    readonly: false,
    label: loop.label + ' right'
  }

  return [leftLoop, rightLoop]
}

// console.log(cutLoop({
//   startTime: 1,
//   endTime: 3,
//   label: 'testing',
//   source: 'youtube:123'
// }, 2))

