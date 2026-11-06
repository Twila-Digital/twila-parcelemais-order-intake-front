import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IntakeOrderStatus } from '@/common/enums/intake-order-status.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type { IntakeStartResponse } from '@/domain/intake.domain'
import { requireActiveIntakeStep } from './require-intake-session'

const redirect = vi.hoisted(() =>
  vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT ${path}`)
  }),
)
const getIntakeAccessToken = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('next/navigation', () => ({ redirect }))
vi.mock('@/services/http/intake/server/intake-session', () => ({
  getIntakeAccessToken,
}))

function startWith(
  activeStatus: string | null,
  orderStatus = 'PendingPayment',
): IntakeStartResponse {
  return {
    orderId: 'order-1',
    order: { status: orderStatus as IntakeOrderStatus, externalStatus: null },
    dateAndStatus: {
      activeStatus: activeStatus as IntakeStepStatus | null,
      steps: [],
    },
  }
}

describe('requireActiveIntakeStep', () => {
  beforeEach(() => {
    redirect.mockClear()
    getIntakeAccessToken.mockResolvedValue('jwt')
  })

  it('sends to the verification without a session', async () => {
    getIntakeAccessToken.mockResolvedValue(null)

    await expect(
      requireActiveIntakeStep(
        'a/b',
        'dados-pessoais',
        startWith(IntakeStepStatus.UpdateProfile),
      ),
    ).rejects.toThrow('NEXT_REDIRECT /intake/a%2Fb')
  })

  it.each([
    [IntakeStepStatus.UpdateProfile, 'dados-pessoais'],
    [IntakeStepStatus.UpsertAddress, 'endereco-cobranca'],
    [IntakeStepStatus.UpdateTerm, 'parcelas'],
    [IntakeStepStatus.PaymentProfile, 'cartao'],
    [IntakeStepStatus.Biometry, 'biometria'],
    [IntakeStepStatus.StartSale, 'pedido-concluido'],
    ['SomethingNew', 'etapa-indisponivel'],
  ])('lets the active step %s stay on /%s', async (activeStatus, route) => {
    await requireActiveIntakeStep('abc', route, startWith(activeStatus))

    expect(redirect).not.toHaveBeenCalled()
  })

  it.each([
    [IntakeOrderStatus.Analysing, 'analise-credito'],
    [IntakeOrderStatus.Approved, 'credito-aprovado'],
    [IntakeOrderStatus.Canceled, 'pedido-cancelado'],
    [IntakeOrderStatus.UnavailableBalance, 'credito-negado'],
    [IntakeOrderStatus.NotAuthorized, 'credito-negado'],
    [IntakeOrderStatus.AnalysisExpired, 'credito-negado'],
  ])('lets a %s order stay on /%s', async (orderStatus, route) => {
    await requireActiveIntakeStep(
      'abc',
      route,
      startWith(IntakeStepStatus.UpsertAddress, orderStatus),
    )

    expect(redirect).not.toHaveBeenCalled()
  })

  it('takes a canceled order out of the step', async () => {
    await expect(
      requireActiveIntakeStep(
        'abc',
        'cartao',
        startWith(IntakeStepStatus.PaymentProfile, IntakeOrderStatus.Canceled),
      ),
    ).rejects.toThrow('NEXT_REDIRECT /intake/abc/pedido-cancelado')
  })

  it('sends a step outside the active one to the active step', async () => {
    await expect(
      requireActiveIntakeStep(
        'abc',
        'cartao',
        startWith(IntakeStepStatus.UpdateTerm),
      ),
    ).rejects.toThrow('NEXT_REDIRECT /intake/abc/parcelas')
  })
})
