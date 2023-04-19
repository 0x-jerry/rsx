export function defineContext<T>() {
  const stack: T[] = []

  const actions = {
    push(ctx: T) {
      stack.push(ctx)
    },
    pop() {
      return stack.pop()
    },
    current() {
      return stack.at(-1)
    },
    runWith(fn: () => void, ctx: T) {
      actions.push(ctx)
      fn()
      actions.pop()
    },
  }

  return actions
}
