'use client'

import { useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { ONE_SECOND_IN_MILLISECONDS } from '@/constants/times'
import { IntakeLoading } from '@/modules/intake/components/intake-loading'

const RELOAD_INTERVAL_IN_MILLISECONDS = 5 * ONE_SECOND_IN_MILLISECONDS
const MAX_WAIT_IN_MILLISECONDS = 60 * ONE_SECOND_IN_MILLISECONDS

type NewConditionsLoadingProps = {
  fallback: ReactNode
}

export function NewConditionsLoading({ fallback }: NewConditionsLoadingProps) {
  const router = useRouter()
  const [hasTimedOut, setHasTimedOut] = useState(false)

  useEffect(() => {
    const interval = setInterval(
      () => router.refresh(),
      RELOAD_INTERVAL_IN_MILLISECONDS,
    )
    const timeout = setTimeout(() => {
      clearInterval(interval)
      setHasTimedOut(true)
    }, MAX_WAIT_IN_MILLISECONDS)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [router])

  return hasTimedOut ? fallback : <IntakeLoading />
}
