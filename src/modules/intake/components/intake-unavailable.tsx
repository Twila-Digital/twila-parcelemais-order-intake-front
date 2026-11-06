import { StatusScreen } from '@/common/components/status-screen'
import type { IntakeUnavailableReason } from '@/domain/intake.domain'
import { IntakeSupportButton } from './intake-support-button'

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
    title: 'Esse pedido foi encerrado',
    description: 'Fale com a gente pelo WhatsApp se precisar de ajuda.',
  },
  error: {
    title: 'Não foi possível carregar seu pedido',
    description: 'Tente novamente em alguns instantes.',
  },
}

export function IntakeUnavailable({
  reason,
}: {
  reason: IntakeUnavailableReason
}) {
  if (reason !== 'closed') {
    return <StatusScreen tone='warning' {...MESSAGES[reason]} />
  }

  return (
    <StatusScreen tone='danger' {...MESSAGES.closed}>
      <IntakeSupportButton />
    </StatusScreen>
  )
}
