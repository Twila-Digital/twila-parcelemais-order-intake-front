'use client'

import { faUpRightFromSquare } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@twila-digital/components/button'
import type { ReactNode } from 'react'
import { StatusScreen } from '@/common/components/status-screen'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { intakeFlowCopyRecord } from '@/common/records/intake-flow-copy.record'
import { env } from '@/env'

const CLOSE_HINT = 'Você já pode fechar esta tela.'
const CLOSE_OR_VISIT_HINT =
  'Você já pode fechar esta tela ou acessar nosso site para conhecer mais sobre o Parcele Mais.'

function getSiteUrl(proposalId: string) {
  const baseUrl = env.NEXT_PUBLIC_PARCELEMAIS_URL.replace(/\/+$/, '')
  return `${baseUrl}/painel/propostas/${encodeURIComponent(proposalId)}`
}

type IntakeFinishedProps = {
  header: ReactNode
  proposalId: string
  hasWhiteLabel: boolean
}

export function IntakeFinished({
  header,
  proposalId,
  hasWhiteLabel,
}: IntakeFinishedProps) {
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
          {hasWhiteLabel ? CLOSE_HINT : CLOSE_OR_VISIT_HINT}
        </>
      }
    >
      {!hasWhiteLabel && (
        <Button size={fieldSize} fullWidth asChild>
          <a
            href={getSiteUrl(proposalId)}
            target='_blank'
            rel='noopener noreferrer'
          >
            Acessar Parcele Mais
            <FontAwesomeIcon icon={faUpRightFromSquare} aria-hidden />
          </a>
        </Button>
      )}
    </StatusScreen>
  )
}
