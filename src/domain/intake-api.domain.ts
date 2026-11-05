import type { IntakeVerificationChannel } from './intake.domain'

export interface IntakeApiSendCodeRequest {
  channel: IntakeVerificationChannel
}

export interface IntakeApiVerifyCodeRequest {
  code: string
}

export interface IntakeApiVerifyCodeResponse {
  accessToken: string
  expiresIn: number
}

export interface IntakeApiAccessRedeemRequest {
  code: string
}

export type IntakeApiAccessRedeemResponse = IntakeApiVerifyCodeResponse

export interface IntakeApiProposalValues {
  financedAmount: number
  term: number
  installmentAmount: number
}

export interface IntakeApiProposalSummary {
  number: number
  createdAt: string | null
  values: IntakeApiProposalValues | null
}

export interface IntakeApiRealtimeTicket {
  ticket: string
  expiresAt: string
}
