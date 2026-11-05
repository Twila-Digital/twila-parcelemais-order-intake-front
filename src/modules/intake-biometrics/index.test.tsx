import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { IntakeBiometryStepData } from '@/domain/intake.domain'
import { renderWithProviders } from '@/tests/render-with-providers'
import { IntakeBiometrics } from '.'

const intakeService = vi.hoisted(() => ({ getStepData: vi.fn() }))

vi.mock('@/services/http/intake', () => ({ intakeService }))
vi.mock('next/image', () => ({ default: () => null }))

const SESSION: IntakeBiometryStepData = {
  isCompleted: false,
  transactionStatus: null,
  sessionUrl: 'https://verification.didit.me/session/abc',
  isAvailable: true,
}

function renderScreen(data: IntakeBiometryStepData = SESSION) {
  intakeService.getStepData.mockResolvedValue(data)
  return renderWithProviders(
    <IntakeBiometrics
      token='abc'
      header={null}
      data={data}
      title='Biometria'
      description='Confirme sua identidade.'
    />,
  )
}

describe('IntakeBiometrics', () => {
  it('opens the Didit session full screen, without a close button', async () => {
    renderScreen()

    await userEvent.click(
      screen.getByRole('button', { name: 'Fazer biometria' }),
    )

    const iframe = screen.getByTitle('Biometria')
    expect(iframe).toHaveAttribute('src', SESSION.sessionUrl)
    expect(iframe.parentElement).toHaveClass('fixed', 'inset-0')
    expect(document.body.style.overflow).toBe('hidden')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('closes the Didit session when the verification is reproved', async () => {
    const { queryClient } = renderScreen()
    await userEvent.click(
      screen.getByRole('button', { name: 'Fazer biometria' }),
    )
    expect(screen.getByTitle('Biometria')).toBeInTheDocument()

    act(() =>
      queryClient.setQueryData(['intake-step-data', 'abc', 'biometrics'], {
        ...SESSION,
        transactionStatus: 'Reproved',
      }),
    )

    expect(
      await screen.findByText('Sua verificação não foi aprovada'),
    ).toBeInTheDocument()
    expect(screen.queryByTitle('Biometria')).not.toBeInTheDocument()
  })

  it('offers a new attempt after a reproved verification', () => {
    renderScreen({ ...SESSION, transactionStatus: 'Reproved' })

    expect(
      screen.getByText('Sua verificação não foi aprovada'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    ).toBeInTheDocument()
  })

  it('asks to finish the previous steps when the biometry is not available', () => {
    renderScreen({ ...SESSION, sessionUrl: null, isAvailable: false })

    expect(screen.getByText('Conclua as etapas anteriores')).toBeInTheDocument()
  })
})
