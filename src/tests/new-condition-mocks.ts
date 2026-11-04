import type { IntakeNewCondition } from '@/domain/intake.domain'

type NewConditionOverrides = {
  simulationId?: string
  status?: string
  term?: number
  installmentValue?: number
}

export function newCondition({
  simulationId = '9a2b0000-0000-4000-8000-000000000001',
  status = 'InNegotiation',
  term = 24,
  installmentValue = 1200,
}: NewConditionOverrides = {}): IntakeNewCondition {
  return {
    simulationId,
    status,
    createdAt: '2026-10-20T12:00:00+00:00',
    vehicleValue: 30500,
    downPaymentValue: 9500,
    financedValue: 21000,
    installments: { count: term, value: installmentValue },
    tacAmount: 800,
    registerAmount: 300,
    iofAmount: 450,
    monthlyInterestRate: 1.99,
    monthlyCet: 2.3,
    annualCet: 31.4,
  }
}
