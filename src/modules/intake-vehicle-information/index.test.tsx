import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IntakeFlow } from '@/common/enums/intake-flow.enum'
import { ApiError } from '@/services/error'
import { advanceIntakeStep } from '@/tests/intake-step-mocks'
import { renderWithProviders } from '@/tests/render-with-providers'
import { IntakeVehicleInformation } from '.'

const intakeService = vi.hoisted(() => ({ submitStep: vi.fn() }))

vi.mock('@/services/http/intake', () => ({ intakeService }))
vi.mock('next/image', () => ({ default: () => null }))

function renderScreen(modelYear?: number) {
  renderWithProviders(
    <IntakeVehicleInformation
      token='abc'
      flow={IntakeFlow.BuyerLoan}
      header={null}
      data={{ modelYear }}
    />,
  )
}

async function fillValidVehicle() {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(/Placa/), 'abc1d23')
  await user.type(screen.getByLabelText(/Renavam/), '00000000019')
  await user.type(screen.getByLabelText(/Chassi/), '9bwzzz377vt004251')
  await user.type(screen.getByLabelText(/Ano de fabricação/), '2023')
  await user.click(screen.getByRole('combobox', { name: /Cor/ }))
  await user.click(await screen.findByRole('option', { name: 'Prata' }))
  return user
}

const submitButton = () =>
  screen.getByRole('button', { name: 'Enviar dados complementares' })

describe('IntakeVehicleInformation', () => {
  beforeEach(() => {
    intakeService.submitStep.mockReset()
    intakeService.submitStep.mockResolvedValue(undefined)
  })

  it('uppercases what is typed in the plate and the chassi', async () => {
    renderScreen()

    await userEvent.type(screen.getByLabelText(/Chassi/), '9bwzzz377vt004251')
    await userEvent.type(screen.getByLabelText(/Placa/), 'abc1d23')

    expect(screen.getByLabelText(/Chassi/)).toHaveValue('9BWZZZ377VT004251')
    expect(screen.getByLabelText(/Placa/)).toHaveValue('ABC1D23')
  })

  it('shows what is missing when submitting an empty form', async () => {
    renderScreen()

    await userEvent.click(submitButton())

    expect(await screen.findByText('A placa não é válida')).toBeInTheDocument()
    expect(
      screen.getByText('O renavam deve ter 11 dígitos'),
    ).toBeInTheDocument()
    expect(screen.getByText('A cor é obrigatória')).toBeInTheDocument()
    expect(
      screen.getByText('O chassi deve ter 17 caracteres'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('O ano de fabricação é obrigatório'),
    ).toBeInTheDocument()
    expect(intakeService.submitStep).not.toHaveBeenCalled()
  })

  it('accepts only digits in the manufacturing year', async () => {
    renderScreen()

    await userEvent.type(screen.getByLabelText(/Ano de fabricação/), '2a0b23')

    expect(screen.getByLabelText(/Ano de fabricação/)).toHaveValue('2023')
  })

  it('rejects an out of range manufacturing year', async () => {
    renderScreen()
    const user = await fillValidVehicle()
    await user.clear(screen.getByLabelText(/Ano de fabricação/))
    await user.type(screen.getByLabelText(/Ano de fabricação/), '1000')

    await user.click(submitButton())

    expect(
      await screen.findByText(/^Informe um ano entre 1950 e \d{4}$/),
    ).toBeInTheDocument()
    expect(intakeService.submitStep).not.toHaveBeenCalled()
  })

  it('rejects a manufacturing year after the model year', async () => {
    renderScreen(2022)
    const user = await fillValidVehicle()

    await user.click(submitButton())

    expect(
      await screen.findByText(
        'O ano de fabricação não pode ser maior que o ano do modelo (2022)',
      ),
    ).toBeInTheDocument()
    expect(intakeService.submitStep).not.toHaveBeenCalled()
  })

  it('sends the vehicle with the backend field names', async () => {
    renderScreen()
    const user = await fillValidVehicle()

    await user.click(submitButton())

    await waitFor(() =>
      expect(intakeService.submitStep).toHaveBeenCalledWith(
        'abc',
        'vehicle-information',
        {
          licensePlate: 'ABC1D23',
          renavam: '00000000019',
          color: 'Prata',
          chassi: '9BWZZZ377VT004251',
          manufactureYear: 2023,
        },
      ),
    )
    await waitFor(() => expect(advanceIntakeStep).toHaveBeenCalledOnce())
  })

  it('maps an API error to its field', async () => {
    intakeService.submitStep.mockRejectedValue(
      new ApiError({
        status: 400,
        errors: [
          { code: 'Proposal.InvalidRenavam', message: 'Renavam recusado.' },
        ],
      }),
    )
    renderScreen()
    const user = await fillValidVehicle()

    await user.click(submitButton())

    expect(await screen.findByText('Renavam recusado.')).toBeInTheDocument()
  })

  it('translates the color format error, which the API sends in English', async () => {
    intakeService.submitStep.mockRejectedValue(
      new ApiError({
        status: 400,
        type: 'ValidationError',
        errors: [
          {
            code: 'RegularExpressionValidator',
            message: "'Color' is not in the correct format.",
          },
        ],
      }),
    )
    renderScreen()
    const user = await fillValidVehicle()

    await user.click(submitButton())

    expect(
      await screen.findByText('Informe uma cor válida, sem números.'),
    ).toBeInTheDocument()
  })
})
