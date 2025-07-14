import { dc, VIf } from '@/index'
import { defineNamedSlot, useSlot } from '@/Slot'

export interface DemoSectionProps {
  _?: string
}

const DemoSectionImpl = dc<DemoSectionProps>((_props, children) => {
  const Title = useSlot(DemoSection.Title)
  const Description = useSlot(DemoSection.Description)

  return (
    <div>
      <h3 class="title">
        <Title />
      </h3>
      <VIf
        condition={Description.length}
        truthy={() => (
          <p class="text-gray-5">
            <Description />
          </p>
        )}
      />
      <div class="section p-4 pt-0">{children}</div>
    </div>
  )
})

export const DemoSection = Object.assign(DemoSectionImpl, {
  Title: defineNamedSlot('DemoSection.Title'),
  Description: defineNamedSlot('DemoSection.Description'),
})
