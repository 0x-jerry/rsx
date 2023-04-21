import { unref } from '@vue/reactivity'
import { sleep } from '@0x-jerry/utils'
import { createTextElement, moveChildren } from '../node'
import { useWatch } from '../hook'

export function Teleport(
  props: {
    to: string
  },
  children?: any[],
) {
  const el = createTextElement('')

  useWatch(() => unref(props.to), update)

  return el as unknown as JSX.Element

  async function update() {
    await sleep()
    const selector = unref(props.to)
    const root = document.querySelector(selector)

    if (!root) {
      return
    }

    moveChildren(root, children)
  }
}
