import { describe, expect, it } from 'vitest'
import { IntakeParticipant } from '@/common/enums/intake-participant.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import {
  getIntakeEntryRoute,
  getIntakeStepRoute,
  INTAKE_ANALYSING_ROUTE,
  INTAKE_FINISHED_ROUTE,
  INTAKE_NEW_CONDITIONS_ROUTE,
  INTAKE_UNAVAILABLE_STEP_ROUTE,
  isIntakeStepRoute,
} from './intake-step-route.record'

function entry(
  participant: IntakeParticipant,
  status: string | null,
  activeStatus?: IntakeStepStatus,
) {
  return getIntakeEntryRoute({
    participant,
    proposal: { status, externalStatus: null },
    dateAndStatus: activeStatus ? { activeStatus, steps: [] } : null,
  })
}

describe('getIntakeStepRoute', () => {
  it('maps a known status to its route', () => {
    expect(getIntakeStepRoute(IntakeStepStatus.IncludeDocument)).toBe(
      'documentos',
    )
  })

  it('sends a finished proposal to the final route', () => {
    expect(getIntakeStepRoute(null)).toBe(INTAKE_FINISHED_ROUTE)
  })

  it.each(['Payment', 'Finished'])(
    'sends %s (every step of the participant done) to the final route',
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
    expect(isIntakeStepRoute('admin')).toBe(false)
  })
})

describe('getIntakeEntryRoute', () => {
  it('sends a buyer in negotiation to the new conditions', () => {
    expect(entry(IntakeParticipant.Buyer, 'InNegotiation')).toBe(
      INTAKE_NEW_CONDITIONS_ROUTE,
    )
  })

  it('sends a buyer in analysis to the analysing screen', () => {
    expect(entry(IntakeParticipant.Buyer, 'Analysing')).toBe(
      INTAKE_ANALYSING_ROUTE,
    )
  })

  it.each(['InNegotiation', 'Analysing'])(
    'shows the seller the proposal in analysis (%s)',
    (status) => {
      expect(entry(IntakeParticipant.Seller, status)).toBe(
        INTAKE_ANALYSING_ROUTE,
      )
    },
  )

  it('falls back to the unavailable step without steps', () => {
    expect(entry(IntakeParticipant.Seller, 'ManualAnalysis')).toBe(
      INTAKE_UNAVAILABLE_STEP_ROUTE,
    )
  })

  it('follows the active step for the other statuses', () => {
    expect(
      entry(
        IntakeParticipant.Buyer,
        'Approved',
        IntakeStepStatus.IncludeDocument,
      ),
    ).toBe('documentos')
  })

  it('accepts the counter-proposal routes as intake routes', () => {
    expect(isIntakeStepRoute(INTAKE_NEW_CONDITIONS_ROUTE)).toBe(true)
    expect(isIntakeStepRoute(INTAKE_ANALYSING_ROUTE)).toBe(true)
  })
})
