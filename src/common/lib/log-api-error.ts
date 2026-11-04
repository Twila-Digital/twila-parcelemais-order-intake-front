import { datadogLogs } from '@datadog/browser-logs'
import axios from 'axios'
import { env } from '@/env'
import { ApiError } from '@/services/error'

type LogApiErrorParams = {
  method: string
  endpoint: string
  paramKeys: string[]
  error: unknown
}

export function logApiError({
  method,
  endpoint,
  paramKeys,
  error,
}: LogApiErrorParams) {
  if (typeof window === 'undefined') return
  if (env.NEXT_PUBLIC_ENVIRONMENT !== 'production') return

  if (error instanceof ApiError) {
    datadogLogs.logger.error(
      `API ${error.status} ${method} ${endpoint}`,
      {
        kind: 'api_error',
        http: { method, status_code: error.status },
        api: {
          endpoint,
          title: error.title,
          type: error.type,
          messages: error.messages,
        },
        request: { param_keys: paramKeys },
      },
      error,
    )
    return
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_CANCELED') return

    datadogLogs.logger.error(
      `API network-error ${method} ${endpoint}`,
      {
        kind: 'api_error',
        http: { method, status_code: 0 },
        api: { endpoint, axios_code: error.code },
        request: { param_keys: paramKeys },
      },
      error,
    )
  }
}
