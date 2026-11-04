export type ComboboxItem = {
  label: string
  value: string
}

export function selectedComboboxValue(
  value: string | number | undefined | null,
  items: ComboboxItem[],
) {
  if (value === undefined || value === null || value === '') return null

  const key = String(value)
  return items.some((item) => item.value === key) ? key : null
}

export function blurOnClose(onBlur?: () => void) {
  return (open: boolean) => {
    if (!open) onBlur?.()
  }
}
