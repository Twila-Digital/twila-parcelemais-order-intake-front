'use client'

import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'
import { useId } from 'react'
import { tv } from '@/common/lib/tailwind-variants'
import { VERIFICATION_CODE_LENGTH } from '../constants/verification'

const codeSlot = tv({
  slots: {
    box: 'flex h-12 min-w-0 flex-1 items-center justify-center rounded-field bg-gray-1 font-medium text-body-14 text-gray-11 shadow-xs ring-[1.5px] ring-gray-4 ring-inset transition-colors group-hover:ring-brand-primary-7',
    placeholder: 'font-normal text-gray-10',
  },
  variants: {
    active: { true: { box: 'shadow-none ring-3 ring-brand-primary-7' } },
    error: {
      true: {
        box: 'bg-red-3 text-red-9 ring-red-8 group-hover:ring-red-8',
        placeholder: 'text-red-9',
      },
    },
    disabled: {
      true: {
        box: 'cursor-not-allowed bg-gray-2 text-gray-10 shadow-none ring-gray-4 group-hover:ring-gray-4',
        placeholder: 'text-gray-10',
      },
    },
  },
  compoundVariants: [
    { active: true, error: true, class: { box: 'ring-red-8' } },
  ],
})

type VerificationCodeInputProps = {
  value: string
  onChange: (value: string) => void
  errorMessage?: string
  disabled?: boolean
}

export function VerificationCodeInput({
  value,
  onChange,
  errorMessage,
  disabled,
}: VerificationCodeInputProps) {
  const errorId = useId()
  const hasError = Boolean(errorMessage) && !disabled

  return (
    <div className='flex flex-col gap-1.5'>
      <OTPInput
        value={value}
        onChange={onChange}
        maxLength={VERIFICATION_CODE_LENGTH}
        pattern={REGEXP_ONLY_DIGITS}
        inputMode='numeric'
        autoComplete='one-time-code'
        aria-label='Código de verificação'
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? errorId : undefined}
        disabled={disabled}
        containerClassName='group flex gap-xs tablet:gap-sm'
        render={({ slots }) => (
          <>
            {slots.map((slot, index) => {
              const styles = codeSlot({
                active: slot.isActive && !disabled,
                error: hasError,
                disabled,
              })
              return (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: os slots têm posição fixa
                  key={index}
                  className={styles.box()}
                >
                  {slot.char ?? <span className={styles.placeholder()}>0</span>}
                </div>
              )
            })}
          </>
        )}
      />
      {errorMessage && (
        <p id={errorId} className='text-body-14 text-red-9'>
          {errorMessage}
        </p>
      )}
    </div>
  )
}
