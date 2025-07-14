import { defineComponent } from './defineComponent'
import { nextTick, ref } from './reactivity'
import { defineNamedSlot, useSlot } from './Slot'
import { mountTestApp } from './test'

describe('Slot', () => {
  it('get slot content', () => {
    const AImpl = defineComponent((_, children) => {
      const Title = useSlot(A.Title)
      const Content = useSlot(A.Content)

      return (
        <div class="A">
          <div class="title">
            <Title />
          </div>
          <span>-</span>
          <div class="content">
            <Content />
          </div>
          {children}
        </div>
      )
    })

    const A = Object.assign(AImpl, {
      Title: defineNamedSlot('A.Title'),
      Content: defineNamedSlot('A.Title'),
    })

    const App = () => {
      return (
        <div>
          <A>
            <span>1</span>
            <A.Title>title</A.Title>
            <span>2</span>
            <A.Content>content</A.Content>
            <span>3</span>
          </A>
        </div>
      )
    }

    const el = mountTestApp(App)

    expect(el).toMatchSnapshot('html')
  })

  it('pass data through slot', async () => {
    const count = ref(0)

    const AImpl = defineComponent((_, children) => {
      const Title = useSlot(A.Title)

      return (
        <div class="A">
          <div class="title">
            <Title count={count} />
          </div>
          {children}
        </div>
      )
    })

    const A = Object.assign(AImpl, {
      Title: defineNamedSlot<{ count: number }>('A.Title'),
    })

    const App = () => {
      return (
        <div>
          <A>
            <span>1</span>
            <A.Title>title {A.Title.count}</A.Title>
          </A>
        </div>
      )
    }

    const rootEl = mountTestApp(App)

    let text = rootEl.querySelector('.title')?.textContent
    expect(text).toBe('title 0')

    count.value = 1
    await nextTick()

    text = rootEl.querySelector('.title')?.textContent
    expect(text).toBe('title 1')
  })
})
