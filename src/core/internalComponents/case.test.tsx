import { dc } from '../defineComponent'
import { onMounted } from '../hook'
import { nextTick, ref } from '../reactivity'
import { mountTestApp } from '../test'
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
