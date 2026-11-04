import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

const intakeServerFetch = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('@/services/http/intake/server/intake-server-fetch', () => ({
  intakeServerFetch,
}))
vi.mock('@/services/http/intake/server/intake-session', () => ({
  clearIntakeAccessToken: vi.fn(),
}))

function send(body: unknown) {
  const req = new Request('http://localhost/api/intake/abc/send-token', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  // biome-ignore lint/suspicious/noExplicitAny: NextRequest só precisa do json() aqui.
  return POST(req as any, { params: Promise.resolve({ token: 'abc' }) })
}

describe('POST send-token', () => {
  beforeEach(() => {
    intakeServerFetch.mockReset()
    intakeServerFetch.mockResolvedValue({ ok: true, status: 204, data: null })
  })

  it.each(['sms', 'wpp'])(
    'sends the %s channel as the API expects',
    async (channel) => {
      const response = await send({ channel })

      expect(response.status).toBe(204)
      expect(intakeServerFetch).toHaveBeenCalledWith(
        'abc',
        'intake/send-code',
        {
          method: 'POST',
          body: { channel },
        },
      )
    },
  )

  it('rejects a channel the API does not know', async () => {
    const response = await send({ channel: 'WhatsApp' })

    expect(response.status).toBe(400)
    expect(intakeServerFetch).not.toHaveBeenCalled()
  })
})
