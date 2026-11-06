'use client'

import { faChevronRight } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { toast } from '@twila-digital/components/alert'
import { Button } from '@twila-digital/components/button'
import { LinkButton } from '@twila-digital/components/link-button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { PageTitle } from '@/common/components/page-title'
import { IntakeErrorType } from '@/common/enums/intake-error-type.enum'
import { useCountdown } from '@/common/hooks/use-countdown'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { useForm } from '@/common/hooks/use-form'
import { formatCountdown } from '@/common/utils/format-countdown'
import { CLOSED_LINK_STATUSES, HTTP_STATUS } from '@/constants/http-status'
import { ILLUSTRATIONS } from '@/constants/illustrations'
import type { IntakeVerificationChannel } from '@/domain/intake.domain'
import { useIntakeLoading } from '@/modules/intake/hooks/use-intake-loading'
import {
  type ApiErrorFieldMap,
  handleApiError,
  showErrorToast,
} from '@/services/api-error-handler'
import { ApiError, hasApiErrorStatus } from '@/services/error'
import {
  useSendIntakeTokenMutation,
  useVerifyIntakeTokenMutation,
} from '@/services/http/intake/use-intake-service'
import { VerificationChannelCard } from './components/verification-channel-card'
import { VerificationCodeInput } from './components/verification-code-input'
import {
  CODE_RESENT_TOAST,
  ORDER_NOT_FOUND_TOAST,
  RESEND_CODE_INTERVAL_IN_SECONDS,
  VERIFICATION_CHANNELS,
} from './constants/verification'
import { type CodeFormData, codeSchema } from './schemas/code.schema'

type Stage = 'channel' | 'code'

const CODE_FIELD_ERRORS: ApiErrorFieldMap<CodeFormData> = {
  'Intake.CodeIsRequired': 'code',
  'Intake.CodeInvalid': 'code',
  'Intake.InvalidOtp': 'code',
}

type IntakeVerificationProps = {
  token: string
}

export function IntakeVerification({ token }: IntakeVerificationProps) {
  const router = useRouter()
  const { showLoading } = useIntakeLoading()
  const fieldSize = useFieldSize()
  const [stage, setStage] = useState<Stage>('channel')
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [channel, setChannel] = useState<IntakeVerificationChannel | null>(null)
  const countdown = useCountdown()
  const sendToken = useSendIntakeTokenMutation(token)
  const verifyToken = useVerifyIntakeTokenMutation(token)

  const codeForm = useForm<CodeFormData>({
    schema: codeSchema,
    defaultValues: { code: '' },
    mode: 'onSubmit',
  })

  function handleLinkUnavailable(error: unknown) {
    const isUnavailable = hasApiErrorStatus(error, CLOSED_LINK_STATUSES)
    if (isUnavailable) router.refresh()
    return isUnavailable
  }

  function handleOrderNotFound(error: unknown) {
    const isNotFound =
      error instanceof ApiError && error.type === IntakeErrorType.InviteNotFound
    if (isNotFound) {
      toast.error({
        ...ORDER_NOT_FOUND_TOAST,
        orientation: 'vertical',
        closable: true,
      })
    }
    return isNotFound
  }

  async function requestCode(nextChannel: IntakeVerificationChannel) {
    const previousChannel = channel
    const isResend = stage === 'code'
    setChannel(nextChannel)
    try {
      await sendToken.mutateAsync({ channel: nextChannel })
      if (nextChannel !== previousChannel) codeForm.reset()
      setStage('code')
      countdown.start(RESEND_CODE_INTERVAL_IN_SECONDS)
      if (isResend) {
        toast.success({
          ...CODE_RESENT_TOAST,
          orientation: 'vertical',
          closable: true,
        })
      }
    } catch (error) {
      if (handleOrderNotFound(error)) {
        setChannel(previousChannel)
        return
      }
      if (handleLinkUnavailable(error)) return

      if (
        error instanceof ApiError &&
        error.status === HTTP_STATUS.TOO_MANY_REQUESTS
      ) {
        setStage('code')
        countdown.start(
          error.retryAfterSeconds ?? RESEND_CODE_INTERVAL_IN_SECONDS,
        )
        showErrorToast('Aguarde para pedir um novo código.')
        return
      }

      setChannel(previousChannel)
      handleApiError(error)
    }
  }

  async function submitCode({ code }: CodeFormData) {
    try {
      await verifyToken.mutateAsync({ code })
      setIsRedirecting(true)
      showLoading()
      router.refresh()
    } catch (error) {
      if (handleOrderNotFound(error) || handleLinkUnavailable(error)) return

      handleApiError(error, {
        setError: codeForm.setError,
        fieldMap: CODE_FIELD_ERRORS,
      })
    }
  }

  const isCodeStage = stage === 'code'
  const isChannelLocked =
    countdown.isRunning || sendToken.isPending || verifyToken.isPending

  return (
    <form
      onSubmit={codeForm.handleSubmit(submitCode)}
      noValidate
      className='flex flex-1 flex-col gap-8'
    >
      <div className='flex flex-col gap-lg tablet:gap-10'>
        <PageTitle
          title='Confirme que é você'
          description='Para proteger seus dados, vamos enviar um código para o seu celular. Como prefere receber?'
          illustration={ILLUSTRATIONS.phone}
        />

        <fieldset className='grid min-w-0 tablet:grid-cols-2 gap-md tablet:gap-lg'>
          <legend className='sr-only'>Como receber o código</legend>
          {VERIFICATION_CHANNELS.map((option) => (
            <VerificationChannelCard
              key={option.value}
              label={option.label}
              icon={option.icon}
              selected={channel === option.value}
              loading={sendToken.isPending && channel === option.value}
              muted={sendToken.isPending && channel !== option.value}
              disabled={isChannelLocked}
              onClick={() => requestCode(option.value)}
            />
          ))}
        </fieldset>

        {isCodeStage && (
          <section className='flex flex-col gap-lg' aria-live='polite'>
            <div className='flex flex-col gap-sm'>
              <h2 className='font-medium text-body-18'>Digite o código</h2>
              <p className='tablet:text-body-16 text-body-14 text-gray-11'>
                Enviamos um código de 6 dígitos para o seu celular.
              </p>
            </div>

            <div className='flex flex-col gap-md'>
              <Controller
                control={codeForm.control}
                name='code'
                render={({ field, fieldState }) => (
                  <VerificationCodeInput
                    value={field.value}
                    onChange={field.onChange}
                    errorMessage={fieldState.error?.message}
                    disabled={verifyToken.isPending}
                  />
                )}
              />

              <div className='flex items-center justify-between text-body-14 text-gray-11'>
                <span>
                  {countdown.isRunning && (
                    <>
                      Novo código em{' '}
                      <strong className='font-bold text-brand-primary-fg'>
                        {formatCountdown(countdown.secondsLeft)}
                      </strong>
                    </>
                  )}
                </span>
                <LinkButton
                  type='button'
                  variant='interactive'
                  disabled={!channel || isChannelLocked}
                  onClick={() => channel && requestCode(channel)}
                >
                  Reenviar código
                  <span className='flex size-6 items-center justify-center'>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      className='text-body-12'
                      aria-hidden
                    />
                  </span>
                </LinkButton>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* TODO: drop variant='secondary' once the DS maps the Parcele+ primary button to brand-primary */}
      <Button
        type='submit'
        variant='secondary'
        size={fieldSize}
        fullWidth
        className='mt-auto'
        disabled={!isCodeStage}
        loading={verifyToken.isPending || isRedirecting}
      >
        Confirmar código
      </Button>
    </form>
  )
}
