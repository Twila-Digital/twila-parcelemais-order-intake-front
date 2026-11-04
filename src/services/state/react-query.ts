import { isServer, QueryClient } from '@tanstack/react-query'
import {
  ONE_DAY_IN_MILLISECONDS,
  ONE_MINUTE_IN_MILLISECONDS,
} from '@/constants/times'

const gcTime = ONE_DAY_IN_MILLISECONDS
const staleTime = ONE_MINUTE_IN_MILLISECONDS

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime,
        staleTime,
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  }

  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}
