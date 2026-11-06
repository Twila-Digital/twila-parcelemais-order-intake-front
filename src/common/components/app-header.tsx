import LogoParceleMais from '@public/images/logo-parcelemais.svg'
import Image from 'next/image'
import { PAGE_CONTAINER_CLASS } from './page-container'

export function AppHeader() {
  return (
    <header className={`${PAGE_CONTAINER_CLASS} desktop:pt-10 pt-12`}>
      <Image
        src={LogoParceleMais}
        alt='Parcele Mais'
        className='h-4 tablet:h-5 w-auto object-contain object-left'
        priority
      />
    </header>
  )
}
