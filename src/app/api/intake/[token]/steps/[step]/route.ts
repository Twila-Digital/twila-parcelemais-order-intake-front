import { type NextRequest, NextResponse } from 'next/server'
import { getIntakeStepStatusByApiPath } from '@/common/records/intake-step-api-path.record'
import { notFound, unauthorized } from '@/services/http/intake/bff/bff-guards'
import {
  badRequest,
  toBffStepResponse,
} from '@/services/http/intake/bff/bff-response'
import { readJsonBody } from '@/services/http/intake/bff/read-json-body'
import {
  getIntakeStepData,
  isIntakeStepWithData,
} from '@/services/http/intake/server/get-intake-step-data'
import { getIntakeAccessToken } from '@/services/http/intake/server/intake-session'
import { submitIntakeStep } from '@/services/http/intake/server/submit-intake-step'

type Context = RouteContext<'/api/intake/[token]/steps/[step]'>

export async function GET(_req: NextRequest, ctx: Context) {
  const { token, step } = await ctx.params
  const status = getIntakeStepStatusByApiPath(step)
  if (!status || !isIntakeStepWithData(status)) return notFound()

  if (!(await getIntakeAccessToken(token))) return unauthorized()

  const data = await getIntakeStepData(token, status)
  if (!data) return notFound()

  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest, ctx: Context) {
  const { token, step } = await ctx.params
  const status = getIntakeStepStatusByApiPath(step)
  if (!status) return notFound()

  const accessToken = await getIntakeAccessToken(token)
  if (!accessToken) return unauthorized()

  const body = await readJsonBody(req)
  if (!body) return badRequest('Dados inválidos.')

  const result = await submitIntakeStep(token, status, body, accessToken)
  if (!result.ok) {
    return result.reason === 'no-submit'
      ? notFound()
      : badRequest('Dados inválidos.')
  }
  return toBffStepResponse(token, result.response)
}
