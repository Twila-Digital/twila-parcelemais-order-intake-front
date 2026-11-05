import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback } from 'react'
import type {
  IntakeSendTokenRequest,
  IntakeVerifyTokenRequest,
} from '@/domain/intake.domain'
import { intakeService } from '.'

export const INTAKE_SEND_TOKEN_MUTATION_KEY = 'intake-send-token'
export const INTAKE_VERIFY_TOKEN_MUTATION_KEY = 'intake-verify-token'
export const INTAKE_START_QUERY_KEY = 'intake-start'
export const INTAKE_STEP_DATA_QUERY_KEY = 'intake-step-data'
export const INTAKE_SUBMIT_STEP_MUTATION_KEY = 'intake-submit-step'
export const INTAKE_REALTIME_TICKET_MUTATION_KEY = 'intake-realtime-ticket'

export function useSendIntakeTokenMutation(token: string) {
  return useMutation({
    mutationKey: [INTAKE_SEND_TOKEN_MUTATION_KEY, token],
    mutationFn: (body: IntakeSendTokenRequest) =>
      intakeService.sendToken(token, body),
  })
}

export function useVerifyIntakeTokenMutation(token: string) {
  return useMutation({
    mutationKey: [INTAKE_VERIFY_TOKEN_MUTATION_KEY, token],
    mutationFn: (body: IntakeVerifyTokenRequest) =>
      intakeService.verifyToken(token, body),
  })
}

export function useFetchIntakeStart(token: string) {
  const queryClient = useQueryClient()
  return useCallback(
    () =>
      queryClient.fetchQuery({
        queryKey: [INTAKE_START_QUERY_KEY, token],
        queryFn: () => intakeService.getStart(token),
        staleTime: 0,
        retry: false,
      }),
    [queryClient, token],
  )
}

export function useIntakeRealtimeTicketMutation(token: string) {
  return useMutation({
    mutationKey: [INTAKE_REALTIME_TICKET_MUTATION_KEY, token],
    mutationFn: () => intakeService.getRealtimeConnection(token),
  })
}

export function useIntakeStepDataQuery<T>(
  token: string,
  stepPath: string,
  initialData: T,
  {
    refetchInterval,
  }: { refetchInterval?: UseQueryOptions<T>['refetchInterval'] } = {},
) {
  return useQuery({
    queryKey: [INTAKE_STEP_DATA_QUERY_KEY, token, stepPath],
    queryFn: () => intakeService.getStepData<T>(token, stepPath),
    initialData,
    retry: false,
    refetchInterval,
  })
}

/** @public reservado para as próximas etapas */
export function useSubmitIntakeStepMutation<Body extends object>(
  token: string,
  stepPath: string,
) {
  return useMutation({
    mutationKey: [INTAKE_SUBMIT_STEP_MUTATION_KEY, token, stepPath],
    mutationFn: (body: Body) => intakeService.submitStep(token, stepPath, body),
  })
}
