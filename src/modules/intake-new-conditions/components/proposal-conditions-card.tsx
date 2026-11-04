import { Badge, type BadgeProps } from '@twila-digital/components/badge'
import { formatBrazilianDate } from '@/common/utils/date'
import { formatter } from '@/common/utils/formatter'
import type { IntakeProposalSummary } from '@/domain/intake.domain'

export type ProposalConditionsValues = Pick<
  IntakeProposalSummary,
  'vehicleValue' | 'downPaymentValue' | 'financedValue' | 'installments'
>

type ProposalConditionsCardProps = {
  label: string
  color: BadgeProps['color']
  date: string | null
  vehicleModel: string | null
  vehicleVersion: string | null
  values: ProposalConditionsValues
}

export function ProposalConditionsCard({
  label,
  color,
  date,
  vehicleModel,
  vehicleVersion,
  values,
}: ProposalConditionsCardProps) {
  const { formatCurrencyBRL } = formatter
  const formattedDate = formatBrazilianDate(date)
  const details = [
    ['Valor da entrada', formatCurrencyBRL(values.downPaymentValue)],
    ['Valor financiado', formatCurrencyBRL(values.financedValue)],
    [
      'Parcelas',
      `${values.installments.count}x de ${formatCurrencyBRL(values.installments.value)}`,
    ],
  ]

  return (
    <section
      aria-label={label}
      className='flex flex-col gap-xl rounded-md border border-gray-8 bg-white p-lg'
    >
      <div className='flex items-center justify-between gap-md'>
        <Badge color={color} size='md'>
          {label}
        </Badge>
        {formattedDate && (
          <p className='whitespace-nowrap text-body-12 text-gray-11'>
            {formattedDate}
          </p>
        )}
      </div>

      <div className='flex items-start gap-xs text-body-14'>
        <div className='flex flex-1 flex-col gap-xs'>
          {vehicleModel && (
            <p className='font-medium text-gray-12'>{vehicleModel}</p>
          )}
          {vehicleVersion && (
            <p className='text-body-12 text-gray-11'>{vehicleVersion}</p>
          )}
        </div>
        <p className='whitespace-nowrap font-medium text-gray-12'>
          {formatCurrencyBRL(values.vehicleValue)}
        </p>
      </div>

      <dl className='flex flex-col divide-y divide-gray-4 text-body-14 text-gray-11'>
        {details.map(([term, value]) => (
          <div
            key={term}
            className='flex items-start justify-between gap-md py-xs first:pt-0 last:pb-0'
          >
            <dt className='font-semibold'>{term}</dt>
            <dd className='whitespace-nowrap'>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
