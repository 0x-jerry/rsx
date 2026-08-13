import { useContext, useExpose } from '../hook'
import { defineComponentName } from '../defineComponent'
import { nextTick, signal } from '../reactivity'
import { mountTestApp } from '../test'

describe('ComponentNode', () => {
  it('ref prop on a Component instance', async () => {
    const value = signal()

    const A = () => {
      useExpose({
        a: 1,
      })

      return <div></div>
    }

    const App = () => {
      return (
        <div>
          <A ref={value}>1</A>
        </div>
      )
    }

    mountTestApp(App)
    await nextTick()

    expect(value()).eql({ a: 1 })
  })

  it('does not corrupt context stack when a child setup throws', () => {
    const Boom = () => {
      throw new Error('boom')
    }

    const seen: string[] = []

    const Outer = () => {
      const ctx = useContext()
      seen.push(`outer-setup:${ctx.name}`)

      return (
        <div>
          <Boom />
        </div>
      )
    }
    defineComponentName(Outer, 'Outer')

    expect(() => mountTestApp(Outer)).toThrow('boom')

    // After the throw, no context should leak (a subsequent mount should start
    // from a clean stack).
    expect(seen).eql(['outer-setup:Outer'])

    const After = () => <div>after</div>
    // mountTestApp would throw if a stale context were left on the stack.
    const root = mountTestApp(After)
    expect(root.textContent).toBe('after')
  })
})
