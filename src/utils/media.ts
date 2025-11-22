export const isImage = (url: string): boolean => {
  return /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(url)
}

export const isVideo = (url: string): boolean => {
  return /\.(mp4|mov|avi|mkv|webm)$/i.test(url)
}

export const getFirstImage = (mediaUrls?: string[]): string | undefined => {
  if (!mediaUrls || mediaUrls.length === 0) return undefined
  return mediaUrls.find(url => isImage(url)) || mediaUrls[0]
}
