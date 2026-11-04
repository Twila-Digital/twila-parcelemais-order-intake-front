'use client'

import { faUpRightFromSquare } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Alert } from '@twila-digital/components/alert'
import { Button } from '@twila-digital/components/button'
import type { ReactNode } from 'react'
import { StatusScreen } from '@/common/components/status-screen'
import { IntakeFlow } from '@/common/enums/intake-flow.enum'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { intakeFlowCopyRecord } from '@/common/records/intake-flow-copy.record'
import { formatBrazilianDate } from '@/common/utils/date'
import type { IntakeProposalSummary } from '@/domain/intake.domain'
import { env } from '@/env'

const CLOSE_HINT = 'Você já pode fechar esta tela.'
const CLOSE_OR_VISIT_HINT =
  'Você já pode fechar esta tela ou acessar nosso site para conhecer mais sobre a Credicarro.'

function getCredicarroUrl(flow: IntakeFlow, proposalId: string) {
  const baseUrl = env.NEXT_PUBLIC_CREDICARRO_URL.replace(/\/+$/, '')
  if (flow === IntakeFlow.Seller) return baseUrl
  return `${baseUrl}/painel/propostas/${encodeURIComponent(proposalId)}`
}

type IntakeFinishedProps = {
  header: ReactNode
  proposalId: string
  flow: IntakeFlow
  summary: IntakeProposalSummary | null
  hasWhiteLabel: boolean
}

export function IntakeFinished({
  header,
  proposalId,
  flow,
  summary,
  hasWhiteLabel,
}: IntakeFinishedProps) {
  const fieldSize = useFieldSize()
  const copy = intakeFlowCopyRecord[flow].finished
  const disbursementDate =
    flow === IntakeFlow.Seller
      ? formatBrazilianDate(summary?.disbursementDate)
      : null

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
      {disbursementDate && (
        <Alert
          type='information'
          title={`Data de desembolso: ${disbursementDate}`}
        />
      )}
      {!hasWhiteLabel && (
        <Button size={fieldSize} fullWidth asChild>
          <a
            href={getCredicarroUrl(flow, proposalId)}
            target='_blank'
            rel='noopener noreferrer'
          >
            Acessar Credicarro
            <FontAwesomeIcon icon={faUpRightFromSquare} aria-hidden />
          </a>
        </Button>
      )}
    </StatusScreen>
  )
}
