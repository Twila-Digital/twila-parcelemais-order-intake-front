import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { IntakeProposalCard } from './intake-proposal-card'

const summary = {
  proposalNumber: '202664646',
  createdAt: '2026-10-09T13:05:00-03:00',
  financedValue: 25000,
  installments: { count: 12, value: 1500 },
}

describe('IntakeProposalCard', () => {
  it('shows the proposal and reveals its values on demand', async () => {
    render(<IntakeProposalCard summary={summary} />)

    expect(screen.getByText('Proposta 202664646')).toBeInTheDocument()
    expect(screen.getByText('09/10/2026')).toBeInTheDocument()
    expect(screen.queryByText('Valor financiado')).not.toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Ver valores da proposta' }),
    )

    expect(screen.getByText('Valor financiado')).toBeInTheDocument()
    expect(screen.getByText(/R\$\s25\.000,00/)).toBeInTheDocument()
    expect(screen.getByText(/12x de R\$\s1\.500,00/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Ocultar valores da proposta' }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('hides the date when the API does not send it', () => {
    render(<IntakeProposalCard summary={{ ...summary, createdAt: null }} />)

    expect(screen.queryByText('09/10/2026')).not.toBeInTheDocument()
  })
})
