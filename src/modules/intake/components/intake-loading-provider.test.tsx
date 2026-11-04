import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useIntakeLoading } from '@/modules/intake/hooks/use-intake-loading'
import { IntakeLoadingProvider } from './intake-loading-provider'

const navigation = vi.hoisted(() => ({ pathname: '/intake/abc/documentos' }))

vi.mock('next/navigation', () => ({ usePathname: () => navigation.pathname }))
vi.mock('@twila-digital/components/loading', () => ({
  Loading: ({ label }: { label: string }) => <span role='status'>{label}</span>,
}))

let loading: ReturnType<typeof useIntakeLoading>

function Consumer() {
  loading = useIntakeLoading()
  return null
}

function renderProvider() {
  return render(
    <IntakeLoadingProvider>
      <Consumer />
    </IntakeLoadingProvider>,
  )
}

describe('IntakeLoadingProvider', () => {
  it('shows the full screen loading on demand', () => {
    renderProvider()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    act(() => loading.showLoading())
    expect(screen.getByRole('status', { name: '' })).toHaveTextContent(
      'Carregando',
    )

    act(() => loading.hideLoading())
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('hides the loading once the navigation reaches another step', () => {
    const { rerender } = renderProvider()
    act(() => loading.showLoading())

    navigation.pathname = '/intake/abc/biometria'
    rerender(
      <IntakeLoadingProvider>
        <Consumer />
      </IntakeLoadingProvider>,
    )

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
