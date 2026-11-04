import { faCoins } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@twila-digital/components/responsive-dialog'
import { formatter } from '@/common/utils/formatter'
import type { IntakeNewCondition } from '@/domain/intake.domain'

type CetDetailsDialogProps = {
  condition: IntakeNewCondition
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CetDetailsDialog({
  condition,
  open,
  onOpenChange,
}: CetDetailsDialogProps) {
  const { formatCurrencyBRL, formatPercent } = formatter
  const details = [
    ['Tarifa de cadastro', formatCurrencyBRL(condition.tacAmount)],
    ['Registro de contrato', formatCurrencyBRL(condition.registerAmount)],
    ['IOF', formatCurrencyBRL(condition.iofAmount)],
    ['Taxa de juros ao mês', formatPercent(condition.monthlyInterestRate)],
    ['CET anual', formatPercent(condition.annualCet)],
    ['CET mensal', formatPercent(condition.monthlyCet)],
    ['Valor da parcela', formatCurrencyBRL(condition.installments.value)],
  ]

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader
          icon={
            <FontAwesomeIcon
              icon={faCoins}
              className='size-4 [--fa-width:1em]'
            />
          }
        />
        <ResponsiveDialogBody className='flex flex-col gap-md'>
          <ResponsiveDialogTitle>
            Custo efetivo total (CET)
          </ResponsiveDialogTitle>
          <dl className='flex flex-col divide-y divide-gray-4 text-body-14'>
            {details.map(([term, value]) => (
              <div
                key={term}
                className='flex items-center justify-between gap-md py-xs first:pt-0 last:pb-0'
              >
                <dt className='text-gray-11'>{term}</dt>
                <dd className='whitespace-nowrap font-medium text-gray-12'>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </ResponsiveDialogBody>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
