# PWA Icons Setup

This app requires the following icon files in the `/public` directory for proper PWA functionality:

## Required Icons

- `pwa-64x64.png` - 64x64px icon
- `pwa-192x192.png` - 192x192px icon (Android home screen)
- `pwa-512x512.png` - 512x512px icon (Android splash screen)
- `maskable-icon-512x512.png` - 512x512px maskable icon (Android adaptive icons)
- `apple-touch-icon.png` - 180x180px icon (iOS home screen)
- `masked-icon.svg` - SVG icon for Safari pinned tabs

## Quick Setup

### Option 1: Online Tools (Recommended)

1. **RealFaviconGenerator** - https://realfavicongenerator.net/
   - Upload your 512x512px source image
   - Configure settings for PWA
   - Download and extract to `/public` folder

2. **PWA Builder Image Generator** - https://www.pwabuilder.com/imageGenerator
   - Upload your source image
   - Download the generated icons

3. **Maskable.app** - https://maskable.app/
   - Create maskable icons with proper safe zones
   - Download the maskable-icon-512x512.png

### Option 2: Manual Creation

1. Create a 512x512px square source image with your app logo
2. Use image editing software to resize to each required size
3. For maskable icons, ensure the logo is centered with ~10% padding (safe zone)
4. Save all files to the `/public` directory

### Option 3: Programmatic Generation

If you have Node.js and Sharp installed:

```bash
npm install sharp --save-dev
```

Then create a script to resize your source image:

```javascript
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const sizes = [64, 192, 512, 180]
const source = 'public/icon-source.png'

sizes.forEach(size => {
  sharp(source)
    .resize(size, size)
    .toFile(`public/pwa-${size}x${size}.png`)
})
```

## Verification

After adding the icons:

1. Run `npm run build` to build the app
2. Check the browser console for any missing icon warnings
3. Test PWA installation on:
   - Chrome/Edge (desktop & mobile)
   - Safari (iOS)
   - Firefox (mobile)

## Testing PWA Installation

1. **Chrome/Edge Desktop:**
   - Open DevTools → Application → Manifest
   - Check for errors
   - Look for "Install" button in address bar

2. **Mobile Chrome:**
   - Visit the site
   - Look for "Add to Home Screen" prompt
   - Or use browser menu → "Install App"

3. **Safari iOS:**
   - Visit the site
   - Tap Share → "Add to Home Screen"

## Notes

- Icons should be square (1:1 aspect ratio)
- Use PNG format for best compatibility
- Ensure icons have transparent backgrounds where appropriate
- Maskable icons need safe zone padding for Android adaptive icons

