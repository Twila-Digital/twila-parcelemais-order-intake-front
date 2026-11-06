import Address from '@public/images/illustrations/address.png'
import Biometrics from '@public/images/illustrations/biometrics.png'
import Card from '@public/images/illustrations/card.png'
import Installments from '@public/images/illustrations/installments.png'
import PersonalData from '@public/images/illustrations/personal-data.png'
import Phone from '@public/images/illustrations/phone.png'
import type { StaticImageData } from 'next/image'
import type { CSSProperties } from 'react'

export type Illustration = {
  src: StaticImageData
  width: number
  image: CSSProperties
}

// Recorte do Figma: caixa de `width` x 51px e a imagem posicionada em % da caixa
function illustration(
  src: StaticImageData,
  width: number,
  [left, top, imageWidth, imageHeight]: [number, number, number, number],
): Illustration {
  return {
    src,
    width,
    image: {
      left: `${left}%`,
      top: `${top}%`,
      width: `${imageWidth}%`,
      height: `${imageHeight}%`,
    },
  }
}

export const ILLUSTRATIONS = {
  phone: illustration(Phone, 48, [-33.64, -12.89, 148.58, 127.69]),
  personalData: illustration(PersonalData, 56, [-11.64, -9.19, 114.79, 114.74]),
  address: illustration(Address, 56, [-9.82, -2.54, 120.76, 105.75]),
  installments: illustration(Installments, 56, [-10.94, -3.86, 115.8, 115.73]),
  card: illustration(Card, 70, [-8.18, -4.92, 116.21, 112.83]),
  biometrics: illustration(Biometrics, 64, [0, 0, 100, 100]),
} satisfies Record<string, Illustration>
