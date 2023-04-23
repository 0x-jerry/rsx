import { ToRefs, computed, reactive, toRef, toRefs } from '@vue/reactivity'
import { dc } from './core/defineComponent'
import { VMap, h, Fragment } from './core'

interface TodoOption {
  id: string
  completed?: boolean
  content: string
}

const TodoItem = dc<ToRefs<TodoOption>>((props) => {
  const { completed, content } = props

  return (
    <label class="flex">
      <input type="checkbox" value={completed} />
      {content}
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

    return state.type === 'all'
      ? state.items
      : state.items.filter((item) => isCompleted === item.completed)
  })

  return (
    <div class="flex flex-col">
      <select $={toRef(state, 'type')}>
        <VMap
          list={['all', 'completed', 'uncompleted']}
          key={(n) => n}
          render={({ item }) => <option value={item}>{item}</option>}
        />
      </select>

      <div class="flex">
        <input type="text" $={toRef(state, 'content')} />
        <button onClick={addTodo}>add</button>
      </div>
      <hr />
      <VMap
        list={filteredItems}
        key={(n) => n.id}
        render={({ item }) => (
          <>
            <TodoItem {...toRefs(item)}></TodoItem>
          </>
        )}
      />
    </div>
  )

  function addTodo() {
    const item = {
      id: Math.random().toString(),
      content: state.content,
      complete: false,
    }

    state.items.push(item)
    console.log('add item', item)
    state.content = ''
  }
})
