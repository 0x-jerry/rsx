import { $, computed, dc, signal, VMap } from '../src'

interface TodoOption {
  id: string
  completed: boolean
  content: string
}

const TodoItem = dc<{ item: TodoOption; $completed: boolean }>((props) => {
  return (
    <label class={$(() => ['flex', props.item.completed ? 'bg-red' : ''])}>
      <input type="checkbox" $={$(() => props.item, 'completed')} />
      {$(() => props.item.content)}
    </label>
  )
})

type TodoFilter = 'all' | 'completed' | 'uncompleted'

export const TodoApp = dc(() => {
  const items = signal<TodoOption[]>([])
  const filter = signal<TodoFilter>('all')
  const content = signal('')

  const filteredItems = computed(() => {
    const isCompleted = filter() === 'completed'

    const list =
      filter() === 'all' ? items() : items().filter((item) => isCompleted === !!item.completed)

    return list
  })

  const Filter = (
    <div class="flex">
      <VMap
        list={['all', 'completed', 'uncompleted'] as TodoFilter[]}
        render={({ item }) => (
          <button
            onClick={() => {
              filter(item)
            }}
            class={$(() => (filter() === item ? 'bg-green' : ''))}
          >
            {item}
          </button>
        )}
      />
    </div>
  )

  const Toolbar = (
    <div>
      <button onClick={sort}> sort </button>
      {$(() => items().length)}
    </div>
  )

  const AddBar = (
    <div class="flex">
      <input type="text" $={$(content)} />
      <button onClick={addBatchTodo}>add</button>
    </div>
  )

  const TodoList = (
    <>
      <hr />
      <VMap
        list={filteredItems}
        render={(props) => (
          <TodoItem
            item={$(() => props.item)}
            $completed={$(() => props.item, 'completed')}
          />
        )}
      />
    </>
  )

  return (
    <div class="flex flex-col w-200px">
      {Toolbar}
      {Filter}

      {AddBar}
      {TodoList}
    </div>
  )

  function addBatchTodo() {
    if (!content()) return

    const newItems: TodoOption[] = []

    for (let index = 0; index < 10; index++) {
      newItems.push({
        id: Math.random().toString(),
        content: `${content()}-${index}`,
        completed: false,
      })
    }

    items([...items(), ...newItems])
    content('')
  }

  function sort() {
    items([...items()].sort((a, b) => a.content.localeCompare(b.content)))
    console.log(
      'sort',
      items().map((n) => n.content),
    )
  }
})
