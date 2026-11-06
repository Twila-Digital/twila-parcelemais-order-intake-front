import Image from 'next/image'
import type { Illustration } from '@/constants/illustrations'

type PageTitleProps = {
  title: string
  description?: string
  illustration?: Illustration
  largeDescription?: boolean
}

export function PageTitle({
  title,
  description,
  illustration,
  largeDescription,
}: PageTitleProps) {
  return (
    <div className='flex flex-col gap-md tablet:gap-lg'>
      <div className='flex items-center gap-md'>
        {illustration && (
          <Image
            src={illustration}
            alt=''
            aria-hidden
            className='h-[51px] w-auto shrink-0'
            sizes='70px'
            priority
          />
        )}
        <h1 className='flex-1 font-bold font-heading tablet:text-h4 text-h5 leading-[1.4]'>
          {title}
        </h1>
      </div>
      {description && (
        <p
          className={
            largeDescription
              ? 'text-body-16 text-gray-11'
              : 'tablet:text-body-16 text-body-14 text-gray-11'
          }
        >
          {description}
        </p>
      )}
    </div>
  )
}
