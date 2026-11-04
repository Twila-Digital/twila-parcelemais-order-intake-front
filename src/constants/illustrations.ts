import Bank from '@public/images/illustrations/bank.png'
import Biometrics from '@public/images/illustrations/biometrics.png'
import CompanyData from '@public/images/illustrations/company-data.png'
import Documents from '@public/images/illustrations/documents.png'
import Inspection from '@public/images/illustrations/inspection.png'
import NewConditions from '@public/images/illustrations/new-conditions.png'
import PersonalData from '@public/images/illustrations/personal-data.png'
import Phone from '@public/images/illustrations/phone.png'
import SellerConfirmation from '@public/images/illustrations/seller-confirmation.png'
import SellerData from '@public/images/illustrations/seller-data.png'
import VehicleInformation from '@public/images/illustrations/vehicle-information.png'
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
  sellerData: illustration(
    SellerData,
    [2, 1, 48, 41],
    [-17.79, -21.2, 131.78, 145.76],
  ),
  bank: illustration(Bank, [3, 9, 47, 37], [-17.55, -28.17, 133.08, 154.91]),
  documents: illustration(
    Documents,
    [3, 0, 47, 43],
    [-15.84, -20.84, 131.38, 139.52],
  ),
  vehicleInformation: illustration(
    VehicleInformation,
    [8, 0, 42, 43],
    [-39.75, -23.36, 166.08, 148.21],
  ),
  inspection: illustration(
    Inspection,
    [4, 9, 46, 37],
    [-14.55, -21.01, 129.01, 143.94],
  ),
  biometrics: illustration(
    Biometrics,
    [16, -0.5, 34, 48],
    [-41.9, -6.81, 173.74, 118.12],
  ),
  personalData: illustration(
    PersonalData,
    [8, 0, 42, 45],
    [-31.98, -10.73, 152.5, 119.02],
  ),
  sellerConfirmation: illustration(
    SellerConfirmation,
    [2, 0, 47, 48],
    [-9.55, -2.28, 115, 103.22],
  ),
  companyData: illustration(
    CompanyData,
    [5, 0, 45, 42],
    [-22.62, -13.02, 143.61, 122.38],
  ),
  newConditions: illustration(
    NewConditions,
    [6, 9, 44, 40],
    [-19.64, -9.78, 139.27, 121.54],
  ),
} satisfies Record<string, Illustration>
