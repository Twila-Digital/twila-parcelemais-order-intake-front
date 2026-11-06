'use client'

import {
  faChevronDown,
  faChevronUp,
  faCircle,
  faCircleCheck,
  faCircleInfo,
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LinkButton } from '@twila-digital/components/link-button'
import { useId } from 'react'
import { useBoolean } from '@/common/hooks/use-boolean'
import { cn } from '@/common/lib/utils'
import { getIntakeProgressSteps } from '@/common/records/intake-progress-step.record'
import { formatBrazilianDateTime } from '@/common/utils/date'
import type { IntakeStep } from '@/domain/intake.domain'

type StepState = 'completed' | 'current' | 'pending'

const STEP_ICON = {
  completed: { icon: faCircleCheck, className: 'text-green-9' },
  current: { icon: faCircleInfo, className: 'text-brand-primary-fg' },
  pending: { icon: faCircle, className: 'text-gray-7' },
}

const STEP_STATE_LABEL = {
  completed: '(concluída)',
  current: '(etapa atual)',
  pending: '(pendente)',
}

function getStepState(
  step: IntakeStep,
  activeStatus: IntakeStep['status'] | null,
): StepState {
  if (step.status === activeStatus) return 'current'
  return step.isCompleted ? 'completed' : 'pending'
}

type IntakeStepsProgressProps = {
  steps: IntakeStep[]
  activeStatus: IntakeStep['status'] | null
  label?: string
}

export function IntakeStepsProgress({
  steps: allSteps,
  activeStatus,
  label,
}: IntakeStepsProgressProps) {
  const steps = getIntakeProgressSteps(allSteps)
  const listId = useId()
  const [isOpen, { toggle }] = useBoolean(false)
  const activeStep = steps.find((step) => step.status === activeStatus)
  const currentLabel =
    label ??
    activeStep?.description ??
    (activeStatus === null ? 'Pedido concluído' : 'Pedido')

  return (
    <div className='flex flex-col gap-lg'>
      <ol className='flex gap-sm' aria-label='Progresso do pedido'>
        {steps.map((step) => (
          <li
            key={step.status}
            aria-label={step.description}
            aria-current={step.status === activeStatus ? 'step' : undefined}
            className={cn(
              'h-1.5 flex-1 rounded-pill bg-gray-3',
              (step.isCompleted || step.status === activeStatus) &&
                'bg-brand-primary-fg',
            )}
          />
        ))}
      </ol>

      <div className='flex items-center justify-between text-body-14'>
        <span>{currentLabel}</span>
        <LinkButton
          type='button'
          variant='interactive'
          aria-expanded={isOpen}
          aria-controls={listId}
          onClick={toggle}
        >
          Ver etapas
          <span className='flex size-6 items-center justify-center'>
            <FontAwesomeIcon
              icon={isOpen ? faChevronUp : faChevronDown}
              className='text-body-12'
              aria-hidden
            />
          </span>
        </LinkButton>
      </div>

      {isOpen && (
        <ul
          id={listId}
          aria-label='Etapas do pedido'
          className='flex flex-col gap-sm'
        >
          {steps.map((step) => {
            const state = getStepState(step, activeStatus)
            const { icon, className } = STEP_ICON[state]
            const completedAt =
              state === 'completed'
                ? formatBrazilianDateTime(step.completedAt)
                : null

            return (
              <li
                key={step.status}
                className='flex items-center justify-between gap-md'
              >
                <span className='flex items-center gap-sm font-medium text-body-14 text-gray-12'>
                  <FontAwesomeIcon
                    icon={icon}
                    className={cn('shrink-0', className)}
                    aria-hidden
                  />
                  {step.description}
                  <span className='sr-only'>{STEP_STATE_LABEL[state]}</span>
                </span>
                {state === 'current' && (
                  <span className='whitespace-nowrap font-bold text-body-12 text-gray-11'>
                    Você está aqui!
                  </span>
                )}
                {completedAt && (
                  <span className='whitespace-nowrap text-body-12 text-gray-11'>
                    {completedAt}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
