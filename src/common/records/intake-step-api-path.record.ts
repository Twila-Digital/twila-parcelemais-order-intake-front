import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'

export const intakeStepApiPathRecord: Record<IntakeStepStatus, string> = {
  [IntakeStepStatus.AnalyseBiometric]: 'biometrics',
}

export function getIntakeStepStatusByApiPath(path: string) {
  const entry = Object.entries(intakeStepApiPathRecord).find(
    ([, stepPath]) => stepPath === path,
  )
  return entry ? (entry[0] as IntakeStepStatus) : null
}
