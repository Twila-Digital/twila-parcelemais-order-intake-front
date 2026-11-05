import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { IntakeFinished } from '.'

vi.mock('@/env', () => ({
  env: { NEXT_PUBLIC_PARCELEMAIS_URL: 'https://staging.parcelemais.com.br/' },
}))

function renderFinished({
  hasWhiteLabel = false,
}: {
  hasWhiteLabel?: boolean
} = {}) {
  render(
    <IntakeFinished
      header={null}
      proposalId='d32e3820-1779-40fc-81da-d127de143aea'
      hasWhiteLabel={hasWhiteLabel}
    />,
  )
}

describe('IntakeFinished', () => {
  it('links to the proposal in the Parcele Mais panel of the environment', () => {
    renderFinished()

    expect(
      screen.getByRole('heading', {
        name: 'Proposta finalizada com sucesso! 🎉',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Você finalizou sua proposta e está tudo certo\./),
    ).toHaveTextContent(
      'acessar nosso site para conhecer mais sobre o Parcele Mais',
    )
    const link = screen.getByRole('link', { name: 'Acessar Parcele Mais' })
    expect(link).toHaveAttribute(
      'href',
      'https://staging.parcelemais.com.br/painel/propostas/d32e3820-1779-40fc-81da-d127de143aea',
    )
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('hides the Parcele Mais link and mention with a white label', () => {
    renderFinished({ hasWhiteLabel: true })

    expect(
      screen.queryByRole('link', { name: 'Acessar Parcele Mais' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/Você já pode fechar esta tela\./),
    ).not.toHaveTextContent('Parcele Mais')
  })
})
