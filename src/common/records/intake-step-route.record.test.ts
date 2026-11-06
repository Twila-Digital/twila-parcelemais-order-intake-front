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
  [IntakeStepStatus.UpdateProfile, 'dados-pessoais'],
  [IntakeStepStatus.UpsertAddress, 'endereco-cobranca'],
  [IntakeStepStatus.UpdateTerm, 'parcelas'],
  [IntakeStepStatus.PaymentProfile, 'cartao'],
  [IntakeStepStatus.Biometry, 'biometria'],
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
  [IntakeOrderStatus.NotAuthorized, INTAKE_CREDIT_DENIED_ROUTE],
  [IntakeOrderStatus.UnavailableBalance, INTAKE_CREDIT_DENIED_ROUTE],
  [IntakeOrderStatus.AnalysisExpired, INTAKE_CREDIT_DENIED_ROUTE],
  [IntakeOrderStatus.BiometryRefused, INTAKE_CREDIT_DENIED_ROUTE],
  [IntakeOrderStatus.Canceled, INTAKE_CANCELED_ROUTE],
  [IntakeOrderStatus.Purchased, INTAKE_FINISHED_ROUTE],
  [IntakeOrderStatus.Billing, INTAKE_FINISHED_ROUTE],
  [IntakeOrderStatus.Done, INTAKE_FINISHED_ROUTE],
  [IntakeOrderStatus.Frozen, INTAKE_FINISHED_ROUTE],
  [IntakeOrderStatus.Disbursed, INTAKE_FINISHED_ROUTE],
]

const ORDERS_FOLLOWING_STEPS = [
  IntakeOrderStatus.SaleNotStarted,
  IntakeOrderStatus.WaitingRegistration,
  IntakeOrderStatus.PendingAuthorization,
  IntakeOrderStatus.PendingPayment,
  IntakeOrderStatus.PaymentRefused,
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

  it.each([null, IntakeStepStatus.StartSale])(
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

  it.each([
    ...ORDERS_FOLLOWING_STEPS,
    IntakeOrderStatus.Analysing,
    IntakeOrderStatus.Approved,
    IntakeOrderStatus.PendingPaymentConfirmation,
    null,
  ])('keeps the link open for %s', (status) => {
    expect(isIntakeOrderClosed(status)).toBe(false)
  })
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
          startWith(IntakeStepStatus.UpdateTerm, orderStatus),
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
        startWith(IntakeStepStatus.UpsertAddress, orderStatus),
      ),
    ).toBe(route)
  })

  it.each([IntakeOrderStatus.Analysing, IntakeOrderStatus.Approved])(
    'keeps the personal data before the consent, even when %s',
    (orderStatus) => {
      expect(
        getIntakeEntryRoute(
          startWith(IntakeStepStatus.UpdateProfile, orderStatus),
        ),
      ).toBe('dados-pessoais')
    },
  )

  it.each(ORDERS_FOLLOWING_STEPS)(
    'follows the active step while the order is %s',
    (orderStatus) => {
      expect(
        getIntakeEntryRoute(
          startWith(IntakeStepStatus.PaymentProfile, orderStatus),
        ),
      ).toBe('cartao')
    },
  )

  it('shows the finished screen once the purchase was sent', () => {
    expect(
      getIntakeEntryRoute(
        startWith(
          IntakeStepStatus.StartSale,
          IntakeOrderStatus.PendingPaymentConfirmation,
        ),
      ),
    ).toBe(INTAKE_FINISHED_ROUTE)
  })

  it('follows the steps when the API sends no order', () => {
    expect(
      getIntakeEntryRoute({
        order: null,
        dateAndStatus: {
          activeStatus: IntakeStepStatus.PaymentProfile,
          steps: [],
        },
      }),
    ).toBe('cartao')
  })
})
