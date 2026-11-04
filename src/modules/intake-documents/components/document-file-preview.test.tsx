import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { DocumentFilePreview } from './document-file-preview'

const file = new File(['abc'], 'cnh.pdf', { type: 'application/pdf' })

describe('DocumentFilePreview', () => {
  it('shows the file name and the upload progress', () => {
    render(
      <DocumentFilePreview
        file={file}
        progress={40}
        isUploading
        onRemove={vi.fn()}
      />,
    )

    expect(screen.getByText('cnh.pdf')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '40',
    )
    expect(
      screen.getByRole('button', { name: 'Remover cnh.pdf' }),
    ).toBeDisabled()
  })

  it('removes the file when not uploading', async () => {
    const onRemove = vi.fn()
    render(
      <DocumentFilePreview
        file={file}
        progress={0}
        isUploading={false}
        onRemove={onRemove}
      />,
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Remover cnh.pdf' }),
    )

    expect(onRemove).toHaveBeenCalledOnce()
  })
})
