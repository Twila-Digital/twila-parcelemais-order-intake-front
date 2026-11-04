import { IntakeFlow } from '@/common/enums/intake-flow.enum'
import { IntakeParticipant } from '@/common/enums/intake-participant.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type { IntakeStartResponse } from '@/domain/intake.domain'

export function getIntakeFlow({
  participant,
  proposalType,
  dateAndStatus,
}: Pick<
  IntakeStartResponse,
  'participant' | 'proposalType' | 'dateAndStatus'
>) {
  if (participant === IntakeParticipant.Seller) return IntakeFlow.Seller
  if (proposalType === 'Financing') return IntakeFlow.BuyerFinancing
  if (proposalType === 'Refinancing') return IntakeFlow.BuyerLoan

  const hasNotifySeller = Boolean(
    dateAndStatus?.steps.some(
      (step) => step.status === IntakeStepStatus.NotifySeller,
    ),
  )
  return hasNotifySeller ? IntakeFlow.BuyerFinancing : IntakeFlow.BuyerLoan
}
