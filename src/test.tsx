import { ref } from '@vue/reactivity'
import { h, Fragment } from './jsx'

const Counter = () => {
  const count = ref(0)

  const click = () => {
    count.value++
  }

  return (
    <>
      <button onClick={click}>{{ count }}</button>
    </>
  )
}

const root = <Counter></Counter>

mount(root as any)

function mount(dom: HTMLElement) {
  document.getElementById('app')?.append(dom)
}
