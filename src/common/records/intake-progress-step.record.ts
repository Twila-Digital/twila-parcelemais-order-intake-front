import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type { IntakeStep } from '@/domain/intake.domain'

export const intakeProgressStepRecord: Partial<
  Record<IntakeStepStatus, string>
> = {
  [IntakeStepStatus.UpsertAddress]: 'Endereço',
  [IntakeStepStatus.UpdateTerm]: 'Parcelas',
  [IntakeStepStatus.PaymentProfile]: 'Cartão',
  [IntakeStepStatus.Biometry]: 'Biometria',
}

export function getIntakeProgressSteps(steps: IntakeStep[]): IntakeStep[] {
  return steps.flatMap((step) => {
    const description = intakeProgressStepRecord[step.status]
    return description ? [{ ...step, description }] : []
  })
}
