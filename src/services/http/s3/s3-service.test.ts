import { afterEach, describe, expect, it, vi } from 'vitest'
import { S3Service } from './s3-service'

type Listener = (event?: {
  lengthComputable: boolean
  loaded: number
  total: number
}) => void

class FakeXhr {
  static last: FakeXhr
  status = 0
  responseText = ''
  listeners: Record<string, Listener> = {}
  upload = {
    addEventListener: (name: string, listener: Listener) => {
      this.listeners[`upload:${name}`] = listener
    },
  }
  open = vi.fn()
  setRequestHeader = vi.fn()
  send = vi.fn()
  constructor() {
    FakeXhr.last = this
  }
  addEventListener(name: string, listener: Listener) {
    this.listeners[name] = listener
  }
}

describe('S3Service', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reports progress and resolves on success', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr)
    const onProgress = vi.fn()
    const file = new File(['abc'], 'cnh.pdf', { type: 'application/pdf' })

    const upload = new S3Service().uploadFileByPresignedPost(
      { url: 'https://s3.test', fields: { key: 'a/cnh.pdf', policy: 'p' } },
      file,
      onProgress,
    )
    const xhr = FakeXhr.last
    xhr.listeners['upload:progress']({
      lengthComputable: true,
      loaded: 1,
      total: 4,
    })
    xhr.status = 200
    xhr.listeners.load()

    await expect(upload).resolves.toBeUndefined()
    expect(xhr.open).toHaveBeenCalledWith('POST', 'https://s3.test')
    const form: FormData = xhr.send.mock.calls[0][0]
    expect([...form.keys()]).toEqual(['key', 'policy', 'file'])
    expect(form.get('file')).toBeInstanceOf(File)
    expect(onProgress.mock.calls.map(([value]) => value)).toEqual([25, 100])
  })

  it('rejects when S3 answers with an error', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr)

    const upload = new S3Service().uploadFileByPresignedPost(
      { url: 'https://s3.test', fields: {} },
      new File(['abc'], 'cnh.pdf'),
    )
    FakeXhr.last.status = 400
    FakeXhr.last.responseText =
      '<Error><Code>EntityTooLarge</Code><Message>x</Message></Error>'
    FakeXhr.last.listeners.load()

    await expect(upload).rejects.toThrow('O arquivo é maior que 10 MB.')
  })

  it('reports CORS or network failures without a response', async () => {
    vi.stubGlobal('XMLHttpRequest', FakeXhr)

    const upload = new S3Service().uploadFileByPresignedPost(
      { url: 'https://s3.test', fields: {} },
      new File(['abc'], 'cnh.pdf'),
    )
    FakeXhr.last.listeners.error()

    await expect(upload).rejects.toMatchObject({ status: 0 })
  })
})
