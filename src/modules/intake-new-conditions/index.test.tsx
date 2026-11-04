import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IntakeProposalSummary } from '@/domain/intake.domain'
import { ApiError } from '@/services/error'
import { newCondition } from '@/tests/new-condition-mocks'
import { renderWithProviders } from '@/tests/render-with-providers'
import { IntakeNewConditions } from '.'

const intakeService = vi.hoisted(() => ({ decideCounterProposal: vi.fn() }))
const router = vi.hoisted(() => ({ refresh: vi.fn() }))

vi.mock('@/services/http/intake', () => ({ intakeService }))
vi.mock('next/image', () => ({ default: () => null }))
vi.mock('next/navigation', () => ({ useRouter: () => router }))

const summary: IntakeProposalSummary = {
  proposalNumber: '2026123456',
  createdAt: '2026-10-19T13:05:00-03:00',
  disbursementDate: null,
  vehicleDescription: 'A5 Sportback',
  vehicleModel: 'A5 Sportback',
  vehicleVersion: 'A5 Sportback Carbon Edition 2.0 TFSI S-Tronic 2023',
  vehicleYear: 2023,
  vehicleValue: 30500,
  downPaymentValue: 9500,
  financedValue: 25000,
  installments: { count: 12, value: 1500 },
}

const shortTerm = newCondition({
  simulationId: '9a2b0000-0000-4000-8000-000000000012',
  term: 12,
  installmentValue: 1594.67,
})
const longTerm = newCondition({
  simulationId: '9a2b0000-0000-4000-8000-000000000024',
  term: 24,
  installmentValue: 980.5,
})

function renderScreen(conditions = [shortTerm, longTerm]) {
  renderWithProviders(
    <IntakeNewConditions
      token='abc'
      summary={summary}
      conditions={conditions}
    />,
  )
}

describe('IntakeNewConditions', () => {
  beforeEach(() => {
    intakeService.decideCounterProposal.mockResolvedValue(undefined)
  })

  it('shows the sent proposal next to the selected new condition', () => {
    renderScreen()

    const sent = screen.getByRole('region', { name: 'Proposta enviada' })
    expect(within(sent).getByText(/12x de R\$\s1\.500,00/)).toBeInTheDocument()
    const updated = screen.getByRole('region', { name: 'Novas condições' })
    expect(
      within(updated).getByText(/12x de R\$\s1\.594,67/),
    ).toBeInTheDocument()
    expect(screen.getByText('(12 parcelas)')).toBeInTheDocument()
  })

  it('switches the new condition when another term is picked', async () => {
    renderScreen()

    await userEvent.click(screen.getByRole('tab', { name: '24x' }))

    expect(screen.getByText('(24 parcelas)')).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Aceitar novas condições' }),
    )
    expect(intakeService.decideCounterProposal).toHaveBeenCalledWith('abc', {
      simulationId: longTerm.simulationId,
      isAccepted: true,
    })
  })

  it('hides the term picker when there is a single condition', () => {
    renderScreen([shortTerm])

    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  it('shows the accepted screen without waiting for the new status', async () => {
    renderScreen()

    await userEvent.click(
      screen.getByRole('button', { name: 'Aceitar novas condições' }),
    )

    expect(
      await screen.findByText('Novas condições aceitas'),
    ).toBeInTheDocument()
    expect(router.refresh).not.toHaveBeenCalled()
  })

  it('refuses only the selected condition, which closes the proposal', async () => {
    renderScreen()

    await userEvent.click(screen.getByRole('tab', { name: '24x' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Recusar novas condições' }),
    )

    expect(
      await screen.findByText('Novas condições recusadas'),
    ).toBeInTheDocument()
    expect(intakeService.decideCounterProposal).toHaveBeenCalledOnce()
    expect(intakeService.decideCounterProposal).toHaveBeenCalledWith('abc', {
      simulationId: longTerm.simulationId,
      isAccepted: false,
    })
  })

  it.each([
    'Intake.ProposalNotInNegotiation',
    'Intake.CounterProposalAlreadyDecided',
    'Intake.CounterProposalNotFound',
  ])('reloads the screen when the decision is stale (%s)', async (type) => {
    intakeService.decideCounterProposal.mockRejectedValue(
      new ApiError({
        status: 409,
        type,
        detail: 'Esta condição já foi decidida.',
      }),
    )
    renderScreen()

    await userEvent.click(
      screen.getByRole('button', { name: 'Aceitar novas condições' }),
    )

    await waitFor(() => expect(router.refresh).toHaveBeenCalledOnce())
    expect(
      screen.queryByText('Novas condições aceitas'),
    ).not.toBeInTheDocument()
  })

  it('opens the CET details of the selected condition', async () => {
    renderScreen()

    await userEvent.click(
      screen.getByRole('button', { name: 'Detalhes das parcelas' }),
    )

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByText('Custo efetivo total (CET)'),
    ).toBeInTheDocument()
    expect(within(dialog).getByText('31,40%')).toBeInTheDocument()
  })
})
