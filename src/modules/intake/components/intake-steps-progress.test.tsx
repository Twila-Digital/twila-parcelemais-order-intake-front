import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type { IntakeStep } from '@/domain/intake.domain'
import { IntakeStepsProgress } from './intake-steps-progress'

function step(
  status: IntakeStepStatus,
  completedAt: string | null = null,
): IntakeStep {
  return {
    status,
    description: `Descrição da API ${status}`,
    isCompleted: completedAt !== null,
    completedAt,
  }
}

const steps = [
  step(IntakeStepStatus.UpdateProfile, '2026-10-16T14:00:00+00:00'),
  step(IntakeStepStatus.UpsertAddress, '2026-10-16T14:42:09.0193699+00:00'),
  step(IntakeStepStatus.UpdateTerm),
  step(IntakeStepStatus.PaymentProfile),
  step(IntakeStepStatus.Biometry),
  step(IntakeStepStatus.StartSale),
]

function renderProgress(activeStatus = IntakeStepStatus.UpdateTerm) {
  render(<IntakeStepsProgress steps={steps} activeStatus={activeStatus} />)
}

async function openSteps() {
  renderProgress()
  await userEvent.click(screen.getByRole('button', { name: 'Ver etapas' }))
  return within(screen.getByRole('list', { name: 'Etapas do pedido' }))
}

describe('IntakeStepsProgress', () => {
  it('shows only the four order steps in the progress bar', () => {
    renderProgress()

    const bar = within(
      screen.getByRole('list', { name: 'Progresso do pedido' }),
    )
    expect(bar.getAllByRole('listitem').map((item) => item.ariaLabel)).toEqual([
      'Endereço',
      'Parcelas',
      'Cartão',
      'Biometria',
    ])
    expect(bar.getByLabelText('Parcelas')).toHaveAttribute(
      'aria-current',
      'step',
    )
  })

  it('shows the active step label and toggles the step list', async () => {
    renderProgress()

    expect(screen.getByText('Parcelas')).toBeInTheDocument()
    const toggle = screen.getByRole('button', { name: 'Ver etapas' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await userEvent.click(toggle)
    expect(screen.queryByText('(concluída)')).not.toBeInTheDocument()
  })

  it('shows when each finished step was completed, in the Brazil time zone', async () => {
    const list = await openSteps()

    const [completed] = list.getAllByRole('listitem')
    expect(completed).toHaveTextContent('Endereço')
    expect(completed).toHaveTextContent('(concluída)')
    expect(completed).toHaveTextContent('16/10/2026 11:42')
  })

  it('marks the current step and leaves the next ones pending', async () => {
    const list = await openSteps()

    const [, current, pending] = list.getAllByRole('listitem')
    expect(current).toHaveTextContent('(etapa atual)')
    expect(current).toHaveTextContent('Você está aqui!')
    expect(pending).toHaveTextContent('(pendente)')
    expect(pending).not.toHaveTextContent('Você está aqui!')
  })

  it('shows the order as finished when there is no active step', () => {
    render(<IntakeStepsProgress steps={steps} activeStatus={null} />)

    expect(screen.getByText('Pedido concluído')).toBeInTheDocument()
  })
})
