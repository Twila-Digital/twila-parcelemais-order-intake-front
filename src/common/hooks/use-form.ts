import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useRef } from 'react'
import {
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  get,
  type Resolver,
  type UseFormSetValue,
  type UseFormTrigger,
  useForm as useHookForm,
} from 'react-hook-form'
import type { ZodType } from 'zod'

export type FormDeps = Record<string, string[]>

interface UseFormProps<T extends FieldValues> {
  schema: ZodType
  defaultValues?: DefaultValues<T>
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all'
  deps?: FormDeps
}

function collectTouchedPaths(touched: unknown, path: string): string[] {
  if (touched === true) return [path]
  if (!touched || typeof touched !== 'object') return []
  return Object.entries(touched).flatMap(([key, child]) =>
    collectTouchedPaths(child, path ? `${path}.${key}` : key),
  )
}

function resolveDependents(deps: FormDeps, name: string): string[] {
  const indices: string[] = []
  const pattern = name
    .split('.')
    .map((segment) => {
      if (!/^\d+$/.test(segment)) return segment
      indices.push(segment)
      return '*'
    })
    .join('.')

  const dependents = deps[name] ?? deps[pattern] ?? []
  return dependents.map((dependent) => {
    let index = 0
    return dependent
      .split('.')
      .map((segment) => (segment === '*' ? indices[index++] : segment))
      .join('.')
  })
}

export function useForm<T extends FieldValues>({
  schema,
  defaultValues,
  mode,
  deps,
}: UseFormProps<T>) {
  const {
    register,
    setValue: setHookFormValue,
    watch,
    setError,
    handleSubmit,
    control,
    formState,
    getFieldState,
    trigger: triggerHookForm,
    resetField,
    clearErrors,
    getValues,
    ...other
  } = useHookForm<T>({
    mode: mode || 'onTouched',
    criteriaMode: 'all',
    reValidateMode: 'onChange',
    resolver: zodResolver(schema as ZodType<T, FieldValues>) as Resolver<T>,
    defaultValues,
  })

  const validationStateRef = useRef({
    isSubmitted: false,
    touchedFields: {} as unknown,
  })
  validationStateRef.current = {
    isSubmitted: formState.isSubmitted,
    touchedFields: formState.touchedFields,
  }

  const depsRef = useRef(deps)
  depsRef.current = deps

  const trigger = useCallback<UseFormTrigger<T>>(
    async (name, options) => {
      const { isSubmitted, touchedFields } = validationStateRef.current
      if (isSubmitted) return triggerHookForm(name, options)

      const names: string[] =
        name === undefined
          ? ['']
          : typeof name === 'string'
            ? [name]
            : [...name]
      const touchedNames = names.flatMap((fieldName) =>
        collectTouchedPaths(
          fieldName ? get(touchedFields, fieldName) : touchedFields,
          fieldName,
        ),
      ) as FieldPath<T>[]

      if (touchedNames.length === 0) return true
      return triggerHookForm(touchedNames, options)
    },
    [triggerHookForm],
  )

  const setValue = useCallback<UseFormSetValue<T>>(
    (name, value, options) => {
      setHookFormValue(name, value, { ...options, shouldValidate: false })
      if (options?.shouldValidate) void trigger(name)
    },
    [setHookFormValue, trigger],
  )

  useEffect(() => {
    const subscription = watch((_, { name }) => {
      if (!name || !depsRef.current) return
      const dependents = resolveDependents(depsRef.current, name)
      if (dependents.length > 0) void trigger(dependents as FieldPath<T>[])
    })
    return () => subscription.unsubscribe()
  }, [watch, trigger])

  return {
    control,
    setValue,
    register,
    handleSubmit,
    formState,
    watch,
    setError,
    getFieldState,
    getValues,
    trigger,
    resetField,
    clearErrors,
    ...other,
  }
}
