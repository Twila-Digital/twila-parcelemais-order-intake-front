import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'

// Path da etapa no BFF (`/api/intake/[token]/steps/[step]`), não na API.
export const intakeStepApiPathRecord: Record<IntakeStepStatus, string> = {
  [IntakeStepStatus.IncludePersonalData]: 'personal-data',
  [IntakeStepStatus.IncludeAddress]: 'address',
  [IntakeStepStatus.ChooseInstallments]: 'installments',
  [IntakeStepStatus.IncludeCreditCard]: 'credit-card',
  [IntakeStepStatus.AnalyseBiometric]: 'biometrics',
  [IntakeStepStatus.Purchase]: 'purchase',
}

export function getIntakeStepStatusByApiPath(path: string) {
  const entry = Object.entries(intakeStepApiPathRecord).find(
    ([, stepPath]) => stepPath === path,
  )
  return entry ? (entry[0] as IntakeStepStatus) : null
}
