import { type Fn, type Optional } from '@0x-jerry/utils'
import { isRef, toValue } from './reactivity'

export const def = Object.defineProperty

export function composeEventListeners<T extends Fn>(...listeners: Optional<T>[]) {
  return (...args: Parameters<T>) => {
    listeners.forEach((event) => {
      if (isRef(event)) {
        // A ref holding a handler: unwrap it and invoke the value. Do NOT
        // call the signal itself with the event args, which would write the
        // event payload into the signal instead of dispatching it.
        toValue(event)?.(...args)
      } else {
        event?.(...args)
      }
    })
  }
}
