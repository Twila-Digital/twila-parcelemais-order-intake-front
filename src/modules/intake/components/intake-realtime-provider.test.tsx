import { act, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { IntakeRealtimeUpdate } from '@/domain/intake.domain'
import { useIntakeRealtime } from '@/modules/intake/hooks/use-intake-realtime'
import { ApiError } from '@/services/error'
import { renderWithProviders } from '@/tests/render-with-providers'
import { IntakeRealtimeProvider } from './intake-realtime-provider'

type ClientOptions = {
  hubBaseUrl: string
  getConnection: () => Promise<unknown>
  onUpdate: (update: IntakeRealtimeUpdate) => void
  onConnected: () => void
  onDisconnected: () => void
  onClosed: () => void
}

const realtime = vi.hoisted(() => ({
  options: undefined as ClientOptions | undefined,
  start: vi.fn(),
  stop: vi.fn(),
}))
const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }))
const navigation = vi.hoisted(() => ({ pathname: '/intake/abc/documentos' }))
const intakeService = vi.hoisted(() => ({
  getStart: vi.fn(),
  getRealtimeConnection: vi.fn(),
}))
const toast = vi.hoisted(() => ({ warning: vi.fn() }))

vi.mock('@/services/http/intake/intake-realtime-client', () => ({
  IntakeRealtimeClient: class {
    constructor(options: ClientOptions) {
      realtime.options = options
    }
    start = realtime.start
    stop = realtime.stop
  },
}))
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => navigation.pathname,
}))
vi.mock('@/services/http/intake', () => ({ intakeService }))
vi.mock('@twila-digital/components/alert', () => ({ toast }))
vi.mock('@/env', () => ({
  env: { NEXT_PUBLIC_WEBSOCKET_URL: 'https://api.test' },
}))

function Status() {
  const { isConnected } = useIntakeRealtime()
  return <p>{isConnected ? 'conectado' : 'desconectado'}</p>
}

function renderProvider() {
  const result = renderWithProviders(
    <IntakeRealtimeProvider token='abc'>
      <Status />
    </IntakeRealtimeProvider>,
  )
  const options = realtime.options as ClientOptions
  return { ...result, options }
}

const update = (
  type: IntakeRealtimeUpdate['type'],
  data: IntakeRealtimeUpdate['data'],
  occurredAt = '2026-10-16T13:05:00.000Z',
): IntakeRealtimeUpdate => ({
  type,
  proposalId: 'p1',
  participant: 'Buyer' as IntakeRealtimeUpdate['participant'],
  occurredAt,
  data,
})

const startWith = (activeStatus: string | null) => ({
  dateAndStatus: { activeStatus, steps: [] },
})

describe('IntakeRealtimeProvider', () => {
  beforeEach(() => {
    navigation.pathname = '/intake/abc/documentos'
    intakeService.getStart.mockResolvedValue(startWith('IncludeDocument'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('connects once per tab and disconnects on unmount', () => {
    const { options, unmount } = renderProvider()

    expect(realtime.start).toHaveBeenCalledTimes(1)
    expect(options.hubBaseUrl).toBe('https://api.test')
    unmount()
    expect(realtime.stop).toHaveBeenCalledTimes(1)
  })

  it('asks for a new ticket through the realtime mutation', async () => {
    intakeService.getRealtimeConnection.mockResolvedValue({
      ticket: 't1',
      accessToken: 'jwt',
    })
    const { options } = renderProvider()

    let connection: unknown
    await act(async () => {
      connection = await options.getConnection()
    })

    expect(intakeService.getRealtimeConnection).toHaveBeenCalledWith('abc')
    expect(connection).toEqual({ ticket: 't1', accessToken: 'jwt' })
  })

  it('tells the screens whether it is connected', async () => {
    const { options } = renderProvider()
    expect(screen.getByText('desconectado')).toBeInTheDocument()

    await act(async () => options.onConnected())
    expect(screen.getByText('conectado')).toBeInTheDocument()

    act(() => options.onDisconnected())
    expect(screen.getByText('desconectado')).toBeInTheDocument()
  })

  it('goes to the new active step', () => {
    const { options } = renderProvider()

    act(() =>
      options.onUpdate(
        update('ActiveStatusChanged', { activeStatus: 'AnalyseBiometric' }),
      ),
    )

    expect(router.replace).toHaveBeenCalledWith('/intake/abc/biometria')
  })

  it('only refreshes when the active step is the current screen', () => {
    const { options } = renderProvider()

    act(() =>
      options.onUpdate(
        update('ActiveStatusChanged', { activeStatus: 'IncludeDocument' }),
      ),
    )

    expect(router.replace).not.toHaveBeenCalled()
    expect(router.refresh).toHaveBeenCalledTimes(1)
  })

  it.each(['Payment', 'Finished'])(
    'shows the finished screen for %s',
    (activeStatus) => {
      const { options } = renderProvider()

      act(() =>
        options.onUpdate(update('ActiveStatusChanged', { activeStatus })),
      )

      expect(router.replace).toHaveBeenCalledWith(
        '/intake/abc/proposta-finalizada',
      )
    },
  )

  it('ignores repeated or older messages', () => {
    const { options } = renderProvider()
    const message = update('ActiveStatusChanged', {
      activeStatus: 'AnalyseBiometric',
    })

    act(() => {
      options.onUpdate(message)
      options.onUpdate(message)
      options.onUpdate(
        update(
          'ActiveStatusChanged',
          { activeStatus: 'IncludeDepositAccount' },
          '2026-10-16T13:04:00.000Z',
        ),
      )
    })

    expect(router.replace).toHaveBeenCalledTimes(1)
  })

  it('warns about a refused document and reloads the data', () => {
    const { options, queryClient } = renderProvider()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    act(() =>
      options.onUpdate(
        update('DocumentStatusChanged', {
          documentType: 'PROOF_INCOME',
          description: 'Comprovante de Renda',
          status: 'Invalid',
          reason: 'Documento ilegível',
        }),
      ),
    )

    expect(toast.warning).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Comprovante de Renda recusado: Documento ilegível',
      }),
    )
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['intake-step-data', 'abc'],
    })
    expect(router.refresh).toHaveBeenCalled()
  })

  it('reloads the biometry when the Didit result changes', () => {
    const { options, queryClient } = renderProvider()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    act(() =>
      options.onUpdate(
        update('BiometryStatusChanged', { transactionStatus: 'Expired' }),
      ),
    )

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['intake-step-data', 'abc'],
    })
  })

  it('catches up with the start after reconnecting', async () => {
    intakeService.getStart.mockResolvedValue(startWith('AnalyseBiometric'))
    const { options } = renderProvider()

    await act(async () => options.onConnected())
    expect(router.replace).toHaveBeenCalledWith('/intake/abc/biometria')

    intakeService.getStart.mockResolvedValue(startWith('IncludeDocument'))
    await act(async () => options.onConnected())
    expect(router.refresh).toHaveBeenCalledTimes(1)
  })

  it('follows the start when the proposal status changes', async () => {
    intakeService.getStart.mockResolvedValue({
      participant: 'Buyer',
      proposal: { status: 'Analysing', externalStatus: null },
      dateAndStatus: null,
    })
    const { options } = renderProvider()

    await act(async () =>
      options.onUpdate(
        update('ProposalStatusChanged', { status: 'Analysing' }),
      ),
    )

    expect(router.replace).toHaveBeenCalledWith(
      '/intake/abc/proposta-em-analise',
    )
  })

  it('shows the closed proposal when the link ends', () => {
    const { options } = renderProvider()

    act(() => options.onClosed())

    expect(router.refresh).toHaveBeenCalledTimes(1)
  })

  it('polls the start only while disconnected', async () => {
    vi.useFakeTimers()
    intakeService.getStart.mockResolvedValue(startWith('AnalyseBiometric'))
    const { options } = renderProvider()

    await act(() => vi.advanceTimersByTimeAsync(20_000))
    expect(intakeService.getStart).toHaveBeenCalledTimes(1)
    expect(router.replace).toHaveBeenCalledWith('/intake/abc/biometria')

    await act(async () => options.onConnected())
    const callsWhenConnected = intakeService.getStart.mock.calls.length
    await act(() => vi.advanceTimersByTimeAsync(60_000))
    expect(intakeService.getStart).toHaveBeenCalledTimes(callsWhenConnected)
  })

  it('refreshes when the start says the link is closed', async () => {
    vi.useFakeTimers()
    intakeService.getStart.mockRejectedValue(new ApiError({ status: 410 }))
    renderProvider()

    await act(() => vi.advanceTimersByTimeAsync(20_000))

    expect(router.refresh).toHaveBeenCalledTimes(1)
  })
})
