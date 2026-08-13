# RSX（Reactive JSX）

> This is an experiment library.

A library try to convert `jsx` to dom, and combine with `alien-signals`'s signal system.

# Counter Demo

```jsx
import { signal, mountApp } from './core'

const Counter = () => {
  const count = signal(0)

  return (
    <button onClick={() => count(count() - 1)} data-count={count}>
      count: {count}
    </button>
  )
}

const app = <Counter />

console.log(app instanceof HTMLElement) // true

mountApp(app, '#app')
```
