import 'server-only'
import { cache } from 'react'
import { IntakeErrorType } from '@/common/enums/intake-error-type.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { logError } from '@/common/lib/datadog-server-logger'
import type { IntakeBiometryStepData } from '@/domain/intake.domain'
import { intakeServerFetch } from './intake-server-fetch'
import { getIntakeAccessToken } from './intake-session'

export type IntakeStepDataByStatus = {
  [IntakeStepStatus.Biometry]: IntakeBiometryStepData
}

export type IntakeStepWithData = keyof IntakeStepDataByStatus

const STEPS_WITH_DATA = new Set<IntakeStepStatus>([IntakeStepStatus.Biometry])

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

async function fetchFromApi<T>(token: string, path: string) {
  const accessToken = await getIntakeAccessToken(token)
  if (!accessToken) return null

  const response = await intakeServerFetch<T>(token, path, { accessToken })
  if (!response.ok) {
    logError('[Intake] Unexpected step data response', {
      http_status: response.status,
      type: response.problem.type,
      path,
    })
  }
  return response
}

async function loadStepData(
  token: string,
  status: IntakeStepWithData,
): Promise<IntakeStepDataByStatus[typeof status] | null> {
  switch (status) {
    case IntakeStepStatus.Biometry: {
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
      return (await loadStepData(token, status)) as
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
