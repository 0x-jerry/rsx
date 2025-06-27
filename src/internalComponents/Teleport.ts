import { defineComponent } from '../defineComponent'
import { onBeforeMount, useWatch } from '../hook'
import { createTextElement } from '../node'
import { moveChildren } from '../nodeOp'
import { unref } from '../reactivity'

export interface TeleportProps {
  to: string
}

export const Teleport = defineComponent<TeleportProps>((props, children) => {
  const el = createTextElement('')

  useWatch(() => unref(props.to), update)

  onBeforeMount(update)

  return el

  function update() {
    const selector = unref(props.to)
    const root = document.querySelector(selector)

    if (!root) {
      return
    }

    // todo, fix this
    moveChildren(root, children)
  }
})
