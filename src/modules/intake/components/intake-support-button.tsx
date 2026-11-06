'use client'

import { faUpRightFromSquare } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@twila-digital/components/button'
import { useFieldSize } from '@/common/hooks/use-field-size'
import { APP_INFO } from '@/constants/app-info'

export function IntakeSupportButton() {
  const fieldSize = useFieldSize()

  return (
    <Button size={fieldSize} fullWidth asChild>
      <a href={APP_INFO.whatsappLink} target='_blank' rel='noopener noreferrer'>
        Falar com o suporte
        <FontAwesomeIcon icon={faUpRightFromSquare} aria-hidden />
      </a>
    </Button>
  )
}
