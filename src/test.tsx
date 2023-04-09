import { computed, ref } from '@vue/reactivity'
import { h, Fragment, vCase, vFor } from './jsx'

const Counter = () => {
  const count = ref(0)

  const show = ref(false)

  const click = () => {
    count.value++
    console.log('click', count.value)
  }

  const testVCase = vCase(show, {
    true: () => <div>this is true</div>,
    false: () => <div>this is false</div>
  })

  const toggleShow = () => {
    show.value = !show.value
  }

  const list = ref(
    new Array(10).fill(0).map((_, idx) => ({ key: idx.toString() }))
  )

  let seq = true
  const makeRandomData = () => {
    seq = !seq
    list.value = list.value.sort((a, b) =>
      seq ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key)
    )
  }

  const testVFor = vFor(list, 'key', (item) => {
    return <span>{item.key}</span>
  })

  return (
    <>
      <button onClick={click}>{count}</button>
      <div>
        double:
        {computed(() => count.value * 2)}
      </div>
      <hr />

      <h1>Test condition</h1>
      <button onClick={toggleShow}>toggle</button>
      {show}

      {testVCase}

      <h1>Test loop</h1>
      <button onClick={makeRandomData}>random</button>
      {testVFor}
    </>
  )
}

const root = <Counter></Counter>

mount(root as any)

function mount(dom: HTMLElement) {
  document.getElementById('app')?.append(dom)
}
