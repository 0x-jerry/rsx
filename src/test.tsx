import { computed, ref } from '@vue/reactivity'
import { h, Fragment, vIf } from './jsx'

const Counter = () => {
  const count = ref(0)

  const show = ref(false)

  const click = () => {
    count.value++
    console.log('click', count.value)
  }

  const testVIf = vIf(
    show,
    () => <div>this is true</div>,
    () => <div>this is false</div>
  )

  const toggleShow = () => {
    show.value = !show.value
  }

  return (
    <>
      <button onClick={click}>{count}</button>
      <div>
        double:
        {computed(() => count.value * 2)}
      </div>
      <hr />

      <h1>test condition</h1>
      <button onClick={toggleShow}>toggle</button>
      {show}
      {testVIf}
    </>
  )
}

const root = <Counter></Counter>

mount(root as any)

function mount(dom: HTMLElement) {
  document.getElementById('app')?.append(dom)
}
