import { describe, expect, it } from 'vitest'
import { formatCountdown } from './format-countdown'

describe('formatCountdown', () => {
  it('formats seconds as m:ss', () => {
    expect(formatCountdown(60)).toBe('1:00')
    expect(formatCountdown(125)).toBe('2:05')
    expect(formatCountdown(9)).toBe('0:09')
  })
})
