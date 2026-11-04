import { AxiosError } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from './error'

const toastError = vi.fn()

vi.mock('@twila-digital/components/alert', () => ({
  toast: { error: (...args: unknown[]) => toastError(...args) },
}))

const { getApiErrorMessage, handleApiError, resolveApiErrors } = await import(
  './api-error-handler'
)

type FormValues = { email: string; cpf: string; phone: string }

const validationError = new ApiError({
  status: 400,
  type: 'ValidationError',
  detail: 'A validation problem occurred.',
  errors: [
    { code: 'Account.InvalidEmail', message: 'O email informado é inválido' },
    { code: 'Account.InvalidCpf', message: 'O cpf informado é inválido' },
    { code: 'Account.ErrorSendingToken', message: 'Erro ao enviar o token' },
  ],
})

describe('resolveApiErrors', () => {
  it('splits mapped and unmapped issues', () => {
    const result = resolveApiErrors<FormValues>(validationError, {
      'Account.InvalidEmail': 'email',
      'Account.InvalidCpf': { field: 'cpf', message: 'CPF inválido' },
    })

    expect(result.fieldErrors).toEqual([
      { field: 'email', message: 'O email informado é inválido' },
      { field: 'cpf', message: 'CPF inválido' },
    ])
    expect(result.unmapped).toEqual(['Erro ao enviar o token'])
  })

  it('keeps only the first error per field', () => {
    const result = resolveApiErrors<FormValues>(validationError, {
      'Account.InvalidEmail': 'email',
      'Account.InvalidCpf': 'email',
    })

    expect(result.fieldErrors).toEqual([
      { field: 'email', message: 'O email informado é inválido' },
    ])
  })

  it('falls back to the default message when the error has no messages', () => {
    const result = resolveApiErrors(new ApiError({ status: 500 }), undefined, {
      defaultMessage: 'Falha ao salvar',
    })

    expect(result.unmapped).toEqual(['Falha ao salvar'])
  })

  it('returns a connection message for network errors', () => {
    const result = resolveApiErrors(new AxiosError('Network Error'))

    expect(result.unmapped).toEqual([
      'Não foi possível conectar. Tente novamente.',
    ])
  })

  it('returns the default message for unexpected errors', () => {
    const result = resolveApiErrors(new Error('boom'), undefined, {
      defaultMessage: 'Falha ao salvar',
    })

    expect(result.unmapped).toEqual(['Falha ao salvar'])
  })
})

describe('handleApiError', () => {
  beforeEach(() => {
    toastError.mockClear()
  })

  it('sets field errors, focuses the first one and toasts the rest', () => {
    const setError = vi.fn()

    handleApiError<FormValues>(validationError, {
      setError,
      fieldMap: {
        'Account.InvalidEmail': 'email',
        'Account.InvalidCpf': 'cpf',
      },
    })

    expect(setError).toHaveBeenNthCalledWith(
      1,
      'email',
      { type: 'server', message: 'O email informado é inválido' },
      { shouldFocus: true },
    )
    expect(setError).toHaveBeenNthCalledWith(
      2,
      'cpf',
      { type: 'server', message: 'O cpf informado é inválido' },
      { shouldFocus: false },
    )
    expect(toastError).toHaveBeenCalledOnce()
    expect(toastError).toHaveBeenCalledWith({
      title: 'Erro ao enviar o token',
      orientation: 'horizontal',
    })
  })

  it('shows no toast when every issue is mapped', () => {
    const error = new ApiError({
      status: 409,
      type: 'Cpf.CpfAlreadyAdded',
      detail: 'Cpf já está cadastrado.',
    })

    handleApiError<FormValues>(error, {
      setError: vi.fn(),
      fieldMap: { 'Cpf.CpfAlreadyAdded': 'cpf' },
    })

    expect(toastError).not.toHaveBeenCalled()
  })

  it('toasts every message when there is no form', () => {
    handleApiError(validationError)

    expect(toastError).toHaveBeenCalledTimes(3)
  })
})

describe('getApiErrorMessage', () => {
  it('returns the first api message', () => {
    expect(getApiErrorMessage(validationError)).toBe(
      'O email informado é inválido',
    )
  })

  it('returns the default message for non api errors', () => {
    expect(
      getApiErrorMessage(new Error('boom'), { defaultMessage: 'Falhou' }),
    ).toBe('Falhou')
  })
})
