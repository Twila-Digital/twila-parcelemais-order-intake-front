'use client'

import { useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import {
  getIntakeEntryRoute,
  getIntakeStepRoute,
} from '@/common/records/intake-step-route.record'
import { getIntakeStepPath } from '@/common/utils/intake-path'
import { CLOSED_LINK_STATUSES } from '@/constants/http-status'
import { ONE_SECOND_IN_MILLISECONDS } from '@/constants/times'
import type { IntakeRealtimeUpdate } from '@/domain/intake.domain'
import { env } from '@/env'
import { IntakeRealtimeContext } from '@/modules/intake/hooks/use-intake-realtime'
import { hasApiErrorStatus } from '@/services/error'
import { IntakeRealtimeClient } from '@/services/http/intake/intake-realtime-client'
import {
  INTAKE_STEP_DATA_QUERY_KEY,
  useFetchIntakeStart,
  useIntakeRealtimeTicketMutation,
} from '@/services/http/intake/use-intake-service'

const FALLBACK_POLLING_INTERVAL_IN_MILLISECONDS =
  20 * ONE_SECOND_IN_MILLISECONDS

function getCurrentRoute(pathname: string) {
  return pathname.split('/')[3] || null
}

type IntakeRealtimeProviderProps = {
  token: string
  children: ReactNode
}

export function IntakeRealtimeProvider({
  token,
  children,
}: IntakeRealtimeProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const fetchStart = useFetchIntakeStart(token)
  const { mutateAsync: requestRealtimeConnection } =
    useIntakeRealtimeTicketMutation(token)
  const [isConnected, setIsConnected] = useState(false)
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname

  const goToRoute = useCallback(
    (route: string, refresh: boolean) => {
      if (route !== getCurrentRoute(pathnameRef.current)) {
        router.replace(getIntakeStepPath(token, route))
        return
      }
      if (refresh) router.refresh()
    },
    [router, token],
  )

  const syncWithStart = useCallback(
    async (refresh: boolean) => {
      try {
        const start = await fetchStart()
        goToRoute(getIntakeEntryRoute(start), refresh)
      } catch (error) {
        if (hasApiErrorStatus(error, CLOSED_LINK_STATUSES)) {
          router.refresh()
        }
      }
    },
    [fetchStart, goToRoute, router],
  )

  const refetchStepData = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: [INTAKE_STEP_DATA_QUERY_KEY, token],
      }),
    [queryClient, token],
  )

  const lastOccurredAtRef = useRef(new Map<string, number>())

  const handleUpdate = useCallback(
    (update: IntakeRealtimeUpdate) => {
      const occurredAt = Date.parse(update.occurredAt)
      const last = lastOccurredAtRef.current.get(update.type)
      if (last !== undefined && occurredAt <= last) return
      lastOccurredAtRef.current.set(update.type, occurredAt)

      switch (update.type) {
        case 'ActiveStatusChanged':
          goToRoute(getIntakeStepRoute(update.data.activeStatus ?? null), true)
          return
        case 'ProposalStatusChanged':
          void syncWithStart(true)
          return
        case 'BiometryStatusChanged':
          void refetchStepData()
          return
      }
    },
    [goToRoute, refetchStepData, syncWithStart],
  )

  const handlersRef = useRef({
    handleUpdate,
    syncWithStart,
    requestRealtimeConnection,
  })
  handlersRef.current = {
    handleUpdate,
    syncWithStart,
    requestRealtimeConnection,
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: reconecta quando o link (token) muda
  useEffect(() => {
    let hasConnected = false
    const client = new IntakeRealtimeClient({
      hubBaseUrl: env.NEXT_PUBLIC_WEBSOCKET_URL,
      getConnection: () => handlersRef.current.requestRealtimeConnection(),
      onUpdate: (update) => handlersRef.current.handleUpdate(update),
      onConnected: () => {
        setIsConnected(true)
        void handlersRef.current.syncWithStart(hasConnected)
        hasConnected = true
      },
      onDisconnected: () => setIsConnected(false),
      onClosed: () => {
        setIsConnected(false)
        router.refresh()
      },
    })
    client.start()
    return () => client.stop()
  }, [router, token])

  useEffect(() => {
    if (isConnected) return
    const interval = setInterval(
      () => void handlersRef.current.syncWithStart(false),
      FALLBACK_POLLING_INTERVAL_IN_MILLISECONDS,
    )
    return () => clearInterval(interval)
  }, [isConnected])

  return (
    <IntakeRealtimeContext.Provider value={{ isConnected }}>
      {children}
    </IntakeRealtimeContext.Provider>
  )
}
