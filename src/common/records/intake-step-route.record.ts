import { IntakeOrderStatus } from '@/common/enums/intake-order-status.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type { IntakeStartResponse } from '@/domain/intake.domain'

export const INTAKE_CREDIT_ANALYSIS_ROUTE = 'analise-credito'
export const INTAKE_CREDIT_APPROVED_ROUTE = 'credito-aprovado'
export const INTAKE_FINISHED_ROUTE = 'pedido-concluido'
export const INTAKE_CANCELED_ROUTE = 'pedido-cancelado'
export const INTAKE_CREDIT_DENIED_ROUTE = 'credito-negado'
export const INTAKE_UNAVAILABLE_STEP_ROUTE = 'etapa-indisponivel'

const ROUTES_OUTSIDE_STEPS = [
  INTAKE_CREDIT_ANALYSIS_ROUTE,
  INTAKE_CREDIT_APPROVED_ROUTE,
  INTAKE_FINISHED_ROUTE,
  INTAKE_CANCELED_ROUTE,
  INTAKE_CREDIT_DENIED_ROUTE,
  INTAKE_UNAVAILABLE_STEP_ROUTE,
]

type IntakeStepWithScreen = Exclude<IntakeStepStatus, IntakeStepStatus.Purchase>

export const intakeStepRouteRecord: Record<IntakeStepWithScreen, string> = {
  [IntakeStepStatus.IncludePersonalData]: 'dados-pessoais',
  [IntakeStepStatus.IncludeAddress]: 'endereco-cobranca',
  [IntakeStepStatus.ChooseInstallments]: 'parcelas',
  [IntakeStepStatus.IncludeCreditCard]: 'cartao',
  [IntakeStepStatus.AnalyseBiometric]: 'biometria',
}

const CLOSED_ORDER_ROUTES: Partial<Record<IntakeOrderStatus, string>> = {
  [IntakeOrderStatus.Canceled]: INTAKE_CANCELED_ROUTE,
  [IntakeOrderStatus.UnavailableBalance]: INTAKE_CREDIT_DENIED_ROUTE,
  [IntakeOrderStatus.NotAuthorized]: INTAKE_CREDIT_DENIED_ROUTE,
  [IntakeOrderStatus.AnalysisExpired]: INTAKE_CREDIT_DENIED_ROUTE,
}

const CREDIT_ROUTES: Partial<Record<IntakeOrderStatus, string>> = {
  [IntakeOrderStatus.Analysing]: INTAKE_CREDIT_ANALYSIS_ROUTE,
  [IntakeOrderStatus.Approved]: INTAKE_CREDIT_APPROVED_ROUTE,
}

export function isIntakeOrderClosed(status: string | null | undefined) {
  return Boolean(status && status in CLOSED_ORDER_ROUTES)
}

export function getIntakeStepRoute(status: string | null) {
  if (status === null || status === IntakeStepStatus.Purchase) {
    return INTAKE_FINISHED_ROUTE
  }
  return (
    intakeStepRouteRecord[status as IntakeStepWithScreen] ??
    INTAKE_UNAVAILABLE_STEP_ROUTE
  )
}

export function getIntakeEntryRoute({
  order,
  dateAndStatus,
}: Pick<IntakeStartResponse, 'order' | 'dateAndStatus'>) {
  const orderStatus = order?.status
  const closedRoute = orderStatus && CLOSED_ORDER_ROUTES[orderStatus]
  if (closedRoute) return closedRoute

  if (!dateAndStatus) return INTAKE_UNAVAILABLE_STEP_ROUTE

  const { activeStatus } = dateAndStatus
  const creditRoute = orderStatus && CREDIT_ROUTES[orderStatus]
  if (creditRoute && activeStatus !== IntakeStepStatus.IncludePersonalData) {
    return creditRoute
  }
  return getIntakeStepRoute(activeStatus)
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
  return entry ? (entry[0] as IntakeStepWithScreen) : null
}
