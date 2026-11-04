import type { ReactNode } from 'react'
import { StatusScreen } from '@/common/components/status-screen'
import { IntakeParticipant } from '@/common/enums/intake-participant.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { intakeFlowCopyRecord } from '@/common/records/intake-flow-copy.record'
import {
  getIntakeStepStatusByRoute,
  INTAKE_ANALYSING_ROUTE,
  INTAKE_FINISHED_ROUTE,
  INTAKE_NEW_CONDITIONS_ROUTE,
} from '@/common/records/intake-step-route.record'
import { getIntakeFlow } from '@/common/utils/get-intake-flow'
import type { IntakeStartResponse } from '@/domain/intake.domain'
import { IntakeProgressHeader } from '@/modules/intake/components/intake-progress-header'
import { IntakeBiometrics } from '@/modules/intake-biometrics'
import { IntakeCreateAccount } from '@/modules/intake-create-account'
import { IntakeDepositAccount } from '@/modules/intake-deposit-account'
import { IntakeDocuments } from '@/modules/intake-documents'
import { IntakeEstablishmentDetails } from '@/modules/intake-establishment-details'
import { IntakeFinished } from '@/modules/intake-finished'
import { IntakeInspection } from '@/modules/intake-inspection'
import { IntakeNewConditions } from '@/modules/intake-new-conditions'
import { NewConditionsLoading } from '@/modules/intake-new-conditions/components/new-conditions-loading'
import {
  NewConditionsAccepted,
  NewConditionsRefused,
  ProposalInAnalysis,
} from '@/modules/intake-new-conditions/components/new-conditions-result'
import { getNewConditionsState } from '@/modules/intake-new-conditions/utils/get-new-conditions-state'
import { IntakeSellerData } from '@/modules/intake-seller-data'
import { IntakeSellerDecision } from '@/modules/intake-seller-decision'
import { IntakeVehicleInformation } from '@/modules/intake-vehicle-information'
import { getIntakeNewConditions } from '@/services/http/intake/server/get-intake-new-conditions'
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

async function NewConditionsStep({ token }: { token: string }) {
  const [conditions, summary] = await Promise.all([
    getIntakeNewConditions(token),
    getIntakeProposalSummary(token),
  ])
  if (!conditions) return <StepLoadError header={null} />

  const state = getNewConditionsState(conditions)
  switch (state.kind) {
    case 'pending':
      return (
        <IntakeNewConditions
          token={token}
          summary={summary}
          conditions={state.conditions}
        />
      )
    case 'accepted':
      return <NewConditionsAccepted />
    case 'refused':
      return <NewConditionsRefused />
    default:
      return (
        <NewConditionsLoading fallback={<StepUnavailable header={null} />} />
      )
  }
}

export async function IntakeStep({ token, route, start }: IntakeStepProps) {
  if (route === INTAKE_NEW_CONDITIONS_ROUTE) {
    return <NewConditionsStep token={token} />
  }
  if (route === INTAKE_ANALYSING_ROUTE) {
    return start.participant === IntakeParticipant.Buyer ? (
      <NewConditionsAccepted />
    ) : (
      <ProposalInAnalysis />
    )
  }

  const flow = getIntakeFlow(start)
  const copy = intakeFlowCopyRecord[flow]
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
        flow={flow}
        summary={summary}
        hasWhiteLabel={Boolean(start.whiteLabel?.applied)}
      />
    )
  }

  const status = getIntakeStepStatusByRoute(route)
  const screen = { token, flow, header }

  switch (status) {
    case IntakeStepStatus.NotifySeller: {
      const data = await getIntakeStepData(token, status)
      if (!data) return <StepLoadError header={header} />
      return <IntakeSellerData {...screen} data={data} />
    }
    case IntakeStepStatus.IncludeDepositAccount: {
      const data = await getIntakeStepData(token, status)
      if (!data) return <StepLoadError header={header} />
      return <IntakeDepositAccount {...screen} data={data} />
    }
    case IntakeStepStatus.IncludeDocument: {
      const data = await getIntakeStepData(token, status)
      if (!data) return <StepLoadError header={header} />
      return <IntakeDocuments {...screen} data={data} />
    }
    case IntakeStepStatus.IncludeVehicleExtraInformation:
      return (
        <IntakeVehicleInformation
          {...screen}
          data={{ modelYear: summary?.vehicleYear ?? undefined }}
        />
      )
    case IntakeStepStatus.InspectCar:
      return <IntakeInspection {...screen} data={undefined} />
    case IntakeStepStatus.AnalyseBiometric: {
      const data = await getIntakeStepData(token, status)
      if (!data) return <StepLoadError header={header} />
      return <IntakeBiometrics {...screen} data={data} {...copy.biometrics} />
    }
    case IntakeStepStatus.IncludeEstablishmentDetails:
      return <IntakeEstablishmentDetails {...screen} data={undefined} />
    case IntakeStepStatus.DecisionSeller:
      return <IntakeSellerDecision {...screen} header={null} data={summary} />
    case IntakeStepStatus.CreateAccount:
      return <IntakeCreateAccount {...screen} header={null} data={undefined} />
    default:
      return <StepUnavailable header={header} />
  }
}
