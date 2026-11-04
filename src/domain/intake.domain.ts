import type { IntakeParticipant } from '@/common/enums/intake-participant.enum'
import type { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'

export interface IntakePendency {
  code: string | null
  description: string | null
  reason: string | null
}

export interface IntakeStep {
  status: IntakeStepStatus
  description: string
  isCompleted: boolean
  completedAt?: string | null
  pendencies?: IntakePendency[] | null
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

export type IntakeProposalType = 'Financing' | 'Refinancing'

export interface IntakeProposalSituation {
  status: string | null
  externalStatus: string | null
}

export interface IntakeProposalSummary {
  proposalNumber: string
  createdAt: string | null
  disbursementDate: string | null
  vehicleDescription: string
  vehicleModel: string | null
  vehicleVersion: string | null
  vehicleYear: number | null
  vehicleValue: number
  downPaymentValue: number
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
  proposalType: IntakeProposalType | null
  participant: IntakeParticipant
  dateAndStatus: IntakeDateAndStatus | null
  whiteLabel: IntakeWhiteLabel | null
  proposal: IntakeProposalSituation | null
  sellerLink?: string | null
}

export type IntakeVerificationChannel = 'sms' | 'wpp'

export interface IntakeSendTokenRequest {
  channel: IntakeVerificationChannel
}

export interface IntakeVerifyTokenRequest {
  code: string
}

export type IntakeSellerType = 'Individual' | 'Store'

export interface IntakeNotifySellerStepData {
  sellerLink: string | null
}

export interface IntakeNotifySellerRequest {
  sellerType: IntakeSellerType
  phoneNumber: string
  email: string
}

export interface IntakeBank {
  number: string
  name: string
}

export type IntakeAccountType = 'Checking' | 'Savings' | 'Payment'

export type IntakeHolderDocumentType = 'Cpf' | 'Cnpj'

export interface IntakeDepositAccountStepData {
  banks: IntakeBank[]
  holderDocumentType: IntakeHolderDocumentType
}

export interface IntakeDepositAccountRequest {
  bankCode: string
  accountType: IntakeAccountType
  agency: string
  agencyDigit: string
  account: string
  accountDigit: string
  holderDocument: string
}

export type IntakeDocumentStatus = 'Pending' | 'Sent' | 'Rejected'

export interface IntakeRequiredDocument {
  documentType: number
  code: string
  description: string
  shortName: string
}

export interface IntakeDocumentAlternative {
  documents: IntakeRequiredDocument[]
}

export interface IntakeDocumentRequirement {
  id: string
  name: string
  status: IntakeDocumentStatus
  rejectionReason?: string | null
  alternatives: IntakeDocumentAlternative[]
}

export interface IntakeDocumentsStepData {
  isComplete: boolean
  requirements: IntakeDocumentRequirement[]
}

export interface IntakeDocumentUploadUrlRequest {
  documentType: number
  fileName: string
}

export interface IntakeDocumentUploadUrlResponse {
  url: string
  fields: Record<string, string>
  key: string
  expiresAt: string
  maxSizeBytes: number
}

export interface IntakeConfirmDocumentRequest {
  key: string
  fileName: string
  documentType: number
}

export interface IntakeVehicleInformationRequest {
  licensePlate: string
  renavam: string
  color: string
  chassi: string
  manufactureYear: number
}

export interface IntakeBiometryStepData {
  isCompleted: boolean
  transactionStatus: string | null
  sessionUrl: string | null
  isAvailable: boolean
}

export interface IntakeDecideSellerRequest {
  isAccepted: boolean
}

export interface IntakeNewCondition {
  simulationId: string
  status: string
  createdAt: string | null
  vehicleValue: number
  downPaymentValue: number
  financedValue: number
  installments: {
    count: number
    value: number
  }
  tacAmount: number
  registerAmount: number
  iofAmount: number
  monthlyInterestRate: number
  monthlyCet: number
  annualCet: number
}

export interface IntakeCounterProposalDecisionRequest {
  simulationId: string
  isAccepted: boolean
}

export interface IntakeCreateAccountRequest {
  firstName: string
  lastName: string
  cpf: string
  email: string
  dateOfBirth: string
}

export interface IntakeEstablishmentDetailsRequest {
  tradeName: string
  legalName: string
  document: string
  phone: string
  email: string
  openingDate: string
}

export interface IntakeRealtimeConnection {
  ticket: string
  accessToken: string
}

export type IntakeRealtimeUpdateType =
  | 'ActiveStatusChanged'
  | 'BiometryStatusChanged'
  | 'DocumentStatusChanged'
  | 'ProposalStatusChanged'

export interface IntakeRealtimeUpdate {
  type: IntakeRealtimeUpdateType
  proposalId: string
  participant: IntakeParticipant
  occurredAt: string
  data: Record<string, string | null>
}
