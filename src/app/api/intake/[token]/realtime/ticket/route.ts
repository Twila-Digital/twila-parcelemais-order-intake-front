import type { NextRequest } from 'next/server'
import type { IntakeRealtimeConnection } from '@/domain/intake.domain'
import type { IntakeApiRealtimeTicket } from '@/domain/intake-api.domain'
import { fetchWithIntakeSession } from '@/services/http/intake/bff/bff-session'

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<'/api/intake/[token]/realtime/ticket'>,
) {
  const { token } = await ctx.params
  return fetchWithIntakeSession<
    IntakeApiRealtimeTicket,
    IntakeRealtimeConnection
  >(token, 'intake/realtime/ticket', {
    method: 'POST',
    map: ({ ticket }, accessToken) => ({ ticket, accessToken }),
  })
}
