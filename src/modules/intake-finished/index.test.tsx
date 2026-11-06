import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { IntakeFinished } from '.'

vi.mock('@/env', () => ({
  env: { NEXT_PUBLIC_PARCELEMAIS_URL: 'https://staging.parcelemais.com.br/' },
}))

describe('IntakeFinished', () => {
  it('links to the order in the Parcele Mais site of the environment', () => {
    render(
      <IntakeFinished
        header={null}
        orderId='d32e3820-1779-40fc-81da-d127de143aea'
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Pedido concluído 🎉' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Seu pedido foi concluído e está tudo certo\./),
    ).toHaveTextContent(
      'acessar nosso site para conhecer mais sobre o Parcele+',
    )
    const link = screen.getByRole('link', { name: 'Acessar Parcele+' })
    expect(link).toHaveAttribute(
      'href',
      'https://staging.parcelemais.com.br/cliente/pedido/d32e3820-1779-40fc-81da-d127de143aea',
    )
    expect(link).toHaveAttribute('target', '_blank')
  })
})
