import {Id} from "tinybase";

export interface Identified {
  id: string;
}

export interface Loop {
  startTime: number;
  endTime: number;
  label: string;
  source: string;
  readonly?: boolean;
  // Number of times to play the loop (>=1). Undefined or 0 = infinite.
  repeatCount?: number;
}

export type IdentifiedLoop = Loop & Identified

export interface Media {
  title: string,
  channel: string,
  lastLoopPlay?: string,
  importedFromCLJS?: boolean
}

export type LoopEntry = Loop & {children?: Loops}
export type Loops = [Id, LoopEntry][]
