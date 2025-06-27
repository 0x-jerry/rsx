import { $, computed, dc, reactive, VMap } from '@/index'

interface TodoOption {
  id: string
  completed: boolean
  content: string
}

const TodoItem = dc<{ item: TodoOption; class: string; $completed: boolean }>(
  (props) => {
    const { item } = props

    return (
      <label class={$(() => ['flex', props.class])}>
        <input
          type="checkbox"
          checked={$(item, 'completed')}
          onChange={(e) =>
            props.onUpdateCompleted?.((e.target as HTMLInputElement).checked)
          }
        />
        {$(item, 'content')}
      </label>
    )
  },
)

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

  return (
    <div class="flex flex-col w-200px">
      <div>
        <button onClick={sort}> sort </button>
        {$(() => state.items.length)}
      </div>
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

      <div class="flex">
        <input type="text" $={$(state, 'content')} />
        <button onClick={addBatchTodo}>add</button>
      </div>
      <hr />
      <VMap
        list={filteredItems}
        render={({ item }) => (
          <TodoItem
            item={item}
            $completed={$(item, 'completed')}
            class={$(() => (item.completed ? 'bg-red' : ''))}
          ></TodoItem>
        )}
      />
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
