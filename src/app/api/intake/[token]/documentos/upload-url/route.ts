import type { NextRequest } from 'next/server'
import { z } from 'zod'
import type {
  IntakeDocumentUploadUrlRequest,
  IntakeDocumentUploadUrlResponse,
} from '@/domain/intake.domain'
import { badRequest } from '@/services/http/intake/bff/bff-response'
import { fetchWithIntakeSession } from '@/services/http/intake/bff/bff-session'
import { readJsonBody } from '@/services/http/intake/bff/read-json-body'

const bodySchema = z.object({
  documentType: z.number().int().positive(),
  fileName: z.string().min(1).max(255),
})

export async function POST(
  req: NextRequest,
  ctx: RouteContext<'/api/intake/[token]/documentos/upload-url'>,
) {
  const { token } = await ctx.params
  const parsed = bodySchema.safeParse(await readJsonBody(req))
  if (!parsed.success) return badRequest('Documento inválido.')

  const body: IntakeDocumentUploadUrlRequest = parsed.data
  return fetchWithIntakeSession<IntakeDocumentUploadUrlResponse>(
    token,
    'intake/documents/upload-url',
    { method: 'POST', body },
  )
}
