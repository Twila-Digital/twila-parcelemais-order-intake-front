import { describe, expect, it } from 'vitest'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import {
  getIntakeEntryRoute,
  getIntakeStepRoute,
  INTAKE_FINISHED_ROUTE,
  INTAKE_UNAVAILABLE_STEP_ROUTE,
  isIntakeStepRoute,
} from './intake-step-route.record'

describe('getIntakeStepRoute', () => {
  it('maps a known status to its route', () => {
    expect(getIntakeStepRoute(IntakeStepStatus.AnalyseBiometric)).toBe(
      'biometria',
    )
  })

  it('sends a finished proposal to the final route', () => {
    expect(getIntakeStepRoute(null)).toBe(INTAKE_FINISHED_ROUTE)
  })

  it.each(['Payment', 'Finished'])(
    'sends %s (every step done) to the final route',
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

describe('isIntakeStepRoute', () => {
  it('accepts step and terminal routes and rejects anything else', () => {
    expect(isIntakeStepRoute('biometria')).toBe(true)
    expect(isIntakeStepRoute(INTAKE_FINISHED_ROUTE)).toBe(true)
    expect(isIntakeStepRoute(INTAKE_UNAVAILABLE_STEP_ROUTE)).toBe(true)
    expect(isIntakeStepRoute('admin')).toBe(false)
  })
})

describe('getIntakeEntryRoute', () => {
  it('falls back to the unavailable step without steps', () => {
    expect(getIntakeEntryRoute({ dateAndStatus: null })).toBe(
      INTAKE_UNAVAILABLE_STEP_ROUTE,
    )
  })

  it('follows the active step', () => {
    expect(
      getIntakeEntryRoute({
        dateAndStatus: {
          activeStatus: IntakeStepStatus.AnalyseBiometric,
          steps: [],
        },
      }),
    ).toBe('biometria')
  })
})
