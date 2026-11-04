'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { IntakeLoadingContext } from '@/modules/intake/hooks/use-intake-loading'
import { IntakeLoading } from './intake-loading'

export function IntakeLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: a navegação para outra etapa encerra o loading
  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  const value = useMemo(
    () => ({
      showLoading: () => setIsLoading(true),
      hideLoading: () => setIsLoading(false),
    }),
    [],
  )

  return (
    <IntakeLoadingContext.Provider value={value}>
      {children}
      {isLoading && <IntakeLoading />}
    </IntakeLoadingContext.Provider>
  )
}
