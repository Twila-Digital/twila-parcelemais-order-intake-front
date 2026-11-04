import type { NextRequest } from 'next/server'
import { z } from 'zod'
import type { IntakeApiCounterProposalDecisionRequest } from '@/domain/intake-api.domain'
import { badRequest } from '@/services/http/intake/bff/bff-response'
import { fetchWithIntakeSession } from '@/services/http/intake/bff/bff-session'
import { readJsonBody } from '@/services/http/intake/bff/read-json-body'

const bodySchema = z.object({
  simulationId: z.guid(),
  isAccepted: z.boolean(),
})

export async function POST(
  req: NextRequest,
  ctx: RouteContext<'/api/intake/[token]/new-conditions/decision'>,
) {
  const { token } = await ctx.params
  const parsed = bodySchema.safeParse(await readJsonBody(req))
  if (!parsed.success) return badRequest('Dados inválidos.')

  const body: IntakeApiCounterProposalDecisionRequest = parsed.data
  return fetchWithIntakeSession<void>(
    token,
    'intake/decision-counter-proposal',
    { method: 'POST', body },
  )
}
