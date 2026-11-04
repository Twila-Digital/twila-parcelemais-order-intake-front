'use client'

import { Input } from '@twila-digital/components/input'
import type { Masked } from 'imask'
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  type Ref,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useIMask } from 'react-imask'

type DsInputProps = ComponentPropsWithoutRef<typeof Input>

export interface MaskedInputProps extends Omit<DsInputProps, 'value'> {
  mask: string | Masked
  value?: string
  ref?: Ref<HTMLInputElement>
}

export function MaskedInput({
  mask,
  ref,
  value,
  onChange,
  ...rest
}: MaskedInputProps) {
  const opts = useMemo(() => ({ mask: mask as Masked }), [mask])
  const lastAccepted = useRef<string | undefined>(undefined)

  const { ref: maskRef, setValue: setMaskValue } = useIMask<HTMLInputElement>(
    opts,
    {
      onAccept(accepted, _maskRef, event) {
        lastAccepted.current = accepted
        if (!event) return
        onChange?.(event as unknown as ChangeEvent<HTMLInputElement>)
      },
    },
  )

  useEffect(
    () => () => {
      lastAccepted.current = undefined
    },
    [],
  )

  useEffect(() => {
    if (value === undefined || value === lastAccepted.current) return
    lastAccepted.current = value
    setMaskValue(value)
  }, [value, setMaskValue])

  function handleRefs(instance: HTMLInputElement | null) {
    if (typeof ref === 'function') {
      ref(instance)
    } else if (ref) {
      ref.current = instance
    }

    if (instance) {
      maskRef.current = instance
    }
  }

  return <Input ref={handleRefs} {...rest} />
}
