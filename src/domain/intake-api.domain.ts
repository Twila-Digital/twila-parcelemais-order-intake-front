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

export interface IntakeApiOrderInstallments {
  term: number
  amount: number
}

export interface IntakeApiOrderDetails {
  number: number
  establishmentName: string | null
  orderAmount: number
  totalAmount: number | null
  financedAmount: number | null
  installments: IntakeApiOrderInstallments | null
  description: string | null
}

export interface IntakeApiUpdateProfileRequest {
  name: string
  email: string
  dateOfBirth: string
  password: string
}

export interface IntakeApiAddress {
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface IntakeApiUpsertAddressRequest {
  address: IntakeApiAddress
}

export interface IntakeApiCreatePaymentProfileRequest {
  gatewayToken: string
  saveForFutureUses: boolean
}

export interface IntakeApiRealtimeTicket {
  ticket: string
  expiresAt: string
}
