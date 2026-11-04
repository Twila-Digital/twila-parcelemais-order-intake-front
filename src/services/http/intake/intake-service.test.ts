import { describe, expect, it, vi } from 'vitest'
import type { HttpClient } from '@/types/http'
import { IntakeService } from './intake-service'

function makeService() {
  const httpClient: HttpClient = {
    request: vi.fn().mockResolvedValue({ data: null, status: 204 }),
  }
  return { httpClient, service: new IntakeService(httpClient) }
}

describe('IntakeService', () => {
  it('posts the chosen channel to the send-token bff route', async () => {
    const { httpClient, service } = makeService()

    await service.sendToken('abc', { channel: 'sms' })

    expect(httpClient.request).toHaveBeenCalledWith({
      url: '/abc/send-token',
      method: 'post',
      body: { channel: 'sms' },
    })
  })

  it('encodes the link token in the url', async () => {
    const { httpClient, service } = makeService()

    await service.verifyToken('a/../b', { code: '123456' })

    expect(httpClient.request).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/a%2F..%2Fb/verify-token' }),
    )
  })
})
