import { redirect } from 'next/navigation'
import { getIntakeEntryRoute } from '@/common/records/intake-step-route.record'
import { getIntakeStepPath } from '@/common/utils/intake-path'
import { IntakeVerification } from '@/modules/intake-verification'
import { getIntakeStart } from '@/services/http/intake/server/get-intake-start'
import { getIntakeAccessToken } from '@/services/http/intake/server/intake-session'

export default async function IntakeEntryPage({
  params,
  searchParams,
}: PageProps<'/intake/[token]'>) {
  const { token } = await params
  const { acesso } = await searchParams

  if (typeof acesso === 'string' && acesso) {
    redirect(
      `/api/intake/${encodeURIComponent(token)}/access?code=${encodeURIComponent(acesso)}`,
    )
  }

  const start = await getIntakeStart(token)

  if (!start.ok) return null

  if (await getIntakeAccessToken(token)) {
    redirect(getIntakeStepPath(token, getIntakeEntryRoute(start.data)))
  }

  return <IntakeVerification token={token} />
}
