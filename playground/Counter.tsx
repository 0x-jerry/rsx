import { ref } from '../src'

export const Counter = () => {
  const count = ref(0)

  return (
    <div class="flex gap-1">
      <button onClick={() => count.value--}>-</button>
      <div>{count}</div>
      <button onClick={() => count.value++}>+</button>
    </div>
  )
}
