import {Id} from "tinybase";

export interface Loop {
  startTime: number;
  endTime: number;
  label: string;
  source: string;
  readonly?: boolean;
  lastLoopPlay: string;
}

export interface Media {
  title: string,
  channel: string
}

export type LoopEntry = Loop & {children?: Loops}
export type Loops = [Id, LoopEntry][]
