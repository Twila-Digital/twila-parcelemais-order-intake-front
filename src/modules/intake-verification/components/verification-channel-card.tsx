import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { tv } from '@/common/lib/tailwind-variants'

const card = tv({
  slots: {
    base: 'flex w-full flex-col items-center gap-md rounded-md border border-gray-8 bg-gray-1 p-xxl text-center text-gray-11 transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary-fg focus-visible:outline-offset-2 enabled:cursor-pointer enabled:hover:bg-brand-primary-1 disabled:cursor-not-allowed',
    icon: 'flex h-9 items-center text-[24px]',
    label: 'font-medium text-body-16',
  },
  variants: {
    selected: {
      true: {
        base: 'border-[1.5px] border-brand-primary-fg bg-brand-primary-1',
        icon: 'text-brand-primary-fg',
        label: 'text-gray-12',
      },
    },
    loading: { true: { base: 'cursor-wait' } },
    muted: { true: { base: 'opacity-60' } },
  },
})

type VerificationChannelCardProps = {
  label: string
  icon: IconDefinition
  selected: boolean
  loading?: boolean
  muted?: boolean
  disabled?: boolean
  onClick: () => void
}

export function VerificationChannelCard({
  label,
  icon,
  selected,
  loading = false,
  muted = false,
  disabled = false,
  onClick,
}: VerificationChannelCardProps) {
  const styles = card({ selected, loading, muted })

  return (
    <button
      type='button'
      aria-pressed={selected}
      aria-busy={loading}
      disabled={disabled}
      onClick={onClick}
      className={styles.base()}
    >
      <span className={styles.icon()}>
        <FontAwesomeIcon icon={icon} aria-hidden />
      </span>
      <span className={styles.label()}>{label}</span>
    </button>
  )
}
