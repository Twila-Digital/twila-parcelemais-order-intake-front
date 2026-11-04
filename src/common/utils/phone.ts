import { z } from 'zod'
import { isValidDdd } from '@/common/utils/validator'

export const CELLPHONE_REQUIRED_MESSAGE = 'O telefone é obrigatório'

export const CELLPHONE_INVALID_MESSAGE = 'Por favor, informe um celular válido.'

export const sanitizePhone = (value: string) => value.replace(/\D/g, '')

const BRAZIL_COUNTRY_CODE = '55'
const LOCAL_PHONE_LENGTH = 11

export const getWhatsappUrl = (phone: string) => {
  const digits = sanitizePhone(phone)
  const number =
    digits.length === LOCAL_PHONE_LENGTH
      ? `${BRAZIL_COUNTRY_CODE}${digits}`
      : digits

  return `https://wa.me/${number}`
}

export const isValidCellphoneNumber = (value: string) => {
  const digits = sanitizePhone(value)

  return (
    digits.length === 9 && digits.startsWith('9') && !/^(\d)\1+$/.test(digits)
  )
}

export const isValidCellphone = (value: string) => {
  const digits = sanitizePhone(value)

  return (
    digits.length === 11 &&
    isValidDdd(digits.slice(0, 2)) &&
    isValidCellphoneNumber(digits.slice(2))
  )
}

export const cellphoneSchema = z
  .string()
  .min(1, { message: CELLPHONE_REQUIRED_MESSAGE })
  .refine(isValidCellphone, CELLPHONE_INVALID_MESSAGE)

export const optionalCellphoneSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || isValidCellphone(value),
    CELLPHONE_INVALID_MESSAGE,
  )
