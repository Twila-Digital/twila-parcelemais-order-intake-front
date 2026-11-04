import 'server-only'
import { cache } from 'react'
import { logError } from '@/common/lib/datadog-server-logger'
import { HTTP_STATUS } from '@/constants/http-status'
import type {
  IntakeStartResponse,
  IntakeUnavailableReason,
} from '@/domain/intake.domain'
import { intakeServerFetch } from './intake-server-fetch'

export type IntakeStartResult =
  | { ok: true; data: IntakeStartResponse }
  | { ok: false; reason: IntakeUnavailableReason }

export const getIntakeStart = cache(
  async (token: string): Promise<IntakeStartResult> => {
    try {
      const response = await intakeServerFetch<IntakeStartResponse>(
        token,
        'intake/start',
      )

      if (response.ok) return { ok: true, data: response.data }
      if (response.status === HTTP_STATUS.NOT_FOUND) {
        return { ok: false, reason: 'invalid-link' }
      }
      if (response.status === HTTP_STATUS.GONE) {
        return { ok: false, reason: 'closed' }
      }

      logError('[Intake] Unexpected start response', {
        http_status: response.status,
        type: response.problem.type,
      })
      return { ok: false, reason: 'error' }
    } catch (error) {
      logError('[Intake] Failed to load start', {
        error_message: error instanceof Error ? error.message : String(error),
      })
      return { ok: false, reason: 'error' }
    }
  },
)
