import { Badge } from '@twila-digital/components/badge'
import { formatBrazilianDate } from '@/common/utils/date'
import { formatter } from '@/common/utils/formatter'
import type { IntakeProposalSummary } from '@/domain/intake.domain'

type SellerProposalDetailsProps = {
  summary: IntakeProposalSummary
}

export function SellerProposalDetails({ summary }: SellerProposalDetailsProps) {
  const { formatCurrencyBRL } = formatter
  const createdAt = formatBrazilianDate(summary.createdAt)
  const details = [
    ['Valor da entrada', formatCurrencyBRL(summary.downPaymentValue)],
    ['Valor financiado', formatCurrencyBRL(summary.financedValue)],
    [
      'Parcelas',
      `${summary.installments.count}x de ${formatCurrencyBRL(summary.installments.value)}`,
    ],
  ]

  return (
    <section
      aria-label='Dados da proposta'
      className='flex flex-col gap-lg tablet:gap-xl rounded-md bg-white p-md tablet:p-xl'
    >
      <div className='flex items-center justify-between gap-md'>
        <Badge color='gray' size='md'>
          Proposta {summary.proposalNumber}
        </Badge>
        {createdAt && (
          <p className='whitespace-nowrap text-body-12 text-gray-9'>
            {createdAt}
          </p>
        )}
      </div>

      <div className='flex flex-col gap-sm'>
        <div className='flex items-start justify-between gap-md font-medium tablet:text-body-18 text-body-16 text-gray-12'>
          <p>{summary.vehicleModel ?? summary.vehicleDescription}</p>
          <p className='whitespace-nowrap'>
            {formatCurrencyBRL(summary.vehicleValue)}
          </p>
        </div>
        {summary.vehicleVersion && (
          <p className='tablet:text-body-16 text-body-14 text-gray-11'>
            {summary.vehicleVersion}
          </p>
        )}
      </div>

      <hr className='border-gray-4' />

      <dl className='flex flex-col gap-md tablet:text-body-16 text-body-14 text-gray-11'>
        {details.map(([label, value]) => (
          <div key={label} className='flex items-start justify-between gap-md'>
            <dt className='font-medium'>{label}</dt>
            <dd className='whitespace-nowrap'>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
