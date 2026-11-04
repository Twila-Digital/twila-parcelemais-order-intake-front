import 'server-only'
import { z } from 'zod'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type { IntakeAccountType } from '@/domain/intake.domain'
import type {
  IntakeApiCreateSellerAccountRequest,
  IntakeApiDecideSellerRequest,
  IntakeApiDepositAccountRequest,
  IntakeApiEstablishmentDetailsRequest,
  IntakeApiNotifySellerRequest,
  IntakeApiVehicleDetailRequest,
} from '@/domain/intake-api.domain'
import {
  type IntakeServerResponse,
  intakeServerFetch,
} from './intake-server-fetch'

const API_ACCOUNT_TYPE: Record<IntakeAccountType, number> = {
  Checking: 1,
  Savings: 2,
  Payment: 3,
}

const BRAZIL_OFFSET = '-03:00'

const digits = z.string().regex(/^\d+$/)
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const toDateTimeOffset = (date: string) => `${date}T00:00:00${BRAZIL_OFFSET}`

const notifySellerSchema = z.object({
  sellerType: z.enum(['Individual', 'Store']),
  phoneNumber: z.string().min(1).max(32),
  email: z.email(),
})

const depositAccountSchema = z.object({
  bankCode: digits.length(3),
  accountType: z.enum(['Checking', 'Savings', 'Payment']),
  agency: digits.length(4),
  agencyDigit: z.string().regex(/^[\dX]$/i),
  account: digits.min(4).max(13),
  accountDigit: z.string().regex(/^[\dX]$/i),
  holderDocument: digits.min(11).max(14),
})

const vehicleInformationSchema = z.object({
  licensePlate: z.string().min(1).max(16),
  renavam: z.string().min(1).max(16),
  color: z.string().min(1).max(64),
  chassi: z.string().min(1).max(32),
  manufactureYear: z.number().int().min(1000).max(9999),
})

const decideSellerSchema = z.object({ isAccepted: z.boolean() })

const createAccountSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  cpf: digits.length(11),
  email: z.email(),
  dateOfBirth: isoDate,
})

const establishmentDetailsSchema = z.object({
  tradeName: z.string().min(1).max(200),
  legalName: z.string().min(1).max(200),
  document: digits.length(14),
  phone: z.string().regex(/^\+55\d{10,11}$/),
  email: z.email(),
  openingDate: isoDate,
})

type Post = <T>(path: string, body: unknown) => Promise<IntakeServerResponse<T>>

export type SubmitIntakeStepResult =
  | { ok: false; reason: 'invalid-body' | 'no-submit' }
  | { ok: true; response: IntakeServerResponse<unknown> }

export async function submitIntakeStep(
  token: string,
  status: IntakeStepStatus,
  body: unknown,
  accessToken: string,
): Promise<SubmitIntakeStepResult> {
  const post: Post = (path, payload) =>
    intakeServerFetch(token, path, {
      method: 'POST',
      body: payload,
      accessToken,
    })
  const send = async (request: Promise<IntakeServerResponse<unknown>>) => ({
    ok: true as const,
    response: await request,
  })
  const invalid = { ok: false as const, reason: 'invalid-body' as const }

  switch (status) {
    case IntakeStepStatus.NotifySeller: {
      const parsed = notifySellerSchema.safeParse(body)
      if (!parsed.success) return invalid
      const payload: IntakeApiNotifySellerRequest = {
        isRetailer: parsed.data.sellerType === 'Store',
        email: parsed.data.email,
        phone: parsed.data.phoneNumber,
      }
      return send(post('intake/notify-seller', payload))
    }

    case IntakeStepStatus.IncludeDepositAccount: {
      const parsed = depositAccountSchema.safeParse(body)
      if (!parsed.success) return invalid
      const data = parsed.data
      const payload: IntakeApiDepositAccountRequest = {
        depositAccount: {
          bankNumber: data.bankCode,
          agencyNumber: data.agency,
          agencyDigit: data.agencyDigit.toUpperCase(),
          accountNumber: data.account,
          accountDigit: data.accountDigit.toUpperCase(),
          accountType: API_ACCOUNT_TYPE[data.accountType],
        },
        holderDocument: data.holderDocument,
      }
      return send(post('intake/deposit-account', payload))
    }

    case IntakeStepStatus.IncludeVehicleExtraInformation: {
      const parsed = vehicleInformationSchema.safeParse(body)
      if (!parsed.success) return invalid
      const payload: IntakeApiVehicleDetailRequest = parsed.data
      return send(post('intake/vehicle-detail', payload))
    }

    case IntakeStepStatus.CreateAccount: {
      const parsed = createAccountSchema.safeParse(body)
      if (!parsed.success) return invalid
      const payload: IntakeApiCreateSellerAccountRequest = {
        ...parsed.data,
        dateOfBirth: toDateTimeOffset(parsed.data.dateOfBirth),
      }
      return send(post('intake/account', payload))
    }

    case IntakeStepStatus.DecisionSeller: {
      const parsed = decideSellerSchema.safeParse(body)
      if (!parsed.success) return invalid
      const payload: IntakeApiDecideSellerRequest = parsed.data
      return send(post('intake/decision-seller', payload))
    }

    case IntakeStepStatus.IncludeEstablishmentDetails: {
      const parsed = establishmentDetailsSchema.safeParse(body)
      if (!parsed.success) return invalid
      const payload: IntakeApiEstablishmentDetailsRequest = {
        ...parsed.data,
        openingDate: toDateTimeOffset(parsed.data.openingDate),
      }
      return send(post('intake/establishment-details', payload))
    }

    default:
      return { ok: false, reason: 'no-submit' }
  }
}
