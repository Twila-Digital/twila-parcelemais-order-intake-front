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

export interface IntakeApiNotifySellerRequest {
  isRetailer: boolean
  email: string
  phone: string
}

export interface IntakeApiDepositAccountRequest {
  depositAccount: {
    accountNumber: string
    agencyNumber: string
    bankNumber: string
    accountDigit: string
    agencyDigit: string
    accountType: number
  }
  holderDocument: string
}

export interface IntakeApiVehicleDetailRequest {
  licensePlate: string
  renavam: string
  color: string
  chassi: string
  manufactureYear: number
}

export interface IntakeApiCreateSellerAccountRequest {
  firstName: string
  lastName: string
  cpf: string
  email: string
  dateOfBirth: string
}

export interface IntakeApiDecideSellerRequest {
  isAccepted: boolean
}

export interface IntakeApiEstablishmentDetailsRequest {
  tradeName: string
  legalName: string
  document: string
  phone: string
  email: string
  openingDate: string
}

export interface IntakeApiProposalValues {
  vehicleAmount: number
  downPaymentAmount: number
  financedAmount: number
  term: number
  installmentAmount: number
}

export interface IntakeApiPercentages {
  monthlyPercentage: number
  annualPercentage: number
}

export interface IntakeApiNewCondition {
  simulationId: string
  status: string
  values: IntakeApiProposalValues
  tacAmount: number
  registerAmount: number
  interest: IntakeApiPercentages
  cet: IntakeApiPercentages
  iof: { amount: number; percentage: number }
  createdAt: string | null
}

export interface IntakeApiCounterProposalDecisionRequest {
  simulationId: string
  isAccepted: boolean
}

export interface IntakeApiProposalSummary {
  number: number
  createdAt: string | null
  disbursementDate: string | null
  vehicle: {
    brand: string | null
    model: string | null
    version: string | null
    year: number | null
  } | null
  values: IntakeApiProposalValues | null
}

export interface IntakeApiDocumentType {
  documentType: number
  code: string | null
  description: string | null
  status: string | null
}

export interface IntakeApiDocumentRequirement {
  isFulfilled: boolean
  alternatives: { documents: IntakeApiDocumentType[] | null }[] | null
}

export interface IntakeApiRequiredDocuments {
  participant: string | null
  isComplete: boolean
  required: IntakeApiDocumentRequirement[] | null
}

export interface IntakeApiRealtimeTicket {
  ticket: string
  expiresAt: string
}
