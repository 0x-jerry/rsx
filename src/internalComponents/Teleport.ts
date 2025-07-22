import { runWithContext } from '@/context'
import { moveTo } from '@/nodeOp'
import { normalizeNodes } from '@/nodes/shared'
import { defineComponentName } from '@/test'
import { defineComponent } from '../defineComponent'
import { onBeforeMount, useContext, useWatch } from '../hook'

export interface TeleportProps {
  to?: string
}

export const Teleport = defineComponent<TeleportProps>((props, children) => {
  const ctx = useContext()

  if (ctx._node) {
    ctx._node.children = normalizeNodes(children || [])
  }

  let initialized = false

  const _update = () => runWithContext(update, ctx)

  useWatch(() => props.to, _update)
  onBeforeMount(_update)

  const nonExistsContainer = document.createDocumentFragment()

  function update() {
    const container = props.to
      ? document.querySelector(props.to) || nonExistsContainer
      : nonExistsContainer

    if (!initialized) {
      for (const child of ctx._node?.children || []) {
        child.initialize()
        if (child.el) {
          moveTo(container, child.el)
        }
      }
      initialized = true
    } else {
      for (const child of ctx._node?.children || []) {
        if (child.el) {
          moveTo(container, child.el)
        }
      }
    }
  }

  return null
})

defineComponentName(Teleport, 'Teleport')
