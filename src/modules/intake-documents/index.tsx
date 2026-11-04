'use client'

import { toast } from '@twila-digital/components/alert'
import { Button } from '@twila-digital/components/button'
import { useState } from 'react'
import { IntakeStepStatus } from '@/common/enums/intake-step-status.enum'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { intakeFlowCopyRecord } from '@/common/records/intake-flow-copy.record'
import { intakeStepApiPathRecord } from '@/common/records/intake-step-api-path.record'
import { ILLUSTRATIONS } from '@/constants/illustrations'
import type {
  IntakeDocumentRequirement,
  IntakeDocumentsStepData,
} from '@/domain/intake.domain'
import { IntakeStepLayout } from '@/modules/intake/components/intake-step-layout'
import { useIntakeStepSubmit } from '@/modules/intake/hooks/use-intake-step-submit'
import type { IntakeStepScreenProps } from '@/modules/intake/types/intake-step-screen'
import {
  useIntakeStepDataQuery,
  useUploadIntakeDocument,
} from '@/services/http/intake/use-intake-service'
import { DocumentRow } from './components/document-row'
import { UploadDocumentDialog } from './components/upload-document-dialog'

const STEP_PATH = intakeStepApiPathRecord[IntakeStepStatus.IncludeDocument]

const REJECTED_DOCUMENTS = {
  title: 'Alguns documentos foram recusados',
  description: 'Reenvie os documentos marcados em vermelho para continuar.',
}

const MISSING_DOCUMENTS = {
  title: 'Faltam documentos',
  description: 'Envie todos os documentos da lista para continuar.',
}

export function IntakeDocuments({
  token,
  flow,
  header,
  data,
}: IntakeStepScreenProps<IntakeDocumentsStepData>) {
  const copy = intakeFlowCopyRecord[flow].documents
  const fieldSize = useFieldSize()
  const [selected, setSelected] = useState<IntakeDocumentRequirement | null>(
    null,
  )
  const stepData = useIntakeStepDataQuery(token, STEP_PATH, data).data ?? data
  const upload = useUploadIntakeDocument(token, STEP_PATH)
  const { finish, isSubmitting } = useIntakeStepSubmit(
    token,
    IntakeStepStatus.IncludeDocument,
  )
  const { requirements } = stepData

  async function handleSubmit() {
    if (requirements.some((item) => item.status === 'Rejected')) {
      toast.error({
        ...REJECTED_DOCUMENTS,
        orientation: 'vertical',
        closable: true,
      })
      return
    }
    if (!stepData.isComplete) {
      toast.error({
        ...MISSING_DOCUMENTS,
        orientation: 'vertical',
        closable: true,
      })
      return
    }
    await finish()
  }

  return (
    <>
      <IntakeStepLayout
        header={header}
        title={copy.title}
        description={copy.description}
        illustration={ILLUSTRATIONS.documents}
        action={
          <Button
            type='button'
            size={fieldSize}
            fullWidth
            loading={isSubmitting}
            disabled={upload.isUploading}
            onClick={handleSubmit}
          >
            Enviar documentos
          </Button>
        }
      >
        <ul className='flex flex-col gap-lg'>
          {requirements.map((requirement) => (
            <DocumentRow
              key={requirement.id}
              document={requirement}
              onSend={() => setSelected(requirement)}
            />
          ))}
        </ul>
      </IntakeStepLayout>

      <UploadDocumentDialog
        requirement={selected}
        onOpenChange={(open) => {
          if (open) return
          setSelected(null)
          upload.resetProgress()
        }}
        onUpload={upload.uploadDocument}
        isUploading={upload.isUploading}
        progress={upload.progress}
      />
    </>
  )
}
