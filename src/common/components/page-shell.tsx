import type { ReactNode } from 'react'
import { AppFooter } from './app-footer'
import { AppHeader } from './app-header'
import { PAGE_CONTAINER_CLASS } from './page-container'

type PageShellProps = {
  children: ReactNode
}

export function PageShell({ children }: PageShellProps) {
  return (
    <>
      <AppHeader />
      <main
        className={`${PAGE_CONTAINER_CLASS} flex flex-1 flex-col desktop:pt-10 pt-8`}
      >
        {children}
      </main>
      <AppFooter />
    </>
  )
}
