'use client'

import {
  type DehydratedState,
  HydrationBoundary,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastProvider, ToastViewport } from '@twila-digital/components/alert'
import type { ReactNode } from 'react'
import type { DatadogConfig } from '@/config/datadog-config'
import { DatadogIdentifyUser } from '@/config/datadog-identify-user'
import { FeatureFlagsProvider } from '@/config/feature-flags/feature-flags-provider'
import { TOAST_AUTO_CLOSE_TIME_IN_MILLISECONDS } from '@/constants/toast'
import { getQueryClient } from '../state/react-query'

const TOAST_LIMIT = 5

export const AppProvider = ({
  children,
  dehydratedState,
  datadogConfig,
}: {
  children: ReactNode
  dehydratedState?: DehydratedState
  datadogConfig: DatadogConfig
}) => {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider
        limit={TOAST_LIMIT}
        timeout={TOAST_AUTO_CLOSE_TIME_IN_MILLISECONDS}
      >
        <HydrationBoundary state={dehydratedState}>
          <DatadogIdentifyUser />
          <FeatureFlagsProvider datadogConfig={datadogConfig}>
            {children}
          </FeatureFlagsProvider>
        </HydrationBoundary>
        <ReactQueryDevtools />
        {/* TODO: remove these overrides once the DS Toast matches the Alert (medium title, gray-11 description) */}
        <ToastViewport className='[&_[data-slot=alert-description]]:text-gray-11 [&_[data-slot=alert-title]]:font-medium' />
      </ToastProvider>
    </QueryClientProvider>
  )
}
