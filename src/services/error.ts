export type ApiErrorIssue = {
  code: string
  message: string
}

export type ApiErrorData = {
  status: number
  title?: string
  type?: string
  errors?:
    | { [key: string]: string[] }
    | Array<{ code?: string; message: string }>
  messages?: string[]
  Message?: string
  message?: string
  detail?: string
}

const VALIDATION_ERROR_TYPE = 'ValidationError'

export class ApiError extends Error implements ApiErrorData {
  status: number
  title?: string
  type?: string
  errors?: ApiErrorData['errors']
  issues: ApiErrorIssue[]
  messages?: string[]

  private getIssues(): ApiErrorIssue[] {
    if (Array.isArray(this.errors)) {
      return this.errors.map((error) => ({
        code: error.code?.trim() ?? '',
        message: error.message,
      }))
    }

    if (this.errors) {
      return Object.entries(this.errors).map(([code, messages]) => ({
        code: code.trim(),
        message: messages[0],
      }))
    }

    if (this.type && this.type !== VALIDATION_ERROR_TYPE && this.message) {
      return [{ code: this.type.trim(), message: this.message }]
    }

    return []
  }

  private getMessages(): string[] {
    const localMessages = this.issues.map((issue) => issue.message)

    if (
      localMessages.length === 0 &&
      this.message &&
      this.type !== VALIDATION_ERROR_TYPE
    ) {
      localMessages.push(this.message)
    }

    return localMessages
  }

  constructor(data: ApiErrorData) {
    super(data.detail)
    this.status = data.status
    this.title = data.title
    this.type = data.type
    this.errors = data.errors
    this.message = data.Message || data.message || data.detail || ''
    this.issues = this.getIssues()
    this.messages = this.getMessages()

    Object.setPrototypeOf(this, ApiError.prototype)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    } else {
      this.stack = new Error().stack
    }
  }
}

export class AuthenticationError extends ApiError {
  constructor() {
    super({
      status: 401,
      title: 'Usuário não autorizado',
    })
    Object.setPrototypeOf(this, AuthenticationError.prototype)
  }
}

export class ForbiddenError extends ApiError {
  constructor() {
    super({
      status: 403,
      title: 'Acesso proibido',
    })
    Object.setPrototypeOf(this, ForbiddenError.prototype)
  }
}

export function hasApiErrorStatus(
  error: unknown,
  statuses: ReadonlySet<number>,
): error is ApiError {
  return error instanceof ApiError && statuses.has(error.status)
}
