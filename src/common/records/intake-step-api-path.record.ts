import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'

// Path da etapa no BFF (`/api/intake/[token]/steps/[step]`), não na API.
export const intakeStepApiPathRecord: Record<IntakeStepStatus, string> = {
  [IntakeStepStatus.UpdateProfile]: 'personal-data',
  [IntakeStepStatus.UpsertAddress]: 'address',
  [IntakeStepStatus.UpdateTerm]: 'installments',
  [IntakeStepStatus.PaymentProfile]: 'credit-card',
  [IntakeStepStatus.Biometry]: 'biometrics',
  [IntakeStepStatus.StartSale]: 'purchase',
}

export function getIntakeStepStatusByApiPath(path: string) {
  const entry = Object.entries(intakeStepApiPathRecord).find(
    ([, stepPath]) => stepPath === path,
  )
  return entry ? (entry[0] as IntakeStepStatus) : null
}
