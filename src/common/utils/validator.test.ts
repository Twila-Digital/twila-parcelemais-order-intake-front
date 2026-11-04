import { describe, expect, it } from 'vitest'
import {
  isValidDdd,
  isValidUf,
  PERSON_NAME_REGEX,
  ZIP_CODE_REGEX,
} from './validator'

describe('validator', () => {
  it('accepts zip codes with or without the hyphen', () => {
    expect(ZIP_CODE_REGEX.test('01001-000')).toBe(true)
    expect(ZIP_CODE_REGEX.test('01001000')).toBe(true)
    expect(ZIP_CODE_REGEX.test('01001-00')).toBe(false)
  })

  it('accepts names with accents, spaces, hyphens and apostrophes', () => {
    expect(PERSON_NAME_REGEX.test('João')).toBe(true)
    expect(PERSON_NAME_REGEX.test('Ana Clara')).toBe(true)
    expect(PERSON_NAME_REGEX.test("D'Ávila")).toBe(true)
    expect(PERSON_NAME_REGEX.test('Silva-Souza')).toBe(true)
    expect(PERSON_NAME_REGEX.test('Ana2')).toBe(false)
    expect(PERSON_NAME_REGEX.test('@na')).toBe(false)
  })

  it('validates brazilian area codes', () => {
    expect(isValidDdd('11')).toBe(true)
    expect(isValidDdd('99')).toBe(true)
    expect(isValidDdd('00')).toBe(false)
    expect(isValidDdd('20')).toBe(false)
    expect(isValidDdd('1')).toBe(false)
  })

  it('validates states', () => {
    expect(isValidUf('SP')).toBe(true)
    expect(isValidUf('sp')).toBe(true)
    expect(isValidUf('XX')).toBe(false)
  })
})
