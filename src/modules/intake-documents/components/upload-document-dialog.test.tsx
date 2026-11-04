import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { IntakeDocumentRequirement } from '@/domain/intake.domain'
import { UploadDocumentDialog } from './upload-document-dialog'

const IDENTITY: IntakeDocumentRequirement = {
  id: '1-7-2-3',
  name: 'CNH, CNH Digital ou CPF e RG',
  status: 'Pending',
  alternatives: [
    {
      documents: [
        {
          documentType: 1,
          code: 'DRIVER_LICENSE',
          description: 'Carteira Nacional de Habilitação (CNH)',
          shortName: 'CNH',
        },
      ],
    },
    {
      documents: [
        {
          documentType: 7,
          code: 'DIGITAL_DRIVER_LICENSE',
          description: 'CNH Digital',
          shortName: 'CNH Digital',
        },
      ],
    },
    {
      documents: [
        {
          documentType: 2,
          code: 'SOCIAL_SECURITY_NUMBER',
          description: 'Cadastro de Pessoa Física (CPF)',
          shortName: 'CPF',
        },
        {
          documentType: 3,
          code: 'NATIONAL_IDENTITY_CARD',
          description: 'Carteira de Identidade (RG)',
          shortName: 'RG',
        },
      ],
    },
  ],
}

const DRIVER_LICENSE_ONLY: IntakeDocumentRequirement = {
  ...IDENTITY,
  id: '1-7',
  name: 'CNH ou CNH Digital',
  alternatives: IDENTITY.alternatives.slice(0, 2),
}

function renderDialog(
  requirement = IDENTITY,
  onUpload = vi.fn().mockResolvedValue(undefined),
) {
  render(
    <UploadDocumentDialog
      requirement={requirement}
      onOpenChange={vi.fn()}
      onUpload={onUpload}
      isUploading={false}
      progress={{}}
    />,
  )
  return onUpload
}

async function chooseFiles(count: number) {
  const inputs = document.querySelectorAll<HTMLInputElement>('input[type=file]')
  expect(inputs).toHaveLength(count)
  for (const input of inputs) {
    await userEvent.upload(
      input,
      new File(['%PDF'], 'doc.pdf', { type: 'application/pdf' }),
    )
  }
}

const submit = () =>
  userEvent.click(screen.getByRole('button', { name: 'Enviar documento' }))

describe('UploadDocumentDialog', () => {
  it('asks the CNH type with a radio instead of a tab per format', async () => {
    const onUpload = renderDialog(DRIVER_LICENSE_ONLY)

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    const radioGroup = screen.getByRole('radiogroup', { name: 'Tipo de CNH' })
    expect(within(radioGroup).getByText('CNH física')).toBeInTheDocument()
    expect(within(radioGroup).getByText('CNH digital')).toBeInTheDocument()
    expect(screen.getByText(/fora do plástico/)).toBeInTheDocument()

    await chooseFiles(1)
    await submit()
    expect(
      screen.getByText('Selecione se a CNH é física ou digital.'),
    ).toBeInTheDocument()
    expect(onUpload).not.toHaveBeenCalled()

    await userEvent.click(
      within(radioGroup).getByRole('radio', { name: 'CNH digital' }),
    )
    await submit()

    expect(onUpload).toHaveBeenCalledWith({
      files: [expect.objectContaining({ documentType: 7 })],
    })
  })

  it('keeps CPF and RG as a separate tab, one file per document', async () => {
    const onUpload = renderDialog()

    const tabs = within(screen.getByRole('tablist'))
    expect(tabs.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'CNH',
      'CPF e RG',
    ])
    expect(screen.getByRole('heading', { name: 'CNH' })).toBeInTheDocument()
    expect(
      screen.getByText('Envie uma CNH legível e dentro do prazo de validade.'),
    ).toBeInTheDocument()

    await userEvent.click(tabs.getByRole('tab', { name: 'CPF e RG' }))
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'CPF e RG' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Se o documento já incluir CPF e RG, envie o mesmo arquivo nas duas etapas.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Envie aqui o CPF')).toBeInTheDocument()

    await chooseFiles(2)
    await submit()

    expect(onUpload).toHaveBeenCalledWith({
      files: [
        expect.objectContaining({ documentType: 2 }),
        expect.objectContaining({ documentType: 3 }),
      ],
    })
  })
})
