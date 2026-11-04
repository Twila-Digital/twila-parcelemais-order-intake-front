import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosHttpClientAdapter } from './axios-adapter'

const request = vi.hoisted(() => vi.fn())

vi.mock('axios', () => ({
  default: { create: () => ({ request }), isAxiosError: () => false },
}))

describe('AxiosHttpClientAdapter', () => {
  beforeEach(() => {
    request.mockReset()
    request.mockResolvedValue({ data: {}, status: 200, headers: {} })
  })

  it('sends the idempotency header and no auth header to the bff', async () => {
    await new AxiosHttpClientAdapter('/api').request({
      url: '/intake/token/send-token',
      method: 'post',
    })

    const { headers } = request.mock.calls[0][0]
    expect(headers['Idempotency-Key']).toEqual(expect.any(String))
    expect(headers.Authorization).toBeUndefined()
  })

  it('keeps the idempotency header away from external urls', async () => {
    await new AxiosHttpClientAdapter().request({
      url: 'https://viacep.com.br/ws/01310100/json/',
      method: 'get',
    })

    const { headers } = request.mock.calls[0][0]
    expect(headers?.['Idempotency-Key']).toBeUndefined()
  })
})
