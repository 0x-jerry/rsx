import { signal } from '../src'

export const Counter = () => {
  const count = signal(0)

  return (
    <div class="flex gap-1">
      <button onClick={() => count(count() - 1)}>-</button>
      <div>{count()}</div>
      <button onClick={() => count(count() + 1)}>+</button>
    </div>
  )
}
