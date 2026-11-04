import { describe, expect, it } from 'vitest'
import { createAccountSchema } from './create-account.schema'

const yearsAgo = (years: number) => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - years)
  return date
}

const valid = {
  firstName: 'Maria',
  lastName: 'Silva',
  cpf: '529.982.247-25',
  dateOfBirth: yearsAgo(30),
  email: 'maria@email.com',
}

function errorsFor(value: unknown) {
  const result = createAccountSchema.safeParse(value)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path[0], issue.message]),
  )
}

describe('createAccountSchema', () => {
  it('accepts a complete account', () => {
    expect(createAccountSchema.safeParse(valid).success).toBe(true)
  })

  it('requires the birth date and a valid CPF', () => {
    expect(
      errorsFor({ ...valid, dateOfBirth: null, cpf: '111.111.111-11' }),
    ).toEqual({
      cpf: 'Por favor, informe um CPF válido',
      dateOfBirth: 'A data de nascimento é obrigatória',
    })
  })

  it.each([17, 76])('rejects someone aged %s', (age) => {
    expect(errorsFor({ ...valid, dateOfBirth: yearsAgo(age) })).toEqual({
      dateOfBirth: 'Você precisa ter entre 18 e 75 anos.',
    })
  })
})
