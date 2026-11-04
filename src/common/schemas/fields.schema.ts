import { z } from 'zod'
import { PERSON_NAME_REGEX } from '@/common/utils/validator'

export const emailSchema = z
  .string()
  .min(1, 'O e-mail é obrigatório')
  .pipe(z.email('O e-mail é inválido'))

export function personNameSchema(requiredMessage: string) {
  return z
    .string()
    .trim()
    .min(1, { message: requiredMessage })
    .regex(PERSON_NAME_REGEX, {
      message: 'Use apenas letras, espaços, hífen ou apóstrofo.',
    })
}
