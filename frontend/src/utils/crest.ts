const CREST_PALETTE = [
  '#2563eb', // Azul
  '#dc2626', // Rojo
  '#ea580c', // Naranja
  '#16a34a', // Verde
  '#9333ea', // Violeta
  '#06b6d4', // Celeste / Cian
  '#d97706', // Ámbar / Oro
  '#db2777', // Fucsia
]

const SHADES = [0, 18, 36, 54]

const DEEP = '#0b0407'

const SLOTS: string[] = SHADES.flatMap((depth) =>
  CREST_PALETTE.map((hex) => (depth === 0 ? hex : withMix(hex, 100 - depth, DEEP))),
)

function withMix(color: string, percent: number, other: string): string {
  return `color-mix(in oklab, ${color} ${percent}%, ${other})`
}

export function withColorAlpha(color: string, alpha: number): string {
  if (alpha >= 1) return color
  const percent = Math.round(Math.max(0, Math.min(1, alpha)) * 100)
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`
}

function foldName(name: string): string {
  return name
    .trim()
    .toLocaleLowerCase('es-AR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function hashName(value: string): number {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

function avalanche(value: number): number {
  let hash = value
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x85ebca6b)
  hash ^= hash >>> 13
  hash = Math.imul(hash, 0xc2b2ae35)
  hash ^= hash >>> 16
  return hash >>> 0
}

function slotOf(name: string): number {
  return avalanche(hashName(foldName(name))) % SLOTS.length
}

export function teamCrestColor(name: string, alpha = 1): string {
  const value = foldName(name)
  if (value.length === 0) return withColorAlpha(SLOTS[0], alpha)
  return withColorAlpha(SLOTS[slotOf(value)], alpha)
}

export function assignCrestColors(names: readonly string[]): (name: string) => string {
  const keys = Array.from(new Set(names.map(foldName))).filter((key) => key.length > 0)
  keys.sort((a, b) => a.localeCompare(b, 'es'))
  const taken = new Set<number>()
  const resolved = new Map<string, string>()

  for (const key of keys) {
    const start = slotOf(key)
    let slot = start
    for (let step = 0; step < SLOTS.length; step += 1) {
      const candidate = (start + step) % SLOTS.length
      if (!taken.has(candidate)) {
        slot = candidate
        break
      }
    }
    taken.add(slot)
    resolved.set(key, SLOTS[slot])
  }

  return (name: string): string => {
    const key = foldName(name)
    const color = resolved.get(key)
    return color ?? (key.length === 0 ? SLOTS[0] : teamCrestColor(key))
  }
}

export function crestInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  if (words.length === 0) return '?'
  if (words.length === 1) {
    const word = words[0]
    return (word.length <= 2 ? word : word.charAt(0)).toLocaleUpperCase('es-AR')
  }
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toLocaleUpperCase('es-AR')
}
