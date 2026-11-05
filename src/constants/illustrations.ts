import Biometrics from '@public/images/illustrations/biometrics.png'
import Phone from '@public/images/illustrations/phone.png'
import type { StaticImageData } from 'next/image'
import type { CSSProperties } from 'react'

export type Illustration = {
  src: StaticImageData
  frame: CSSProperties
  image: CSSProperties
}

function illustration(
  src: StaticImageData,
  [left, top, width, height]: [number, number, number, number],
  [imageLeft, imageTop, imageWidth, imageHeight]: [
    number,
    number,
    number,
    number,
  ],
): Illustration {
  return {
    src,
    frame: { left, top, width, height },
    image: {
      left: `${imageLeft}%`,
      top: `${imageTop}%`,
      width: `${imageWidth}%`,
      height: `${imageHeight}%`,
    },
  }
}

export const ILLUSTRATIONS = {
  phone: illustration(Phone, [11, 0, 40, 47], [-21.81, -4.87, 139.74, 109.65]),
  biometrics: illustration(
    Biometrics,
    [16, -0.5, 34, 48],
    [-41.9, -6.81, 173.74, 118.12],
  ),
} satisfies Record<string, Illustration>
