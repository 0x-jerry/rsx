import { dc } from '../defineComponent'
import { onMounted } from '../hook'
import { $, nextTick, ref, toBindingRefs } from '../reactivity'
import { contextToJson, defineComponentName, mountTestApp } from '../test'
import { VMap } from './map'

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

    const el = mountTestApp(App) as HTMLElement

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

    const el = mountTestApp(App) as HTMLElement

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
            render={(props) => <div class="item">{props.item}</div>}
          />
        </div>
      )
    })

    const el = mountTestApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['4', '5', '6'])
  })

  it('reactivity data with index', async () => {
    const App = dc(() => {
      const list = ref([1, 2, 3])

      onMounted(() => {
        list.value = [2, 1, 3]
      })

      return (
        <div>
          <VMap
            list={list}
            render={(props) => {
              const { item, index } = toBindingRefs(props)

              return (
                <div class="item">
                  {item}-{index}
                </div>
              )
            }}
          />
        </div>
      )
    })

    const el = mountTestApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['2-0', '1-1', '3-2'])
  })

  it('custom keyed reactivity data', async () => {
    interface Item {
      name: string
      key: number
    }

    const App = dc(() => {
      const list = ref<Item[]>([
        {
          name: '1',
          key: 1,
        },
        {
          name: '2',
          key: 2,
        },
        {
          name: '3',
          key: 3,
        },
      ])

      onMounted(() => {
        list.value = [
          {
            name: '2',
            key: 1,
          },
          {
            name: '1',
            key: 2,
          },
          {
            name: '4',
            key: 3,
          },
        ]
      })

      return (
        <div>
          <VMap
            list={list}
            key={(item) => item.key}
            render={(props) => {
              return <div class="item">{$(() => props.item.name)}</div>
            }}
          />
        </div>
      )
    })

    const el = mountTestApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['2', '1', '4'])
  })

  it('reuse node', async () => {
    const App = dc(() => {
      const list = ref([1, 2, 3, 4])

      onMounted(() => {
        list.value = [4, 2, 3, 1]
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

    const el = mountTestApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['4', '2', '3', '1'])
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

    const el = mountTestApp(App) as HTMLElement

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

    const el = mountTestApp(App) as HTMLElement

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

    const el = mountTestApp(App) as HTMLElement

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

    const el = mountTestApp(App) as HTMLElement

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

    const el = mountTestApp(App) as HTMLElement

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

    const el = mountTestApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['1', '2'])
  })
})

describe('map component with fragment', () => {
  it('non-reactivity data', async () => {
    const App = dc(() => {
      const list = [1, 2, 3]
      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => (
              <>
                <div class="item">{item}</div>
                <div class="item">{item}</div>
              </>
            )}
          />
        </div>
      )
    })

    const el = mountTestApp(App)

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['1', '1', '2', '2', '3', '3'])
  })

  it('complex data array', async () => {
    const App = dc(() => {
      const list = [{ a: 1 }, { a: 2 }, { a: 3 }]

      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => (
              <>
                <div class="item">{item}</div>
                <div class="item">{item}</div>
              </>
            )}
          />
        </div>
      )
    })

    const el = mountTestApp(App) as HTMLElement

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql([
      '[object Object]',
      '[object Object]',
      '[object Object]',
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
            render={({ item }) => (
              <>
                <div class="item">{item}</div>
                <div class="item">{item}</div>
              </>
            )}
          />
        </div>
      )
    })

    const el = mountTestApp(App) as HTMLElement

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql(['4', '4', '5', '5', '6', '6'])
  })

  it('reuse node', async () => {
    const App = dc(() => {
      const list = ref([1, 2, 3, 4])

      onMounted(() => {
        list.value = [4, 2, 3, 1]
      })

      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => (
              <>
                <div class="item">{item}-0</div>
                <div class="item">{item}-1</div>
              </>
            )}
          />
        </div>
      )
    })

    const el = mountTestApp(App)

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql([
      '4-0',
      '4-1',
      '2-0',
      '2-1',
      '3-0',
      '3-1',
      '1-0',
      '1-1',
    ])
  })

  it('reuse node 1', async () => {
    const App = dc(() => {
      const list = ref([1, 2, 3, 4])

      onMounted(() => {
        list.value = [4, 2, 3, 1]
      })

      return (
        <div>
          <VMap
            list={list}
            render={({ item }) => (
              <>
                <div class="item">{item}-0</div>
                {/** biome-ignore lint/complexity/noUselessFragments: test purpose */}
                <>
                  <div class="item">{item}-1</div>
                </>
              </>
            )}
          />
        </div>
      )
    })

    const el = mountTestApp(App)

    await nextTick()

    const contents = el
      .querySelectorAll('.item')
      .values()
      .map((item) => item.textContent)
      .toArray()

    expect(contents).eql([
      '4-0',
      '4-1',
      '2-0',
      '2-1',
      '3-0',
      '3-1',
      '1-0',
      '1-1',
    ])
  })
})

describe('map context tree', () => {
  it('static value', () => {
    const A = dc((_, children) => (
      <div class="A">
        <span>a</span>
        {children}
      </div>
    ))

    defineComponentName(A, 'A')

    const B = dc((_, children) => (
      <div class="B">
        <span>b</span>
        {children}
      </div>
    ))

    defineComponentName(B, 'B')

    const App = dc(() => (
      <A>
        <VMap list={[1, 2, 3]} render={(props) => <B>{props.item}</B>} />
      </A>
    ))

    defineComponentName(App, 'App')

    const root = mountTestApp(App)

    expect(root.outerHTML).toMatchSnapshot()

    const ctxTree = contextToJson(root._)

    expect(ctxTree).toMatchSnapshot()
  })

  it('reactive value', async () => {
    const A = dc((_, children) => (
      <div class="A">
        <span>a</span>
        {children}
      </div>
    ))

    defineComponentName(A, 'A')

    const B = dc((_, children) => (
      <div class="B">
        <span>b</span>
        {children}
      </div>
    ))

    defineComponentName(B, 'B')

    const App = dc(() => {
      const data = ref([1, 2, 3])

      onMounted(() => {
        data.value = [2, 1, 4, 3]
      })

      return (
        <A>
          <VMap list={data} render={(props) => <B>{props.item}</B>} />
        </A>
      )
    })

    defineComponentName(App, 'App')

    const root = mountTestApp(App)

    expect(root.outerHTML).toMatchSnapshot()

    const ctxTree = contextToJson(root._)

    expect(ctxTree).toMatchSnapshot()

    await nextTick()

    expect(root.outerHTML).toMatchSnapshot()

    const ctxTree1 = contextToJson(root._)

    expect(ctxTree1).toMatchSnapshot()
  })
})
