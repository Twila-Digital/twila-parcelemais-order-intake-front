import type { ReactNode } from 'react'
import { StatusScreen } from '@/common/components/status-screen'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { intakeFlowCopyRecord } from '@/common/records/intake-flow-copy.record'
import {
  getIntakeStepStatusByRoute,
  INTAKE_CANCELED_ROUTE,
  INTAKE_CREDIT_ANALYSIS_ROUTE,
  INTAKE_CREDIT_APPROVED_ROUTE,
  INTAKE_CREDIT_DENIED_ROUTE,
  INTAKE_FINISHED_ROUTE,
} from '@/common/records/intake-step-route.record'
import { ILLUSTRATIONS } from '@/constants/illustrations'
import type { IntakeStartResponse } from '@/domain/intake.domain'
import { IntakeProgressHeader } from '@/modules/intake/components/intake-progress-header'
import { IntakeSupportButton } from '@/modules/intake/components/intake-support-button'
import { IntakeBiometrics } from '@/modules/intake-biometrics'
import { IntakeFinished } from '@/modules/intake-finished'
import { getIntakeOrderSummary } from '@/services/http/intake/server/get-intake-order-summary'
import { getIntakeStepData } from '@/services/http/intake/server/get-intake-step-data'
import { IntakeCreditAnalysis } from './components/intake-credit-analysis'
import { IntakeStepPlaceholder } from './components/intake-step-placeholder'

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
      description='Esta etapa ainda não está disponível por aqui. Volte para o WhatsApp para seguir com seu pedido.'
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
  const summary = await getIntakeOrderSummary(token)
  const header = start.dateAndStatus && (
    <IntakeProgressHeader
      steps={start.dateAndStatus.steps}
      activeStatus={start.dateAndStatus.activeStatus}
      summary={summary}
    />
  )

  switch (route) {
    case INTAKE_FINISHED_ROUTE:
      return <IntakeFinished header={header} orderId={start.orderId} />
    case INTAKE_CREDIT_ANALYSIS_ROUTE:
      return <IntakeCreditAnalysis {...intakeFlowCopyRecord.creditAnalysis} />
    case INTAKE_CREDIT_APPROVED_ROUTE:
      return <StatusScreen {...intakeFlowCopyRecord.creditApproved} />
    case INTAKE_CREDIT_DENIED_ROUTE:
      return <StatusScreen tone='info' {...intakeFlowCopyRecord.creditDenied} />
    case INTAKE_CANCELED_ROUTE:
      return (
        <StatusScreen tone='danger' {...intakeFlowCopyRecord.canceled}>
          <IntakeSupportButton />
        </StatusScreen>
      )
  }

  const status = getIntakeStepStatusByRoute(route)
  const screen = { token, header }

  switch (status) {
    // TODO(PM-812): trocar pelo módulo da etapa, que importa a própria ilustração
    case IntakeStepStatus.UpdateProfile:
      return (
        <IntakeStepPlaceholder
          header={null}
          illustration={ILLUSTRATIONS.personalData}
          {...intakeFlowCopyRecord.personalData}
        />
      )
    // TODO(PM-814): trocar pelo módulo da etapa, que importa a própria ilustração
    case IntakeStepStatus.UpsertAddress:
      return (
        <IntakeStepPlaceholder
          header={header}
          illustration={ILLUSTRATIONS.address}
          {...intakeFlowCopyRecord.address}
        />
      )
    // TODO(PM-815): trocar pelo módulo da etapa, que importa a própria ilustração
    case IntakeStepStatus.UpdateTerm:
      return (
        <IntakeStepPlaceholder
          header={header}
          illustration={ILLUSTRATIONS.installments}
          {...intakeFlowCopyRecord.installments}
        />
      )
    // TODO(PM-816): trocar pelo módulo da etapa, que importa a própria ilustração
    case IntakeStepStatus.PaymentProfile:
      return (
        <IntakeStepPlaceholder
          header={header}
          illustration={ILLUSTRATIONS.card}
          {...intakeFlowCopyRecord.card}
        />
      )
    case IntakeStepStatus.Biometry: {
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
