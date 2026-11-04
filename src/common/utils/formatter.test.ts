import { describe, expect, it } from 'vitest'
import { formatter } from './formatter'

const normalizeSpaces = (value: string) => value.replace(/\s/g, ' ')

describe('formatter.formatCurrencyBRL', () => {
  it('formats with cents by default', () => {
    expect(normalizeSpaces(formatter.formatCurrencyBRL(105439))).toBe(
      'R$ 105.439,00',
    )
  })

  it('omits cents when showCents is false', () => {
    expect(
      normalizeSpaces(
        formatter.formatCurrencyBRL(105439, { showCents: false }),
      ),
    ).toBe('R$ 105.439')
  })
})

describe('formatter.formatCompactNumber', () => {
  it('abbreviates millions and thousands in pt-BR', () => {
    const format = (value: number) =>
      formatter.formatCompactNumber(value).replace(/\s/g, ' ')

    expect(format(1_500_000)).toBe('1,5 mi')
    expect(format(15_300)).toBe('15,3 mil')
    expect(format(950)).toBe('950')
  })
})

describe('formatter.formatCPF', () => {
  it('masks an 11-digit CPF', () => {
    expect(formatter.formatCPF('11144477735')).toBe('111.444.777-35')
  })
})

describe('formatter.formatCNPJ', () => {
  it('masks a 14-digit CNPJ', () => {
    expect(formatter.formatCNPJ('11222333000181')).toBe('11.222.333/0001-81')
  })

  it('formats an alphanumeric CNPJ and uppercases letters', () => {
    expect(formatter.formatCNPJ('12abc34501de35')).toBe('12.ABC.345/01DE-35')
  })

  it('is idempotent when given an already-formatted CNPJ from the API', () => {
    expect(formatter.formatCNPJ('12.ABC.345/01DE-35')).toBe(
      '12.ABC.345/01DE-35',
    )
  })
})

describe('formatter.formatCNPJInput', () => {
  it('progressively masks input as the user types', () => {
    expect(formatter.formatCNPJInput('12')).toBe('12')
    expect(formatter.formatCNPJInput('12a')).toBe('12.A')
    expect(formatter.formatCNPJInput('12abc345')).toBe('12.ABC.345')
    expect(formatter.formatCNPJInput('12abc34501de')).toBe('12.ABC.345/01DE')
    expect(formatter.formatCNPJInput('12abc34501de35')).toBe(
      '12.ABC.345/01DE-35',
    )
  })

  it('strips invalid characters and caps at 14 raw characters', () => {
    expect(formatter.formatCNPJInput('12.abc.345/01de-35extra')).toBe(
      '12.ABC.345/01DE-35',
    )
  })
})

describe('formatter.formatPhone', () => {
  it('formats a phone with country code into (DD) 9XXXX-XXXX', () => {
    expect(formatter.formatPhone('5511987654321')).toBe('(11) 98765-4321')
  })

  it('returns an empty string for empty input', () => {
    expect(formatter.formatPhone('')).toBe('')
  })
})
