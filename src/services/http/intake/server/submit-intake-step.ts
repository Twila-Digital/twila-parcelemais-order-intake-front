import 'server-only'
import type { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import type { IntakeServerResponse } from './intake-server-fetch'

export type SubmitIntakeStepResult =
  | { ok: false; reason: 'invalid-body' | 'no-submit' }
  | { ok: true; response: IntakeServerResponse<unknown> }

// Cada etapa com formulário valida o corpo com Zod e o traduz para a API aqui.
export async function submitIntakeStep(
  _token: string,
  _status: IntakeStepStatus,
  _body: unknown,
  _accessToken: string,
): Promise<SubmitIntakeStepResult> {
  return { ok: false, reason: 'no-submit' }
}
