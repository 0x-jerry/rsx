# RSX（Reactive JSX）

> This is an experiment library.

A library try to convert `jsx` to dom, and combine with `@vue/reactivity`'s reactive system.

# Counter Demo

```jsx
import { ref, mountApp } from './core'

const Counter = () => {
  const count = ref(0)

  const el = (
    <button onClick={() => count.value++} data-count={count}>
      count: {count}
    </button>
  )

  return el
}

const app = <Counter />

console.log(app instanceof HTMLElement) // true

mountApp(app, '#app')
```
