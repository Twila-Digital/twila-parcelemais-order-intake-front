'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import type { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { getIntakeEntryPath } from '@/common/utils/intake-path'
import { useIntakeLoading } from '@/modules/intake/hooks/use-intake-loading'
import { useFetchIntakeStart } from '@/services/http/intake/use-intake-service'

export function useAdvanceIntakeStep(token: string, status: IntakeStepStatus) {
  const router = useRouter()
  const [isAdvancing, setIsAdvancing] = useState(false)
  const fetchStart = useFetchIntakeStart(token)
  const { showLoading } = useIntakeLoading()

  const advance = useCallback(async () => {
    setIsAdvancing(true)
    showLoading()
    const start = await fetchStart().catch(() => null)
    if (start && start.dateAndStatus?.activeStatus !== status) {
      router.replace(getIntakeEntryPath(token))
      router.refresh()
      return true
    }
    setIsAdvancing(false)
    return false
  }, [fetchStart, router, showLoading, status, token])

  return { advance, isAdvancing }
}
