import { cnpj } from 'cpf-cnpj-validator'
import { z } from 'zod'
import { emailSchema } from '@/common/schemas/fields.schema'
import { onlyDigits } from '@/common/utils/digits'

const PHONE_LENGTHS = [10, 11]

export const establishmentDetailsSchema = z.object({
  document: z
    .string()
    .min(1, 'O CNPJ é obrigatório')
    .refine(
      (value) => cnpj.isValid(value),
      'Por favor, informe um CNPJ válido',
    ),
  openingDate: z
    .date({ message: 'A data de abertura é obrigatória' })
    .refine(
      (date) => date <= new Date(),
      'A data de abertura não pode ser futura.',
    ),
  legalName: z.string().trim().min(1, 'A razão social é obrigatória'),
  tradeName: z.string().trim().min(1, 'O nome fantasia é obrigatório'),
  phone: z
    .string()
    .min(1, 'O telefone é obrigatório')
    .refine(
      (value) => PHONE_LENGTHS.includes(onlyDigits(value).length),
      'Por favor, informe um telefone válido.',
    ),
  email: emailSchema,
})

export type EstablishmentDetailsFormData = z.infer<
  typeof establishmentDetailsSchema
>

export type EstablishmentDetailsFormInput = Omit<
  EstablishmentDetailsFormData,
  'openingDate'
> & { openingDate: Date | null }
