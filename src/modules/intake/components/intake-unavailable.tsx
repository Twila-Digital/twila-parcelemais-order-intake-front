'use client'

import { faUpRightFromSquare } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@twila-digital/components/button'
import { StatusScreen } from '@/common/components/status-screen'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { APP_INFO } from '@/constants/app-info'
import type { IntakeUnavailableReason } from '@/domain/intake.domain'

const MESSAGES: Record<
  IntakeUnavailableReason,
  { title: string; description: string }
> = {
  'invalid-link': {
    title: 'Link inválido ou expirado',
    description:
      'Este link não é mais válido. Use o link mais recente que enviamos no WhatsApp.',
  },
  closed: {
    title: 'Essa proposta foi encerrada',
    description: 'Fale com a gente pelo WhatsApp se precisar de ajuda.',
  },
  error: {
    title: 'Não foi possível carregar sua proposta',
    description: 'Tente novamente em alguns instantes.',
  },
}

export function IntakeUnavailable({
  reason,
}: {
  reason: IntakeUnavailableReason
}) {
  const fieldSize = useFieldSize()

  if (reason !== 'closed') {
    return <StatusScreen tone='warning' {...MESSAGES[reason]} />
  }

  return (
    <StatusScreen tone='danger' {...MESSAGES.closed}>
      <Button size={fieldSize} fullWidth asChild>
        <a
          href={APP_INFO.whatsappLink}
          target='_blank'
          rel='noopener noreferrer'
        >
          Falar com o suporte
          <FontAwesomeIcon icon={faUpRightFromSquare} aria-hidden />
        </a>
      </Button>
    </StatusScreen>
  )
}
