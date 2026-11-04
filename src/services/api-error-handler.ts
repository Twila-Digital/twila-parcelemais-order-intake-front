import { toast } from '@twila-digital/components/alert'
import { isAxiosError } from 'axios'
import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form'
import { ApiError } from '@/services/error'

const DEFAULT_ERROR_MESSAGE = 'Ocorreu um erro inesperado'
const CONNECTION_ERROR_MESSAGE = 'Não foi possível conectar. Tente novamente.'

type ApiErrorFieldTarget<T extends FieldValues> =
  | FieldPath<T>
  | { field: FieldPath<T>; message?: string }

export type ApiErrorFieldMap<T extends FieldValues> = Partial<
  Record<string, ApiErrorFieldTarget<T>>
>

export type ApiFieldError<T extends FieldValues> = {
  field: FieldPath<T>
  message: string
}

type ResolvedApiErrors<T extends FieldValues> = {
  fieldErrors: ApiFieldError<T>[]
  unmapped: string[]
}

type ApiErrorOptions = {
  defaultMessage?: string
}

type HandleApiErrorOptions<T extends FieldValues> = ApiErrorOptions & {
  setError?: UseFormSetError<T>
  fieldMap?: ApiErrorFieldMap<T>
}

function getNonApiErrorMessage(err: unknown, options?: ApiErrorOptions) {
  if (isAxiosError(err) && !err.response) {
    return CONNECTION_ERROR_MESSAGE
  }

  return options?.defaultMessage || DEFAULT_ERROR_MESSAGE
}

export function showErrorToast(message: string) {
  toast.error({ title: message, orientation: 'horizontal' })
}

export function resolveApiErrors<T extends FieldValues>(
  err: unknown,
  fieldMap?: ApiErrorFieldMap<T>,
  options?: ApiErrorOptions,
): ResolvedApiErrors<T> {
  if (!(err instanceof ApiError)) {
    return { fieldErrors: [], unmapped: [getNonApiErrorMessage(err, options)] }
  }

  const fieldErrors: ApiFieldError<T>[] = []
  const unmapped: string[] = []

  for (const issue of err.issues) {
    const target = fieldMap?.[issue.code]

    if (!target) {
      unmapped.push(issue.message)
      continue
    }

    const { field, message } =
      typeof target === 'string'
        ? { field: target, message: undefined }
        : target

    if (!fieldErrors.some((fieldError) => fieldError.field === field)) {
      fieldErrors.push({ field, message: message ?? issue.message })
    }
  }

  if (fieldErrors.length === 0 && unmapped.length === 0) {
    unmapped.push(
      err.messages?.[0] || options?.defaultMessage || DEFAULT_ERROR_MESSAGE,
    )
  }

  return { fieldErrors, unmapped: [...new Set(unmapped)] }
}

export function applyFieldErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fieldErrors: ApiFieldError<T>[],
) {
  fieldErrors.forEach(({ field, message }, index) => {
    setError(field, { type: 'server', message }, { shouldFocus: index === 0 })
  })
}

export function handleApiError<T extends FieldValues>(
  err: unknown,
  options?: HandleApiErrorOptions<T>,
) {
  const { fieldErrors, unmapped } = resolveApiErrors(
    err,
    options?.setError ? options.fieldMap : undefined,
    options,
  )

  if (options?.setError) {
    applyFieldErrors(options.setError, fieldErrors)
  }

  unmapped.forEach(showErrorToast)

  return { fieldErrors, unmapped }
}

export function getApiErrorMessage(err?: unknown, options?: ApiErrorOptions) {
  if (!(err instanceof ApiError)) {
    return getNonApiErrorMessage(err, options)
  }

  return err.messages?.[0] || options?.defaultMessage || DEFAULT_ERROR_MESSAGE
}
