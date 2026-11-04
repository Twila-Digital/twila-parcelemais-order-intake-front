'use client'

import { useEffect } from 'react'
import { ErrorPage } from '@/common/components/error'
import { PageShell } from '@/common/components/page-shell'
import { logRenderError } from '@/common/lib/datadog'

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logRenderError(error, {
      route: window.location.pathname,
      boundary: 'root',
    })
  }, [error])

  return (
    <PageShell>
      <ErrorPage
        title='Algo deu errado'
        description='Não conseguimos carregar esta página. Tente novamente em alguns instantes.'
        actionLabel='Tentar novamente'
        onAction={reset}
      />
    </PageShell>
  )
}
