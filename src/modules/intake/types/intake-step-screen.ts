import type { ReactNode } from 'react'
import type { IntakeFlow } from '@/common/enums/intake-flow.enum'

export type IntakeStepScreenProps<Data = undefined> = {
  token: string
  flow: IntakeFlow
  header: ReactNode
  data: Data
}
