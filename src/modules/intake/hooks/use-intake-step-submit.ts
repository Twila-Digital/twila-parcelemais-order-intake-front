'use client'

import { useCallback } from 'react'
import type { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { intakeStepApiPathRecord } from '@/common/records/intake-step-api-path.record'
import { useAdvanceIntakeStep } from '@/modules/intake/hooks/use-advance-intake-step'
import { useSubmitIntakeStepMutation } from '@/services/http/intake/use-intake-service'

export function useIntakeStepSubmit<Body extends object = object>(
  token: string,
  status: IntakeStepStatus,
) {
  const { advance, isAdvancing } = useAdvanceIntakeStep(token, status)
  const { mutateAsync, isPending } = useSubmitIntakeStepMutation<Body>(
    token,
    intakeStepApiPathRecord[status],
  )

  const submit = useCallback(
    async (body: Body) => {
      await mutateAsync(body)
      await advance()
    },
    [advance, mutateAsync],
  )

  return { submit, finish: advance, isSubmitting: isPending || isAdvancing }
}
