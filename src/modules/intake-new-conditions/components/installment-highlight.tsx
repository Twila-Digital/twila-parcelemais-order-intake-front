import { faChevronRight } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LinkButton } from '@twila-digital/components/link-button'
import { formatter } from '@/common/utils/formatter'

type InstallmentHighlightProps = {
  count: number
  value: number
  onShowDetails: () => void
}

export function InstallmentHighlight({
  count,
  value,
  onShowDetails,
}: InstallmentHighlightProps) {
  const amount = formatter.formatCurrencyBRL(value).replace(/^R\$\s?/, '')

  return (
    <div className='flex flex-col items-center gap-sm rounded-md border-2 border-brand-primary-7 bg-brand-primary-fg px-md py-lg'>
      <p className='flex flex-wrap items-baseline justify-center gap-sm text-white'>
        <span className='flex items-baseline gap-xs'>
          <span className='text-body-18'>R$</span>
          <span className='font-bold font-heading text-h4 leading-[1.2]'>
            {amount}
          </span>
        </span>
        <span className='font-medium text-body-14 text-gray-3'>
          ({count} parcelas)
        </span>
      </p>
      <LinkButton type='button' variant='yellow' onClick={onShowDetails}>
        Detalhes das parcelas
        <span className='flex size-6 items-center justify-center'>
          <FontAwesomeIcon
            icon={faChevronRight}
            className='text-body-12'
            aria-hidden
          />
        </span>
      </LinkButton>
    </div>
  )
}
