import { z } from 'zod'
import { PLATE_INVALID_MESSAGE, PLATE_REGEX } from '@/common/utils/plate'
import { validateChassi } from '@/common/utils/validate-chassi'
import { validateRenavam } from '@/common/utils/validate-renavam'

export const MIN_MANUFACTURE_YEAR = 1950

export function getMaxManufactureYear() {
  return new Date().getFullYear() + 1
}

function createManufactureYearSchema(modelYear?: number) {
  return z
    .string({ error: 'O ano de fabricação é obrigatório' })
    .min(1, { message: 'O ano de fabricação é obrigatório' })
    .regex(/^\d{4}$/, { message: 'O ano deve ter 4 dígitos', abort: true })
    .superRefine((val, ctx) => {
      const year = Number(val)
      const maxYear = getMaxManufactureYear()
      if (year < MIN_MANUFACTURE_YEAR || year > maxYear) {
        ctx.addIssue({
          code: 'custom',
          message: `Informe um ano entre ${MIN_MANUFACTURE_YEAR} e ${maxYear}`,
        })
        return
      }
      if (modelYear && year > modelYear) {
        ctx.addIssue({
          code: 'custom',
          message: `O ano de fabricação não pode ser maior que o ano do modelo (${modelYear})`,
        })
      }
    })
}

export const vehicleInformationSchema = z.object({
  plate: z
    .string({ error: 'A placa é obrigatória' })
    .regex(PLATE_REGEX, PLATE_INVALID_MESSAGE)
    .transform((val) => val.toUpperCase()),
  renavam: z
    .string({
      error: 'O renavam é obrigatório',
    })
    .length(11, {
      message: 'O renavam deve ter 11 dígitos',
    })
    .refine((val) => validateRenavam(val), {
      message: 'O renavam é inválido',
    }),
  color: z.string().min(1, { message: 'A cor é obrigatória' }),
  chassi: z
    .string({
      message: 'O chassi é obrigatório',
    })
    .length(17, { message: 'O chassi deve ter 17 caracteres' })
    .superRefine((val, ctx) => {
      const errors = validateChassi(val)
      if (errors.length > 0) {
        ctx.addIssue({
          code: 'custom',
          message: errors[0],
        })
      }
    }),
  manufactureYear: createManufactureYearSchema(),
})

export function createVehicleInformationSchema(modelYear?: number) {
  return vehicleInformationSchema.extend({
    manufactureYear: createManufactureYearSchema(modelYear),
  })
}

export type VehicleInformationFormData = z.infer<
  typeof vehicleInformationSchema
>
