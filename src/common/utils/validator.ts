import { ufOptions } from '@/common/options/uf'

export const ZIP_CODE_REGEX = /^\d{5}-?\d{3}$/

export const PERSON_NAME_REGEX =
  /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[\s'-]+[A-Za-zÀ-ÖØ-öø-ÿ]+)*$/

const VALID_DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35,
  37, 38, 41, 42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64,
  65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88,
  89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
])

export function isValidDdd(ddd: string): boolean {
  return /^\d{2}$/.test(ddd) && VALID_DDDS.has(Number(ddd))
}

export function isValidUf(uf: string): boolean {
  return ufOptions.has(uf.toUpperCase())
}
