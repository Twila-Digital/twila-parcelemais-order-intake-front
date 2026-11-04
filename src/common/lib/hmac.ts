import 'server-only'
import { createHmac, randomUUID } from 'node:crypto'

type SignIntakeRequestInput = {
  secret: string
  method: 'GET' | 'POST'
  pathAndQuery: string
  token: string
  body?: string
  now?: number
  nonce?: string
}

export function signIntakeRequest({
  secret,
  method,
  pathAndQuery,
  token,
  body = '',
  now = Date.now(),
  nonce = randomUUID(),
}: SignIntakeRequestInput): Record<string, string> {
  const timestamp = Math.floor(now / 1000).toString()
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}\n${nonce}\n${method}\n${pathAndQuery}\n${token}\n`)
    .update(body)
    .digest('hex')

  return {
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Signature': signature,
  }
}
