import { describe, expect, it } from 'vitest'
import {
  formatBrazilianDate,
  formatBrazilianDateTime,
  getAgeInYears,
  getBirthDateRange,
  toIsoDate,
} from './date'

describe('toIsoDate', () => {
  it('formats the local date without time', () => {
    expect(toIsoDate(new Date(1990, 4, 20))).toBe('1990-05-20')
  })
})

describe('getAgeInYears', () => {
  const today = new Date(2026, 9, 15)

  it('counts the birthday only once it has passed', () => {
    expect(getAgeInYears(new Date(2008, 9, 15), today)).toBe(18)
    expect(getAgeInYears(new Date(2008, 9, 16), today)).toBe(17)
  })
})

describe('getBirthDateRange', () => {
  it('limits the dates to the allowed ages', () => {
    const today = new Date(2026, 9, 15)
    const { minDate, maxDate } = getBirthDateRange(18, 75, today)

    expect(maxDate).toEqual(new Date(2008, 9, 15))
    expect(minDate).toEqual(new Date(1950, 9, 16))
    expect(getAgeInYears(maxDate, today)).toBe(18)
    expect(getAgeInYears(minDate, today)).toBe(75)
    expect(getAgeInYears(new Date(1950, 9, 15), today)).toBe(76)
  })

  it('keeps the limits inside the age range on February 29', () => {
    const today = new Date(2028, 1, 29)
    const { minDate, maxDate } = getBirthDateRange(18, 75, today)

    expect(maxDate).toEqual(new Date(2010, 1, 28))
    expect(getAgeInYears(maxDate, today)).toBe(18)
    expect(getAgeInYears(minDate, today)).toBe(75)
  })
})

describe('formatBrazilianDate', () => {
  it('formats a date in the Brazil time zone', () => {
    expect(formatBrazilianDate('2026-10-10T01:30:00+00:00')).toBe('09/10/2026')
    expect(formatBrazilianDate('2026-10-09T13:05:00-03:00')).toBe('09/10/2026')
  })

  it('keeps a date without time as it is', () => {
    expect(formatBrazilianDate('2026-10-09')).toBe('09/10/2026')
  })

  it('returns null for an empty or invalid value', () => {
    expect(formatBrazilianDate(null)).toBeNull()
    expect(formatBrazilianDate('not a date')).toBeNull()
  })
})

describe('formatBrazilianDateTime', () => {
  it('formats the date and time in the Brazil time zone', () => {
    expect(formatBrazilianDateTime('2026-10-16T14:42:09.0193699+00:00')).toBe(
      '16/10/2026 11:42',
    )
  })

  it('returns null for an empty or invalid value', () => {
    expect(formatBrazilianDateTime(null)).toBeNull()
    expect(formatBrazilianDateTime('not a date')).toBeNull()
  })
})
