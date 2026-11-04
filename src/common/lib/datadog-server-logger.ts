import { env } from '@/env'

const isProduction = env.NEXT_PUBLIC_ENVIRONMENT === 'production'
const clientToken = env.DATADOG_CLIENT_TOKEN
const service = env.NEXT_PUBLIC_DATADOG_CLIENT_SERVICE

type LogContext = Record<string, unknown>

export function logError(message: string, context?: LogContext): void {
  if (!isProduction || !clientToken) return

  void fetch(
    `https://browser-intake-datadoghq.com/api/v2/logs?dd-api-key=${clientToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ddsource: 'nodejs',
        ddtags: `env:production,service:${service}`,
        service,
        status: 'error',
        message,
        ...context,
      }),
    },
  ).catch(() => {})
}
