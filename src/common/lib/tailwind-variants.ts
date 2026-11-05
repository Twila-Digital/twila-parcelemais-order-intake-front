import { tv as originalTv } from 'tailwind-variants'
import { tailwindMergeConfig } from '@/constants/tailwind-merge-config'

export const tv: typeof originalTv = (config, options?) => {
  return originalTv(config, {
    ...options,
    twMergeConfig: tailwindMergeConfig,
  })
}

/** @public reservado para as próximas etapas */
export type { VariantProps } from 'tailwind-variants'
