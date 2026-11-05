import type { ReactNode } from 'react'

export type IntakeStepScreenProps<Data = undefined> = {
  token: string
  header: ReactNode
  data: Data
}
