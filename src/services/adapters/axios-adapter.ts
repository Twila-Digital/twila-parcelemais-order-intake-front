import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from 'axios'
import qs from 'qs'
import { logApiError } from '@/common/lib/log-api-error'
import { ONE_SECOND_IN_MILLISECONDS } from '@/constants/times'
import type {
  HttpClient,
  RequestConfig,
  Response,
  ResponseHeaders,
} from '@/types/http'
import { ApiError, type ApiErrorData } from '../error'

const ABSOLUTE_URL_REGEX = /^[a-z][a-z\d+.-]*:\/\//i

const isExternalRequest = (url: string) => ABSOLUTE_URL_REGEX.test(url)

export class AxiosHttpClientAdapter implements HttpClient {
  private axiosInstance: AxiosInstance
  constructor(_baseURL = '') {
    const timeout =
      parseInt(process.env.NEXT_REQUEST_TIMEOUT || '', 10) *
      ONE_SECOND_IN_MILLISECONDS

    this.axiosInstance = axios.create({
      baseURL: _baseURL,
      timeout,
      paramsSerializer: (params) => {
        return qs.stringify(params, { arrayFormat: 'repeat' })
      },
    })
  }

  async request<R = unknown>(config: RequestConfig): Promise<Response<R>> {
    let axiosResponse: AxiosResponse | null = null
    try {
      const isExternal = isExternalRequest(config.url)

      axiosResponse = await this.axiosInstance.request<R>({
        url: config.url,
        method: config.method,
        data: config.body,
        params: config.params,
        responseType: config.responseType,
        headers: isExternal
          ? config.headers
          : {
              'Idempotency-Key': crypto.randomUUID(),
              ...config.headers,
            },
      })

      const response: Response<R> = {
        data: axiosResponse.data,
        status: axiosResponse.status,
        headers: axiosResponse.headers as ResponseHeaders,
      }

      return response
    } catch (error) {
      const method = config.method.toUpperCase()
      const endpoint = config.url.startsWith('/')
        ? config.url
        : `/${config.url}`
      const paramKeys = Object.keys(config.params ?? {})

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorData, ApiErrorData>
        if (axiosError.response) {
          const apiError = new ApiError({
            ...axiosError.response.data,
            status: axiosError.response.status,
          })

          logApiError({ method, endpoint, paramKeys, error: apiError })

          throw apiError
        }
      }

      logApiError({ method, endpoint, paramKeys, error })

      throw error
    }
  }
}
