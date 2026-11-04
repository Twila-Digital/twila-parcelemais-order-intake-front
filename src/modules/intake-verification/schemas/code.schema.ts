import { z } from 'zod'
import { VERIFICATION_CODE_LENGTH } from '../constants/verification'

export const codeSchema = z.object({
  code: z
    .string()
    .regex(
      new RegExp(`^\\d{${VERIFICATION_CODE_LENGTH}}$`),
      `Informe o código de ${VERIFICATION_CODE_LENGTH} dígitos.`,
    ),
})

export type CodeFormData = z.infer<typeof codeSchema>
