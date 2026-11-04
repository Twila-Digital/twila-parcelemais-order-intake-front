import { describe, expect, it } from 'vitest'
import type { ZodType } from 'zod'
import { getDepositAccountSchema } from './deposit-account.schema'

const cpfSchema = getDepositAccountSchema('Cpf')
const cnpjSchema = getDepositAccountSchema('Cnpj')

const valid = {
  bankCode: '341',
  accountType: 'Checking',
  agency: '0001',
  agencyDigit: '0',
  account: '12345678',
  accountDigit: '9',
  holderDocument: '529.982.247-25',
}

function errorsFor(schema: ZodType, value: unknown) {
  const result = schema.safeParse(value)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path[0], issue.message]),
  )
}

describe('getDepositAccountSchema', () => {
  it('accepts a complete account', () => {
    expect(cpfSchema.safeParse(valid).success).toBe(true)
  })

  it('requires every field, including the agency digit', () => {
    expect(
      errorsFor(cpfSchema, {
        bankCode: '',
        agency: '',
        agencyDigit: '',
        account: '',
        accountDigit: '',
        holderDocument: '',
      }),
    ).toEqual({
      bankCode: 'Por favor, informe um banco.',
      accountType: 'Por favor, informe o tipo de conta.',
      agency: 'O número da agência deve ter 4 digitos.',
      agencyDigit: 'Por favor, informe o dígito da agência.',
      account: 'Por favor, informe a conta corretamente.',
      accountDigit: 'Por favor, informe o digito da conta.',
      holderDocument: 'Por favor, informe um CPF válido.',
    })
  })

  it('validates agency, account and digit lengths', () => {
    expect(
      errorsFor(cpfSchema, {
        ...valid,
        agency: '12',
        agencyDigit: 'Y',
        account: '123',
        accountDigit: 'Y',
      }),
    ).toEqual({
      agency: 'O número da agência deve ter 4 digitos.',
      agencyDigit: 'Por favor, informe o dígito da agência corretamente.',
      account: 'Por favor, informe a conta corretamente.',
      accountDigit: 'Por favor, informe o digito da conta corretamente.',
    })
    expect(
      errorsFor(cpfSchema, { ...valid, account: '12345678901234' }),
    ).toEqual({ account: 'Por favor, informe a conta corretamente.' })
  })

  it('accepts only a CPF for an individual holder', () => {
    expect(
      errorsFor(cpfSchema, { ...valid, holderDocument: '11.222.333/0001-81' }),
    ).toEqual({ holderDocument: 'Por favor, informe um CPF válido.' })
  })

  it('accepts only a CNPJ for a store holder and strips the mask', () => {
    expect(errorsFor(cnpjSchema, valid)).toEqual({
      holderDocument: 'Por favor, informe um CNPJ válido.',
    })
    const result = cnpjSchema.safeParse({
      ...valid,
      holderDocument: '11.222.333/0001-81',
    })
    expect(result.success && result.data.holderDocument).toBe('11222333000181')
  })

  it('accepts X as the account digit', () => {
    expect(
      cpfSchema.safeParse({
        ...valid,
        accountDigit: 'x',
        accountType: 'Payment',
      }).success,
    ).toBe(true)
  })

  it('accepts only a number as the agency digit', () => {
    expect(errorsFor(cpfSchema, { ...valid, agencyDigit: 'X' })).toEqual({
      agencyDigit: 'Por favor, informe o dígito da agência corretamente.',
    })
  })
})
