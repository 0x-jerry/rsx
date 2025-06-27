import { dc } from '../defineComponent'
import { mountTestApp } from '../test'

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
