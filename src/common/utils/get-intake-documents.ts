import type {
  IntakeDocumentRequirement,
  IntakeDocumentStatus,
  IntakeDocumentsStepData,
  IntakePendency,
} from '@/domain/intake.domain'
import type {
  IntakeApiDocumentRequirement,
  IntakeApiDocumentType,
  IntakeApiRequiredDocuments,
} from '@/domain/intake-api.domain'

const REJECTED_STATUSES = new Set([
  'invalid',
  'rejected',
  'refused',
  'reproved',
])

const isRejected = (document: IntakeApiDocumentType) =>
  REJECTED_STATUSES.has(document.status?.toLowerCase() ?? '')

function getDocuments(requirement: IntakeApiDocumentRequirement) {
  return (requirement.alternatives ?? []).map(
    (alternative) => alternative.documents ?? [],
  )
}

function getStatus(
  requirement: IntakeApiDocumentRequirement,
  documents: IntakeApiDocumentType[],
): IntakeDocumentStatus {
  if (requirement.isFulfilled) return 'Sent'
  return documents.some(isRejected) ? 'Rejected' : 'Pending'
}

const getDescription = (document: IntakeApiDocumentType) =>
  document.description ?? document.code ?? String(document.documentType)

function getShortName(document: IntakeApiDocumentType) {
  const description = getDescription(document)
  return description.match(/\(([^()]+)\)\s*$/)?.[1].trim() ?? description
}

function getName(alternatives: IntakeApiDocumentType[][]) {
  const toName = alternatives.flat().length > 1 ? getShortName : getDescription
  const names = alternatives.map((documents) =>
    documents.map(toName).join(' e '),
  )
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} ou ${names.at(-1)}`
}

export function getIntakeDocuments(
  response: IntakeApiRequiredDocuments,
  pendencies: IntakePendency[] = [],
): IntakeDocumentsStepData {
  const requirements = (response.required ?? []).map(
    (requirement): IntakeDocumentRequirement => {
      const alternatives = getDocuments(requirement)
      const documents = alternatives.flat()
      const status = getStatus(requirement, documents)
      const rejectedCodes = new Set(
        documents.filter(isRejected).map((document) => document.code),
      )
      const pendency = pendencies.find((item) => rejectedCodes.has(item.code))

      return {
        id: documents.map((document) => document.documentType).join('-'),
        name: getName(alternatives),
        status,
        rejectionReason:
          status === 'Rejected'
            ? (pendency?.reason ?? pendency?.description ?? null)
            : null,
        alternatives: alternatives.map((items) => ({
          documents: items.map((document) => ({
            documentType: document.documentType,
            code: document.code ?? String(document.documentType),
            description: getDescription(document),
            shortName: getShortName(document),
          })),
        })),
      }
    },
  )

  return { isComplete: response.isComplete, requirements }
}
