import type { IntakeOrderSummary, IntakeStep } from '@/domain/intake.domain'
import { IntakeOrderCard } from './intake-order-card'
import { IntakeStepsProgress } from './intake-steps-progress'

type IntakeProgressHeaderProps = {
  steps: IntakeStep[]
  activeStatus: IntakeStep['status'] | null
  label?: string
  summary?: IntakeOrderSummary | null
}

export function IntakeProgressHeader({
  summary,
  ...progress
}: IntakeProgressHeaderProps) {
  return (
    <div className='mb-8 flex flex-col gap-md'>
      <IntakeStepsProgress {...progress} />
      {summary && <IntakeOrderCard summary={summary} />}
    </div>
  )
}
