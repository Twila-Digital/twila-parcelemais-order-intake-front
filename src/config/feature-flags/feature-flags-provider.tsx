'use client'

import { datadogLogs } from '@datadog/browser-logs'
import { OpenFeatureProvider } from '@openfeature/react-sdk'
import { OpenFeature } from '@openfeature/web-sdk'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { getAnonymousTargetingKey } from '@/common/lib/anonymous-id'
import type { DatadogConfig } from '@/config/datadog-config'
import { initFeatureFlags } from '@/config/feature-flags/client'

export function FeatureFlagsProvider({
  children,
  datadogConfig,
}: {
  children: ReactNode
  datadogConfig: DatadogConfig
}) {
  const { applicationId, clientToken } = datadogConfig

  useEffect(() => {
    let cancelled = false
    const setup = async () => {
      try {
        await OpenFeature.setContext({
          targetingKey: getAnonymousTargetingKey(),
          authenticated: false,
        })
        if (cancelled) return
        await initFeatureFlags({ applicationId, clientToken })
      } catch (error) {
        datadogLogs.logger.error('Failed to set up feature flags', { error })
      }
    }
    void setup()
    return () => {
      cancelled = true
    }
  }, [applicationId, clientToken])

  return <OpenFeatureProvider>{children}</OpenFeatureProvider>
}
