import { describe, expect, it } from 'vitest'
import { fieldError } from './field-error'

describe('fieldError', () => {
  it('shows the message on an enabled field', () => {
    expect(fieldError('Campo obrigatório', false)).toEqual({
      error: true,
      errorMessage: 'Campo obrigatório',
    })
  })

  it('hides the message on a disabled field', () => {
    expect(fieldError('Campo obrigatório', true)).toEqual({
      error: false,
      errorMessage: undefined,
    })
  })

  it('stays quiet without a message', () => {
    expect(fieldError(undefined, false)).toEqual({
      error: false,
      errorMessage: undefined,
    })
  })
})
