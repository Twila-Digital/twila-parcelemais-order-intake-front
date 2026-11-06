import { Loading } from '@twila-digital/components/loading'
import { INTAKE_LOADING_SIZE_CLASS } from '@/modules/intake/constants/loading'

export function IntakeLoading() {
  return (
    <Loading
      variant='brand'
      overlay
      label='Carregando'
      className={INTAKE_LOADING_SIZE_CLASS}
    />
  )
}
