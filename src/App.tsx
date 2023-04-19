import { computed, ref, toRaw, toRef } from '@vue/reactivity'
import { h, Fragment, useContext, vCase, vMap, mountApp } from './core'

const TestFor = () => {
  let id = 0

  const list = ref(new Array(10).fill(0).map(() => ({ id, key: String(id++) })))

  let seq = true

  const makeRandomData = () => {
    seq = !seq
    list.value = list.value.sort((a, b) => (seq ? a.id - b.id : b.id - a.id))
  }

  const testVMap = vMap(list, 'key', (item) => {
    return (
      <>
        <span>{toRef(item, 'id')}</span>,
      </>
    )
  })

  function add() {
    list.value.push({
      id,
      key: String(id++),
    })
  }

  function remove() {
    const _idx = ~~(Math.random() * list.value.length)

    const [removed] = list.value.splice(_idx, 1)

    console.log('removed', toRaw(removed))
  }

  function changeItem() {
    const _idx = ~~(Math.random() * list.value.length)

    const item = list.value.at(_idx)

    if (item) {
      console.log(item.key, item.id, '=>', item.id + 100)
      item.id += 100
    }
  }

  return (
    <>
      <h1>Test loop</h1>
      <button onClick={makeRandomData}>random</button>
      <button onClick={add}>add</button>
      <button onClick={remove}>remove</button>
      <button onClick={changeItem}>change</button>
      {testVMap}
    </>
  )
}

const TestIf = () => {
  const show = ref(false)
  const testVCase = vCase(show, {
    true: () => <div>this is true</div>,
    false: () => <div>this is false</div>,
  })

  const toggleShow = () => {
    show.value = !show.value
  }

  return (
    <>
      <h1>Test condition</h1>
      <button onClick={toggleShow}>toggle</button>
      {show}

      {testVCase}
    </>
  )
}

const TestBinding = () => {
  const inputValue = ref('123')

  return (
    <>
      <h1>Value binding</h1>
      <input $={inputValue}></input>
      <span>input value is: {inputValue}</span>
    </>
  )
}

const App = () => {
  const ctx = useContext()
  console.log('App', ctx)

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

      <hr />
      <TestIf></TestIf>
      <TestFor></TestFor>

      <TestBinding></TestBinding>
    </>
  )
}

const root = h(App)

mountApp(root, '#app')
