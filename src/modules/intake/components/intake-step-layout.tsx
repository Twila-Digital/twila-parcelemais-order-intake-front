import type { ReactNode } from 'react'
import { PageTitle } from '@/common/components/page-title'
import type { Illustration } from '@/constants/illustrations'

type IntakeStepLayoutProps = {
  header?: ReactNode
  title: string
  description?: string
  illustration?: Illustration
  largeDescription?: boolean
  children?: ReactNode
  action: ReactNode
}

export function IntakeStepLayout({
  header,
  title,
  description,
  illustration,
  largeDescription,
  children,
  action,
}: IntakeStepLayoutProps) {
  return (
    <section className='flex flex-1 flex-col'>
      {header}
      <div className='flex flex-col gap-lg tablet:gap-xxl'>
        <PageTitle
          title={title}
          description={description}
          illustration={illustration}
          largeDescription={largeDescription}
        />
        {children}
      </div>
      <div className='mt-auto pt-8'>{action}</div>
    </section>
  )
}
