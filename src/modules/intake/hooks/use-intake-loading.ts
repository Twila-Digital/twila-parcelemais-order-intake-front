'use client'

import { createContext, useContext } from 'react'

type IntakeLoadingState = {
  showLoading: () => void
  hideLoading: () => void
}

export const IntakeLoadingContext = createContext<IntakeLoadingState>({
  showLoading: () => {},
  hideLoading: () => {},
})

export function useIntakeLoading() {
  return useContext(IntakeLoadingContext)
}
