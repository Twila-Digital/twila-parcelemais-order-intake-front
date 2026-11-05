import type { ReactNode } from 'react'
import { StatusScreen } from '@/common/components/status-screen'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { intakeFlowCopyRecord } from '@/common/records/intake-flow-copy.record'
import {
  getIntakeStepStatusByRoute,
  INTAKE_FINISHED_ROUTE,
} from '@/common/records/intake-step-route.record'
import type { IntakeStartResponse } from '@/domain/intake.domain'
import { IntakeProgressHeader } from '@/modules/intake/components/intake-progress-header'
import { IntakeBiometrics } from '@/modules/intake-biometrics'
import { IntakeFinished } from '@/modules/intake-finished'
import { getIntakeProposalSummary } from '@/services/http/intake/server/get-intake-proposal-summary'
import { getIntakeStepData } from '@/services/http/intake/server/get-intake-step-data'

type IntakeStepProps = {
  token: string
  route: string
  start: IntakeStartResponse
}

function StepUnavailable({ header }: { header: ReactNode }) {
  return (
    <StatusScreen
      tone='info'
      header={header}
      title='Continue pelo WhatsApp'
      description='Esta etapa ainda não está disponível por aqui. Volte para o WhatsApp para seguir com sua proposta.'
    />
  )
}

function StepLoadError({ header }: { header: ReactNode }) {
  return (
    <StatusScreen
      tone='warning'
      header={header}
      title='Não foi possível carregar esta etapa'
      description='Tente novamente em alguns instantes ou volte para o WhatsApp.'
    />
  )
}

export async function IntakeStep({ token, route, start }: IntakeStepProps) {
  const summary = await getIntakeProposalSummary(token)
  const header = start.dateAndStatus && (
    <IntakeProgressHeader
      steps={start.dateAndStatus.steps}
      activeStatus={start.dateAndStatus.activeStatus}
      summary={summary}
    />
  )

  if (route === INTAKE_FINISHED_ROUTE) {
    return (
      <IntakeFinished
        header={header}
        proposalId={start.proposalId}
        hasWhiteLabel={Boolean(start.whiteLabel?.applied)}
      />
    )
  }

  const status = getIntakeStepStatusByRoute(route)
  const screen = { token, header }

  switch (status) {
    case IntakeStepStatus.AnalyseBiometric: {
      const data = await getIntakeStepData(token, status)
      if (!data) return <StepLoadError header={header} />
      return (
        <IntakeBiometrics
          {...screen}
          data={data}
          {...intakeFlowCopyRecord.biometrics}
        />
      )
    }
    default:
      return <StepUnavailable header={header} />
  }
}
