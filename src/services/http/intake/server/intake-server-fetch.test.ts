import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { intakeServerFetch } from './intake-server-fetch'

const logError = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('@/env', () => ({
  env: { API_URL: 'https://api.test', INTAKE_HMAC_SECRET: 'secret' },
}))
vi.mock('@/common/lib/datadog-server-logger', () => ({ logError }))

const fetchMock = vi.fn()

function respond(status: number, body?: unknown) {
  fetchMock.mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), { status }),
  )
}

describe('intakeServerFetch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('signs the exact body and sends the link token in the header', async () => {
    respond(204)

    const result = await intakeServerFetch('abc', 'intake/send-code', {
      method: 'POST',
      body: { channel: 'sms' },
    })

    const [url, init] = fetchMock.mock.calls[0]
    const body = JSON.stringify({ channel: 'sms' })
    expect(url).toBe('https://api.test/api/v1/intake/send-code')
    expect(init.headers['X-Intake-Token']).toBe('abc')
    expect(init.body).toBe(body)
    const { 'X-Timestamp': timestamp, 'X-Nonce': nonce } = init.headers
    expect(nonce).toMatch(/^[0-9a-f-]{36}$/)
    expect(init.headers['X-Signature']).toBe(
      createHmac('sha256', 'secret')
        .update(
          `${timestamp}\n${nonce}\nPOST\n/api/v1/intake/send-code\nabc\n${body}`,
        )
        .digest('hex'),
    )
    expect(init.headers.Authorization).toBeUndefined()
    expect(result).toEqual({ ok: true, status: 204, data: null })
  })

  it('sends the bearer token on paths outside the intake', async () => {
    respond(200, { ok: true })

    await intakeServerFetch('a/b', 'banks/banks', { accessToken: 'jwt' })

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://api.test/api/v1/banks/banks')
    expect(init.headers['X-Intake-Token']).toBe('a/b')
    expect(init.body).toBeUndefined()
    expect(init.headers.Authorization).toBe('Bearer jwt')
  })

  it('returns the problem details and logs signature failures', async () => {
    respond(401, { type: 'Auth', detail: 'invalid signature' })

    const result = await intakeServerFetch('abc', 'intake/start')

    expect(result).toEqual({
      ok: false,
      status: 401,
      problem: { type: 'Auth', detail: 'invalid signature', status: 401 },
    })
    expect(logError).toHaveBeenCalledOnce()
  })
})
