import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NewConditionsLoading } from './new-conditions-loading'

const router = vi.hoisted(() => ({ refresh: vi.fn() }))

vi.mock('next/navigation', () => ({ useRouter: () => router }))
vi.mock('@/modules/intake/components/intake-loading', () => ({
  IntakeLoading: () => <p>Carregando</p>,
}))

describe('NewConditionsLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reloads every 5 seconds while the conditions are not ready', () => {
    render(<NewConditionsLoading fallback={<p>Continue pelo WhatsApp</p>} />)

    expect(screen.getByText('Carregando')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(15_000))

    expect(router.refresh).toHaveBeenCalledTimes(3)
  })

  it('gives up after a minute', () => {
    render(<NewConditionsLoading fallback={<p>Continue pelo WhatsApp</p>} />)

    act(() => vi.advanceTimersByTime(60_000))
    const calls = router.refresh.mock.calls.length
    act(() => vi.advanceTimersByTime(30_000))

    expect(screen.getByText('Continue pelo WhatsApp')).toBeInTheDocument()
    expect(router.refresh).toHaveBeenCalledTimes(calls)
  })
})
