// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import {
  ONE_DAY_IN_MILLISECONDS,
  ONE_MINUTE_IN_MILLISECONDS,
} from '@/constants/times'
import { getQueryClient } from './react-query'

describe('getQueryClient (browser)', () => {
  it('reuses the same instance across calls', () => {
    expect(getQueryClient()).toBe(getQueryClient())
  })

  it('keeps cached data available for later consumers', () => {
    getQueryClient().setQueryData(['auth-me'], { isAuthenticated: true })

    expect(getQueryClient().getQueryData(['auth-me'])).toEqual({
      isAuthenticated: true,
    })
  })

  it('applies the shared default options', () => {
    const defaults = getQueryClient().getDefaultOptions().queries

    expect(defaults?.gcTime).toBe(ONE_DAY_IN_MILLISECONDS)
    expect(defaults?.staleTime).toBe(ONE_MINUTE_IN_MILLISECONDS)
    expect(defaults?.refetchOnWindowFocus).toBe(false)
  })
})
