import { describe, expect, it, vi } from 'vitest'
import { toNewCondition } from './get-intake-new-conditions'

vi.mock('server-only', () => ({}))

describe('toNewCondition', () => {
  it('maps the API condition to the screen values', () => {
    expect(
      toNewCondition({
        simulationId: '9a2b',
        status: 'InNegotiation',
        values: {
          vehicleAmount: 30500,
          downPaymentAmount: 9500,
          financedAmount: 21000,
          term: 24,
          installmentAmount: 1200,
        },
        tacAmount: 800,
        registerAmount: 300,
        interest: { monthlyPercentage: 1.99, annualPercentage: 26.68 },
        cet: { monthlyPercentage: 2.3, annualPercentage: 31.4 },
        iof: { amount: 450, percentage: 0.38 },
        createdAt: '2026-10-20T12:00:00+00:00',
      }),
    ).toEqual({
      simulationId: '9a2b',
      status: 'InNegotiation',
      createdAt: '2026-10-20T12:00:00+00:00',
      vehicleValue: 30500,
      downPaymentValue: 9500,
      financedValue: 21000,
      installments: { count: 24, value: 1200 },
      tacAmount: 800,
      registerAmount: 300,
      iofAmount: 450,
      monthlyInterestRate: 1.99,
      monthlyCet: 2.3,
      annualCet: 31.4,
    })
  })
})
