/** biome-ignore-all lint/style/noNonNullAssertion: test */
import { dc, type InjectKey as InjectionKey, inject, provide } from '.'
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
})
