import TwilaLogoMark from '@public/images/twila-logo-mark.svg'
import TwilaLogoTagline from '@public/images/twila-logo-tagline.svg'
import Image from 'next/image'

export function AppFooter() {
  return (
    <footer className='flex items-center justify-center gap-xs pt-lg pb-8'>
      <span className='text-body-12 text-gray-9'>Feito por</span>
      <span
        role='img'
        aria-label='Twila'
        className='relative h-[21px] w-[35px] shrink-0'
      >
        <span className='absolute inset-[0_0.77%_26.7%_0]'>
          <Image src={TwilaLogoMark} alt='' className='size-full' />
        </span>
        <span className='absolute inset-[82.26%_0_0_0]'>
          <Image src={TwilaLogoTagline} alt='' className='size-full' />
        </span>
      </span>
    </footer>
  )
}
