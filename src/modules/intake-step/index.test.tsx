import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type { IntakeStartResponse } from '@/domain/intake.domain'
import { IntakeStep } from '.'

const getIntakeStepData = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('@/env', () => ({
  env: { NEXT_PUBLIC_PARCELEMAIS_URL: 'https://staging.parcelemais.com.br' },
}))
vi.mock('@/services/http/intake/server/get-intake-order-summary', () => ({
  getIntakeOrderSummary: async () => null,
}))
vi.mock('@/services/http/intake/server/get-intake-step-data', () => ({
  getIntakeStepData,
}))
vi.mock('@/modules/intake-biometrics', () => ({
  IntakeBiometrics: ({ title }: { title: string }) => <h1>{title}</h1>,
}))

const START: IntakeStartResponse = {
  orderId: 'order-1',
  order: null,
  dateAndStatus: null,
}

async function renderStep(route: string) {
  render(await IntakeStep({ token: 'abc', route, start: START }))
}

describe('IntakeStep', () => {
  beforeEach(() => {
    getIntakeStepData.mockReset()
  })

  it.each([
    ['dados-pessoais', 'Dados pessoais'],
    ['endereco-cobranca', 'Endereço de cobrança'],
    ['parcelas', 'Escolha as parcelas'],
    ['cartao', 'Cadastre seu cartão'],
  ])('renders the placeholder of /%s', async (route, title) => {
    await renderStep(route)

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    expect(screen.getByText('Etapa em construção')).toBeInTheDocument()
  })

  it('renders the biometry with its data', async () => {
    getIntakeStepData.mockResolvedValue({ isAvailable: true })

    await renderStep('biometria')

    expect(getIntakeStepData).toHaveBeenCalledWith(
      'abc',
      IntakeStepStatus.Biometry,
    )
    expect(
      screen.getByRole('heading', { name: 'Confirme sua identidade' }),
    ).toBeInTheDocument()
  })

  it.each([
    ['analise-credito', 'Estamos analisando seu crédito'],
    ['credito-aprovado', 'Crédito aprovado!'],
    ['credito-negado', 'Tudo certo!'],
    ['pedido-concluido', 'Pedido concluído 🎉'],
    ['pedido-cancelado', 'Pedido cancelado'],
    ['etapa-indisponivel', 'Continue pelo WhatsApp'],
  ])('renders the screen of /%s', async (route, title) => {
    await renderStep(route)

    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
  })

  it('offers the support on a canceled order', async () => {
    await renderStep('pedido-cancelado')

    expect(
      screen.getByRole('link', { name: 'Falar com o suporte' }),
    ).toHaveAttribute('target', '_blank')
  })
})
