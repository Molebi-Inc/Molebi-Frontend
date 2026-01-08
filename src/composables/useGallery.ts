export const useGallery = () => {
  const getMediaType = (
    mimeType: string,
    file_name?: string,
  ): 'image' | 'video' | 'audio' | 'document' => {
    if (mimeType.startsWith('image/')) {
      return 'image'
    } else if (
      mimeType.startsWith('audio/') ||
      file_name?.endsWith('.mp3') ||
      file_name?.endsWith('.wav') ||
      file_name?.endsWith('.ogg')
    ) {
      return 'audio'
    } else if (mimeType.startsWith('video/')) {
      return 'video'
    }
    return 'document'
  }
  return {
    getMediaType,
  }
}
