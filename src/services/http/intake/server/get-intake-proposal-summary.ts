import 'server-only'
import { cache } from 'react'
import { logError } from '@/common/lib/datadog-server-logger'
import type { IntakeProposalSummary } from '@/domain/intake.domain'
import type { IntakeApiProposalSummary } from '@/domain/intake-api.domain'
import { intakeServerFetch } from './intake-server-fetch'
import { getIntakeAccessToken } from './intake-session'

export function toProposalSummary(
  summary: IntakeApiProposalSummary,
): IntakeProposalSummary {
  const { vehicle, values } = summary
  return {
    proposalNumber: String(summary.number),
    createdAt: summary.createdAt ?? null,
    disbursementDate: summary.disbursementDate ?? null,
    vehicleDescription: [vehicle?.model, vehicle?.version, vehicle?.year]
      .filter(Boolean)
      .join(' '),
    vehicleModel: vehicle?.model ?? null,
    vehicleVersion: vehicle?.version ?? null,
    vehicleYear: vehicle?.year ?? null,
    vehicleValue: values?.vehicleAmount ?? 0,
    downPaymentValue: values?.downPaymentAmount ?? 0,
    financedValue: values?.financedAmount ?? 0,
    installments: {
      count: values?.term ?? 0,
      value: values?.installmentAmount ?? 0,
    },
  }
}

export const getIntakeProposalSummary = cache(
  async (token: string): Promise<IntakeProposalSummary | null> => {
    const accessToken = await getIntakeAccessToken(token)
    if (!accessToken) return null

    try {
      const response = await intakeServerFetch<IntakeApiProposalSummary>(
        token,
        'intake/proposal',
        { accessToken },
      )
      if (response.ok) return toProposalSummary(response.data)

      logError('[Intake] Unexpected proposal summary response', {
        http_status: response.status,
        type: response.problem.type,
      })
      return null
    } catch (error) {
      logError('[Intake] Failed to load proposal summary', {
        error_message: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  },
)
