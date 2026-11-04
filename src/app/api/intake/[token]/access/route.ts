import { type NextRequest, NextResponse } from 'next/server'
import { getIntakeEntryPath } from '@/common/utils/intake-path'
import { HTTP_STATUS } from '@/constants/http-status'
import { INTAKE_ACCESS_CODE_REGEX } from '@/constants/intake'
import type {
  IntakeApiAccessRedeemRequest,
  IntakeApiAccessRedeemResponse,
} from '@/domain/intake-api.domain'
import { intakeServerFetch } from '@/services/http/intake/server/intake-server-fetch'
import { setIntakeAccessToken } from '@/services/http/intake/server/intake-session'

const MAINTENANCE_ROUTE = '/manutencao'

function redirectTo(path: string) {
  return new NextResponse(null, {
    status: HTTP_STATUS.SEE_OTHER,
    headers: {
      Location: path,
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  })
}

async function redeemAccessCode(token: string, code: string) {
  const body: IntakeApiAccessRedeemRequest = { code }
  try {
    const response = await intakeServerFetch<IntakeApiAccessRedeemResponse>(
      token,
      'intake/access/redeem',
      { method: 'POST', body },
    )
    return response.ok ? response.data : null
  } catch {
    return null
  }
}

export async function GET(
  req: NextRequest,
  ctx: RouteContext<'/api/intake/[token]/access'>,
) {
  if (process.env.NEXT_PUBLIC_IN_MAINTENANCE === 'true') {
    return redirectTo(MAINTENANCE_ROUTE)
  }

  const { token } = await ctx.params
  const entryPath = getIntakeEntryPath(token)
  const code = req.nextUrl.searchParams.get('code')

  if (!code || !INTAKE_ACCESS_CODE_REGEX.test(code)) {
    return redirectTo(entryPath)
  }

  const session = await redeemAccessCode(token, code)
  if (session?.accessToken) {
    await setIntakeAccessToken(token, session.accessToken, session.expiresIn)
  }

  return redirectTo(entryPath)
}
