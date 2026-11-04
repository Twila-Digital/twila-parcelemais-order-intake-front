const PERCENT = 100

const S3_ERROR_MESSAGES: Record<string, string> = {
  EntityTooLarge: 'O arquivo é maior que 10 MB.',
  EntityTooSmall: 'O arquivo está vazio.',
  AccessDenied:
    'O link de envio expirou ou o arquivo não é aceito. Tente de novo.',
}

const S3_UNREACHABLE_MESSAGE =
  'Não foi possível enviar o arquivo. Verifique sua conexão e tente de novo.'

export class S3UploadError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message)
    this.name = 'S3UploadError'
  }
}

function getS3ErrorCode(responseText: string) {
  return /<Code>([^<]+)<\/Code>/.exec(responseText)?.[1]
}

export type PresignedPost = {
  url: string
  fields: Record<string, string>
}

type IS3Service = {
  uploadFileByPresignedPost(
    presignedPost: PresignedPost,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<void>
}

export class S3Service implements IS3Service {
  uploadFileByPresignedPost(
    { url, fields }: PresignedPost,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<void> {
    const form = new FormData()
    for (const [name, value] of Object.entries(fields)) form.append(name, value)
    form.append('file', file)

    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest()

      request.open('POST', url)

      request.upload.addEventListener('progress', (event) => {
        if (!event.lengthComputable) return
        onProgress?.(Math.round((event.loaded / event.total) * PERCENT))
      })

      request.addEventListener('load', () => {
        if (request.status >= 200 && request.status < 300) {
          onProgress?.(PERCENT)
          resolve()
          return
        }
        const code = getS3ErrorCode(request.responseText)
        reject(
          new S3UploadError(
            (code && S3_ERROR_MESSAGES[code]) ??
              `Não foi possível enviar o arquivo (${request.status}).`,
            request.status,
            code,
          ),
        )
      })

      request.addEventListener('error', () =>
        reject(new S3UploadError(S3_UNREACHABLE_MESSAGE, 0)),
      )
      request.addEventListener('abort', () =>
        reject(new Error('Envio do arquivo cancelado.')),
      )

      request.send(form)
    })
  }
}
