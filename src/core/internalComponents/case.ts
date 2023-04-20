import { JsonPrimitive, Optional, makePair } from '@0x-jerry/utils'
import { DComponent, createTextElement } from '../node'
import { MaybeRef } from '../types'
import { mount, unmount, useContext } from '../hook'
import { queueJob } from '../scheduler'
import { runWithContext } from '../context'
import { createComponentInstance } from '..'

export function VCase(props: {
  condition: JsonPrimitive
  cases?: Record<string, Optional<() => DComponent>>
}) {
  const ctx = useContext()

  const anchor = createTextElement('')
  anchor._ = ctx

  const pair = makePair(props.cases || {})

  let renderedEl: Optional<DComponent> = null

  queueJob(() => {
    const oldChild = renderedEl

    if (oldChild) unmount(oldChild)

    const newChild = mountCondition()

    renderedEl = newChild
  })

  return anchor

  function mountCondition() {
    const newChild = runWithContext(() => pair(String(props.condition)), ctx)

    if (newChild) {
      const parentEl = anchor.parentElement!

      parentEl.insertBefore(newChild, anchor)

      mount(newChild)
    }

    return newChild
  }
}

export function vCase(
  condition: MaybeRef<JsonPrimitive>,
  /**
   * should return jsx
   */
  cases: Record<string, Optional<() => DComponent>>,
) {
  createComponentInstance(VCase, { condition, cases })
}

export const vIf = (
  condition: MaybeRef<JsonPrimitive>,
  truthy?: () => any,
  falsy?: () => any,
) => vCase(condition, { true: truthy, false: falsy })
