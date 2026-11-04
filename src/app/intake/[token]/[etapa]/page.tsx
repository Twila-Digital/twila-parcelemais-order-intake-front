import { notFound } from 'next/navigation'
import { isIntakeStepRoute } from '@/common/records/intake-step-route.record'
import { requireActiveIntakeStep } from '@/modules/intake/utils/require-intake-session'
import { IntakeStep } from '@/modules/intake-step'
import { getIntakeStart } from '@/services/http/intake/server/get-intake-start'

export default async function IntakeStepPage({
  params,
}: PageProps<'/intake/[token]/[etapa]'>) {
  const { token, etapa } = await params
  if (!isIntakeStepRoute(etapa)) notFound()

  const start = await getIntakeStart(token)
  if (!start.ok) return null

  await requireActiveIntakeStep(token, etapa, start.data)

  return <IntakeStep token={token} route={etapa} start={start.data} />
}
