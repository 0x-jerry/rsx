import { onBeforeMount, onMounted, onUnmounted } from '@/hook'
import { dc } from '../defineComponent'
import { contextToJson, defineComponentName, mountTestApp } from '../helper'

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
    const beforeMountFnA = vi.fn()
    const unmountedFnA = vi.fn()

    const A = () => {
      onBeforeMount(beforeMountFnA)
      onMounted(mountedFnA)
      onUnmounted(unmountedFnA)

      return (
        <div class="A">
          <span>a</span>
        </div>
      )
    }

    const B = () => null

    const App = dc(() => {
      return (
        <>
          <A></A>
          <B></B>
        </>
      )
    })

    expect(mountedFnA).toBeCalledTimes(0)
    expect(beforeMountFnA).toBeCalledTimes(0)
    expect(unmountedFnA).toBeCalledTimes(0)

    mountTestApp(App)

    expect(mountedFnA).toBeCalledTimes(1)
    expect(beforeMountFnA).toBeCalledTimes(1)
    expect(unmountedFnA).toBeCalledTimes(0)
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

    const ctxTree = contextToJson(root._.context)

    expect(ctxTree).toMatchSnapshot('ctx tree')
  })
})
