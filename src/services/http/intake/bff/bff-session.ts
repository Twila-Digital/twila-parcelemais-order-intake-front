import 'server-only'
import { intakeServerFetch } from '../server/intake-server-fetch'
import { getIntakeAccessToken } from '../server/intake-session'
import { unauthorized } from './bff-guards'
import { toBffStepResponse } from './bff-response'

type IntakeSessionRequest<T, R> = {
  method?: 'GET' | 'POST'
  body?: unknown
  map?: (data: T, accessToken: string) => R
}

export async function fetchWithIntakeSession<T, R = T>(
  token: string,
  path: string,
  { method, body, map }: IntakeSessionRequest<T, R> = {},
) {
  const accessToken = await getIntakeAccessToken(token)
  if (!accessToken) return unauthorized()

  const response = await intakeServerFetch<T>(token, path, {
    method,
    body,
    accessToken,
  })
  if (!response.ok || !map) return toBffStepResponse(token, response)

  return toBffStepResponse(token, {
    ...response,
    data: map(response.data, accessToken),
  })
}
