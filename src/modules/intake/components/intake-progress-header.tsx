import type { IntakeProposalSummary, IntakeStep } from '@/domain/intake.domain'
import { IntakeProposalCard } from './intake-proposal-card'
import { IntakeStepsProgress } from './intake-steps-progress'

type IntakeProgressHeaderProps = {
  steps: IntakeStep[]
  activeStatus: IntakeStep['status'] | null
  label?: string
  summary?: IntakeProposalSummary | null
}

export function IntakeProgressHeader({
  summary,
  ...progress
}: IntakeProgressHeaderProps) {
  return (
    <div className='mb-8 flex flex-col gap-md'>
      <IntakeStepsProgress {...progress} />
      {summary && <IntakeProposalCard summary={summary} />}
    </div>
  )
}
