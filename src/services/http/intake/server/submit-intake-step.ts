import 'server-only'
import { z } from 'zod'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type {
  IntakeApiCreatePaymentProfileRequest,
  IntakeApiUpdateProfileRequest,
  IntakeApiUpsertAddressRequest,
} from '@/domain/intake-api.domain'
import {
  type IntakeServerResponse,
  intakeServerFetch,
} from './intake-server-fetch'

const BRAZIL_OFFSET = '-03:00'
const ADDRESS_COUNTRY = 'Brasil'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const toDateTimeOffset = (date: string) => `${date}T00:00:00${BRAZIL_OFFSET}`

const personalDataSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.email(),
  dateOfBirth: isoDate,
  password: z.string().min(1),
})

const addressSchema = z.object({
  zipCode: z.string().regex(/^\d{8}$/),
  street: z.string().trim().min(1).max(200),
  number: z.string().trim().min(1).max(20),
  complement: z.string().trim().max(100).nullish(),
  district: z.string().trim().min(1).max(100),
  city: z.string().trim().min(1).max(100),
  state: z.string().regex(/^[A-Z]{2}$/),
})

const creditCardSchema = z.object({
  gatewayToken: z.string().min(1),
  saveForFutureUses: z.boolean(),
})

export type SubmitIntakeStepResult =
  | { ok: false; reason: 'invalid-body' | 'no-submit' }
  | { ok: true; response: IntakeServerResponse<unknown> }

export async function submitIntakeStep(
  token: string,
  status: IntakeStepStatus,
  body: unknown,
  accessToken: string,
): Promise<SubmitIntakeStepResult> {
  const send = async (
    method: 'POST' | 'PUT',
    path: string,
    payload: unknown,
  ) => ({
    ok: true as const,
    response: await intakeServerFetch<unknown>(token, path, {
      method,
      body: payload,
      accessToken,
    }),
  })
  const invalid = { ok: false as const, reason: 'invalid-body' as const }

  switch (status) {
    case IntakeStepStatus.UpdateProfile: {
      const parsed = personalDataSchema.safeParse(body)
      if (!parsed.success) return invalid
      const payload: IntakeApiUpdateProfileRequest = {
        ...parsed.data,
        dateOfBirth: toDateTimeOffset(parsed.data.dateOfBirth),
      }
      return send('PUT', 'intake/profile', payload)
    }

    case IntakeStepStatus.UpsertAddress: {
      const parsed = addressSchema.safeParse(body)
      if (!parsed.success) return invalid
      const payload: IntakeApiUpsertAddressRequest = {
        address: {
          ...parsed.data,
          complement: parsed.data.complement || null,
          country: ADDRESS_COUNTRY,
        },
      }
      return send('PUT', 'intake/address', payload)
    }

    case IntakeStepStatus.PaymentProfile: {
      const parsed = creditCardSchema.safeParse(body)
      if (!parsed.success) return invalid
      const payload: IntakeApiCreatePaymentProfileRequest = parsed.data
      return send('POST', 'intake/payment-profile', payload)
    }

    default:
      return { ok: false, reason: 'no-submit' }
  }
}
