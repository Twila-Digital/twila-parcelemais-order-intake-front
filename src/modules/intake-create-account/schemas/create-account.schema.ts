import { z } from 'zod'
import { emailSchema, personNameSchema } from '@/common/schemas/fields.schema'
import { getAgeInYears } from '@/common/utils/date'
import { verifyIsValidCpf } from '@/common/utils/verify-is-valid-cpf'

export const MIN_AGE = 18
export const MAX_AGE = 75

export const createAccountSchema = z.object({
  firstName: personNameSchema('O nome é obrigatório'),
  lastName: personNameSchema('O sobrenome é obrigatório'),
  cpf: z
    .string()
    .min(1, 'O CPF é obrigatório')
    .refine(verifyIsValidCpf, 'Por favor, informe um CPF válido'),
  dateOfBirth: z
    .date({ message: 'A data de nascimento é obrigatória' })
    .refine((date) => {
      const age = getAgeInYears(date)
      return age >= MIN_AGE && age <= MAX_AGE
    }, `Você precisa ter entre ${MIN_AGE} e ${MAX_AGE} anos.`),
  email: emailSchema,
})

export type CreateAccountFormData = z.infer<typeof createAccountSchema>

export type CreateAccountFormInput = Omit<
  CreateAccountFormData,
  'dateOfBirth'
> & { dateOfBirth: Date | null }
