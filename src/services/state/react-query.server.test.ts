// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getQueryClient } from './react-query'

describe('getQueryClient (server)', () => {
  it('returns a fresh instance for every call', () => {
    expect(getQueryClient()).not.toBe(getQueryClient())
  })

  it('does not leak cached session data between requests', () => {
    const firstRequest = getQueryClient()
    firstRequest.setQueryData(['auth-me'], {
      isAuthenticated: true,
      store: { id: 'store-1' },
    })

    const secondRequest = getQueryClient()

    expect(secondRequest.getQueryData(['auth-me'])).toBeUndefined()
  })
})
