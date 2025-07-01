import { $, dc, toBindingRefs } from '@/index'

export interface DemoSectionProps {
  title: string
}

export const DemoSection = dc<DemoSectionProps>((props, children) => {
  const { title } = toBindingRefs(props)

  return (
    <div>
      <div class="title">{title}</div>
      <div class="example">{children}</div>
    </div>
  )
})
