import { Button } from '@twila-digital/components/button'
import { EmptyState } from '@twila-digital/components/empty-state'
import Link from 'next/link'
import { cn } from '@/common/lib/utils'

type ErrorPageProps = {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function ErrorPage({
  title,
  description,
  actionLabel = 'Voltar ao início',
  onAction,
  className,
}: ErrorPageProps = {}) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center px-6 py-8',
        className,
      )}
    >
      <EmptyState
        variant='error'
        title={title}
        description={description}
        action={
          onAction ? (
            <Button onClick={onAction}>{actionLabel}</Button>
          ) : (
            <Button asChild>
              <Link href='/'>{actionLabel}</Link>
            </Button>
          )
        }
      />
    </div>
  )
}
