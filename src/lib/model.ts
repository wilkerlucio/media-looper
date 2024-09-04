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
}

export interface Media {
  title: string,
  channel: string,
  lastLoopPlay?: string,
  importedFromCLJS?: boolean
}

export type LoopEntry = Loop & {children?: Loops}
export type Loops = [Id, LoopEntry][]
