import { mountTestApp } from './helper'
import { ref } from './reactivity'

describe('node', () => {
  it('ref prop on native node', () => {
    const value = ref()

    const App = () => {
      return (
        <div>
          <span ref={value}>1</span>
        </div>
      )
    }

    mountTestApp(App)

    expect(value.value).instanceof(HTMLSpanElement)
  })
})
