import { describe, expect, it } from 'vitest'
import type { IntakeApiRequiredDocuments } from '@/domain/intake-api.domain'
import { getIntakeDocuments } from './get-intake-documents'

const doc = (
  documentType: number,
  code: string,
  description: string,
  status: string | null = null,
) => ({
  documentType,
  code,
  description,
  status,
})

const RESPONSE: IntakeApiRequiredDocuments = {
  participant: 'Seller',
  isComplete: false,
  required: [
    {
      isFulfilled: true,
      alternatives: [
        {
          documents: [
            doc(5, 'PROOF_RESIDENCE', 'Comprovante de Residência', 'Valid'),
          ],
        },
      ],
    },
    {
      isFulfilled: false,
      alternatives: [
        {
          documents: [
            doc(1, 'DRIVER_LICENSE', 'Carteira Nacional de Habilitação (CNH)'),
          ],
        },
        { documents: [doc(7, 'DIGITAL_DRIVER_LICENSE', 'CNH Digital')] },
        {
          documents: [
            doc(2, 'SOCIAL_SECURITY_NUMBER', 'Cadastro de Pessoa Física (CPF)'),
            doc(3, 'NATIONAL_IDENTITY_CARD', 'Carteira de Identidade (RG)'),
          ],
        },
      ],
    },
    {
      isFulfilled: false,
      alternatives: [
        {
          documents: [
            doc(6, 'VEHICLE_DOCUMENT', 'Documento do Veículo', 'Invalid'),
          ],
        },
      ],
    },
  ],
}

describe('getIntakeDocuments', () => {
  it('turns each requirement into a row named after its alternatives', () => {
    const { requirements } = getIntakeDocuments(RESPONSE)

    expect(requirements.map((item) => [item.name, item.status])).toEqual([
      ['Comprovante de Residência', 'Sent'],
      ['CNH, CNH Digital ou CPF e RG', 'Pending'],
      ['Documento do Veículo', 'Rejected'],
    ])
    expect(
      requirements[1].alternatives[2].documents.map(
        (item) => item.documentType,
      ),
    ).toEqual([2, 3])
  })

  it('shows the rejection reason from the step pendency', () => {
    const { requirements } = getIntakeDocuments(RESPONSE, [
      {
        code: 'VEHICLE_DOCUMENT',
        description: 'Documento do Veículo',
        reason: 'Ilegível',
      },
    ])

    expect(requirements[2].rejectionReason).toBe('Ilegível')
    expect(requirements[1].rejectionReason).toBeNull()
  })

  it('keeps whether the step is complete', () => {
    expect(
      getIntakeDocuments({ ...RESPONSE, isComplete: true }).isComplete,
    ).toBe(true)
  })

  it('uses the acronym as the short name and keeps single documents in full', () => {
    const { requirements } = getIntakeDocuments(RESPONSE)
    const [, identity, vehicle] = requirements

    expect(identity.name).toBe('CNH, CNH Digital ou CPF e RG')
    expect(
      identity.alternatives[2].documents.map((document) => document.shortName),
    ).toEqual(['CPF', 'RG'])
    expect(identity.alternatives[2].documents[0].description).toBe(
      'Cadastro de Pessoa Física (CPF)',
    )
    expect(vehicle.name).toBe('Documento do Veículo')
  })
})
