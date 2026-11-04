import {
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCircleXmark,
} from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ReactNode } from 'react'
import { tv } from '@/common/lib/tailwind-variants'

const statusScreen = tv({
  slots: {
    ring: 'relative flex size-16 shrink-0 items-center justify-center rounded-pill',
    ringInner: 'absolute inset-2 rounded-pill bg-white/30',
  },
  variants: {
    tone: {
      success: { ring: 'bg-green-8' },
      info: { ring: 'bg-blue-9' },
      warning: { ring: 'bg-yellow-9' },
      danger: { ring: 'bg-red-9' },
    },
  },
  defaultVariants: { tone: 'success' },
})

const TONE_ICONS = {
  success: faCircleCheck,
  info: faCircleInfo,
  warning: faCircleExclamation,
  danger: faCircleXmark,
}

type StatusScreenProps = {
  title: string
  description: ReactNode
  tone?: keyof typeof TONE_ICONS
  header?: ReactNode
  action?: ReactNode
  children?: ReactNode
}

export function StatusScreen({
  title,
  description,
  tone = 'success',
  header,
  action,
  children,
}: StatusScreenProps) {
  const styles = statusScreen({ tone })

  return (
    <section className='flex flex-1 flex-col'>
      {header}

      <div className='flex flex-1 flex-col items-center justify-center gap-xxl py-8 text-center'>
        <span className={styles.ring()} aria-hidden>
          <span className={styles.ringInner()} />
          <FontAwesomeIcon
            icon={TONE_ICONS[tone]}
            className='relative text-2xl text-white'
          />
        </span>
        <div className='flex flex-col gap-md'>
          <h1 className='font-heading font-medium tablet:text-h4 text-h5 leading-[1.4]'>
            {title}
          </h1>
          <p className='tablet:text-body-16 text-body-14 text-gray-11'>
            {description}
          </p>
        </div>
        {children && (
          <div className='flex w-full max-w-[786px] flex-col gap-xxl text-left'>
            {children}
          </div>
        )}
      </div>

      {action}
    </section>
  )
}
