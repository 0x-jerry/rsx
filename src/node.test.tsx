import { signal } from './reactivity'
import { mountTestApp } from './test'

describe('node', () => {
  it('ref prop on native node', () => {
    const value = signal()

    const App = () => {
      return (
        <div>
          <span ref={value}>1</span>
        </div>
      )
    }

    mountTestApp(App)

    expect(value()).instanceof(HTMLSpanElement)
  })
})
