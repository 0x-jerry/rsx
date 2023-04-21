import { computed, ref, toRaw, toRef } from '@vue/reactivity'
import { h, Fragment, vCase, vMap, Teleport } from './core'

const TestFor = () => {
  let id = 0

  const list = ref(new Array(10).fill(0).map(() => ({ id, key: String(id++) })))

  let asc = true

  const testVMap = vMap(list, 'key', (item) => {
    return <span>{toRef(item, 'id')},</span>
  })

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

  function makeRandomData() {
    asc = !asc
    list.value = list.value.sort((a, b) => (asc ? a.id - b.id : b.id - a.id))
  }

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

const TestPort = () => {
  return (
    <Teleport to="#port">
      <div>try teleport, this should inside the #port element</div>
      <TestIf></TestIf>
    </Teleport>
  )
}

export const App = () => {
  const count = ref(0)

  const click = () => {
    count.value++
  }

  const double = computed(() => count.value * 2)

  return (
    <>
      <button onClick={click}>{count}</button>
      <div>double:{double}</div>

      <hr />
      <TestIf></TestIf>
      <TestFor></TestFor>

      <TestBinding></TestBinding>

      <div id="port" class="border border-blue border-solid"></div>
      <TestPort></TestPort>
    </>
  )
}
