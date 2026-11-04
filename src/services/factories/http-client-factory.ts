import type { HttpClient } from '@/types/http'
import { AxiosHttpClientAdapter } from '../adapters/axios-adapter'

export const httpClientFactory = (baseUrl?: string): HttpClient =>
  new AxiosHttpClientAdapter(baseUrl)
