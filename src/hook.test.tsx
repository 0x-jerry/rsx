/** biome-ignore-all lint/style/noNonNullAssertion: test */
import {
  dc,
  type InjectKey as InjectionKey,
  inject,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  provide,
  ref,
  unmountApp,
  VIf,
} from '.'
import { mountTestApp } from './test'

describe('hook', () => {
  it('provide/inject', () => {
    type InjectValue = { a: number }
    const TEST_KEY = 'key' as InjectionKey<InjectValue>

    const A = dc((_, _children) => {
      const injectValue = inject(TEST_KEY)!

      return <div class="A">{injectValue.a}</div>
    })

    const App = dc(() => {
      provide(TEST_KEY, { a: 123 })
      return (
        <div>
          <A></A>
        </div>
      )
    })

    const root = mountTestApp(App)
    expect(root.querySelector('.A')?.textContent).toBe('123')
  })

  it('provide the same key', () => {
    type InjectValue = { a: number }
    const TEST_KEY = 'key' as InjectionKey<InjectValue>

    const A = dc((_, children) => {
      const injectValue = inject(TEST_KEY)!

      provide(TEST_KEY, { a: 223 })

      return (
        <div class="A">
          <span class="valueA">{injectValue.a}</span>
          {children}
        </div>
      )
    })

    const B = dc((_, _children) => {
      const injectValue = inject(TEST_KEY)!

      return <div class="B">{injectValue.a}</div>
    })

    const App = dc(() => {
      provide(TEST_KEY, { a: 123 })
      return (
        <div>
          <A>
            <B></B>
          </A>
        </div>
      )
    })

    const root = mountTestApp(App)

    expect(root.querySelector('.valueA')?.textContent).toBe('123')
    expect(root.querySelector('.B')?.textContent).toBe('223')
  })

  it('should unmount', async () => {
    const fn = vi.fn()

    const A = () => {
      onUnmounted(fn)
    }

    const showA = ref(true)
    const App = dc(() => {
      return (
        <div>
          <VIf condition={showA} truthy={A} />
        </div>
      )
    })

    mountTestApp(App)

    expect(fn).toBeCalledTimes(0)

    showA.value = false
    await nextTick()
    expect(fn).toBeCalledTimes(1)
  })

  it('lifecycle hooks', () => {
    const beforeMountFn = vi.fn()
    const mountedFn = vi.fn()

    const A = () => {
      onMounted(mountedFn)
      onBeforeMount(beforeMountFn)
    }

    const App = dc(() => {
      return (
        <div>
          <A />
        </div>
      )
    })

    expect(beforeMountFn).toBeCalledTimes(0)
    expect(mountedFn).toBeCalledTimes(0)
    mountTestApp(App)

    expect(beforeMountFn).toBeCalledTimes(1)
    expect(mountedFn).toBeCalledTimes(1)
  })

  it('lifecycle order', () => {
    const lifecycle: string[] = []

    const A = dc<{ id: string }>((props, children) => {
      onMounted(() => {
        lifecycle.push(`m:${props.id}`)
      })

      onBeforeMount(() => {
        lifecycle.push(`bm:${props.id}`)
      })

      onBeforeUnmount(() => {
        lifecycle.push(`bum:${props.id}`)
      })

      onUnmounted(() => {
        lifecycle.push(`um:${props.id}`)
      })

      return <div>{children}</div>
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

    expect(lifecycle).eql([
      'bm:1',
      'bm:4',
      'm:4',
      'bm:5',
      'm:5',
      'm:1',
      'bm:2',
      'bm:6',
      'm:6',
      'bm:7',
      'bm:8',
      'm:8',
      'm:7',
      'm:2',
      'bm:3',
      'm:3',
    ])

    unmountApp(app._)

    expect(lifecycle).eql([
      'bm:1',
      'bm:4',
      'm:4',
      'bm:5',
      'm:5',
      'm:1',
      'bm:2',
      'bm:6',
      'm:6',
      'bm:7',
      'bm:8',
      'm:8',
      'm:7',
      'm:2',
      'bm:3',
      'm:3',

      // unmounted order
      'bum:1',
      'bum:4',
      'um:4',
      'bum:5',
      'um:5',
      'um:1',
      'bum:2',
      'bum:6',
      'um:6',
      'bum:7',
      'bum:8',
      'um:8',
      'um:7',
      'um:2',
      'bum:3',
      'um:3',
    ])
  })

  it('lifecycle order with fragment', () => {
    const lifecycle: string[] = []

    const A = dc<{ id: string }>((props, children) => {
      onMounted(() => {
        lifecycle.push(`m:${props.id}`)
      })

      onBeforeMount(() => {
        lifecycle.push(`bm:${props.id}`)
      })

      onBeforeUnmount(() => {
        lifecycle.push(`bum:${props.id}`)
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

    expect(lifecycle).eql([
      'bm:1',
      'bm:4',
      'm:4',
      'bm:5',
      'm:5',
      'm:1',
      'bm:2',
      'bm:6',
      'm:6',
      'bm:7',
      'bm:8',
      'm:8',
      'm:7',
      'm:2',
      'bm:3',
      'm:3',
    ])

    unmountApp(app._)

    expect(lifecycle).eql([
      'bm:1',
      'bm:4',
      'm:4',
      'bm:5',
      'm:5',
      'm:1',
      'bm:2',
      'bm:6',
      'm:6',
      'bm:7',
      'bm:8',
      'm:8',
      'm:7',
      'm:2',
      'bm:3',
      'm:3',

      // unmounted order
      'bum:1',
      'bum:4',
      'um:4',
      'bum:5',
      'um:5',
      'um:1',
      'bum:2',
      'bum:6',
      'um:6',
      'bum:7',
      'bum:8',
      'um:8',
      'um:7',
      'um:2',
      'bum:3',
      'um:3',
    ])
  })
})
