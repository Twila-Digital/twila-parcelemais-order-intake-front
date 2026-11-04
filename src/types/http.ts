export interface ResponseHeaders {
  get(headerName: string): string | number
  get(headerName: string, parser: RegExp): RegExpExecArray | null
}

export type HttpMethod = 'get' | 'post' | 'put' | 'delete'

export interface RequestConfig {
  url: string
  method: HttpMethod | Uppercase<HttpMethod>
  body?: object
  params?: object
  headers?: Record<string, string>
  responseType?: 'json' | 'blob'
}

export interface Response<T> {
  headers: ResponseHeaders
  status: number
  data: T
}

export interface HttpClient {
  request<R = unknown>(config: RequestConfig): Promise<Response<R>>
}
