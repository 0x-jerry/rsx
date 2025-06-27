import type { FunctionalComponent } from '../defineComponent'
import { onBeforeMount, onBeforeUnmount, useContext } from '../hook'
import { normalizeNode } from '../node'
import { insertBefore } from '../nodeOp'

export const Fragment: FunctionalComponent = (_, children) => {
  const el = createFragment()
  const ctx = useContext()
  ctx.__fg = true

  const _children: ChildNode[] = []

  onBeforeMount(() => {
    children?.forEach((child) => {
      const node = normalizeNode(child)
      if (node) {
        _children.push(node)

        insertBefore(el, child)
      }
    })
  })

  onBeforeUnmount(() => {
    _children.forEach((child) => child.remove())
  })

  return el
}

export function createFragment(name = 'fragment') {
  const el = document.createComment(name)

  return el
}
