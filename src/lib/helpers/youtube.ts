type YoutubeThumbnail =
  '0' |
  '1' |
  '2' |
  '3' |
  'default' |
  'mqdefault' |
  'hqdefault' |
  'sddefault' |
  'maxresdefault'

export function getThumbUrl(videoId: string, variant: YoutubeThumbnail) {
  return `https://img.youtube.com/vi/${videoId}/${variant}.jpg`
}
