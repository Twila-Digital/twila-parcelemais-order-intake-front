import { describe, expect, it } from 'vitest'
import { ApiError } from './error'

describe('ApiError', () => {
  it('normalizes validation errors from the errors array and trims codes', () => {
    const error = new ApiError({
      status: 400,
      type: 'ValidationError',
      detail: 'A validation problem occurred.',
      errors: [
        { code: 'Account.CpfIsRequired', message: 'O cpf é obrigatório.' },
        { code: 'Proposal.AccountDigitInvalidFormat  ', message: 'Dígito' },
      ],
    })

    expect(error.issues).toEqual([
      { code: 'Account.CpfIsRequired', message: 'O cpf é obrigatório.' },
      { code: 'Proposal.AccountDigitInvalidFormat', message: 'Dígito' },
    ])
    expect(error.messages).toEqual(['O cpf é obrigatório.', 'Dígito'])
  })

  it('normalizes errors sent as a dictionary', () => {
    const error = new ApiError({
      status: 400,
      errors: { Email: ['Email inválido.', 'Outro'] },
    })

    expect(error.issues).toEqual([
      { code: 'Email', message: 'Email inválido.' },
    ])
  })

  it('uses type and detail as the issue for business errors', () => {
    const error = new ApiError({
      status: 409,
      type: 'Account.AlreadyRegisteredDocument',
      detail: 'Documento já cadastrado.',
    })

    expect(error.issues).toEqual([
      {
        code: 'Account.AlreadyRegisteredDocument',
        message: 'Documento já cadastrado.',
      },
    ])
    expect(error.messages).toEqual(['Documento já cadastrado.'])
  })

  it('does not expose the generic validation detail as a message', () => {
    const error = new ApiError({
      status: 400,
      type: 'ValidationError',
      detail: 'A validation problem occurred.',
      errors: [],
    })

    expect(error.issues).toEqual([])
    expect(error.messages).toEqual([])
  })
})
