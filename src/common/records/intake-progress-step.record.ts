import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type { IntakeStep } from '@/domain/intake.domain'

// Etapas da barra de progresso, com o rótulo curto do Figma. Dados pessoais
// fica de fora (vem antes da análise de crédito) e a compra não tem tela
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
