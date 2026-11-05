import 'server-only'
import { logError } from '@/common/lib/datadog-server-logger'
import { signIntakeRequest } from '@/common/lib/hmac'
import { HTTP_STATUS } from '@/constants/http-status'
import { ONE_SECOND_IN_MILLISECONDS } from '@/constants/times'
import { env } from '@/env'
import type { ApiErrorData } from '@/services/error'

const API_BASE_PATH = '/api/v1'
const DEFAULT_TIMEOUT_IN_SECONDS = 30

type IntakeServerFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT'
  body?: unknown
  accessToken?: string | null
}

export type IntakeServerResponse<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; problem: ApiErrorData }

function parseJson(text: string) {
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function getTimeoutInMilliseconds() {
  const seconds =
    Number.parseInt(env.NEXT_REQUEST_TIMEOUT ?? '', 10) ||
    DEFAULT_TIMEOUT_IN_SECONDS
  return seconds * ONE_SECOND_IN_MILLISECONDS
}

export async function intakeServerFetch<T>(
  token: string,
  path: string,
  { method = 'GET', body, accessToken }: IntakeServerFetchOptions = {},
): Promise<IntakeServerResponse<T>> {
  const rawBody = body === undefined ? '' : JSON.stringify(body)

  const url = new URL(`${env.API_URL}${API_BASE_PATH}/${path}`)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Intake-Token': token,
    ...signIntakeRequest({
      secret: env.INTAKE_HMAC_SECRET,
      method,
      pathAndQuery: `${url.pathname}${url.search}`,
      token,
      body: rawBody,
    }),
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: rawBody || undefined,
    cache: 'no-store',
    signal: AbortSignal.timeout(getTimeoutInMilliseconds()),
  })

  const payload = parseJson(await response.text())

  if (response.ok) {
    return { ok: true, status: response.status, data: payload as T }
  }

  if (process.env.NODE_ENV === 'development') {
    // biome-ignore lint/suspicious/noConsole: log de integração só em dev
    console.warn(`[Intake] ${method} ${path} -> ${response.status}`, payload)
  }

  if (response.status === HTTP_STATUS.UNAUTHORIZED && !accessToken) {
    logError('[Intake] Request rejected by the API', {
      http_status: response.status,
      path,
    })
  }

  return {
    ok: false,
    status: response.status,
    problem: { ...(payload as ApiErrorData | null), status: response.status },
  }
}
