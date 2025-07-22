import { dc } from '../defineComponent'
import { onBeforeMount, onMounted, onUnmounted } from '../hook'
import { $, nextTick, ref } from '../reactivity'
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

  it('where case condition', async () => {
    const value = ref(7)

    const App = dc(() => {
      return (
        <VCase
          condition={value}
          cases={[
            {
              where: (value) => value > 10,
              render: (props) => <p>{$(() => props.value)} 1</p>,
            },
            {
              where: (value) => 5 > value,
              render: (props) => <p>{$(() => props.value)} 2</p>,
            },
            {
              where: () => true,
              render: (props) => <p>{$(() => props.value)} 3</p>,
            },
          ]}
        />
      )
    })

    const el = mountTestApp(App)

    const getContent = () => el.querySelector('p')?.textContent

    expect(getContent()).eql('7 3')

    value.value = 11
    await nextTick()
    expect(getContent()).eql('11 1')

    value.value = 3
    await nextTick()
    expect(getContent()).eql('3 2')
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

    expect(root).toMatchSnapshot('html')

    const ctxTree = contextToJson(root._.context)

    expect(ctxTree).toMatchSnapshot('ctx tree')
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
    await nextTick()

    expect(root).toMatchSnapshot('html')

    const ctxTree = contextToJson(root._.context)

    expect(ctxTree).toMatchSnapshot('ctx tree')
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

    const mountedFnB = vi.fn()
    const beforeMountFnB = vi.fn()
    const unmountedFnB = vi.fn()

    const B = () => {
      onBeforeMount(beforeMountFnB)
      onMounted(mountedFnB)
      onUnmounted(unmountedFnB)

      return (
        <div class="B">
          <span>b</span>
        </div>
      )
    }

    const value = ref(0)

    const App = dc(() => {
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

    expect(mountedFnA).toBeCalledTimes(0)
    expect(beforeMountFnA).toBeCalledTimes(0)
    expect(unmountedFnA).toBeCalledTimes(0)

    expect(mountedFnB).toBeCalledTimes(0)
    expect(beforeMountFnB).toBeCalledTimes(0)
    expect(unmountedFnB).toBeCalledTimes(0)

    mountTestApp(App)

    expect(mountedFnA).toBeCalledTimes(1)
    expect(beforeMountFnA).toBeCalledTimes(1)
    expect(unmountedFnA).toBeCalledTimes(0)

    expect(mountedFnB).toBeCalledTimes(0)
    expect(beforeMountFnB).toBeCalledTimes(0)
    expect(unmountedFnB).toBeCalledTimes(0)

    value.value = 1
    await nextTick()

    expect(mountedFnA).toBeCalledTimes(1)
    expect(beforeMountFnA).toBeCalledTimes(1)
    expect(unmountedFnA).toBeCalledTimes(1)

    expect(mountedFnB).toBeCalledTimes(1)
    expect(beforeMountFnB).toBeCalledTimes(1)
    expect(unmountedFnB).toBeCalledTimes(0)
  })
})
