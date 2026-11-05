import type { Option } from '@/types/option'

export const ufOptions: Map<string, Option> = new Map([
  ['AC', { value: 'AC', label: 'AC' }],
  ['AL', { value: 'AL', label: 'AL' }],
  ['AP', { value: 'AP', label: 'AP' }],
  ['AM', { value: 'AM', label: 'AM' }],
  ['BA', { value: 'BA', label: 'BA' }],
  ['CE', { value: 'CE', label: 'CE' }],
  ['DF', { value: 'DF', label: 'DF' }],
  ['ES', { value: 'ES', label: 'ES' }],
  ['GO', { value: 'GO', label: 'GO' }],
  ['MA', { value: 'MA', label: 'MA' }],
  ['MT', { value: 'MT', label: 'MT' }],
  ['MS', { value: 'MS', label: 'MS' }],
  ['MG', { value: 'MG', label: 'MG' }],
  ['PA', { value: 'PA', label: 'PA' }],
  ['PB', { value: 'PB', label: 'PB' }],
  ['PR', { value: 'PR', label: 'PR' }],
  ['PE', { value: 'PE', label: 'PE' }],
  ['PI', { value: 'PI', label: 'PI' }],
  ['RJ', { value: 'RJ', label: 'RJ' }],
  ['RN', { value: 'RN', label: 'RN' }],
  ['RS', { value: 'RS', label: 'RS' }],
  ['RO', { value: 'RO', label: 'RO' }],
  ['RR', { value: 'RR', label: 'RR' }],
  ['SC', { value: 'SC', label: 'SC' }],
  ['SP', { value: 'SP', label: 'SP' }],
  ['SE', { value: 'SE', label: 'SE' }],
  ['TO', { value: 'TO', label: 'TO' }],
])

/** @public reservado para as próximas etapas */
export const ufItems = Array.from(ufOptions.values()).map((option) => ({
  label: option.label,
  value: String(option.value),
}))
