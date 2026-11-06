import { describe, expect, it } from 'vitest'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type { IntakeStep } from '@/domain/intake.domain'
import { getIntakeProgressSteps } from './intake-progress-step.record'

function step(status: IntakeStepStatus): IntakeStep {
  return {
    status,
    description: `Descrição da API ${status}`,
    isCompleted: false,
    completedAt: null,
  }
}

describe('getIntakeProgressSteps', () => {
  it('keeps only the four order steps, in the API order, with the short labels', () => {
    const steps = Object.values(IntakeStepStatus).map(step)

    expect(
      getIntakeProgressSteps(steps).map(({ status, description }) => [
        status,
        description,
      ]),
    ).toEqual([
      [IntakeStepStatus.UpsertAddress, 'Endereço'],
      [IntakeStepStatus.UpdateTerm, 'Parcelas'],
      [IntakeStepStatus.PaymentProfile, 'Cartão'],
      [IntakeStepStatus.Biometry, 'Biometria'],
    ])
  })

  it('keeps the progress fields from the API', () => {
    const completed = {
      ...step(IntakeStepStatus.UpsertAddress),
      isCompleted: true,
      completedAt: '2026-10-16T14:42:09+00:00',
    }

    expect(getIntakeProgressSteps([completed])).toEqual([
      { ...completed, description: 'Endereço' },
    ])
  })

  it('ignores steps the API sends that are not in the progress bar', () => {
    const unknown = step('Unknown' as IntakeStepStatus)

    expect(getIntakeProgressSteps([unknown])).toEqual([])
  })
})
