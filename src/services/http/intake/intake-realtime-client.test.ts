import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { IntakeRealtimeUpdate } from '@/domain/intake.domain'
import { ApiError } from '@/services/error'
import { IntakeRealtimeClient } from './intake-realtime-client'

type FakeConnection = {
  url: string
  options: { accessTokenFactory: () => string; skipNegotiation: boolean }
  handlers: Record<string, (update: IntakeRealtimeUpdate) => void>
  closeHandler?: () => void
  start: ReturnType<typeof vi.fn>
  stop: ReturnType<typeof vi.fn>
}

const signalr = vi.hoisted(() => ({
  connections: [] as FakeConnection[],
  startResult: () => Promise.resolve(),
}))

vi.mock('@microsoft/signalr', () => {
  class HubConnectionBuilder {
    private connection = {} as FakeConnection
    withUrl(url: string, options: FakeConnection['options']) {
      this.connection = {
        url,
        options,
        handlers: {},
        start: vi.fn(() => signalr.startResult()),
        stop: vi.fn(() => Promise.resolve()),
      }
      return this
    }
    configureLogging() {
      return this
    }
    withAutomaticReconnect() {
      throw new Error('O guia proíbe a reconexão automática.')
    }
    build() {
      const connection = this.connection
      signalr.connections.push(connection)
      return {
        on: (method: string, handler: FakeConnection['handlers'][string]) => {
          connection.handlers[method] = handler
        },
        onclose: (handler: () => void) => {
          connection.closeHandler = handler
        },
        start: connection.start,
        stop: connection.stop,
      }
    }
  }
  return {
    HubConnectionBuilder,
    HttpTransportType: { WebSockets: 1 },
    LogLevel: { Warning: 3 },
  }
})

const update = (
  type: IntakeRealtimeUpdate['type'],
  data: IntakeRealtimeUpdate['data'] = {},
): IntakeRealtimeUpdate => ({
  type,
  orderId: 'o1',
  occurredAt: '2026-10-16T13:05:00.123+00:00',
  data,
})

function createClient(getConnection = vi.fn()) {
  const callbacks = {
    onUpdate: vi.fn(),
    onConnected: vi.fn(),
    onDisconnected: vi.fn(),
    onClosed: vi.fn(),
  }
  const client = new IntakeRealtimeClient({
    hubBaseUrl: 'https://api.test',
    getConnection,
    ...callbacks,
  })
  return { client, getConnection, ...callbacks }
}

const ticket = (value: string) => ({ ticket: value, accessToken: 'jwt' })

const flush = () => vi.advanceTimersByTimeAsync(0)

describe('IntakeRealtimeClient', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    signalr.connections.length = 0
    signalr.startResult = () => Promise.resolve()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('connects to the hub with the ticket, the token and no negotiation', async () => {
    const { client, onConnected } = createClient(
      vi.fn().mockResolvedValue(ticket('t 1')),
    )

    client.start()
    await flush()

    const [connection] = signalr.connections
    expect(connection.url).toBe(
      'https://api.test/api/signalr/intake/hub?ticket=t%201',
    )
    expect(connection.options.skipNegotiation).toBe(true)
    expect(connection.options.accessTokenFactory()).toBe('jwt')
    expect(onConnected).toHaveBeenCalledTimes(1)
  })

  it('reconnects with a new ticket after the connection drops', async () => {
    const getConnection = vi
      .fn()
      .mockResolvedValueOnce(ticket('first'))
      .mockResolvedValueOnce(ticket('second'))
    const { client, onDisconnected, onConnected } = createClient(getConnection)

    client.start()
    await flush()
    signalr.connections[0].closeHandler?.()

    expect(onDisconnected).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1000)

    expect(getConnection).toHaveBeenCalledTimes(2)
    expect(signalr.connections[1].url).toContain('ticket=second')
    expect(onConnected).toHaveBeenCalledTimes(2)
  })

  it('backs off while the ticket keeps failing', async () => {
    const getConnection = vi
      .fn()
      .mockRejectedValue(new ApiError({ status: 500 }))
    const { client } = createClient(getConnection)

    client.start()
    await flush()
    expect(getConnection).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(getConnection).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(1999)
    expect(getConnection).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(1)
    expect(getConnection).toHaveBeenCalledTimes(3)
  })

  it.each([404, 410])(
    'stops for good when the ticket returns %i',
    async (status) => {
      const getConnection = vi.fn().mockRejectedValue(new ApiError({ status }))
      const { client, onClosed } = createClient(getConnection)

      client.start()
      await flush()
      await vi.advanceTimersByTimeAsync(60_000)

      expect(onClosed).toHaveBeenCalledTimes(1)
      expect(getConnection).toHaveBeenCalledTimes(1)
    },
  )

  it('does not reconnect when the session expired', async () => {
    const getConnection = vi
      .fn()
      .mockRejectedValue(new ApiError({ status: 401 }))
    const { client, onClosed } = createClient(getConnection)

    client.start()
    await flush()
    await vi.advanceTimersByTimeAsync(60_000)

    expect(getConnection).toHaveBeenCalledTimes(1)
    expect(onClosed).not.toHaveBeenCalled()
  })

  it.each([
    'Canceled',
    'UnavailableBalance',
    'NotAuthorized',
    'AnalysisExpired',
  ])(
    'forwards updates and closes for good when the order moves to %s',
    async (status) => {
      const getConnection = vi.fn().mockResolvedValue(ticket('t'))
      const { client, onUpdate, onClosed } = createClient(getConnection)

      client.start()
      await flush()
      const [connection] = signalr.connections
      const activeStatus = update('ActiveStatusChanged', {
        activeStatus: 'Biometry',
      })
      connection.handlers.IntakeUpdated(activeStatus)
      connection.handlers.IntakeUpdated(
        update('ProposalStatusChanged', { status }),
      )
      connection.closeHandler?.()
      await vi.advanceTimersByTimeAsync(60_000)

      expect(onUpdate).toHaveBeenCalledWith(activeStatus)
      expect(onClosed).toHaveBeenCalledTimes(1)
      expect(connection.stop).toHaveBeenCalled()
      expect(getConnection).toHaveBeenCalledTimes(1)
    },
  )

  it.each(['Analysing', 'Approved', 'PendingPayment'])(
    'keeps listening when the order moves to %s',
    async (status) => {
      const getConnection = vi.fn().mockResolvedValue(ticket('t'))
      const { client, onUpdate, onClosed } = createClient(getConnection)

      client.start()
      await flush()
      const [connection] = signalr.connections
      const statusChanged = update('ProposalStatusChanged', { status })
      connection.handlers.IntakeUpdated(statusChanged)

      expect(onUpdate).toHaveBeenCalledWith(statusChanged)
      expect(onClosed).not.toHaveBeenCalled()
      expect(connection.stop).not.toHaveBeenCalled()
    },
  )

  it('stops reconnecting once stopped', async () => {
    const getConnection = vi.fn().mockResolvedValue(ticket('t'))
    const { client, onDisconnected } = createClient(getConnection)

    client.start()
    await flush()
    client.stop()
    signalr.connections[0].closeHandler?.()
    await vi.advanceTimersByTimeAsync(60_000)

    expect(onDisconnected).not.toHaveBeenCalled()
    expect(getConnection).toHaveBeenCalledTimes(1)
  })
})
