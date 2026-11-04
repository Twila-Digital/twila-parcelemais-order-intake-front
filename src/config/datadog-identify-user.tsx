'use client'

import { useIdentifyDatadogUser } from '@/common/hooks/use-identify-datadog-user'

export function DatadogIdentifyUser() {
  useIdentifyDatadogUser()
  return null
}
