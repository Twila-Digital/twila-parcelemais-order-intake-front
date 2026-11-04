import { describe, expect, it } from 'vitest'
import {
  cellphoneSchema,
  getWhatsappUrl,
  isValidCellphone,
  isValidCellphoneNumber,
  optionalCellphoneSchema,
  sanitizePhone,
} from './phone'

describe('sanitizePhone', () => {
  it('removes every non digit character', () => {
    expect(sanitizePhone('(11) 98765-4321')).toBe('11987654321')
  })
})

describe('isValidCellphone', () => {
  it('accepts a masked cellphone', () => {
    expect(isValidCellphone('(11) 98765-4321')).toBe(true)
  })

  it('accepts an unmasked cellphone', () => {
    expect(isValidCellphone('11987654321')).toBe(true)
  })

  it('rejects an incomplete number', () => {
    expect(isValidCellphone('(11) 9')).toBe(false)
    expect(isValidCellphone('(11) 98765-432')).toBe(false)
  })

  it('rejects a number that does not start with 9', () => {
    expect(isValidCellphone('(11) 8765-4321')).toBe(false)
  })

  it('rejects an invalid ddd', () => {
    expect(isValidCellphone('(00) 98765-4321')).toBe(false)
    expect(isValidCellphone('(10) 98765-4321')).toBe(false)
    expect(isValidCellphone('(20) 98765-4321')).toBe(false)
  })

  it('rejects repeated digits', () => {
    expect(isValidCellphone('(99) 99999-9999')).toBe(false)
  })

  it('rejects an empty value', () => {
    expect(isValidCellphone('')).toBe(false)
  })
})

describe('isValidCellphoneNumber', () => {
  it('accepts a masked number without ddd', () => {
    expect(isValidCellphoneNumber('98765-4321')).toBe(true)
  })

  it('rejects an incomplete or invalid number', () => {
    expect(isValidCellphoneNumber('9876-4321')).toBe(false)
    expect(isValidCellphoneNumber('88765-4321')).toBe(false)
    expect(isValidCellphoneNumber('99999-9999')).toBe(false)
  })
})

describe('cellphoneSchema', () => {
  it('accepts a valid cellphone', () => {
    expect(cellphoneSchema.safeParse('(11) 98765-4321').success).toBe(true)
  })

  it('rejects an empty or incomplete value', () => {
    expect(cellphoneSchema.safeParse('').success).toBe(false)
    expect(cellphoneSchema.safeParse('(11) 9').success).toBe(false)
  })
})

describe('optionalCellphoneSchema', () => {
  it('accepts undefined and empty values', () => {
    expect(optionalCellphoneSchema.safeParse(undefined).success).toBe(true)
    expect(optionalCellphoneSchema.safeParse('').success).toBe(true)
  })

  it('rejects an incomplete value', () => {
    expect(optionalCellphoneSchema.safeParse('(11) 9').success).toBe(false)
  })
})

describe('getWhatsappUrl', () => {
  it('keeps the country code when the phone already has it', () => {
    expect(getWhatsappUrl('+55 (11) 98765-4321')).toBe(
      'https://wa.me/5511987654321',
    )
  })

  it('adds the brazilian country code to a local phone', () => {
    expect(getWhatsappUrl('(11) 98765-4321')).toBe(
      'https://wa.me/5511987654321',
    )
  })
})
