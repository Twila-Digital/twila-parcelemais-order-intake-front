import { ErrorPage } from '@/common/components/error'
import { PageShell } from '@/common/components/page-shell'

export default function NotFound() {
  return (
    <PageShell>
      <ErrorPage
        title='Página não encontrada'
        description='A página que você procura não existe ou foi removida.'
      />
    </PageShell>
  )
}
