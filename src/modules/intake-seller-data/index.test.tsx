import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IntakeFlow } from '@/common/enums/intake-flow.enum'
import { ApiError } from '@/services/error'
import { renderWithProviders } from '@/tests/render-with-providers'
import { IntakeSellerData } from '.'

const intakeService = vi.hoisted(() => ({ submitStep: vi.fn() }))

vi.mock('@/services/http/intake', () => ({ intakeService }))
vi.mock('next/image', () => ({ default: () => null }))

function renderScreen() {
  renderWithProviders(
    <IntakeSellerData
      token='abc'
      flow={IntakeFlow.BuyerFinancing}
      header={null}
      data={{ sellerLink: null }}
    />,
  )
}

async function submitValidSeller() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/Celular/), '11977776666')
  await user.type(screen.getByLabelText(/E-mail/), 'vendedor@email.com')
  await user.click(
    screen.getByRole('button', { name: 'Enviar dados do vendedor' }),
  )
}

describe('IntakeSellerData', () => {
  beforeEach(() => {
    intakeService.submitStep.mockReset()
  })

  it('shows the invalid seller phone under the phone field', async () => {
    intakeService.submitStep.mockRejectedValue(
      new ApiError({
        status: 400,
        type: 'Intake.NotifySellerPhoneInvalid',
        detail: 'Informe um celular válido do vendedor.',
      }),
    )
    renderScreen()

    await submitValidSeller()

    expect(
      await screen.findByText('Informe um celular válido do vendedor.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/Celular/)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })

  it('shows the invalid email under the email field', async () => {
    intakeService.submitStep.mockRejectedValue(
      new ApiError({
        status: 400,
        type: 'ValidationError',
        errors: [
          {
            code: 'Proposal.InvalidEmail',
            message: 'O campo E-mail informado é inválido',
          },
        ],
      }),
    )
    renderScreen()

    await submitValidSeller()

    expect(
      await screen.findByText('O campo E-mail informado é inválido'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/E-mail/)).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  })
})
