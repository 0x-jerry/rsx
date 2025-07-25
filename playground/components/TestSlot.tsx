import { defineComponent } from '@/defineComponent'
import { $, ref } from '@/reactivity'
import { defineNamedSlot, useSlot } from '@/Slot'
import { useInterval } from '../hooks/useInterval'

const AImpl = defineComponent((_, children) => {
  const Title = useSlot(A.Title)
  const _Content = useSlot(A.Content)

  const titleCount = ref(0)

  useInterval(() => {
    titleCount.value++
  }, 1000)

  return (
    <div class="A">
      <div class="title">
        <Title count={titleCount}></Title>
        <div>----</div>
        {children}
      </div>
    </div>
  )
})

const A = Object.assign(AImpl, {
  Title: defineNamedSlot<{ count: number }>('A.Title'),
  Content: defineNamedSlot('A.Content'),
})

export const TestSlotApp = () => {
  return (
    <div>
      <A>
        <span>1</span>
        {A.Title((props) => (
          <>title count: {$(() => props.count)}</>
        ))}
        <span>2</span>
        <A.Content>content</A.Content>
        <span>3</span>
      </A>
    </div>
  )
}
