'use client'

import { Button } from '@twila-digital/components/button'
import { useState } from 'react'
import { StatusScreen } from '@/common/components/status-screen'
import { IntakeErrorType } from '@/common/enums/intake-error-type.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { intakeStepApiPathRecord } from '@/common/records/intake-step-api-path.record'
import { ILLUSTRATIONS } from '@/constants/illustrations'
import type {
  IntakeDecideSellerRequest,
  IntakeProposalSummary,
} from '@/domain/intake.domain'
import { IntakeStepLayout } from '@/modules/intake/components/intake-step-layout'
import { useAdvanceIntakeStep } from '@/modules/intake/hooks/use-advance-intake-step'
import type { IntakeStepScreenProps } from '@/modules/intake/types/intake-step-screen'
import { handleApiError } from '@/services/api-error-handler'
import { ApiError } from '@/services/error'
import { useSubmitIntakeStepMutation } from '@/services/http/intake/use-intake-service'
import { SellerProposalDetails } from './components/seller-proposal-details'

const STEP_PATH = intakeStepApiPathRecord[IntakeStepStatus.DecisionSeller]

type Answer = 'declined' | 'already-decided'

export function IntakeSellerDecision({
  token,
  data: summary,
}: IntakeStepScreenProps<IntakeProposalSummary | null>) {
  const fieldSize = useFieldSize()
  const [answer, setAnswer] = useState<Answer>()
  const [pending, setPending] = useState<boolean>()
  const submit = useSubmitIntakeStepMutation<IntakeDecideSellerRequest>(
    token,
    STEP_PATH,
  )
  const { advance } = useAdvanceIntakeStep(
    token,
    IntakeStepStatus.DecisionSeller,
  )

  async function respond(isAccepted: boolean) {
    setPending(isAccepted)
    try {
      await submit.mutateAsync({ isAccepted })
      if (!isAccepted) {
        setAnswer('declined')
        return
      }
      await advance()
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.type === IntakeErrorType.SellerAlreadyDecided
      ) {
        setAnswer('already-decided')
        return
      }
      handleApiError(error)
    } finally {
      setPending(undefined)
    }
  }

  if (answer === 'declined') {
    return (
      <StatusScreen
        tone='info'
        title='Tudo certo!'
        description='Como você informou que não é o vendedor responsável por este veículo, nenhuma alteração foi realizada na proposta.'
      />
    )
  }

  if (answer === 'already-decided') {
    return (
      <StatusScreen
        tone='info'
        title='Sua decisão já foi registrada'
        description='Você já respondeu se é o vendedor deste veículo. Volte para o WhatsApp para acompanhar a proposta.'
      />
    )
  }

  return (
    <IntakeStepLayout
      title='Você é o vendedor deste veículo?'
      description={
        summary
          ? 'Confira os dados da proposta abaixo e confirme se você é o vendedor responsável por este veículo.'
          : 'Confirme se você é o vendedor responsável por este veículo.'
      }
      illustration={ILLUSTRATIONS.sellerConfirmation}
      largeDescription
      action={
        <div className='flex flex-col gap-sm'>
          <Button
            type='button'
            size={fieldSize}
            fullWidth
            loading={pending === true}
            disabled={pending !== undefined}
            onClick={() => respond(true)}
          >
            Sim, sou o vendedor
          </Button>
          <Button
            type='button'
            variant='tertiary'
            size={fieldSize}
            fullWidth
            loading={pending === false}
            disabled={pending !== undefined}
            onClick={() => respond(false)}
          >
            Não sou o vendedor
          </Button>
        </div>
      }
    >
      {summary && <SellerProposalDetails summary={summary} />}
    </IntakeStepLayout>
  )
}
