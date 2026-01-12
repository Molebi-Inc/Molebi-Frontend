/**
 * PWA Icon Generator Script
 * Generates all required PWA icons from source images
 *
 * Usage: node scripts/generate-pwa-icons.mjs
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PUBLIC_DIR = path.join(__dirname, '../public')
const SOURCE_DIR = '/Users/azeem/Downloads/molebi-logo'

// Icon sizes required for PWA
const PWA_SIZES = [64, 192, 512]
const APPLE_TOUCH_SIZE = 180
const FAVICON_SIZES = [16, 32, 48]
const MASKABLE_SIZE = 512

// Additional sizes for comprehensive platform support
const ADDITIONAL_SIZES = [
  { size: 72, name: 'pwa-72x72.png' },    // Android legacy
  { size: 96, name: 'pwa-96x96.png' },    // Android legacy
  { size: 128, name: 'pwa-128x128.png' }, // Chrome Web Store
  { size: 144, name: 'pwa-144x144.png' }, // Windows tiles
  { size: 152, name: 'pwa-152x152.png' }, // iPad
  { size: 167, name: 'pwa-167x167.png' }, // iPad Pro
  { size: 384, name: 'pwa-384x384.png' }, // Large displays
]

async function generateIcon(sourceBuffer, size, outputPath) {
  await sharp(sourceBuffer)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(outputPath)
  console.log(`Generated: ${path.basename(outputPath)} (${size}x${size})`)
}

async function generateMaskableIcon(sourceBuffer, size, outputPath) {
  // For maskable icons, add padding for the safe zone (80% safe area)
  // The logo should be ~80% of the icon size, centered
  const logoSize = Math.round(size * 0.7) // 70% for better visibility
  const padding = Math.round((size - logoSize) / 2)

  // Create a white background
  const background = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toBuffer()

  // Resize the logo
  const resizedLogo = await sharp(sourceBuffer)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toBuffer()

  // Composite the logo onto the white background
  await sharp(background)
    .composite([{
      input: resizedLogo,
      top: padding,
      left: padding
    }])
    .png()
    .toFile(outputPath)

  console.log(`Generated: ${path.basename(outputPath)} (${size}x${size} maskable)`)
}

async function generateFaviconPngs(sourceBuffer) {
  // Generate favicon PNG files at different sizes
  const faviconDir = path.join(PUBLIC_DIR, 'favicon')
  if (!fs.existsSync(faviconDir)) {
    fs.mkdirSync(faviconDir, { recursive: true })
  }

  for (const size of FAVICON_SIZES) {
    const outputPath = path.join(faviconDir, `favicon-${size}x${size}.png`)
    await generateIcon(sourceBuffer, size, outputPath)
  }

  // Also generate a 32x32 as the main favicon.png
  await generateIcon(sourceBuffer, 32, path.join(PUBLIC_DIR, 'favicon.png'))
}

async function createFaviconIco(sourceBuffer) {
  // Generate ICO file using multiple PNG layers
  // ICO format: we'll create a simple 32x32 ICO using the ICO header format

  const sizes = [16, 32, 48]
  const images = []

  for (const size of sizes) {
    const pngBuffer = await sharp(sourceBuffer)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer()

    images.push({ size, buffer: pngBuffer })
  }

  // Create ICO file header
  const iconCount = images.length
  const headerSize = 6 + (iconCount * 16) // 6 bytes header + 16 bytes per image entry

  let offset = headerSize
  const entries = []

  for (const img of images) {
    entries.push({
      width: img.size,
      height: img.size,
      offset: offset,
      size: img.buffer.length
    })
    offset += img.buffer.length
  }

  // Build ICO file
  const totalSize = offset
  const icoBuffer = Buffer.alloc(totalSize)

  // ICO Header (6 bytes)
  icoBuffer.writeUInt16LE(0, 0)      // Reserved (must be 0)
  icoBuffer.writeUInt16LE(1, 2)      // Image type (1 = ICO)
  icoBuffer.writeUInt16LE(iconCount, 4) // Number of images

  // Image directory entries (16 bytes each)
  let entryOffset = 6
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    icoBuffer.writeUInt8(entry.width === 256 ? 0 : entry.width, entryOffset)      // Width
    icoBuffer.writeUInt8(entry.height === 256 ? 0 : entry.height, entryOffset + 1) // Height
    icoBuffer.writeUInt8(0, entryOffset + 2)   // Color palette
    icoBuffer.writeUInt8(0, entryOffset + 3)   // Reserved
    icoBuffer.writeUInt16LE(1, entryOffset + 4)  // Color planes
    icoBuffer.writeUInt16LE(32, entryOffset + 6) // Bits per pixel
    icoBuffer.writeUInt32LE(entry.size, entryOffset + 8)   // Image size
    icoBuffer.writeUInt32LE(entry.offset, entryOffset + 12) // Image offset
    entryOffset += 16
  }

  // Write image data
  for (let i = 0; i < images.length; i++) {
    images[i].buffer.copy(icoBuffer, entries[i].offset)
  }

  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico')
  fs.writeFileSync(icoPath, icoBuffer)
  console.log(`Generated: favicon.ico (${sizes.join(', ')}px)`)
}

async function main() {
  console.log('PWA Icon Generator')
  console.log('==================\n')

  // Use the 512x512 source image
  const sourcePath = path.join(SOURCE_DIR, 'molebi-512x512.png')

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source image not found: ${sourcePath}`)
    process.exit(1)
  }

  const sourceBuffer = fs.readFileSync(sourcePath)
  console.log(`Using source: ${sourcePath}\n`)

  // Generate standard PWA icons
  console.log('Generating standard PWA icons...')
  for (const size of PWA_SIZES) {
    const outputPath = path.join(PUBLIC_DIR, `pwa-${size}x${size}.png`)
    await generateIcon(sourceBuffer, size, outputPath)
  }

  // Generate apple-touch-icon
  console.log('\nGenerating Apple Touch Icon...')
  await generateIcon(sourceBuffer, APPLE_TOUCH_SIZE, path.join(PUBLIC_DIR, 'apple-touch-icon.png'))

  // Generate additional sizes for better platform support
  console.log('\nGenerating additional platform icons...')
  for (const { size, name } of ADDITIONAL_SIZES) {
    const outputPath = path.join(PUBLIC_DIR, name)
    await generateIcon(sourceBuffer, size, outputPath)
  }

  // Generate maskable icon
  console.log('\nGenerating maskable icon...')
  await generateMaskableIcon(sourceBuffer, MASKABLE_SIZE, path.join(PUBLIC_DIR, 'maskable-icon-512x512.png'))

  // Also generate a 192x192 maskable icon
  await generateMaskableIcon(sourceBuffer, 192, path.join(PUBLIC_DIR, 'maskable-icon-192x192.png'))

  // Generate favicon
  console.log('\nGenerating favicon...')
  await createFaviconIco(sourceBuffer)

  console.log('\n==================')
  console.log('Icon generation complete!')
  console.log('\nGenerated files in /public:')

  const files = fs.readdirSync(PUBLIC_DIR)
    .filter(f => f.endsWith('.png') || f.endsWith('.ico'))
    .sort()

  files.forEach(f => {
    const stats = fs.statSync(path.join(PUBLIC_DIR, f))
    console.log(`  ${f} (${Math.round(stats.size / 1024)}KB)`)
  })
}

main().catch(console.error)
