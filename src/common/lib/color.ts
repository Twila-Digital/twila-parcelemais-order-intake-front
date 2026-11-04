import { getContrastRatio } from '@twila-digital/components/white-label'

const HEX_COLOR = /^#([\da-f]{3}|[\da-f]{6})$/i
const MIX_STEP = 0.05

type Rgb = [number, number, number]

function toRgb(hex: string): Rgb | null {
  const match = HEX_COLOR.exec(hex.trim())
  if (!match) return null
  const digits =
    match[1].length === 3
      ? [...match[1]].map((digit) => digit + digit).join('')
      : match[1]
  return [0, 2, 4].map((start) =>
    Number.parseInt(digits.slice(start, start + 2), 16),
  ) as Rgb
}

function toHex(rgb: Rgb) {
  return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`
}

export function mixWithWhite(hex: string, colorWeight: number) {
  const rgb = toRgb(hex)
  if (!rgb) return null
  return toHex(
    rgb.map(
      (channel) => channel * colorWeight + 255 * (1 - colorWeight),
    ) as Rgb,
  )
}

export function lightenUntilReadable(
  background: string,
  text: string,
  minContrast: number,
) {
  if (!toRgb(background)) return null
  for (let weight = 1; weight > 0; weight -= MIX_STEP) {
    const candidate = mixWithWhite(background, weight) as string
    if (getContrastRatio(text, candidate) >= minContrast) return candidate
  }
  return '#ffffff'
}

export function readableOnWhite(
  color: string,
  fallback: string,
  minContrast: number,
) {
  if (!toRgb(color)) return null
  return getContrastRatio(color, '#ffffff') >= minContrast
    ? color.trim().toLowerCase()
    : fallback
}
