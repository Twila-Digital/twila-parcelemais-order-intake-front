'use client'

import { useEffect } from 'react'
import { ErrorPage } from '@/common/components/error'
import { logRenderError } from '@/common/lib/datadog'
import './globals.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logRenderError(error, {
      route: window.location.pathname,
      boundary: 'global',
    })
  }, [error])

  return (
    <html lang='pt-BR' data-brand='credicarro' data-mode='light'>
      <body className='flex min-h-dvh flex-col'>
        <ErrorPage
          title='Algo deu errado'
          description='Não conseguimos carregar a aplicação. Tente novamente em alguns instantes.'
          actionLabel='Tentar novamente'
          onAction={reset}
        />
      </body>
    </html>
  )
}
