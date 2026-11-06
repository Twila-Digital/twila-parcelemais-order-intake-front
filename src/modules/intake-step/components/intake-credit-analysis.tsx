import { Loading } from '@twila-digital/components/loading'

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
      <Loading variant='brand' decorative slowMessage={null} />
      <div className='flex flex-col gap-md'>
        <h1 className='font-heading font-medium tablet:text-h4 text-h5 leading-[1.4]'>
          {title}
        </h1>
        <p className='tablet:text-body-16 text-body-14 text-gray-11'>
          {description}
        </p>
      </div>
    </section>
  )
}
