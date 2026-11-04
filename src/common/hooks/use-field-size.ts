import { useBreakpoint } from '@twila-digital/components/use-breakpoint'
import { useContext, useSyncExternalStore } from 'react'
import {
  type FieldSize,
  FieldSizeContext,
} from '@/common/components/field-size-provider'

const subscribe = () => () => {}

export function useFieldSize(): FieldSize {
  const initialSize = useContext(FieldSizeContext)
  const isHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  const breakpoint = useBreakpoint()

  if (!isHydrated) return initialSize
  return breakpoint === 'mobile' ? 'md' : 'lg'
}
