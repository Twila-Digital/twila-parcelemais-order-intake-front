import { IntakeErrorType } from '@/common/enums/intake-error-type.enum'
import type {
  IntakeOrderSummary,
  IntakeRealtimeConnection,
  IntakeSendTokenRequest,
  IntakeStartResponse,
  IntakeVerifyTokenRequest,
} from '@/domain/intake.domain'
import { ApiError } from '@/services/error'
import type { HttpClient, RequestConfig, Response } from '@/types/http'

type IIntakeService = {
  sendToken(token: string, body: IntakeSendTokenRequest): Promise<void>
  verifyToken(token: string, body: IntakeVerifyTokenRequest): Promise<void>
  getOrderSummary(token: string): Promise<IntakeOrderSummary>
  getStart(token: string): Promise<IntakeStartResponse>
  getRealtimeConnection(token: string): Promise<IntakeRealtimeConnection>
  getStepData<T>(token: string, stepPath: string): Promise<T>
  submitStep(token: string, stepPath: string, body: object): Promise<void>
}

export class IntakeService implements IIntakeService {
  constructor(readonly httpClient: HttpClient) {}

  private async request<R>(config: RequestConfig): Promise<Response<R>> {
    try {
      return await this.httpClient.request<R>(config)
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.type === IntakeErrorType.SessionExpired &&
        typeof window !== 'undefined'
      ) {
        window.location.reload()
      }
      throw error
    }
  }

  private tokenUrl(token: string, path: string) {
    return `/${encodeURIComponent(token)}/${path}`
  }

  async sendToken(token: string, body: IntakeSendTokenRequest) {
    await this.request<void>({
      url: this.tokenUrl(token, 'send-token'),
      method: 'post',
      body,
    })
  }

  async verifyToken(token: string, body: IntakeVerifyTokenRequest) {
    await this.request<void>({
      url: this.tokenUrl(token, 'verify-token'),
      method: 'post',
      body,
    })
  }

  async getOrderSummary(token: string) {
    const response = await this.request<IntakeOrderSummary>({
      url: this.tokenUrl(token, 'order'),
      method: 'get',
    })
    return response.data
  }

  async getStart(token: string) {
    const response = await this.request<IntakeStartResponse>({
      url: this.tokenUrl(token, 'start'),
      method: 'get',
    })
    return response.data
  }

  async getRealtimeConnection(token: string) {
    const response = await this.request<IntakeRealtimeConnection>({
      url: this.tokenUrl(token, 'realtime/ticket'),
      method: 'post',
    })
    return response.data
  }

  async getStepData<T>(token: string, stepPath: string) {
    const response = await this.request<T>({
      url: this.tokenUrl(token, `steps/${stepPath}`),
      method: 'get',
    })
    return response.data
  }

  async submitStep(token: string, stepPath: string, body: object) {
    await this.request<void>({
      url: this.tokenUrl(token, `steps/${stepPath}`),
      method: 'post',
      body,
    })
  }
}
