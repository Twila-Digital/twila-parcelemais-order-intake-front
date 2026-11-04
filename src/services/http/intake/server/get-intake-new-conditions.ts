import 'server-only'
import { cache } from 'react'
import { logError } from '@/common/lib/datadog-server-logger'
import type { IntakeNewCondition } from '@/domain/intake.domain'
import type { IntakeApiNewCondition } from '@/domain/intake-api.domain'
import { intakeServerFetch } from './intake-server-fetch'
import { getIntakeAccessToken } from './intake-session'

export function toNewCondition(
  condition: IntakeApiNewCondition,
): IntakeNewCondition {
  const { values } = condition
  return {
    simulationId: condition.simulationId,
    status: condition.status,
    createdAt: condition.createdAt ?? null,
    vehicleValue: values.vehicleAmount,
    downPaymentValue: values.downPaymentAmount,
    financedValue: values.financedAmount,
    installments: {
      count: values.term,
      value: values.installmentAmount,
    },
    tacAmount: condition.tacAmount,
    registerAmount: condition.registerAmount,
    iofAmount: condition.iof.amount,
    monthlyInterestRate: condition.interest.monthlyPercentage,
    monthlyCet: condition.cet.monthlyPercentage,
    annualCet: condition.cet.annualPercentage,
  }
}

export const getIntakeNewConditions = cache(
  async (token: string): Promise<IntakeNewCondition[] | null> => {
    const accessToken = await getIntakeAccessToken(token)
    if (!accessToken) return null

    try {
      const response = await intakeServerFetch<IntakeApiNewCondition[]>(
        token,
        'intake/new-conditions',
        { accessToken },
      )
      if (response.ok) return response.data.map(toNewCondition)

      logError('[Intake] Unexpected new conditions response', {
        http_status: response.status,
        type: response.problem.type,
      })
      return null
    } catch (error) {
      logError('[Intake] Failed to load new conditions', {
        error_message: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  },
)
