import LogoCredicarro from '@public/images/logo-credicarro.svg'
import Image from 'next/image'
import { PAGE_CONTAINER_CLASS } from './page-container'

type AppHeaderProps = {
  logoUrl?: string | null
}

const LOGO_CLASS = 'h-4 w-auto object-contain object-left tablet:h-5'

export function AppHeader({ logoUrl }: AppHeaderProps) {
  return (
    <header className={`${PAGE_CONTAINER_CLASS} desktop:pt-10 pt-12`}>
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt='Logo'
          width={145}
          height={20}
          className={LOGO_CLASS}
          unoptimized
          priority
        />
      ) : (
        <Image
          src={LogoCredicarro}
          alt='Credicarro'
          className={LOGO_CLASS}
          priority
        />
      )}
    </header>
  )
}
