import { getContrastRatio } from '@twila-digital/components/white-label'
import { describe, expect, it } from 'vitest'
import { lightenUntilReadable, mixWithWhite, readableOnWhite } from './color'

const GRAY_TEXT = '#62636c'

describe('mixWithWhite', () => {
  it('mixes a color with white by the color weight', () => {
    expect(mixWithWhite('#000000', 0.5)).toBe('#808080')
    expect(mixWithWhite('#fff', 1)).toBe('#ffffff')
  })

  it('ignores a value that is not a hex color', () => {
    expect(mixWithWhite('red', 0.5)).toBeNull()
  })
})

describe('lightenUntilReadable', () => {
  it('keeps a light background as it is', () => {
    expect(lightenUntilReadable('#fff1ee', GRAY_TEXT, 4.5)).toBe('#fff1ee')
  })

  it('lightens a dark background until the gray text is readable', () => {
    const background = lightenUntilReadable('#000000', GRAY_TEXT, 4.5)

    expect(background).not.toBe('#000000')
    expect(
      getContrastRatio(GRAY_TEXT, background as string),
    ).toBeGreaterThanOrEqual(4.5)
  })
})

describe('readableOnWhite', () => {
  it('keeps a color that is readable on white', () => {
    expect(readableOnWhite('#073B4C', '#1e1f24', 3)).toBe('#073b4c')
  })

  it('falls back when the color disappears on white', () => {
    expect(readableOnWhite('#ECEAEA', '#1e1f24', 3)).toBe('#1e1f24')
  })
})
