import { describe, expect, it } from 'vitest'
import { PLATE_REGEX } from './plate'

describe('PLATE_REGEX', () => {
  it('matches the old Brazilian format ABC-1234', () => {
    expect(PLATE_REGEX.test('ABC-1234')).toBe(true)
  })

  it('matches the Mercosul format ABC1D23', () => {
    expect(PLATE_REGEX.test('ABC1D23')).toBe(true)
  })

  it('rejects malformed plates', () => {
    expect(PLATE_REGEX.test('ABC1234')).toBe(false)
    expect(PLATE_REGEX.test('AB-1234')).toBe(false)
    expect(PLATE_REGEX.test('ABCD123')).toBe(false)
    expect(PLATE_REGEX.test('')).toBe(false)
  })
})
