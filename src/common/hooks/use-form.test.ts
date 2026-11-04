// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { type FormDeps, useForm } from './use-form'

const schema = z
  .object({
    name: z.string().min(1, 'O nome é obrigatório'),
    email: z.string().email('O e-mail é inválido'),
    address: z.object({
      street: z.string().min(1, 'A rua é obrigatória'),
      number: z.string().min(1, 'O número é obrigatório'),
    }),
    initialYear: z.number(),
    finalYear: z.number(),
  })
  .superRefine((data, ctx) => {
    if (data.finalYear < data.initialYear) {
      ctx.addIssue({
        code: 'custom',
        message: 'O ano final deve ser maior que o inicial',
        path: ['finalYear'],
      })
    }
  })

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  name: '',
  email: '',
  address: { street: '', number: '' },
  initialYear: 2020,
  finalYear: 2022,
}

function renderForm(deps?: FormDeps) {
  return renderHook(() => useForm<FormValues>({ schema, defaultValues, deps }))
}

type Result = ReturnType<typeof renderForm>['result']

async function blur(
  result: Result,
  name: keyof FormValues | 'address.street' | 'address.number',
) {
  const { onBlur } = result.current.register(name)
  const value = result.current.getValues(name)
  await act(() => onBlur({ target: { name, value }, type: 'blur' }))
}

async function change(result: Result, name: 'email' | 'name', value: string) {
  const { onChange } = result.current.register(name)
  await act(() => onChange({ target: { name, value }, type: 'change' }))
}

async function submit(result: Result) {
  await act(() => result.current.handleSubmit(() => {})())
}

describe('useForm', () => {
  it('does not show errors on untouched fields', async () => {
    const { result } = renderForm()

    await act(async () => {
      result.current.setValue('email', 'invalido', { shouldValidate: true })
      await result.current.trigger()
      await result.current.trigger('address')
    })

    expect(result.current.formState.errors).toEqual({})
  })

  it('does not show errors while typing before the first blur', async () => {
    const { result } = renderForm()

    await change(result, 'email', 'ana@')

    expect(result.current.formState.errors.email).toBeUndefined()
  })

  it('shows the error when the field loses focus', async () => {
    const { result } = renderForm()

    await change(result, 'email', 'ana@')
    await blur(result, 'email')

    expect(result.current.formState.errors.email?.message).toBe(
      'O e-mail é inválido',
    )
  })

  it('clears the error while typing once the field was touched', async () => {
    const { result } = renderForm()

    await change(result, 'email', 'ana@')
    await blur(result, 'email')
    await change(result, 'email', 'ana@x.com')

    expect(result.current.formState.errors.email).toBeUndefined()
  })

  it('validates programmatic values only on touched fields', async () => {
    const { result } = renderForm()

    await blur(result, 'name')
    await act(async () => {
      result.current.setValue('name', '', { shouldValidate: true })
    })

    expect(result.current.formState.errors.name).toBeDefined()
    expect(result.current.formState.errors.email).toBeUndefined()
  })

  it('validates only the touched fields of a group', async () => {
    const { result } = renderForm()

    await blur(result, 'address.street')
    await act(async () => {
      await result.current.trigger('address')
    })

    expect(result.current.formState.errors.address?.street).toBeDefined()
    expect(result.current.formState.errors.address?.number).toBeUndefined()
  })

  it('revalidates touched dependents when a field changes', async () => {
    const { result } = renderForm({ initialYear: ['finalYear'] })

    await act(async () => {
      result.current.setValue('finalYear', 2019)
    })
    await blur(result, 'finalYear')
    expect(result.current.formState.errors.finalYear).toBeDefined()

    await act(async () => {
      result.current.setValue('initialYear', 2018)
    })

    expect(result.current.formState.errors.finalYear).toBeUndefined()
  })

  it('does not revalidate untouched dependents', async () => {
    const { result } = renderForm({ initialYear: ['finalYear'] })

    await act(async () => {
      result.current.setValue('initialYear', 2030)
    })

    expect(result.current.formState.errors.finalYear).toBeUndefined()
  })

  it('resolves array indices in dependencies', async () => {
    const termsSchema = z.object({
      terms: z.array(
        z
          .object({ min: z.number(), max: z.number() })
          .refine((term) => term.max >= term.min, {
            message: 'O máximo deve ser maior que o mínimo',
            path: ['max'],
          }),
      ),
    })
    type TermsValues = z.infer<typeof termsSchema>

    const { result } = renderHook(() =>
      useForm<TermsValues>({
        schema: termsSchema,
        defaultValues: {
          terms: [
            { min: 1, max: 5 },
            { min: 10, max: 5 },
          ],
        },
        deps: { 'terms.*.min': ['terms.*.max'] },
      }),
    )

    const { onBlur } = result.current.register('terms.1.max')
    await act(() =>
      onBlur({ target: { name: 'terms.1.max', value: 5 }, type: 'blur' }),
    )
    expect(result.current.formState.errors.terms?.[1]?.max).toBeDefined()

    await act(async () => {
      result.current.setValue('terms.1.min', 2)
    })

    expect(result.current.formState.errors.terms?.[1]?.max).toBeUndefined()
  })

  it('shows every error on submit', async () => {
    const { result } = renderForm()

    await submit(result)

    expect(result.current.formState.errors.name?.message).toBe(
      'O nome é obrigatório',
    )
    expect(result.current.formState.errors.email?.message).toBe(
      'O e-mail é inválido',
    )
    expect(result.current.formState.errors.address?.number).toBeDefined()
  })

  it('revalidates any field after the first submit', async () => {
    const { result } = renderForm()

    await submit(result)
    await act(async () => {
      result.current.setValue('name', 'Ana', { shouldValidate: true })
    })

    expect(result.current.formState.errors.name).toBeUndefined()
    expect(result.current.formState.errors.email).toBeDefined()
  })
})
