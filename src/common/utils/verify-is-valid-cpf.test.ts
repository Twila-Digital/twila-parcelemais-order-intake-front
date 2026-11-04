import { describe, expect, it } from 'vitest'
import { verifyIsValidCpf } from './verify-is-valid-cpf'

describe('verifyIsValidCpf', () => {
  it('accepts a valid CPF (unmasked)', () => {
    expect(verifyIsValidCpf('11144477735')).toBe(true)
  })

  it('accepts a valid CPF with mask', () => {
    expect(verifyIsValidCpf('111.444.777-35')).toBe(true)
  })

  it('rejects a CPF with a wrong verification digit', () => {
    expect(verifyIsValidCpf('11144477736')).toBe(false)
  })

  it('rejects CPFs made of repeated digits', () => {
    expect(verifyIsValidCpf('11111111111')).toBe(false)
    expect(verifyIsValidCpf('00000000000')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(verifyIsValidCpf('')).toBe(false)
  })
})
