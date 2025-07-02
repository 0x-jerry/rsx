import { dc, toBindingRefs, VIf } from '@/index'

export interface DemoSectionProps {
  title: string
  description?: string
}

export const DemoSection = dc<DemoSectionProps>((props, children) => {
  const { title, description } = toBindingRefs(props)

  return (
    <div>
      <h3 class="title">{title}</h3>
      <VIf
        condition={description}
        truthy={() => <p class="text-gray-5">{description}</p>}
      />
      <div class="section p-4 pt-0">{children}</div>
    </div>
  )
})
