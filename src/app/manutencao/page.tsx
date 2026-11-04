import type { Metadata } from 'next'
import { ErrorPage } from '@/common/components/error'
import { PageShell } from '@/common/components/page-shell'

export const metadata: Metadata = {
  title: 'Estamos em manutenção',
  robots: { index: false, follow: false },
}

export default function MaintenancePage() {
  return (
    <PageShell>
      <ErrorPage
        title='Estamos em manutenção'
        description='Estamos atualizando o sistema. Volte em alguns instantes.'
      />
    </PageShell>
  )
}
