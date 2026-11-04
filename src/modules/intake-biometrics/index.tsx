'use client'

import { Alert } from '@twila-digital/components/alert'
import { Button } from '@twila-digital/components/button'
import { useEffect, useRef, useState } from 'react'
import { StatusScreen } from '@/common/components/status-screen'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { intakeStepApiPathRecord } from '@/common/records/intake-step-api-path.record'
import { ILLUSTRATIONS } from '@/constants/illustrations'
import { ONE_SECOND_IN_MILLISECONDS } from '@/constants/times'
import type { IntakeBiometryStepData } from '@/domain/intake.domain'
import { IntakeStepLayout } from '@/modules/intake/components/intake-step-layout'
import { useAdvanceIntakeStep } from '@/modules/intake/hooks/use-advance-intake-step'
import { useIntakeRealtime } from '@/modules/intake/hooks/use-intake-realtime'
import type { IntakeStepScreenProps } from '@/modules/intake/types/intake-step-screen'
import { useIntakeStepDataQuery } from '@/services/http/intake/use-intake-service'

const STEP_PATH = intakeStepApiPathRecord[IntakeStepStatus.AnalyseBiometric]

const POLLING_INTERVAL_IN_MILLISECONDS = 5 * ONE_SECOND_IN_MILLISECONDS

const REPROVED_STATUS = 'reproved'

type IntakeBiometricsProps = IntakeStepScreenProps<IntakeBiometryStepData> & {
  title: string
  description: string
}

export function IntakeBiometrics({
  token,
  header,
  data,
  title,
  description,
}: IntakeBiometricsProps) {
  const fieldSize = useFieldSize()
  const [isStarted, setIsStarted] = useState(false)
  const { isConnected } = useIntakeRealtime()
  const query = useIntakeStepDataQuery(token, STEP_PATH, data, {
    refetchInterval: (current) =>
      isStarted && !isConnected && !current.state.data?.isCompleted
        ? POLLING_INTERVAL_IN_MILLISECONDS
        : false,
  })
  const biometry = query.data ?? data
  const { refetch } = query
  const isReproved =
    biometry.transactionStatus?.toLowerCase() === REPROVED_STATUS
  const { advance } = useAdvanceIntakeStep(
    token,
    IntakeStepStatus.AnalyseBiometric,
  )
  useEffect(() => {
    if (biometry.isCompleted) advance()
  }, [biometry.isCompleted, advance])

  const wasReprovedRef = useRef(isReproved)
  useEffect(() => {
    if (isReproved && !wasReprovedRef.current) setIsStarted(false)
    wasReprovedRef.current = isReproved
  }, [isReproved])

  useEffect(() => {
    if (!isStarted) return
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [isStarted])

  useEffect(() => {
    if (!isStarted) return
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') refetch()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [isStarted, refetch])

  if (biometry.isCompleted) {
    return <section className='flex flex-1 flex-col'>{header}</section>
  }

  if (!biometry.isAvailable) {
    return (
      <StatusScreen
        tone='info'
        header={header}
        title='Conclua as etapas anteriores'
        description='A biometria fica disponível depois das etapas anteriores. Volte para o WhatsApp para seguir com sua proposta.'
      />
    )
  }

  if (!biometry.sessionUrl) {
    return (
      <StatusScreen
        tone='warning'
        header={header}
        title='Não foi possível abrir a biometria'
        description='Tente novamente em alguns instantes ou volte para o WhatsApp.'
      />
    )
  }

  if (isStarted) {
    return (
      <div className='fixed inset-0 z-50 bg-gray-1'>
        <iframe
          src={biometry.sessionUrl}
          title='Biometria e assinatura'
          allow='camera; microphone; fullscreen; autoplay; encrypted-media'
          allowFullScreen
          className='block h-dvh w-screen border-0'
        />
      </div>
    )
  }

  return (
    <IntakeStepLayout
      header={header}
      title={title}
      description={description}
      illustration={ILLUSTRATIONS.biometrics}
      largeDescription
      action={
        <Button size={fieldSize} fullWidth onClick={() => setIsStarted(true)}>
          {isReproved ? 'Tentar novamente' : 'Fazer biometria e assinar'}
        </Button>
      }
    >
      {isReproved && (
        <Alert
          type='error'
          orientation='vertical'
          title='Sua verificação não foi aprovada'
          description='Tente de novo com boa iluminação e o documento original em mãos.'
        />
      )}
    </IntakeStepLayout>
  )
}
