import type { NextRequest } from 'next/server'
import type { IntakeStartResponse } from '@/domain/intake.domain'
import { toBffResponse } from '@/services/http/intake/bff/bff-response'
import { intakeServerFetch } from '@/services/http/intake/server/intake-server-fetch'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/intake/[token]/start'>,
) {
  const { token } = await ctx.params
  return toBffResponse(
    await intakeServerFetch<IntakeStartResponse>(token, 'intake/start'),
  )
}
