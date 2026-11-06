import type { NextRequest } from 'next/server'
import type { IntakeOrderSummary } from '@/domain/intake.domain'
import type { IntakeApiOrderDetails } from '@/domain/intake-api.domain'
import { fetchWithIntakeSession } from '@/services/http/intake/bff/bff-session'
import { toOrderSummary } from '@/services/http/intake/server/get-intake-order-summary'

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/intake/[token]/order'>,
) {
  const { token } = await ctx.params
  return fetchWithIntakeSession<IntakeApiOrderDetails, IntakeOrderSummary>(
    token,
    'intake/order',
    { map: toOrderSummary },
  )
}
