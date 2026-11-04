import {
  faCircleCheck,
  faCircleXmark,
} from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@twila-digital/components/button'
import type { IntakeDocumentRequirement } from '@/domain/intake.domain'

type DocumentRowProps = {
  document: IntakeDocumentRequirement
  onSend: () => void
}

const STATUS_LABEL = {
  Sent: 'enviado',
  Rejected: 'recusado, envie novamente',
  Pending: 'pendente',
}

export function DocumentRow({ document, onSend }: DocumentRowProps) {
  const isPending = document.status === 'Pending'

  return (
    <li className='flex items-center justify-between gap-md'>
      <span className='flex items-center gap-sm font-medium text-body-16 text-gray-11'>
        {document.status === 'Sent' && (
          <FontAwesomeIcon
            icon={faCircleCheck}
            className='text-green-8'
            aria-hidden
          />
        )}
        {document.status === 'Rejected' && (
          <FontAwesomeIcon
            icon={faCircleXmark}
            className='text-red-9'
            aria-hidden
          />
        )}
        <span className='flex flex-col'>
          <span>
            {document.name}
            <span className='sr-only'>({STATUS_LABEL[document.status]})</span>
          </span>
          {document.status === 'Rejected' && document.rejectionReason && (
            <span className='font-normal text-body-14 text-red-9'>
              {document.rejectionReason}
            </span>
          )}
        </span>
      </span>
      <Button
        type='button'
        variant='tertiary'
        size='md'
        onClick={onSend}
        aria-label={`${isPending ? 'Enviar' : 'Reenviar'} ${document.name}`}
      >
        {isPending ? 'Enviar' : 'Reenviar'}
      </Button>
    </li>
  )
}
