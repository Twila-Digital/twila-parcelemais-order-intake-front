'use client'

import { faUpRightFromSquare } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@twila-digital/components/button'
import type { ReactNode } from 'react'
import { StatusScreen } from '@/common/components/status-screen'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { intakeFlowCopyRecord } from '@/common/records/intake-flow-copy.record'
import { env } from '@/env'

const CLOSE_OR_VISIT_HINT =
  'Você já pode fechar esta tela ou acessar nosso site para conhecer mais sobre o Parcele+.'

function getSiteUrl(orderId: string) {
  const baseUrl = env.NEXT_PUBLIC_PARCELEMAIS_URL.replace(/\/+$/, '')
  return `${baseUrl}/cliente/pedido/${encodeURIComponent(orderId)}`
}

type IntakeFinishedProps = {
  header: ReactNode
  orderId: string
}

export function IntakeFinished({ header, orderId }: IntakeFinishedProps) {
  const fieldSize = useFieldSize()
  const copy = intakeFlowCopyRecord.finished

  return (
    <StatusScreen
      header={header}
      title={copy.title}
      description={
        <>
          {copy.description}
          <br />
          {CLOSE_OR_VISIT_HINT}
        </>
      }
    >
      <Button size={fieldSize} fullWidth asChild>
        <a href={getSiteUrl(orderId)} target='_blank' rel='noopener noreferrer'>
          Acessar Parcele+
          <FontAwesomeIcon icon={faUpRightFromSquare} aria-hidden />
        </a>
      </Button>
    </StatusScreen>
  )
}
