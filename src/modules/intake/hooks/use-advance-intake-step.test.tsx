import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'

vi.unmock('@/modules/intake/hooks/use-advance-intake-step')

const intakeService = vi.hoisted(() => ({ getStart: vi.fn() }))
const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }))

vi.mock('@/services/http/intake', () => ({ intakeService }))
const loading = vi.hoisted(() => ({
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
}))

vi.mock('next/navigation', () => ({ useRouter: () => router }))
vi.mock('@/modules/intake/hooks/use-intake-loading', () => ({
  useIntakeLoading: () => loading,
}))

const { useAdvanceIntakeStep } = await import('./use-advance-intake-step')

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

function startWith(activeStatus: IntakeStepStatus | null) {
  return { dateAndStatus: { activeStatus, steps: [] } }
}

describe('useAdvanceIntakeStep', () => {
  beforeEach(() => {
    intakeService.getStart.mockReset()
  })

  it('goes to the entry of the link when the active step changed', async () => {
    intakeService.getStart.mockResolvedValue(startWith(null))
    const { result } = renderHook(
      () => useAdvanceIntakeStep('a/b', IntakeStepStatus.Biometry),
      { wrapper },
    )

    let moved: boolean | undefined
    await act(async () => {
      moved = await result.current.advance()
    })

    expect(moved).toBe(true)
    expect(router.replace).toHaveBeenCalledWith('/intake/a%2Fb')
    expect(loading.showLoading).toHaveBeenCalled()
    expect(loading.hideLoading).not.toHaveBeenCalled()
  })

  it('checks only once and keeps the loading while the step is not released', async () => {
    intakeService.getStart.mockResolvedValue(
      startWith(IntakeStepStatus.Biometry),
    )
    const { result } = renderHook(
      () => useAdvanceIntakeStep('abc', IntakeStepStatus.Biometry),
      { wrapper },
    )

    let moved: boolean | undefined
    await act(async () => {
      moved = await result.current.advance()
    })

    expect(moved).toBe(false)
    expect(intakeService.getStart).toHaveBeenCalledOnce()
    expect(router.replace).not.toHaveBeenCalled()
    expect(result.current.isAdvancing).toBe(false)
    expect(loading.showLoading).toHaveBeenCalled()
  })
})
