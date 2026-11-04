'use client'

import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Fragment, useId } from 'react'
import { useBoolean } from '@/common/hooks/use-boolean'
import { formatBrazilianDate } from '@/common/utils/date'
import { formatter } from '@/common/utils/formatter'
import type { IntakeProposalSummary } from '@/domain/intake.domain'

type IntakeProposalCardProps = {
  summary: IntakeProposalSummary
}

export function IntakeProposalCard({ summary }: IntakeProposalCardProps) {
  const detailsId = useId()
  const [isOpen, { toggle }] = useBoolean(false)
  const { formatCurrencyBRL } = formatter
  const createdAt = formatBrazilianDate(summary.createdAt)

  const details = [
    ['Valor do veículo', formatCurrencyBRL(summary.vehicleValue)],
    ['Valor da entrada', formatCurrencyBRL(summary.downPaymentValue)],
    ['Valor financiado', formatCurrencyBRL(summary.financedValue)],
    [
      'Parcelas',
      `${summary.installments.count}x de ${formatCurrencyBRL(summary.installments.value)}`,
    ],
  ]

  return (
    <section
      aria-label='Resumo da proposta'
      className='flex flex-col gap-lg rounded-sm border border-gray-3 bg-white p-md'
    >
      <div className='flex items-center gap-sm'>
        <div className='flex flex-1 flex-col gap-xs'>
          <div className='flex items-center justify-between gap-sm'>
            <p className='font-semibold tablet:font-medium tablet:text-body-16 text-body-14'>
              Proposta {summary.proposalNumber}
            </p>
            {createdAt && (
              <p className='whitespace-nowrap text-body-12 text-gray-9'>
                {createdAt}
              </p>
            )}
          </div>
          <p className='tablet:text-body-14 text-body-12 text-gray-11'>
            {summary.vehicleDescription}
          </p>
        </div>
        <button
          type='button'
          aria-expanded={isOpen}
          aria-controls={detailsId}
          aria-label={
            isOpen ? 'Ocultar valores da proposta' : 'Ver valores da proposta'
          }
          onClick={toggle}
          className='flex size-8 shrink-0 cursor-pointer items-center justify-center text-body-14 text-gray-11'
        >
          <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
        </button>
      </div>

      {isOpen && (
        <dl
          id={detailsId}
          className='flex flex-col gap-sm tablet:gap-md text-body-14 text-gray-11'
        >
          {details.map(([label, value], index) => (
            <Fragment key={label}>
              {index > 0 && <hr className='border-gray-4' />}
              <div className='flex items-start justify-between gap-sm'>
                <dt className='font-semibold'>{label}</dt>
                <dd>{value}</dd>
              </div>
            </Fragment>
          ))}
        </dl>
      )}
    </section>
  )
}
