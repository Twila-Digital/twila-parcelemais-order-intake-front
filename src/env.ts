import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    API_URL: z.url(),
    INTAKE_HMAC_SECRET: z.string().min(1),
    DATADOG_APP_ID: z.string().optional(),
    DATADOG_CLIENT_TOKEN: z.string().optional(),
    NEXT_REQUEST_TIMEOUT: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_ENVIRONMENT: z.string().optional(),
    NEXT_PUBLIC_DATADOG_CLIENT_SERVICE: z.string().optional(),
    NEXT_PUBLIC_APP_VERSION: z.string().optional(),
    NEXT_PUBLIC_WEBSOCKET_URL: z.url(),
    NEXT_PUBLIC_CREDICARRO_URL: z.url(),
  },
  runtimeEnv: {
    API_URL: process.env.API_URL,
    INTAKE_HMAC_SECRET: process.env.INTAKE_HMAC_SECRET,
    DATADOG_APP_ID: process.env.DATADOG_APP_ID,
    DATADOG_CLIENT_TOKEN: process.env.DATADOG_CLIENT_TOKEN,
    NEXT_REQUEST_TIMEOUT: process.env.NEXT_REQUEST_TIMEOUT,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    NEXT_PUBLIC_DATADOG_CLIENT_SERVICE:
      process.env.NEXT_PUBLIC_DATADOG_CLIENT_SERVICE,
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
    NEXT_PUBLIC_CREDICARRO_URL: process.env.NEXT_PUBLIC_CREDICARRO_URL,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    (process.env.GITHUB_ACTIONS === 'true' && !process.env.VALIDATE_ENV) ||
    process.env.VITEST === 'true',
  emptyStringAsUndefined: true,
})
