import { describe, expect, it } from 'vitest'
import { isMobileUserAgent } from './device'

describe('isMobileUserAgent', () => {
  it('detects phones', () => {
    expect(
      isMobileUserAgent(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
      ),
    ).toBe(true)
    expect(
      isMobileUserAgent(
        'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36',
      ),
    ).toBe(true)
  })

  it('treats desktops and tablets as large screens', () => {
    expect(
      isMobileUserAgent(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
      ),
    ).toBe(false)
    expect(
      isMobileUserAgent(
        'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
      ),
    ).toBe(false)
  })

  it('assumes a phone without user agent', () => {
    expect(isMobileUserAgent(null)).toBe(true)
  })
})
