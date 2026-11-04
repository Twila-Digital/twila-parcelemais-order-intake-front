import { describe, expect, it } from 'vitest'
import {
  createErrorThrottle,
  describeThrown,
  isForeignScriptError,
} from './datadog-error-filter'

const appOrigin = 'https://parceiro.credicarro.com.br'

describe('isForeignScriptError', () => {
  it('drops cross-origin errors stripped by the browser', () => {
    expect(isForeignScriptError({ message: 'Script error.', appOrigin })).toBe(
      true,
    )
  })

  it('drops errors whose frames come only from browser extensions', () => {
    const stack = [
      "TypeError: Cannot read properties of undefined (reading 'M_ID')",
      '    at chrome-extension://abcdef/content.js:1:120',
      '    at chrome-extension://abcdef/inject.js:4:9',
    ].join('\n')

    expect(isForeignScriptError({ stack, appOrigin })).toBe(true)
  })

  it('drops the M_ID flood reported from a chrome extension in production', () => {
    const stack = [
      "TypeError: Cannot read properties of undefined (reading 'M_ID')",
      '  at F @ chrome-extension://eppiocemhmnlbhjplcgkofciiegomcon/executors/200.js:1:761',
      '  at X @ chrome-extension://eppiocemhmnlbhjplcgkofciiegomcon/executors/200.js:1:1442',
    ].join('\n')

    expect(isForeignScriptError({ stack, appOrigin })).toBe(true)
  })

  it('drops errors whose frames come only from a foreign host', () => {
    const stack = [
      'TypeError: undefined is not a function',
      '    at https://tag.example.com/analytics.js:2:5000',
    ].join('\n')

    expect(isForeignScriptError({ stack, appOrigin })).toBe(true)
  })

  it('keeps errors with at least one frame from the app', () => {
    const stack = [
      "TypeError: Cannot read properties of undefined (reading 'M_ID')",
      '    at chrome-extension://abcdef/content.js:1:120',
      `    at ${appOrigin}/_next/static/chunks/main.js:1:47382`,
    ].join('\n')

    expect(isForeignScriptError({ stack, appOrigin })).toBe(false)
  })

  it('keeps errors without a stack instead of guessing', () => {
    expect(isForeignScriptError({ message: 'algo quebrou', appOrigin })).toBe(
      false,
    )
  })

  it('keeps errors whose stack has no resolvable urls', () => {
    const stack = 'TypeError: boom\n    at <anonymous>:1:1'

    expect(isForeignScriptError({ stack, appOrigin })).toBe(false)
  })
})

describe('describeThrown', () => {
  it('reports the constructor name and own keys of an object', () => {
    class WidgetError extends Error {
      code = 'M_ID'
    }

    expect(describeThrown(new WidgetError('boom'))).toEqual({
      type: 'WidgetError',
      keys: ['code'],
    })
  })

  it('reports only the primitive type when a non-object is thrown', () => {
    expect(describeThrown('boom')).toEqual({ type: 'string' })
    expect(describeThrown(null)).toEqual({ type: 'object' })
  })
})

describe('createErrorThrottle', () => {
  const flood = "Cannot read properties of undefined (reading 'M_ID')"

  it('keeps the first occurrences and drops the flood', () => {
    const allow = createErrorThrottle({ maxPerFingerprint: 3 })

    const results = Array.from({ length: 200 }, () => allow(flood))

    expect(results.filter(Boolean)).toHaveLength(3)
  })

  it('budgets each message independently', () => {
    const allow = createErrorThrottle({ maxPerFingerprint: 1 })

    expect(allow(flood)).toBe(true)
    expect(allow(flood)).toBe(false)
    expect(allow('outro erro')).toBe(true)
  })

  it('stops tracking instead of growing without bound', () => {
    const allow = createErrorThrottle({
      maxPerFingerprint: 1,
      maxFingerprints: 2,
    })

    allow('a')
    allow('b')

    expect(allow('c')).toBe(true)
    expect(allow('c')).toBe(true)
  })
})
