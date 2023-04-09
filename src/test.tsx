import { computed, ref } from '@vue/reactivity'
import { h, Fragment } from './jsx'

const Counter = () => {
  const count = ref(0)

  const click = () => {
    count.value++
    console.log('click', count.value)
  }

  return (
    <>
      <button onClick={click}>{count}</button>
      <div>
        double:
        {computed(() => count.value * 2)}
      </div>
    </>
  )
}

const root = <Counter></Counter>

mount(root as any)

function mount(dom: HTMLElement) {
  document.getElementById('app')?.append(dom)
}
