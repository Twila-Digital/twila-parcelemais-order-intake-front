import { describe, expect, it } from 'vitest'
import { establishmentDetailsSchema } from './establishment-details.schema'

const valid = {
  document: '11.222.333/0001-81',
  openingDate: new Date(2015, 2, 10),
  legalName: 'Auto Exemplo Ltda',
  tradeName: 'Auto Exemplo',
  phone: '(11) 3333-4444',
  email: 'contato@auto.com',
}

function errorsFor(value: unknown) {
  const result = establishmentDetailsSchema.safeParse(value)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path[0], issue.message]),
  )
}

describe('establishmentDetailsSchema', () => {
  it('accepts a landline or a cellphone', () => {
    expect(establishmentDetailsSchema.safeParse(valid).success).toBe(true)
    expect(
      establishmentDetailsSchema.safeParse({
        ...valid,
        phone: '(11) 98765-4321',
      }).success,
    ).toBe(true)
  })

  it('rejects an invalid CNPJ and a future opening date', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    expect(
      errorsFor({
        ...valid,
        document: '11.111.111/1111-11',
        openingDate: tomorrow,
      }),
    ).toEqual({
      document: 'Por favor, informe um CNPJ válido',
      openingDate: 'A data de abertura não pode ser futura.',
    })
  })
})
