import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IntakeParticipant } from '@/common/enums/intake-participant.enum'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { getIntakeStepData } from './get-intake-step-data'

const getIntakeStart = vi.hoisted(() => vi.fn())
const intakeServerFetch = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  cache: <T>(fn: T) => fn,
}))
vi.mock('@/common/lib/datadog-server-logger', () => ({ logError: vi.fn() }))
vi.mock('./get-intake-start', () => ({ getIntakeStart }))
vi.mock('./intake-server-fetch', () => ({ intakeServerFetch }))
vi.mock('./intake-session', () => ({
  getIntakeAccessToken: async () => 'jwt',
}))

function startWith(data: object = {}) {
  getIntakeStart.mockResolvedValue({
    ok: true,
    data: {
      participant: IntakeParticipant.Buyer,
      proposalType: 'Financing',
      dateAndStatus: { activeStatus: null, steps: [] },
      situation: null,
      ...data,
    },
  })
}

describe('getIntakeStepData', () => {
  beforeEach(() => {
    getIntakeStart.mockReset()
    intakeServerFetch.mockReset()
  })

  it('loads the documents with the step pendencies', async () => {
    startWith({
      dateAndStatus: {
        activeStatus: 'IncludeDocument',
        steps: [
          {
            status: 'IncludeDocument',
            description: 'Documentos',
            isCompleted: false,
            pendencies: [
              {
                code: 'PROOF_RESIDENCE',
                description: null,
                reason: 'Ilegível',
              },
            ],
          },
        ],
      },
    })
    intakeServerFetch.mockResolvedValue({
      ok: true,
      status: 200,
      data: {
        participant: 'Buyer',
        isComplete: false,
        required: [
          {
            isFulfilled: false,
            alternatives: [
              {
                documents: [
                  {
                    documentType: 5,
                    code: 'PROOF_RESIDENCE',
                    description: 'Comprovante de Residência',
                    status: 'Invalid',
                  },
                ],
              },
            ],
          },
        ],
      },
    })

    const data = await getIntakeStepData(
      'abc',
      IntakeStepStatus.IncludeDocument,
    )

    expect(intakeServerFetch).toHaveBeenCalledWith(
      'abc',
      'intake/documents/required',
      { accessToken: 'jwt' },
    )
    expect(data?.requirements[0]).toEqual(
      expect.objectContaining({
        status: 'Rejected',
        rejectionReason: 'Ilegível',
      }),
    )
  })

  it('loads the banks from the intake endpoint', async () => {
    startWith()
    const banks = [{ number: '341', name: 'Itaú' }]
    intakeServerFetch.mockResolvedValue({ ok: true, status: 200, data: banks })

    const data = await getIntakeStepData(
      'abc',
      IntakeStepStatus.IncludeDepositAccount,
    )

    expect(data).toEqual({ banks, holderDocumentType: 'Cpf' })
    expect(intakeServerFetch).toHaveBeenCalledWith('abc', 'intake/banks', {
      accessToken: null,
    })
  })

  it.each([
    ['CreateAccount', 'Cpf'],
    ['IncludeEstablishmentDetails', 'Cnpj'],
  ])('asks the seller with %s for a %s holder', async (status, expected) => {
    startWith({
      participant: IntakeParticipant.Seller,
      dateAndStatus: {
        activeStatus: 'IncludeDepositAccount',
        steps: [
          { status, pendencies: [] },
          { status: 'IncludeDepositAccount', pendencies: [] },
        ],
      },
    })
    intakeServerFetch.mockResolvedValue({ ok: true, status: 200, data: [] })

    const data = await getIntakeStepData(
      'abc',
      IntakeStepStatus.IncludeDepositAccount,
    )

    expect(data).toEqual({ banks: [], holderDocumentType: expected })
  })

  it('flags the biometry as not available yet', async () => {
    startWith()
    intakeServerFetch.mockResolvedValue({
      ok: false,
      status: 409,
      problem: { status: 409, type: 'Intake.BiometryNotAvailable' },
    })

    expect(
      await getIntakeStepData('abc', IntakeStepStatus.AnalyseBiometric),
    ).toEqual(expect.objectContaining({ isAvailable: false, sessionUrl: null }))
  })

  it('returns null when the biometry fails', async () => {
    startWith()
    intakeServerFetch.mockResolvedValue({
      ok: false,
      status: 400,
      problem: { status: 400, type: 'Intake.BiometryUnexpectedError' },
    })

    expect(
      await getIntakeStepData('abc', IntakeStepStatus.AnalyseBiometric),
    ).toBeNull()
  })

  it('keeps the seller link optional', async () => {
    startWith()

    expect(
      await getIntakeStepData('abc', IntakeStepStatus.NotifySeller),
    ).toEqual({ sellerLink: null })
  })
})
