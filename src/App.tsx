import { ref } from '@vue/reactivity'

export const App = () => {
  const count = ref(1)

  const plusOne = () => count.value++

  return (
    <>
      <button
        _a={count.value}
        onClick={plusOne}
        data-count={count.value}
        data-x="123"
      >
        count: {count}
      </button>
    </>
  )
}
