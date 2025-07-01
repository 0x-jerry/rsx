import { $, computed, dc, reactive, VMap } from '@/index'

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

export const TodoApp = dc(() => {
  const state = reactive({
    items: [] as TodoOption[],
    type: 'all',
    content: '',
  })

  const filteredItems = computed(() => {
    const isCompleted = state.type === 'completed'

    const items =
      state.type === 'all'
        ? state.items
        : state.items.filter((item) => isCompleted === !!item.completed)

    return items
  })

  const Filter = (
    <div className="flex">
      <VMap
        list={['all', 'completed', 'uncompleted']}
        render={({ item }) => (
          <button
            onClick={() => {
              state.type = item
            }}
            class={$(() => (state.type === item ? 'bg-green' : ''))}
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
      {$(() => state.items.length)}
    </div>
  )

  const AddBar = (
    <div class="flex">
      <input type="text" $={$(state, 'content')} />
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
    if (!state.content) return

    for (let index = 0; index < 10; index++) {
      const item: TodoOption = {
        id: Math.random().toString(),
        content: `${state.content}-${index}`,
        completed: false,
      }

      state.items.push(item)
    }

    state.content = ''
  }

  function sort() {
    state.items.sort((a, b) => a.content.localeCompare(b.content))
    console.log(
      'sort',
      state.items.map((n) => n.content),
    )
  }
})
