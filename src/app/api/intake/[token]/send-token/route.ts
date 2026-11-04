import type { NextRequest } from 'next/server'
import { z } from 'zod'
import type { IntakeApiSendCodeRequest } from '@/domain/intake-api.domain'
import {
  badRequest,
  toBffResponse,
} from '@/services/http/intake/bff/bff-response'
import { intakeServerFetch } from '@/services/http/intake/server/intake-server-fetch'

const bodySchema = z.object({ channel: z.enum(['sms', 'wpp']) })

export async function POST(
  req: NextRequest,
  ctx: RouteContext<'/api/intake/[token]/send-token'>,
) {
  const { token } = await ctx.params
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return badRequest('Escolha como quer receber o código.')

  const body: IntakeApiSendCodeRequest = { channel: parsed.data.channel }

  return toBffResponse(
    await intakeServerFetch<void>(token, 'intake/send-code', {
      method: 'POST',
      body,
    }),
  )
}
