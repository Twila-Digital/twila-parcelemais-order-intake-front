import { PageShell } from '@/common/components/page-shell'
import { StatusScreen } from '@/common/components/status-screen'

export default function HomePage() {
  return (
    <PageShell>
      <StatusScreen
        tone='info'
        title='Acesse pelo link do WhatsApp'
        description='Para continuar sua proposta, abra o link que enviamos para você no WhatsApp.'
      />
    </PageShell>
  )
}
