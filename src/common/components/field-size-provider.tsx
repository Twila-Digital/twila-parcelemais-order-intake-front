'use client'

import { createContext, type ReactNode } from 'react'

export type FieldSize = 'md' | 'lg'

export const FieldSizeContext = createContext<FieldSize>('md')

type FieldSizeProviderProps = {
  initialSize: FieldSize
  children: ReactNode
}

export function FieldSizeProvider({
  initialSize,
  children,
}: FieldSizeProviderProps) {
  return <FieldSizeContext value={initialSize}>{children}</FieldSizeContext>
}
