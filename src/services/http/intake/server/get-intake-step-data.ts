import 'server-only'
import { cache } from 'react'
import { IntakeErrorType } from '@/common/enums/intake-error-type.enum'
import { IntakeParticipant } from '@/common/enums/intake-participant.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { logError } from '@/common/lib/datadog-server-logger'
import { getIntakeDocuments } from '@/common/utils/get-intake-documents'
import type {
  IntakeBank,
  IntakeBiometryStepData,
  IntakeDepositAccountStepData,
  IntakeDocumentsStepData,
  IntakeHolderDocumentType,
  IntakeNotifySellerStepData,
  IntakeStartResponse,
} from '@/domain/intake.domain'
import type { IntakeApiRequiredDocuments } from '@/domain/intake-api.domain'
import { getIntakeStart } from './get-intake-start'
import { intakeServerFetch } from './intake-server-fetch'
import { getIntakeAccessToken } from './intake-session'

export type IntakeStepDataByStatus = {
  [IntakeStepStatus.NotifySeller]: IntakeNotifySellerStepData
  [IntakeStepStatus.IncludeDepositAccount]: IntakeDepositAccountStepData
  [IntakeStepStatus.IncludeDocument]: IntakeDocumentsStepData
  [IntakeStepStatus.AnalyseBiometric]: IntakeBiometryStepData
}

export type IntakeStepWithData = keyof IntakeStepDataByStatus

const STEPS_WITH_DATA = new Set<IntakeStepStatus>([
  IntakeStepStatus.NotifySeller,
  IntakeStepStatus.IncludeDepositAccount,
  IntakeStepStatus.IncludeDocument,
  IntakeStepStatus.AnalyseBiometric,
])

export function isIntakeStepWithData(
  status: IntakeStepStatus,
): status is IntakeStepWithData {
  return STEPS_WITH_DATA.has(status)
}

const BIOMETRY_NOT_AVAILABLE: IntakeBiometryStepData = {
  isCompleted: false,
  transactionStatus: null,
  sessionUrl: null,
  isAvailable: false,
}

async function fetchFromApi<T>(
  token: string,
  path: string,
  { withSession = true }: { withSession?: boolean } = {},
) {
  const accessToken = await getIntakeAccessToken(token)
  if (!accessToken) return null

  const response = await intakeServerFetch<T>(token, path, {
    accessToken: withSession ? accessToken : null,
  })
  if (!response.ok) {
    logError('[Intake] Unexpected step data response', {
      http_status: response.status,
      type: response.problem.type,
      path,
    })
  }
  return response
}

function getHolderDocumentType({
  participant,
  dateAndStatus,
}: IntakeStartResponse): IntakeHolderDocumentType {
  const isStore =
    participant === IntakeParticipant.Seller &&
    Boolean(
      dateAndStatus?.steps.some(
        (step) => step.status === IntakeStepStatus.IncludeEstablishmentDetails,
      ),
    )
  return isStore ? 'Cnpj' : 'Cpf'
}

async function loadStepData(
  token: string,
  status: IntakeStepWithData,
  start: IntakeStartResponse,
): Promise<IntakeStepDataByStatus[typeof status] | null> {
  switch (status) {
    case IntakeStepStatus.NotifySeller:
      return { sellerLink: start.sellerLink ?? null }
    case IntakeStepStatus.IncludeDepositAccount: {
      const response = await fetchFromApi<IntakeBank[]>(token, 'intake/banks', {
        withSession: false,
      })
      return response?.ok
        ? {
            banks: response.data,
            holderDocumentType: getHolderDocumentType(start),
          }
        : null
    }
    case IntakeStepStatus.IncludeDocument: {
      const response = await fetchFromApi<IntakeApiRequiredDocuments>(
        token,
        'intake/documents/required',
      )
      if (!response?.ok) return null
      const step = start.dateAndStatus?.steps.find(
        (item) => item.status === IntakeStepStatus.IncludeDocument,
      )
      return getIntakeDocuments(response.data, step?.pendencies ?? [])
    }
    case IntakeStepStatus.AnalyseBiometric: {
      const response = await fetchFromApi<IntakeBiometryStepData>(
        token,
        'intake/biometry',
      )
      if (response?.ok) return { ...response.data, isAvailable: true }
      return response?.problem.type === IntakeErrorType.BiometryNotAvailable
        ? BIOMETRY_NOT_AVAILABLE
        : null
    }
  }
}

export const getIntakeStepData = cache(
  async <S extends IntakeStepWithData>(
    token: string,
    status: S,
  ): Promise<IntakeStepDataByStatus[S] | null> => {
    try {
      const start = await getIntakeStart(token)
      if (!start.ok) return null
      return (await loadStepData(token, status, start.data)) as
        | IntakeStepDataByStatus[S]
        | null
    } catch (error) {
      logError('[Intake] Failed to load step data', {
        step: status,
        error_message: error instanceof Error ? error.message : String(error),
      })
      return null
    }
  },
)
