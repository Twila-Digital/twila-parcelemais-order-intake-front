import type { NextRequest } from 'next/server'
import { z } from 'zod'
import type { IntakeConfirmDocumentRequest } from '@/domain/intake.domain'
import { badRequest } from '@/services/http/intake/bff/bff-response'
import { fetchWithIntakeSession } from '@/services/http/intake/bff/bff-session'
import { readJsonBody } from '@/services/http/intake/bff/read-json-body'

const bodySchema = z.object({
  key: z.string().min(1).max(1024),
  fileName: z.string().min(1).max(255),
  documentType: z.number().int().positive(),
})

export async function POST(
  req: NextRequest,
  ctx: RouteContext<'/api/intake/[token]/documentos'>,
) {
  const { token } = await ctx.params
  const parsed = bodySchema.safeParse(await readJsonBody(req))
  if (!parsed.success) return badRequest('Documento inválido.')

  const body: IntakeConfirmDocumentRequest = parsed.data
  return fetchWithIntakeSession<void>(token, 'intake/documents', {
    method: 'POST',
    body,
  })
}
