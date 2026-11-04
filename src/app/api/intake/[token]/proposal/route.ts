import type { NextRequest } from 'next/server'
import type { IntakeProposalSummary } from '@/domain/intake.domain'
import type { IntakeApiProposalSummary } from '@/domain/intake-api.domain'
import { fetchWithIntakeSession } from '@/services/http/intake/bff/bff-session'
import { toProposalSummary } from '@/services/http/intake/server/get-intake-proposal-summary'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/intake/[token]/proposal'>,
) {
  const { token } = await ctx.params
  return fetchWithIntakeSession<
    IntakeApiProposalSummary,
    IntakeProposalSummary
  >(token, 'intake/proposal', { map: toProposalSummary })
}
