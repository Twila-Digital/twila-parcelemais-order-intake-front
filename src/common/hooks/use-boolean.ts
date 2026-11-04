import { useCallback, useState } from 'react'

type Response = [
  boolean,
  {
    setTrue: () => void
    setFalse: () => void
    toggle: () => void
    onOpenChange: (open: boolean) => void
  },
]

export const useBoolean = (initialValue: boolean): Response => {
  const [boolean, setBoolean] = useState<boolean>(initialValue)

  const setTrue = useCallback(() => setBoolean(true), [])
  const setFalse = useCallback(() => setBoolean(false), [])
  const toggle = useCallback(() => setBoolean((prev) => !prev), [])
  const onOpenChange = useCallback((open: boolean) => setBoolean(open), [])

  const actions = { setTrue, setFalse, toggle, onOpenChange }
  return [boolean, actions]
}
