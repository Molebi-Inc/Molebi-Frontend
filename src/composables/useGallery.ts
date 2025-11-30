export const useGallery = () => {
  const getMediaType = (mimeType: string): 'image' | 'video' | 'audio' | 'document' => {
    if (mimeType.startsWith('image/')) {
      return 'image'
    } else if (mimeType.startsWith('video/')) {
      return 'video'
    } else if (mimeType.startsWith('audio/')) {
      return 'audio'
    }
    return 'document'
  }
  return {
    getMediaType,
  }
}
