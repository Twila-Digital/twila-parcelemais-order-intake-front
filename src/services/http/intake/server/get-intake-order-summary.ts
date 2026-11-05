import 'server-only'
import { cache } from 'react'
import { logError } from '@/common/lib/datadog-server-logger'
import type { IntakeOrderSummary } from '@/domain/intake.domain'
import type { IntakeApiOrderDetails } from '@/domain/intake-api.domain'
import { intakeServerFetch } from './intake-server-fetch'
import { getIntakeAccessToken } from './intake-session'

export function toOrderSummary(
  order: IntakeApiOrderDetails,
): IntakeOrderSummary {
  return {
    orderNumber: String(order.number),
    establishmentName: order.establishmentName,
    orderAmount: order.orderAmount,
    installments: order.installments && {
      count: order.installments.term,
      value: order.installments.amount,
    },
  }
}

export const getIntakeOrderSummary = cache(
  async (token: string): Promise<IntakeOrderSummary | null> => {
    const accessToken = await getIntakeAccessToken(token)
    if (!accessToken) return null

    try {
      const response = await intakeServerFetch<IntakeApiOrderDetails>(
        token,
        'intake/order',
        { accessToken },
      )
      if (response.ok) return toOrderSummary(response.data)

      logError('[Intake] Unexpected order summary response', {
        http_status: response.status,
        type: response.problem.type,
      })
      return null
    } catch (error) {
      logError('[Intake] Failed to load order summary', {
        error_message: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  },
)
