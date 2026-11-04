import { Tabs, TabsList, TabsTab } from '@twila-digital/components/tabs'
import type { IntakeNewCondition } from '@/domain/intake.domain'

type TermSelectorProps = {
  conditions: IntakeNewCondition[]
  value: string
  onChange: (simulationId: string) => void
}

export function TermSelector({
  conditions,
  value,
  onChange,
}: TermSelectorProps) {
  return (
    <div className='flex flex-col gap-sm'>
      <p className='font-medium text-body-14 text-gray-11'>Prazo</p>
      <Tabs value={value} onValueChange={(next) => onChange(String(next))}>
        <TabsList asTags aria-label='Prazo' className='flex-wrap'>
          {conditions.map((condition) => (
            <TabsTab
              key={condition.simulationId}
              value={condition.simulationId}
              className='flex-1 tablet:flex-none'
            >
              {condition.installments.count}x
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
