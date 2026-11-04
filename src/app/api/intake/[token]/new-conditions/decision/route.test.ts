import { beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from './route'

const intakeServerFetch = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('@/services/http/intake/server/intake-server-fetch', () => ({
  intakeServerFetch,
}))
vi.mock('@/services/http/intake/server/intake-session', () => ({
  getIntakeAccessToken: vi.fn().mockResolvedValue('access-token'),
  clearIntakeAccessToken: vi.fn(),
}))

const SIMULATION_ID = '9a2b0000-0000-4000-8000-000000000001'

function send(body: unknown) {
  const req = new Request(
    'http://localhost/api/intake/abc/new-conditions/decision',
    { method: 'POST', body: JSON.stringify(body) },
  )
  // biome-ignore lint/suspicious/noExplicitAny: NextRequest só precisa do json() aqui.
  return POST(req as any, { params: Promise.resolve({ token: 'abc' }) })
}

describe('POST new-conditions/decision', () => {
  beforeEach(() => {
    intakeServerFetch.mockResolvedValue({ ok: true, status: 200, data: null })
  })

  it('sends the decision with the session', async () => {
    const response = await send({
      simulationId: SIMULATION_ID,
      isAccepted: true,
    })

    expect(response.status).toBe(204)
    expect(intakeServerFetch).toHaveBeenCalledWith(
      'abc',
      'intake/decision-counter-proposal',
      {
        method: 'POST',
        body: { simulationId: SIMULATION_ID, isAccepted: true },
        accessToken: 'access-token',
      },
    )
  })

  it.each([
    { simulationId: SIMULATION_ID },
    { simulationId: 'abc', isAccepted: false },
  ])('rejects an invalid body', async (body) => {
    const response = await send(body)

    expect(response.status).toBe(400)
    expect(intakeServerFetch).not.toHaveBeenCalled()
  })

  it('passes a conflict through to the screen', async () => {
    intakeServerFetch.mockResolvedValue({
      ok: false,
      status: 409,
      problem: {
        status: 409,
        type: 'Intake.CounterProposalAlreadyDecided',
        detail: 'Esta condição já foi decidida.',
      },
    })

    const response = await send({
      simulationId: SIMULATION_ID,
      isAccepted: false,
    })

    expect(response.status).toBe(409)
    expect(await response.json()).toMatchObject({
      type: 'Intake.CounterProposalAlreadyDecided',
    })
  })
})
