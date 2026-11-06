import { Loading } from '@twila-digital/components/loading'
import { INTAKE_LOADING_SIZE_CLASS } from '@/modules/intake/constants/loading'

type IntakeCreditAnalysisProps = {
  title: string
  description: string
}

export function IntakeCreditAnalysis({
  title,
  description,
}: IntakeCreditAnalysisProps) {
  return (
    <section className='flex flex-1 flex-col items-center justify-center gap-xxl py-8 text-center'>
      <Loading
        variant='brand'
        decorative
        slowMessage={null}
        className={INTAKE_LOADING_SIZE_CLASS}
      />
      <div className='flex flex-col gap-md'>
        <h1 className='font-bold font-heading tablet:text-h4 text-h5 leading-[1.4]'>
          {title}
        </h1>
        <p className='tablet:text-body-16 text-body-14 text-gray-11'>
          {description}
        </p>
      </div>
    </section>
  )
}
