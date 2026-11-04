import { IntakeNewConditionStatus } from '@/common/enums/intake-new-condition-status.enum'
import type { IntakeNewCondition } from '@/domain/intake.domain'

export type NewConditionsState =
  | { kind: 'pending'; conditions: IntakeNewCondition[] }
  | { kind: 'accepted' }
  | { kind: 'refused' }
  | { kind: 'empty' }

export function getNewConditionsState(
  conditions: IntakeNewCondition[],
): NewConditionsState {
  const pending = conditions
    .filter(
      (condition) =>
        condition.status === IntakeNewConditionStatus.InNegotiation,
    )
    .sort((a, b) => a.installments.count - b.installments.count)
  if (pending.length > 0) return { kind: 'pending', conditions: pending }

  const latest = conditions.at(-1)?.status
  if (latest === IntakeNewConditionStatus.Accepted) return { kind: 'accepted' }
  if (latest === IntakeNewConditionStatus.Refused) return { kind: 'refused' }
  return { kind: 'empty' }
}
