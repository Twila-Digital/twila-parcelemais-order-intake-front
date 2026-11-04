import { faTrash } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  FileTypeIcon,
  fileTypeFromName,
} from '@twila-digital/components/file-type-icon'
import { IconButton } from '@twila-digital/components/icon-button'
import { ProgressBar } from '@twila-digital/components/progress-bar'

const COMPLETE_PROGRESS = 100

type DocumentFilePreviewProps = {
  file: File
  progress: number
  isUploading: boolean
  onRemove: () => void
}

export function DocumentFilePreview({
  file,
  progress,
  isUploading,
  onRemove,
}: DocumentFilePreviewProps) {
  const isComplete = progress === COMPLETE_PROGRESS

  return (
    <div className='flex items-center gap-md'>
      <FileTypeIcon
        {...fileTypeFromName(file.name)}
        variant='default'
        className='shrink-0'
      />

      <ProgressBar
        className='min-w-0 flex-1'
        layout='vertical'
        tone={isComplete ? 'success' : 'brand'}
        label={<span className='block truncate text-gray-12'>{file.name}</span>}
        value={progress}
        indicator={isUploading}
      />

      <IconButton
        variant='danger'
        size='md'
        aria-label={`Remover ${file.name}`}
        disabled={isUploading}
        onClick={onRemove}
      >
        <FontAwesomeIcon icon={faTrash} />
      </IconButton>
    </div>
  )
}
