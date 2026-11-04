import { env } from '@/env'

export type DatadogConfig = {
  applicationId?: string
  clientToken?: string
}

export function getDatadogConfig(): DatadogConfig {
  return {
    applicationId: env.DATADOG_APP_ID,
    clientToken: env.DATADOG_CLIENT_TOKEN,
  }
}
