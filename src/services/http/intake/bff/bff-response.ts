import 'server-only'
import { NextResponse } from 'next/server'
import { IntakeErrorType } from '@/common/enums/intake-error-type.enum'
import { HTTP_STATUS, SESSION_ERROR_STATUSES } from '@/constants/http-status'
import type { IntakeServerResponse } from '../server/intake-server-fetch'
import { clearIntakeAccessToken } from '../server/intake-session'

const NO_STORE = { 'Cache-Control': 'no-store' }

export function toBffResponse<T>(response: IntakeServerResponse<T>) {
  if (response.ok) {
    if (response.status === HTTP_STATUS.NO_CONTENT || response.data === null) {
      return new NextResponse(null, {
        status: HTTP_STATUS.NO_CONTENT,
        headers: NO_STORE,
      })
    }
    return NextResponse.json(response.data, {
      status: response.status,
      headers: NO_STORE,
    })
  }

  if (response.status === HTTP_STATUS.UNAUTHORIZED) {
    return NextResponse.json(
      {
        status: HTTP_STATUS.BAD_GATEWAY,
        detail: 'Não foi possível concluir a solicitação. Tente novamente.',
      },
      { status: HTTP_STATUS.BAD_GATEWAY, headers: NO_STORE },
    )
  }

  return NextResponse.json(response.problem, {
    status: response.status,
    headers: NO_STORE,
  })
}

export function badRequest(detail: string) {
  return NextResponse.json(
    { status: 400, detail },
    { status: 400, headers: NO_STORE },
  )
}

export async function toBffStepResponse<T>(
  token: string,
  response: IntakeServerResponse<T>,
) {
  const isSessionError =
    !response.ok && SESSION_ERROR_STATUSES.has(response.status)
  if (!isSessionError) return toBffResponse(response)

  await clearIntakeAccessToken(token)
  return NextResponse.json(
    {
      status: HTTP_STATUS.UNAUTHORIZED,
      type: IntakeErrorType.SessionExpired,
      detail: 'Sua sessão expirou. Confirme seu celular de novo.',
    },
    { status: HTTP_STATUS.UNAUTHORIZED, headers: NO_STORE },
  )
}
