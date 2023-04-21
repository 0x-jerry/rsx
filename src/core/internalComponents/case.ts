import { JsonPrimitive, Optional, makePair } from '@0x-jerry/utils'
import { DComponent, createFragment, createTextElement } from '../node'
import { MaybeRef } from '../types'
import { mount, unmount, useContext } from '../hook'
import { queueJob } from '../scheduler'
import { runWithContext } from '../context'
import { h } from '../jsx'
import { unref } from '@vue/reactivity'

export function VCase(props: {
  condition: JsonPrimitive
  cases?: Record<string, Optional<() => DComponent>>
}) {
  const ctx = useContext()

  const el = createFragment()
  el._ = ctx

  const pair = makePair(props.cases || {})

  let renderedEl: Optional<DComponent> = null

  queueJob(() => {
    const oldChild = renderedEl

    if (oldChild) unmount(oldChild)

    const newChild = mountCondition()

    renderedEl = newChild
  })

  return el

  function mountCondition() {
    const newChild = runWithContext(() => pair(String(unref(props.condition))), ctx)

    if (newChild) {
      el.appendChild(newChild)

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
  return h(VCase, { condition, cases })
}

export const vIf = (
  condition: MaybeRef<JsonPrimitive>,
  truthy?: () => DComponent,
  falsy?: () => DComponent,
) => vCase(condition, { true: truthy, false: falsy })
