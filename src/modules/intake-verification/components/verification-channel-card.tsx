import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { tv } from '@/common/lib/tailwind-variants'

const card = tv({
  slots: {
    base: 'flex w-full flex-col items-center gap-md rounded-md border border-gray-8 bg-gray-1 p-xxl text-center text-gray-11 transition-colors focus-visible:outline-2 focus-visible:outline-brand-secondary-9 focus-visible:outline-offset-2 enabled:cursor-pointer enabled:hover:border-brand-secondary-9 disabled:cursor-not-allowed',
    icon: 'text-[24px]',
    label: 'font-medium text-body-16',
  },
  variants: {
    selected: {
      true: {
        base: 'border-brand-secondary-9 bg-brand-secondary-2',
        icon: 'text-brand-secondary-9',
        label: 'text-gray-12',
      },
      false: { base: 'disabled:opacity-60' },
    },
    loading: { true: { base: 'cursor-wait' } },
  },
})

type VerificationChannelCardProps = {
  label: string
  icon: IconDefinition
  selected: boolean
  loading?: boolean
  disabled?: boolean
  onClick: () => void
}

export function VerificationChannelCard({
  label,
  icon,
  selected,
  loading = false,
  disabled = false,
  onClick,
}: VerificationChannelCardProps) {
  const styles = card({ selected, loading })

  return (
    <button
      type='button'
      aria-pressed={selected}
      aria-busy={loading}
      disabled={disabled}
      onClick={onClick}
      className={styles.base()}
    >
      <FontAwesomeIcon icon={icon} className={styles.icon()} aria-hidden />
      <span className={styles.label()}>{label}</span>
    </button>
  )
}
