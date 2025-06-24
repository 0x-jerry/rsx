import { computed, reactive } from '@vue/reactivity'
import { $, VMap } from './core'
import { dc } from './core/defineComponent'

interface TodoOption {
  id: string
  completed: boolean
  content: string
}

const TodoItem = dc<{ item: TodoOption; $completed: boolean }>((props) => {
  const { item } = props

  return (
    <label class="flex">
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

  return (
    <div class="flex flex-col w-200px">
      <div>
        <button onClick={sort}> sort </button>
      </div>
      <select $={$(state, 'type')}>
        <VMap
          list={['all', 'completed', 'uncompleted']}
          render={({ item }) => <option value={item}>{item}</option>}
        />
      </select>

      <div class="flex">
        <input type="text" $={$(state, 'content')} />
        <button onClick={addTodo}>add</button>
      </div>
      <hr />
      <VMap
        list={filteredItems}
        render={({ item }) => (
          <TodoItem item={item} $completed={$(item, 'completed')}></TodoItem>
        )}
      />
    </div>
  )

  function addTodo() {
    const item: TodoOption = {
      id: Math.random().toString(),
      content: state.content,
      completed: false,
    }

    state.items.push(item)
    console.log('add item', item)
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
