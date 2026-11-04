import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createVehicleInformationSchema,
  vehicleInformationSchema,
} from './vehicle-information.schema'

const VALID = {
  plate: 'abc1d23',
  renavam: '00000000019',
  color: 'Prata',
  chassi: '9BWZZZ377VT004251',
  manufactureYear: '2023',
}

function messagesFor(data: Partial<typeof VALID>) {
  const result = vehicleInformationSchema.safeParse({ ...VALID, ...data })
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe('vehicleInformationSchema', () => {
  it('accepts a complete vehicle and uppercases the plate', () => {
    expect(vehicleInformationSchema.parse(VALID).plate).toBe('ABC1D23')
  })

  it('accepts the old plate format', () => {
    expect(messagesFor({ plate: 'ABC-1234' })).toEqual([])
  })

  it('rejects an invalid plate', () => {
    expect(messagesFor({ plate: 'AB12345' })).toEqual(['A placa não é válida'])
  })

  it('requires 11 digits and a valid check digit in the renavam', () => {
    expect(messagesFor({ renavam: '1234' })).toContain(
      'O renavam deve ter 11 dígitos',
    )
    expect(messagesFor({ renavam: '12345678901' })).toEqual([
      'O renavam é inválido',
    ])
  })

  it('requires the color', () => {
    expect(messagesFor({ color: '' })).toEqual(['A cor é obrigatória'])
  })

  it('requires 17 characters and a valid chassi', () => {
    expect(messagesFor({ chassi: '9BWZZZ' })).toContain(
      'O chassi deve ter 17 caracteres',
    )
    expect(messagesFor({ chassi: '0BWZZZ377VT004251' })).toEqual([
      'O primeiro dígito do chassi não pode ser "0".',
    ])
  })

  describe('manufactureYear', () => {
    function yearMessagesFor(manufactureYear: string, modelYear?: number) {
      const result =
        createVehicleInformationSchema(
          modelYear,
        ).shape.manufactureYear.safeParse(manufactureYear)
      return result.success ? [] : result.error.issues.map((i) => i.message)
    }

    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2026-10-28T12:00:00'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('is required', () => {
      expect(yearMessagesFor('')).toContain('O ano de fabricação é obrigatório')
    })

    it('needs four digits', () => {
      expect(yearMessagesFor('202')).toEqual(['O ano deve ter 4 dígitos'])
      expect(yearMessagesFor('20a3')).toEqual(['O ano deve ter 4 dígitos'])
    })

    it.each(['0000', '1000', '1949', '2028', '9999'])(
      'rejects %s as out of range',
      (year) => {
        expect(yearMessagesFor(year)).toEqual([
          'Informe um ano entre 1950 e 2027',
        ])
      },
    )

    it('accepts the range limits', () => {
      expect(yearMessagesFor('1950')).toEqual([])
      expect(yearMessagesFor('2027')).toEqual([])
    })

    it('rejects a year after the model year', () => {
      expect(yearMessagesFor('2026', 2025)).toEqual([
        'O ano de fabricação não pode ser maior que o ano do modelo (2025)',
      ])
    })

    it('accepts a year up to the model year', () => {
      expect(yearMessagesFor('2025', 2026)).toEqual([])
      expect(yearMessagesFor('2026', 2026)).toEqual([])
    })

    it('skips the model year check when there is no model year', () => {
      expect(yearMessagesFor('2027')).toEqual([])
      expect(
        vehicleInformationSchema.shape.manufactureYear.safeParse('2027')
          .success,
      ).toBe(true)
    })
  })
})
