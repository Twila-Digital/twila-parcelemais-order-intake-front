import { z } from 'zod'
import { emailSchema } from '@/common/schemas/fields.schema'
import { cellphoneSchema } from '@/common/utils/phone'

export const sellerDataSchema = z.object({
  sellerType: z.enum(['Individual', 'Store']),
  phoneNumber: cellphoneSchema,
  email: emailSchema,
})

export type SellerDataFormData = z.infer<typeof sellerDataSchema>
