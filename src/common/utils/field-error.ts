import type { ReactNode } from 'react'

export function fieldError(message?: ReactNode, disabled?: boolean) {
  const isVisible = Boolean(message) && !disabled

  return {
    error: isVisible,
    errorMessage: isVisible ? message : undefined,
  }
}
