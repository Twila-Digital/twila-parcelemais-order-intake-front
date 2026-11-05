import {
  HttpTransportType,
  type HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from '@microsoft/signalr'
import { IntakeProposalStatus } from '@/common/enums/intake-proposal-status.enum'
import {
  CLOSED_LINK_STATUSES,
  SESSION_ERROR_STATUSES,
} from '@/constants/http-status'
import { ONE_SECOND_IN_MILLISECONDS } from '@/constants/times'
import type {
  IntakeRealtimeConnection,
  IntakeRealtimeUpdate,
} from '@/domain/intake.domain'
import { hasApiErrorStatus } from '@/services/error'

const HUB_PATH = '/api/signalr/intake/hub'
const UPDATE_METHOD = 'IntakeUpdated'
const PROPOSAL_STATUS_CHANGED = 'ProposalStatusChanged'

const OPEN_PROPOSAL_STATUSES: ReadonlySet<string | null | undefined> = new Set([
  IntakeProposalStatus.Analysing,
  IntakeProposalStatus.Approved,
])

const RECONNECT_DELAYS_IN_MILLISECONDS = [1, 2, 5, 10].map(
  (seconds) => seconds * ONE_SECOND_IN_MILLISECONDS,
)
const LAST_RECONNECT_DELAY_IN_MILLISECONDS = 30 * ONE_SECOND_IN_MILLISECONDS

type IntakeRealtimeClientOptions = {
  hubBaseUrl: string
  getConnection: () => Promise<IntakeRealtimeConnection>
  onUpdate: (update: IntakeRealtimeUpdate) => void
  onConnected: () => void
  onDisconnected: () => void
  onClosed: () => void
}

export class IntakeRealtimeClient {
  private connection: HubConnection | undefined
  private attempt = 0
  private isStopped = true
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined

  constructor(private readonly options: IntakeRealtimeClientOptions) {}

  start() {
    this.isStopped = false
    void this.connect()
  }

  stop() {
    this.isStopped = true
    clearTimeout(this.reconnectTimer)
    const connection = this.connection
    this.connection = undefined
    void connection?.stop()
  }

  private async connect() {
    if (this.isStopped) return

    let realtime: IntakeRealtimeConnection
    try {
      realtime = await this.options.getConnection()
    } catch (error) {
      if (hasApiErrorStatus(error, SESSION_ERROR_STATUSES)) {
        this.stop()
        return
      }
      if (hasApiErrorStatus(error, CLOSED_LINK_STATUSES)) {
        this.close()
        return
      }
      this.scheduleReconnect()
      return
    }
    if (this.isStopped) return

    const connection = new HubConnectionBuilder()
      .withUrl(
        `${this.options.hubBaseUrl}${HUB_PATH}?ticket=${encodeURIComponent(realtime.ticket)}`,
        {
          accessTokenFactory: () => realtime.accessToken,
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        },
      )
      .configureLogging(LogLevel.Warning)
      .build()

    connection.on(UPDATE_METHOD, (update: IntakeRealtimeUpdate) =>
      this.handleUpdate(update),
    )
    connection.onclose(() => {
      if (this.connection !== connection) return
      this.connection = undefined
      this.options.onDisconnected()
      this.scheduleReconnect()
    })
    this.connection = connection

    try {
      await connection.start()
    } catch {
      if (this.connection === connection) {
        this.connection = undefined
        this.scheduleReconnect()
      }
      return
    }

    if (this.connection !== connection) return
    this.attempt = 0
    this.options.onConnected()
  }

  private handleUpdate(update: IntakeRealtimeUpdate) {
    if (
      update.type === PROPOSAL_STATUS_CHANGED &&
      !OPEN_PROPOSAL_STATUSES.has(update.data.status)
    ) {
      this.close()
      return
    }
    this.options.onUpdate(update)
  }

  private close() {
    this.stop()
    this.options.onClosed()
  }

  private scheduleReconnect() {
    if (this.isStopped) return
    const delay =
      RECONNECT_DELAYS_IN_MILLISECONDS[this.attempt] ??
      LAST_RECONNECT_DELAY_IN_MILLISECONDS
    this.attempt += 1
    this.reconnectTimer = setTimeout(() => void this.connect(), delay)
  }
}
