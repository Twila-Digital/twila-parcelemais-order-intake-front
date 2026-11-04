import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET } from './route'

const intakeServerFetch = vi.hoisted(() => vi.fn())
const setIntakeAccessToken = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('@/services/http/intake/server/intake-server-fetch', () => ({
  intakeServerFetch,
}))
vi.mock('@/services/http/intake/server/intake-session', () => ({
  setIntakeAccessToken,
}))

const VALID_CODE = 'aB3_-xYz0123456789AbCdEf'

function access(code?: string) {
  const url = new URL('http://localhost:3000/api/intake/abc/access')
  if (code !== undefined) url.searchParams.set('code', code)
  const req = Object.assign(new Request(url), { nextUrl: url })
  // biome-ignore lint/suspicious/noExplicitAny: NextRequest só precisa de url e nextUrl aqui.
  return GET(req as any, { params: Promise.resolve({ token: 'abc' }) })
}

function expectRedirect(response: Response, location: string) {
  expect(response.status).toBe(303)
  expect(response.headers.get('location')).toBe(location)
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(response.headers.get('referrer-policy')).toBe('no-referrer')
}

describe('GET access', () => {
  beforeEach(() => {
    intakeServerFetch.mockReset()
    setIntakeAccessToken.mockReset()
    intakeServerFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: { accessToken: 'jwt', expiresIn: 3600 },
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('redeems the code without a Bearer and saves the session', async () => {
    const response = await access(VALID_CODE)

    expectRedirect(response, '/intake/abc')
    expect(intakeServerFetch).toHaveBeenCalledWith(
      'abc',
      'intake/access/redeem',
      { method: 'POST', body: { code: VALID_CODE } },
    )
    expect(setIntakeAccessToken).toHaveBeenCalledWith('abc', 'jwt', 3600)
  })

  it.each([
    ['missing', undefined],
    ['too short', 'abc123'],
    ['with invalid characters', 'abc123abc123abc1+/='],
  ])('falls back to the verification when the code is %s', async (_, code) => {
    const response = await access(code)

    expectRedirect(response, '/intake/abc')
    expect(intakeServerFetch).not.toHaveBeenCalled()
    expect(setIntakeAccessToken).not.toHaveBeenCalled()
  })

  it('falls back to the verification when the API rejects the code', async () => {
    intakeServerFetch.mockResolvedValue({
      ok: false,
      status: 400,
      problem: { status: 400 },
    })

    const response = await access(VALID_CODE)

    expectRedirect(response, '/intake/abc')
    expect(setIntakeAccessToken).not.toHaveBeenCalled()
  })

  it('falls back to the verification when the API is unreachable', async () => {
    intakeServerFetch.mockRejectedValue(new Error('timeout'))

    const response = await access(VALID_CODE)

    expectRedirect(response, '/intake/abc')
    expect(setIntakeAccessToken).not.toHaveBeenCalled()
  })

  it('redirects to the maintenance page during maintenance', async () => {
    vi.stubEnv('NEXT_PUBLIC_IN_MAINTENANCE', 'true')

    const response = await access(VALID_CODE)

    expectRedirect(response, '/manutencao')
    expect(intakeServerFetch).not.toHaveBeenCalled()
  })
})
