import 'server-only'
import { redirect } from 'next/navigation'
import { getIntakeEntryRoute } from '@/common/records/intake-step-route.record'
import {
  getIntakeEntryPath,
  getIntakeStepPath,
} from '@/common/utils/intake-path'
import type { IntakeStartResponse } from '@/domain/intake.domain'
import { getIntakeAccessToken } from '@/services/http/intake/server/intake-session'

export async function requireActiveIntakeStep(
  token: string,
  route: string,
  start: IntakeStartResponse,
) {
  if (!(await getIntakeAccessToken(token))) {
    redirect(getIntakeEntryPath(token))
  }

  const activeRoute = getIntakeEntryRoute(start)
  if (route !== activeRoute) {
    redirect(getIntakeStepPath(token, activeRoute))
  }
}
