#!/usr/bin/env node

/**
 * Generate PWA icons from the Molebi logo SVG
 * 
 * This script converts the logo SVG to all required PWA icon sizes
 * 
 * Requirements:
 * - Node.js with sharp: npm install sharp --save-dev
 * - Or use the manual method with online tools
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.dirname(__dirname)

const logoPath = path.join(projectRoot, 'src/assets/svg/logo.svg')
const publicDir = path.join(projectRoot, 'public')

// Check if logo exists
if (!fs.existsSync(logoPath)) {
  console.error('❌ Logo not found at:', logoPath)
  process.exit(1)
}

// Check if sharp is available
let sharp
try {
  sharp = (await import('sharp')).default
} catch (error) {
  console.log('⚠️  Sharp not installed. Installing...')
  console.log('   Run: npm install sharp --save-dev')
  console.log('\n📝 Alternative: Use online tools to convert SVG to PNG:')
  console.log('   1. Open src/assets/svg/logo.svg in a browser')
  console.log('   2. Take a screenshot or export as PNG at 512x512')
  console.log('   3. Use https://realfavicongenerator.net/ to generate all sizes')
  process.exit(1)
}

console.log('🎨 Generating PWA icons from logo...\n')

// Read SVG
const svgContent = fs.readFileSync(logoPath, 'utf8')
const svgBuffer = Buffer.from(svgContent)

// Icon configurations
const icons = [
  { name: 'pwa-64x64.png', size: 64 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

// Generate regular icons with black background (as per logo design)
for (const icon of icons) {
  const outputPath = path.join(publicDir, icon.name)
  
  try {
    await sharp(svgBuffer)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }, // Black background
      })
      .png()
      .toFile(outputPath)
    
    console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`)
  } catch (error) {
    console.error(`❌ Failed to generate ${icon.name}:`, error.message)
  }
}

// Generate maskable icon (with safe zone padding)
// Maskable icons need ~10% padding on all sides for Android adaptive icons
const maskableSize = 512
const safeZone = Math.floor(maskableSize * 0.1) // 10% padding
const contentSize = maskableSize - (safeZone * 2)

try {
  await sharp(svgBuffer)
    .resize(contentSize, contentSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 1 }, // Black background
    })
    .extend({
      top: safeZone,
      bottom: safeZone,
      left: safeZone,
      right: safeZone,
      background: { r: 0, g: 0, b: 0, alpha: 1 }, // Black background
    })
    .png()
    .toFile(path.join(publicDir, 'maskable-icon-512x512.png'))
  
  console.log(`✅ Generated maskable-icon-512x512.png (with safe zone)`)
} catch (error) {
  console.error(`❌ Failed to generate maskable icon:`, error.message)
}

// Create a simple SVG for masked-icon.svg (Safari pinned tabs)
const maskedIconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#0F4C3F"/>
  <g transform="translate(64, 64) scale(2.24)">
    ${fs.readFileSync(logoPath, 'utf8').match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] || ''}
  </g>
</svg>`

fs.writeFileSync(path.join(publicDir, 'masked-icon.svg'), maskedIconSvg)
console.log(`✅ Generated masked-icon.svg`)

console.log('\n✨ All PWA icons generated successfully!')
console.log('   Icons are in the /public folder')
console.log('\n📱 Next steps:')
console.log('   1. Run: npm run build')
console.log('   2. Test PWA installation in your browser')
console.log('   3. Check DevTools → Application → Manifest for any errors\n')

