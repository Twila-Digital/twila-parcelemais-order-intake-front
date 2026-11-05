import { describe, expect, it, vi } from 'vitest'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { submitIntakeStep } from './submit-intake-step'

vi.mock('server-only', () => ({}))

describe('submitIntakeStep', () => {
  it('has nothing to submit for a step without a form', async () => {
    expect(
      await submitIntakeStep(
        'abc',
        IntakeStepStatus.AnalyseBiometric,
        {},
        'jwt',
      ),
    ).toEqual({ ok: false, reason: 'no-submit' })
  })
})
