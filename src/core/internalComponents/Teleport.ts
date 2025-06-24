import { unref } from '@vue/reactivity'
import { onMounted, useWatch } from '../hook'
import { createTextElement } from '../node'
import { moveChildren } from '../nodeOp'

export function Teleport(
  props: {
    to: string
  },
  children?: any[],
) {
  const el = createTextElement('')

  useWatch(() => unref(props.to), update)

  onMounted(update)

  return el as unknown as JSX.Element

  function update() {
    const selector = unref(props.to)
    const root = document.querySelector(selector)

    if (!root) {
      return
    }

    moveChildren(root, children)
  }
}
