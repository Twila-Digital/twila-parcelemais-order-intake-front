import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

const intakeServerFetch = vi.hoisted(() => vi.fn())
const session = vi.hoisted(() => ({
  getIntakeAccessToken: vi.fn(),
  clearIntakeAccessToken: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@/services/http/intake/server/intake-server-fetch', () => ({
  intakeServerFetch,
}))
vi.mock('@/services/http/intake/server/intake-session', () => session)

function requestTicket() {
  const req = new Request('http://localhost/api/intake/abc/realtime/ticket', {
    method: 'POST',
  })
  // biome-ignore lint/suspicious/noExplicitAny: a rota não lê a requisição.
  return POST(req as any, { params: Promise.resolve({ token: 'abc' }) })
}

describe('POST realtime/ticket', () => {
  beforeEach(() => {
    intakeServerFetch.mockReset()
    session.getIntakeAccessToken.mockResolvedValue('jwt')
  })

  it('returns the ticket with the access token the hub requires', async () => {
    intakeServerFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { ticket: 't1', expiresAt: '2026-10-16T13:05:00+00:00' },
    })

    const response = await requestTicket()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ticket: 't1', accessToken: 'jwt' })
    expect(intakeServerFetch).toHaveBeenCalledWith(
      'abc',
      'intake/realtime/ticket',
      { method: 'POST', accessToken: 'jwt' },
    )
  })

  it('requires the session of the link', async () => {
    session.getIntakeAccessToken.mockResolvedValue(undefined)

    const response = await requestTicket()

    expect(response.status).toBe(401)
    expect(intakeServerFetch).not.toHaveBeenCalled()
  })

  it('ends the session when the API rejects the token', async () => {
    intakeServerFetch.mockResolvedValue({
      ok: false,
      status: 403,
      problem: { status: 403, type: 'Intake.TokenPhoneMismatch' },
    })

    const response = await requestTicket()

    expect(response.status).toBe(401)
    expect(session.clearIntakeAccessToken).toHaveBeenCalledWith('abc')
  })

  it('passes a closed order through', async () => {
    intakeServerFetch.mockResolvedValue({
      ok: false,
      status: 410,
      problem: { status: 410, type: 'Intake.InviteClosed' },
    })

    const response = await requestTicket()

    expect(response.status).toBe(410)
  })
})
