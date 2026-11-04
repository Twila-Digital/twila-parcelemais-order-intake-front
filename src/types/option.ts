export interface Option {
  id?: string
  value: string | number
  label: string
  extraLabel?: string
}

export type MapOptions = Map<string | number, Option>
