'use client'

import { faChevronDown, faChevronUp } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Fragment, useId } from 'react'
import { useBoolean } from '@/common/hooks/use-boolean'
import { formatter } from '@/common/utils/formatter'
import type { IntakeOrderSummary } from '@/domain/intake.domain'

type IntakeOrderCardProps = {
  summary: IntakeOrderSummary
}

export function IntakeOrderCard({ summary }: IntakeOrderCardProps) {
  const detailsId = useId()
  const [isOpen, { toggle }] = useBoolean(false)
  const { formatCurrencyBRL } = formatter
  const { installments } = summary

  const details = [
    ['Valor do pedido', formatCurrencyBRL(summary.orderAmount)],
    ...(installments
      ? [
          [
            'Parcelas',
            `${installments.count}x de ${formatCurrencyBRL(installments.value)}`,
          ],
        ]
      : []),
  ]

  return (
    <section
      aria-label='Resumo do pedido'
      className='flex flex-col gap-lg rounded-sm border border-gray-3 bg-white p-md'
    >
      <div className='flex items-center gap-sm'>
        <div className='flex flex-1 flex-col gap-xs'>
          <p className='font-semibold text-body-16'>
            Pedido #{summary.orderNumber}
          </p>
          {summary.establishmentName && (
            <p className='text-body-14 text-gray-11'>
              {summary.establishmentName}
            </p>
          )}
        </div>
        <button
          type='button'
          aria-expanded={isOpen}
          aria-controls={detailsId}
          aria-label={
            isOpen ? 'Ocultar valores do pedido' : 'Ver valores do pedido'
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
