import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'
import { faMessageDots } from '@fortawesome/pro-regular-svg-icons'
import type { IntakeVerificationChannel } from '@/domain/intake.domain'

export const RESEND_CODE_INTERVAL_IN_SECONDS = 60

export const VERIFICATION_CODE_LENGTH = 6

export const VERIFICATION_CHANNELS: {
  value: IntakeVerificationChannel
  label: string
  icon: IconDefinition
}[] = [
  { value: 'sms', label: 'Receber código via SMS', icon: faMessageDots },
  { value: 'wpp', label: 'Receber código via WhatsApp', icon: faWhatsapp },
]

export const CODE_RESENT_TOAST = {
  title: 'Código reenviado',
  description: 'Enviamos um novo código de verificação para o seu celular.',
}

export const ORDER_NOT_FOUND_TOAST = {
  title: 'Não encontramos seu pedido',
  description:
    'Não encontramos um pedido vinculado a este número. Volte para o WhatsApp para conferir seus dados e receber orientações ou tente novamente.',
}
