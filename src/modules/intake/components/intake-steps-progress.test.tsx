import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { IntakeStepsProgress } from './intake-steps-progress'

// O enum só tem as etapas com tela; as demais chegam da API como texto
const IDENTITY_CHECK = 'IdentityCheck' as IntakeStepStatus
const PAYMENT = 'Payment' as IntakeStepStatus

const steps = [
  {
    status: IDENTITY_CHECK,
    description: 'Dados pessoais',
    isCompleted: true,
    completedAt: '2026-10-16T14:42:09.0193699+00:00',
  },
  {
    status: IntakeStepStatus.Biometry,
    description: 'Biometria e assinatura',
    isCompleted: false,
    completedAt: null,
  },
  {
    status: PAYMENT,
    description: 'Pagamento',
    isCompleted: false,
    completedAt: null,
  },
]

async function openSteps() {
  render(
    <IntakeStepsProgress
      steps={steps}
      activeStatus={IntakeStepStatus.Biometry}
    />,
  )
  await userEvent.click(screen.getByRole('button', { name: 'Ver etapas' }))
  return within(screen.getByRole('list', { name: 'Etapas do pedido' }))
}

describe('IntakeStepsProgress', () => {
  it('shows the active step and toggles the step list', async () => {
    render(
      <IntakeStepsProgress
        steps={steps}
        activeStatus={IntakeStepStatus.Biometry}
      />,
    )

    expect(screen.getByText('Biometria e assinatura')).toBeInTheDocument()
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
    expect(completed).toHaveTextContent('Dados pessoais')
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
})
