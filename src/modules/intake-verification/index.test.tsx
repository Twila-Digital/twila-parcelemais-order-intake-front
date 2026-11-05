import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/services/error'
import { renderWithProviders } from '@/tests/render-with-providers'
import { IntakeVerification } from '.'

const intakeService = vi.hoisted(() => ({
  sendToken: vi.fn(),
  verifyToken: vi.fn(),
}))
const refresh = vi.hoisted(() => vi.fn())
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }))

vi.mock('@/services/http/intake', () => ({ intakeService }))
vi.mock('@twila-digital/components/alert', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  toast,
}))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }))
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role='presentation'>{alt}</span>,
}))

function renderScreen() {
  renderWithProviders(<IntakeVerification token='abc' />)
}

async function chooseChannel(channel = 'Receber código via SMS') {
  const user = userEvent.setup({
    advanceTimers: (ms) => {
      if (vi.isFakeTimers()) vi.advanceTimersByTime(ms)
    },
  })
  renderScreen()
  await user.click(screen.getByRole('button', { name: channel }))
  return user
}

describe('IntakeVerification', () => {
  beforeEach(() => {
    toast.error.mockClear()
    toast.success.mockClear()
    intakeService.sendToken.mockReset()
    intakeService.sendToken.mockResolvedValue(undefined)
    intakeService.verifyToken.mockResolvedValue(undefined)
  })

  it('offers only the code channels, without a phone field', () => {
    renderScreen()

    expect(screen.queryByLabelText(/celular/i)).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Receber código via SMS' }),
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', { name: 'Receber código via WhatsApp' }),
    ).toBeEnabled()
    expect(
      screen.getByRole('button', { name: 'Confirmar código' }),
    ).toBeDisabled()
  })

  it.each([
    ['Receber código via SMS', 'sms'],
    ['Receber código via WhatsApp', 'wpp'],
  ])(
    'sends the code through the chosen channel (%s)',
    async (label, channel) => {
      await chooseChannel(label)

      await waitFor(() =>
        expect(intakeService.sendToken).toHaveBeenCalledWith('abc', {
          channel,
        }),
      )
      expect(
        await screen.findByLabelText('Código de verificação'),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: label })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(
        screen.getByRole('button', { name: 'Confirmar código' }),
      ).toBeEnabled()
    },
  )

  it('locks the channels while the resend countdown runs', async () => {
    await chooseChannel()
    await screen.findByLabelText('Código de verificação')

    expect(
      screen.getByRole('button', { name: 'Receber código via SMS' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Receber código via WhatsApp' }),
    ).toBeDisabled()
  })

  it('unselects the channel when sending fails', async () => {
    intakeService.sendToken.mockRejectedValue(new ApiError({ status: 500 }))

    await chooseChannel()

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Receber código via SMS' }),
      ).toHaveAttribute('aria-pressed', 'false'),
    )
    expect(
      screen.queryByLabelText('Código de verificação'),
    ).not.toBeInTheDocument()
  })

  it('resends through another channel once the countdown ends', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = await chooseChannel()
    await screen.findByLabelText('Código de verificação')

    await act(() => vi.advanceTimersByTimeAsync(61_000))
    await user.click(
      screen.getByRole('button', { name: 'Receber código via WhatsApp' }),
    )
    vi.useRealTimers()

    await waitFor(() =>
      expect(intakeService.sendToken).toHaveBeenLastCalledWith('abc', {
        channel: 'wpp',
      }),
    )
    expect(toast.success).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Código reenviado' }),
    )
  })

  it('confirms with a toast only when the code is resent', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const user = await chooseChannel('Receber código via WhatsApp')
    await screen.findByLabelText('Código de verificação')
    expect(toast.success).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTimeAsync(61_000))
    await user.click(screen.getByRole('button', { name: 'Reenviar código' }))
    vi.useRealTimers()

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Código reenviado' }),
      ),
    )
    expect(intakeService.sendToken).toHaveBeenCalledTimes(2)
    expect(intakeService.sendToken).toHaveBeenLastCalledWith('abc', {
      channel: 'wpp',
    })
  })

  it('asks for the code with a resend countdown after a rate limit', async () => {
    intakeService.sendToken.mockRejectedValue(new ApiError({ status: 429 }))

    await chooseChannel()

    expect(
      await screen.findByLabelText('Código de verificação'),
    ).toBeInTheDocument()
    expect(screen.getByText(/novo código em/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reenviar código' }),
    ).toBeDisabled()
  })

  it('verifies the code and goes straight to the active step', async () => {
    const user = await chooseChannel()

    await user.type(
      await screen.findByLabelText('Código de verificação'),
      '123456',
    )
    await user.click(screen.getByRole('button', { name: 'Confirmar código' }))

    await waitFor(() =>
      expect(intakeService.verifyToken).toHaveBeenCalledWith('abc', {
        code: '123456',
      }),
    )
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce())
    expect(
      screen.queryByText('Celular identificado com sucesso'),
    ).not.toBeInTheDocument()
  })

  it('shows a rejected code under the code field', async () => {
    intakeService.verifyToken.mockRejectedValue(
      new ApiError({
        status: 400,
        type: 'Intake.InvalidOtp',
        detail: 'Código inválido ou expirado.',
      }),
    )
    const user = await chooseChannel()

    await user.type(
      await screen.findByLabelText('Código de verificação'),
      '123456',
    )
    await user.click(screen.getByRole('button', { name: 'Confirmar código' }))

    expect(
      await screen.findByText('Código inválido ou expirado.'),
    ).toBeInTheDocument()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('shows a toast when the code could not be checked', async () => {
    intakeService.verifyToken.mockRejectedValue(
      new ApiError({
        status: 400,
        type: 'Intake.OtpVerifyFailed',
        detail: 'Não foi possível validar o código.',
      }),
    )
    const user = await chooseChannel()

    await user.type(
      await screen.findByLabelText('Código de verificação'),
      '123456',
    )
    await user.click(screen.getByRole('button', { name: 'Confirmar código' }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Não foi possível validar o código.',
        }),
      ),
    )
  })

  it('refreshes the page when the link was replaced', async () => {
    intakeService.sendToken.mockRejectedValue(new ApiError({ status: 404 }))

    await chooseChannel()

    await waitFor(() => expect(refresh).toHaveBeenCalledOnce())
  })
})
