import { describe, expect, it } from 'vitest'
import { validateRenavam } from './validate-renavam'

describe('validateRenavam', () => {
  it('accepts a valid 11-digit RENAVAM', () => {
    expect(validateRenavam('07907233802')).toBe(true)
  })

  it('left-pads shorter values before validating', () => {
    expect(validateRenavam('7907233802')).toBe(true)
  })

  it('rejects a value with a wrong check digit', () => {
    expect(validateRenavam('07907233803')).toBe(false)
  })

  it('rejects empty or non-numeric input', () => {
    expect(validateRenavam('')).toBe(false)
    expect(validateRenavam('   ')).toBe(false)
    expect(validateRenavam('abc12345678')).toBe(false)
  })
})
