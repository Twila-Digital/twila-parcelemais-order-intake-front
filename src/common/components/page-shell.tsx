import type { ReactNode } from 'react'
import { AppFooter } from './app-footer'
import { AppHeader } from './app-header'
import { PAGE_CONTAINER_CLASS } from './page-container'

type PageShellProps = {
  children: ReactNode
  logoUrl?: string | null
}

export function PageShell({ children, logoUrl }: PageShellProps) {
  return (
    <>
      <AppHeader logoUrl={logoUrl} />
      <main
        className={`${PAGE_CONTAINER_CLASS} flex flex-1 flex-col desktop:pt-10 pt-8`}
      >
        {children}
      </main>
      <AppFooter />
    </>
  )
}
