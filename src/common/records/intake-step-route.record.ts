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

type IntakeStepWithScreen = Exclude<
  IntakeStepStatus,
  IntakeStepStatus.StartSale
>

export const intakeStepRouteRecord: Record<IntakeStepWithScreen, string> = {
  [IntakeStepStatus.UpdateProfile]: 'dados-pessoais',
  [IntakeStepStatus.UpsertAddress]: 'endereco-cobranca',
  [IntakeStepStatus.UpdateTerm]: 'parcelas',
  [IntakeStepStatus.PaymentProfile]: 'cartao',
  [IntakeStepStatus.Biometry]: 'biometria',
}

// Pedidos fechados (recusado, cancelado e concluído): o `GET intake/start`
// responde 410 e o tempo real encerra a conexão
const CLOSED_ORDER_ROUTES: Partial<Record<IntakeOrderStatus, string>> = {
  [IntakeOrderStatus.NotAuthorized]: INTAKE_CREDIT_DENIED_ROUTE,
  [IntakeOrderStatus.UnavailableBalance]: INTAKE_CREDIT_DENIED_ROUTE,
  [IntakeOrderStatus.AnalysisExpired]: INTAKE_CREDIT_DENIED_ROUTE,
  [IntakeOrderStatus.BiometryRefused]: INTAKE_CREDIT_DENIED_ROUTE,
  [IntakeOrderStatus.Canceled]: INTAKE_CANCELED_ROUTE,
  [IntakeOrderStatus.Purchased]: INTAKE_FINISHED_ROUTE,
  [IntakeOrderStatus.Billing]: INTAKE_FINISHED_ROUTE,
  [IntakeOrderStatus.Done]: INTAKE_FINISHED_ROUTE,
  [IntakeOrderStatus.Frozen]: INTAKE_FINISHED_ROUTE,
  [IntakeOrderStatus.Disbursed]: INTAKE_FINISHED_ROUTE,
}

// Telas do pedido que valem em qualquer etapa (o link segue aberto)
const OPEN_ORDER_ROUTES: Partial<Record<IntakeOrderStatus, string>> = {
  [IntakeOrderStatus.PendingPaymentConfirmation]: INTAKE_FINISHED_ROUTE,
}

// Análise de crédito: só depois dos dados pessoais (onde fica o consentimento)
const CREDIT_ROUTES: Partial<Record<IntakeOrderStatus, string>> = {
  [IntakeOrderStatus.Analysing]: INTAKE_CREDIT_ANALYSIS_ROUTE,
  [IntakeOrderStatus.Approved]: INTAKE_CREDIT_APPROVED_ROUTE,
}

export function isIntakeOrderClosed(status: string | null | undefined) {
  return Boolean(status && status in CLOSED_ORDER_ROUTES)
}

export function getIntakeStepRoute(status: string | null) {
  if (status === null || status === IntakeStepStatus.StartSale) {
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
  const orderRoute =
    orderStatus &&
    (CLOSED_ORDER_ROUTES[orderStatus] ?? OPEN_ORDER_ROUTES[orderStatus])
  if (orderRoute) return orderRoute

  if (!dateAndStatus) return INTAKE_UNAVAILABLE_STEP_ROUTE

  const { activeStatus } = dateAndStatus
  const creditRoute = orderStatus && CREDIT_ROUTES[orderStatus]
  if (creditRoute && activeStatus !== IntakeStepStatus.UpdateProfile) {
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
