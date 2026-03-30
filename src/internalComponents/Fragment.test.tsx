import { onMounted, onUnmounted } from '../hook'
import { dc } from '../defineComponent'
import { contextToJson, defineComponentName, mountTestApp } from '../test'
import { unmount } from '../ops'

describe('Fragment', () => {
  it('non-reactivity data', async () => {
    const App = dc(() => {
      return (
        <>
          <div class="item">1</div>
          <div class="item">2</div>
        </>
      )
    })

    const el = mountTestApp(App)

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['1', '2'])
  })

  it('lifecycle hook', async () => {
    const mountedFnA = vi.fn()
    const unmountedFnA = vi.fn()

    const A = () => {
      onMounted(mountedFnA)
      onUnmounted(unmountedFnA)

      return (
        <div class="A">
          <span>a</span>
        </div>
      )
    }

    const B = () => <span></span>

    const App = dc(() => {
      return (
        <>
          <A></A>
          <B></B>
        </>
      )
    })

    expect(mountedFnA).toHaveBeenCalledTimes(0)
    expect(unmountedFnA).toHaveBeenCalledTimes(0)

    mountTestApp(App)

    expect(mountedFnA).toHaveBeenCalledTimes(1)
    expect(unmountedFnA).toHaveBeenCalledTimes(0)
  })

  it('lifecycle order with fragment', () => {
    const lifecycle: string[] = []

    const A = dc<{ id: string }>((props, children) => {
      onMounted(() => {
        lifecycle.push(`m:${props.id}`)
      })

      onUnmounted(() => {
        lifecycle.push(`um:${props.id}`)
      })

      return <>{children}</>
    })

    const App = dc(() => {
      return (
        <div>
          <A id="1">
            <A id="4"></A>
            <A id="5"></A>
          </A>
          <A id="2">
            <A id="6"></A>
            <A id="7">
              <A id="8"></A>
            </A>
          </A>
          <A id="3"></A>
        </div>
      )
    })

    const app = mountTestApp(App)

    expect(lifecycle).eql(['m:1', 'm:4', 'm:5', 'm:2', 'm:6', 'm:7', 'm:8', 'm:3'])
    lifecycle.splice(0)

    unmount(app._.node!)

    expect(lifecycle).eql(['um:4', 'um:5', 'um:1', 'um:6', 'um:8', 'um:7', 'um:2', 'um:3'])
  })
})

describe('fragment context tree', () => {
  it('static value', () => {
    const A = dc((_, children) => (
      <div class="A">
        <span>a</span>
        {children}
      </div>
    ))

    defineComponentName(A, 'A')

    const App = dc(() => (
      <>
        1<A></A>2
      </>
    ))

    defineComponentName(App, 'App')

    const root = mountTestApp(App)

    expect(root).toMatchSnapshot('html')

    const ctxTree = contextToJson(root._)

    expect(ctxTree).toMatchSnapshot('ctx tree')
  })
})
