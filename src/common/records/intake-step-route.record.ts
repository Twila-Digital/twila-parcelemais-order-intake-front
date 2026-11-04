import { IntakeParticipant } from '@/common/enums/intake-participant.enum'
import { IntakeProposalStatus } from '@/common/enums/intake-proposal-status.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type { IntakeStartResponse } from '@/domain/intake.domain'

export const INTAKE_FINISHED_ROUTE = 'proposta-finalizada'
export const INTAKE_UNAVAILABLE_STEP_ROUTE = 'etapa-indisponivel'
export const INTAKE_NEW_CONDITIONS_ROUTE = 'novas-condicoes'
export const INTAKE_ANALYSING_ROUTE = 'proposta-em-analise'

const ROUTES_OUTSIDE_STEPS = [
  INTAKE_FINISHED_ROUTE,
  INTAKE_UNAVAILABLE_STEP_ROUTE,
  INTAKE_NEW_CONDITIONS_ROUTE,
  INTAKE_ANALYSING_ROUTE,
]

export const intakeStepRouteRecord: Record<IntakeStepStatus, string> = {
  [IntakeStepStatus.NotifySeller]: 'dados-vendedor',
  [IntakeStepStatus.IncludeDepositAccount]: 'dados-bancarios',
  [IntakeStepStatus.IncludeDocument]: 'documentos',
  [IntakeStepStatus.IncludeVehicleExtraInformation]: 'dados-complementares',
  [IntakeStepStatus.InspectCar]: 'vistoria',
  [IntakeStepStatus.AnalyseBiometric]: 'biometria',
  [IntakeStepStatus.IncludeEstablishmentDetails]: 'dados-empresa',
  [IntakeStepStatus.DecisionSeller]: 'confirmar-vendedor',
  [IntakeStepStatus.CreateAccount]: 'dados-pessoais',
}

const FINISHED_ACTIVE_STATUSES = new Set(['Payment', 'Finished'])

export function getIntakeStepRoute(status: string | null) {
  if (status === null || FINISHED_ACTIVE_STATUSES.has(status)) {
    return INTAKE_FINISHED_ROUTE
  }
  return (
    intakeStepRouteRecord[status as IntakeStepStatus] ??
    INTAKE_UNAVAILABLE_STEP_ROUTE
  )
}

export function getIntakeEntryRoute({
  participant,
  proposal,
  dateAndStatus,
}: Pick<IntakeStartResponse, 'participant' | 'proposal' | 'dateAndStatus'>) {
  if (
    proposal?.status === IntakeProposalStatus.InNegotiation &&
    participant === IntakeParticipant.Buyer
  ) {
    return INTAKE_NEW_CONDITIONS_ROUTE
  }
  if (
    proposal?.status === IntakeProposalStatus.InNegotiation ||
    proposal?.status === IntakeProposalStatus.Analysing
  ) {
    return INTAKE_ANALYSING_ROUTE
  }
  if (!dateAndStatus) return INTAKE_UNAVAILABLE_STEP_ROUTE
  return getIntakeStepRoute(dateAndStatus.activeStatus)
}

export function isIntakeStepRoute(route: string) {
  return (
    ROUTES_OUTSIDE_STEPS.includes(route) ||
    Object.values(intakeStepRouteRecord).includes(route)
  )
}

export function getIntakeStepStatusByRoute(route: string) {
  const entry = Object.entries(intakeStepRouteRecord).find(
    ([, stepRoute]) => stepRoute === route,
  )
  return entry ? (entry[0] as IntakeStepStatus) : null
}
