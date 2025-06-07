import uniqBy from "lodash/uniqBy";
import {formatTime} from "@/lib/helpers/time";
import {pollUntil} from "@/lib/helpers/polling";

export function extractMediaId(url: string) {
  const matches = url.match(/watch.+v=([^&]+)/) || url.match(/\/embed\/([^?]+)/)

  return matches ? matches[1] : null
}

export function isEmbed() {
  return location.href.match(/\/embed\//)
}

export function sourceInfo() {
  const base = isEmbed() ?
    {
      title: document.title,
      // @ts-ignore
      channel: document.querySelector('.ytp-title-expanded-title')?.innerText
    }
    :
    {
      // @ts-ignore
      title: document.querySelector("#title h1")?.innerText,
      // @ts-ignore
      channel: document.querySelector("#container.ytd-channel-name")?.innerText
    }

  return base.title === 'YouTube' && base.channel === '' ? null : base
}

function getChaptersSync(video: HTMLVideoElement | null) {
  if (!video) return []

  const chapters = uniqBy(Array.from(document.querySelectorAll(".ytd-macro-markers-list-renderer ytd-macro-markers-list-item-renderer #details")).map((node) => {
    // @ts-ignore
    return {title: node.querySelector("h4")?.innerText, time: node.querySelector("#time")?.innerText}
  }), (x) => x.time)

  chapters.push({title: "END", time: formatTime(video.duration - 0.1, 3)})

  return chapters
}

export async function videoChapters(video: HTMLVideoElement | null) {
  const chapters = await pollUntil(
    () => getChaptersSync(video),
    (chapters) => chapters.length > 1, // Stop when we have more than 1 chapter
    100, // Poll every 100ms
    5000 // Timeout after 5 seconds
  )

  return chapters || []
}

export function sourceIdFromVideoId(videoId: string) {
  return "youtube:" + videoId;
}

export function videoIdFromSourceId(sourceId: string) {
  return sourceId.substring(8)
}
