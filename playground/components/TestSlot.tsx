import { defineComponent, useSlot, defineNamedSlot } from '../../src'

const AImpl = defineComponent((_, children) => {
  const Title = useSlot(A.Title)

  return (
    <div class="A">
      <div class="title">
        <Title></Title>
        <div>----</div>
        {children}
      </div>
    </div>
  )
})

const A = Object.assign(AImpl, {
  Title: defineNamedSlot('A.Title'),
  Content: defineNamedSlot('A.Content'),
})

export const TestSlotApp = () => {
  return (
    <div>
      <A>
        <span>1</span>
        <A.Title>title content</A.Title>
        <span>2</span>
        <A.Content>content</A.Content>
        <span>3</span>
      </A>
    </div>
  )
}
