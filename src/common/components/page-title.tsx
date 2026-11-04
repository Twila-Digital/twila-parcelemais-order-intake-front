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
          <span className='relative h-[51px] w-[50px] shrink-0' aria-hidden>
            <span className='absolute top-[7px] left-0 size-11 rounded-sm bg-brand-primary-fg' />
            <span
              className='absolute overflow-hidden'
              style={illustration.frame}
            >
              <Image
                src={illustration.src}
                alt=''
                className='absolute max-w-[none]'
                style={illustration.image}
                sizes='80px'
                priority
              />
            </span>
          </span>
        )}
        <h1 className='flex-1 font-heading font-medium tablet:text-h4 text-h5 leading-[1.4]'>
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
