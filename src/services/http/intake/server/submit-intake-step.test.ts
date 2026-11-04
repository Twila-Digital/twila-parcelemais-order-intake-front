import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { submitIntakeStep } from './submit-intake-step'

const intakeServerFetch = vi.hoisted(() => vi.fn())

vi.mock('server-only', () => ({}))
vi.mock('./intake-server-fetch', () => ({ intakeServerFetch }))

const OK = { ok: true, status: 200, data: null }

function calls() {
  return intakeServerFetch.mock.calls.map(([, path, { body }]) => [path, body])
}

describe('submitIntakeStep', () => {
  beforeEach(() => {
    intakeServerFetch.mockReset()
    intakeServerFetch.mockResolvedValue(OK)
  })

  it('translates the seller notification', async () => {
    await submitIntakeStep(
      'abc',
      IntakeStepStatus.NotifySeller,
      { sellerType: 'Store', phoneNumber: '11987654321', email: 'a@b.com' },
      'jwt',
    )

    expect(calls()).toEqual([
      [
        'intake/notify-seller',
        { isRetailer: true, email: 'a@b.com', phone: '11987654321' },
      ],
    ])
    expect(intakeServerFetch.mock.calls[0][2].accessToken).toBe('jwt')
  })

  it('translates the deposit account', async () => {
    await submitIntakeStep(
      'abc',
      IntakeStepStatus.IncludeDepositAccount,
      {
        bankCode: '341',
        accountType: 'Payment',
        agency: '0001',
        agencyDigit: 'x',
        account: '12345678',
        accountDigit: 'x',
        holderDocument: '52998224725',
      },
      'jwt',
    )

    expect(calls()).toEqual([
      [
        'intake/deposit-account',
        {
          depositAccount: {
            bankNumber: '341',
            agencyNumber: '0001',
            agencyDigit: 'X',
            accountNumber: '12345678',
            accountDigit: 'X',
            accountType: 3,
          },
          holderDocument: '52998224725',
        },
      ],
    ])
  })

  it('creates the seller account with the birth date as an offset', async () => {
    await submitIntakeStep(
      'abc',
      IntakeStepStatus.CreateAccount,
      {
        firstName: 'Ana',
        lastName: 'Lima',
        cpf: '52998224725',
        email: 'ana@b.com',
        dateOfBirth: '1990-05-20',
      },
      'jwt',
    )

    expect(calls()).toEqual([
      [
        'intake/account',
        {
          firstName: 'Ana',
          lastName: 'Lima',
          cpf: '52998224725',
          email: 'ana@b.com',
          dateOfBirth: '1990-05-20T00:00:00-03:00',
        },
      ],
    ])
  })

  it.each([true, false])(
    'sends the seller decision (%s)',
    async (isAccepted) => {
      await submitIntakeStep(
        'abc',
        IntakeStepStatus.DecisionSeller,
        { isAccepted },
        'jwt',
      )

      expect(calls()).toEqual([['intake/decision-seller', { isAccepted }]])
    },
  )

  it('translates the company details', async () => {
    await submitIntakeStep(
      'abc',
      IntakeStepStatus.IncludeEstablishmentDetails,
      {
        tradeName: 'Auto Exemplo',
        legalName: 'Auto Exemplo Ltda',
        document: '11222333000181',
        phone: '+551133334444',
        email: 'contato@auto.com',
        openingDate: '2015-03-10',
      },
      'jwt',
    )

    expect(calls()).toEqual([
      [
        'intake/establishment-details',
        {
          tradeName: 'Auto Exemplo',
          legalName: 'Auto Exemplo Ltda',
          document: '11222333000181',
          phone: '+551133334444',
          email: 'contato@auto.com',
          openingDate: '2015-03-10T00:00:00-03:00',
        },
      ],
    ])
  })

  it('rejects a company phone without the Brazil country code', async () => {
    const result = await submitIntakeStep(
      'abc',
      IntakeStepStatus.IncludeEstablishmentDetails,
      {
        tradeName: 'Auto Exemplo',
        legalName: 'Auto Exemplo Ltda',
        document: '11222333000181',
        phone: '1133334444',
        email: 'contato@auto.com',
        openingDate: '2015-03-10',
      },
      'jwt',
    )

    expect(result).toEqual({ ok: false, reason: 'invalid-body' })
    expect(intakeServerFetch).not.toHaveBeenCalled()
  })

  it('rejects an invalid body without calling the api', async () => {
    const result = await submitIntakeStep(
      'abc',
      IntakeStepStatus.IncludeVehicleExtraInformation,
      { licensePlate: '' },
      'jwt',
    )

    expect(result).toEqual({ ok: false, reason: 'invalid-body' })
    expect(intakeServerFetch).not.toHaveBeenCalled()
  })

  it('has no submission for steps finished by a partner', async () => {
    const result = await submitIntakeStep(
      'abc',
      IntakeStepStatus.InspectCar,
      {},
      'jwt',
    )

    expect(result).toEqual({ ok: false, reason: 'no-submit' })
  })
})
