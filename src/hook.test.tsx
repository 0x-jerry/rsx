import {
  dc,
  type InjectKey as InjectionKey,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
  VIf,
} from '.'
import { unmount } from './ops'
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

  it('lifecycle hooks', () => {
    const mountedFn = vi.fn()

    const A = () => {
      onMounted(mountedFn)

      return <></>
    }

    const App = dc(() => {
      return (
        <div>
          <A />
        </div>
      )
    })

    expect(mountedFn).toHaveBeenCalledTimes(0)
    mountTestApp(App)

    expect(mountedFn).toHaveBeenCalledTimes(1)
  })

  it('lifecycle order', () => {
    const lifecycle: string[] = []

    const A = dc<{ id: string }>((props, children) => {
      onMounted(() => {
        lifecycle.push(`m:${props.id}`)
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

    expect(lifecycle).eql(['m:1', 'm:4', 'm:5', 'm:2', 'm:6', 'm:7', 'm:8', 'm:3'])

    lifecycle.splice(0)
    unmount(app._.node!)

    expect(lifecycle).eql(['um:4', 'um:5', 'um:1', 'um:6', 'um:8', 'um:7', 'um:2', 'um:3'])
  })
})
