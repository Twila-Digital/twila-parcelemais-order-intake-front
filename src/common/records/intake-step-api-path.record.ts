import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'

export const intakeStepApiPathRecord: Record<IntakeStepStatus, string> = {
  [IntakeStepStatus.NotifySeller]: 'notify-seller',
  [IntakeStepStatus.IncludeDepositAccount]: 'deposit-account',
  [IntakeStepStatus.IncludeDocument]: 'documents',
  [IntakeStepStatus.IncludeVehicleExtraInformation]: 'vehicle-information',
  [IntakeStepStatus.InspectCar]: 'inspection',
  [IntakeStepStatus.AnalyseBiometric]: 'biometrics',
  [IntakeStepStatus.IncludeEstablishmentDetails]: 'establishment-details',
  [IntakeStepStatus.DecisionSeller]: 'decision-seller',
  [IntakeStepStatus.CreateAccount]: 'create-account',
}

export function getIntakeStepStatusByApiPath(path: string) {
  const entry = Object.entries(intakeStepApiPathRecord).find(
    ([, stepPath]) => stepPath === path,
  )
  return entry ? (entry[0] as IntakeStepStatus) : null
}
