import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IntakeFlow } from '@/common/enums/intake-flow.enum'
import type {
  IntakeDocumentRequirement,
  IntakeDocumentsStepData,
} from '@/domain/intake.domain'
import { advanceIntakeStep } from '@/tests/intake-step-mocks'
import { renderWithProviders } from '@/tests/render-with-providers'
import { IntakeDocuments } from '.'

const intakeService = vi.hoisted(() => ({
  getDocumentUploadUrl: vi.fn(),
  confirmDocument: vi.fn(),
  getStepData: vi.fn(),
}))
const s3Service = vi.hoisted(() => ({ uploadFileByPresignedPost: vi.fn() }))
const toast = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }))

vi.mock('@/services/http/intake', () => ({ intakeService }))
vi.mock('@/services/http/s3', () => ({ s3Service }))
vi.mock('@twila-digital/components/alert', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  toast,
}))
vi.mock('next/image', () => ({ default: () => null }))

function requirement(
  overrides: Partial<IntakeDocumentRequirement> = {},
): IntakeDocumentRequirement {
  return {
    id: '5',
    name: 'Comprovante de Residência',
    status: 'Pending',
    alternatives: [
      {
        documents: [
          {
            documentType: 5,
            code: 'PROOF_RESIDENCE',
            description: 'Comprovante de Residência',
            shortName: 'Comprovante de Residência',
          },
        ],
      },
    ],
    ...overrides,
  }
}

function renderScreen(data: IntakeDocumentsStepData) {
  intakeService.getStepData.mockResolvedValue(data)
  renderWithProviders(
    <IntakeDocuments
      token='abc'
      flow={IntakeFlow.BuyerFinancing}
      header={null}
      data={data}
    />,
  )
}

async function submit() {
  await userEvent.click(
    screen.getByRole('button', { name: 'Enviar documentos' }),
  )
}

describe('IntakeDocuments', () => {
  beforeEach(() => {
    toast.error.mockClear()
    intakeService.getDocumentUploadUrl.mockResolvedValue({
      url: 'https://s3.test',
      fields: { key: 'k' },
      key: 'k',
      expiresAt: '',
      maxSizeBytes: 10_485_760,
    })
    intakeService.confirmDocument.mockResolvedValue(undefined)
    s3Service.uploadFileByPresignedPost.mockResolvedValue(undefined)
  })

  it('blocks the submit while the requirements are not complete', async () => {
    renderScreen({ isComplete: false, requirements: [requirement()] })

    await submit()

    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Faltam documentos' }),
    )
  })

  it('uploads a document and reloads the list from the api', async () => {
    renderScreen({ isComplete: false, requirements: [requirement()] })
    intakeService.getStepData.mockResolvedValue({
      isComplete: true,
      requirements: [requirement({ status: 'Sent' })],
    })

    await userEvent.click(
      screen.getByRole('button', { name: 'Enviar Comprovante de Residência' }),
    )
    const dialog = await screen.findByRole('dialog')
    const input = dialog.querySelector<HTMLInputElement>('input[type=file]')
    if (!input) throw new Error('file input not found')
    await userEvent.upload(
      input,
      new File(['%PDF'], 'conta.pdf', { type: 'application/pdf' }),
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Enviar documento' }),
    )

    await waitFor(() =>
      expect(intakeService.confirmDocument).toHaveBeenCalledWith('abc', {
        key: 'k',
        fileName: 'conta.pdf',
        documentType: 5,
      }),
    )
    expect(
      await screen.findByRole('button', {
        name: 'Reenviar Comprovante de Residência',
      }),
    ).toBeInTheDocument()

    await submit()
    await waitFor(() => expect(advanceIntakeStep).toHaveBeenCalledOnce())
  })

  it('shows the rejection reason and blocks until it is resent', async () => {
    renderScreen({
      isComplete: false,
      requirements: [
        requirement({ status: 'Rejected', rejectionReason: 'Ilegível' }),
      ],
    })

    expect(screen.getByText('Ilegível')).toBeInTheDocument()
    expect(screen.getByText('(recusado, envie novamente)')).toBeInTheDocument()
    await submit()

    expect(toast.error).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Alguns documentos foram recusados' }),
    )
  })
})
