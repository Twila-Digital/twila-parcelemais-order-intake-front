import { describe, expect, it } from 'vitest'
import { IntakeOrderStatus } from '@/common/enums/intake-order-status.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import {
  getIntakeEntryRoute,
  getIntakeStepRoute,
  getIntakeStepStatusByRoute,
  INTAKE_CANCELED_ROUTE,
  INTAKE_CREDIT_ANALYSIS_ROUTE,
  INTAKE_CREDIT_APPROVED_ROUTE,
  INTAKE_CREDIT_DENIED_ROUTE,
  INTAKE_FINISHED_ROUTE,
  INTAKE_UNAVAILABLE_STEP_ROUTE,
  isIntakeOrderClosed,
  isIntakeStepRoute,
} from './intake-step-route.record'

const STEP_ROUTES: [IntakeStepStatus, string][] = [
  [IntakeStepStatus.IncludePersonalData, 'dados-pessoais'],
  [IntakeStepStatus.IncludeAddress, 'endereco-cobranca'],
  [IntakeStepStatus.ChooseInstallments, 'parcelas'],
  [IntakeStepStatus.IncludeCreditCard, 'cartao'],
  [IntakeStepStatus.AnalyseBiometric, 'biometria'],
]

const ROUTES_OUTSIDE_STEPS = [
  INTAKE_CREDIT_ANALYSIS_ROUTE,
  INTAKE_CREDIT_APPROVED_ROUTE,
  INTAKE_FINISHED_ROUTE,
  INTAKE_CANCELED_ROUTE,
  INTAKE_CREDIT_DENIED_ROUTE,
  INTAKE_UNAVAILABLE_STEP_ROUTE,
]

const CLOSED_ORDERS: [IntakeOrderStatus, string][] = [
  [IntakeOrderStatus.Canceled, INTAKE_CANCELED_ROUTE],
  [IntakeOrderStatus.UnavailableBalance, INTAKE_CREDIT_DENIED_ROUTE],
  [IntakeOrderStatus.NotAuthorized, INTAKE_CREDIT_DENIED_ROUTE],
  [IntakeOrderStatus.AnalysisExpired, INTAKE_CREDIT_DENIED_ROUTE],
]

function startWith(
  activeStatus: IntakeStepStatus | null,
  orderStatus: string | null = 'PendingPayment',
) {
  return {
    order: {
      status: orderStatus as IntakeOrderStatus | null,
      externalStatus: null,
    },
    dateAndStatus: { activeStatus, steps: [] },
  }
}

describe('getIntakeStepRoute', () => {
  it.each(STEP_ROUTES)('maps %s to /%s', (status, route) => {
    expect(getIntakeStepRoute(status)).toBe(route)
  })

  it.each([null, IntakeStepStatus.Purchase])(
    'sends %s (every screen done) to the final route',
    (status) => {
      expect(getIntakeStepRoute(status)).toBe(INTAKE_FINISHED_ROUTE)
    },
  )

  it('falls back to the unavailable step for unknown statuses', () => {
    expect(getIntakeStepRoute('SomethingNew')).toBe(
      INTAKE_UNAVAILABLE_STEP_ROUTE,
    )
  })
})

describe('getIntakeStepStatusByRoute', () => {
  it.each(STEP_ROUTES)('reads %s back from /%s', (status, route) => {
    expect(getIntakeStepStatusByRoute(route)).toBe(status)
  })

  it.each(ROUTES_OUTSIDE_STEPS)('has no step status for /%s', (route) => {
    expect(getIntakeStepStatusByRoute(route)).toBeNull()
  })
})

describe('isIntakeStepRoute', () => {
  it.each([...STEP_ROUTES.map(([, route]) => route), ...ROUTES_OUTSIDE_STEPS])(
    'accepts /%s',
    (route) => {
      expect(isIntakeStepRoute(route)).toBe(true)
    },
  )

  it.each(['admin', 'proposta-finalizada'])('rejects /%s', (route) => {
    expect(isIntakeStepRoute(route)).toBe(false)
  })
})

describe('isIntakeOrderClosed', () => {
  it.each(CLOSED_ORDERS)('closes the link for %s', (status) => {
    expect(isIntakeOrderClosed(status)).toBe(true)
  })

  it.each([IntakeOrderStatus.Analysing, IntakeOrderStatus.Approved, null])(
    'keeps the link open for %s',
    (status) => {
      expect(isIntakeOrderClosed(status)).toBe(false)
    },
  )
})

describe('getIntakeEntryRoute', () => {
  it('falls back to the unavailable step without steps', () => {
    expect(getIntakeEntryRoute({ order: null, dateAndStatus: null })).toBe(
      INTAKE_UNAVAILABLE_STEP_ROUTE,
    )
  })

  it.each(STEP_ROUTES)('follows the active step %s', (activeStatus, route) => {
    expect(getIntakeEntryRoute(startWith(activeStatus))).toBe(route)
  })

  it.each(CLOSED_ORDERS)(
    'sends a %s order to /%s whatever the active step',
    (orderStatus, route) => {
      expect(
        getIntakeEntryRoute(
          startWith(IntakeStepStatus.ChooseInstallments, orderStatus),
        ),
      ).toBe(route)
    },
  )

  it.each([
    [IntakeOrderStatus.Analysing, INTAKE_CREDIT_ANALYSIS_ROUTE],
    [IntakeOrderStatus.Approved, INTAKE_CREDIT_APPROVED_ROUTE],
  ])('shows the credit screen while the order is %s', (orderStatus, route) => {
    expect(
      getIntakeEntryRoute(
        startWith(IntakeStepStatus.IncludeAddress, orderStatus),
      ),
    ).toBe(route)
  })

  it.each([IntakeOrderStatus.Analysing, IntakeOrderStatus.Approved])(
    'keeps the personal data before the consent, even when %s',
    (orderStatus) => {
      expect(
        getIntakeEntryRoute(
          startWith(IntakeStepStatus.IncludePersonalData, orderStatus),
        ),
      ).toBe('dados-pessoais')
    },
  )

  it('follows the steps when the API sends no order', () => {
    expect(
      getIntakeEntryRoute({
        order: null,
        dateAndStatus: {
          activeStatus: IntakeStepStatus.IncludeCreditCard,
          steps: [],
        },
      }),
    ).toBe('cartao')
  })
})
