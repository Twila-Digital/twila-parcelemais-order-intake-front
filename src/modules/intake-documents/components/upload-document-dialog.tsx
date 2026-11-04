'use client'

import { faFileLines } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Alert } from '@twila-digital/components/alert'
import { Button } from '@twila-digital/components/button'
import { DocumentUpload } from '@twila-digital/components/document-upload'
import { Radio, RadioGroup } from '@twila-digital/components/radio'
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@twila-digital/components/responsive-dialog'
import { Tabs, TabsList, TabsTab } from '@twila-digital/components/tabs'
import { useState } from 'react'
import { useFieldSize } from '@/common/hooks/use-field-size'
import type {
  IntakeDocumentAlternative,
  IntakeDocumentRequirement,
} from '@/domain/intake.domain'
import { getApiErrorMessage } from '@/services/api-error-handler'
import type {
  UploadIntakeDocumentInput,
  UploadProgressByDocument,
} from '@/services/http/intake/use-intake-service'
import { S3UploadError } from '@/services/http/s3/s3-service'
import {
  ACCEPTED_DOCUMENT_EXTENSIONS,
  ACCEPTED_DOCUMENT_LABEL,
  MAX_DOCUMENT_SIZE_IN_BYTES,
  MAX_DOCUMENT_SIZE_LABEL,
} from '../constants/documents'
import { DocumentFilePreview } from './document-file-preview'

const DRIVER_LICENSE_FORMAT_LABELS: Record<string, string> = {
  DRIVER_LICENSE: 'CNH física',
  DIGITAL_DRIVER_LICENSE: 'CNH digital',
}
const DRIVER_LICENSE_OPTION_LABEL = 'CNH'
const MISSING_FORMAT_MESSAGE = 'Selecione se a CNH é física ou digital.'

const DRIVER_LICENSE_WARNING =
  'Se for CNH física, envie fora do plástico e aberta, mostrando frente e verso.'
const DRIVER_LICENSE_DESCRIPTION =
  'Envie uma CNH legível e dentro do prazo de validade.'
const DIALOG_DESCRIPTION =
  'Envie um arquivo legível, em PDF, JPG ou PNG, dentro do prazo de validade.'
const UPLOAD_FAILED_MESSAGE = 'Não foi possível enviar o documento.'

function getUploadErrorMessage(error: unknown) {
  if (error instanceof S3UploadError) {
    // biome-ignore lint/suspicious/noConsole: diagnóstico de upload no browser
    console.error('[Intake] S3 upload failed', {
      status: error.status,
      code: error.code,
    })
    return error.message
  }
  // biome-ignore lint/suspicious/noConsole: diagnóstico de upload no browser
  console.error('[Intake] Document upload failed', error)
  return getApiErrorMessage(error, { defaultMessage: UPLOAD_FAILED_MESSAGE })
}

function getMultipleFilesWarning(label: string, count: number) {
  const where = count === 2 ? 'nas duas etapas' : 'em todas as etapas'
  return `Se o documento já incluir ${label}, envie o mesmo arquivo ${where}.`
}

function getDialogCopy(
  requirementName: string | undefined,
  option: DocumentOption | undefined,
  hasManyOptions: boolean,
) {
  if (option?.isDriverLicense) {
    return {
      title: DRIVER_LICENSE_OPTION_LABEL,
      description: DRIVER_LICENSE_DESCRIPTION,
    }
  }
  const documentCount = option?.alternatives[0]?.documents.length ?? 0
  return {
    title: hasManyOptions ? option?.label : requirementName,
    description:
      documentCount > 1
        ? `Envie ${option?.label} legíveis e dentro do prazo de validade.`
        : DIALOG_DESCRIPTION,
  }
}

function getAlternativeLabel(alternative: IntakeDocumentAlternative) {
  return alternative.documents.map((document) => document.shortName).join(' e ')
}

type UploadDocumentDialogProps = {
  requirement: IntakeDocumentRequirement | null
  onOpenChange: (open: boolean) => void
  onUpload: (input: UploadIntakeDocumentInput) => Promise<void>
  isUploading: boolean
  progress: UploadProgressByDocument
}

type FilesBySlot = Partial<Record<number, File>>

type DocumentOption = {
  label: string
  alternatives: IntakeDocumentAlternative[]
  isDriverLicense: boolean
}

function isDriverLicense(alternative: IntakeDocumentAlternative) {
  const [document] = alternative.documents
  return (
    alternative.documents.length === 1 &&
    document.code in DRIVER_LICENSE_FORMAT_LABELS
  )
}

function getOptions(alternatives: IntakeDocumentAlternative[]) {
  const driverLicenses = alternatives.filter(isDriverLicense)
  const options: DocumentOption[] = alternatives
    .filter((alternative) => !isDriverLicense(alternative))
    .map((alternative) => ({
      label: getAlternativeLabel(alternative),
      alternatives: [alternative],
      isDriverLicense: false,
    }))
  if (driverLicenses.length > 0) {
    options.unshift({
      label: DRIVER_LICENSE_OPTION_LABEL,
      alternatives: driverLicenses,
      isDriverLicense: true,
    })
  }
  return options
}

function UploadField({
  label,
  file,
  progress,
  isUploading,
  onFile,
}: {
  label?: string
  file: File | undefined
  progress: number
  isUploading: boolean
  onFile: (file: File | undefined) => void
}) {
  return (
    <div className='flex flex-col gap-md'>
      {label && (
        <p className='font-medium text-body-16 text-gray-11'>{label}</p>
      )}
      <DocumentUpload
        size='sm'
        accept={ACCEPTED_DOCUMENT_EXTENSIONS}
        maxSize={MAX_DOCUMENT_SIZE_IN_BYTES}
        acceptLabel={ACCEPTED_DOCUMENT_LABEL}
        maxSizeLabel={MAX_DOCUMENT_SIZE_LABEL}
        disabled={isUploading}
        onFilesChange={(files) => onFile(files[0])}
        onFilesRejected={() => onFile(undefined)}
      />
      {file && (
        <DocumentFilePreview
          file={file}
          progress={progress}
          isUploading={isUploading}
          onRemove={() => onFile(undefined)}
        />
      )}
    </div>
  )
}

export function UploadDocumentDialog({
  requirement,
  onOpenChange,
  onUpload,
  isUploading,
  progress,
}: UploadDocumentDialogProps) {
  const fieldSize = useFieldSize()
  const [optionIndex, setOptionIndex] = useState(0)
  const [formatIndex, setFormatIndex] = useState<number>()
  const [files, setFiles] = useState<FilesBySlot>({})
  const [error, setError] = useState<string>()
  const [formatError, setFormatError] = useState<string>()

  const options = getOptions(requirement?.alternatives ?? [])
  const option = options[optionIndex] ?? options[0]
  const asksFormat =
    Boolean(option?.isDriverLicense) && option.alternatives.length > 1
  const alternative = asksFormat
    ? formatIndex === undefined
      ? undefined
      : option.alternatives[formatIndex]
    : option?.alternatives[0]
  const documents = (alternative ?? option?.alternatives[0])?.documents ?? []
  const copy = getDialogCopy(requirement?.name, option, options.length > 1)
  const hasAllFiles =
    documents.length > 0 && documents.every((_, slot) => files[slot])

  function resetChoice() {
    setFormatIndex(undefined)
    setFiles({})
    setError(undefined)
    setFormatError(undefined)
  }

  function setFile(slot: number, file: File | undefined) {
    setFiles((current) => ({ ...current, [slot]: file }))
    setError(undefined)
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setOptionIndex(0)
      resetChoice()
    }
    onOpenChange(open)
  }

  async function handleSubmit() {
    if (!hasAllFiles) return
    if (!alternative) {
      setFormatError(MISSING_FORMAT_MESSAGE)
      return
    }
    try {
      await onUpload({
        files: alternative.documents.map((document, slot) => ({
          documentType: document.documentType,
          file: files[slot] as File,
        })),
      })
      handleOpenChange(false)
    } catch (uploadError) {
      setError(getUploadErrorMessage(uploadError))
    }
  }

  return (
    <ResponsiveDialog
      open={Boolean(requirement)}
      onOpenChange={handleOpenChange}
    >
      <ResponsiveDialogContent className='data-[slot=modal]:max-h-[calc(100dvh-2rem)]'>
        <ResponsiveDialogHeader
          className='shrink-0'
          icon={
            <FontAwesomeIcon
              icon={faFileLines}
              className='size-4 [--fa-width:1em]'
            />
          }
        />

        <ResponsiveDialogBody className='flex min-h-0 flex-col gap-md overflow-y-auto'>
          <div className='flex flex-col gap-sm'>
            <ResponsiveDialogTitle>{copy.title}</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {copy.description}
            </ResponsiveDialogDescription>
          </div>

          {options.length > 1 && (
            <Tabs
              value={String(optionIndex)}
              onValueChange={(value) => {
                setOptionIndex(Number(value))
                resetChoice()
              }}
            >
              <TabsList asTags aria-label='Qual documento você vai enviar'>
                {options.map((item, index) => (
                  <TabsTab key={item.label} value={String(index)}>
                    {item.label}
                  </TabsTab>
                ))}
              </TabsList>
            </Tabs>
          )}

          {asksFormat && (
            <RadioGroup
              className='flex-row gap-lg'
              aria-label='Tipo de CNH'
              value={formatIndex === undefined ? null : String(formatIndex)}
              error={Boolean(formatError)}
              errorMessage={formatError}
              onValueChange={(value) => {
                setFormatIndex(Number(value))
                setFormatError(undefined)
              }}
            >
              {option.alternatives.map((item, index) => (
                <Radio
                  key={item.documents[0].documentType}
                  value={String(index)}
                  label={DRIVER_LICENSE_FORMAT_LABELS[item.documents[0].code]}
                />
              ))}
            </RadioGroup>
          )}

          {(option?.isDriverLicense || documents.length > 1) && (
            <Alert
              type='warning'
              title={
                option?.isDriverLicense
                  ? DRIVER_LICENSE_WARNING
                  : getMultipleFilesWarning(option.label, documents.length)
              }
            />
          )}

          <div className='flex flex-col gap-xxl pt-xl'>
            {documents.map((document, slot) => (
              <UploadField
                key={`${option?.label}-${document.documentType}`}
                label={
                  documents.length > 1
                    ? `Envie aqui o ${document.shortName}`
                    : undefined
                }
                file={files[slot]}
                progress={progress[document.documentType] ?? 0}
                isUploading={isUploading}
                onFile={(file) => setFile(slot, file)}
              />
            ))}
          </div>

          {error && (
            <p role='alert' className='text-body-14 text-red-11'>
              {error}
            </p>
          )}
        </ResponsiveDialogBody>

        <ResponsiveDialogFooter className='flex shrink-0 flex-col gap-sm'>
          <Button
            type='button'
            size={fieldSize}
            fullWidth
            disabled={!hasAllFiles}
            loading={isUploading}
            onClick={handleSubmit}
          >
            Enviar documento
          </Button>
          <ResponsiveDialogClose
            render={
              <Button
                type='button'
                variant='tertiary'
                size={fieldSize}
                fullWidth
              />
            }
          >
            Cancelar
          </ResponsiveDialogClose>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}
