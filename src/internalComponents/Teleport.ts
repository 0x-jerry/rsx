import { runWithContext } from '@/context'
import { defineComponentName } from '@/test'
import { defineComponent } from '../defineComponent'
import { onBeforeMount, useContext, useWatch } from '../hook'
import { moveChildren } from '../nodeOp'

export interface TeleportProps {
  to?: string
}

export const Teleport = defineComponent<TeleportProps>((props, children) => {
  const ctx = useContext()

  const _update = () => runWithContext(update, ctx)

  useWatch(() => props.to, _update)
  onBeforeMount(_update)

  const nonExistsContainer = document.createDocumentFragment()

  function update() {
    const root = props.to
      ? document.querySelector(props.to) || nonExistsContainer
      : nonExistsContainer

    moveChildren(root, children)
  }
})

defineComponentName(Teleport, 'Teleport')
