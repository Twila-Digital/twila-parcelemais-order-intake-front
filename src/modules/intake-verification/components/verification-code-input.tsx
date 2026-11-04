'use client'

import { OTPInput, REGEXP_ONLY_DIGITS } from 'input-otp'
import { useId } from 'react'
import { cn } from '@/common/lib/utils'
import { VERIFICATION_CODE_LENGTH } from '../constants/verification'

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

  return (
    <div className='flex flex-col gap-sm'>
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
        containerClassName='flex gap-xs has-disabled:opacity-50 tablet:gap-sm'
        render={({ slots }) => (
          <>
            {slots.map((slot, index) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: os slots têm posição fixa
                key={index}
                className={cn(
                  'flex h-12 min-w-0 flex-1 items-center justify-center rounded-xs border-[1.5px] border-gray-4 bg-white text-body-14 shadow-xs transition-colors',
                  slot.isActive && 'border-brand-primary-fg',
                  errorMessage && 'border-red-9',
                )}
              >
                {slot.char ?? <span className='text-gray-10'>0</span>}
              </div>
            ))}
          </>
        )}
      />
      {errorMessage && (
        <p id={errorId} className='text-body-12 text-red-11'>
          {errorMessage}
        </p>
      )}
    </div>
  )
}
