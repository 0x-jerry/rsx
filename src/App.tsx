import { ref } from '@vue/reactivity'

export const App = () => {
  const count = ref(1)

  const plusOne = () => count.value++

  return (
    <>
      <p>count: {count.value}</p>
      <button _a={count.value} onClick={plusOne} data-x="123">
        count: {count}
      </button>
    </>
  )
}
