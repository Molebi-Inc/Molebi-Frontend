<template>
  <div
    class="vault-folder-container cursor-pointer"
    :style="{ width: `${width}px`, height: 'auto' }"
    @click="navigateToVaultFolders"
  >
    <!-- Display version with CSS overlay -->
    <div class="relative inline-block" ref="displayContainerRef">
      <img
        :src="imageSrc"
        :alt="altText"
        class="vault-folder-image"
        :style="{ width: `${width}px`, height: 'auto' }"
        @load="onImageLoad"
      />
      <!-- Text Overlay -->
      <div v-if="showTextOverlay" class="absolute" :style="textOverlayStyle">
        <div class="text-overlay-content">
          <p
            v-if="showTitle"
            class="text-title"
            :style="{ fontSize: `${titleFontSize}px`, color: titleColor, fontWeight: '700' }"
          >
            {{ title }}
          </p>
          <p
            class="text-count"
            :style="{ fontSize: `${countFontSize}px`, color: countColor, fontWeight: '400' }"
          >
            {{ formattedFileCount }}
          </p>
        </div>
      </div>
    </div>

    <!-- Hidden canvas for export -->
    <canvas ref="canvasRef" :style="{ display: 'none' }" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import vaultFolderImage from '@/assets/images/vault-folder.png'
interface Props {
  fileCount?: number
  width?: number
  title?: string
  showTitle?: boolean
  titleColor?: string
  countColor?: string
  titleFontSize?: number
  countFontSize?: number
  textPosition?: {
    x: number // Percentage from left (0-100)
    y: number // Percentage from top (0-100)
  }
  showTextOverlay?: boolean
  altText?: string
}

const emit = defineEmits<{
  (e: 'update:vaultClick'): void
}>()

const props = withDefaults(defineProps<Props>(), {
  fileCount: 0,
  width: 400,
  title: 'Your Vault',
  showTitle: false,
  titleColor: '#1F2937',
  countColor: '#A1A1A1',
  titleFontSize: 24,
  countFontSize: 12,
  textPosition: () => ({ x: 15, y: 83 }), // Position in percentage
  showTextOverlay: true,
  altText: 'Your Vault',
})

const imageSrc = vaultFolderImage
const displayContainerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const imageLoaded = ref(false)
const imageDimensions = ref({ width: 0, height: 0 })

const formattedFileCount = computed(() => {
  if (props.fileCount === 0) return 'No files'
  return `${props.fileCount.toLocaleString()} ${props.fileCount === 1 ? 'file' : 'files'}`
})

const textOverlayStyle = computed(() => {
  return {
    left: `${props.textPosition.x}%`,
    top: `${props.textPosition.y}%`,
    transform: 'translateY(-50%)',
  }
})

const onImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  imageDimensions.value = {
    width: img.naturalWidth,
    height: img.naturalHeight,
  }
  imageLoaded.value = true
}

// Export as image using Canvas
const exportAsImage = async (format: 'png' | 'jpg' = 'png', quality = 0.95): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!canvasRef.value || !imageLoaded.value) {
      reject(new Error('Canvas or image not ready'))
      return
    }

    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    // Set canvas size
    const scale = props.width / imageDimensions.value.width
    canvas.width = props.width
    canvas.height = imageDimensions.value.height * scale

    // Load and draw image
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Draw text
      const textX = (props.textPosition.x / 100) * canvas.width
      const textY = (props.textPosition.y / 100) * canvas.height

      // Draw title if shown
      if (props.showTitle) {
        ctx.font = `700 ${props.titleFontSize * scale}px system-ui, -apple-system, sans-serif`
        ctx.fillStyle = props.titleColor
        ctx.fillText(props.title, textX, textY - props.countFontSize * scale * 1.2)
      }

      // Draw file count
      ctx.font = `${400} ${props.countFontSize * scale}px system-ui, -apple-system, sans-serif`
      ctx.fillStyle = props.countColor
      ctx.fillText(formattedFileCount.value, textX, textY)

      // Convert to data URL
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png'
      const dataURL = canvas.toDataURL(mimeType, quality)
      resolve(dataURL)
    }
    img.onerror = reject
    img.src = imageSrc
  })
}

const downloadAsImage = async (
  filename: string = 'vault-folder',
  format: 'png' | 'jpg' = 'png',
) => {
  try {
    const dataURL = await exportAsImage(format)
    const link = document.createElement('a')
    link.download = `${filename}.${format}`
    link.href = dataURL
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return dataURL
  } catch (error) {
    console.error('Failed to download image:', error)
    throw error
  }
}

// Watch for image load
watch(imageLoaded, () => {
  if (imageLoaded.value && canvasRef.value) {
    // Canvas is ready for export
  }
})

const navigateToVaultFolders = () => {
  emit('update:vaultClick')
}

onMounted(() => {
  // Preload image for canvas
  const img = new Image()
  img.src = imageSrc
})

defineExpose({
  exportAsImage,
  downloadAsImage,
})
</script>

<style scoped>
.vault-folder-container {
  display: inline-block;
}

.vault-folder-image {
  display: block;
  max-width: 100%;
  height: auto;
}

.text-overlay-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.text-title,
.text-count {
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  line-height: 1.2;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}
</style>
