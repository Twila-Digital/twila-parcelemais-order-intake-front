'use client'

import { datadogLogs } from '@datadog/browser-logs'
import type { RumErrorEventDomainContext } from '@datadog/browser-rum'
import { datadogRum } from '@datadog/browser-rum'
import { useEffect } from 'react'
import type { DatadogConfig } from '@/config/datadog-config'
import {
  createErrorThrottle,
  describeThrown,
  getScriptOrigins,
  isForeignScriptError,
} from '@/config/datadog-error-filter'
import { env } from '@/env'

let initialized = false
const replayState = { startedByError: false }

const BFF_PATH_PREFIX = '/api/'

function isBffRequest(url: string | undefined, appOrigin: string) {
  if (!url) return false
  try {
    const parsed = new URL(url, appOrigin)
    return (
      parsed.origin === appOrigin && parsed.pathname.startsWith(BFF_PATH_PREFIX)
    )
  } catch {
    return false
  }
}

export function DatadogInit({ applicationId, clientToken }: DatadogConfig) {
  useEffect(() => {
    if (initialized) return
    if (env.NEXT_PUBLIC_ENVIRONMENT !== 'production') return
    if (!applicationId || !clientToken) return
    initialized = true

    const appOrigin = window.location.origin
    const throttleRumError = createErrorThrottle()
    const throttleLogError = createErrorThrottle()

    datadogRum.init({
      applicationId,
      clientToken,
      site: 'datadoghq.com',
      service: env.NEXT_PUBLIC_DATADOG_CLIENT_SERVICE,
      env: env.NEXT_PUBLIC_ENVIRONMENT,
      version: env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      sessionSampleRate: 100,
      sessionReplaySampleRate: 50,
      startSessionReplayRecordingManually: true,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',

      beforeSend: (event, context) => {
        if (event.type !== 'error') return true

        if (
          isForeignScriptError({
            message: event.error.message,
            stack: event.error.stack,
            appOrigin,
          })
        ) {
          return false
        }

        if (
          event.error.source !== 'custom' &&
          !throttleRumError(event.error.message)
        ) {
          return false
        }

        event.context = {
          ...event.context,
          script_origins: getScriptOrigins(),
          thrown: describeThrown((context as RumErrorEventDomainContext).error),
        }

        if (!replayState.startedByError) {
          replayState.startedByError = true
          datadogRum.startSessionReplayRecording()
        }

        return true
      },
    })

    datadogRum.startSessionReplayRecording()

    datadogLogs.init({
      clientToken,
      service: env.NEXT_PUBLIC_DATADOG_CLIENT_SERVICE,
      site: 'datadoghq.com',
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,

      beforeSend: (log) => {
        if (log.origin === 'network') {
          return !isBffRequest(log.http?.url, appOrigin)
        }

        if (log.origin !== 'source' && log.origin !== 'console') return true

        const message = log.error?.message ?? log.message

        if (
          isForeignScriptError({ message, stack: log.error?.stack, appOrigin })
        ) {
          return false
        }

        if (!throttleLogError(message)) return false

        log.script_origins = getScriptOrigins()

        return true
      },
    })
  }, [applicationId, clientToken])

  return null
}
