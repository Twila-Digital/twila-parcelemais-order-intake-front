import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { IntakeOrderSummary } from '@/domain/intake.domain'
import { IntakeOrderCard } from './intake-order-card'

const summary: IntakeOrderSummary = {
  orderNumber: '202664646',
  establishmentName: 'Loja Exemplo',
  orderAmount: 2500,
  installments: { count: 12, value: 230 },
}

describe('IntakeOrderCard', () => {
  it('shows the order and reveals its values on demand', async () => {
    render(<IntakeOrderCard summary={summary} />)

    expect(screen.getByText('Pedido #202664646')).toBeInTheDocument()
    expect(screen.getByText('Loja Exemplo')).toBeInTheDocument()
    expect(screen.queryByText('Valor do pedido')).not.toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Ver valores do pedido' }),
    )

    expect(screen.getByText('Valor do pedido')).toBeInTheDocument()
    expect(screen.getByText(/R\$\s2\.500,00/)).toBeInTheDocument()
    expect(screen.getByText(/12x de R\$\s230,00/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Ocultar valores do pedido' }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('hides the installments until they are chosen', async () => {
    render(
      <IntakeOrderCard
        summary={{ ...summary, establishmentName: null, installments: null }}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Ver valores do pedido' }),
    )

    expect(screen.getByText('Valor do pedido')).toBeInTheDocument()
    expect(screen.queryByText('Parcelas')).not.toBeInTheDocument()
    expect(screen.queryByText('Loja Exemplo')).not.toBeInTheDocument()
  })
})
