import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type {
  IntakeApiVerifyCodeRequest,
  IntakeApiVerifyCodeResponse,
} from '@/domain/intake-api.domain'
import {
  badRequest,
  toBffResponse,
} from '@/services/http/intake/bff/bff-response'
import { intakeServerFetch } from '@/services/http/intake/server/intake-server-fetch'
import { setIntakeAccessToken } from '@/services/http/intake/server/intake-session'

const bodySchema = z.object({ code: z.string().regex(/^\d{6}$/) })

export async function POST(
  req: NextRequest,
  ctx: RouteContext<'/api/intake/[token]/verify-token'>,
) {
  const { token } = await ctx.params
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return badRequest('Informe o código de 6 dígitos.')

  const body: IntakeApiVerifyCodeRequest = { code: parsed.data.code }
  const response = await intakeServerFetch<IntakeApiVerifyCodeResponse>(
    token,
    'intake/verify-code',
    { method: 'POST', body },
  )

  if (!response.ok) return toBffResponse(response)

  await setIntakeAccessToken(
    token,
    response.data.accessToken,
    response.data.expiresIn,
  )

  return new NextResponse(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  })
}
