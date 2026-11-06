import Address from '@public/images/illustrations/address.webp'
import Biometrics from '@public/images/illustrations/biometrics.webp'
import Card from '@public/images/illustrations/card.webp'
import Installments from '@public/images/illustrations/installments.webp'
import PersonalData from '@public/images/illustrations/personal-data.webp'
import Phone from '@public/images/illustrations/phone.webp'
import type { StaticImageData } from 'next/image'

export type Illustration = StaticImageData

export const ILLUSTRATIONS = {
  phone: Phone,
  personalData: PersonalData,
  address: Address,
  installments: Installments,
  card: Card,
  biometrics: Biometrics,
} satisfies Record<string, Illustration>
