// Centralized icon resolver to avoid using import.meta in Vue SFCs
const iconModules = import.meta.glob('/src/assets/icons/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function ensureSvgName(name: string): string {
  return name.endsWith('.svg') ? name : `${name}.svg`
}

export function resolveIconUrl(name: string): string {
  const normalized = ensureSvgName(name)
  const key = `/src/assets/icons/${normalized}`
  const fromGlob = iconModules[key]
  if (fromGlob) return fromGlob

  // Fallback: construct URL via import.meta.url in case glob missed the key
  try {
    // helpers -> ../assets/icons
    const url = new URL(`../assets/icons/${normalized}`, import.meta.url)
    return url.pathname
  } catch {
    if (import.meta.env.DEV) {
      console.warn(`[MlbIcon] Icon not found: ${name}`)
    }
    return ''
  }
}
