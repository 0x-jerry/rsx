import { mountTestApp } from '../helper'
import { useExpose } from '../hook'
import { nextTick, ref } from '../reactivity'

describe('ComponentNode', () => {
  it('ref prop on a Component instance', async () => {
    const value = ref()

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

    expect(value.value).eql({ a: 1 })
  })
})
