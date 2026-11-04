import { describe, expect, it } from 'vitest'
import { IntakeFlow } from '@/common/enums/intake-flow.enum'
import { IntakeParticipant } from '@/common/enums/intake-participant.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type { IntakeProposalType } from '@/domain/intake.domain'
import { getIntakeFlow } from './get-intake-flow'

function start(
  participant: IntakeParticipant,
  statuses: IntakeStepStatus[],
  proposalType: IntakeProposalType | null = null,
) {
  return {
    participant,
    proposalType,
    dateAndStatus: {
      activeStatus: statuses[0],
      steps: statuses.map((status) => ({
        status,
        description: status,
        isCompleted: false,
      })),
    },
  }
}

describe('getIntakeFlow', () => {
  it('detects the seller flow from the participant', () => {
    expect(
      getIntakeFlow(
        start(IntakeParticipant.Seller, [IntakeStepStatus.InspectCar]),
      ),
    ).toBe(IntakeFlow.Seller)
  })

  it('detects buyer financing by the notify seller step', () => {
    expect(
      getIntakeFlow(
        start(IntakeParticipant.Buyer, [IntakeStepStatus.NotifySeller]),
      ),
    ).toBe(IntakeFlow.BuyerFinancing)
  })

  it('treats any other buyer flow as a loan', () => {
    expect(
      getIntakeFlow(
        start(IntakeParticipant.Buyer, [
          IntakeStepStatus.IncludeDepositAccount,
        ]),
      ),
    ).toBe(IntakeFlow.BuyerLoan)
  })

  it('uses the proposal type when the start sends it', () => {
    expect(
      getIntakeFlow(
        start(
          IntakeParticipant.Buyer,
          [IntakeStepStatus.IncludeDepositAccount],
          'Financing',
        ),
      ),
    ).toBe(IntakeFlow.BuyerFinancing)
    expect(
      getIntakeFlow(
        start(
          IntakeParticipant.Buyer,
          [IntakeStepStatus.NotifySeller],
          'Refinancing',
        ),
      ),
    ).toBe(IntakeFlow.BuyerLoan)
  })
})
