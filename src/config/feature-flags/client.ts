import { DatadogProvider } from '@datadog/openfeature-browser'
import { OpenFeature } from '@openfeature/web-sdk'
import type { DatadogConfig } from '@/config/datadog-config'
import { env } from '@/env'

let initialized = false

export async function initFeatureFlags(config: DatadogConfig) {
  if (initialized) return
  if (
    !config.clientToken ||
    !config.applicationId ||
    !env.NEXT_PUBLIC_ENVIRONMENT
  ) {
    return
  }

  const provider = new DatadogProvider({
    clientToken: config.clientToken,
    applicationId: config.applicationId,
    site: 'datadoghq.com',
    env: env.NEXT_PUBLIC_ENVIRONMENT,
    service: env.NEXT_PUBLIC_DATADOG_CLIENT_SERVICE,
    enableRumFeatureFlagTracking: true,
  })

  await OpenFeature.setProviderAndWait(provider)
  initialized = true
}
