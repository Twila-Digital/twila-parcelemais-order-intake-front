import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { signIntakeRequest } from './hmac'

vi.mock('server-only', () => ({}))

const SECRET = 'test-secret'
const NOW = 1_760_000_000_123
const NONCE = '0b6f0f5e-2b7c-4a43-8f5f-7d3c1f4a2e10'

function expected(payload: string) {
  return createHmac('sha256', SECRET).update(payload).digest('hex')
}

describe('signIntakeRequest', () => {
  it('signs the canonical payload followed by the exact body', () => {
    const body = JSON.stringify({ channel: 'sms' })
    const headers = signIntakeRequest({
      secret: SECRET,
      method: 'POST',
      pathAndQuery: '/api/v1/intake/send-code',
      token: 'abc',
      body,
      now: NOW,
      nonce: NONCE,
    })

    expect(headers).toEqual({
      'X-Timestamp': '1760000000',
      'X-Nonce': NONCE,
      'X-Signature': expected(
        `1760000000\n${NONCE}\nPOST\n/api/v1/intake/send-code\nabc\n${body}`,
      ),
    })
  })

  it('ends with a line break when there is no body', () => {
    const headers = signIntakeRequest({
      secret: SECRET,
      method: 'GET',
      pathAndQuery: '/api/v1/intake/start',
      token: 'abc',
      now: NOW,
      nonce: NONCE,
    })

    expect(headers['X-Signature']).toBe(
      expected(`1760000000\n${NONCE}\nGET\n/api/v1/intake/start\nabc\n`),
    )
  })

  it('uses a new lowercase nonce for every request', () => {
    const sign = () =>
      signIntakeRequest({
        secret: SECRET,
        method: 'GET',
        pathAndQuery: '/api/v1/intake/start',
        token: 'abc',
      })['X-Nonce']

    const first = sign()
    expect(first).toMatch(/^[0-9a-f-]{36}$/)
    expect(sign()).not.toBe(first)
  })
})
