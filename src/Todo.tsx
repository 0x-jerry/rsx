import { reactive, toRef, toRefs } from '@vue/reactivity'
import { dc } from './core/defineComponent'
import { VMap, h } from './core'

interface TodoOption {
  id: string
  complete?: boolean
  content: string
}

export const TodoItem = dc<TodoOption>((props) => {
  const { complete, content } = toRefs(props)

  return (
    <label class="flex">
      <input type="checkbox" value={complete} />
      {content}
    </label>
  )
})

export const TodoApp = dc(() => {
  const state = toRefs(
    reactive({
      items: [] as TodoOption[],
      type: 'all',
      content: '',
    }),
  )

  return (
    <div class="flex flex-col">
      <select $={state.type}>
        <VMap
          list={['all', 'completed', 'uncompleted']}
          key={(n) => n}
          render={({ item }) => <option value={item}>{item}</option>}
        />
      </select>

      <div class="flex">
        <input type="text" $={state.content} />
        <button onClick={addTodo}>add</button>
      </div>
      <hr />
      <VMap
        list={state.items}
        key={(n) => n.id}
        render={({ item }) => (
          <div class="item">
            {/* @ts-ignore todo, fix typedef */}
            <input type="checkbox" $={toRef(item, 'complete')} />
            {toRef(item, 'content')}
          </div>
        )}
      />
    </div>
  )

  function addTodo() {
    state.items.value.push({
      id: Math.random().toString(),
      content: state.content.value,
      complete: false,
    })
  }
})
