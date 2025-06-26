import { dc, type FunctionalComponent } from '../defineComponent'
import { onMounted } from '../hook'
import { h } from '../jsx'
import { mountApp as _mountApp } from '../op'
import { nextTick, ref } from '../reactivity'
import { VMap } from './map'

function mountApp(App: FunctionalComponent) {
  const doc = document.createElement('div')
  doc.id = 'app'

  _mountApp(h(App), doc)

  return doc
}

describe('map component', () => {
  it('non-reactivity data', async () => {
    const App = dc(() => {
      const list = [1, 2, 3]
      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => <div class="item">{item}</div>}
          />
        </div>
      )
    })

    const el = mountApp(App) as HTMLElement

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['1', '2', '3'])
  })

  it('complex data array', async () => {
    const App = dc(() => {
      const list = [{ a: 1 }, { a: 2 }, { a: 3 }]

      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => <div class="item">{item}</div>}
          />
        </div>
      )
    })

    const el = mountApp(App) as HTMLElement

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql([
      '[object Object]',
      '[object Object]',
      '[object Object]',
    ])
  })

  it('reactivity data', async () => {
    const App = dc(() => {
      const list = ref([1, 2, 3])

      onMounted(() => {
        list.value = [4, 5, 6]
      })

      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => <div class="item">{item}</div>}
          />
        </div>
      )
    })

    const el = mountApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['4', '5', '6'])
  })

  it('add item to list', async () => {
    const App = dc(() => {
      const list = ref([1, 2, 3])

      onMounted(() => {
        list.value = [1, 4, 2, 3]
      })

      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => <div class="item">{item}</div>}
          />
        </div>
      )
    })

    const el = mountApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['1', '4', '2', '3'])
  })

  it('add item from start', async () => {
    const App = dc(() => {
      const list = ref([1, 2, 3])

      onMounted(() => {
        list.value.unshift(4)
      })

      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => <div class="item">{item}</div>}
          />
        </div>
      )
    })

    const el = mountApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['4', '1', '2', '3'])
  })

  it('add item from end', async () => {
    const App = dc(() => {
      const list = ref([1, 2, 3])

      onMounted(() => {
        list.value.push(4)
      })

      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => <div class="item">{item}</div>}
          />
        </div>
      )
    })

    const el = mountApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['1', '2', '3', '4'])
  })

  it('delete item to list', async () => {
    const App = dc(() => {
      const list = ref([1, 2, 3])

      onMounted(() => {
        list.value = [1, 3]
      })

      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => <div class="item">{item}</div>}
          />
        </div>
      )
    })

    const el = mountApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['1', '3'])
  })

  it('delete item from start', async () => {
    const App = dc(() => {
      const list = ref([1, 2, 3])

      onMounted(() => {
        list.value.shift()
      })

      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => <div class="item">{item}</div>}
          />
        </div>
      )
    })

    const el = mountApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['2', '3'])
  })

  it('delete item from end', async () => {
    const App = dc(() => {
      const list = ref([1, 2, 3])

      onMounted(() => {
        list.value.pop()
      })

      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => <div class="item">{item}</div>}
          />
        </div>
      )
    })

    const el = mountApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['1', '2'])
  })
})
