import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/tests/render-with-providers'
import { IntakeUnavailable } from './intake-unavailable'

describe('IntakeUnavailable', () => {
  it('offers the support WhatsApp when the proposal was closed', () => {
    renderWithProviders(<IntakeUnavailable reason='closed' />)

    expect(
      screen.getByRole('heading', { name: 'Essa proposta foi encerrada' }),
    ).toBeInTheDocument()
    const support = screen.getByRole('link', { name: 'Falar com o suporte' })
    expect(support).toHaveAttribute('href', 'https://wa.me/551130142500')
    expect(support).toHaveAttribute('target', '_blank')
  })

  it.each(['invalid-link', 'error'] as const)(
    'does not offer support for %s',
    (reason) => {
      renderWithProviders(<IntakeUnavailable reason={reason} />)

      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    },
  )
})
