#!/usr/bin/env node

/**
 * Script to generate PWA icons from a source image
 *
 * Usage:
 * 1. Place a 512x512px source image in public/icon-source.png
 * 2. Run: node scripts/generate-pwa-icons.js
 *
 * Or use an online tool like:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 * - https://maskable.app/
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicDir = path.join(path.dirname(__dirname), 'public')
const requiredIcons = [
  { name: 'pwa-64x64.png', size: 64 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'maskable-icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'masked-icon.svg', size: 512 },
]

console.log('📱 PWA Icon Generator')
console.log('====================\n')

console.log('Required icon files:')
requiredIcons.forEach((icon) => {
  const iconPath = path.join(publicDir, icon.name)
  const exists = fs.existsSync(iconPath)
  console.log(`  ${exists ? '✅' : '❌'} ${icon.name} (${icon.size}x${icon.size})`)
})

console.log('\n📝 Instructions:')
console.log('1. Create a 512x512px square icon with your app logo')
console.log('2. Use one of these tools to generate all required sizes:')
console.log('   - https://realfavicongenerator.net/')
console.log('   - https://www.pwabuilder.com/imageGenerator')
console.log('   - https://maskable.app/ (for maskable icons)')
console.log('3. Place the generated icons in the /public folder')
console.log('4. For maskable-icon-512x512.png, ensure the icon has safe zone padding')
console.log('   (icon should be centered with ~10% padding on all sides)')
console.log('\n💡 Tip: You can also use ImageMagick or Sharp to resize programmatically:')
console.log('   npm install sharp')
console.log('   Then create a script to resize your source image to all required sizes\n')
