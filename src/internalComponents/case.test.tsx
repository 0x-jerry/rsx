import { dc } from '../defineComponent'
import { onMounted } from '../hook'
import { nextTick, ref } from '../reactivity'
import { contextToJson, defineComponentName, mountTestApp } from '../test'
import { VCase, VIf } from './case'

describe('VCase', () => {
  it('non-reactivity data', async () => {
    const App = dc(() => {
      const value = 0

      return (
        <VCase
          condition={value}
          cases={{
            '0': () => <div class="item">0</div>,
            '1': () => <div class="item">1</div>,
          }}
        />
      )
    })

    const el = mountTestApp(App)

    const getContent = () =>
      el
        .querySelectorAll('.item')
        .values()
        .map((item) => item.textContent)
        .toArray()

    expect(getContent()).eql(['0'])
  })

  it('reactivity data', async () => {
    const App = dc(() => {
      const value = ref(0)

      onMounted(() => {
        value.value = 1
      })

      return (
        <VCase
          condition={value}
          cases={{
            '0': () => <div class="item">0</div>,
            '1': () => <div class="item">1</div>,
          }}
        />
      )
    })

    const el = mountTestApp(App)

    const getContent = () =>
      el
        .querySelectorAll('.item')
        .values()
        .map((item) => item.textContent)
        .toArray()

    expect(getContent()).eql(['0'])

    await nextTick()

    expect(getContent()).eql(['1'])
  })
})

describe('VIf', () => {
  it('non-reactivity data', async () => {
    const App = dc(() => {
      const value = 0

      return (
        <VIf
          condition={value}
          truthy={() => <div class="item">1</div>}
          falsy={() => <div class="item">0</div>}
        />
      )
    })

    const el = mountTestApp(App)

    const getContent = () =>
      el
        .querySelectorAll('.item')
        .values()
        .map((item) => item.textContent)
        .toArray()

    expect(getContent()).eql(['0'])
  })

  it('reactivity data', async () => {
    const App = dc(() => {
      const value = ref(0)

      onMounted(() => {
        value.value = 1
      })

      return (
        <VIf
          condition={value}
          truthy={() => <div class="item">1</div>}
          falsy={() => <div class="item">0</div>}
        />
      )
    })

    const el = mountTestApp(App)

    const getContent = () =>
      el
        .querySelectorAll('.item')
        .values()
        .map((item) => item.textContent)
        .toArray()

    expect(getContent()).eql(['0'])

    await nextTick()

    expect(getContent()).eql(['1'])
  })
})

describe('case context tree', () => {
  it('static value', () => {
    const A = dc((_, children) => (
      <div class="A">
        <span>a</span>
        {children}
      </div>
    ))

    defineComponentName(A, 'A')

    const B = dc((_, children) => (
      <div class="B">
        <span>b</span>
        {children}
      </div>
    ))

    defineComponentName(B, 'B')

    const App = dc(() => {
      const value = 0

      return (
        <VCase
          condition={value}
          cases={{
            '0': () => <A>0</A>,
            '1': () => <B>1</B>,
          }}
        />
      )
    })

    defineComponentName(App, 'App')

    const root = mountTestApp(App)

    expect(root.outerHTML).toMatchSnapshot()

    const ctxTree = contextToJson(root._)

    expect(ctxTree).toMatchSnapshot()
  })

  it('reactive value', async () => {
    const A = dc((_, children) => (
      <div class="A">
        <span>a</span>
        {children}
      </div>
    ))

    defineComponentName(A, 'A')

    const B = dc((_, children) => (
      <div class="B">
        <span>b</span>
        {children}
      </div>
    ))

    defineComponentName(B, 'B')

    const App = dc(() => {
      const value = ref(0)

      onMounted(() => {
        value.value = 1
      })

      return (
        <VCase
          condition={value}
          cases={{
            '0': () => <A>0</A>,
            '1': () => <B>1</B>,
          }}
        />
      )
    })

    defineComponentName(App, 'App')

    const root = mountTestApp(App)

    expect(root.outerHTML).toMatchSnapshot()

    const ctxTree = contextToJson(root._)

    expect(ctxTree).toMatchSnapshot()

    await nextTick()

    expect(root.outerHTML).toMatchSnapshot()

    const ctxTree1 = contextToJson(root._)

    expect(ctxTree1).toMatchSnapshot()
  })
})
