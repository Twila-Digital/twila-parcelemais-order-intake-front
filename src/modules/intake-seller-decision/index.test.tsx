import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IntakeFlow } from '@/common/enums/intake-flow.enum'
import type { IntakeProposalSummary } from '@/domain/intake.domain'
import { ApiError } from '@/services/error'
import { advanceIntakeStep } from '@/tests/intake-step-mocks'
import { renderWithProviders } from '@/tests/render-with-providers'
import { IntakeSellerDecision } from '.'

const intakeService = vi.hoisted(() => ({ submitStep: vi.fn() }))

vi.mock('@/services/http/intake', () => ({ intakeService }))
vi.mock('next/image', () => ({ default: () => null }))

const summary: IntakeProposalSummary = {
  proposalNumber: '2026123456',
  createdAt: '2026-10-09T13:05:00-03:00',
  disbursementDate: null,
  vehicleDescription: 'Sandero Stepway Sandero Expression 1.0 16v 2024',
  vehicleModel: 'Sandero Stepway',
  vehicleVersion: 'Sandero Expression 1.0 16v (Flex) Manual',
  vehicleYear: 2023,
  vehicleValue: 120000,
  downPaymentValue: 50000,
  financedValue: 70000,
  installments: { count: 12, value: 1251 },
}

function renderScreen(data: IntakeProposalSummary | null = null) {
  renderWithProviders(
    <IntakeSellerDecision
      token='abc'
      flow={IntakeFlow.Seller}
      header={null}
      data={data}
    />,
  )
}

describe('IntakeSellerDecision', () => {
  beforeEach(() => {
    intakeService.submitStep.mockReset()
    intakeService.submitStep.mockResolvedValue(undefined)
  })

  it('accepts the proposal without asking the seller type', async () => {
    renderScreen()

    expect(screen.queryByText('Tipo de vendedor')).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Sim, sou o vendedor' }),
    )

    expect(intakeService.submitStep).toHaveBeenCalledWith(
      'abc',
      'decision-seller',
      { isAccepted: true },
    )
    await waitFor(() => expect(advanceIntakeStep).toHaveBeenCalledOnce())
  })

  it('shows the proposal details to check before confirming', () => {
    renderScreen(summary)

    const details = screen.getByRole('region', { name: 'Dados da proposta' })
    expect(details).toHaveTextContent('Proposta 2026123456')
    expect(details).toHaveTextContent('09/10/2026')
    expect(details).toHaveTextContent('Sandero Stepway')
    expect(details).toHaveTextContent(
      'Sandero Expression 1.0 16v (Flex) Manual',
    )
    expect(details).toHaveTextContent('Valor da entrada')
    expect(details).toHaveTextContent('12x de')
    expect(
      screen.getByText(/Confira os dados da proposta abaixo/),
    ).toBeInTheDocument()
  })

  it('asks only the question without the proposal details', () => {
    renderScreen()

    expect(
      screen.queryByRole('region', { name: 'Dados da proposta' }),
    ).not.toBeInTheDocument()
  })

  it('declines the proposal', async () => {
    renderScreen()

    await userEvent.click(
      screen.getByRole('button', { name: 'Não sou o vendedor' }),
    )

    expect(intakeService.submitStep).toHaveBeenCalledWith(
      'abc',
      'decision-seller',
      { isAccepted: false },
    )
    expect(await screen.findByText('Tudo certo!')).toBeInTheDocument()
  })

  it('tells when the decision was already registered', async () => {
    intakeService.submitStep.mockRejectedValue(
      new ApiError({ status: 409, type: 'Intake.SellerAlreadyDecided' }),
    )
    renderScreen()

    await userEvent.click(
      screen.getByRole('button', { name: 'Não sou o vendedor' }),
    )

    expect(
      await screen.findByText('Sua decisão já foi registrada'),
    ).toBeInTheDocument()
  })
})
