import {
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import type {
  IntakeCounterProposalDecisionRequest,
  IntakeSendTokenRequest,
  IntakeVerifyTokenRequest,
} from '@/domain/intake.domain'
import { s3Service } from '../s3'
import { intakeService } from '.'

export const INTAKE_SEND_TOKEN_MUTATION_KEY = 'intake-send-token'
export const INTAKE_VERIFY_TOKEN_MUTATION_KEY = 'intake-verify-token'
export const INTAKE_START_QUERY_KEY = 'intake-start'
export const INTAKE_STEP_DATA_QUERY_KEY = 'intake-step-data'
export const INTAKE_SUBMIT_STEP_MUTATION_KEY = 'intake-submit-step'
export const INTAKE_UPLOAD_DOCUMENT_MUTATION_KEY = 'intake-upload-document'
export const INTAKE_REALTIME_TICKET_MUTATION_KEY = 'intake-realtime-ticket'
export const INTAKE_DECIDE_COUNTER_PROPOSAL_MUTATION_KEY =
  'intake-decide-counter-proposal'

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

export function useSubmitIntakeStepMutation<Body extends object>(
  token: string,
  stepPath: string,
) {
  return useMutation({
    mutationKey: [INTAKE_SUBMIT_STEP_MUTATION_KEY, token, stepPath],
    mutationFn: (body: Body) => intakeService.submitStep(token, stepPath, body),
  })
}

export function useDecideCounterProposalMutation(token: string) {
  return useMutation({
    mutationKey: [INTAKE_DECIDE_COUNTER_PROPOSAL_MUTATION_KEY, token],
    mutationFn: (body: IntakeCounterProposalDecisionRequest) =>
      intakeService.decideCounterProposal(token, body),
  })
}

export type UploadIntakeDocumentInput = {
  files: { documentType: number; file: File }[]
}

export type UploadProgressByDocument = Partial<Record<number, number>>

export function useUploadIntakeDocument(token: string, stepPath: string) {
  const queryClient = useQueryClient()
  const [progress, setProgress] = useState<UploadProgressByDocument>({})

  const mutation = useMutation({
    mutationKey: [INTAKE_UPLOAD_DOCUMENT_MUTATION_KEY, token, stepPath],
    mutationFn: async ({ files }: UploadIntakeDocumentInput) => {
      setProgress({})

      await Promise.all(
        files.map(async ({ documentType, file }) => {
          const upload = await intakeService.getDocumentUploadUrl(token, {
            documentType,
            fileName: file.name,
          })

          await s3Service.uploadFileByPresignedPost(upload, file, (value) =>
            setProgress((current) => ({ ...current, [documentType]: value })),
          )

          await intakeService.confirmDocument(token, {
            key: upload.key,
            fileName: file.name,
            documentType,
          })
        }),
      )
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [INTAKE_STEP_DATA_QUERY_KEY, token, stepPath],
      }),
    onError: () => setProgress({}),
  })

  const resetProgress = useCallback(() => setProgress({}), [])

  return {
    uploadDocument: mutation.mutateAsync,
    isUploading: mutation.isPending,
    progress,
    resetProgress,
  }
}
