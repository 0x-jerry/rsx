import { defineComponent } from './defineComponent'
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
      Content: defineNamedSlot('A.Content'),
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

  it('multiple instance', async () => {
    const AImpl = defineComponent((_props, children) => {
      const Title = useSlot(A.Title)

      return (
        <div class="A">
          <div class="title">
            <Title />
          </div>
          {children}
        </div>
      )
    })

    const A = Object.assign(AImpl, {
      Title: defineNamedSlot('A.Title'),
    })

    const App = () => {
      return (
        <div>
          <A>
            <span>1</span>
            <A.Title>title 1</A.Title>
          </A>
          <A>
            <span>1</span>
            <A.Title>title 2</A.Title>
          </A>
        </div>
      )
    }

    const rootEl = mountTestApp(App)

    const text = rootEl
      .querySelectorAll('.title')
      .values()
      .map((item) => item.textContent)
      .toArray()
    expect(text).eql(['title 1', 'title 2'])
  })

  it('sub child of a component', async () => {
    const AImpl = defineComponent((props, children) => {
      const Title = useSlot(A.Title)

      return (
        <div class="A">
          <div class="title">
            <Title />
          </div>
          {children}
        </div>
      )
    })

    const A = Object.assign(AImpl, {
      Title: defineNamedSlot('A.Title'),
    })

    const B = defineComponent((_, children) => {
      return <div>{children}</div>
    })

    const App = () => {
      return (
        <div>
          <A>
            <span>1</span>
            <A.Title>
              <B>title 1</B>
            </A.Title>
          </A>
          <A>
            <span>2</span>
            <A.Title>title 2</A.Title>
          </A>
        </div>
      )
    }

    const rootEl = mountTestApp(App)

    const text = rootEl
      .querySelectorAll('.title')
      .values()
      .map((item) => item.textContent)
      .toArray()
    expect(text).eql(['title 1', 'title 2'])
  })

  it('multiple slot instance', async () => {
    const AImpl = defineComponent<{ count: number }>((props, children) => {
      const Title = useSlot(A.Title)

      return (
        <div class="A">
          <div class="title">
            <Title />
          </div>
          <div class="title">
            <Title />
          </div>
          {children}
        </div>
      )
    })

    const A = Object.assign(AImpl, {
      Title: defineNamedSlot('A.Title'),
    })

    const B = defineComponent((_, children) => {
      return <div>{children}</div>
    })

    const App = () => {
      return (
        <div>
          <A count={1}>
            <span>1</span>
            <A.Title>
              <B>title</B>
            </A.Title>
          </A>
        </div>
      )
    }

    const rootEl = mountTestApp(App)

    const text = rootEl
      .querySelectorAll('.title')
      .values()
      .map((item) => item.textContent)
      .toArray()
    expect(text).eql(['title', 'title'])
  })
})
