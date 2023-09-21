import { ref } from '@vue/reactivity'

export const App = () => {
  const count = ref(1)

  return (
    <>
      <button onClick={() => count.value++}>{count}</button>
    </>
  )
}
