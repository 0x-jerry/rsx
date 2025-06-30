import { dc } from '../defineComponent'
import { contextToJson, defineComponentName, mountTestApp } from '../test'

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

    expect(root.outerHTML).toMatchSnapshot()

    const ctxTree = contextToJson(root._)

    expect(ctxTree).toMatchSnapshot()
  })
})
