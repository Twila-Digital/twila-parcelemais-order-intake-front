import { cnpj, cpf } from 'cpf-cnpj-validator'
import { z } from 'zod'
import { onlyDigits } from '@/common/utils/digits'
import type { IntakeHolderDocumentType } from '@/domain/intake.domain'

const HOLDER_DOCUMENT_VALIDATION: Record<
  IntakeHolderDocumentType,
  { isValid: (digits: string) => boolean; message: string }
> = {
  Cpf: { isValid: cpf.isValid, message: 'Por favor, informe um CPF válido.' },
  Cnpj: {
    isValid: cnpj.isValid,
    message: 'Por favor, informe um CNPJ válido.',
  },
}

export function getDepositAccountSchema(
  holderDocumentType: IntakeHolderDocumentType,
) {
  const holder = HOLDER_DOCUMENT_VALIDATION[holderDocumentType]

  return z.object({
    bankCode: z
      .string({ message: 'Por favor, informe um banco.' })
      .min(1, 'Por favor, informe um banco.'),
    accountType: z.enum(['Checking', 'Savings', 'Payment'], {
      message: 'Por favor, informe o tipo de conta.',
    }),
    agency: z
      .string({ message: 'Por favor, informe a agência.' })
      .length(4, 'O número da agência deve ter 4 digitos.'),
    agencyDigit: z
      .string()
      .min(1, 'Por favor, informe o dígito da agência.')
      .regex(/^\d?$/, 'Por favor, informe o dígito da agência corretamente.'),
    account: z
      .string({ message: 'Por favor, informe a conta.' })
      .min(4, 'Por favor, informe a conta corretamente.')
      .max(13, 'Por favor, informe a conta corretamente.'),
    accountDigit: z
      .string()
      .min(1, 'Por favor, informe o digito da conta.')
      .regex(/^[\dXx]?$/, 'Por favor, informe o digito da conta corretamente.'),
    holderDocument: z
      .string({ message: holder.message })
      .transform(onlyDigits)
      .refine(holder.isValid, holder.message),
  })
}

type DepositAccountSchema = ReturnType<typeof getDepositAccountSchema>

export type DepositAccountFormInput = z.input<DepositAccountSchema>
export type DepositAccountFormData = z.output<DepositAccountSchema>
