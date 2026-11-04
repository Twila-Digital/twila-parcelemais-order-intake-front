'use client'

import { toast } from '@twila-digital/components/alert'
import { Button } from '@twila-digital/components/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { IntakeErrorType } from '@/common/enums/intake-error-type.enum'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { HTTP_STATUS } from '@/constants/http-status'
import { ILLUSTRATIONS } from '@/constants/illustrations'
import type {
  IntakeNewCondition,
  IntakeProposalSummary,
} from '@/domain/intake.domain'
import { IntakeStepLayout } from '@/modules/intake/components/intake-step-layout'
import { handleApiError } from '@/services/api-error-handler'
import { ApiError } from '@/services/error'
import { useDecideCounterProposalMutation } from '@/services/http/intake/use-intake-service'
import { CetDetailsDialog } from './components/cet-details-dialog'
import { InstallmentHighlight } from './components/installment-highlight'
import {
  NewConditionsAccepted,
  NewConditionsRefused,
} from './components/new-conditions-result'
import { ProposalConditionsCard } from './components/proposal-conditions-card'
import { TermSelector } from './components/term-selector'

const STALE_DECISION_ERRORS = new Set<string>([
  IntakeErrorType.ProposalNotInNegotiation,
  IntakeErrorType.CounterProposalAlreadyDecided,
  IntakeErrorType.CounterProposalNotFound,
])

type Decision = 'accepted' | 'refused'

type IntakeNewConditionsProps = {
  token: string
  summary: IntakeProposalSummary | null
  conditions: IntakeNewCondition[]
}

export function IntakeNewConditions({
  token,
  summary,
  conditions,
}: IntakeNewConditionsProps) {
  const router = useRouter()
  const fieldSize = useFieldSize()
  const decide = useDecideCounterProposalMutation(token)
  const [selectedId, setSelectedId] = useState(conditions[0].simulationId)
  const [pending, setPending] = useState<Decision>()
  const [decision, setDecision] = useState<Decision>()
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const selected =
    conditions.find((condition) => condition.simulationId === selectedId) ??
    conditions[0]

  function handleDecisionError(error: unknown) {
    const isStale =
      error instanceof ApiError && STALE_DECISION_ERRORS.has(error.type ?? '')
    const isClosed =
      error instanceof ApiError && error.status === HTTP_STATUS.GONE

    if (isStale && error.message) toast.warning({ title: error.message })
    if (!isStale && !isClosed) handleApiError(error)
    if (isStale || isClosed) router.refresh()
  }

  async function respond(isAccepted: boolean) {
    const result = isAccepted ? 'accepted' : 'refused'
    setPending(result)
    try {
      await decide.mutateAsync({
        simulationId: selected.simulationId,
        isAccepted,
      })
      setDecision(result)
    } catch (error) {
      handleDecisionError(error)
    } finally {
      setPending(undefined)
    }
  }

  if (decision === 'accepted') return <NewConditionsAccepted />
  if (decision === 'refused') return <NewConditionsRefused />

  return (
    <IntakeStepLayout
      title='Novas condições de proposta'
      description='Identificamos uma atualização nas condições da proposta. Defina as novas parcelas para continuar com o processo.'
      illustration={ILLUSTRATIONS.newConditions}
      action={
        <div className='flex flex-col gap-sm'>
          <Button
            type='button'
            size={fieldSize}
            fullWidth
            loading={pending === 'accepted'}
            disabled={pending !== undefined}
            onClick={() => respond(true)}
          >
            Aceitar novas condições
          </Button>
          <Button
            type='button'
            variant='tertiary'
            size={fieldSize}
            fullWidth
            loading={pending === 'refused'}
            disabled={pending !== undefined}
            onClick={() => respond(false)}
          >
            Recusar novas condições
          </Button>
        </div>
      }
    >
      <div className='grid tablet:grid-cols-2 gap-lg'>
        {summary && (
          <ProposalConditionsCard
            label='Proposta enviada'
            color='blue'
            date={summary.createdAt}
            vehicleModel={summary.vehicleModel}
            vehicleVersion={summary.vehicleVersion}
            values={summary}
          />
        )}
        <ProposalConditionsCard
          label='Novas condições'
          color='green'
          date={selected.createdAt}
          vehicleModel={summary?.vehicleModel ?? null}
          vehicleVersion={summary?.vehicleVersion ?? null}
          values={selected}
        />
      </div>

      <div className='flex flex-col gap-lg'>
        {conditions.length > 1 && (
          <TermSelector
            conditions={conditions}
            value={selected.simulationId}
            onChange={setSelectedId}
          />
        )}
        <InstallmentHighlight
          count={selected.installments.count}
          value={selected.installments.value}
          onShowDetails={() => setIsDetailsOpen(true)}
        />
      </div>

      <CetDetailsDialog
        condition={selected}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </IntakeStepLayout>
  )
}
