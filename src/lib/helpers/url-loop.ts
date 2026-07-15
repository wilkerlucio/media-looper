import { formatTime, secondsFromTime } from "@/lib/helpers/time";
import type { Loop } from "@/lib/model";

// Accepts "12", "12.5", "1:23", "1:23:45", or "1:23.5". Returns null on bad input.
export function parseTimeParam(v: string | null): number | null {
  if (v == null) return null;
  const s = v.trim();
  if (s === "") return null;
  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = parseFloat(s);
    return isFinite(n) ? n : null;
  }
  return secondsFromTime(s);
}

export interface UrlLoopParams {
  start: number | null;
  end: number | null;
  repeatCount: number | null;
}

export function readUrlLoopParams(url: URL | string = location.href): UrlLoopParams {
  const u = typeof url === "string" ? new URL(url) : url;
  const start = parseTimeParam(u.searchParams.get("start"));
  const end = parseTimeParam(u.searchParams.get("end"));
  const loopRaw = u.searchParams.get("loop");
  let repeatCount: number | null = null;
  if (loopRaw != null) {
    const n = parseInt(loopRaw, 10);
    if (!isNaN(n) && n >= 0) repeatCount = n;
  }
  return { start, end, repeatCount };
}

export function hasUrlLoopParams(url: URL | string = location.href): boolean {
  const { start, end, repeatCount } = readUrlLoopParams(url);
  return start != null || end != null || repeatCount != null;
}

// Build a shareable URL for a loop, based on the current tab's watch URL.
// Includes t=<start>s so YouTube itself seeks to the start (helpful when the
// recipient doesn't have the extension), plus our start/end (and loop, if finite).
export function buildLoopShareUrl(loop: Pick<Loop, 'startTime' | 'endTime' | 'repeatCount'>, base: string = location.href): string {
  const url = new URL(base);
  const start = Math.max(0, Math.floor(loop.startTime));
  // Remove any params we're about to set (or that would conflict) so we start clean.
  for (const k of ['t', 'start', 'end', 'loop']) url.searchParams.delete(k);
  url.searchParams.set('t', `${start}s`);
  url.searchParams.set('start', formatTime(loop.startTime));
  url.searchParams.set('end', formatTime(loop.endTime));
  if (loop.repeatCount && loop.repeatCount > 0) {
    url.searchParams.set('loop', String(loop.repeatCount));
  }
  // Also strip the SPA-tracking noise so links stay short and portable.
  for (const k of ['pp', 'si', 'feature']) url.searchParams.delete(k);
  return url.toString();
}

// Strip the params from the current URL bar so a refresh doesn't retrigger.
export function clearUrlLoopParams() {
  try {
    const u = new URL(location.href);
    let changed = false;
    for (const k of ["start", "end", "loop"]) {
      if (u.searchParams.has(k)) {
        u.searchParams.delete(k);
        changed = true;
      }
    }
    if (changed) history.replaceState(history.state, "", u.toString());
  } catch (_) {
    // no-op
  }
}
