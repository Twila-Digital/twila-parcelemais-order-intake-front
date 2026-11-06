import type { IntakeBiometryStatus } from '@/common/enums/intake-biometry-status.enum'
import type { IntakeOrderExternalStatus } from '@/common/enums/intake-order-external-status.enum'
import type { IntakeOrderStatus } from '@/common/enums/intake-order-status.enum'
import type { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'

export interface IntakeStep {
  status: IntakeStepStatus
  description: string
  isCompleted: boolean
  completedAt?: string | null
}

export interface IntakeOrder {
  status: IntakeOrderStatus | null
  externalStatus: IntakeOrderExternalStatus | null
}

export interface IntakeOrderSummary {
  orderNumber: string
  establishmentName: string | null
  orderAmount: number
  installments: {
    count: number
    value: number
  } | null
}

export interface IntakeDateAndStatus {
  activeStatus: IntakeStepStatus | null
  steps: IntakeStep[]
}

export type IntakeUnavailableReason = 'invalid-link' | 'closed' | 'error'

export interface IntakeStartResponse {
  orderId: string
  order: IntakeOrder | null
  dateAndStatus: IntakeDateAndStatus | null
}

export type IntakeVerificationChannel = 'sms' | 'wpp'

export interface IntakeSendTokenRequest {
  channel: IntakeVerificationChannel
}

export interface IntakeVerifyTokenRequest {
  code: string
}

export interface IntakeBiometryStepData {
  isCompleted: boolean
  transactionStatus: IntakeBiometryStatus | null
  sessionUrl: string | null
  isAvailable: boolean
}

export interface IntakeRealtimeConnection {
  ticket: string
  accessToken: string
}

export type IntakeRealtimeUpdateType =
  | 'ActiveStatusChanged'
  | 'BiometryStatusChanged'
  | 'OrderStatusChanged'

export interface IntakeRealtimeUpdate {
  type: IntakeRealtimeUpdateType
  orderId: string
  occurredAt: string
  data: Record<string, string | null>
}
