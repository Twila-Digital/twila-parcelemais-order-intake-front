'use client'

import { createContext, useContext } from 'react'

type IntakeRealtimeState = {
  isConnected: boolean
}

export const IntakeRealtimeContext = createContext<IntakeRealtimeState>({
  isConnected: false,
})

export function useIntakeRealtime() {
  return useContext(IntakeRealtimeContext)
}
