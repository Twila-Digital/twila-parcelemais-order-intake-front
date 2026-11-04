import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { IntakeFlow } from '@/common/enums/intake-flow.enum'
import type { IntakeProposalSummary } from '@/domain/intake.domain'
import { IntakeFinished } from '.'

vi.mock('@/env', () => ({
  env: { NEXT_PUBLIC_CREDICARRO_URL: 'https://staging.credicarro.com.br/' },
}))

const summary: IntakeProposalSummary = {
  proposalNumber: '2026123456',
  createdAt: '2026-10-09T13:05:00-03:00',
  disbursementDate: '2026-10-20',
  vehicleDescription: 'A5 Sportback 2023',
  vehicleModel: 'A5',
  vehicleVersion: 'Sportback',
  vehicleYear: 2023,
  vehicleValue: 120000,
  downPaymentValue: 50000,
  financedValue: 70000,
  installments: { count: 12, value: 1251 },
}

function renderFinished({
  flow = IntakeFlow.BuyerFinancing,
  hasWhiteLabel = false,
}: {
  flow?: IntakeFlow
  hasWhiteLabel?: boolean
} = {}) {
  render(
    <IntakeFinished
      header={null}
      proposalId='d32e3820-1779-40fc-81da-d127de143aea'
      flow={flow}
      summary={summary}
      hasWhiteLabel={hasWhiteLabel}
    />,
  )
}

describe('IntakeFinished', () => {
  it('links to the proposal in the Credicarro panel of the environment', () => {
    renderFinished()

    expect(
      screen.getByRole('heading', {
        name: 'Proposta finalizada com sucesso! 🎉',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Você finalizou sua proposta e está tudo certo\./),
    ).toHaveTextContent(
      'acessar nosso site para conhecer mais sobre a Credicarro',
    )
    const link = screen.getByRole('link', { name: 'Acessar Credicarro' })
    expect(link).toHaveAttribute(
      'href',
      'https://staging.credicarro.com.br/painel/propostas/d32e3820-1779-40fc-81da-d127de143aea',
    )
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('does not show the disbursement date to the buyer', () => {
    renderFinished()

    expect(screen.queryByText(/Data de desembolso/)).not.toBeInTheDocument()
  })

  it('shows the disbursement date to the seller', () => {
    renderFinished({ flow: IntakeFlow.Seller })

    expect(
      screen.getByText('Data de desembolso: 20/10/2026'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Você finalizou a proposta e está tudo certo\./),
    ).toBeInTheDocument()
  })

  it('links the seller to the Credicarro home of the environment', () => {
    renderFinished({ flow: IntakeFlow.Seller })

    expect(
      screen.getByRole('link', { name: 'Acessar Credicarro' }),
    ).toHaveAttribute('href', 'https://staging.credicarro.com.br')
  })

  it('hides the Credicarro link and mention with a white label', () => {
    renderFinished({ hasWhiteLabel: true })

    expect(
      screen.queryByRole('link', { name: 'Acessar Credicarro' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(/Você já pode fechar esta tela\./),
    ).not.toHaveTextContent('Credicarro')
  })
})
