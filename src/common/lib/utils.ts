import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import { tailwindMergeConfig } from '@/constants/tailwind-merge-config'

const twMerge = extendTailwindMerge(tailwindMergeConfig)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
