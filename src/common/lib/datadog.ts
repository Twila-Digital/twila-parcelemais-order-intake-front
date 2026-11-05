'use client'

import { datadogLogs } from '@datadog/browser-logs'
import { datadogRum } from '@datadog/browser-rum'
import { getAnonymousId } from '@/common/lib/anonymous-id'
import { env } from '@/env'

export function identifyDatadogUser(user?: {
  userId: string
  userEmail?: string
  userName?: string
}) {
  if (env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
    if (user) {
      const { userId, userEmail, userName } = user
      datadogRum.setUser({
        id: userId,
        email: userEmail,
        name: userName,
      })
      datadogLogs.setUser({ id: userId })
    } else {
      const anonId = `anon_${getAnonymousId()}`
      datadogRum.setUser({ id: anonId, name: 'Anonymous' })
      datadogLogs.setUser({ id: anonId, name: 'Anonymous' })
    }
  }
}

export function logRenderError(
  error: Error & { digest?: string },
  { route, boundary }: { route: string; boundary: string },
) {
  if (env.NEXT_PUBLIC_ENVIRONMENT !== 'production') return

  datadogRum.addError(error, {
    kind: 'render_error',
    route,
    boundary,
    digest: error.digest,
  })
}
