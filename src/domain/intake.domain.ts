import type { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'

export interface IntakeStep {
  status: IntakeStepStatus
  description: string
  isCompleted: boolean
  completedAt?: string | null
}

export interface IntakeWhiteLabel {
  applied: boolean
  logoUrl: string | null
  colors: {
    primary: string | null
    secondary: string | null
    tertiary: string | null
  }
  cornerStyle: {
    code: string | null
    buttonRadius: string | null
    fieldRadius: string | null
  }
  fonts: {
    title: string | null
    subtitle: string | null
  }
}

export interface IntakeProposalSummary {
  proposalNumber: string
  createdAt: string | null
  financedValue: number
  installments: {
    count: number
    value: number
  }
}

export interface IntakeDateAndStatus {
  activeStatus: IntakeStepStatus | null
  steps: IntakeStep[]
}

export type IntakeUnavailableReason = 'invalid-link' | 'closed' | 'error'

export interface IntakeStartResponse {
  proposalId: string
  dateAndStatus: IntakeDateAndStatus | null
  whiteLabel: IntakeWhiteLabel | null
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
  transactionStatus: string | null
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
  | 'ProposalStatusChanged'

export interface IntakeRealtimeUpdate {
  type: IntakeRealtimeUpdateType
  proposalId: string
  occurredAt: string
  data: Record<string, string | null>
}
