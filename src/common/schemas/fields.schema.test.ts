import { describe, expect, it } from 'vitest'
import type { ZodType } from 'zod'
import { emailSchema, personNameSchema } from './fields.schema'

function firstError(schema: ZodType, value: unknown) {
  const result = schema.safeParse(value)
  return result.success ? undefined : result.error.issues[0].message
}

describe('field schemas', () => {
  it('validates e-mails', () => {
    expect(firstError(emailSchema, 'maria@email.com')).toBeUndefined()
    expect(firstError(emailSchema, '')).toBe('O e-mail é obrigatório')
    expect(firstError(emailSchema, 'maria@')).toBe('O e-mail é inválido')
  })

  it('validates person names', () => {
    const schema = personNameSchema('O nome é obrigatório')
    expect(firstError(schema, '  Maria  ')).toBeUndefined()
    expect(firstError(schema, '')).toBe('O nome é obrigatório')
    expect(firstError(schema, 'Maria123')).toBe(
      'Use apenas letras, espaços, hífen ou apóstrofo.',
    )
  })
})
