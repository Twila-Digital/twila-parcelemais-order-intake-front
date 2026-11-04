'use client'

import { useContextMutator } from '@openfeature/react-sdk'
import type { EvaluationContextValue } from '@openfeature/web-sdk'
import { useEffect } from 'react'

export function useFlagContext(
  attributes: Record<string, EvaluationContextValue>,
) {
  const { setContext } = useContextMutator({ defaultContext: true })
  const serialized = JSON.stringify(attributes)

  useEffect(() => {
    const attrs = JSON.parse(serialized) as Record<
      string,
      EvaluationContextValue
    >
    const keys = Object.keys(attrs)
    if (keys.length === 0) return
    void setContext((prev) => ({ ...prev, ...attrs }))
    return () => {
      void setContext((prev) => {
        const next = { ...prev }
        for (const key of keys) delete next[key]
        return next
      })
    }
  }, [serialized, setContext])
}
